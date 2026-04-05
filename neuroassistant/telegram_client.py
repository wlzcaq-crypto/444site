"""
NeuroAssistant Web — Telegram Client Module
Handles Pyrogram session management, channel monitoring, smart commenting,
and auto-dialogue features.
"""

import asyncio
import logging
import random
from collections import OrderedDict
from typing import Optional

from pyrogram import Client, filters
from pyrogram.types import Message
from pyrogram.errors import (
    FloodWait,
    ChatWriteForbidden,
)

from config import (
    API_ID,
    API_HASH,
    SESSION_PATH,
    COMMENT_DELAY_MIN,
    COMMENT_DELAY_MAX,
    MEMORY_CONTEXT_SIZE,
)
from database import Database
from ai_engine import AIEngine

logger = logging.getLogger("neuroassistant.telegram")


class TelegramBot:
    """
    Manages the Pyrogram client for monitoring channels,
    generating AI comments, and handling auto-dialogues.
    """

    def __init__(self, db: Database, ai: AIEngine):
        self.db = db
        self.ai = ai
        self.client: Optional[Client] = None
        self.is_connected = False
        self.commenting_enabled = True
        self.auto_dialogue_enabled = True
        # Track our own user ID so we can detect replies to our comments
        self.my_user_id: Optional[int] = None
        # Store comment message IDs to detect replies: {(chat_id, msg_id): original_post_text}
        # Uses OrderedDict with max size to prevent unbounded memory growth
        self._our_comments: OrderedDict = OrderedDict()
        self._max_tracked_comments = 1000

    async def start(self):
        """Initialize and start the Pyrogram client."""
        try:
            self.client = Client(
                name=SESSION_PATH,
                api_id=API_ID,
                api_hash=API_HASH,
            )
            # Register message handlers before starting
            self._register_handlers()

            await self.client.start()
            me = await self.client.get_me()
            self.my_user_id = me.id
            self.is_connected = True
            logger.info(
                f"Telegram client started. Logged in as: {me.first_name} "
                f"(ID: {me.id})"
            )
        except Exception as e:
            logger.error(f"Failed to start Telegram client: {e}")
            self.is_connected = False
            raise

    async def stop(self):
        """Gracefully stop the Pyrogram client."""
        if self.client and self.is_connected:
            await self.client.stop()
            self.is_connected = False
            logger.info("Telegram client stopped.")

    def _register_handlers(self):
        """Register Pyrogram message handlers for monitoring and auto-dialogue."""

        @self.client.on_message(filters.channel)
        async def on_channel_post(client: Client, message: Message):
            """Handle new posts in monitored channels."""
            await self._handle_channel_post(message)

        @self.client.on_message(
            filters.group & filters.reply & ~filters.me
        )
        async def on_reply_to_comment(client: Client, message: Message):
            """Handle replies to our comments (auto-dialogue)."""
            await self._handle_reply(message)

    async def _handle_channel_post(self, message: Message):
        """
        Process a new post from a monitored channel.
        Generates and sends an AI comment after a random delay.
        """
        # Check if AI commenting is enabled
        if not self.commenting_enabled:
            return

        # Check if this channel is in our monitoring list
        channels = await self.db.get_channels()
        channel_ids = [ch["channel_id"] for ch in channels]

        if message.chat.id not in channel_ids:
            return

        logger.info(
            f"New post in {message.chat.title} (ID: {message.chat.id}): "
            f"{(message.text or message.caption or '')[:60]}..."
        )

        # Update channel's last post timestamp
        await self.db.update_channel_last_post(message.chat.id)

        # Random delay to appear natural (3-8 seconds)
        delay = random.uniform(COMMENT_DELAY_MIN, COMMENT_DELAY_MAX)
        await asyncio.sleep(delay)

        # Extract post text
        post_text = message.text or message.caption or ""
        if not post_text.strip():
            # Skip posts without any text content (unless they have images)
            if not message.photo:
                return

        # Download image if present (Gemini Vision)
        image_data = None
        if message.photo:
            try:
                photo_path = await self.client.download_media(
                    message, in_memory=True
                )
                if photo_path:
                    image_data = bytes(photo_path.getbuffer())
                    logger.info("Downloaded post image for vision analysis.")
            except Exception as e:
                logger.warning(f"Failed to download image: {e}")

        # Get thread context from memory
        thread_context = await self.db.get_thread_context(
            message.chat.id, message.id, MEMORY_CONTEXT_SIZE
        )

        # Generate AI comment
        comment_text = await self.ai.generate_comment(
            post_text=post_text,
            image_data=image_data,
            thread_context=thread_context if thread_context else None,
        )

        if not comment_text:
            logger.warning("AI generated empty comment, skipping.")
            return

        # Send the comment as a reply to the channel post
        try:
            # For channels with comments, we send to the linked discussion group
            sent_message = await message.reply_text(comment_text)

            # Store the comment in the database
            await self.db.add_comment(
                channel_id=message.chat.id,
                message_id=message.id,
                comment_id=sent_message.id,
                comment_text=comment_text,
                post_text=post_text[:500],
                has_image=image_data is not None,
            )

            # Store in thread memory
            await self.db.add_thread_message(
                channel_id=message.chat.id,
                message_id=message.id,
                role="assistant",
                content=comment_text,
            )

            # Track our comment for auto-dialogue (with eviction)
            self._our_comments[(message.chat.id, sent_message.id)] = post_text
            if len(self._our_comments) > self._max_tracked_comments:
                self._our_comments.popitem(last=False)

            logger.info(
                f"Comment sent in {message.chat.title}: {comment_text[:60]}..."
            )

        except ChatWriteForbidden:
            logger.warning(
                f"Cannot comment in {message.chat.title} — comments disabled."
            )
        except FloodWait as e:
            logger.warning(f"FloodWait: sleeping for {e.value} seconds.")
            await asyncio.sleep(e.value)
        except Exception as e:
            logger.error(f"Error sending comment: {e}")

    async def _handle_reply(self, message: Message):
        """
        Handle a reply to one of our comments.
        Generates a contextual auto-reply using AI.
        """
        if not self.auto_dialogue_enabled:
            return

        if not message.reply_to_message:
            return

        # Check if the reply is to one of our messages
        reply_to = message.reply_to_message
        if not reply_to.from_user or reply_to.from_user.id != self.my_user_id:
            return

        logger.info(
            f"Reply detected from {message.from_user.first_name} "
            f"in {message.chat.title}: {(message.text or '')[:60]}"
        )

        # Get the original post text from our tracking dict or thread memory
        original_post = self._our_comments.get(
            (message.chat.id, reply_to.id), ""
        )

        # Get thread context
        thread_context = await self.db.get_thread_context(
            message.chat.id,
            reply_to.id,
            MEMORY_CONTEXT_SIZE,
        )

        # Store the user's reply in thread memory
        await self.db.add_thread_message(
            channel_id=message.chat.id,
            message_id=reply_to.id,
            role="user",
            content=message.text or "",
        )

        # Generate AI reply
        reply_text = await self.ai.generate_reply(
            original_post=original_post,
            user_reply=message.text or "",
            thread_context=thread_context,
        )

        if not reply_text:
            return

        # Send the reply
        try:
            delay = random.uniform(2, 5)
            await asyncio.sleep(delay)

            await message.reply_text(reply_text)

            # Store our reply in thread memory
            await self.db.add_thread_message(
                channel_id=message.chat.id,
                message_id=reply_to.id,
                role="assistant",
                content=reply_text,
            )

            logger.info(f"Auto-reply sent: {reply_text[:60]}...")

        except FloodWait as e:
            logger.warning(f"FloodWait on reply: sleeping {e.value}s.")
            await asyncio.sleep(e.value)
        except Exception as e:
            logger.error(f"Error sending auto-reply: {e}")

    async def join_channel(self, username: str) -> Optional[dict]:
        """
        Join a channel by username. Returns channel info dict or None on failure.
        Used by the Skynet module and manual channel adding.
        """
        if not self.client or not self.is_connected:
            return None

        try:
            chat = await self.client.join_chat(username)
            return {
                "channel_id": chat.id,
                "username": username,
                "title": chat.title or username,
            }
        except FloodWait as e:
            logger.warning(f"FloodWait joining {username}: {e.value}s")
            await asyncio.sleep(e.value)
            return None
        except Exception as e:
            logger.error(f"Failed to join {username}: {e}")
            return None

    async def leave_channel(self, channel_id: int) -> bool:
        """Leave a channel by ID."""
        if not self.client or not self.is_connected:
            return False

        try:
            await self.client.leave_chat(channel_id)
            return True
        except Exception as e:
            logger.error(f"Failed to leave channel {channel_id}: {e}")
            return False

    async def get_channel_info(self, username: str) -> Optional[dict]:
        """Get basic info about a channel without joining."""
        if not self.client or not self.is_connected:
            return None

        try:
            chat = await self.client.get_chat(username)
            return {
                "channel_id": chat.id,
                "username": username,
                "title": chat.title or username,
                "members_count": chat.members_count or 0,
            }
        except Exception as e:
            logger.error(f"Failed to get info for {username}: {e}")
            return None

    async def get_recent_posts(
        self, chat_id: int, limit: int = 5
    ) -> list:
        """Fetch recent posts from a channel for analysis."""
        if not self.client or not self.is_connected:
            return []

        try:
            posts = []
            async for message in self.client.get_chat_history(
                chat_id, limit=limit
            ):
                text = message.text or message.caption or ""
                if text.strip():
                    posts.append(text)
            return posts
        except Exception as e:
            logger.error(f"Failed to get posts from {chat_id}: {e}")
            return []

    async def search_channels(self, query: str, limit: int = 20) -> list:
        """
        Search for public channels matching a query.
        Used by the Skynet discovery module.
        """
        if not self.client or not self.is_connected:
            return []

        try:
            results = []
            # Use Pyrogram's search_global to find channels
            async for message in self.client.search_global(
                query, limit=limit
            ):
                if message.chat and message.chat.type.value in (
                    "channel", "supergroup"
                ):
                    channel_info = {
                        "channel_id": message.chat.id,
                        "username": message.chat.username or "",
                        "title": message.chat.title or "",
                    }
                    # Avoid duplicates
                    if channel_info not in results:
                        results.append(channel_info)
            return results
        except FloodWait as e:
            logger.warning(f"FloodWait during search: {e.value}s")
            await asyncio.sleep(e.value)
            return []
        except Exception as e:
            logger.error(f"Channel search error: {e}")
            return []

    async def get_joined_channel_count(self) -> int:
        """Get the count of channels/groups the account has joined."""
        if not self.client or not self.is_connected:
            return 0

        try:
            count = 0
            async for dialog in self.client.get_dialogs():
                if dialog.chat.type.value in ("channel", "supergroup"):
                    count += 1
            return count
        except Exception as e:
            logger.error(f"Error counting joined channels: {e}")
            return 0
