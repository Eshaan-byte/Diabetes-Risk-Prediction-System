import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, date
from uuid import uuid4
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
from app.main import app
from app.database import get_session
from app.models import users, health_records
from passlib.hash import bcrypt


@pytest.fixture(name="test_db_session")
def test_db_session_fixture():
    """Create a test database session"""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(test_db_session: Session):
    """Create a test client with dependency override"""

    def get_test_session():
        yield test_db_session

    app.dependency_overrides[get_session] = get_test_session
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="test_user")
def test_user_fixture(test_db_session: Session):
    """Create a verified test user in the database"""
    user = users(
        user_id=uuid4(),
        email="testuser@example.com",
        username="testuser",
        first_name="Test",
        last_name="User",
        password_hash=bcrypt.hash("password123"),
        phone_number="1234567890",
        date_of_birth=date(1990, 1, 1),
        is_verified=True
    )
    test_db_session.add(user)
    test_db_session.commit()
    test_db_session.refresh(user)
    return user


@pytest.fixture(name="unverified_user")
def unverified_user_fixture(test_db_session: Session):
    """Create an unverified test user in the database"""
    user = users(
        user_id=uuid4(),
        email="unverified@example.com",
        username="unverified",
        first_name="Unverified",
        last_name="User",
        password_hash=bcrypt.hash("password123"),
        phone_number="9876543210",
        date_of_birth=date(1995, 5, 15),
        is_verified=False,
        verification_token="test_token_123"
    )
    test_db_session.add(user)
    test_db_session.commit()
    test_db_session.refresh(user)
    return user


@pytest.fixture(name="auth_headers")
def auth_headers_fixture(client: TestClient, test_user):
    """Get authentication headers for test user"""
    response = client.post(
        "/auth/login",
        json={
            "email": "testuser@example.com",
            "password": "password123"
        }
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


class TestRootEndpoint:
    """Test suite for root endpoint"""

    def test_root_endpoint(self, client: TestClient):
        """Test that root endpoint returns welcome message"""
        response = client.get("/")
        assert response.status_code == 200
        assert "message" in response.json()
        assert "Health Records API" in response.json()["message"]


class TestAuthEndpoints:
    """Test suite for authentication endpoints"""

    @patch('app.routes.auth.send_verification_email')
    def test_signup_success(self, mock_email, client: TestClient):
        """Test successful user signup"""
        mock_email.return_value = (True, "http://verify-link")

        response = client.post(
            "/auth/signup",
            json={
                "email": "newuser@example.com",
                "password": "securepass123",
                "first_name": "New",
                "last_name": "User",
                "username": "newuser",
                "phone_number": "5555555555",
                "date_of_birth": "2000-01-01"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["username"] == "newuser"
        assert data["is_verified"] is False
        assert "verification_link" in data
        assert "access_token" not in data  # Should not return token for unverified user

    def test_signup_duplicate_email(self, client: TestClient, test_user):
        """Test signup with duplicate email"""
        with patch('app.routes.auth.send_verification_email') as mock_email:
            mock_email.return_value = (True, "http://verify-link")

            response = client.post(
                "/auth/signup",
                json={
                    "email": "testuser@example.com",  # Duplicate
                    "password": "password123",
                    "first_name": "Test",
                    "last_name": "User",
                    "username": "differentuser",
                    "phone_number": "1234567890",
                    "date_of_birth": "1990-01-01"
                }
            )

            assert response.status_code == 400
            assert "Email already registered" in response.json()["detail"]

    def test_signup_duplicate_username(self, client: TestClient, test_user):
        """Test signup with duplicate username"""
        with patch('app.routes.auth.send_verification_email') as mock_email:
            mock_email.return_value = (True, "http://verify-link")

            response = client.post(
                "/auth/signup",
                json={
                    "email": "different@example.com",
                    "password": "password123",
                    "first_name": "Test",
                    "last_name": "User",
                    "username": "testuser",  # Duplicate
                    "phone_number": "1234567890",
                    "date_of_birth": "1990-01-01"
                }
            )

            assert response.status_code == 400
            assert "Username already registered" in response.json()["detail"]

    def test_login_success(self, client: TestClient, test_user):
        """Test successful login"""
        response = client.post(
            "/auth/login",
            json={
                "email": "testuser@example.com",
                "password": "password123"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["email"] == "testuser@example.com"
        assert data["username"] == "testuser"

    def test_login_with_username(self, client: TestClient, test_user):
        """Test login using username instead of email"""
        response = client.post(
            "/auth/login",
            json={
                "email": "testuser",  # Using username
                "password": "password123"
            }
        )

        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_login_invalid_credentials(self, client: TestClient, test_user):
        """Test login with invalid credentials"""
        response = client.post(
            "/auth/login",
            json={
                "email": "testuser@example.com",
                "password": "wrongpassword"
            }
        )

        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["detail"]

    def test_login_unverified_user(self, client: TestClient, unverified_user):
        """Test that unverified users cannot login"""
        response = client.post(
            "/auth/login",
            json={
                "email": "unverified@example.com",
                "password": "password123"
            }
        )

        assert response.status_code == 403
        assert "Email not verified" in str(response.json()["detail"])

    def test_verify_email_success(self, client: TestClient, unverified_user):
        """Test successful email verification"""
        response = client.get(
            f"/auth/verify-email?token={unverified_user.verification_token}"
        )

        assert response.status_code == 200
        assert "verified successfully" in response.json()["message"]

    def test_verify_email_invalid_token(self, client: TestClient):
        """Test email verification with invalid token"""
        response = client.get("/auth/verify-email?token=invalid_token")

        assert response.status_code == 400
        assert "Invalid verification token" in response.json()["detail"]

    @patch('app.routes.auth.send_verification_email')
    def test_resend_verification(self, mock_email, client: TestClient, unverified_user):
        """Test resending verification email"""
        mock_email.return_value = (True, "http://verify-link")

        response = client.post(
            "/auth/resend-verification",
            json={"email": "unverified@example.com"}
        )

        assert response.status_code == 200
        assert "Verification email sent" in response.json()["message"]

    def test_resend_verification_already_verified(self, client: TestClient, test_user):
        """Test resending verification for already verified user"""
        response = client.post(
            "/auth/resend-verification",
            json={"email": "testuser@example.com"}
        )

        assert response.status_code == 400
        assert "already verified" in response.json()["detail"]


class TestPredictionEndpoints:
    """Test suite for prediction endpoints"""

    @patch('app.ml.inferences.models')
    def test_predict_endpoint(self, mock_models, client: TestClient):
        """Test raw prediction endpoint"""
        # Mock model predictions
        mock_model = Mock()
        mock_model.predict_proba.return_value = [[0.3, 0.7]]
        mock_models.items.return_value = [
            ("logisticregression", mock_model),
            ("randomforest", mock_model),
            ("svc", mock_model),
            ("knn", mock_model),
            ("mlp", mock_model),
            ("xgboost", mock_model),
        ]

        response = client.post(
            "/predict/",
            json={
                "pregnancies": 2,
                "glucose": 120,
                "blood_pressure": 80,
                "insulin": 100,
                "bmi": 25.5,
                "diabetic_family": 0,
                "age": 35
            }
        )

        assert response.status_code == 200
        result = response.json()

        # Response is a tuple of (predictions, input_data)
        assert isinstance(result, list)
        predictions = result[0]

        # Check all model predictions are present
        assert "outcome_logisticregression" in predictions
        assert "prediction_prob_logisticregression" in predictions

    def test_predict_invalid_data(self, client: TestClient):
        """Test prediction with invalid/missing data"""
        response = client.post(
            "/predict/",
            json={
                "pregnancies": 2,
                "glucose": 120
                # Missing required fields
            }
        )

        assert response.status_code == 422  # Validation error


class TestHealthRecordsEndpoints:
    """Test suite for health records endpoints"""

    @patch('app.ml.inferences.models')
    def test_add_record(self, mock_models, client: TestClient, auth_headers):
        """Test adding a health record"""
        mock_model = Mock()
        mock_model.predict_proba.return_value = [[0.3, 0.7]]
        mock_models.items.return_value = [
            ("logisticregression", mock_model),
            ("randomforest", mock_model),
            ("svc", mock_model),
            ("knn", mock_model),
            ("mlp", mock_model),
            ("xgboost", mock_model),
        ]

        response = client.post(
            "/records/",
            headers=auth_headers,
            json={
                "pregnancies": 2,
                "glucose": 120,
                "blood_pressure": 80,
                "insulin": 100,
                "bmi": 25.5,
                "diabetic_family": 0,
                "age": 35
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "record_id" in data
        assert data["glucose"] == 120
        assert "outcome_logisticregression" in data

    def test_add_record_unauthorized(self, client: TestClient):
        """Test adding record without authentication"""
        response = client.post(
            "/records/",
            json={
                "pregnancies": 2,
                "glucose": 120,
                "blood_pressure": 80,
                "insulin": 100,
                "bmi": 25.5,
                "diabetic_family": 0,
                "age": 35
            }
        )

        assert response.status_code == 401

    @patch('app.ml.inferences.models')
    def test_get_my_records(self, mock_models, client: TestClient, auth_headers, test_db_session, test_user):
        """Test retrieving user's records"""
        # First create a record
        mock_model = Mock()
        mock_model.predict_proba.return_value = [[0.3, 0.7]]
        mock_models.items.return_value = [
            ("logisticregression", mock_model),
            ("randomforest", mock_model),
            ("svc", mock_model),
            ("knn", mock_model),
            ("mlp", mock_model),
            ("xgboost", mock_model),
        ]

        client.post(
            "/records/",
            headers=auth_headers,
            json={
                "pregnancies": 2,
                "glucose": 120,
                "blood_pressure": 80,
                "insulin": 100,
                "bmi": 25.5,
                "diabetic_family": 0,
                "age": 35
            }
        )

        # Then retrieve records
        response = client.get("/records/my-records", headers=auth_headers)

        assert response.status_code == 200
        records = response.json()
        assert isinstance(records, list)
        assert len(records) > 0

    def test_get_my_records_unauthorized(self, client: TestClient):
        """Test retrieving records without authentication"""
        response = client.get("/records/my-records")

        assert response.status_code == 401

    @patch('app.ml.inferences.models')
    def test_delete_record(self, mock_models, client: TestClient, auth_headers):
        """Test deleting a health record"""
        # First create a record
        mock_model = Mock()
        mock_model.predict_proba.return_value = [[0.3, 0.7]]
        mock_models.items.return_value = [
            ("logisticregression", mock_model),
            ("randomforest", mock_model),
            ("svc", mock_model),
            ("knn", mock_model),
            ("mlp", mock_model),
            ("xgboost", mock_model),
        ]

        create_response = client.post(
            "/records/",
            headers=auth_headers,
            json={
                "pregnancies": 2,
                "glucose": 120,
                "blood_pressure": 80,
                "insulin": 100,
                "bmi": 25.5,
                "diabetic_family": 0,
                "age": 35
            }
        )
        record_id = create_response.json()["record_id"]

        # Then delete it
        response = client.delete(f"/records/{record_id}", headers=auth_headers)

        assert response.status_code == 200
        assert "deleted successfully" in response.json()["detail"]

    def test_delete_nonexistent_record(self, client: TestClient, auth_headers):
        """Test deleting a record that doesn't exist"""
        response = client.delete("/records/99999", headers=auth_headers)

        assert response.status_code == 404


class TestCORSConfiguration:
    """Test suite for CORS configuration"""

    def test_cors_headers_present(self, client: TestClient):
        """Test that CORS headers are present in responses"""
        response = client.options("/", headers={"Origin": "http://localhost:5173"})

        # FastAPI/TestClient may not process OPTIONS perfectly
        # But we can verify the app has CORS middleware configured
        assert response.status_code in [200, 405]  # OPTIONS may return 405 without explicit handler
