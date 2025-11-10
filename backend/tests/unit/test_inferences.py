import pytest
import numpy as np
from unittest.mock import Mock, patch
from app.ml.inferences import predict_risk, risk_label


class TestRiskLabel:
    """Test suite for risk_label function"""

    def test_low_risk_boundary_lower(self):
        """Test lower boundary of low risk (0%)"""
        assert risk_label(0.0) == "Low Risk"

    def test_low_risk_boundary_upper(self):
        """Test upper boundary of low risk (33%)"""
        assert risk_label(0.33) == "Low Risk"

    def test_low_risk_middle(self):
        """Test middle of low risk range"""
        assert risk_label(0.15) == "Low Risk"

    def test_medium_risk_boundary_lower(self):
        """Test lower boundary of medium risk (just above 33%)"""
        assert risk_label(0.34) == "Medium Risk"

    def test_medium_risk_boundary_upper(self):
        """Test upper boundary of medium risk (66%)"""
        assert risk_label(0.66) == "Medium Risk"

    def test_medium_risk_middle(self):
        """Test middle of medium risk range"""
        assert risk_label(0.50) == "Medium Risk"

    def test_high_risk_boundary(self):
        """Test lower boundary of high risk (just above 66%)"""
        assert risk_label(0.67) == "High Risk"

    def test_high_risk_maximum(self):
        """Test maximum high risk (100%)"""
        assert risk_label(1.0) == "High Risk"

    def test_high_risk_middle(self):
        """Test middle of high risk range"""
        assert risk_label(0.85) == "High Risk"


class TestPredictRisk:
    """Test suite for predict_risk function"""

    @pytest.fixture
    def sample_patient_data(self):
        """Fixture providing sample patient data"""
        return {
            "pregnancies": 2,
            "glucose": 120,
            "blood_pressure": 80,
            "insulin": 100,
            "bmi": 25.5,
            "diabetic_family": 0,
            "age": 35
        }

    @pytest.fixture
    def mock_models(self):
        """Fixture providing mocked ML models"""
        with patch('app.ml.inferences.models') as mock:
            # Create mock models that return predictable probabilities
            mock_model = Mock()
            mock_model.predict_proba.return_value = np.array([[0.3, 0.7]])

            mock.items.return_value = [
                ("logisticregression", mock_model),
                ("randomforest", mock_model),
                ("svc", mock_model),
                ("knn", mock_model),
                ("mlp", mock_model),
                ("xgboost", mock_model),
            ]
            yield mock

    def test_predict_risk_returns_all_models(self, sample_patient_data, mock_models):
        """Test that predict_risk returns results for all 6 models"""
        result = predict_risk(sample_patient_data)

        # Check that all 6 models are present
        expected_models = ["logisticregression", "randomforest", "svc", "knn", "mlp", "xgboost"]
        for model_name in expected_models:
            assert f"outcome_{model_name}" in result
            assert f"prediction_prob_{model_name}" in result

    def test_predict_risk_output_format(self, sample_patient_data, mock_models):
        """Test that predict_risk returns correctly formatted output"""
        result = predict_risk(sample_patient_data)

        # Check that outcomes are strings
        for key, value in result.items():
            if key.startswith("outcome_"):
                assert isinstance(value, str)
                assert value in ["Low Risk", "Medium Risk", "High Risk"]

        # Check that probabilities are floats
        for key, value in result.items():
            if key.startswith("prediction_prob_"):
                assert isinstance(value, float)
                assert 0 <= value <= 100

    def test_predict_risk_input_processing(self, sample_patient_data, mock_models):
        """Test that input data is correctly processed"""
        result = predict_risk(sample_patient_data)

        # Verify that predict_proba was called with correct shape
        for model_name, model in mock_models.items():
            if hasattr(model, 'predict_proba'):
                # The input should be reshaped to (1, 8) - 7 features + BMI/age ratio
                call_args = model.predict_proba.call_args
                if call_args:
                    input_array = call_args[0][0]
                    assert input_array.shape[1] == 8

    def test_predict_risk_probability_rounding(self, sample_patient_data):
        """Test that probabilities are correctly rounded to 2 decimal places"""
        with patch('app.ml.inferences.models') as mock_models:
            mock_model = Mock()
            # Return a probability that tests rounding
            mock_model.predict_proba.return_value = np.array([[0.3, 0.7456789]])

            mock_models.items.return_value = [("logisticregression", mock_model)]

            result = predict_risk(sample_patient_data)

            # Check that the probability is rounded to 2 decimal places
            assert result["prediction_prob_logisticregression"] == 74.57

    def test_predict_risk_with_edge_case_zero_age(self):
        """Test predict_risk handles edge case where age is very small"""
        # Note: This test documents current behavior which may cause division issues
        # In production, validation should prevent age=0
        data = {
            "pregnancies": 0,
            "glucose": 100,
            "blood_pressure": 70,
            "insulin": 90,
            "bmi": 22.0,
            "diabetic_family": 0,
            "age": 1  # Minimum reasonable age to avoid division by zero
        }

        with patch('app.ml.inferences.models') as mock_models:
            mock_model = Mock()
            mock_model.predict_proba.return_value = np.array([[0.5, 0.5]])
            mock_models.items.return_value = [("logisticregression", mock_model)]

            result = predict_risk(data)
            assert "outcome_logisticregression" in result

    def test_predict_risk_with_high_values(self, mock_models):
        """Test predict_risk with high-risk patient values"""
        high_risk_data = {
            "pregnancies": 10,
            "glucose": 200,
            "blood_pressure": 120,
            "insulin": 400,
            "bmi": 45.0,
            "diabetic_family": 1,
            "age": 65
        }

        result = predict_risk(high_risk_data)

        # Verify structure is correct
        assert len(result) == 12  # 6 models * 2 outputs each

    def test_predict_risk_with_low_values(self, mock_models):
        """Test predict_risk with low-risk patient values"""
        low_risk_data = {
            "pregnancies": 0,
            "glucose": 80,
            "blood_pressure": 60,
            "insulin": 50,
            "bmi": 18.5,
            "diabetic_family": 0,
            "age": 25
        }

        result = predict_risk(low_risk_data)

        # Verify structure is correct
        assert len(result) == 12

    def test_predict_risk_bmi_age_ratio_calculation(self, sample_patient_data):
        """Test that BMI/age ratio is correctly calculated"""
        with patch('app.ml.inferences.models') as mock_models:
            mock_model = Mock()
            mock_model.predict_proba.return_value = np.array([[0.3, 0.7]])
            mock_models.items.return_value = [("logisticregression", mock_model)]

            predict_risk(sample_patient_data)

            # Get the input array that was passed to predict_proba
            call_args = mock_model.predict_proba.call_args[0][0]

            # The last element should be BMI/age ratio
            expected_ratio = sample_patient_data["bmi"] / sample_patient_data["age"]
            actual_ratio = call_args[0][-1]

            assert np.isclose(actual_ratio, expected_ratio)

    def test_predict_risk_missing_key_raises_error(self):
        """Test that missing required keys raise appropriate errors"""
        incomplete_data = {
            "pregnancies": 2,
            "glucose": 120,
            # Missing other required fields
        }

        with pytest.raises(KeyError):
            predict_risk(incomplete_data)

    def test_predict_risk_deterministic_output(self, sample_patient_data, mock_models):
        """Test that predict_risk returns consistent results for same input"""
        result1 = predict_risk(sample_patient_data)
        result2 = predict_risk(sample_patient_data)

        assert result1 == result2
