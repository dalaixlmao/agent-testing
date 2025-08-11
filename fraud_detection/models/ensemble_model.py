"""
Ensemble model implementation for fraud detection
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Union, Optional, Any
import logging
from sklearn.ensemble import VotingClassifier

from models.base_model import BaseModel

logger = logging.getLogger(__name__)

class EnsembleModel(BaseModel):
    """
    Ensemble model that combines multiple base models
    """
    
    def __init__(self, model_name: str, config: Dict = None, base_models: List[BaseModel] = None):
        """
        Initialize the ensemble model
        
        Args:
            model_name: Name of the model
            config: Dictionary with model configuration parameters
            base_models: List of base models to include in the ensemble
        """
        super().__init__(model_name, "ensemble", config)
        self.base_models = base_models or []
        
        # Store list of base model names in metadata
        self.metadata["base_model_types"] = [model.model_type for model in self.base_models]
        self.metadata["base_model_names"] = [model.model_name for model in self.base_models]
    
    def fit(self, X: pd.DataFrame, y: pd.Series) -> "EnsembleModel":
        """
        Train the ensemble model
        
        Args:
            X: Feature matrix
            y: Target vector
            
        Returns:
            self: The trained model
        """
        logger.info(f"Training Ensemble model: {self.model_name} with {len(self.base_models)} base models")
        
        # Check if we have base models
        if not self.base_models:
            raise ValueError("No base models provided for the ensemble")
        
        # Train each base model
        for i, model in enumerate(self.base_models):
            logger.info(f"Training base model {i+1}/{len(self.base_models)}: {model.model_name}")
            model.fit(X, y)
        
        # Create a voting classifier
        voting_type = self.config.get("voting", "soft")
        
        estimators = [
            (model.model_name, model.model) 
            for model in self.base_models
            if hasattr(model.model, 'predict_proba') or voting_type == 'hard'
        ]
        
        self.model = VotingClassifier(
            estimators=estimators,
            voting=voting_type,
            weights=self.config.get("weights", None)
        )
        
        self.model.fit(X, y)
        
        # Store feature names
        self.set_feature_names(list(X.columns))
        
        # Evaluate individual models
        logger.info("Base model performances:")
        for model in self.base_models:
            metrics = model.evaluate(X, y, dataset_name="train")
            logger.info(f"  {model.model_name}: F1={metrics['f1']:.4f}, Precision={metrics['precision']:.4f}, Recall={metrics['recall']:.4f}")
        
        return self
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """
        Make predictions using the ensemble
        
        Args:
            X: Feature matrix
            
        Returns:
            Model predictions
        """
        if self.model is None:
            raise ValueError("Model not trained yet")
        
        return self.model.predict(X)
    
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
        
        if not hasattr(self.model, 'predict_proba'):
            logger.warning("Voting classifier doesn't support probability predictions, falling back to decision function")
            # For hard voting with models that don't support predict_proba
            scores = self.model.decision_function(X)
            # Convert decision function to pseudo-probabilities
            probs = np.zeros((X.shape[0], 2))
            probs[:, 1] = 1 / (1 + np.exp(-scores))
            probs[:, 0] = 1 - probs[:, 1]
            return probs
        
        return self.model.predict_proba(X)
    
    def get_feature_importance(self) -> Dict[str, float]:
        """
        Get aggregated feature importances from base models
        
        Returns:
            Dictionary mapping feature names to importance values
        """
        if not self.base_models:
            return {}
        
        # Collect feature importances from all base models
        all_importances = {}
        
        for model in self.base_models:
            try:
                model_importances = model.get_feature_importance()
                
                for feature, importance in model_importances.items():
                    if feature not in all_importances:
                        all_importances[feature] = []
                    all_importances[feature].append(importance)
            except Exception as e:
                logger.warning(f"Could not get feature importances from {model.model_name}: {e}")
        
        # Aggregate (average) the importances
        aggregated_importances = {}
        
        for feature, importances in all_importances.items():
            aggregated_importances[feature] = np.mean(importances)
        
        # Normalize
        total = sum(aggregated_importances.values())
        if total > 0:
            for feature in aggregated_importances:
                aggregated_importances[feature] /= total
        
        return aggregated_importances
    
    def add_model(self, model: BaseModel) -> None:
        """
        Add a model to the ensemble
        
        Args:
            model: Model to add
        """
        self.base_models.append(model)
        
        # Update metadata
        self.metadata["base_model_types"] = [model.model_type for model in self.base_models]
        self.metadata["base_model_names"] = [model.model_name for model in self.base_models]
        
        logger.info(f"Added {model.model_name} to ensemble {self.model_name}")
    
    def save(self, path: Optional[Union[str, Path]] = None) -> str:
        """
        Save the ensemble model and all base models
        
        Args:
            path: Path to save the model to
            
        Returns:
            Path where model was saved
        """
        # Save the ensemble model
        ensemble_path = super().save(path)
        
        # Save each base model in a subdirectory
        if path is None:
            base_dir = Path(ensemble_path).parent / "base_models"
            base_dir.mkdir(parents=True, exist_ok=True)
            
            for i, model in enumerate(self.base_models):
                model_path = base_dir / f"{model.model_name}.joblib"
                model.save(model_path)
        
        return ensemble_path