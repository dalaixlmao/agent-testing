"""
Factory class for creating fraud detection models
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Union, Optional, Any, Tuple
import logging

# Import model implementations
from models.tree_models import (
    RandomForestModel,
    GradientBoostingModel,
    LightGBMModel,
    XGBoostModel,
    CatBoostModel
)
from models.ensemble_model import EnsembleModel
from models.neural_network_model import NeuralNetworkModel
from models.deep_learning_model import DeepLearningModel

from config import DEFAULT_MODEL_CONFIG

logger = logging.getLogger(__name__)

class ModelFactory:
    """
    Factory class for creating fraud detection models
    """
    
    @staticmethod
    def create_model(model_type: str, model_name: Optional[str] = None, config: Optional[Dict] = None) -> Any:
        """
        Create a model of the specified type
        
        Args:
            model_type: Type of model to create
            model_name: Name for the model (defaults to model_type if not provided)
            config: Model configuration parameters
            
        Returns:
            An instance of the specified model type
        """
        model_name = model_name or f"fraud_detection_{model_type}"
        
        # Get default config for model type
        default_config = DEFAULT_MODEL_CONFIG.get(model_type, {})
        
        # Merge with provided config, prioritizing provided values
        merged_config = default_config.copy()
        if config:
            merged_config.update(config)
        
        logger.info(f"Creating {model_type} model with name: {model_name}")
        
        # Create appropriate model type
        if model_type == "random_forest":
            return RandomForestModel(model_name, merged_config)
            
        elif model_type == "gradient_boosting":
            return GradientBoostingModel(model_name, merged_config)
            
        elif model_type == "lightgbm":
            return LightGBMModel(model_name, merged_config)
            
        elif model_type == "xgboost":
            return XGBoostModel(model_name, merged_config)
            
        elif model_type == "catboost":
            return CatBoostModel(model_name, merged_config)
            
        elif model_type == "neural_network":
            return NeuralNetworkModel(model_name, merged_config)
            
        elif model_type == "deep_learning":
            return DeepLearningModel(model_name, merged_config)
            
        elif model_type == "ensemble":
            # For ensemble, create the component models first
            component_model_types = merged_config.get("models", ["lightgbm", "xgboost", "catboost"])
            component_models = []
            
            for i, cmt in enumerate(component_model_types):
                component_name = f"{model_name}_component_{i}_{cmt}"
                component = ModelFactory.create_model(cmt, component_name)
                component_models.append(component)
            
            return EnsembleModel(model_name, merged_config, component_models)
            
        else:
            raise ValueError(f"Unknown model type: {model_type}")
    
    @staticmethod
    def list_available_models() -> List[str]:
        """
        List all available model types
        
        Returns:
            List of available model types
        """
        return list(DEFAULT_MODEL_CONFIG.keys())