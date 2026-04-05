"""
NeuroAssistant Web — Skynet Content Discovery Module
Background task that discovers relevant channels, applies quality filtering,
and manages automatic joining/leaving to stay within Telegram's limits.
"""

import asyncio
import logging
from typing import Optional

from config import MAX_CHANNELS, DEAD_CHANNEL_DAYS, SPAM_KEYWORDS
from database import Database
from ai_engine import AIEngine

logger = logging.getLogger("neuroassistant.skynet")


class SkynetDiscovery:
    """
    Content Discovery Module that:
    1. Searches for channels matching target keywords.
    2. Filters out spam/low-quality channels.
    3. Automatically joins relevant channels.
    4. Manages channel limits by removing dead channels.
    """

    def __init__(self, db: Database, ai: AIEngine, telegram_bot):
        self.db = db
        self.ai = ai
        self.telegram = telegram_bot
        self.is_running = False
        self._task: Optional[asyncio.Task] = None

    async def start(self):
        """Start the Skynet discovery background loop."""
        if self.is_running:
            logger.warning("Skynet is already running.")
            return

        self.is_running = True
        self._task = asyncio.create_task(self._discovery_loop())
        logger.info("Skynet Discovery started.")

    async def stop(self):
        """Stop the Skynet discovery background loop."""
        self.is_running = False
        if self._task and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Skynet Discovery stopped.")

    async def _discovery_loop(self):
        """
        Main discovery loop. Periodically searches for new channels
        based on configured keywords, evaluates them, and joins if relevant.
        """
        while self.is_running:
            try:
                # Get keywords from settings
                keywords_str = await self.db.get_setting(
                    "skynet_keywords", "Business,Design,IT"
                )
                keywords = [
                    kw.strip()
                    for kw in keywords_str.split(",")
                    if kw.strip()
                ]

                if not keywords:
                    logger.info("No Skynet keywords configured, waiting...")
                    await asyncio.sleep(60)
                    continue

                logger.info(
                    f"Skynet scanning with keywords: {', '.join(keywords)}"
                )

                for keyword in keywords:
                    if not self.is_running:
                        break

                    await self._process_keyword(keyword, keywords)
                    # Delay between keyword searches to avoid rate limits
                    await asyncio.sleep(10)

                # Wait before next full scan cycle (5 minutes)
                for _ in range(300):
                    if not self.is_running:
                        break
                    await asyncio.sleep(1)

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Skynet loop error: {e}")
                await asyncio.sleep(30)

    async def _process_keyword(self, keyword: str, all_keywords: list):
        """Search and evaluate channels for a single keyword."""
        # Search for channels
        results = await self.telegram.search_channels(keyword, limit=15)

        for channel in results:
            if not self.is_running:
                break

            channel_id = channel["channel_id"]
            username = channel.get("username", "")

            if not username:
                continue

            # Skip if already monitored or blacklisted
            if await self.db.is_blacklisted(channel_id):
                continue

            channels = await self.db.get_channels(active_only=False)
            existing_ids = [ch["channel_id"] for ch in channels]
            if channel_id in existing_ids:
                continue

            # Evaluate the channel
            is_quality = await self._evaluate_channel(
                channel, all_keywords
            )

            if is_quality:
                await self._try_join_channel(channel, keyword)
            else:
                logger.info(
                    f"Skynet: Skipped {username} (low quality or spam)."
                )

            # Small delay between evaluations
            await asyncio.sleep(3)

    async def _evaluate_channel(
        self, channel: dict, keywords: list
    ) -> bool:
        """
        Evaluate a channel's quality by checking its recent posts
        for spam and relevance.

        Returns True if the channel passes quality checks.
        """
        channel_id = channel["channel_id"]
        username = channel.get("username", "")
        title = channel.get("title", "")

        try:
            # Fetch last 5 posts
            posts = await self.telegram.get_recent_posts(
                channel_id, limit=5
            )

            if not posts:
                await self.db.log_discovery(
                    keyword="",
                    channel_username=username,
                    action="skipped",
                    details="No recent posts found.",
                )
                return False

            # Check for spam keywords in posts
            combined_text = " ".join(posts).lower()
            for spam_word in SPAM_KEYWORDS:
                if spam_word.lower() in combined_text:
                    # Blacklist this channel
                    await self.db.add_to_blacklist(
                        channel_id=channel_id,
                        username=username,
                        reason=f"Spam keyword detected: '{spam_word}'",
                    )
                    await self.db.log_discovery(
                        keyword="",
                        channel_username=username,
                        action="blacklisted",
                        details=f"Spam: '{spam_word}'",
                    )
                    logger.info(
                        f"Skynet: Blacklisted {username} — "
                        f"spam keyword: '{spam_word}'"
                    )
                    return False

            # Use AI to analyze deeper relevance
            analysis = await self.ai.analyze_channel_relevance(
                channel_title=title,
                posts_text=posts,
                keywords=keywords,
            )

            if analysis.get("relevant"):
                await self.db.log_discovery(
                    keyword=", ".join(keywords),
                    channel_username=username,
                    action="approved",
                    details=analysis.get("reason", ""),
                )
                return True
            else:
                await self.db.log_discovery(
                    keyword=", ".join(keywords),
                    channel_username=username,
                    action="rejected",
                    details=analysis.get("reason", "Not relevant"),
                )
                return False

        except Exception as e:
            logger.error(f"Error evaluating {username}: {e}")
            return False

    async def _try_join_channel(self, channel: dict, keyword: str):
        """
        Attempt to join a channel. If at the 500 channel limit,
        perform smart shifting by leaving the deadest channel first.
        """
        username = channel.get("username", "")
        title = channel.get("title", username)

        # Check current channel count
        joined_count = await self.telegram.get_joined_channel_count()

        if joined_count >= MAX_CHANNELS:
            logger.info(
                f"At channel limit ({joined_count}/{MAX_CHANNELS}). "
                f"Attempting smart shift..."
            )
            freed = await self._smart_shift()
            if not freed:
                logger.warning(
                    "Could not free a channel slot. Skipping join."
                )
                await self.db.log_discovery(
                    keyword=keyword,
                    channel_username=username,
                    action="skipped",
                    details="Channel limit reached, no dead channels to leave.",
                )
                return

        # Join the channel
        result = await self.telegram.join_channel(username)
        if result:
            await self.db.add_channel(
                channel_id=result["channel_id"],
                username=username,
                title=result.get("title", title),
                source="skynet",
            )
            await self.db.log_discovery(
                keyword=keyword,
                channel_username=username,
                action="joined",
                details=f"Automatically joined via Skynet (keyword: {keyword})",
            )
            logger.info(f"Skynet: Joined channel @{username}")
        else:
            await self.db.log_discovery(
                keyword=keyword,
                channel_username=username,
                action="join_failed",
                details="Could not join channel.",
            )

    async def _smart_shift(self) -> bool:
        """
        Smart Shifting (Anti-Limit): Find and leave the most 'dead' channel
        to free up a slot for a new, more relevant channel.

        A channel is considered 'dead' if it hasn't had a post in 30+ days
        or if comments are disabled.

        Returns True if a channel was successfully left.
        """
        dead_channel = await self.db.get_deadest_channel(
            days=DEAD_CHANNEL_DAYS
        )

        if not dead_channel:
            logger.info("No dead channels found for smart shifting.")
            return False

        channel_id = dead_channel["channel_id"]
        username = dead_channel.get("username", "unknown")

        logger.info(
            f"Smart Shift: Leaving dead channel @{username} "
            f"(ID: {channel_id})"
        )

        # Leave the channel on Telegram
        left = await self.telegram.leave_channel(channel_id)

        if left:
            # Remove from our monitoring database
            await self.db.remove_channel(channel_id)
            await self.db.log_discovery(
                keyword="smart_shift",
                channel_username=username,
                action="left",
                details=(
                    f"Smart shift: Left dead channel "
                    f"(no posts for {DEAD_CHANNEL_DAYS}+ days)"
                ),
            )
            logger.info(f"Smart Shift: Successfully left @{username}")
            return True

        return False
