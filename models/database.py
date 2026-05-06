import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "app.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        conn.executescript("""
        -- Utilisateurs
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL,
            email       TEXT UNIQUE NOT NULL,
            chronotype  TEXT DEFAULT 'intermediate', -- morning / evening / intermediate
            created_at  TEXT DEFAULT (datetime('now'))
        );

        -- Mauvaises habitudes déclarées
        CREATE TABLE IF NOT EXISTS bad_habits (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            label       TEXT NOT NULL,
            category    TEXT NOT NULL, -- avoidance / distraction / perfectionism / decision_delay
            severity    INTEGER DEFAULT 3, -- 1 (faible) à 5 (sévère)
            created_at  TEXT DEFAULT (datetime('now'))
        );

        -- Causes de procrastination
        CREATE TABLE IF NOT EXISTS procrastination_causes (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            cause_type  TEXT NOT NULL, -- fear_failure / task_aversion / lack_of_meaning / decision_overload / anxiety / low_energy
            description TEXT,
            trigger_time TEXT, -- morning / afternoon / evening / night
            trigger_context TEXT, -- work / personal / social / administrative
            frequency   INTEGER DEFAULT 3, -- 1 (rare) à 5 (quotidien)
            created_at  TEXT DEFAULT (datetime('now'))
        );

        -- Plan d'actions générées
        CREATE TABLE IF NOT EXISTS action_plans (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            cause_id    INTEGER REFERENCES procrastination_causes(id) ON DELETE SET NULL,
            title       TEXT NOT NULL,
            protocol    TEXT NOT NULL, -- micro_intervention / cbt / graduated_exposure / reward_loop
            description TEXT NOT NULL,
            duration_min INTEGER DEFAULT 5,
            difficulty  INTEGER DEFAULT 2, -- 1 à 5
            status      TEXT DEFAULT 'pending', -- pending / active / completed / skipped
            scheduled_at TEXT,
            completed_at TEXT,
            created_at  TEXT DEFAULT (datetime('now'))
        );

        -- Agenda / blocs de temps
        CREATE TABLE IF NOT EXISTS agenda_blocks (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            plan_id     INTEGER REFERENCES action_plans(id) ON DELETE SET NULL,
            title       TEXT NOT NULL,
            block_type  TEXT NOT NULL, -- deep_work / routine / recovery / avoid
            energy_level TEXT DEFAULT 'high', -- high / medium / low
            date        TEXT NOT NULL, -- YYYY-MM-DD
            start_time  TEXT NOT NULL, -- HH:MM
            end_time    TEXT NOT NULL, -- HH:MM
            notes       TEXT,
            done        INTEGER DEFAULT 0, -- 0 / 1
            created_at  TEXT DEFAULT (datetime('now'))
        );

        -- Suivi quotidien / journal
        CREATE TABLE IF NOT EXISTS daily_logs (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            date          TEXT NOT NULL, -- YYYY-MM-DD
            energy_score  INTEGER DEFAULT 3, -- 1 à 5
            focus_score   INTEGER DEFAULT 3,
            mood_score    INTEGER DEFAULT 3,
            procrastinated INTEGER DEFAULT 0, -- 0 / 1
            notes         TEXT,
            created_at    TEXT DEFAULT (datetime('now')),
            UNIQUE(user_id, date)
        );

        -- Habitudes en cours de correction (streaks)
        CREATE TABLE IF NOT EXISTS habit_streaks (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            habit_id    INTEGER NOT NULL REFERENCES bad_habits(id) ON DELETE CASCADE,
            current_streak INTEGER DEFAULT 0,
            best_streak    INTEGER DEFAULT 0,
            last_checked_date TEXT,
            UNIQUE(user_id, habit_id)
        );
        """)
    print(f"✅ Base de données initialisée : {DB_PATH}")
