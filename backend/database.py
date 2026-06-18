# database.py
# This file creates the connection between FastAPI and MySQL

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Connection string — tells Python how to connect to MySQL
# Format: mysql+pymysql://username:password@host:port/database_name
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:vibin@localhost:3306/syswatch"
)

# This creates the actual connection to MySQL
connect_args = {}
if "aivencloud.com" in DATABASE_URL:
    connect_args = {"ssl": {"fake_flag_to_enable_tls": True}}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

# SessionLocal is used to run queries on the database
# Every API request gets its own fresh session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# All our database table classes will inherit from Base
Base = declarative_base()

# This function gives a database session to each API route
def get_db():
    db = SessionLocal()  # open a new session
    try:
        yield db         # give session to the route that needs it
    finally:
        db.close()       # close session when request is done