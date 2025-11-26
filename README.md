# Diabetes Risk Prediction System

[![Backend Tests](https://github.com/Eshaan-byte/Diabetes-Risk-Prediction-System/actions/workflows/backend-tests.yml/badge.svg)](https://github.com/Eshaan-byte/Diabetes-Risk-Prediction-System/actions/workflows/backend-tests.yml)

A comprehensive diabetes risk prediction system powered by machine learning, featuring automated patient data analysis, risk assessment, and health recommendations.

## Features

- **Machine Learning Models**: Multiple ML models (XGBoost, Random Forest, etc.) for accurate diabetes risk prediction
- **Patient Management**: Complete CRUD operations for patient records
- **Risk Assessment**: Dynamic risk-level based health recommendations
- **Email Verification**: Secure user authentication with email verification
- **Interactive Dashboard**: Visualize health metrics and trends
- **Data Validation**: Comprehensive input validation and business rules
- **RESTful API**: FastAPI-powered backend with automatic documentation

## Tech Stack

### Backend
- FastAPI
- SQLModel / SQLAlchemy
- PostgreSQL
- scikit-learn / XGBoost
- pytest (with 114+ test cases)

### Frontend
- React
- React Router
- Data visualization libraries

## Getting Started

### Backend Setup

```bash
cd backend
pip install -r requirement.txt
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Testing

The project includes comprehensive automated testing with GitHub Actions CI/CD:

- Unit tests for ML inference, authentication, schemas, and validators
- Integration tests for all API endpoints
- Code coverage reporting
- Automated testing on every push and pull request

Run tests locally:
```bash
cd backend
pytest -v --cov=app
```

See [TESTING.md](TESTING.md) for detailed testing documentation.

## Documentation

- [User Manual](USER_MANUAL.md)
- [Testing Guide](TESTING.md)
- [Backend Tests README](backend/tests/README.md)

## CI/CD

This project uses GitHub Actions for continuous integration:
- Automated testing on Python 3.10, 3.11, and 3.12
- Code coverage reporting with Codecov
- Linting with flake8, black, and isort
- Runs on every push and pull request to main/develop branches

## License

This project is part of an academic assignment.

## Contributors

- Eshaan Gupta
- Anusha Molusneha
