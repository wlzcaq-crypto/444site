"""
NeuroAssistant Web — Web Dashboard Module
aiohttp-based web server with Jinja2 templates for the control panel.
Provides REST API endpoints and serves the dashboard UI.
"""

import hashlib
import logging
from typing import Optional

import aiohttp_jinja2
import jinja2
from aiohttp import web

from config import SERVER_IP, PORT, TEMPLATES_DIR, STATIC_DIR, get_translation
from database import Database
from ai_engine import AIEngine

logger = logging.getLogger("neuroassistant.web")


class WebDashboard:
    """
    Web dashboard server providing:
    - Main dashboard page with all widgets
    - REST API for AJAX interactions
    - Real-time status updates
    """

    def __init__(self, db: Database, ai: AIEngine, telegram_bot, skynet):
        self.db = db
        self.ai = ai
        self.telegram = telegram_bot
        self.skynet = skynet
        self.app = web.Application()
        self.runner: Optional[web.AppRunner] = None

        # Configure Jinja2 template engine
        aiohttp_jinja2.setup(
            self.app,
            loader=jinja2.FileSystemLoader(TEMPLATES_DIR),
        )

        # Add static file routes
        self.app.router.add_static(
            "/static", STATIC_DIR, name="static"
        )

        # Register all routes
        self._register_routes()

    def _register_routes(self):
        """Register all HTTP routes for the dashboard and API."""
        # Page routes
        self.app.router.add_get("/", self.handle_dashboard)

        # API routes
        self.app.router.add_get("/api/status", self.api_status)
        self.app.router.add_post(
            "/api/toggle-commenting", self.api_toggle_commenting
        )
        self.app.router.add_post(
            "/api/toggle-dialogue", self.api_toggle_dialogue
        )
        self.app.router.add_post(
            "/api/save-prompt", self.api_save_prompt
        )
        self.app.router.add_post(
            "/api/set-language", self.api_set_language
        )
        self.app.router.add_post(
            "/api/add-channel", self.api_add_channel
        )
        self.app.router.add_post(
            "/api/remove-channel", self.api_remove_channel
        )
        self.app.router.add_get(
            "/api/channels", self.api_get_channels
        )
        self.app.router.add_get(
            "/api/comments", self.api_get_comments
        )
        self.app.router.add_post(
            "/api/skynet/start", self.api_skynet_start
        )
        self.app.router.add_post(
            "/api/skynet/stop", self.api_skynet_stop
        )
        self.app.router.add_post(
            "/api/skynet/keywords", self.api_skynet_keywords
        )
        self.app.router.add_get(
            "/api/skynet/log", self.api_skynet_log
        )
        self.app.router.add_post(
            "/api/connect", self.api_connect
        )
        self.app.router.add_post(
            "/api/disconnect", self.api_disconnect
        )

    async def start(self):
        """Start the aiohttp web server."""
        self.runner = web.AppRunner(self.app)
        await self.runner.setup()
        site = web.TCPSite(self.runner, SERVER_IP, PORT)
        await site.start()
        logger.info(f"Web dashboard running at http://{SERVER_IP}:{PORT}")

    async def stop(self):
        """Stop the web server gracefully."""
        if self.runner:
            await self.runner.cleanup()
            logger.info("Web dashboard stopped.")

    # --- Page Handlers ---

    @aiohttp_jinja2.template("dashboard.html")
    async def handle_dashboard(self, request: web.Request) -> dict:
        """Render the main dashboard page."""
        lang = await self.db.get_setting("language", "en")
        t = get_translation(lang)
        prompt = await self.db.get_setting("prompt", "")
        commenting = await self.db.get_setting("ai_commenting_enabled", "1")
        dialogue = await self.db.get_setting("auto_dialogue_enabled", "1")
        comment_count = await self.db.get_comment_count()
        channel_count = await self.db.get_channel_count()
        channels = await self.db.get_channels()
        comments = await self.db.get_recent_comments(limit=20)
        skynet_active = await self.db.get_setting("skynet_active", "0")
        skynet_keywords = await self.db.get_setting(
            "skynet_keywords", "Business,Design,IT"
        )

        return {
            "t": t,
            "lang": lang,
            "prompt": prompt,
            "commenting_enabled": commenting == "1",
            "dialogue_enabled": dialogue == "1",
            "is_connected": self.telegram.is_connected,
            "comment_count": comment_count,
            "channel_count": channel_count,
            "channels": channels,
            "comments": comments,
            "skynet_active": skynet_active == "1",
            "skynet_keywords": skynet_keywords,
        }

    # --- API Handlers ---

    async def api_status(self, request: web.Request) -> web.Response:
        """Return current system status as JSON."""
        commenting = await self.db.get_setting("ai_commenting_enabled", "1")
        dialogue = await self.db.get_setting("auto_dialogue_enabled", "1")
        comment_count = await self.db.get_comment_count()
        channel_count = await self.db.get_channel_count()
        skynet_active = await self.db.get_setting("skynet_active", "0")

        return web.json_response({
            "connected": self.telegram.is_connected,
            "commenting_enabled": commenting == "1",
            "dialogue_enabled": dialogue == "1",
            "comment_count": comment_count,
            "channel_count": channel_count,
            "skynet_active": skynet_active == "1",
        })

    async def api_toggle_commenting(
        self, request: web.Request
    ) -> web.Response:
        """Toggle AI commenting on/off."""
        current = await self.db.get_setting("ai_commenting_enabled", "1")
        new_value = "0" if current == "1" else "1"
        await self.db.set_setting("ai_commenting_enabled", new_value)
        self.telegram.commenting_enabled = new_value == "1"
        return web.json_response({
            "enabled": new_value == "1",
        })

    async def api_toggle_dialogue(
        self, request: web.Request
    ) -> web.Response:
        """Toggle auto-dialogue on/off."""
        current = await self.db.get_setting("auto_dialogue_enabled", "1")
        new_value = "0" if current == "1" else "1"
        await self.db.set_setting("auto_dialogue_enabled", new_value)
        self.telegram.auto_dialogue_enabled = new_value == "1"
        return web.json_response({
            "enabled": new_value == "1",
        })

    async def api_save_prompt(self, request: web.Request) -> web.Response:
        """Save the AI persona prompt."""
        data = await request.json()
        prompt = data.get("prompt", "")
        await self.db.set_setting("prompt", prompt)
        self.ai.custom_prompt = prompt
        return web.json_response({"success": True})

    async def api_set_language(self, request: web.Request) -> web.Response:
        """Switch the dashboard language."""
        data = await request.json()
        lang = data.get("language", "en")
        if lang not in ("en", "ru"):
            lang = "en"
        await self.db.set_setting("language", lang)
        return web.json_response({"success": True, "language": lang})

    async def api_add_channel(self, request: web.Request) -> web.Response:
        """Add a channel to monitoring."""
        data = await request.json()
        username = data.get("username", "").strip().lstrip("@")

        if not username:
            return web.json_response(
                {"error": "Username is required"}, status=400
            )

        # Try to get channel info via Telegram
        if self.telegram.is_connected:
            info = await self.telegram.get_channel_info(username)
            if info:
                added = await self.db.add_channel(
                    channel_id=info["channel_id"],
                    username=username,
                    title=info.get("title", username),
                    source="manual",
                )
                if added:
                    return web.json_response({
                        "success": True,
                        "channel": info,
                    })
                else:
                    return web.json_response(
                        {"error": "Channel already monitored"}, status=409
                    )
            else:
                return web.json_response(
                    {"error": "Channel not found"}, status=404
                )
        else:
            # Add with deterministic placeholder ID if not connected
            # Use hashlib (deterministic across sessions) instead of hash()
            stable_hash = int(
                hashlib.sha256(username.encode()).hexdigest(), 16
            ) % (10**10)
            added = await self.db.add_channel(
                channel_id=stable_hash,
                username=username,
                title=username,
                source="manual",
            )
            return web.json_response({"success": added})

    async def api_remove_channel(
        self, request: web.Request
    ) -> web.Response:
        """Remove a channel from monitoring."""
        data = await request.json()
        channel_id = data.get("channel_id")

        if not channel_id:
            return web.json_response(
                {"error": "channel_id is required"}, status=400
            )

        await self.db.remove_channel(int(channel_id))
        return web.json_response({"success": True})

    async def api_get_channels(
        self, request: web.Request
    ) -> web.Response:
        """Get all monitored channels."""
        channels = await self.db.get_channels()
        return web.json_response({"channels": channels})

    async def api_get_comments(
        self, request: web.Request
    ) -> web.Response:
        """Get recent comments."""
        limit = int(request.query.get("limit", "20"))
        comments = await self.db.get_recent_comments(limit=limit)
        return web.json_response({"comments": comments})

    async def api_skynet_start(
        self, request: web.Request
    ) -> web.Response:
        """Start the Skynet discovery module."""
        if not self.telegram.is_connected:
            return web.json_response(
                {"error": "Telegram client not connected"}, status=400
            )
        await self.db.set_setting("skynet_active", "1")
        await self.skynet.start()
        return web.json_response({"success": True, "active": True})

    async def api_skynet_stop(
        self, request: web.Request
    ) -> web.Response:
        """Stop the Skynet discovery module."""
        await self.db.set_setting("skynet_active", "0")
        await self.skynet.stop()
        return web.json_response({"success": True, "active": False})

    async def api_skynet_keywords(
        self, request: web.Request
    ) -> web.Response:
        """Update Skynet search keywords."""
        data = await request.json()
        keywords = data.get("keywords", "")
        await self.db.set_setting("skynet_keywords", keywords)
        return web.json_response({"success": True, "keywords": keywords})

    async def api_skynet_log(
        self, request: web.Request
    ) -> web.Response:
        """Get the Skynet discovery log."""
        log = await self.db.get_discovery_log(limit=50)
        return web.json_response({"log": log})

    async def api_connect(self, request: web.Request) -> web.Response:
        """Connect the Telegram client."""
        try:
            if not self.telegram.is_connected:
                await self.telegram.start()
            return web.json_response({
                "success": True,
                "connected": True,
            })
        except Exception as e:
            return web.json_response(
                {"error": str(e), "connected": False}, status=500
            )

    async def api_disconnect(self, request: web.Request) -> web.Response:
        """Disconnect the Telegram client."""
        try:
            if self.telegram.is_connected:
                await self.telegram.stop()
            return web.json_response({
                "success": True,
                "connected": False,
            })
        except Exception as e:
            return web.json_response(
                {"error": str(e)}, status=500
            )
