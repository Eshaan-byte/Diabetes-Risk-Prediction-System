# Test Suite Documentation

## Overview

This directory contains comprehensive unit and integration tests for the Health Records API with diabetes risk prediction functionality.

## Test Structure

```
tests/
├── conftest.py              # Shared pytest fixtures and configuration
├── unit/                    # Unit tests for individual components
│   ├── test_inferences.py  # ML inference and prediction tests
│   ├── test_auth.py        # Authentication and JWT tests
│   ├── test_schemas.py     # Pydantic schema validation tests
│   └── test_validators.py  # Input validation tests
└── integration/            # Integration tests for API endpoints
    └── test_api.py         # End-to-end API tests
```

## Running Tests

### Install Dependencies

First, ensure all testing dependencies are installed:

```bash
cd backend
pip install -r requirement.txt
```

### Run All Tests

```bash
pytest
```

### Run Specific Test Categories

```bash
# Run only unit tests
pytest tests/unit/

# Run only integration tests
pytest tests/integration/

# Run specific test file
pytest tests/unit/test_auth.py

# Run specific test class
pytest tests/unit/test_auth.py::TestCreateAccessToken

# Run specific test method
pytest tests/unit/test_auth.py::TestCreateAccessToken::test_create_access_token_basic
```

### Run Tests with Coverage

```bash
# Generate coverage report
pytest --cov=app --cov-report=html

# View coverage report
open htmlcov/index.html
```

### Run Tests with Verbose Output

```bash
pytest -v
```

### Run Tests and Stop on First Failure

```bash
pytest -x
```

## Test Categories

### Unit Tests

#### test_inferences.py
Tests for machine learning inference module:
- Risk label categorization (Low/Medium/High)
- Prediction probability calculations
- Input feature processing
- BMI/age ratio calculations
- Model integration with mocked models
- Edge cases (zero values, extreme values)

#### test_auth.py
Tests for authentication functionality:
- JWT token creation and validation
- Token expiration handling
- User authentication flow
- Password hashing with bcrypt
- Current user retrieval from tokens
- Invalid token scenarios

#### test_schemas.py
Tests for Pydantic schema validation:
- UserCreate schema validation
- PatientData schema validation
- Input type conversions
- Required field validation
- Email format validation
- Date validation
- Partial updates with PatientDataUpdate

#### test_validators.py
Tests for custom input validators:
- Patient data range validation
- Email format validation
- Password strength requirements
- Phone number validation
- Username format validation
- Age validation (prevent division by zero)

### Integration Tests

#### test_api.py
End-to-end API endpoint tests:
- User registration and email verification
- Login and authentication flow
- Health record CRUD operations
- Prediction endpoint functionality
- Authentication required endpoints
- Error handling and edge cases

## Test Fixtures

Common fixtures available in `conftest.py`:

- `test_db_session` - In-memory SQLite database session
- `client` - FastAPI TestClient with database override
- `test_user` - Pre-created verified user for testing
- `unverified_user` - Pre-created unverified user
- `auth_headers` - Authorization headers with valid JWT token

## Writing New Tests

### Unit Test Example

```python
import pytest
from app.my_module import my_function

class TestMyFunction:
    """Test suite for my_function"""

    def test_valid_input(self):
        """Test that valid input returns expected output"""
        result = my_function(valid_input)
        assert result == expected_output

    def test_invalid_input_raises_error(self):
        """Test that invalid input raises appropriate error"""
        with pytest.raises(ValueError):
            my_function(invalid_input)
```

### Integration Test Example

```python
def test_my_endpoint(client, auth_headers):
    """Test my API endpoint"""
    response = client.post(
        "/my-endpoint",
        headers=auth_headers,
        json={"data": "value"}
    )

    assert response.status_code == 200
    assert "expected_field" in response.json()
```

## Validation Coverage

### Patient Data Validation
- Pregnancies: 0-20
- Glucose: 0-300 mg/dL
- Blood Pressure: 0-200 mmHg
- Insulin: 0-1000 μU/mL
- BMI: 10.0-70.0
- Diabetic Family History: 0 or 1
- Age: 1-120 years (cannot be 0)

### User Data Validation
- Email: Valid email format (via EmailStr)
- Password: Minimum 8 characters, must contain letters and numbers
- Username: 3-30 characters, alphanumeric + underscore only
- Phone: 10-15 digits
- Date of Birth: Must be in the past, not more than 120 years ago

## Continuous Integration

These tests are designed to run in CI/CD pipelines. Example GitHub Actions workflow:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.11
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirement.txt
      - name: Run tests
        run: |
          cd backend
          pytest --cov=app --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Best Practices

1. **Test Naming**: Use descriptive names that explain what is being tested
2. **Test Isolation**: Each test should be independent and not rely on others
3. **Mocking**: Mock external dependencies (database, ML models, email service)
4. **Fixtures**: Use fixtures for common setup to reduce code duplication
5. **Assertions**: Use clear, specific assertions with helpful error messages
6. **Coverage**: Aim for high test coverage but focus on meaningful tests
7. **Documentation**: Add docstrings to test classes and methods

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "SECRET_KEY not found"
- **Solution**: Tests should set `SECRET_KEY` in conftest.py environment setup

**Issue**: Database conflicts between tests
- **Solution**: Use in-memory SQLite and session fixtures with rollback

**Issue**: ML model files not found
- **Solution**: Mock the models in tests instead of loading actual files

**Issue**: Email sending failures
- **Solution**: Mock email service or set `EMAIL_ENABLED=false`

## Additional Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing Guide](https://fastapi.tiangolo.com/tutorial/testing/)
- [Pydantic Validation](https://docs.pydantic.dev/latest/usage/validators/)

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure all existing tests pass
3. Add tests for edge cases and error conditions
4. Update this documentation if adding new test categories
5. Run coverage report to identify untested code
