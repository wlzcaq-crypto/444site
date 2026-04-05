"""
NeuroAssistant Web — Main Entry Point
Initializes all modules and runs the Pyrogram client and aiohttp web server
concurrently on the same asyncio event loop.
"""

import asyncio
import logging
import signal
import sys

from database import Database
from ai_engine import AIEngine
from telegram_client import TelegramBot
from skynet import SkynetDiscovery
from web import WebDashboard

# --- Logging Configuration ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)-28s | %(levelname)-7s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("neuroassistant.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger("neuroassistant.main")


async def main():
    """
    Main async entry point.
    Initializes all components and runs them concurrently:
    1. Database initialization
    2. AI Engine setup
    3. Telegram client (Pyrogram)
    4. Skynet discovery module
    5. Web dashboard (aiohttp)
    """
    logger.info("=" * 60)
    logger.info("  NeuroAssistant Web — Starting Up")
    logger.info("=" * 60)

    # --- Initialize Database ---
    db = Database()
    await db.initialize()
    logger.info("Database initialized.")

    # --- Initialize AI Engine ---
    ai = AIEngine()
    # Load saved prompt from database
    saved_prompt = await db.get_setting("prompt", "")
    if saved_prompt:
        ai.custom_prompt = saved_prompt
    logger.info("AI Engine initialized.")

    # --- Initialize Telegram Client ---
    telegram = TelegramBot(db=db, ai=ai)
    logger.info("Telegram client module initialized.")

    # --- Initialize Skynet Discovery ---
    skynet = SkynetDiscovery(db=db, ai=ai, telegram_bot=telegram)
    logger.info("Skynet Discovery module initialized.")

    # --- Initialize Web Dashboard ---
    web = WebDashboard(db=db, ai=ai, telegram_bot=telegram, skynet=skynet)
    logger.info("Web Dashboard module initialized.")

    # --- Load settings from database ---
    commenting_enabled = await db.get_setting("ai_commenting_enabled", "1")
    telegram.commenting_enabled = commenting_enabled == "1"
    dialogue_enabled = await db.get_setting("auto_dialogue_enabled", "1")
    telegram.auto_dialogue_enabled = dialogue_enabled == "1"

    # --- Graceful Shutdown Handler ---
    shutdown_event = asyncio.Event()

    def signal_handler():
        logger.info("Shutdown signal received.")
        shutdown_event.set()

    loop = asyncio.get_event_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, signal_handler)

    # --- Start Web Dashboard ---
    await web.start()

    # --- Attempt to start Telegram client ---
    try:
        await telegram.start()
        logger.info("Telegram client connected successfully.")

        # Start Skynet if it was active before shutdown
        skynet_active = await db.get_setting("skynet_active", "0")
        if skynet_active == "1":
            await skynet.start()
            logger.info("Skynet Discovery resumed.")
    except Exception as e:
        logger.warning(
            f"Telegram client failed to start: {e}. "
            f"You can connect manually via the dashboard."
        )

    logger.info("=" * 60)
    logger.info("  NeuroAssistant Web is running!")
    logger.info("  Dashboard: http://127.0.0.1:8080")
    logger.info("=" * 60)

    # --- Wait for shutdown signal ---
    await shutdown_event.wait()

    # --- Graceful Shutdown ---
    logger.info("Shutting down...")
    await skynet.stop()
    await telegram.stop()
    await web.stop()
    await db.close()
    logger.info("NeuroAssistant Web stopped. Goodbye.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Interrupted. Exiting.")
