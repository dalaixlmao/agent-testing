"""
Configuration file for Fraud Detection System
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).resolve().parent

# Data paths
DATA_DIR = BASE_DIR / "data"
RAW_DATA_PATH = DATA_DIR / "raw"
PROCESSED_DATA_PATH = DATA_DIR / "processed"
MODEL_REGISTRY_PATH = BASE_DIR / "models" / "registry"

# Ensure directories exist
RAW_DATA_PATH.mkdir(parents=True, exist_ok=True)
PROCESSED_DATA_PATH.mkdir(parents=True, exist_ok=True)
MODEL_REGISTRY_PATH.mkdir(parents=True, exist_ok=True)

# Model configurations
DEFAULT_MODEL_CONFIG = {
    "random_forest": {
        "n_estimators": 100,
        "max_depth": 10,
        "min_samples_split": 2,
        "random_state": 42
    },
    "gradient_boosting": {
        "learning_rate": 0.1,
        "n_estimators": 100,
        "max_depth": 5,
        "random_state": 42
    },
    "lightgbm": {
        "learning_rate": 0.1,
        "n_estimators": 100,
        "num_leaves": 31,
        "random_state": 42
    },
    "xgboost": {
        "learning_rate": 0.1,
        "n_estimators": 100,
        "max_depth": 5,
        "random_state": 42
    },
    "catboost": {
        "iterations": 100,
        "depth": 6,
        "learning_rate": 0.1,
        "random_seed": 42
    },
    "neural_network": {
        "hidden_layer_sizes": [100, 50],
        "activation": "relu",
        "solver": "adam",
        "alpha": 0.0001,
        "batch_size": 32,
        "max_iter": 200,
        "random_state": 42
    },
    "deep_learning": {
        "batch_size": 64,
        "epochs": 20,
        "learning_rate": 0.001,
        "early_stopping_patience": 5,
        "hidden_layers": [128, 64, 32]
    },
    "ensemble": {
        "models": ["lightgbm", "xgboost", "catboost"],
        "voting": "soft"
    }
}

# Feature configurations
FEATURES = {
    "categorical_features": [],  # To be defined based on dataset
    "numerical_features": [],    # To be defined based on dataset
    "datetime_features": [],     # To be defined based on dataset
    "target": "is_fraud"         # Target variable name
}

# Training configurations
TRAIN_CONFIG = {
    "test_size": 0.2,
    "validation_size": 0.1,
    "random_state": 42,
    "stratify": True,
    "n_splits": 5,
    "cv_method": "stratified_kfold"
}

# Preprocessing configurations
PREPROCESSING_CONFIG = {
    "handle_missing": True,
    "handle_outliers": True,
    "feature_scaling": "standard",  # Options: "standard", "minmax", "robust", None
    "encoding_method": "one_hot",   # Options: "one_hot", "label", "target"
}

# API configuration
API_CONFIG = {
    "title": "Fraud Detection API",
    "description": "API for detecting potentially fraudulent activities",
    "version": "1.0.0",
    "host": os.getenv("API_HOST", "0.0.0.0"),
    "port": int(os.getenv("API_PORT", "8000")),
    "log_level": os.getenv("LOG_LEVEL", "info"),
    "model_path": MODEL_REGISTRY_PATH / "production_model.joblib"
}

# Logging configuration
LOGGING_CONFIG = {
    "level": os.getenv("LOG_LEVEL", "INFO"),
    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    "log_file": BASE_DIR / "logs" / "fraud_detection.log"
}

# Monitoring configuration
MONITORING_CONFIG = {
    "enable_monitoring": True,
    "metrics_path": BASE_DIR / "monitoring" / "metrics",
    "drift_detection": True,
    "performance_tracking": True,
    "alert_threshold": {
        "precision": 0.8,
        "recall": 0.8,
        "f1": 0.8
    }
}

# Create logging directory
(BASE_DIR / "logs").mkdir(exist_ok=True)
(BASE_DIR / "monitoring" / "metrics").mkdir(parents=True, exist_ok=True)