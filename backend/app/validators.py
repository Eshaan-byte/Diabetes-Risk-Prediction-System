"""
Input validation utilities for health records API
"""
from fastapi import HTTPException
from typing import Dict, Any


def validate_patient_data(data: Dict[str, Any]) -> None:
    """
    Validate patient health data for realistic ranges

    Args:
        data: Dictionary containing patient health metrics

    Raises:
        HTTPException: If validation fails
    """
    validations = {
        "pregnancies": {
            "min": 0,
            "max": 20,
            "message": "Pregnancies must be between 0 and 20"
        },
        "glucose": {
            "min": 0,
            "max": 300,
            "message": "Glucose must be between 0 and 300 mg/dL"
        },
        "blood_pressure": {
            "min": 0,
            "max": 200,
            "message": "Blood pressure must be between 0 and 200 mmHg"
        },
        "insulin": {
            "min": 0,
            "max": 1000,
            "message": "Insulin must be between 0 and 1000 μU/mL"
        },
        "bmi": {
            "min": 10.0,
            "max": 70.0,
            "message": "BMI must be between 10.0 and 70.0"
        },
        "diabetic_family": {
            "min": 0,
            "max": 1,
            "message": "Diabetic family history must be 0 (no) or 1 (yes)"
        },
        "age": {
            "min": 1,
            "max": 120,
            "message": "Age must be between 1 and 120 years"
        }
    }

    for field, rules in validations.items():
        if field in data and data[field] is not None:
            value = data[field]

            # Check minimum value
            if value < rules["min"]:
                raise HTTPException(
                    status_code=422,
                    detail=f"Validation error: {rules['message']}"
                )

            # Check maximum value
            if value > rules["max"]:
                raise HTTPException(
                    status_code=422,
                    detail=f"Validation error: {rules['message']}"
                )


def validate_age_not_zero(age: int) -> None:
    """
    Validate that age is not zero to prevent division errors

    Args:
        age: Patient age

    Raises:
        HTTPException: If age is zero
    """
    if age == 0:
        raise HTTPException(
            status_code=422,
            detail="Validation error: Age cannot be 0 (division by zero risk)"
        )


def validate_positive_values(data: Dict[str, Any], fields: list) -> None:
    """
    Validate that specified fields have non-negative values

    Args:
        data: Dictionary containing values to validate
        fields: List of field names to check

    Raises:
        HTTPException: If any field has negative value
    """
    for field in fields:
        if field in data and data[field] is not None:
            if data[field] < 0:
                raise HTTPException(
                    status_code=422,
                    detail=f"Validation error: {field} cannot be negative"
                )


def validate_email_format(email: str) -> None:
    """
    Additional email validation beyond pydantic's EmailStr

    Args:
        email: Email address to validate

    Raises:
        HTTPException: If email format is invalid
    """
    if not email or "@" not in email:
        raise HTTPException(
            status_code=422,
            detail="Validation error: Invalid email format"
        )

    # Check for common invalid patterns
    if email.startswith("@") or email.endswith("@"):
        raise HTTPException(
            status_code=422,
            detail="Validation error: Invalid email format"
        )

    local, domain = email.rsplit("@", 1)

    if not local or not domain:
        raise HTTPException(
            status_code=422,
            detail="Validation error: Invalid email format"
        )

    if "." not in domain:
        raise HTTPException(
            status_code=422,
            detail="Validation error: Invalid email domain"
        )


def validate_password_strength(password: str) -> None:
    """
    Validate password meets minimum security requirements

    Args:
        password: Password to validate

    Raises:
        HTTPException: If password doesn't meet requirements
    """
    if len(password) < 8:
        raise HTTPException(
            status_code=422,
            detail="Validation error: Password must be at least 8 characters long"
        )

    # Check for at least one letter and one number
    has_letter = any(c.isalpha() for c in password)
    has_number = any(c.isdigit() for c in password)

    if not (has_letter and has_number):
        raise HTTPException(
            status_code=422,
            detail="Validation error: Password must contain both letters and numbers"
        )


def validate_phone_number(phone: str) -> None:
    """
    Validate phone number format

    Args:
        phone: Phone number to validate

    Raises:
        HTTPException: If phone number is invalid
    """
    # Remove common formatting characters
    cleaned = phone.replace("-", "").replace(" ", "").replace("(", "").replace(")", "")

    if not cleaned.isdigit():
        raise HTTPException(
            status_code=422,
            detail="Validation error: Phone number must contain only digits"
        )

    if len(cleaned) < 10 or len(cleaned) > 15:
        raise HTTPException(
            status_code=422,
            detail="Validation error: Phone number must be between 10 and 15 digits"
        )


def validate_username(username: str) -> None:
    """
    Validate username format

    Args:
        username: Username to validate

    Raises:
        HTTPException: If username is invalid
    """
    if len(username) < 3:
        raise HTTPException(
            status_code=422,
            detail="Validation error: Username must be at least 3 characters long"
        )

    if len(username) > 30:
        raise HTTPException(
            status_code=422,
            detail="Validation error: Username must be at most 30 characters long"
        )

    # Check for valid characters (alphanumeric and underscore)
    if not all(c.isalnum() or c == "_" for c in username):
        raise HTTPException(
            status_code=422,
            detail="Validation error: Username can only contain letters, numbers, and underscores"
        )
