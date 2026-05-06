"""
Moteur de diagnostic et de génération de plans d'action.
Logique basée sur les recherches en neurosciences comportementales.
"""
from models.schemas import DiagnosticReport

# ─── TAXONOMIE DES INTERVENTIONS ──────────────────────────
# Pour chaque type de cause, on associe des protocoles et des actions concrètes

INTERVENTIONS = {
    "fear_failure": {
        "protocols": ["cbt", "graduated_exposure"],
        "actions": [
            {
                "title": "Écrire le pire scénario possible",
                "protocol": "cbt",
                "description": (
                    "Prenez 5 min pour écrire le pire résultat imaginable si vous échouez. "
                    "Puis évaluez honnêtement la probabilité réelle. La peur de l'échec "
                    "survit rarement à une analyse rationnelle écrite."
                ),
                "duration_min": 5,
                "difficulty": 2,
            },
            {
                "title": "Commencer par 2 minutes chrono",
                "protocol": "micro_intervention",
                "description": (
                    "Réglez un minuteur sur 2 minutes et commencez la tâche redoutée. "
                    "Votre seul engagement : tenir 2 minutes. Le cerveau, une fois en mouvement, "
                    "continue souvent naturellement (loi de Newton comportementale)."
                ),
                "duration_min": 2,
                "difficulty": 1,
            },
            {
                "title": "Définir une 'version assez bonne'",
                "protocol": "cbt",
                "description": (
                    "Avant de commencer, écrivez en une phrase ce que serait un résultat "
                    "'assez bon' (pas parfait). Cela court-circuite le perfectionnisme "
                    "qui alimente la peur de l'échec."
                ),
                "duration_min": 3,
                "difficulty": 2,
            },
        ],
    },
    "task_aversion": {
        "protocols": ["micro_intervention", "reward_loop"],
        "actions": [
            {
                "title": "Technique de temptation bundling",
                "protocol": "reward_loop",
                "description": (
                    "Associez la tâche détestée à quelque chose que vous aimez : "
                    "écouter votre podcast préféré uniquement pendant cette tâche, "
                    "votre café/thé favori, etc. Le cerveau apprend à anticiper le plaisir."
                ),
                "duration_min": 0,
                "difficulty": 1,
            },
            {
                "title": "Décomposer en actions de 15 min",
                "protocol": "graduated_exposure",
                "description": (
                    "Listez toutes les sous-tâches de 15 min ou moins. "
                    "L'aversion vient souvent de l'opacité — on ne sait pas par où commencer. "
                    "Chaque sous-tâche visible réduit la résistance de 30-40% (Ariely, 2010)."
                ),
                "duration_min": 10,
                "difficulty": 2,
            },
        ],
    },
    "lack_of_meaning": {
        "protocols": ["cbt", "micro_intervention"],
        "actions": [
            {
                "title": "Exercice de connexion aux valeurs",
                "protocol": "cbt",
                "description": (
                    "Écrivez comment cette tâche se connecte à une valeur importante pour vous "
                    "(liberté, famille, croissance...). Même une connexion indirecte "
                    "augmente la motivation intrinsèque de façon mesurable."
                ),
                "duration_min": 5,
                "difficulty": 2,
            },
            {
                "title": "Identifier le 'pour qui' de la tâche",
                "protocol": "cbt",
                "description": (
                    "Demandez-vous : si je fais ça bien, qui en bénéficie directement ? "
                    "Ancrer une tâche dans un impact humain concret active le cortex "
                    "préfrontal et réduit la procrastination de manière significative."
                ),
                "duration_min": 3,
                "difficulty": 1,
            },
        ],
    },
    "decision_overload": {
        "protocols": ["micro_intervention", "cbt"],
        "actions": [
            {
                "title": "Règle du choix unique",
                "protocol": "micro_intervention",
                "description": (
                    "Pour chaque session, choisissez UNE seule tâche prioritaire la veille au soir. "
                    "La décision est déjà prise le matin. Eliminates decision fatigue — "
                    "votre capital décisionnel reste intact pour l'exécution."
                ),
                "duration_min": 5,
                "difficulty": 1,
            },
            {
                "title": "Créer des routines ritualisées",
                "protocol": "micro_intervention",
                "description": (
                    "Définissez un rituel de démarrage identique chaque jour : "
                    "même heure, même lieu, même séquence de 3 actions. "
                    "Les rituels automatisent le début du travail et court-circuitent "
                    "la résistance décisionnelle."
                ),
                "duration_min": 0,
                "difficulty": 2,
            },
        ],
    },
    "anxiety": {
        "protocols": ["cbt", "graduated_exposure"],
        "actions": [
            {
                "title": "Box breathing avant la tâche",
                "protocol": "micro_intervention",
                "description": (
                    "4 secondes inspiration — 4 secondes blocage — 4 secondes expiration — "
                    "4 secondes blocage. Répétez 4 fois. Active le système nerveux "
                    "parasympathique et réduit le cortisol de façon mesurable en 90 secondes "
                    "(Dr Andrew Huberman, Stanford)."
                ),
                "duration_min": 2,
                "difficulty": 1,
            },
            {
                "title": "Implementation intention écrite",
                "protocol": "cbt",
                "description": (
                    "Écrivez la phrase : 'Quand [situation précise] arrive, je ferai [action] "
                    "à [endroit] pendant [durée].' Les implementation intentions "
                    "réduisent la procrastination de 40-50% (Gollwitzer, 1999)."
                ),
                "duration_min": 3,
                "difficulty": 1,
            },
        ],
    },
    "low_energy": {
        "protocols": ["micro_intervention", "reward_loop"],
        "actions": [
            {
                "title": "Aligner les tâches sur le pic de cortisol",
                "protocol": "micro_intervention",
                "description": (
                    "Le cortisol peak naturel est entre 8h et 10h pour la plupart. "
                    "Planifiez votre tâche la plus difficile dans cette fenêtre. "
                    "Le soir, réservez uniquement les tâches routinières ou créatives légères."
                ),
                "duration_min": 0,
                "difficulty": 1,
            },
            {
                "title": "Micro-sieste stratégique de 20 min",
                "protocol": "reward_loop",
                "description": (
                    "Une sieste de 20 minutes entre 13h et 15h restaure les performances "
                    "cognitives à 95% du niveau matinal. Au-delà de 20 min, "
                    "vous entrez en sommeil profond — effet contre-productif."
                ),
                "duration_min": 20,
                "difficulty": 1,
            },
        ],
    },
}

# ─── LABELS LISIBLES ──────────────────────────────────────
CAUSE_LABELS = {
    "fear_failure": "Peur de l'échec",
    "task_aversion": "Aversion à la tâche",
    "lack_of_meaning": "Manque de sens",
    "decision_overload": "Surcharge décisionnelle",
    "anxiety": "Anxiété / stress",
    "low_energy": "Faible énergie",
}

HABIT_LABELS = {
    "avoidance": "Évitement",
    "distraction": "Distractibilité",
    "perfectionism": "Perfectionnisme paralysant",
    "decision_delay": "Report de décision",
}

TIME_LABELS = {
    "morning": "le matin",
    "afternoon": "l'après-midi",
    "evening": "le soir",
    "night": "la nuit",
}

CONTEXT_LABELS = {
    "work": "au travail",
    "personal": "personnel",
    "social": "social",
    "administrative": "administratif",
}


# ─── MOTEUR DE DIAGNOSTIC ─────────────────────────────────

def compute_diagnostic(user_id: int, causes: list, habits: list) -> DiagnosticReport:
    """
    Génère un rapport de diagnostic basé sur les causes et habitudes déclarées.
    Calcule un score de procrastination et recommande des protocoles.
    """
    if not causes and not habits:
        return DiagnosticReport(
            user_id=user_id,
            dominant_cause=None,
            dominant_habit_category=None,
            most_vulnerable_time=None,
            most_vulnerable_context=None,
            procrastination_score=0.0,
            recommended_protocols=[],
            insights=["Commencez par renseigner vos habitudes et causes de procrastination."],
        )

    # Cause dominante (fréquence × pondération)
    cause_scores: dict[str, float] = {}
    for c in causes:
        ct = c["cause_type"]
        cause_scores[ct] = cause_scores.get(ct, 0) + c["frequency"]

    dominant_cause = max(cause_scores, key=cause_scores.get) if cause_scores else None

    # Catégorie d'habitude dominante (sévérité)
    habit_scores: dict[str, int] = {}
    for h in habits:
        cat = h["category"]
        habit_scores[cat] = habit_scores.get(cat, 0) + h["severity"]

    dominant_habit = max(habit_scores, key=habit_scores.get) if habit_scores else None

    # Moment le plus vulnérable
    time_freq: dict[str, int] = {}
    for c in causes:
        if c.get("trigger_time"):
            t = c["trigger_time"]
            time_freq[t] = time_freq.get(t, 0) + c["frequency"]
    vulnerable_time = max(time_freq, key=time_freq.get) if time_freq else None

    # Contexte le plus vulnérable
    ctx_freq: dict[str, int] = {}
    for c in causes:
        if c.get("trigger_context"):
            ctx = c["trigger_context"]
            ctx_freq[ctx] = ctx_freq.get(ctx, 0) + c["frequency"]
    vulnerable_context = max(ctx_freq, key=ctx_freq.get) if ctx_freq else None

    # Score de procrastination (0-100)
    avg_freq = sum(c["frequency"] for c in causes) / len(causes) if causes else 0
    avg_sev = sum(h["severity"] for h in habits) / len(habits) if habits else 0
    raw_score = (avg_freq / 5 * 60) + (avg_sev / 5 * 40)
    score = round(min(raw_score, 100), 1)

    # Protocoles recommandés (union des protocoles pour les 2 causes principales)
    sorted_causes = sorted(cause_scores.items(), key=lambda x: x[1], reverse=True)
    top_causes = [c[0] for c in sorted_causes[:2]]
    protocols: set[str] = set()
    for tc in top_causes:
        if tc in INTERVENTIONS:
            protocols.update(INTERVENTIONS[tc]["protocols"])

    # Insights générés
    insights = _generate_insights(
        dominant_cause, dominant_habit, vulnerable_time,
        vulnerable_context, score, len(causes), len(habits)
    )

    return DiagnosticReport(
        user_id=user_id,
        dominant_cause=CAUSE_LABELS.get(dominant_cause) if dominant_cause else None,
        dominant_habit_category=HABIT_LABELS.get(dominant_habit) if dominant_habit else None,
        most_vulnerable_time=TIME_LABELS.get(vulnerable_time) if vulnerable_time else None,
        most_vulnerable_context=CONTEXT_LABELS.get(vulnerable_context) if vulnerable_context else None,
        procrastination_score=score,
        recommended_protocols=list(protocols),
        insights=insights,
    )


def _generate_insights(cause, habit, time_slot, context, score, n_causes, n_habits) -> list[str]:
    insights = []

    if score >= 70:
        insights.append(
            "Votre profil indique une procrastination chronique intense. "
            "Commencez par une seule intervention pendant 7 jours avant d'en ajouter."
        )
    elif score >= 40:
        insights.append(
            "Procrastination modérée mais régulière. "
            "2 à 3 micro-interventions quotidiennes suffiront à créer un changement mesurable."
        )
    else:
        insights.append(
            "Procrastination légère. Quelques ajustements d'agenda suffisent généralement."
        )

    if cause == "fear_failure":
        insights.append(
            "La peur de l'échec est souvent amplifiée par un 'biais de catastrophisation'. "
            "La restructuration cognitive CBT est l'intervention la plus efficace documentée."
        )
    elif cause == "task_aversion":
        insights.append(
            "L'aversion à la tâche déclenche les mêmes circuits neuronaux que la douleur physique "
            "(Hsin Hsin Chang, 2012). Le temptation bundling neutralise cette réponse."
        )
    elif cause == "decision_overload":
        insights.append(
            "La fatigue décisionnelle réduit la qualité de vos choix jusqu'à 40% en fin de journée. "
            "Décidez vos priorités du lendemain la veille au soir."
        )

    if time_slot:
        time_label = TIME_LABELS.get(time_slot, time_slot)
        insights.append(
            f"Vous procrastinez principalement {time_label}. "
            "Évitez de planifier vos tâches difficiles à cette période."
        )

    if n_causes >= 3:
        insights.append(
            f"Vous avez identifié {n_causes} causes distinctes. "
            "Attaquez-les une par une dans l'ordre de leur fréquence — ne changez pas tout à la fois."
        )

    return insights


# ─── GÉNÉRATEUR DE PLANS D'ACTION ─────────────────────────

def generate_action_plans(user_id: int, causes: list) -> list[dict]:
    """
    Pour chaque cause identifiée, génère les actions concrètes recommandées.
    Ordonnées par difficulté croissante (commencer par le plus accessible).
    """
    plans = []
    seen_titles: set[str] = set()

    sorted_causes = sorted(causes, key=lambda c: c["frequency"], reverse=True)

    for cause in sorted_causes:
        ct = cause["cause_type"]
        if ct not in INTERVENTIONS:
            continue

        for action in INTERVENTIONS[ct]["actions"]:
            if action["title"] in seen_titles:
                continue
            seen_titles.add(action["title"])

            plans.append({
                "user_id": user_id,
                "cause_id": cause["id"],
                "title": action["title"],
                "protocol": action["protocol"],
                "description": action["description"],
                "duration_min": action["duration_min"],
                "difficulty": action["difficulty"],
                "status": "pending",
            })

    # Trier par difficulté croissante
    plans.sort(key=lambda p: p["difficulty"])
    return plans


# ─── GÉNÉRATEUR D'AGENDA NEUROBIOLOGIQUE ──────────────────

def generate_daily_agenda(user_id: int, target_date: str, chronotype: str, plans: list) -> list[dict]:
    """
    Génère des blocs d'agenda optimisés selon le chronotype et les recherches
    sur les cycles ultradian (90 min travail / 20 min récup).
    """
    blocks = []

    # Fenêtres selon chronotype
    windows = {
        "morning": {
            "peak1": ("07:00", "08:30"),
            "mid1":  ("09:00", "10:30"),
            "trough":("13:00", "14:00"),
            "peak2": ("15:00", "16:30"),
            "wind":  ("19:00", "20:00"),
        },
        "evening": {
            "peak1": ("10:00", "11:30"),
            "mid1":  ("14:00", "15:30"),
            "trough":("16:00", "17:00"),
            "peak2": ("19:00", "20:30"),
            "wind":  ("22:00", "23:00"),
        },
        "intermediate": {
            "peak1": ("08:30", "10:00"),
            "mid1":  ("10:30", "12:00"),
            "trough":("13:30", "14:30"),
            "peak2": ("16:00", "17:30"),
            "wind":  ("20:00", "21:00"),
        },
    }

    w = windows.get(chronotype, windows["intermediate"])

    # Bloc 1 — Travail profond (pic cortisol)
    blocks.append({
        "user_id": user_id,
        "plan_id": None,
        "title": "🧠 Bloc de travail profond — Tâche prioritaire",
        "block_type": "deep_work",
        "energy_level": "high",
        "date": target_date,
        "start_time": w["peak1"][0],
        "end_time": w["peak1"][1],
        "notes": "Pic de cortisol — idéal pour la tâche la plus difficile. Notifications coupées.",
        "done": False,
    })

    # Bloc 2 — Récupération (cycle ultradian)
    blocks.append({
        "user_id": user_id,
        "plan_id": None,
        "title": "☕ Récupération — Cycle ultradian",
        "block_type": "recovery",
        "energy_level": "low",
        "date": target_date,
        "start_time": w["peak1"][1],
        "end_time": w["mid1"][0],
        "notes": "20 min de décompression obligatoire après 90 min de focus.",
        "done": False,
    })

    # Bloc 3 — Action anti-procrastination #1 (si disponible)
    pending_plans = [p for p in plans if p.get("status") == "pending"]
    if pending_plans:
        plan = pending_plans[0]
        blocks.append({
            "user_id": user_id,
            "plan_id": plan.get("id"),
            "title": f"✅ Anti-procra : {plan['title']}",
            "block_type": "routine",
            "energy_level": "medium",
            "date": target_date,
            "start_time": w["mid1"][0],
            "end_time": w["mid1"][1],
            "notes": plan["description"][:200],
            "done": False,
        })

    # Bloc 4 — Creux post-déjeuner (tâches légères)
    blocks.append({
        "user_id": user_id,
        "plan_id": None,
        "title": "📧 Tâches routinières (mails, admin)",
        "block_type": "routine",
        "energy_level": "low",
        "date": target_date,
        "start_time": w["trough"][0],
        "end_time": w["trough"][1],
        "notes": "Creux circadien — éviter toute tâche cognitive complexe ou décision importante.",
        "done": False,
    })

    # Bloc 5 — Second pic (travail créatif ou second plan)
    if len(pending_plans) > 1:
        plan2 = pending_plans[1]
        blocks.append({
            "user_id": user_id,
            "plan_id": plan2.get("id"),
            "title": f"✅ Anti-procra : {plan2['title']}",
            "block_type": "routine",
            "energy_level": "medium",
            "date": target_date,
            "start_time": w["peak2"][0],
            "end_time": w["peak2"][1],
            "notes": plan2["description"][:200],
            "done": False,
        })
    else:
        blocks.append({
            "user_id": user_id,
            "plan_id": None,
            "title": "🎨 Second pic — Travail créatif ou réflexion",
            "block_type": "deep_work",
            "energy_level": "medium",
            "date": target_date,
            "start_time": w["peak2"][0],
            "end_time": w["peak2"][1],
            "notes": "Second pic énergétique — idéal pour brainstorming ou relecture.",
            "done": False,
        })

    # Bloc 6 — Wind down / planification du lendemain
    blocks.append({
        "user_id": user_id,
        "plan_id": None,
        "title": "📋 Planification du lendemain",
        "block_type": "routine",
        "energy_level": "low",
        "date": target_date,
        "start_time": w["wind"][0],
        "end_time": w["wind"][1],
        "notes": "Choisir UNE seule priorité pour demain. Fermer les boucles ouvertes.",
        "done": False,
    })

    return blocks
