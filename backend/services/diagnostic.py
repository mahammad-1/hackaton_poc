"""
Moteur de diagnostic et de génération de plans d'action.
Logique basée sur les recherches en neurosciences comportementales.
"""
from models.schemas import DiagnosticReport

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
                "title": "Définir une version assez bonne",
                "protocol": "cbt",
                "description": (
                    "Avant de commencer, écrivez en une phrase ce que serait un résultat "
                    "assez bon (pas parfait). Cela court-circuite le perfectionnisme "
                    "qui alimente la peur de l'échec."
                ),
                "duration_min": 3,
                "difficulty": 2,
            },
            {
                "title": "Lettre à soi-même après l'échec",
                "protocol": "cbt",
                "description": (
                    "Écrivez une lettre bienveillante à vous-même comme si vous aviez échoué. "
                    "Cet exercice d'auto-compassion réduit l'anticipation anxieuse "
                    "et libère l'énergie bloquée par la peur du jugement."
                ),
                "duration_min": 10,
                "difficulty": 3,
            },
            {
                "title": "Inventaire des réussites passées",
                "protocol": "cbt",
                "description": (
                    "Listez 5 situations où vous avez réussi malgré la peur. "
                    "Le cerveau sous-estime systématiquement ses capacités passées. "
                    "Relire cette liste avant une tâche difficile active la confiance."
                ),
                "duration_min": 7,
                "difficulty": 1,
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
                    "votre café ou thé favori, etc. Le cerveau apprend à anticiper le plaisir."
                ),
                "duration_min": 1,
                "difficulty": 1,
            },
            {
                "title": "Décomposer en actions de 15 min",
                "protocol": "graduated_exposure",
                "description": (
                    "Listez toutes les sous-tâches de 15 min ou moins. "
                    "L'aversion vient souvent de l'opacité, on ne sait pas par où commencer. "
                    "Chaque sous-tâche visible réduit la résistance de 30 à 40% (Ariely, 2010)."
                ),
                "duration_min": 10,
                "difficulty": 2,
            },
            {
                "title": "Changer l'environnement de travail",
                "protocol": "micro_intervention",
                "description": (
                    "Faites la tâche redoutée dans un lieu différent de votre habitude. "
                    "Un nouvel environnement désactive les associations négatives "
                    "que votre cerveau a créées entre le lieu et la tâche."
                ),
                "duration_min": 1,
                "difficulty": 1,
            },
            {
                "title": "Récompense immédiate planifiée",
                "protocol": "reward_loop",
                "description": (
                    "Définissez une récompense concrète et immédiate à vous offrir "
                    "dès la fin de la tâche. La dopamine est libérée à l'anticipation "
                    "de la récompense, pas seulement à sa réception."
                ),
                "duration_min": 2,
                "difficulty": 1,
            },
            {
                "title": "Minuteur visible pendant la tâche",
                "protocol": "micro_intervention",
                "description": (
                    "Placez un minuteur visible affichant le temps restant. "
                    "La visualisation du temps écoulé active le sentiment de progression "
                    "et réduit la résistance au travail de 25% en moyenne."
                ),
                "duration_min": 1,
                "difficulty": 1,
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
                    "(liberté, famille, croissance). Même une connexion indirecte "
                    "augmente la motivation intrinsèque de façon mesurable."
                ),
                "duration_min": 5,
                "difficulty": 2,
            },
            {
                "title": "Identifier le pour qui de la tâche",
                "protocol": "cbt",
                "description": (
                    "Demandez-vous : si je fais ça bien, qui en bénéficie directement ? "
                    "Ancrer une tâche dans un impact humain concret active le cortex "
                    "préfrontal et réduit la procrastination de manière significative."
                ),
                "duration_min": 3,
                "difficulty": 1,
            },
            {
                "title": "Reformuler la tâche en défi personnel",
                "protocol": "cbt",
                "description": (
                    "Transformez la tâche en un défi mesurable. Au lieu de faire le rapport, "
                    "dites écrire le meilleur résumé exécutif en 45 minutes. "
                    "Le cadrage en défi active la motivation compétitive interne."
                ),
                "duration_min": 3,
                "difficulty": 2,
            },
            {
                "title": "Journal du progrès quotidien",
                "protocol": "micro_intervention",
                "description": (
                    "Notez chaque soir une chose concrète accomplie. "
                    "Le cerveau sous-estime le progrès incremental. "
                    "Voir la liste s'allonger crée un sentiment de sens et de momentum."
                ),
                "duration_min": 5,
                "difficulty": 1,
            },
            {
                "title": "Relier la tâche à un objectif de 90 jours",
                "protocol": "cbt",
                "description": (
                    "Écrivez explicitement comment cette tâche contribue à votre objectif "
                    "des 90 prochains jours. Les objectifs à court terme augmentent "
                    "la valeur perçue des tâches ingrates de façon significative."
                ),
                "duration_min": 5,
                "difficulty": 2,
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
                    "La décision est déjà prise le matin. "
                    "Votre capital décisionnel reste intact pour l'exécution."
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
                "duration_min": 1,
                "difficulty": 2,
            },
            {
                "title": "Liste de 3 tâches maximum par jour",
                "protocol": "micro_intervention",
                "description": (
                    "Limitez votre to-do list à 3 tâches par jour maximum. "
                    "Une liste trop longue crée une paralysie par l'analyse. "
                    "3 tâches accomplies valent mieux que 10 tâches abandonnées."
                ),
                "duration_min": 5,
                "difficulty": 1,
            },
            {
                "title": "Blocage des notifications pendant 90 min",
                "protocol": "micro_intervention",
                "description": (
                    "Désactivez toutes les notifications pendant vos blocs de travail. "
                    "Chaque interruption coûte en moyenne 23 minutes de reconcentration "
                    "selon les recherches de Gloria Mark (UC Irvine)."
                ),
                "duration_min": 1,
                "difficulty": 1,
            },
            {
                "title": "Matrice impact versus effort",
                "protocol": "cbt",
                "description": (
                    "Classez vos tâches dans une grille 2x2 : impact fort ou faible "
                    "versus effort fort ou faible. Commencez toujours par les tâches "
                    "à fort impact et faible effort pour générer du momentum rapidement."
                ),
                "duration_min": 10,
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
                    "4 secondes inspiration, 4 secondes blocage, 4 secondes expiration, "
                    "4 secondes blocage. Répétez 4 fois. Active le système nerveux "
                    "parasympathique et réduit le cortisol en 90 secondes "
                    "(Dr Andrew Huberman, Stanford)."
                ),
                "duration_min": 2,
                "difficulty": 1,
            },
            {
                "title": "Implementation intention écrite",
                "protocol": "cbt",
                "description": (
                    "Écrivez la phrase : Quand [situation précise] arrive, je ferai [action] "
                    "à [endroit] pendant [durée]. Les implementation intentions "
                    "réduisent la procrastination de 40 à 50% (Gollwitzer, 1999)."
                ),
                "duration_min": 3,
                "difficulty": 1,
            },
            {
                "title": "Scan corporel de 5 minutes",
                "protocol": "micro_intervention",
                "description": (
                    "Fermez les yeux et parcourez mentalement votre corps de la tête aux pieds. "
                    "Identifiez les zones de tension et relâchez-les consciemment. "
                    "Cette pratique réduit l'activation du système nerveux sympathique."
                ),
                "duration_min": 5,
                "difficulty": 1,
            },
            {
                "title": "Réécrire les pensées catastrophistes",
                "protocol": "cbt",
                "description": (
                    "Notez la pensée anxieuse, puis réécrivez-la avec des preuves concrètes. "
                    "Exemple : Je vais échouer devient J'ai réussi des situations similaires avant. "
                    "La réécriture active le cortex préfrontal et calme l'amygdale."
                ),
                "duration_min": 5,
                "difficulty": 2,
            },
            {
                "title": "Exposition progressive à la tâche",
                "protocol": "graduated_exposure",
                "description": (
                    "Commencez par regarder le document sans obligation de l'éditer. "
                    "Puis lisez une page. Puis annotez. Chaque étape réduit la réponse "
                    "anxieuse par habituation progressive du système nerveux."
                ),
                "duration_min": 5,
                "difficulty": 2,
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
                    "Le pic de cortisol naturel est entre 8h et 10h pour la plupart. "
                    "Planifiez votre tâche la plus difficile dans cette fenêtre. "
                    "Le soir, réservez uniquement les tâches routinières ou créatives légères."
                ),
                "duration_min": 1,
                "difficulty": 1,
            },
            {
                "title": "Micro-sieste stratégique de 20 min",
                "protocol": "reward_loop",
                "description": (
                    "Une sieste de 20 minutes entre 13h et 15h restaure les performances "
                    "cognitives à 95% du niveau matinal. Au-delà de 20 min, "
                    "vous entrez en sommeil profond avec effet contre-productif."
                ),
                "duration_min": 20,
                "difficulty": 1,
            },
            {
                "title": "Marche de 10 minutes avant la tâche",
                "protocol": "micro_intervention",
                "description": (
                    "Une marche de 10 minutes augmente le BDNF (facteur neurotrophique) "
                    "et la noradrénaline, améliorant la concentration et l'énergie "
                    "pendant les 2 heures suivantes (études Stanford, 2014)."
                ),
                "duration_min": 10,
                "difficulty": 1,
            },
            {
                "title": "Hydratation et collation avant le travail",
                "protocol": "micro_intervention",
                "description": (
                    "Une déshydratation de seulement 2% réduit les performances cognitives "
                    "de 10 à 15%. Buvez un grand verre d'eau et mangez une collation "
                    "à faible index glycémique avant chaque bloc de travail intense."
                ),
                "duration_min": 5,
                "difficulty": 1,
            },
            {
                "title": "Luminothérapie matinale de 10 minutes",
                "protocol": "micro_intervention",
                "description": (
                    "Exposez-vous à une lumière vive (soleil ou lampe de luminothérapie) "
                    "dans les 30 minutes après le réveil. Cela synchronise votre horloge "
                    "circadienne et augmente l'énergie disponible sur toute la journée."
                ),
                "duration_min": 10,
                "difficulty": 1,
            },
        ],
    },
}

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


def compute_diagnostic(user_id: int, causes: list, habits: list) -> DiagnosticReport:
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

    cause_scores: dict[str, float] = {}
    for c in causes:
        ct = c["cause_type"]
        cause_scores[ct] = cause_scores.get(ct, 0) + c["frequency"]

    dominant_cause = max(cause_scores, key=cause_scores.get) if cause_scores else None

    habit_scores: dict[str, int] = {}
    for h in habits:
        cat = h["category"]
        habit_scores[cat] = habit_scores.get(cat, 0) + h["severity"]

    dominant_habit = max(habit_scores, key=habit_scores.get) if habit_scores else None

    time_freq: dict[str, int] = {}
    for c in causes:
        if c.get("trigger_time"):
            t = c["trigger_time"]
            time_freq[t] = time_freq.get(t, 0) + c["frequency"]
    vulnerable_time = max(time_freq, key=time_freq.get) if time_freq else None

    ctx_freq: dict[str, int] = {}
    for c in causes:
        if c.get("trigger_context"):
            ctx = c["trigger_context"]
            ctx_freq[ctx] = ctx_freq.get(ctx, 0) + c["frequency"]
    vulnerable_context = max(ctx_freq, key=ctx_freq.get) if ctx_freq else None

    avg_freq = sum(c["frequency"] for c in causes) / len(causes) if causes else 0
    avg_sev = sum(h["severity"] for h in habits) / len(habits) if habits else 0
    raw_score = (avg_freq / 5 * 60) + (avg_sev / 5 * 40)
    score = round(min(raw_score, 100), 1)

    sorted_causes = sorted(cause_scores.items(), key=lambda x: x[1], reverse=True)
    top_causes = [c[0] for c in sorted_causes[:5]]
    protocols: set[str] = set()
    for tc in top_causes:
        if tc in INTERVENTIONS:
            protocols.update(INTERVENTIONS[tc]["protocols"])

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
            "La peur de l'échec est souvent amplifiée par un biais de catastrophisation. "
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
            "Attaquez-les une par une dans l'ordre de leur fréquence, sans tout changer à la fois."
        )

    return insights


def generate_action_plans(user_id: int, causes: list) -> list[dict]:
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

    plans.sort(key=lambda p: p["difficulty"])
    return plans[:15]


def generate_daily_agenda(user_id: int, target_date: str, chronotype: str, plans: list) -> list[dict]:
    import random

    BLOC_POOL = [
        {
            "title": "Travail profond prioritaire",
            "block_type": "deep_work", "energy_level": "high",
            "notes": "Pic de cortisol maximal. Attaquez votre tâche la plus importante. Notifications coupées, téléphone en mode avion.",
        },
        {
            "title": "Récupération cycle ultradian",
            "block_type": "recovery", "energy_level": "low",
            "notes": "Décompression obligatoire après 90 min de focus. Marche courte, étirements ou respiration profonde. Pas d'écran.",
        },
        {
            "title": "Emails, messages et tâches administratives",
            "block_type": "routine", "energy_level": "medium",
            "notes": "Répondez aux messages en attente. Traitez les tâches rapides de moins de 5 minutes. Pas de décisions importantes.",
        },
        {
            "title": "Travail créatif ou brainstorming",
            "block_type": "deep_work", "energy_level": "medium",
            "notes": "Idéal pour la créativité, la rédaction ou la résolution de problèmes complexes.",
        },
        {
            "title": "Pause active et hydratation",
            "block_type": "recovery", "energy_level": "low",
            "notes": "Hydratez-vous, mangez une collation légère. Évitez les réseaux sociaux pendant cette pause.",
        },
        {
            "title": "Déjeuner sans écran",
            "block_type": "recovery", "energy_level": "low",
            "notes": "Repas sans écran pour optimiser la digestion et la récupération cognitive. Privilégiez les protéines et légumes.",
        },
        {
            "title": "Révision, relecture et finitions",
            "block_type": "routine", "energy_level": "medium",
            "notes": "Relisez le travail de la journée, corrigez les erreurs, finalisez les tâches à 90%. Préparez les livrables.",
        },
        {
            "title": "Activité physique",
            "block_type": "recovery", "energy_level": "medium",
            "notes": "30 à 60 min d'exercice. L'activité physique augmente le BDNF et consolide les apprentissages de la journée.",
        },
        {
            "title": "Planification du lendemain et journal",
            "block_type": "routine", "energy_level": "low",
            "notes": "Choisissez UNE seule priorité pour demain. Notez 3 choses accomplies aujourd'hui. Fermez toutes les boucles ouvertes.",
        },
        {
            "title": "Temps personnel et social",
            "block_type": "routine", "energy_level": "low",
            "notes": "Famille, amis, loisirs. Ce bloc est non négociable pour la régénération émotionnelle et la prévention du burn-out.",
        },
        {
            "title": "Marche et exposition à la lumière naturelle",
            "block_type": "recovery", "energy_level": "medium",
            "notes": "20 min de marche à l'extérieur. La lumière naturelle régule le cortisol et améliore l'humeur durablement.",
        },
        {
            "title": "Lecture ou apprentissage",
            "block_type": "routine", "energy_level": "medium",
            "notes": "30 min de lecture dans votre domaine. L'apprentissage continu maintient la plasticité neuronale.",
        },
    ]

    all_slots = {
        "morning": [
            ("07:00", "08:30"), ("09:00", "10:30"), ("11:00", "12:00"),
            ("12:00", "13:00"), ("13:00", "14:00"), ("14:00", "15:30"),
            ("15:30", "16:00"), ("16:00", "17:30"), ("17:30", "18:30"),
            ("18:30", "19:30"), ("19:30", "20:30"), ("20:30", "21:00"),
        ],
        "evening": [
            ("10:00", "11:30"), ("12:00", "13:30"), ("14:00", "15:00"),
            ("15:00", "16:00"), ("16:00", "17:00"), ("17:00", "18:30"),
            ("18:30", "19:00"), ("19:00", "20:30"), ("20:30", "21:30"),
            ("21:30", "22:30"), ("22:30", "23:00"), ("23:00", "23:30"),
        ],
        "intermediate": [
            ("08:30", "10:00"), ("10:30", "12:00"), ("12:30", "13:00"),
            ("13:00", "14:00"), ("14:00", "15:00"), ("15:00", "16:30"),
            ("16:30", "17:00"), ("17:00", "18:30"), ("18:30", "19:30"),
            ("19:30", "20:30"), ("20:30", "21:30"), ("21:30", "22:00"),
        ],
    }

    slots = all_slots.get(chronotype, all_slots["intermediate"])
    chosen_slots = sorted(random.sample(slots, min(5, len(slots))), key=lambda s: s[0])
    shuffled_pool = random.sample(BLOC_POOL, len(BLOC_POOL))

    pending_plans = [p for p in plans if p.get("status") == "pending"]
    random.shuffle(pending_plans)
    plans_to_insert = pending_plans[:2]

    blocks = []
    plan_idx = 0

    for i, (start, end) in enumerate(chosen_slots):
        if plan_idx < len(plans_to_insert):
            p = plans_to_insert[plan_idx]
            plan_idx += 1
            blocks.append({
                "user_id": user_id,
                "plan_id": p.get("id"),
                "title": f"Intervention anti-procrastination : {p['title']}",
                "block_type": "routine",
                "energy_level": "medium",
                "date": target_date,
                "start_time": start,
                "end_time": end,
                "notes": p["description"][:250],
                "done": False,
            })
        else:
            bloc = shuffled_pool[i % len(shuffled_pool)]
            blocks.append({
                "user_id": user_id,
                "plan_id": None,
                "title": bloc["title"],
                "block_type": bloc["block_type"],
                "energy_level": bloc["energy_level"],
                "date": target_date,
                "start_time": start,
                "end_time": end,
                "notes": bloc["notes"],
                "done": False,
            })

    return blocks
