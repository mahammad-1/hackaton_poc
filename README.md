# NeurFlow — Vainquez la procrastination grâce aux neurosciences

> Application web full-stack d'aide à la lutte contre la procrastination,
> basée sur les dernières recherches en neurosciences et biologie humaine.

---

## Vue d'ensemble

NeurFlow analyse vos habitudes, identifie vos causes de procrastination et génère
un plan d'action personnalisé + un agenda quotidien optimisé selon votre chronotype
et vos cycles biologiques.

```
hackaton_poc/
├── backend/          ← API Python / FastAPI + SQLite
└── frontend/         ← Interface React / Vite / Tailwind
```

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Backend | Python 3.12 + FastAPI |
| Base de données | SQLite (via fichier `data/app.db`) |
| Authentification | JWT (python-jose) + hashage Argon2 |
| Validation | Pydantic v2 |
| Frontend | React 18 + Vite |
| Style | Tailwind CSS |
| State | Zustand |
| Routing | React Router v6 |

---

## Installation & lancement

### Prérequis

- Python 3.11+
- Node.js 18+
- Git

---

### Backend

```bash
# 1. Se placer dans le dossier backend
cd backend

# 2. Créer l'environnement virtuel
python3 -m venv venv

# 3. Activer le venv
source venv/bin/activate          # Linux / Mac
# ou
venv\Scripts\activate             # Windows

# 4. Installer les dépendances
pip install -r requirements.txt

# 5. Lancer le serveur
uvicorn main:app --reload --port 8000
```

L'API est disponible sur **http://localhost:8000**
La documentation interactive est sur **http://localhost:8000/docs**

---

### Frontend

```bash
# 1. Se placer dans le dossier frontend
cd frontend

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

L'interface est disponible sur **http://localhost:5173**

>  Le backend doit tourner sur le port 8000 avant de lancer le frontend.

---

## Architecture backend

```
backend/
├── main.py                    ← Point d'entrée FastAPI + CORS
├── dependencies.py            ← Protection des routes (JWT Depends)
├── requirements.txt
├── data/
│   └── app.db                 ← Base SQLite (créée automatiquement)
├── models/
│   ├── database.py            ← Connexion + initialisation des tables
│   └── schemas.py             ← Schémas Pydantic (validation)
├── services/
│   ├── auth.py                ← Hashage Argon2 + génération JWT
│   └── diagnostic.py         ← Moteur de diagnostic + plans d'action + agenda
└── routers/
    ├── auth.py                ← /auth/register, /auth/login, /auth/me
    ├── users.py               ← CRUD utilisateurs
    ├── diagnostic.py          ← Habitudes, causes, rapport de diagnostic
    ├── plans.py               ← Plans d'action (génération + suivi)
    └── agenda.py              ← Agenda dynamique + journal quotidien + stats
```

### Base de données (7 tables)

| Table | Rôle |
|-------|------|
| `users` | Profil utilisateur + chronotype + mot de passe hashé |
| `bad_habits` | Mauvaises habitudes déclarées |
| `procrastination_causes` | Causes identifiées avec moment et contexte |
| `action_plans` | Plans d'action générés avec protocole et statut |
| `agenda_blocks` | Blocs de temps quotidiens optimisés |
| `daily_logs` | Journal quotidien (énergie, focus, humeur) |
| `habit_streaks` | Suivi des séries de jours sans procrastination |

---

## Endpoints API

### Authentification
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/register` | Créer un compte |
| POST | `/auth/login` | Se connecter, reçoit un token JWT |
| GET | `/auth/me` | Profil de l'utilisateur connecté |

### Diagnostic
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/users/{id}/habits` | Ajouter une mauvaise habitude |
| GET | `/users/{id}/habits` | Lister les habitudes |
| POST | `/users/{id}/causes` | Ajouter une cause de procrastination |
| GET | `/users/{id}/causes` | Lister les causes |
| GET | `/users/{id}/diagnostic` | Rapport complet (score, insights, protocoles) |

### Plans d'action
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/users/{id}/plans/generate` | Générer les plans automatiquement |
| GET | `/users/{id}/plans` | Lister les plans (`?status=pending`) |
| PATCH | `/users/{id}/plans/{plan_id}` | Mettre à jour le statut |

### Agenda
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/users/{id}/agenda/generate` | Générer l'agenda du jour (`?target_date=YYYY-MM-DD`) |
| GET | `/users/{id}/agenda` | Agenda (`?date=` ou `?week=`) |
| PATCH | `/users/{id}/agenda/{block_id}` | Marquer un bloc comme terminé |

### Journal & Stats
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/users/{id}/logs` | Enregistrer le journal du jour |
| GET | `/users/{id}/logs` | Historique des journaux |
| GET | `/users/{id}/stats` | Statistiques globales (streaks, scores, taux) |

---

## Flux utilisateur complet

```
1. /auth/register         → Créer un compte
2. /auth/login            → Récupérer le token JWT
3. POST /habits           → Déclarer ses mauvaises habitudes
4. POST /causes           → Identifier les causes de procrastination
5. GET  /diagnostic       → Lire le rapport personnalisé
6. POST /plans/generate   → Générer les plans d'action
7. POST /agenda/generate  → Générer l'agenda du jour
8. POST /logs             → Remplir le journal chaque soir
9. GET  /stats            → Suivre sa progression
```

---

## Architecture frontend

```
frontend/src/
├── main.jsx
├── App.jsx
├── api/
│   └── client.js          ← fetch wrapper (BASE_URL + headers JWT)
├── store/
│   └── useAppStore.js     ← Zustand : user, token, plans, agenda
├── pages/
│   ├── Auth.jsx           ← Login / Register
│   ├── Home.jsx           ← Page d'accueil
│   ├── Onboarding.jsx     ← Création du profil + chronotype
│   ├── Diagnostic.jsx     ← Saisie habitudes + causes + rapport
│   ├── Plans.jsx          ← Plans d'action + statut
│   ├── Agenda.jsx         ← Vue jour / semaine avec blocs d'énergie
│   └── Dashboard.jsx      ← Stats, streaks, progression
├── components/
│   ├── Layout.jsx         ← Navigation + sidebar
│   ├── EnergyBlock.jsx    ← Bloc agenda coloré (vert/orange/rouge)
│   ├── HabitCard.jsx      ← Carte habitude avec sévérité
│   ├── CauseForm.jsx      ← Formulaire cause
│   ├── PlanCard.jsx       ← Carte plan + bouton compléter
│   └── ScoreGauge.jsx     ← Jauge score procrastination 0-100
└── hooks/
    ├── useUser.js
    ├── useDiagnostic.js
    └── useAgenda.js
```

---

## Bases scientifiques

| Concept | Source | Application dans NeurFlow |
|---------|--------|--------------------------|
| Cycles ultradian 90 min | Kleitman / Huberman Lab | Blocs de travail de 90 min + 20 min récupération |
| Pic de cortisol matinal | Chronobiologie | Tâches difficiles placées entre 8h-10h |
| Implementation intentions | Gollwitzer (1999) | Réduction 40-50% de la procrastination |
| Temptation bundling | Ariely | Association tâche redoutée + plaisir |
| Restructuration cognitive | CBT / Beck | Protocole peur de l'échec |
| Box breathing | Huberman Lab (Stanford) | Régulation nerveuse en 90 secondes |
| État de flow | Csikszentmihalyi | Calibrage défi / compétence des tâches |
| Fatigue décisionnelle | Baumeister | Décision des priorités la veille au soir |

---

## Résolution des problèmes courants

**Erreur CORS (frontend bloqué)**
```python
# Dans backend/main.py, vérifier :
allow_origins=["http://localhost:5173"]
```

**`externally-managed-environment` à l'installation pip**
```bash
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

**`venv/bin/python3: aucun fichier` (venv corrompu)**
```bash
rm -rf venv
python3 -m venv venv
venv/bin/pip install -r requirements.txt
```

**Crochets zsh avec pip install**
```bash
# Mettre les noms de packages entre guillemets
pip install "python-jose[cryptography]" "passlib[bcrypt]"
```

---

## Équipe

**NeurFlow** — Hackathon 2026