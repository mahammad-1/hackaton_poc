from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.database import init_db
from routers import users, diagnostic, plans, agenda

app = FastAPI(
    title="Anti-Procrastination API",
    description=(
        "Backend de l'application anti-procrastination basé sur les neurosciences "
        "et la biologie humaine. Diagnostic comportemental, plans d'action CBT, "
        "agenda neurobiologique synchronisé."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialiser la base de données au démarrage
@app.on_event("startup")
def on_startup():
    init_db()

# Inclure tous les routers
app.include_router(users.router)
app.include_router(diagnostic.router)
app.include_router(plans.router)
app.include_router(agenda.router)

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "app": "Anti-Procrastination API",
        "version": "1.0.0",
        "docs": "/docs",
    }

@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
