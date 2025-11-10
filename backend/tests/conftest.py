"""
Pytest configuration and shared fixtures for all tests
"""
import pytest
import os
from typing import Generator
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool


@pytest.fixture(scope="session", autouse=True)
def setup_test_env():
    """Set up test environment variables"""
    os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only"
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    os.environ["EMAIL_ENABLED"] = "false"
    yield
    # Cleanup after all tests


@pytest.fixture(name="test_engine")
def test_engine_fixture():
    """Create a test database engine"""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture(name="session")
def session_fixture(test_engine) -> Generator[Session, None, None]:
    """Create a test database session"""
    with Session(test_engine) as session:
        yield session
        session.rollback()


def pytest_configure(config):
    """Configure pytest with custom settings"""
    config.addinivalue_line(
        "markers", "unit: mark test as a unit test"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as an integration test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )
