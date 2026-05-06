from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import date, time

# ─── USERS ────────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    chronotype: Literal["lion", "bear", "wolf", "dolphin"] = "bear"

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    chronotype: str
    created_at: str

# ─── BAD HABITS ───────────────────────────────────────────
class BadHabitCreate(BaseModel):
    label: str = Field(..., min_length=1, max_length=200)
    category: Literal["avoidance", "distraction", "perfectionism", "decision_delay"]
    severity: int = Field(3, ge=1, le=5)

class BadHabitOut(BadHabitCreate):
    id: int
    user_id: int
    created_at: str

# ─── CAUSES ───────────────────────────────────────────────
class CauseCreate(BaseModel):
    cause_type: Literal[
        "fear_failure", "task_aversion", "lack_of_meaning",
        "decision_overload", "anxiety", "low_energy"
    ]
    description: Optional[str] = None
    trigger_time: Optional[Literal["morning", "afternoon", "evening", "night"]] = None
    trigger_context: Optional[Literal["work", "personal", "social", "administrative"]] = None
    frequency: int = Field(3, ge=1, le=5)

class CauseOut(CauseCreate):
    id: int
    user_id: int
    created_at: str

# ─── ACTION PLANS ─────────────────────────────────────────
class ActionPlanCreate(BaseModel):
    report_id: Optional[int] = None
    cause_id: Optional[int] = None
    title: str = Field(..., min_length=1, max_length=200)
    protocol: Literal["micro_intervention", "cbt", "graduated_exposure", "reward_loop"]
    description: str
    duration_min: int = Field(5, ge=1, le=240)
    difficulty: int = Field(2, ge=1, le=5)
    scheduled_at: Optional[str] = None  # ISO datetime

class ActionPlanUpdate(BaseModel):
    status: Optional[Literal["pending", "active", "completed", "skipped"]] = None
    scheduled_at: Optional[str] = None
    completed_at: Optional[str] = None

class ActionPlanOut(ActionPlanCreate):
    id: int
    user_id: int
    status: str
    completed_at: Optional[str]
    created_at: str

# ─── AGENDA BLOCKS ────────────────────────────────────────
class AgendaBlockCreate(BaseModel):
    plan_id: Optional[int] = None
    title: str = Field(..., min_length=1, max_length=200)
    block_type: Literal["deep_work", "routine", "recovery", "avoid"]
    energy_level: Literal["high", "medium", "low"] = "high"
    date: str   # YYYY-MM-DD
    start_time: str  # HH:MM
    end_time: str    # HH:MM
    notes: Optional[str] = None

class AgendaBlockUpdate(BaseModel):
    done: Optional[bool] = None
    notes: Optional[str] = None

class AgendaBlockOut(AgendaBlockCreate):
    id: int
    user_id: int
    done: bool
    created_at: str

# ─── DAILY LOG ────────────────────────────────────────────
class DailyLogCreate(BaseModel):
    date: str  # YYYY-MM-DD
    energy_score: int = Field(3, ge=1, le=5)
    focus_score: int = Field(3, ge=1, le=5)
    mood_score: int = Field(3, ge=1, le=5)
    procrastinated: bool = False
    notes: Optional[str] = None

class DailyLogOut(DailyLogCreate):
    id: int
    user_id: int
    created_at: str

# ─── DIAGNOSTIC REPORT ────────────────────────────────────
class DiagnosticReport(BaseModel):
    report_id: Optional[int] = None
    user_id: int
    dominant_cause: Optional[str]
    dominant_habit_category: Optional[str]
    most_vulnerable_time: Optional[str]
    most_vulnerable_context: Optional[str]
    procrastination_score: float  # 0-100
    recommended_protocols: list[str]
    insights: list[str]


class DiagnosticReportHistoryItem(DiagnosticReport):
    habits_snapshot: list[dict] = []
    causes_snapshot: list[dict] = []
    created_at: str
