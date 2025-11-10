import pytest
from datetime import datetime, date
from pydantic import ValidationError
from app.schemas import (
    UserCreate,
    UserLogin,
    ResendVerification,
    PatientData,
    PatientDataWithCreatedAt,
    PatientDataUpdate
)


class TestUserCreate:
    """Test suite for UserCreate schema validation"""

    def test_valid_user_create(self):
        """Test valid user creation data"""
        user_data = {
            "email": "test@example.com",
            "password": "secure_password123",
            "first_name": "John",
            "last_name": "Doe",
            "username": "johndoe",
            "phone_number": "1234567890",
            "date_of_birth": date(1990, 1, 1)
        }
        user = UserCreate(**user_data)

        assert user.email == "test@example.com"
        assert user.username == "johndoe"
        assert user.first_name == "John"

    def test_invalid_email_format(self):
        """Test that invalid email format raises validation error"""
        user_data = {
            "email": "not-an-email",
            "password": "secure_password123",
            "first_name": "John",
            "last_name": "Doe",
            "username": "johndoe",
            "phone_number": "1234567890",
            "date_of_birth": date(1990, 1, 1)
        }

        with pytest.raises(ValidationError) as exc_info:
            UserCreate(**user_data)

        assert "email" in str(exc_info.value).lower()

    def test_missing_required_fields(self):
        """Test that missing required fields raise validation error"""
        incomplete_data = {
            "email": "test@example.com",
            "password": "password123"
        }

        with pytest.raises(ValidationError) as exc_info:
            UserCreate(**incomplete_data)

        errors = exc_info.value.errors()
        missing_fields = [error["loc"][0] for error in errors]

        assert "first_name" in missing_fields
        assert "last_name" in missing_fields
        assert "username" in missing_fields

    def test_date_of_birth_type_validation(self):
        """Test date of birth accepts date objects"""
        user_data = {
            "email": "test@example.com",
            "password": "secure_password123",
            "first_name": "John",
            "last_name": "Doe",
            "username": "johndoe",
            "phone_number": "1234567890",
            "date_of_birth": date(2000, 5, 15)
        }
        user = UserCreate(**user_data)

        assert isinstance(user.date_of_birth, date)
        assert user.date_of_birth.year == 2000

    def test_empty_string_validation(self):
        """Test that empty strings for required fields are rejected by Pydantic"""
        user_data = {
            "email": "test@example.com",
            "password": "password123",
            "first_name": "",
            "last_name": "",
            "username": "johndoe",
            "phone_number": "1234567890",
            "date_of_birth": date(1990, 1, 1)
        }

        with pytest.raises(ValidationError):
            UserCreate(**user_data)

class TestUserLogin:
    """Test suite for UserLogin schema validation"""

    def test_valid_login_with_email(self):
        """Test valid login with email"""
        login_data = {
            "email": "test@example.com",
            "password": "password123"
        }
        login = UserLogin(**login_data)

        assert login.email == "test@example.com"
        assert login.password == "password123"

    def test_valid_login_with_username(self):
        """Test valid login with username instead of email"""
        login_data = {
            "email": "johndoe",  # Field is named email but accepts username
            "password": "password123"
        }
        login = UserLogin(**login_data)

        assert login.email == "johndoe"

    def test_missing_password(self):
        """Test that missing password raises validation error"""
        login_data = {
            "email": "test@example.com"
        }

        with pytest.raises(ValidationError) as exc_info:
            UserLogin(**login_data)

        assert "password" in str(exc_info.value)

    def test_missing_email(self):
        """Test that missing email/username raises validation error"""
        login_data = {
            "password": "password123"
        }

        with pytest.raises(ValidationError) as exc_info:
            UserLogin(**login_data)

        assert "email" in str(exc_info.value)


class TestResendVerification:
    """Test suite for ResendVerification schema validation"""

    def test_valid_resend_verification(self):
        """Test valid resend verification request"""
        data = {"email": "test@example.com"}
        resend = ResendVerification(**data)

        assert resend.email == "test@example.com"

    def test_invalid_email_format(self):
        """Test that invalid email format raises validation error"""
        data = {"email": "not-an-email"}

        with pytest.raises(ValidationError) as exc_info:
            ResendVerification(**data)

        assert "email" in str(exc_info.value).lower()


class TestPatientData:
    """Test suite for PatientData schema validation"""

    def test_valid_patient_data(self):
        """Test valid patient health data"""
        data = {
            "pregnancies": 2,
            "glucose": 120,
            "blood_pressure": 80,
            "insulin": 100,
            "bmi": 25.5,
            "diabetic_family": 0,
            "age": 35
        }
        patient = PatientData(**data)

        assert patient.pregnancies == 2
        assert patient.glucose == 120
        assert patient.bmi == 25.5

    def test_missing_required_fields(self):
        """Test that missing required fields raise validation error"""
        incomplete_data = {
            "pregnancies": 2,
            "glucose": 120
        }

        with pytest.raises(ValidationError) as exc_info:
            PatientData(**incomplete_data)

        errors = exc_info.value.errors()
        missing_fields = [error["loc"][0] for error in errors]

        assert "blood_pressure" in missing_fields
        assert "insulin" in missing_fields
        assert "bmi" in missing_fields

    def test_negative_values_allowed(self):
        """Negative values should raise validation error"""
        data = {
            "pregnancies": -1,
            "glucose": -50,
            "blood_pressure": -80,
            "insulin": -100,
            "bmi": -25.5,
            "diabetic_family": -1,
            "age": -35
        }

        with pytest.raises(ValidationError):
            PatientData(**data)

    def test_float_to_int_rejected(self):
        """Test that floats with fractional parts are rejected for integer fields"""
        data = {
            "pregnancies": 2.7,
            "glucose": 120.9,
            "blood_pressure": 80.5,
            "insulin": 100.1,
            "bmi": 25.5,
            "diabetic_family": 0.8,
            "age": 35.9
        }
        # Expect Pydantic to raise a validation error, not coerce
        with pytest.raises(ValidationError) as exc_info:
            PatientData(**data)

        errors = exc_info.value.errors()
        assert all(e["type"] == "int_from_float" for e in errors if e["loc"][0] != "bmi")

    def test_diabetic_family_binary(self):
        """Test diabetic_family field accepts integer values"""
        data_with_family = {
            "pregnancies": 2,
            "glucose": 120,
            "blood_pressure": 80,
            "insulin": 100,
            "bmi": 25.5,
            "diabetic_family": 1,
            "age": 35
        }
        patient = PatientData(**data_with_family)
        assert patient.diabetic_family == 1

    def test_zero_values(self):
        """Test that zero values are rejected"""
        data = {
            "pregnancies": 0,
            "glucose": 0,
            "blood_pressure": 0,
            "insulin": 0,
            "bmi": 0.0,
            "diabetic_family": 0,
            "age": 0
        }
        with pytest.raises(ValidationError):
            PatientData(**data)

    def test_very_large_values(self):
        """Test that very large values are rejected"""
        data = {
            "pregnancies": 999999,
            "glucose": 999999,
            "blood_pressure": 999999,
            "insulin": 999999,
            "bmi": 999999.99,
            "diabetic_family": 999999,
            "age": 999999
        }
        with pytest.raises(ValidationError):
            PatientData(**data)


class TestPatientDataWithCreatedAt:
    """Test suite for PatientDataWithCreatedAt schema validation"""

    def test_valid_patient_data_with_timestamp(self):
        """Test valid patient data with created_at timestamp"""
        data = {
            "pregnancies": 2,
            "glucose": 120,
            "blood_pressure": 80,
            "insulin": 100,
            "bmi": 25.5,
            "diabetic_family": 0,
            "age": 35,
            "created_at": datetime(2024, 1, 15, 10, 30, 0)
        }
        patient = PatientDataWithCreatedAt(**data)

        assert patient.pregnancies == 2
        assert isinstance(patient.created_at, datetime)
        assert patient.created_at.year == 2024

    def test_missing_created_at(self):
        """Test that missing created_at raises validation error"""
        data = {
            "pregnancies": 2,
            "glucose": 120,
            "blood_pressure": 80,
            "insulin": 100,
            "bmi": 25.5,
            "diabetic_family": 0,
            "age": 35
        }

        with pytest.raises(ValidationError) as exc_info:
            PatientDataWithCreatedAt(**data)

        assert "created_at" in str(exc_info.value)

    def test_string_datetime_conversion(self):
        """Test that ISO format string is converted to datetime"""
        data = {
            "pregnancies": 2,
            "glucose": 120,
            "blood_pressure": 80,
            "insulin": 100,
            "bmi": 25.5,
            "diabetic_family": 0,
            "age": 35,
            "created_at": "2024-01-15T10:30:00"
        }
        patient = PatientDataWithCreatedAt(**data)

        assert isinstance(patient.created_at, datetime)


class TestPatientDataUpdate:
    """Test suite for PatientDataUpdate schema validation"""

    def test_all_fields_optional(self):
        """Test that all fields are optional in update schema"""
        # Empty update should be valid
        update = PatientDataUpdate()

        assert update.pregnancies is None
        assert update.glucose is None
        assert update.bmi is None

    def test_partial_update(self):
        """Test updating only specific fields"""
        update = PatientDataUpdate(
            glucose=130,
            blood_pressure=85
        )

        assert update.glucose == 130
        assert update.blood_pressure == 85
        assert update.pregnancies is None
        assert update.insulin is None

    def test_single_field_update(self):
        """Test updating a single field"""
        update = PatientDataUpdate(bmi=27.5)

        assert update.bmi == 27.5
        assert update.glucose is None

    def test_update_with_created_at(self):
        """Test that created_at can be updated"""
        new_time = datetime(2024, 6, 1, 15, 30, 0)
        update = PatientDataUpdate(
            glucose=140,
            created_at=new_time
        )

        assert update.glucose == 140
        assert update.created_at == new_time

    def test_exclude_unset_behavior(self):
        """Test that exclude_unset works correctly for partial updates"""
        update = PatientDataUpdate(
            glucose=130,
            blood_pressure=85
        )

        # When converted to dict with exclude_unset, only set fields appear
        update_dict = update.dict(exclude_unset=True)

        assert "glucose" in update_dict
        assert "blood_pressure" in update_dict
        assert "pregnancies" not in update_dict
        assert "insulin" not in update_dict

    def test_update_with_zero_values(self):
        """Test that zero values can be set in updates"""
        update = PatientDataUpdate(
            glucose=0,
            insulin=0
        )

        assert update.glucose == 0
        assert update.insulin == 0


class TestSchemaIntegration:
    """Integration tests for schema interactions"""

    def test_patient_data_to_patient_data_with_created_at(self):
        """Test converting PatientData to PatientDataWithCreatedAt"""
        patient_data = PatientData(
            pregnancies=2,
            glucose=120,
            blood_pressure=80,
            insulin=100,
            bmi=25.5,
            diabetic_family=0,
            age=35
        )

        # Convert to dict and add created_at
        data_dict = patient_data.dict()
        data_dict["created_at"] = datetime.utcnow()

        patient_with_time = PatientDataWithCreatedAt(**data_dict)

        assert patient_with_time.glucose == patient_data.glucose
        assert hasattr(patient_with_time, "created_at")

    def test_patient_data_update_merge(self):
        """Test merging PatientDataUpdate with existing data"""
        existing_data = {
            "pregnancies": 2,
            "glucose": 120,
            "blood_pressure": 80,
            "insulin": 100,
            "bmi": 25.5,
            "diabetic_family": 0,
            "age": 35
        }

        update = PatientDataUpdate(
            glucose=140,
            bmi=27.0
        )

        # Simulate update merge
        update_dict = update.dict(exclude_unset=True)
        merged_data = {**existing_data, **update_dict}

        assert merged_data["glucose"] == 140  # Updated
        assert merged_data["bmi"] == 27.0  # Updated
        assert merged_data["pregnancies"] == 2  # Unchanged
        assert merged_data["insulin"] == 100  # Unchanged
