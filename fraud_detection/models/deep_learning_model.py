"""
Deep Learning model implementation for fraud detection using TensorFlow/Keras
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Union, Optional, Any, Tuple
import logging
from pathlib import Path
import os
import time
import json

# TensorFlow and Keras
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models, callbacks
from tensorflow.keras.models import load_model
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

from sklearn.preprocessing import StandardScaler
import joblib

from models.base_model import BaseModel

logger = logging.getLogger(__name__)

class DeepLearningModel(BaseModel):
    """
    Deep Learning model for fraud detection using TensorFlow/Keras
    """
    
    def __init__(self, model_name: str, config: Dict = None):
        """
        Initialize the Deep Learning model
        
        Args:
            model_name: Name of the model
            config: Dictionary with model configuration parameters
        """
        super().__init__(model_name, "deep_learning", config)
        self.scaler = StandardScaler()
        
        # Set memory growth for TensorFlow
        self._configure_gpu()
        
        # Initialize Keras model
        self.keras_model = None
        self.history = None
    
    def _configure_gpu(self):
        """Configure TensorFlow GPU settings"""
        try:
            gpus = tf.config.list_physical_devices('GPU')
            if gpus:
                logger.info(f"Found {len(gpus)} GPU(s)")
                # Enable memory growth for GPUs to avoid allocating all memory at once
                for gpu in gpus:
                    tf.config.experimental.set_memory_growth(gpu, True)
            else:
                logger.info("No GPUs found, using CPU")
        except Exception as e:
            logger.warning(f"Error configuring GPU: {e}")
    
    def _build_model(self, input_dim: int) -> keras.Model:
        """
        Build the Keras model architecture
        
        Args:
            input_dim: Number of input features
            
        Returns:
            Compiled Keras model
        """
        # Get model configuration
        hidden_layers = self.config.get("hidden_layers", [128, 64, 32])
        dropout_rate = self.config.get("dropout_rate", 0.3)
        learning_rate = self.config.get("learning_rate", 0.001)
        
        # Define model
        model = models.Sequential()
        
        # Input layer
        model.add(layers.Input(shape=(input_dim,)))
        
        # Hidden layers
        for units in hidden_layers:
            model.add(layers.Dense(units, activation='relu'))
            model.add(layers.BatchNormalization())
            model.add(layers.Dropout(dropout_rate))
        
        # Output layer (binary classification)
        model.add(layers.Dense(1, activation='sigmoid'))
        
        # Compile model
        optimizer = keras.optimizers.Adam(learning_rate=learning_rate)
        
        model.compile(
            optimizer=optimizer,
            loss='binary_crossentropy',
            metrics=[
                'accuracy',
                keras.metrics.Precision(),
                keras.metrics.Recall(),
                keras.metrics.AUC()
            ]
        )
        
        return model
    
    def fit(self, X: pd.DataFrame, y: pd.Series) -> "DeepLearningModel":
        """
        Train the deep learning model
        
        Args:
            X: Feature matrix
            y: Target vector
            
        Returns:
            self: The trained model
        """
        logger.info(f"Training Deep Learning model: {self.model_name}")
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Get training parameters
        batch_size = self.config.get("batch_size", 64)
        epochs = self.config.get("epochs", 20)
        validation_split = self.config.get("validation_split", 0.2)
        early_stopping_patience = self.config.get("early_stopping_patience", 5)
        class_weight = None
        
        # Handle class imbalance
        if self.config.get("class_weight", True):
            # Calculate class weights based on class distribution
            class_counts = y.value_counts()
            total_samples = len(y)
            class_weight = {
                class_label: total_samples / (len(class_counts) * count) 
                for class_label, count in class_counts.items()
            }
            logger.info(f"Using class weights: {class_weight}")
        
        # Build the model
        self.keras_model = self._build_model(X.shape[1])
        
        # Define callbacks
        callbacks_list = [
            EarlyStopping(
                monitor='val_loss',
                patience=early_stopping_patience,
                restore_best_weights=True
            )
        ]
        
        # Create a temporary directory for model checkpoints
        temp_dir = Path("/tmp/model_checkpoints")
        temp_dir.mkdir(exist_ok=True)
        
        checkpoint_path = temp_dir / f"{self.model_name}_best.h5"
        callbacks_list.append(
            ModelCheckpoint(
                str(checkpoint_path),
                monitor='val_loss',
                save_best_only=True
            )
        )
        
        # Train the model
        start_time = time.time()
        self.history = self.keras_model.fit(
            X_scaled, y,
            batch_size=batch_size,
            epochs=epochs,
            validation_split=validation_split,
            callbacks=callbacks_list,
            verbose=1,
            class_weight=class_weight
        )
        training_time = time.time() - start_time
        
        # Load the best model
        if checkpoint_path.exists():
            self.keras_model = load_model(str(checkpoint_path))
            logger.info(f"Loaded best model from {checkpoint_path}")
        
        # Store feature names
        self.set_feature_names(list(X.columns))
        
        # Store training info in metadata
        self.metadata["training_info"] = {
            "epochs_completed": len(self.history.history['loss']),
            "final_loss": float(self.history.history['loss'][-1]),
            "final_val_loss": float(self.history.history['val_loss'][-1]),
            "final_accuracy": float(self.history.history['accuracy'][-1]),
            "final_val_accuracy": float(self.history.history['val_accuracy'][-1]),
            "training_time": training_time
        }
        
        # Log training results
        logger.info(f"Training completed in {training_time:.2f} seconds")
        logger.info(f"Final training loss: {self.history.history['loss'][-1]:.4f}")
        logger.info(f"Final validation loss: {self.history.history['val_loss'][-1]:.4f}")
        logger.info(f"Final training accuracy: {self.history.history['accuracy'][-1]:.4f}")
        logger.info(f"Final validation accuracy: {self.history.history['val_accuracy'][-1]:.4f}")
        
        # Use the keras model as the underlying model for compatibility with other code
        self.model = self.keras_model
        
        return self
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """
        Make predictions
        
        Args:
            X: Feature matrix
            
        Returns:
            Model predictions
        """
        if self.keras_model is None:
            raise ValueError("Model not trained yet")
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Get raw probabilities
        y_prob = self.keras_model.predict(X_scaled)
        
        # Convert to binary predictions with threshold 0.5
        y_pred = (y_prob > 0.5).astype(int)
        
        return y_pred.flatten()
    
    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """
        Predict class probabilities
        
        Args:
            X: Feature matrix
            
        Returns:
            Class probabilities (n_samples, n_classes)
        """
        if self.keras_model is None:
            raise ValueError("Model not trained yet")
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Get raw probabilities for the positive class
        y_prob_positive = self.keras_model.predict(X_scaled).flatten()
        
        # Create full probability array for both classes
        y_prob = np.zeros((X.shape[0], 2))
        y_prob[:, 1] = y_prob_positive
        y_prob[:, 0] = 1 - y_prob_positive
        
        return y_prob
    
    def get_feature_importance(self) -> Dict[str, float]:
        """
        Get feature importances for deep learning model
        
        Uses permutation importance or weights of the first layer
        
        Returns:
            Dictionary mapping feature names to importance values
        """
        if self.keras_model is None:
            raise ValueError("Model not trained yet")
        
        # For deep learning models, we can look at the weights of the first layer
        first_layer = self.keras_model.layers[0]
        
        if not hasattr(first_layer, 'get_weights') or len(first_layer.get_weights()) == 0:
            logger.warning("Cannot extract weights from the first layer")
            return {}
        
        # Get weights from first layer
        weights = first_layer.get_weights()[0]
        
        # Calculate importance as the sum of absolute weights for each feature
        importances = np.sum(np.abs(weights), axis=1)
        
        # Normalize
        importances = importances / np.sum(importances)
        
        if self.feature_names is None:
            return {f"feature_{i}": float(imp) for i, imp in enumerate(importances)}
        
        return {name: float(imp) for name, imp in zip(self.feature_names, importances)}
    
    def save(self, path: Optional[Union[str, Path]] = None) -> str:
        """
        Save the model, scaler, and metadata
        
        Args:
            path: Path to save the model to
            
        Returns:
            Path where model was saved
        """
        if path is None:
            from config import MODEL_REGISTRY_PATH
            timestamp = time.strftime("%Y%m%d_%H%M%S")
            model_dir = Path(MODEL_REGISTRY_PATH) / f"{self.model_name}_{timestamp}"
            model_dir.mkdir(parents=True, exist_ok=True)
            path = model_dir / "model.keras"
        else:
            path = Path(path)
            path.parent.mkdir(parents=True, exist_ok=True)
        
        # Save Keras model separately
        if self.keras_model is not None:
            keras_path = path.with_suffix(".keras")
            self.keras_model.save(keras_path)
            logger.info(f"Saved Keras model to {keras_path}")
            
            # Save scaler
            scaler_path = path.parent / "scaler.joblib"
            joblib.dump(self.scaler, scaler_path)
            logger.info(f"Saved scaler to {scaler_path}")
            
            # Add paths to metadata
            self.metadata.update({
                "keras_model_path": str(keras_path),
                "scaler_path": str(scaler_path)
            })
        
        # Save history if available
        if self.history:
            history_dict = {
                key: [float(val) for val in values]  # Convert numpy values to Python native
                for key, values in self.history.history.items()
            }
            history_path = path.parent / "training_history.json"
            with open(history_path, "w") as f:
                json.dump(history_dict, f, indent=2)
            logger.info(f"Saved training history to {history_path}")
            self.metadata["history_path"] = str(history_path)
        
        # Save metadata
        metadata_path = path.parent / "metadata.json"
        with open(metadata_path, "w") as f:
            # Filter out non-serializable items
            metadata_dict = {k: v for k, v in self.metadata.items()
                             if k not in ["scaler"]}
            json.dump(metadata_dict, f, indent=2)
        
        logger.info(f"Saved model metadata to {metadata_path}")
        
        return str(path)
    
    @classmethod
    def load(cls, path: Union[str, Path]) -> "DeepLearningModel":
        """
        Load a deep learning model from disk
        
        Args:
            path: Path to load the model from
            
        Returns:
            Loaded deep learning model
        """
        path = Path(path)
        
        # Create new instance
        model = cls(path.stem)
        
        # Load metadata
        metadata_path = path.parent / "metadata.json"
        if metadata_path.exists():
            with open(metadata_path, "r") as f:
                model.metadata = json.load(f)
        
        # Load Keras model
        keras_path = model.metadata.get("keras_model_path", path.with_suffix(".keras"))
        model.keras_model = load_model(keras_path)
        model.model = model.keras_model
        
        # Load scaler
        scaler_path = model.metadata.get("scaler_path", path.parent / "scaler.joblib")
        model.scaler = joblib.load(scaler_path)
        
        # Load feature names if available
        model.feature_names = model.metadata.get("feature_names")
        
        logger.info(f"Loaded deep learning model from {path}")
        
        return model