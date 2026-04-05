"""
NeuroAssistant Web — Database Module
SQLite-based storage for channels, comments, thread memory, and settings.
All operations are async using aiosqlite.
"""

import aiosqlite
import time
from typing import Optional

from config import DB_PATH


class Database:
    """Async SQLite database manager for NeuroAssistant."""

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self.db: Optional[aiosqlite.Connection] = None

    async def initialize(self):
        """Create the database connection and tables."""
        self.db = await aiosqlite.connect(self.db_path)
        self.db.row_factory = aiosqlite.Row
        await self._create_tables()

    async def close(self):
        """Close the database connection gracefully."""
        if self.db:
            await self.db.close()

    async def _create_tables(self):
        """Create all required tables if they don't exist."""
        await self.db.executescript("""
            -- Monitored channels
            CREATE TABLE IF NOT EXISTS channels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                channel_id INTEGER UNIQUE,
                username TEXT,
                title TEXT,
                added_at REAL DEFAULT (strftime('%s', 'now')),
                last_post_at REAL DEFAULT 0,
                is_active INTEGER DEFAULT 1,
                source TEXT DEFAULT 'manual'
            );

            -- Comments left by the bot
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                channel_id INTEGER,
                message_id INTEGER,
                comment_id INTEGER,
                comment_text TEXT,
                post_text TEXT,
                created_at REAL DEFAULT (strftime('%s', 'now')),
                has_image INTEGER DEFAULT 0
            );

            -- Thread memory for maintaining dialogue context
            CREATE TABLE IF NOT EXISTS thread_memory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                channel_id INTEGER,
                message_id INTEGER,
                role TEXT,
                content TEXT,
                created_at REAL DEFAULT (strftime('%s', 'now'))
            );

            -- Application settings (key-value store)
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            );

            -- Blacklisted channels (spam detected by Skynet)
            CREATE TABLE IF NOT EXISTS blacklist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                channel_id INTEGER UNIQUE,
                username TEXT,
                reason TEXT,
                blacklisted_at REAL DEFAULT (strftime('%s', 'now'))
            );

            -- Skynet discovery log
            CREATE TABLE IF NOT EXISTS discovery_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                keyword TEXT,
                channel_username TEXT,
                action TEXT,
                details TEXT,
                created_at REAL DEFAULT (strftime('%s', 'now'))
            );
        """)
        await self.db.commit()

        # Insert default settings if they don't exist
        defaults = {
            "ai_commenting_enabled": "1",
            "auto_dialogue_enabled": "1",
            "prompt": "",
            "language": "en",
            "skynet_active": "0",
            "skynet_keywords": "Business,Design,IT,Technology",
        }
        for key, value in defaults.items():
            await self.db.execute(
                "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
                (key, value),
            )
        await self.db.commit()

    # --- Settings ---

    async def get_setting(self, key: str, default: str = "") -> str:
        """Retrieve a setting value by key."""
        async with self.db.execute(
            "SELECT value FROM settings WHERE key = ?", (key,)
        ) as cursor:
            row = await cursor.fetchone()
            return row["value"] if row else default

    async def set_setting(self, key: str, value: str):
        """Update or insert a setting."""
        await self.db.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
            (key, value),
        )
        await self.db.commit()

    # --- Channels ---

    async def add_channel(
        self, channel_id: int, username: str, title: str = "", source: str = "manual"
    ) -> bool:
        """Add a channel to monitoring. Returns True if added, False if duplicate."""
        try:
            await self.db.execute(
                "INSERT INTO channels (channel_id, username, title, source) "
                "VALUES (?, ?, ?, ?)",
                (channel_id, username, title, source),
            )
            await self.db.commit()
            return True
        except aiosqlite.IntegrityError:
            return False

    async def remove_channel(self, channel_id: int):
        """Remove a channel from monitoring."""
        await self.db.execute(
            "DELETE FROM channels WHERE channel_id = ?", (channel_id,)
        )
        await self.db.commit()

    async def get_channels(self, active_only: bool = True) -> list:
        """Retrieve all monitored channels."""
        query = "SELECT * FROM channels"
        if active_only:
            query += " WHERE is_active = 1"
        query += " ORDER BY added_at DESC"
        async with self.db.execute(query) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    async def get_channel_count(self) -> int:
        """Count the total number of active monitored channels."""
        async with self.db.execute(
            "SELECT COUNT(*) as cnt FROM channels WHERE is_active = 1"
        ) as cursor:
            row = await cursor.fetchone()
            return row["cnt"]

    async def update_channel_last_post(self, channel_id: int):
        """Update the last post timestamp for a channel."""
        await self.db.execute(
            "UPDATE channels SET last_post_at = ? WHERE channel_id = ?",
            (time.time(), channel_id),
        )
        await self.db.commit()

    async def get_deadest_channel(self, days: int = 30) -> Optional[dict]:
        """Find the channel with the oldest last_post_at (most 'dead')."""
        cutoff = time.time() - (days * 86400)
        async with self.db.execute(
            "SELECT * FROM channels WHERE last_post_at < ? AND is_active = 1 "
            "ORDER BY last_post_at ASC LIMIT 1",
            (cutoff,),
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None

    # --- Comments ---

    async def add_comment(
        self,
        channel_id: int,
        message_id: int,
        comment_id: int,
        comment_text: str,
        post_text: str = "",
        has_image: bool = False,
    ):
        """Record a comment left by the bot."""
        await self.db.execute(
            "INSERT INTO comments "
            "(channel_id, message_id, comment_id, comment_text, post_text, has_image) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (channel_id, message_id, comment_id, comment_text, post_text, int(has_image)),
        )
        await self.db.commit()

    async def get_comment_count(self) -> int:
        """Count total comments left by the bot."""
        async with self.db.execute(
            "SELECT COUNT(*) as cnt FROM comments"
        ) as cursor:
            row = await cursor.fetchone()
            return row["cnt"]

    async def get_recent_comments(self, limit: int = 20) -> list:
        """Retrieve the most recent comments."""
        async with self.db.execute(
            "SELECT * FROM comments ORDER BY created_at DESC LIMIT ?", (limit,)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    # --- Thread Memory ---

    async def add_thread_message(
        self, channel_id: int, message_id: int, role: str, content: str
    ):
        """Store a message in the thread memory for context tracking."""
        await self.db.execute(
            "INSERT INTO thread_memory (channel_id, message_id, role, content) "
            "VALUES (?, ?, ?, ?)",
            (channel_id, message_id, role, content),
        )
        await self.db.commit()

    async def get_thread_context(
        self, channel_id: int, message_id: int, limit: int = 10
    ) -> list:
        """Retrieve the last N messages in a thread for context."""
        async with self.db.execute(
            "SELECT role, content FROM thread_memory "
            "WHERE channel_id = ? AND message_id = ? "
            "ORDER BY created_at DESC LIMIT ?",
            (channel_id, message_id, limit),
        ) as cursor:
            rows = await cursor.fetchall()
            # Reverse to get chronological order
            return [dict(row) for row in reversed(rows)]

    # --- Blacklist ---

    async def add_to_blacklist(
        self, channel_id: int, username: str, reason: str
    ):
        """Add a channel to the blacklist."""
        try:
            await self.db.execute(
                "INSERT INTO blacklist (channel_id, username, reason) VALUES (?, ?, ?)",
                (channel_id, username, reason),
            )
            await self.db.commit()
        except aiosqlite.IntegrityError:
            pass  # Already blacklisted

    async def is_blacklisted(self, channel_id: int) -> bool:
        """Check if a channel is blacklisted."""
        async with self.db.execute(
            "SELECT 1 FROM blacklist WHERE channel_id = ?", (channel_id,)
        ) as cursor:
            return await cursor.fetchone() is not None

    async def get_blacklist(self) -> list:
        """Retrieve all blacklisted channels."""
        async with self.db.execute(
            "SELECT * FROM blacklist ORDER BY blacklisted_at DESC"
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    # --- Discovery Log ---

    async def log_discovery(
        self, keyword: str, channel_username: str, action: str, details: str = ""
    ):
        """Log a Skynet discovery event."""
        await self.db.execute(
            "INSERT INTO discovery_log (keyword, channel_username, action, details) "
            "VALUES (?, ?, ?, ?)",
            (keyword, channel_username, action, details),
        )
        await self.db.commit()

    async def get_discovery_log(self, limit: int = 50) -> list:
        """Retrieve recent discovery log entries."""
        async with self.db.execute(
            "SELECT * FROM discovery_log ORDER BY created_at DESC LIMIT ?", (limit,)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]
