"""
Tree-based model implementations for fraud detection
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Union, Optional, Any
import logging

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
import lightgbm as lgb
import xgboost as xgb
import catboost as cb

from models.base_model import BaseModel

logger = logging.getLogger(__name__)


class RandomForestModel(BaseModel):
    """
    Random Forest model for fraud detection
    """
    
    def __init__(self, model_name: str, config: Dict = None):
        """
        Initialize the Random Forest model
        
        Args:
            model_name: Name of the model
            config: Dictionary with model configuration parameters
        """
        super().__init__(model_name, "random_forest", config)
    
    def fit(self, X: pd.DataFrame, y: pd.Series) -> "RandomForestModel":
        """
        Train the model
        
        Args:
            X: Feature matrix
            y: Target vector
            
        Returns:
            self: The trained model
        """
        logger.info(f"Training Random Forest model: {self.model_name}")
        
        # Create and train the model
        self.model = RandomForestClassifier(
            n_estimators=self.config.get("n_estimators", 100),
            max_depth=self.config.get("max_depth", 10),
            min_samples_split=self.config.get("min_samples_split", 2),
            random_state=self.config.get("random_state", 42),
            n_jobs=self.config.get("n_jobs", -1),
            class_weight=self.config.get("class_weight", "balanced")
        )
        
        self.model.fit(X, y)
        
        # Store feature names
        self.set_feature_names(list(X.columns))
        
        # Log feature importance
        importances = self.get_feature_importance()
        sorted_importances = sorted(importances.items(), key=lambda x: x[1], reverse=True)
        top_features = sorted_importances[:10]
        
        logger.info("Top 10 important features:")
        for feature, importance in top_features:
            logger.info(f"  {feature}: {importance:.4f}")
        
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
        
        return self.model.predict(X)


class GradientBoostingModel(BaseModel):
    """
    Gradient Boosting model for fraud detection
    """
    
    def __init__(self, model_name: str, config: Dict = None):
        """
        Initialize the Gradient Boosting model
        
        Args:
            model_name: Name of the model
            config: Dictionary with model configuration parameters
        """
        super().__init__(model_name, "gradient_boosting", config)
    
    def fit(self, X: pd.DataFrame, y: pd.Series) -> "GradientBoostingModel":
        """
        Train the model
        
        Args:
            X: Feature matrix
            y: Target vector
            
        Returns:
            self: The trained model
        """
        logger.info(f"Training Gradient Boosting model: {self.model_name}")
        
        # Create and train the model
        self.model = GradientBoostingClassifier(
            n_estimators=self.config.get("n_estimators", 100),
            learning_rate=self.config.get("learning_rate", 0.1),
            max_depth=self.config.get("max_depth", 5),
            min_samples_split=self.config.get("min_samples_split", 2),
            random_state=self.config.get("random_state", 42)
        )
        
        self.model.fit(X, y)
        
        # Store feature names
        self.set_feature_names(list(X.columns))
        
        # Log feature importance
        importances = self.get_feature_importance()
        sorted_importances = sorted(importances.items(), key=lambda x: x[1], reverse=True)
        top_features = sorted_importances[:10]
        
        logger.info("Top 10 important features:")
        for feature, importance in top_features:
            logger.info(f"  {feature}: {importance:.4f}")
        
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
        
        return self.model.predict(X)


class LightGBMModel(BaseModel):
    """
    LightGBM model for fraud detection
    """
    
    def __init__(self, model_name: str, config: Dict = None):
        """
        Initialize the LightGBM model
        
        Args:
            model_name: Name of the model
            config: Dictionary with model configuration parameters
        """
        super().__init__(model_name, "lightgbm", config)
    
    def fit(self, X: pd.DataFrame, y: pd.Series) -> "LightGBMModel":
        """
        Train the model
        
        Args:
            X: Feature matrix
            y: Target vector
            
        Returns:
            self: The trained model
        """
        logger.info(f"Training LightGBM model: {self.model_name}")
        
        # Define parameters
        params = {
            'objective': 'binary',
            'metric': 'binary_logloss',
            'boosting_type': 'gbdt',
            'learning_rate': self.config.get("learning_rate", 0.1),
            'n_estimators': self.config.get("n_estimators", 100),
            'num_leaves': self.config.get("num_leaves", 31),
            'max_depth': self.config.get("max_depth", -1),  # -1 means no limit
            'min_child_samples': self.config.get("min_child_samples", 20),
            'random_state': self.config.get("random_state", 42),
            'class_weight': self.config.get("class_weight", "balanced"),
        }
        
        # Create and train the model
        self.model = lgb.LGBMClassifier(**params)
        
        # Convert to correct data types (avoid pandas type conflicts)
        X_values = X.values if hasattr(X, 'values') else X
        y_values = y.values if hasattr(y, 'values') else y
        
        self.model.fit(
            X_values, 
            y_values,
            eval_metric='auc',
            verbose=self.config.get("verbose", 10)
        )
        
        # Store feature names
        self.set_feature_names(list(X.columns))
        
        # Log feature importance
        importances = self.get_feature_importance()
        sorted_importances = sorted(importances.items(), key=lambda x: x[1], reverse=True)
        top_features = sorted_importances[:10]
        
        logger.info("Top 10 important features:")
        for feature, importance in top_features:
            logger.info(f"  {feature}: {importance:.4f}")
        
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
        
        return self.model.predict(X)


class XGBoostModel(BaseModel):
    """
    XGBoost model for fraud detection
    """
    
    def __init__(self, model_name: str, config: Dict = None):
        """
        Initialize the XGBoost model
        
        Args:
            model_name: Name of the model
            config: Dictionary with model configuration parameters
        """
        super().__init__(model_name, "xgboost", config)
    
    def fit(self, X: pd.DataFrame, y: pd.Series) -> "XGBoostModel":
        """
        Train the model
        
        Args:
            X: Feature matrix
            y: Target vector
            
        Returns:
            self: The trained model
        """
        logger.info(f"Training XGBoost model: {self.model_name}")
        
        # Define parameters
        params = {
            'objective': 'binary:logistic',
            'eval_metric': 'auc',
            'learning_rate': self.config.get("learning_rate", 0.1),
            'n_estimators': self.config.get("n_estimators", 100),
            'max_depth': self.config.get("max_depth", 5),
            'min_child_weight': self.config.get("min_child_weight", 1),
            'subsample': self.config.get("subsample", 0.8),
            'colsample_bytree': self.config.get("colsample_bytree", 0.8),
            'random_state': self.config.get("random_state", 42),
            'tree_method': 'hist',  # For faster training
            'scale_pos_weight': self.config.get("scale_pos_weight", 1)  # For imbalanced classes
        }
        
        # Create and train the model
        self.model = xgb.XGBClassifier(**params)
        
        # Convert to correct data types
        X_values = X.values if hasattr(X, 'values') else X
        y_values = y.values if hasattr(y, 'values') else y
        
        self.model.fit(
            X_values,
            y_values,
            verbose=self.config.get("verbose", True)
        )
        
        # Store feature names
        self.set_feature_names(list(X.columns))
        
        # Log feature importance
        importances = self.get_feature_importance()
        sorted_importances = sorted(importances.items(), key=lambda x: x[1], reverse=True)
        top_features = sorted_importances[:10]
        
        logger.info("Top 10 important features:")
        for feature, importance in top_features:
            logger.info(f"  {feature}: {importance:.4f}")
        
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
        
        return self.model.predict(X)


class CatBoostModel(BaseModel):
    """
    CatBoost model for fraud detection
    """
    
    def __init__(self, model_name: str, config: Dict = None):
        """
        Initialize the CatBoost model
        
        Args:
            model_name: Name of the model
            config: Dictionary with model configuration parameters
        """
        super().__init__(model_name, "catboost", config)
    
    def fit(self, X: pd.DataFrame, y: pd.Series) -> "CatBoostModel":
        """
        Train the model
        
        Args:
            X: Feature matrix
            y: Target vector
            
        Returns:
            self: The trained model
        """
        logger.info(f"Training CatBoost model: {self.model_name}")
        
        # Define parameters
        params = {
            'iterations': self.config.get("iterations", 100),
            'learning_rate': self.config.get("learning_rate", 0.1),
            'depth': self.config.get("depth", 6),
            'l2_leaf_reg': self.config.get("l2_leaf_reg", 3),
            'random_seed': self.config.get("random_seed", 42),
            'loss_function': 'Logloss',
            'eval_metric': 'AUC',
            'verbose': self.config.get("verbose", 10),
            'class_weights': self.config.get("class_weights", None)
        }
        
        # Find categorical features
        cat_features = []
        for i, col in enumerate(X.columns):
            if X[col].dtype == 'object' or X[col].dtype == 'category':
                cat_features.append(i)
        
        # Create and train the model
        self.model = cb.CatBoostClassifier(**params)
        
        self.model.fit(
            X, 
            y,
            cat_features=cat_features if cat_features else None,
            verbose=params['verbose']
        )
        
        # Store feature names
        self.set_feature_names(list(X.columns))
        
        # Log feature importance
        importances = self.get_feature_importance()
        sorted_importances = sorted(importances.items(), key=lambda x: x[1], reverse=True)
        top_features = sorted_importances[:10]
        
        logger.info("Top 10 important features:")
        for feature, importance in top_features:
            logger.info(f"  {feature}: {importance:.4f}")
        
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
        
        return self.model.predict(X)