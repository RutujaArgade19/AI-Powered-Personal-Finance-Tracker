"""Initialize the database — create all tables."""
from database import engine, Base
import models.user  # noqa: F401 — register models
import models.transaction  # noqa: F401

def init():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Done.")

if __name__ == "__main__":
    init()
