import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app import main
from app.database import get_db


@pytest.fixture
def client(monkeypatch):
    """Give each test its own database and run the real FastAPI lifespan."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    monkeypatch.setattr(main, "engine", engine)

    def test_db():
        with Session(engine) as session:
            yield session

    previous_overrides = main.app.dependency_overrides.copy()
    main.app.dependency_overrides[get_db] = test_db
    try:
        with TestClient(main.app) as test_client:
            yield test_client
    finally:
        main.app.dependency_overrides = previous_overrides
        engine.dispose()
