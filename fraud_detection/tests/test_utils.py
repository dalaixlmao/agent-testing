"""
Tests for utilities modules
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
import tempfile
import os

from utils.data_processing import DataPreprocessor, handle_class_imbalance, generate_synthetic_fraud_data
from utils.evaluation import ModelEvaluator
from utils.monitoring import ModelMonitor

class TestDataProcessing:
    """Test data processing utilities"""
    
    def test_data_preprocessor(self):
        """Test data preprocessor functionality"""
        # Create sample data
        data = pd.DataFrame({
            'num1': [1, 2, 3, 4, 5],
            'num2': [1.1, 2.2, np.nan, 4.4, 5.5],
            'cat1': ['A', 'B', 'A', 'C', 'B'],
            'cat2': ['X', 'Y', 'X', np.nan, 'Z'],
            'is_fraud': [0, 1, 0, 1, 0]
        })
        
        # Initialize preprocessor
        preprocessor = DataPreprocessor({
            'handle_missing': True,
            'feature_scaling': 'standard',
            'encoding_method': 'one_hot'
        })
        
        # Fit and transform
        processed_data = preprocessor.fit_transform(data)
        
        # Verify results
        assert isinstance(processed_data, pd.DataFrame)
        assert not processed_data.isnull().any().any()
        assert len(processed_data.columns) > len(data.columns) - 1  # One-hot encoding should increase columns
        
        # Check saving and loading
        with tempfile.TemporaryDirectory() as tmpdir:
            save_path = os.path.join(tmpdir, "preprocessor.joblib")
            preprocessor.save(save_path)
            
            # Load and transform again
            loaded_preprocessor = DataPreprocessor.load(save_path)
            processed_data2 = loaded_preprocessor.transform(data)
            
            # Results should be identical
            pd.testing.assert_frame_equal(processed_data, processed_data2)
    
    def test_handle_class_imbalance(self):
        """Test class imbalance handling"""
        # Create imbalanced data
        X = pd.DataFrame({
            'feature1': range(100),
            'feature2': range(100, 200)
        })
        y = pd.Series([0] * 90 + [1] * 10)  # 90% class 0, 10% class 1
        
        # Apply SMOTE
        X_resampled, y_resampled = handle_class_imbalance(X, y, method="smote")
        
        # Check class balance
        assert len(X_resampled) > len(X)
        assert y_resampled.value_counts()[0] == y_resampled.value_counts()[1]
    
    def test_synthetic_data_generation(self):
        """Test synthetic data generation"""
        # Generate data
        data = generate_synthetic_fraud_data(n_samples=1000, fraud_ratio=0.1)
        
        # Check data properties
        assert len(data) == 1000
        assert 'is_fraud' in data.columns
        assert data['is_fraud'].mean() == pytest.approx(0.1, abs=0.02)  # Allow small deviation due to randomness

class TestEvaluation:
    """Test evaluation utilities"""
    
    def test_model_evaluator(self):
        """Test model evaluator functionality"""
        # Mock model that always predicts 0
        class MockModel:
            def predict(self, X):
                return np.zeros(len(X))
            
            def predict_proba(self, X):
                probs = np.zeros((len(X), 2))
                probs[:, 0] = 0.8  # 80% confidence in class 0
                probs[:, 1] = 0.2
                return probs
        
        # Create sample data
        X = pd.DataFrame({
            'feature1': range(100),
            'feature2': range(100, 200)
        })
        y = pd.Series([0] * 80 + [1] * 20)  # 80% class 0, 20% class 1
        
        # Initialize evaluator
        evaluator = ModelEvaluator()
        
        # Evaluate model
        metrics = evaluator.evaluate(MockModel(), X, y, 'test')
        
        # Check metrics
        assert metrics['accuracy'] == 0.8  # 80/100 correct predictions
        assert metrics['precision'] == 0.0  # No positive predictions
        assert metrics['recall'] == 0.0  # No true positives
        assert metrics['tp'] == 0  # No true positives
        assert metrics['tn'] == 80  # All negative examples correctly classified
        assert metrics['fp'] == 0  # No false positives
        assert metrics['fn'] == 20  # All positive examples misclassified

class TestMonitoring:
    """Test monitoring utilities"""
    
    def test_model_monitor(self):
        """Test model monitor functionality"""
        # Initialize monitor
        with tempfile.TemporaryDirectory() as tmpdir:
            monitor = ModelMonitor({
                'enable_monitoring': True,
                'metrics_path': tmpdir
            })
            
            # Log a prediction
            monitor.log_prediction(
                prediction_id='test1',
                features={'feature1': 1, 'feature2': 2},
                prediction=0,
                probability=0.2,
                true_label=0
            )
            
            # Check that log file was created
            log_path = Path(tmpdir) / "prediction_logs.jsonl"
            assert log_path.exists()
            
            # Read log file
            with open(log_path, 'r') as f:
                log_content = f.read()
                assert 'test1' in log_content
                assert '"prediction": 0' in log_content