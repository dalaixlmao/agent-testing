"""
Base model class for fraud detection
"""

import joblib
import numpy as np
import pandas as pd
from abc import ABC, abstractmethod
from typing import Dict, List, Union, Optional, Any, Tuple
from pathlib import Path
import logging
import time
from datetime import datetime
import json

from config import MODEL_REGISTRY_PATH
from utils.evaluation import ModelEvaluator

logger = logging.getLogger(__name__)

class BaseModel(ABC):
    """
    Abstract base class for fraud detection models
    """
    
    def __init__(self, model_name: str, model_type: str, config: Dict = None):
        """
        Initialize the model
        
        Args:
            model_name: Name of the model
            model_type: Type of model (e.g., "random_forest", "lightgbm")
            config: Dictionary with model configuration parameters
        """
        self.model_name = model_name
        self.model_type = model_type
        self.config = config or {}
        self.model = None
        self.feature_names = None
        self.metadata = {
            "created_at": datetime.now().isoformat(),
            "model_name": model_name,
            "model_type": model_type
        }
        self.evaluator = ModelEvaluator()
    
    @abstractmethod
    def fit(self, X: pd.DataFrame, y: pd.Series) -> "BaseModel":
        """
        Train the model
        
        Args:
            X: Feature matrix
            y: Target vector
            
        Returns:
            self: The trained model
        """
        pass
    
    @abstractmethod
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """
        Make predictions
        
        Args:
            X: Feature matrix
            
        Returns:
            Model predictions
        """
        pass
    
    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """
        Predict class probabilities
        
        Args:
            X: Feature matrix
            
        Returns:
            Class probabilities (n_samples, n_classes)
        """
        if not hasattr(self.model, 'predict_proba'):
            raise NotImplementedError("Model doesn't support probability predictions")
        
        return self.model.predict_proba(X)
    
    def evaluate(self, 
                X: pd.DataFrame, 
                y: pd.Series,
                dataset_name: str = "test") -> Dict[str, float]:
        """
        Evaluate the model
        
        Args:
            X: Feature matrix
            y: Target vector
            dataset_name: Name of the dataset (e.g., "train", "test")
            
        Returns:
            Dictionary of evaluation metrics
        """
        return self.evaluator.evaluate(self.model, X, y, dataset_name)
    
    def save(self, path: Optional[Union[str, Path]] = None) -> str:
        """
        Save the model to disk
        
        Args:
            path: Path to save the model to. If not specified, a default path is generated.
            
        Returns:
            The path where the model was saved
        """
        if path is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            model_dir = MODEL_REGISTRY_PATH / f"{self.model_name}_{timestamp}"
            model_dir.mkdir(parents=True, exist_ok=True)
            path = model_dir / "model.joblib"
        else:
            path = Path(path)
            path.parent.mkdir(parents=True, exist_ok=True)
        
        # Update metadata with current timestamp
        self.metadata.update({
            "saved_at": datetime.now().isoformat(),
            "model_path": str(path)
        })
        
        if self.feature_names is not None:
            self.metadata["feature_names"] = self.feature_names
        
        # Save model and metadata
        model_data = {
            "model": self.model,
            "metadata": self.metadata,
            "model_class": self.__class__.__name__,
            "config": self.config
        }
        
        joblib.dump(model_data, path)
        
        # Save metadata separately for easier access
        metadata_path = path.parent / "metadata.json"
        with open(metadata_path, "w") as f:
            json.dump(self.metadata, f, indent=2)
        
        logger.info(f"Model saved to {path}")
        
        return str(path)
    
    @classmethod
    def load(cls, path: Union[str, Path]) -> "BaseModel":
        """
        Load a model from disk
        
        Args:
            path: Path to load the model from
            
        Returns:
            Loaded model
        """
        path = Path(path)
        
        # Load model data
        model_data = joblib.load(path)
        
        if not isinstance(model_data, dict) or "model" not in model_data:
            raise ValueError(f"Invalid model data at {path}")
        
        # Extract components
        model_instance = model_data["model"]
        metadata = model_data.get("metadata", {})
        config = model_data.get("config", {})
        model_name = metadata.get("model_name", "unknown_model")
        model_type = metadata.get("model_type", "unknown_type")
        
        # Create instance
        instance = cls(model_name, model_type, config)
        instance.model = model_instance
        instance.metadata = metadata
        instance.feature_names = metadata.get("feature_names")
        
        logger.info(f"Model loaded from {path}")
        
        return instance
    
    def set_feature_names(self, feature_names: List[str]) -> None:
        """
        Set the feature names used by the model
        
        Args:
            feature_names: List of feature names
        """
        self.feature_names = feature_names
        self.metadata["feature_names"] = feature_names
    
    def get_feature_importance(self) -> Dict[str, float]:
        """
        Get feature importances if available
        
        Returns:
            Dictionary mapping feature names to importance values
        """
        if self.model is None:
            raise ValueError("Model not trained yet")
        
        if not hasattr(self.model, 'feature_importances_'):
            logger.warning("Model doesn't provide feature importances")
            return {}
        
        importances = self.model.feature_importances_
        
        if self.feature_names is None or len(self.feature_names) != len(importances):
            logger.warning("Feature names not available or mismatch in length")
            return {f"feature_{i}": imp for i, imp in enumerate(importances)}
        
        return {name: float(imp) for name, imp in zip(self.feature_names, importances)}