# routes/auth.py
# This file handles everything related to login and register

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, UserLogin, UserResponse, Token
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

# ─── SETUP ────────────────────────────────────────────────────

router = APIRouter()  # this is like a mini FastAPI app just for auth

# bcrypt is used to hash passwords
# hashing = converting password to unreadable string
# Example: "vibin" → "$2b$12$abc123xyz..."
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "syswatch-secret-key-2024"  # secret key to sign tokens
ALGORITHM = "HS256"                       # encryption algorithm
TOKEN_EXPIRE_HOURS = 24                   # token expires after 24 hours

# ─── HELPER FUNCTIONS ─────────────────────────────────────────

# Converts plain password to hashed password
def hash_password(password: str):
    return pwd_context.hash(password)

# Checks if plain password matches hashed password
def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)

# Creates a JWT token for the user
def create_token(email: str):
    expire = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    data = {
        "sub": email,    # subject = who this token belongs to
        "exp": expire    # when it expires
    }
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

# ─── REGISTER ROUTE ───────────────────────────────────────────
# POST /api/auth/register
# User sends: username, email, password
# We save to database and return user info

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):

    # Check if email already exists
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered!"
        )

    # Hash the password before saving
    # NEVER save plain passwords to database!
    hashed = hash_password(user.password)

    # Create new user object
    new_user = User(
        username=user.username,
        email=user.email,
        password=hashed,       # save hashed version
        role=user.role
    )

    # Save to database
    db.add(new_user)
    db.commit()               # actually save it
    db.refresh(new_user)      # get the saved data back

    return new_user

# ─── LOGIN ROUTE ──────────────────────────────────────────────
# POST /api/auth/login
# User sends: email, password
# We check if correct and return a JWT token

@router.post("/login", response_model=Token)
async def login(user: UserLogin, db: Session = Depends(get_db)):

    # Find user by email in database
    db_user = db.query(User).filter(User.email == user.email).first()

    # If user not found OR password wrong → send error
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=401,
            detail="Wrong email or password!"
        )

    # Create JWT token for this user
    token = create_token(db_user.email)

    return {
        "access_token": token,
        "token_type": "bearer"
    }

# ─── GET CURRENT USER ROUTE ───────────────────────────────────
# GET /api/auth/me
# User sends their token
# We send back their profile info

@router.get("/me", response_model=UserResponse)
async def get_me(token: str, db: Session = Depends(get_db)):

    try:
        # Decode the token to get email
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")  # get email from token
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token!"
        )

    # Find user by email
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found!")

    return user