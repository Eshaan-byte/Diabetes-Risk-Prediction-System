# Diabetes Risk Prediction System

![Backend Tests](https://github.com/Eshaan-byte/Diabetes-Risk-Prediction-System/actions/workflows/backend-tests.yml/badge.svg)

A comprehensive web application for predicting diabetes risk using machine learning, featuring a React frontend and Flask backend with automated testing.

## Features

- **Risk Assessment**: Calculate diabetes risk based on health metrics
- **Data Visualization**: Interactive dashboard with charts and analytics
- **User Management**: Secure authentication and email verification
- **CSV Bulk Upload**: Process multiple health assessments at once
- **Historical Records**: Track and review past assessments
- **Automated Testing**: GitHub Actions CI/CD pipeline

## Tech Stack

### Frontend
- React + TypeScript
- Tailwind CSS
- Vite
- Lucide React (icons)
- PapaParse (CSV parsing)

### Backend
- Flask
- Python 3.10/3.11/3.12
- SQLite
- pytest (testing)

## Project Structure

```
.
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts
│   │   └── pages/       # Page components
│   └── package.json
├── backend/           # Flask backend
│   ├── app/
│   ├── tests/
│   └── requirement.txt
├── notebook/          # ML model development
└── .github/workflows/ # CI/CD pipelines
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.10 or higher)
- npm or yarn

### Backend Setup

```bash
cd backend
pip install -r requirement.txt
python run.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## Testing

### Backend Tests

```bash
cd backend
pytest
```

Tests are automatically run on every push and pull request via GitHub Actions.

## Health Metrics

The system requires the following health measurements:

- **Pregnancies**: Number of times pregnant (0-17)
- **Glucose**: Blood glucose level in mg/dL (44-199)
- **Blood Pressure**: Diastolic blood pressure in mmHg (24-122)
- **Insulin**: Serum insulin level in μU/mL (14-846)
- **BMI**: Body Mass Index (18.2-67.1)
- **Age**: Current age in years (21-81)
- **Diabetic Family**: Family history of diabetes (Yes/No)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.
