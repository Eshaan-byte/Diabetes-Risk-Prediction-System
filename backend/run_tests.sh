#!/bin/bash

# Script to set up and run tests for the Health Records API

echo "================================"
echo "Health Records API Test Runner"
echo "================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
    echo ""
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install/upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip -q

# Install dependencies
echo "Installing dependencies..."
pip install -r requirement.txt -q

echo ""
echo "✓ Dependencies installed"
echo ""

# Run tests
echo "================================"
echo "Running Tests"
echo "================================"
echo ""

python -m pytest -v --tb=short

echo ""
echo "================================"
echo "Test run complete!"
echo "================================"
echo ""
echo "To run tests with coverage:"
echo "  source venv/bin/activate"
echo "  pytest --cov=app --cov-report=html"
echo "  open htmlcov/index.html"
echo ""
