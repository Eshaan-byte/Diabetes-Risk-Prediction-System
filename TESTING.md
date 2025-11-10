# Testing and Validation Guide

This document provides an overview of the testing and validation infrastructure for the Health Records API project.

## Quick Start

```bash
# Navigate to backend directory
cd backend

# Install dependencies (including test dependencies)
pip install -r requirement.txt

# Run all tests
pytest

# Run with coverage report
pytest --cov=app --cov-report=html

# View coverage report
open htmlcov/index.html
```

## What's Included

### 1. Comprehensive Test Suite

#### Unit Tests (tests/unit/)
- **test_inferences.py**: 20+ tests for ML prediction logic
- **test_auth.py**: 15+ tests for authentication and JWT handling
- **test_schemas.py**: 30+ tests for input schema validation
- **test_validators.py**: 25+ tests for custom validation rules

#### Integration Tests (tests/integration/)
- **test_api.py**: 20+ end-to-end API tests covering all endpoints

**Total**: 100+ comprehensive tests

### 2. Input Validation

Enhanced validation has been added to all data schemas:

#### User Registration Validation
```python
- Email: Valid format (user@domain.com)
- Password: Minimum 8 chars, must contain letters and numbers
- Username: 3-30 chars, alphanumeric + underscore only
- Phone: 10-15 digits
- Date of Birth: Must be in past, reasonable age range
- First/Last Name: 1-50 characters
```

#### Patient Health Data Validation
```python
- Pregnancies: 0-20
- Glucose: 0-300 mg/dL
- Blood Pressure: 0-200 mmHg
- Insulin: 0-1000 μU/mL
- BMI: 10.0-70.0
- Diabetic Family: 0 (no) or 1 (yes)
- Age: 1-120 years (prevents division by zero)
```

### 3. Validation Utilities

New validators module (`app/validators.py`) provides:
- Patient data range validation
- Email format validation
- Password strength checking
- Phone number validation
- Username format validation
- Positive value validation

### 4. Test Configuration

- **pytest.ini**: Pytest configuration with coverage settings
- **conftest.py**: Shared fixtures and test environment setup
- Test markers for categorizing tests (unit, integration, slow, auth, ml, validation)

## Test Coverage

The test suite covers:

### Authentication & Authorization
- User registration with email verification
- Login with email or username
- JWT token generation and validation
- Token expiration handling
- Email verification flow
- Resend verification emails
- Protected endpoint access

### Health Records
- Create health records with predictions
- Retrieve user's records
- Update existing records
- Delete records
- Bulk record upload
- Custom timestamp support

### ML Predictions
- Risk categorization (Low/Medium/High)
- Multi-model predictions (6 models)
- Probability calculations
- Input feature processing
- Edge case handling

### Validation
- Schema validation for all inputs
- Custom validators for business rules
- Error handling and user feedback
- Type conversions and constraints

## Running Specific Tests

```bash
# Run only authentication tests
pytest tests/unit/test_auth.py

# Run only ML tests
pytest tests/unit/test_inferences.py

# Run only integration tests
pytest tests/integration/

# Run with verbose output
pytest -v

# Stop on first failure
pytest -x

# Run specific test method
pytest tests/unit/test_auth.py::TestCreateAccessToken::test_create_access_token_basic
```

## Validation Examples

### Valid Patient Data
```json
{
  "pregnancies": 2,
  "glucose": 120,
  "blood_pressure": 80,
  "insulin": 100,
  "bmi": 25.5,
  "diabetic_family": 0,
  "age": 35
}
```

### Invalid Examples (Will Be Rejected)

```json
// Age = 0 (division by zero risk)
{"age": 0, ...}  // ❌ Rejected

// BMI out of range
{"bmi": 75.0, ...}  // ❌ Rejected

// Negative glucose
{"glucose": -50, ...}  // ❌ Rejected

// Invalid diabetic_family value
{"diabetic_family": 2, ...}  // ❌ Rejected
```

### User Registration Validation

```json
// Valid registration
{
  "email": "user@example.com",
  "password": "secure123",
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "1234567890",
  "date_of_birth": "1990-01-01"
}

// Invalid examples
{
  "password": "short"  // ❌ Too short (< 8 chars)
}
{
  "password": "nodigits"  // ❌ No numbers
}
{
  "username": "ab"  // ❌ Too short (< 3 chars)
}
{
  "username": "user@123"  // ❌ Invalid characters
}
```

## Continuous Integration

The test suite is designed for CI/CD integration. All tests use:
- In-memory SQLite database (no external dependencies)
- Mocked ML models (no model files needed)
- Mocked email service (no SMTP server needed)
- Environment variable configuration

## Benefits

1. **Reliability**: Catch bugs before they reach production
2. **Documentation**: Tests serve as usage examples
3. **Refactoring Safety**: Change code with confidence
4. **Input Validation**: Prevent invalid data from entering system
5. **Security**: Validate all user inputs to prevent attacks
6. **User Experience**: Clear error messages for validation failures

## Next Steps

1. **Run the tests**: `pytest --cov=app --cov-report=html`
2. **Review coverage**: Open `htmlcov/index.html` to see what's tested
3. **Add more tests**: As you add features, add corresponding tests
4. **Set up CI/CD**: Integrate tests into your deployment pipeline

## Documentation

For detailed information about specific tests and how to write new ones, see:
- [Backend Test Documentation](backend/tests/README.md)

## Troubleshooting

**Tests fail with import errors**
```bash
# Make sure you're in the backend directory
cd backend
# Ensure all dependencies are installed
pip install -r requirement.txt
```

**Database errors**
- Tests use in-memory SQLite, no setup needed
- If issues persist, check conftest.py fixture setup

**ML model errors**
- Unit tests mock the models, no real models needed
- Check that mocking is set up correctly in test files

## Summary

This project now includes:
- ✅ 100+ comprehensive tests
- ✅ Input validation on all endpoints
- ✅ Pydantic schema constraints
- ✅ Custom validation utilities
- ✅ Test documentation and examples
- ✅ CI/CD ready configuration
- ✅ Coverage reporting
- ✅ Fixtures for easy test writing

The API is now well-tested and validates all inputs to ensure data quality and prevent errors!
