"""
PhoneSoftware - Mobile Phone Shop Management System
Standalone FastAPI Application
"""
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from database import init_ps_indexes
from routers.phonesoftware import phonesoftware_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("PhoneSoftware duke u nisur...")
    try:
        await init_ps_indexes()
        logger.info("Indekset e databazes u inicializuan.")
    except Exception as e:
        logger.warning(f"Paralajmerim inicializimi: {e}")
    yield
    logger.info("PhoneSoftware duke u mbyllur.")

app = FastAPI(
    title="PhoneSoftware API",
    description="Mobile Phone Shop Management System",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(phonesoftware_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "PhoneSoftware API eshte aktive", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "ok", "app": "PhoneSoftware"}
