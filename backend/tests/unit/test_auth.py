import pytest
import jwt
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, MagicMock
from uuid import UUID, uuid4
from fastapi import HTTPException
from app.routes.auth import create_access_token, get_current_user
from app.models import users


class TestCreateAccessToken:
    """Test suite for JWT token creation"""

    @patch('app.routes.auth.SECRET_KEY', 'test-secret-key')
    def test_create_access_token_basic(self):
        """Test basic token creation with default expiration"""
        data = {"sub": "user123"}
        token = create_access_token(data)

        # Verify token can be decoded
        assert isinstance(token, str)
        payload = jwt.decode(token, 'test-secret-key', algorithms=["HS256"])
        assert payload["sub"] == "user123"
        assert "exp" in payload

    @patch('app.routes.auth.SECRET_KEY', 'test-secret-key')
    def test_create_access_token_with_custom_expiration(self):
        """Test token creation with custom expiration time"""
        data = {"sub": "user123"}
        expires_delta = timedelta(minutes=60)
        token = create_access_token(data, expires_delta)

        payload = jwt.decode(token, 'test-secret-key', algorithms=["HS256"])

        # Verify expiration is approximately 60 minutes from now
        exp_time = datetime.utcfromtimestamp(payload["exp"])
        expected_time = datetime.utcnow() + expires_delta
        time_diff = abs((exp_time - expected_time).total_seconds())

        # Allow 5 seconds tolerance for test execution time
        assert time_diff < 5

    @patch('app.routes.auth.SECRET_KEY', 'test-secret-key')
    def test_create_access_token_default_expiration(self):
        """Test token creation uses default 30 minute expiration"""
        data = {"sub": "user123"}
        token = create_access_token(data)

        payload = jwt.decode(token, 'test-secret-key', algorithms=["HS256"])
        exp_time = datetime.utcfromtimestamp(payload["exp"])
        expected_time = datetime.utcnow() + timedelta(minutes=30)
        time_diff = abs((exp_time - expected_time).total_seconds())

        # Allow 5 seconds tolerance
        assert time_diff < 5

    @patch('app.routes.auth.SECRET_KEY', 'test-secret-key')
    def test_create_access_token_preserves_data(self):
        """Test that token preserves all data fields"""
        data = {
            "sub": "user123",
            "email": "test@example.com",
            "role": "admin"
        }
        token = create_access_token(data)

        payload = jwt.decode(token, 'test-secret-key', algorithms=["HS256"])
        assert payload["sub"] == "user123"
        assert payload["email"] == "test@example.com"
        assert payload["role"] == "admin"

    @patch('app.routes.auth.SECRET_KEY', 'test-secret-key')
    def test_create_access_token_unique_tokens(self):
        """Test that different data produces different tokens"""
        token1 = create_access_token({"sub": "user1"})
        token2 = create_access_token({"sub": "user2"})

        assert token1 != token2


class TestGetCurrentUser:
    """Test suite for get_current_user dependency"""

    @pytest.fixture
    def mock_session(self):
        """Fixture providing a mocked database session"""
        return Mock()

    @pytest.fixture
    def sample_user(self):
        """Fixture providing a sample user"""
        return users(
            user_id=uuid4(),
            email="test@example.com",
            username="testuser",
            first_name="Test",
            last_name="User",
            password_hash="hashed_password",
            phone_number="1234567890",
            date_of_birth=datetime(1990, 1, 1).date(),
            is_verified=True
        )

    @patch('app.routes.auth.SECRET_KEY', 'test-secret-key')
    def test_get_current_user_valid_token(self, mock_session, sample_user):
        """Test successful user retrieval with valid token"""
        token = create_access_token({"sub": str(sample_user.user_id)})
        mock_session.get.return_value = sample_user

        user = get_current_user(token, mock_session)

        assert user == sample_user
        mock_session.get.assert_called_once_with(users, sample_user.user_id)

    @patch('app.routes.auth.SECRET_KEY', 'test-secret-key')
    def test_get_current_user_invalid_token_format(self, mock_session):
        """Test that invalid token format raises HTTPException"""
        with pytest.raises(HTTPException) as exc_info:
            get_current_user("invalid-token", mock_session)

        assert exc_info.value.status_code == 401
        assert "Invalid token" in str(exc_info.value.detail)

    @patch('app.routes.auth.SECRET_KEY', 'test-secret-key')
    def test_get_current_user_expired_token(self, mock_session):
        """Test that expired token raises HTTPException"""
        # Create token that expired 1 hour ago
        expired_token = create_access_token(
            {"sub": str(uuid4())},
            timedelta(hours=-1)
        )

        with pytest.raises(HTTPException) as exc_info:
            get_current_user(expired_token, mock_session)

        assert exc_info.value.status_code == 401
        assert "Invalid token" in str(exc_info.value.detail)

    @patch('app.routes.auth.SECRET_KEY', 'test-secret-key')
    def test_get_current_user_missing_sub(self, mock_session):
        """Test that token without 'sub' claim raises HTTPException"""
        token = create_access_token({"email": "test@example.com"})

        with pytest.raises(HTTPException) as exc_info:
            get_current_user(token, mock_session)

        assert exc_info.value.status_code == 401
        assert "Invalid token" in str(exc_info.value.detail)

    @patch('app.routes.auth.SECRET_KEY', 'test-secret-key')
    def test_get_current_user_user_not_found(self, mock_session):
        """Test that non-existent user raises HTTPException"""
        user_id = uuid4()
        token = create_access_token({"sub": str(user_id)})
        mock_session.get.return_value = None

        with pytest.raises(HTTPException) as exc_info:
            get_current_user(token, mock_session)

        assert exc_info.value.status_code == 401
        assert "User not found" in str(exc_info.value.detail)

    @patch('app.routes.auth.SECRET_KEY', 'test-secret-key')
    def test_get_current_user_wrong_secret_key(self, mock_session):
        """Test that token signed with different key raises HTTPException"""
        # Create token with different secret
        token = jwt.encode(
            {"sub": str(uuid4()), "exp": datetime.utcnow() + timedelta(minutes=30)},
            "wrong-secret-key",
            algorithm="HS256"
        )

        with pytest.raises(HTTPException) as exc_info:
            get_current_user(token, mock_session)

        assert exc_info.value.status_code == 401

    @patch('app.routes.auth.SECRET_KEY', 'test-secret-key')
    def test_get_current_user_invalid_user_id_format(self, mock_session):
        """Test that invalid UUID format raises exception"""
        token = create_access_token({"sub": "not-a-valid-uuid"})

        with pytest.raises((HTTPException, ValueError)):
            get_current_user(token, mock_session)


class TestAuthHelpers:
    """Test suite for authentication helper functions"""

    def test_password_hashing_integration(self):
        """Test that password hashing works correctly with bcrypt"""
        from passlib.hash import bcrypt

        password = "test_password_123"
        hashed = bcrypt.hash(password)

        # Verify hash is different from password
        assert hashed != password

        # Verify password can be verified
        assert bcrypt.verify(password, hashed)

        # Verify wrong password fails
        assert not bcrypt.verify("wrong_password", hashed)

    def test_password_hash_uniqueness(self):
        """Test that same password produces different hashes"""
        from passlib.hash import bcrypt

        password = "test_password_123"
        hash1 = bcrypt.hash(password)
        hash2 = bcrypt.hash(password)

        # Hashes should be different due to salt
        assert hash1 != hash2

        # But both should verify the original password
        assert bcrypt.verify(password, hash1)
        assert bcrypt.verify(password, hash2)
