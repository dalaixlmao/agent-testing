"""
Tests for API endpoints
"""

import pytest
import json
import pandas as pd
import numpy as np
from pathlib import Path
import tempfile
import os
from fastapi.testclient import TestClient

# We need to mock the model loading for testing
import sys
from unittest.mock import patch, MagicMock

# Import the API app
from api import app

# Create test client
client = TestClient(app)

# Mock model for testing
class MockModel:
    def __init__(self):
        self.model_name = "mock_model"
        self.model_type = "test_model"
        self.feature_names = ["feature_1", "feature_2", "feature_3"]
        self.metadata = {
            "created_at": "2023-01-01T00:00:00",
            "model_version": "1.0.0"
        }
    
    def predict(self, X):
        # Return 1 (fraud) for any transaction with amount > 1000
        if 'amount' in X.columns:
            return (X['amount'] > 1000).astype(int).values
        return np.zeros(len(X))
    
    def predict_proba(self, X):
        probs = np.zeros((len(X), 2))
        if 'amount' in X.columns:
            fraud_prob = X['amount'] / 2000
            fraud_prob = np.clip(fraud_prob, 0.01, 0.99)
            probs[:, 1] = fraud_prob
            probs[:, 0] = 1 - fraud_prob
        else:
            probs[:, 0] = 0.9
            probs[:, 1] = 0.1
        return probs

# Mock preprocessor for testing
class MockPreprocessor:
    def transform(self, X):
        return X

@pytest.fixture
def mock_dependencies():
    """Mock the model and preprocessor dependencies"""
    with patch("api.model", MockModel()), \
         patch("api.preprocessor", MockPreprocessor()), \
         patch("api.monitor", MagicMock()):
        yield

class TestAPI:
    """Test API endpoints"""
    
    def test_health_check(self, mock_dependencies):
        """Test health check endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["model_loaded"] == True
        assert data["preprocessor_loaded"] == True
    
    def test_model_info(self, mock_dependencies):
        """Test model info endpoint"""
        response = client.get("/info")
        assert response.status_code == 200
        data = response.json()
        assert data["model_name"] == "mock_model"
        assert data["model_type"] == "test_model"
        assert len(data["features"]) == 3
    
    def test_predict_endpoint(self, mock_dependencies):
        """Test prediction endpoint"""
        # Test data with one low-amount transaction and one high-amount transaction
        test_data = {
            "transactions": [
                {"amount": 100.0, "feature_1": 1, "feature_2": 2},
                {"amount": 2000.0, "feature_1": 3, "feature_2": 4}
            ],
            "threshold": 0.5,
            "include_probability": True
        }
        
        response = client.post("/predict", json=test_data)
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "predictions" in data
        assert "model_version" in data
        assert "prediction_id" in data
        assert "prediction_time" in data
        
        # Check predictions
        assert len(data["predictions"]) == 2
        assert data["predictions"][0]["is_fraud"] == False  # Low amount -> not fraud
        assert data["predictions"][1]["is_fraud"] == True   # High amount -> fraud
        
        # Check probabilities
        assert "fraud_probability" in data["predictions"][0]
        assert "fraud_probability" in data["predictions"][1]
        assert data["predictions"][0]["fraud_probability"] < 0.5
        assert data["predictions"][1]["fraud_probability"] > 0.5
    
    def test_predict_without_probability(self, mock_dependencies):
        """Test prediction endpoint without probability"""
        test_data = {
            "transactions": [
                {"amount": 100.0, "feature_1": 1, "feature_2": 2}
            ],
            "include_probability": False
        }
        
        response = client.post("/predict", json=test_data)
        assert response.status_code == 200
        data = response.json()
        
        # Check that probability is not included
        assert "fraud_probability" not in data["predictions"][0]