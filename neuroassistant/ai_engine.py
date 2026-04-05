"""
NeuroAssistant Web — AI Engine Module
Handles all interactions with Google Gemini API including text and vision.
Implements key rotation for load balancing across multiple API keys.
"""

import asyncio
import base64
import logging
from typing import Optional

import google.generativeai as genai

from config import GEMINI_API_KEYS, GEMINI_MODEL, DEFAULT_PROMPT

logger = logging.getLogger("neuroassistant.ai")


class AIEngine:
    """Google Gemini AI engine with key rotation and vision support."""

    def __init__(self):
        # Index for round-robin key rotation
        self._key_index = 0
        self._lock = asyncio.Lock()
        # Custom prompt set by user (falls back to DEFAULT_PROMPT)
        self.custom_prompt: str = ""

    @property
    def active_prompt(self) -> str:
        """Return the current active prompt (custom or default)."""
        return self.custom_prompt if self.custom_prompt.strip() else DEFAULT_PROMPT

    def _get_next_key(self) -> str:
        """Round-robin key selection for load balancing."""
        key = GEMINI_API_KEYS[self._key_index % len(GEMINI_API_KEYS)]
        self._key_index += 1
        return key

    def _configure_client(self) -> None:
        """Configure the Gemini client with the next available API key."""
        api_key = self._get_next_key()
        genai.configure(api_key=api_key)

    async def generate_comment(
        self,
        post_text: str,
        image_data: Optional[bytes] = None,
        thread_context: Optional[list] = None,
    ) -> str:
        """
        Generate an AI comment for a channel post.

        Args:
            post_text: The text content of the original post.
            image_data: Optional image bytes for vision analysis.
            thread_context: Optional list of previous messages in the thread.

        Returns:
            Generated comment text.
        """
        async with self._lock:
            self._configure_client()

        # Build the system instruction
        system_instruction = self.active_prompt

        # Build content parts for the request
        parts = []

        # Add thread context if available (for maintaining dialogue flow)
        if thread_context:
            context_text = "Previous conversation context:\n"
            for msg in thread_context:
                role_label = "You" if msg["role"] == "assistant" else "User"
                context_text += f"{role_label}: {msg['content']}\n"
            parts.append(context_text + "\n---\n")

        # Add the main post text
        parts.append(f"Post to comment on:\n{post_text}")

        # Add image if present (Gemini Vision)
        if image_data:
            # Encode image to base64 for the API
            b64_image = base64.b64encode(image_data).decode("utf-8")
            parts.append({
                "inline_data": {
                    "mime_type": "image/jpeg",
                    "data": b64_image,
                }
            })
            parts.append(
                "The post includes the image above. "
                "Make sure your comment reflects the visual context."
            )

        # Generate response using Gemini
        try:
            model = genai.GenerativeModel(
                model_name=GEMINI_MODEL,
                system_instruction=system_instruction,
            )
            response = await asyncio.to_thread(
                model.generate_content, parts
            )
            comment = response.text.strip()
            # Clean up any markdown formatting the model might add
            comment = comment.strip('"').strip("'")
            logger.info(f"Generated comment: {comment[:80]}...")
            return comment
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            # Retry with a different key once
            try:
                async with self._lock:
                    self._configure_client()
                model = genai.GenerativeModel(
                    model_name=GEMINI_MODEL,
                    system_instruction=system_instruction,
                )
                response = await asyncio.to_thread(
                    model.generate_content, parts
                )
                return response.text.strip().strip('"').strip("'")
            except Exception as retry_error:
                logger.error(f"Gemini retry failed: {retry_error}")
                return ""

    async def generate_reply(
        self,
        original_post: str,
        user_reply: str,
        thread_context: Optional[list] = None,
    ) -> str:
        """
        Generate a reply to a user who responded to our comment.

        Args:
            original_post: The original post text.
            user_reply: The reply from the user.
            thread_context: Previous messages in the thread.

        Returns:
            Generated reply text.
        """
        async with self._lock:
            self._configure_client()

        system_instruction = (
            f"{self.active_prompt}\n\n"
            "You are now replying to someone who responded to your previous comment. "
            "Be polite, contextual, and maintain your role. Keep it brief (1-2 sentences). "
            "Do not repeat yourself or use the same phrases as your previous comments."
        )

        parts = []

        if thread_context:
            context_text = "Conversation so far:\n"
            for msg in thread_context:
                role_label = "You" if msg["role"] == "assistant" else "User"
                context_text += f"{role_label}: {msg['content']}\n"
            parts.append(context_text + "\n---\n")

        parts.append(f"Original post: {original_post}\n")
        parts.append(f"User's reply to you: {user_reply}\n")
        parts.append("Generate a polite, contextual reply:")

        try:
            model = genai.GenerativeModel(
                model_name=GEMINI_MODEL,
                system_instruction=system_instruction,
            )
            response = await asyncio.to_thread(
                model.generate_content, parts
            )
            reply = response.text.strip().strip('"').strip("'")
            logger.info(f"Generated reply: {reply[:80]}...")
            return reply
        except Exception as e:
            logger.error(f"Gemini reply generation error: {e}")
            return ""

    async def analyze_channel_relevance(
        self, channel_title: str, posts_text: list, keywords: list
    ) -> dict:
        """
        Analyze a channel's relevance for the Skynet discovery module.

        Args:
            channel_title: The channel's title.
            posts_text: List of recent post texts from the channel.
            keywords: Target keywords to match against.

        Returns:
            Dict with 'relevant' (bool) and 'reason' (str).
        """
        async with self._lock:
            self._configure_client()

        prompt = (
            f"Analyze this Telegram channel for relevance.\n"
            f"Channel title: {channel_title}\n"
            f"Target keywords: {', '.join(keywords)}\n"
            f"Recent posts:\n"
        )
        for i, post in enumerate(posts_text[:5], 1):
            prompt += f"{i}. {post[:200]}\n"

        prompt += (
            "\nRespond with ONLY a JSON object: "
            '{"relevant": true/false, "reason": "brief explanation"}'
        )

        try:
            model = genai.GenerativeModel(model_name=GEMINI_MODEL)
            response = await asyncio.to_thread(
                model.generate_content, prompt
            )
            text = response.text.strip()
            # Parse JSON from response
            import json
            # Try to extract JSON from the response
            if "{" in text:
                json_str = text[text.index("{"):text.rindex("}") + 1]
                return json.loads(json_str)
            return {"relevant": False, "reason": "Could not parse AI response"}
        except Exception as e:
            logger.error(f"Channel analysis error: {e}")
            return {"relevant": False, "reason": str(e)}
