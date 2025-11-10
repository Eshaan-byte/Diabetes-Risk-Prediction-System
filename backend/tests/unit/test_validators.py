import pytest
from fastapi import HTTPException
from app.validators import (
    validate_patient_data,
    validate_age_not_zero,
    validate_positive_values,
    validate_email_format,
    validate_password_strength,
    validate_phone_number,
    validate_username
)


class TestValidatePatientData:
    """Test suite for patient data validation"""

    def test_valid_patient_data(self):
        """Test that valid data passes validation"""
        data = {
            "pregnancies": 2,
            "glucose": 120,
            "blood_pressure": 80,
            "insulin": 100,
            "bmi": 25.5,
            "diabetic_family": 0,
            "age": 35
        }
        # Should not raise exception
        validate_patient_data(data)

    def test_pregnancies_too_high(self):
        """Test that pregnancies over maximum raises error"""
        data = {
            "pregnancies": 25,
            "glucose": 120,
            "blood_pressure": 80,
            "insulin": 100,
            "bmi": 25.5,
            "diabetic_family": 0,
            "age": 35
        }
        with pytest.raises(HTTPException) as exc_info:
            validate_patient_data(data)
        assert exc_info.value.status_code == 422
        assert "Pregnancies" in str(exc_info.value.detail)

    def test_glucose_negative(self):
        """Test that negative glucose raises error"""
        data = {
            "pregnancies": 2,
            "glucose": -10,
            "blood_pressure": 80,
            "insulin": 100,
            "bmi": 25.5,
            "diabetic_family": 0,
            "age": 35
        }
        with pytest.raises(HTTPException) as exc_info:
            validate_patient_data(data)
        assert exc_info.value.status_code == 422

    def test_bmi_too_high(self):
        """Test that BMI over maximum raises error"""
        data = {
            "pregnancies": 2,
            "glucose": 120,
            "blood_pressure": 80,
            "insulin": 100,
            "bmi": 75.0,
            "diabetic_family": 0,
            "age": 35
        }
        with pytest.raises(HTTPException) as exc_info:
            validate_patient_data(data)
        assert "BMI" in str(exc_info.value.detail)

    def test_age_over_maximum(self):
        """Test that age over 120 raises error"""
        data = {
            "pregnancies": 2,
            "glucose": 120,
            "blood_pressure": 80,
            "insulin": 100,
            "bmi": 25.5,
            "diabetic_family": 0,
            "age": 125
        }
        with pytest.raises(HTTPException) as exc_info:
            validate_patient_data(data)
        assert "Age" in str(exc_info.value.detail)

    def test_diabetic_family_invalid(self):
        """Test that diabetic_family not 0 or 1 raises error"""
        data = {
            "pregnancies": 2,
            "glucose": 120,
            "blood_pressure": 80,
            "insulin": 100,
            "bmi": 25.5,
            "diabetic_family": 2,
            "age": 35
        }
        with pytest.raises(HTTPException) as exc_info:
            validate_patient_data(data)
        assert "Diabetic family" in str(exc_info.value.detail)


class TestValidateAgeNotZero:
    """Test suite for age zero validation"""

    def test_valid_age(self):
        """Test that non-zero age passes"""
        validate_age_not_zero(25)

    def test_age_zero_raises_error(self):
        """Test that age zero raises error"""
        with pytest.raises(HTTPException) as exc_info:
            validate_age_not_zero(0)
        assert exc_info.value.status_code == 422
        assert "division by zero" in str(exc_info.value.detail).lower()


class TestValidatePositiveValues:
    """Test suite for positive value validation"""

    def test_all_positive_values(self):
        """Test that all positive values pass"""
        data = {"glucose": 100, "insulin": 50, "bmi": 25.5}
        validate_positive_values(data, ["glucose", "insulin", "bmi"])

    def test_negative_value_raises_error(self):
        """Test that negative value raises error"""
        data = {"glucose": -100, "insulin": 50}
        with pytest.raises(HTTPException) as exc_info:
            validate_positive_values(data, ["glucose", "insulin"])
        assert "cannot be negative" in str(exc_info.value.detail)

    def test_zero_values_allowed(self):
        """Test that zero values are allowed"""
        data = {"glucose": 0, "insulin": 0}
        validate_positive_values(data, ["glucose", "insulin"])


class TestValidateEmailFormat:
    """Test suite for email validation"""

    def test_valid_email(self):
        """Test that valid email passes"""
        validate_email_format("user@example.com")

    def test_email_without_at_symbol(self):
        """Test that email without @ raises error"""
        with pytest.raises(HTTPException):
            validate_email_format("userexample.com")

    def test_email_starting_with_at(self):
        """Test that email starting with @ raises error"""
        with pytest.raises(HTTPException):
            validate_email_format("@example.com")

    def test_email_ending_with_at(self):
        """Test that email ending with @ raises error"""
        with pytest.raises(HTTPException):
            validate_email_format("user@")

    def test_email_without_domain_extension(self):
        """Test that email without domain extension raises error"""
        with pytest.raises(HTTPException):
            validate_email_format("user@example")


class TestValidatePasswordStrength:
    """Test suite for password strength validation"""

    def test_valid_password(self):
        """Test that valid password passes"""
        validate_password_strength("password123")

    def test_password_too_short(self):
        """Test that password under 8 characters raises error"""
        with pytest.raises(HTTPException) as exc_info:
            validate_password_strength("pass1")
        assert "at least 8 characters" in str(exc_info.value.detail)

    def test_password_no_letters(self):
        """Test that password without letters raises error"""
        with pytest.raises(HTTPException) as exc_info:
            validate_password_strength("12345678")
        assert "letters and numbers" in str(exc_info.value.detail)

    def test_password_no_numbers(self):
        """Test that password without numbers raises error"""
        with pytest.raises(HTTPException) as exc_info:
            validate_password_strength("password")
        assert "letters and numbers" in str(exc_info.value.detail)


class TestValidatePhoneNumber:
    """Test suite for phone number validation"""

    def test_valid_phone_number(self):
        """Test that valid phone number passes"""
        validate_phone_number("1234567890")

    def test_phone_with_formatting(self):
        """Test that phone with formatting passes"""
        validate_phone_number("(123) 456-7890")

    def test_phone_too_short(self):
        """Test that short phone number raises error"""
        with pytest.raises(HTTPException) as exc_info:
            validate_phone_number("123456")
        assert "between 10 and 15" in str(exc_info.value.detail)

    def test_phone_with_letters(self):
        """Test that phone with letters raises error"""
        with pytest.raises(HTTPException) as exc_info:
            validate_phone_number("123456789a")
        assert "only digits" in str(exc_info.value.detail)


class TestValidateUsername:
    """Test suite for username validation"""

    def test_valid_username(self):
        """Test that valid username passes"""
        validate_username("user_123")

    def test_username_too_short(self):
        """Test that username under 3 characters raises error"""
        with pytest.raises(HTTPException) as exc_info:
            validate_username("ab")
        assert "at least 3 characters" in str(exc_info.value.detail)

    def test_username_too_long(self):
        """Test that username over 30 characters raises error"""
        with pytest.raises(HTTPException) as exc_info:
            validate_username("a" * 31)
        assert "at most 30 characters" in str(exc_info.value.detail)

    def test_username_with_special_chars(self):
        """Test that username with special characters raises error"""
        with pytest.raises(HTTPException) as exc_info:
            validate_username("user@123")
        assert "letters, numbers, and underscores" in str(exc_info.value.detail)

    def test_username_with_underscore(self):
        """Test that username with underscore passes"""
        validate_username("user_name")
