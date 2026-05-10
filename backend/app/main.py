from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import dashboard, orders, products, shipments, system, tasks

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SmartFlow AI",
    description="KOBİ ve kooperatifler için yapay zeka operasyon asistanı.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(system.router)
app.include_router(orders.router)
app.include_router(products.router)
app.include_router(shipments.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)
