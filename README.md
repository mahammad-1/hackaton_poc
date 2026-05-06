# 🧠 Anti-Procrastination API

Backend Python/FastAPI pour l'application anti-procrastination basée sur les neurosciences.

## Structure du projet

```
antiprocrastination/
├── main.py                    ← Point d'entrée FastAPI
├── requirements.txt
├── data/
│   └── app.db                 ← Base SQLite (créée automatiquement)
├── models/
│   ├── database.py            ← Connexion SQLite + init des tables
│   └── schemas.py             ← Schémas Pydantic (validation)
├── services/
│   └── diagnostic.py          ← Moteur de diagnostic + génération de plans/agenda
└── routers/
    ├── users.py               ← CRUD utilisateurs
    ├── diagnostic.py          ← Habitudes, causes, rapport de diagnostic
    ├── plans.py               ← Plans d'action
    └── agenda.py              ← Agenda dynamique + journal quotidien
```

## Installation & lancement

```bash
# 1. Installer les dépendances
pip install -r requirements.txt

# 2. Lancer le serveur
uvicorn main:app --reload

# 3. Ouvrir la doc interactive
# http://localhost:8000/docs
```

## Flux d'utilisation complet

### Étape 1 — Créer un utilisateur
```bash
POST /users
{
  "name": "Alice",
  "email": "alice@example.com",
  "chronotype": "morning"   # morning / evening / intermediate
}
```

### Étape 2 — Déclarer ses mauvaises habitudes
```bash
POST /users/1/habits
{
  "label": "Je remets les tâches difficiles au lendemain",
  "category": "avoidance",   # avoidance / distraction / perfectionism / decision_delay
  "severity": 4              # 1 (faible) à 5 (sévère)
}
```

### Étape 3 — Identifier les causes de procrastination
```bash
POST /users/1/causes
{
  "cause_type": "fear_failure",   # voir liste ci-dessous
  "description": "Peur de mal faire au travail",
  "trigger_time": "morning",      # morning / afternoon / evening / night
  "trigger_context": "work",      # work / personal / social / administrative
  "frequency": 5                  # 1 (rare) à 5 (quotidien)
}
```

**Types de causes disponibles :**
- `fear_failure` — Peur de l'échec
- `task_aversion` — Aversion à la tâche
- `lack_of_meaning` — Manque de sens
- `decision_overload` — Surcharge décisionnelle
- `anxiety` — Anxiété / stress
- `low_energy` — Faible énergie

### Étape 4 — Obtenir le rapport de diagnostic
```bash
GET /users/1/diagnostic
```
Retourne : score 0-100, cause dominante, moments vulnérables, protocoles recommandés, insights.

### Étape 5 — Générer les plans d'action
```bash
POST /users/1/plans/generate
```
Génère automatiquement des interventions CBT, micro-interventions, exposition graduée selon les causes.

### Étape 6 — Générer l'agenda du jour
```bash
POST /users/1/agenda/generate?target_date=2026-05-06
```
Génère 6 blocs optimisés selon le chronotype et les cycles ultradian (90 min travail / 20 min récup).

### Étape 7 — Journal quotidien
```bash
POST /users/1/logs
{
  "date": "2026-05-06",
  "energy_score": 4,
  "focus_score": 3,
  "mood_score": 4,
  "procrastinated": false,
  "notes": "Bonne journée, j'ai terminé la tâche principale"
}
```

### Étape 8 — Statistiques de progression
```bash
GET /users/1/stats
```

## Endpoints complets

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/users` | Créer un utilisateur |
| GET | `/users/{id}` | Profil utilisateur |
| POST | `/users/{id}/habits` | Ajouter une mauvaise habitude |
| GET | `/users/{id}/habits` | Lister les habitudes |
| POST | `/users/{id}/causes` | Ajouter une cause |
| GET | `/users/{id}/causes` | Lister les causes |
| GET | `/users/{id}/diagnostic` | Rapport de diagnostic |
| POST | `/users/{id}/plans/generate` | Générer les plans automatiquement |
| GET | `/users/{id}/plans` | Lister les plans (`?status=pending`) |
| PATCH | `/users/{id}/plans/{plan_id}` | Mettre à jour le statut |
| POST | `/users/{id}/agenda/generate` | Générer l'agenda du jour |
| GET | `/users/{id}/agenda` | Agenda (`?date=`, `?week=`) |
| PATCH | `/users/{id}/agenda/{block_id}` | Marquer un bloc comme fait |
| POST | `/users/{id}/logs` | Journal quotidien |
| GET | `/users/{id}/logs` | Historique journal |
| GET | `/users/{id}/stats` | Statistiques de progression |

## Bases scientifiques

- **Cycles ultradian** (Kleitman / Huberman) : blocs de 90 min + 20 min récupération
- **Chronobiologie** : placement des tâches selon le pic de cortisol
- **Implementation intentions** (Gollwitzer 1999) : réduction 40-50% de la procrastination
- **Temptation bundling** (Ariely) : association tâche redoutée + plaisir
- **CBT** : restructuration cognitive des croyances limitantes
- **Box breathing** (Huberman Lab) : régulation du système nerveux en 90 secondes

## Prochaines étapes suggérées

1. **Frontend** : React ou Vue.js qui consomme cette API
2. **Auth** : JWT avec python-jose
3. **Notifications** : APScheduler pour les rappels dans les fenêtres cognitives
4. **Intégration Google Calendar** : google-api-python-client
5. **IA** : Appels Claude API pour personnaliser les plans d'action
