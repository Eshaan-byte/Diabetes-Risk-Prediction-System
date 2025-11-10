#!/usr/bin/env python3
"""
Verify test suite structure and provide setup instructions
"""
import os
import sys

def check_file(path, description):
    """Check if a file exists"""
    exists = os.path.exists(path)
    status = "✓" if exists else "✗"
    print(f"{status} {description}: {path}")
    return exists

def main():
    print("=" * 60)
    print("Test Suite Verification")
    print("=" * 60)
    print()

    all_good = True

    # Check test directories
    print("📁 Test Structure:")
    all_good &= check_file("tests/__init__.py", "Tests package")
    all_good &= check_file("tests/conftest.py", "Pytest config")
    all_good &= check_file("tests/unit/__init__.py", "Unit tests package")
    all_good &= check_file("tests/integration/__init__.py", "Integration tests package")
    print()

    # Check unit test files
    print("🧪 Unit Tests:")
    all_good &= check_file("tests/unit/test_inferences.py", "ML inference tests")
    all_good &= check_file("tests/unit/test_auth.py", "Authentication tests")
    all_good &= check_file("tests/unit/test_schemas.py", "Schema validation tests")
    all_good &= check_file("tests/unit/test_validators.py", "Custom validator tests")
    print()

    # Check integration test files
    print("🔗 Integration Tests:")
    all_good &= check_file("tests/integration/test_api.py", "API endpoint tests")
    print()

    # Check configuration files
    print("⚙️  Configuration:")
    all_good &= check_file("pytest.ini", "Pytest configuration")
    all_good &= check_file("requirement.txt", "Dependencies file")
    print()

    # Check validation files
    print("✅ Validation:")
    all_good &= check_file("app/validators.py", "Custom validators")
    all_good &= check_file("app/schemas.py", "Enhanced schemas")
    print()

    # Check documentation
    print("📚 Documentation:")
    all_good &= check_file("tests/README.md", "Test documentation")
    all_good &= check_file("../TESTING.md", "Testing guide")
    print()

    # Count test functions
    test_count = 0
    for root, dirs, files in os.walk("tests"):
        for file in files:
            if file.startswith("test_") and file.endswith(".py"):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                    test_count += content.count("def test_")

    print("=" * 60)
    if all_good:
        print("✓ All test files are present!")
        print(f"✓ Found {test_count} test functions")
        print()
        print("To run the tests:")
        print()
        print("  Option 1 - Quick Setup:")
        print("    ./run_tests.sh")
        print()
        print("  Option 2 - Manual Setup:")
        print("    python3 -m venv venv")
        print("    source venv/bin/activate")
        print("    pip install -r requirement.txt")
        print("    pytest -v")
        print()
        print("  Option 3 - With Coverage:")
        print("    source venv/bin/activate")
        print("    pytest --cov=app --cov-report=html")
        print("    open htmlcov/index.html")
        print()
    else:
        print("✗ Some test files are missing!")
        sys.exit(1)

    print("=" * 60)

if __name__ == "__main__":
    main()
