import os
import sys
sys.path.append(os.getcwd())
from database import SessionLocal
from models import User

with SessionLocal() as session:
    users = session.query(User).all()
    print('users count:', len(users))
    for u in users:
        print(u.id, u.email, u.username, (u.password[:60] + '...') if u.password else None)
