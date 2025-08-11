"""
Tests for model implementations
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
import tempfile
import os

from models.model_factory import ModelFactory
from models.tree_models import RandomForestModel, LightGBMModel
from models.ensemble_model import EnsembleModel

class TestModels:
    """Test model implementations"""
    
    @pytest.fixture
    def sample_data(self):
        """Create sample data for testing"""
        # Create synthetic data with 10 features and binary target
        np.random.seed(42)
        X = pd.DataFrame(np.random.randn(100, 10), 
                        columns=[f'feature_{i}' for i in range(10)])
        
        # Create a target that's a function of the features
        y = ((X['feature_0'] + X['feature_1'] - X['feature_2']) > 0).astype(int)
        
        return X, y
    
    def test_random_forest_model(self, sample_data):
        """Test Random Forest model"""
        X, y = sample_data
        
        # Create and train model
        model = RandomForestModel("test_rf", {"n_estimators": 10})
        model.fit(X, y)
        
        # Make predictions
        predictions = model.predict(X)
        probabilities = model.predict_proba(X)
        
        # Verify results
        assert len(predictions) == len(X)
        assert probabilities.shape == (len(X), 2)
        
        # Check feature importance
        importance = model.get_feature_importance()
        assert len(importance) == X.shape[1]
        
        # Test saving and loading
        with tempfile.TemporaryDirectory() as tmpdir:
            save_path = os.path.join(tmpdir, "model.joblib")
            model.save(save_path)
            
            # Load model
            loaded_model = RandomForestModel.load(save_path)
            
            # Check predictions match
            np.testing.assert_array_equal(
                model.predict(X),
                loaded_model.predict(X)
            )
    
    def test_lightgbm_model(self, sample_data):
        """Test LightGBM model"""
        X, y = sample_data
        
        # Create and train model
        model = LightGBMModel("test_lgb", {"n_estimators": 10})
        model.fit(X, y)
        
        # Make predictions
        predictions = model.predict(X)
        
        # Verify results
        assert len(predictions) == len(X)
        
        # Check feature importance
        importance = model.get_feature_importance()
        assert len(importance) == X.shape[1]
    
    def test_ensemble_model(self, sample_data):
        """Test Ensemble model"""
        X, y = sample_data
        
        # Create base models
        rf_model = RandomForestModel("rf_component", {"n_estimators": 10})
        lgb_model = LightGBMModel("lgb_component", {"n_estimators": 10})
        
        # Create and train ensemble
        ensemble = EnsembleModel("test_ensemble", {"voting": "soft"}, [rf_model, lgb_model])
        ensemble.fit(X, y)
        
        # Make predictions
        predictions = ensemble.predict(X)
        probabilities = ensemble.predict_proba(X)
        
        # Verify results
        assert len(predictions) == len(X)
        assert probabilities.shape == (len(X), 2)
        
        # Check feature importance (aggregated from base models)
        importance = ensemble.get_feature_importance()
        assert len(importance) == X.shape[1]

class TestModelFactory:
    """Test model factory"""
    
    @pytest.fixture
    def sample_data(self):
        """Create sample data for testing"""
        # Create synthetic data with 5 features and binary target
        np.random.seed(42)
        X = pd.DataFrame(np.random.randn(50, 5), 
                        columns=[f'feature_{i}' for i in range(5)])
        
        # Create a target that's a function of the features
        y = ((X['feature_0'] + X['feature_1']) > 0).astype(int)
        
        return X, y
    
    def test_create_model(self, sample_data):
        """Test creating models via factory"""
        X, y = sample_data
        
        # List available model types
        model_types = ModelFactory.list_available_models()
        assert len(model_types) > 0
        
        # Create a random forest model
        rf_model = ModelFactory.create_model("random_forest", "test_factory_rf")
        assert isinstance(rf_model, RandomForestModel)
        
        # Train and make predictions
        rf_model.fit(X, y)
        predictions = rf_model.predict(X)
        assert len(predictions) == len(X)
        
        # Create an ensemble model
        ensemble = ModelFactory.create_model("ensemble", "test_factory_ensemble")
        assert isinstance(ensemble, EnsembleModel)
        assert len(ensemble.base_models) > 0