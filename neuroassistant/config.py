"""
NeuroAssistant Web — Configuration Module
Loads credentials from environment variables (via .env file) and defines
constants and i18n translations.

Create a .env file in this directory with:
    API_ID=<your_telegram_api_id>
    API_HASH=<your_telegram_api_hash>
    GEMINI_API_KEYS=<key1>,<key2>,<key3>,<key4>
"""

import os

from dotenv import load_dotenv

# Load .env file from the same directory as this config module
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# --- Telegram API Credentials (loaded from environment / .env) ---
API_ID = int(os.getenv("API_ID", "0"))
API_HASH = os.getenv("API_HASH", "")

# --- Google Gemini API Keys (comma-separated in env var, rotated for load balancing) ---
GEMINI_API_KEYS = [
    k.strip() for k in os.getenv("GEMINI_API_KEYS", "").split(",") if k.strip()
]

# --- Web Server ---
SERVER_IP = "127.0.0.1"
PORT = 8080

# --- Paths ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "neuroassistant.db")
SESSION_PATH = os.path.join(BASE_DIR, "neuroassistant_session")
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
STATIC_DIR = os.path.join(BASE_DIR, "static")

# --- Gemini Model ---
GEMINI_MODEL = "gemini-2.5-flash"

# --- Commenting Defaults ---
DEFAULT_PROMPT = (
    "You are a professional industry expert leaving concise, insightful comments "
    "on Telegram channel posts. Your comments should be relevant, thoughtful, and "
    "add value to the conversation. Keep responses under 2-3 sentences. "
    "Match the language of the original post."
)
COMMENT_DELAY_MIN = 3  # seconds
COMMENT_DELAY_MAX = 8  # seconds
MEMORY_CONTEXT_SIZE = 10  # last N messages to keep in thread memory

# --- Skynet Module ---
MAX_CHANNELS = 500  # Telegram's group join limit
DEAD_CHANNEL_DAYS = 30  # days without posts to consider a channel "dead"
SPAM_KEYWORDS = [
    "casino", "crypto scam", "nsfw", "porn", "gambling",
    "bet365", "1xbet", "onlyfans", "dating", "escort",
]

# --- Internationalization (i18n) ---
TRANSLATIONS = {
    "en": {
        "app_title": "NeuroAssistant",
        "app_subtitle": "Telegram AI Automation",
        "status": "Status",
        "active": "ACTIVE",
        "offline": "OFFLINE",
        "comments_left": "Comments Left",
        "channels_monitored": "Channels Monitored",
        "ai_commenting": "AI Commenting",
        "enabled": "Enabled",
        "disabled": "Disabled",
        "prompt_editor": "AI Persona Prompt",
        "prompt_placeholder": "Define the AI's behavior and tone...",
        "save_prompt": "Save Prompt",
        "channels": "Channels",
        "add_channel": "Add Channel",
        "remove": "Remove",
        "channel_username": "Channel Username",
        "skynet": "Skynet Discovery",
        "skynet_desc": "Discover and join relevant channels automatically",
        "search_keywords": "Search Keywords",
        "start_discovery": "Start Discovery",
        "stop_discovery": "Stop Discovery",
        "recent_comments": "Recent Activity",
        "no_comments": "No comments yet",
        "settings": "Settings",
        "language": "Language",
        "connection": "Connection",
        "connect": "Connect",
        "disconnect": "Disconnect",
        "auto_dialogue": "Auto-Dialogue",
        "auto_dialogue_desc": "Automatically reply when users respond to your comments",
        "discovery_active": "Discovery Active",
        "discovery_inactive": "Discovery Inactive",
        "quality_filter": "Quality Filter",
        "quality_filter_desc": "Filter out spam channels automatically",
        "joined_channels": "Joined Channels",
        "blacklisted": "Blacklisted",
    },
    "ru": {
        "app_title": "НейроАссистент",
        "app_subtitle": "Telegram AI Автоматизация",
        "status": "Статус",
        "active": "АКТИВЕН",
        "offline": "ОФФЛАЙН",
        "comments_left": "Оставлено комментариев",
        "channels_monitored": "Каналов отслеживается",
        "ai_commenting": "AI Комментирование",
        "enabled": "Включено",
        "disabled": "Выключено",
        "prompt_editor": "Промпт персоны AI",
        "prompt_placeholder": "Определите поведение и тон AI...",
        "save_prompt": "Сохранить промпт",
        "channels": "Каналы",
        "add_channel": "Добавить канал",
        "remove": "Удалить",
        "channel_username": "Юзернейм канала",
        "skynet": "Skynet Поиск",
        "skynet_desc": "Автоматический поиск и подключение к релевантным каналам",
        "search_keywords": "Ключевые слова",
        "start_discovery": "Начать поиск",
        "stop_discovery": "Остановить поиск",
        "recent_comments": "Последняя активность",
        "no_comments": "Комментариев пока нет",
        "settings": "Настройки",
        "language": "Язык",
        "connection": "Подключение",
        "connect": "Подключить",
        "disconnect": "Отключить",
        "auto_dialogue": "Авто-диалог",
        "auto_dialogue_desc": "Автоматически отвечать когда пользователи реагируют на ваши комментарии",
        "discovery_active": "Поиск активен",
        "discovery_inactive": "Поиск неактивен",
        "quality_filter": "Фильтр качества",
        "quality_filter_desc": "Автоматическая фильтрация спам-каналов",
        "joined_channels": "Подключенные каналы",
        "blacklisted": "Черный список",
    },
}


def get_translation(lang: str = "en") -> dict:
    """Return the translation dict for the given language code."""
    return TRANSLATIONS.get(lang, TRANSLATIONS["en"])
