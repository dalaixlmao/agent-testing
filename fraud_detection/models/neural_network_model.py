"""
Neural network model implementation for fraud detection
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Union, Optional, Any
import logging
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler

from models.base_model import BaseModel

logger = logging.getLogger(__name__)

class NeuralNetworkModel(BaseModel):
    """
    Neural Network model for fraud detection using scikit-learn's MLPClassifier
    """
    
    def __init__(self, model_name: str, config: Dict = None):
        """
        Initialize the Neural Network model
        
        Args:
            model_name: Name of the model
            config: Dictionary with model configuration parameters
        """
        super().__init__(model_name, "neural_network", config)
        self.scaler = StandardScaler()
    
    def fit(self, X: pd.DataFrame, y: pd.Series) -> "NeuralNetworkModel":
        """
        Train the model
        
        Args:
            X: Feature matrix
            y: Target vector
            
        Returns:
            self: The trained model
        """
        logger.info(f"Training Neural Network model: {self.model_name}")
        
        # Scale the features (neural networks work better with scaled features)
        X_scaled = self.scaler.fit_transform(X)
        
        # Create and train the model
        self.model = MLPClassifier(
            hidden_layer_sizes=self.config.get("hidden_layer_sizes", (100, 50)),
            activation=self.config.get("activation", "relu"),
            solver=self.config.get("solver", "adam"),
            alpha=self.config.get("alpha", 0.0001),
            batch_size=self.config.get("batch_size", 32),
            learning_rate=self.config.get("learning_rate", "adaptive"),
            learning_rate_init=self.config.get("learning_rate_init", 0.001),
            max_iter=self.config.get("max_iter", 200),
            early_stopping=self.config.get("early_stopping", True),
            validation_fraction=self.config.get("validation_fraction", 0.1),
            n_iter_no_change=self.config.get("n_iter_no_change", 10),
            random_state=self.config.get("random_state", 42)
        )
        
        self.model.fit(X_scaled, y)
        
        # Store feature names
        self.set_feature_names(list(X.columns))
        
        # Log training results
        logger.info(f"Neural Network converged: {self.model.n_iter_ < self.model.max_iter}")
        logger.info(f"Number of iterations: {self.model.n_iter_}")
        logger.info(f"Final loss: {self.model.loss_:.6f}")
        
        # Since MLPClassifier doesn't have feature_importances_, we can't log that
        
        return self
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """
        Make predictions
        
        Args:
            X: Feature matrix
            
        Returns:
            Model predictions
        """
        if self.model is None:
            raise ValueError("Model not trained yet")
        
        # Scale the features
        X_scaled = self.scaler.transform(X)
        
        return self.model.predict(X_scaled)
    
    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """
        Predict class probabilities
        
        Args:
            X: Feature matrix
            
        Returns:
            Class probabilities (n_samples, n_classes)
        """
        if self.model is None:
            raise ValueError("Model not trained yet")
        
        # Scale the features
        X_scaled = self.scaler.transform(X)
        
        return self.model.predict_proba(X_scaled)
    
    def get_feature_importance(self) -> Dict[str, float]:
        """
        Get feature importances for neural network
        
        For neural networks, this is approximated by looking at the weights of the first layer
        
        Returns:
            Dictionary mapping feature names to importance values
        """
        if self.model is None:
            raise ValueError("Model not trained yet")
        
        # For MLPClassifier, we can approximate feature importance using the weights of the first layer
        if not hasattr(self.model, 'coefs_') or len(self.model.coefs_) == 0:
            logger.warning("Neural network doesn't have fitted coefficients")
            return {}
        
        # Get weights from first layer
        first_layer_weights = self.model.coefs_[0]
        
        # Calculate importance as the sum of absolute weights for each feature
        importances = np.sum(np.abs(first_layer_weights), axis=1)
        
        # Normalize
        importances = importances / np.sum(importances)
        
        if self.feature_names is None:
            return {f"feature_{i}": float(imp) for i, imp in enumerate(importances)}
        
        return {name: float(imp) for name, imp in zip(self.feature_names, importances)}
    
    def save(self, path: Optional[Union[str, Path]] = None) -> str:
        """
        Save the model and scaler
        
        Args:
            path: Path to save the model to
            
        Returns:
            Path where the model was saved
        """
        # Include the scaler in the metadata
        self.metadata["scaler"] = self.scaler
        
        return super().save(path)
    
    @classmethod
    def load(cls, path: Union[str, Path]) -> "NeuralNetworkModel":
        """
        Load a neural network model from disk
        
        Args:
            path: Path to load the model from
            
        Returns:
            Loaded neural network model
        """
        model = super(NeuralNetworkModel, cls).load(path)
        
        # Restore the scaler from metadata
        if "scaler" in model.metadata:
            model.scaler = model.metadata["scaler"]
        
        return model