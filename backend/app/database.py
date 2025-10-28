import os
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine, Session

#load the .env
load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require"},  # Enforce SSL for Supabase
    pool_pre_ping=True,                   # Check if connection is alive
    pool_recycle=1800,                    # Reconnect every 30 minutes
    pool_size=5,                          # Limit base connections
    max_overflow=10,                      # Allow burst if needed
    echo=False                            # Disable verbose SQL logging in prod
)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
