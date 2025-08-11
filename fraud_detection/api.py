#!/usr/bin/env python
"""
API for fraud detection service
"""

import os
import sys
import json
import uuid
import logging
import time
from datetime import datetime
from typing import Dict, List, Any, Optional, Union
from pathlib import Path

import numpy as np
import pandas as pd
import uvicorn
from fastapi import FastAPI, HTTPException, Query, Depends, BackgroundTasks, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from models.base_model import BaseModel as FraudModel
from utils.data_processing import DataPreprocessor
from utils.logging_config import setup_logging
from utils.monitoring import ModelMonitor
import config

# Configure logging
logger = setup_logging()

# Initialize the API
app = FastAPI(
    title=config.API_CONFIG["title"],
    description=config.API_CONFIG["description"],
    version=config.API_CONFIG["version"]
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Global variables for model and preprocessor
model = None
preprocessor = None
monitor = None

# Pydantic models for API
class TransactionFeatures(BaseModel):
    """Features for a single transaction"""
    # These fields would depend on your specific model features
    # We'll define a flexible model that accepts any fields
    
    class Config:
        extra = "allow"  # Allows additional fields

class PredictionRequest(BaseModel):
    """Request containing transactions for prediction"""
    transactions: List[TransactionFeatures]
    threshold: Optional[float] = Field(0.5, description="Classification threshold")
    include_probability: Optional[bool] = Field(True, description="Include fraud probability in response")
    
    class Config:
        schema_extra = {
            "example": {
                "transactions": [
                    {
                        "amount": 150.0,
                        "distance_from_home": 8.5,
                        "ratio_to_median_purchase_price": 2.3,
                        "repeat_retailer": 0,
                        "used_chip": 1,
                        "online_order": 1
                    }
                ],
                "threshold": 0.5,
                "include_probability": True
            }
        }

class PredictionResponse(BaseModel):
    """Response containing fraud predictions"""
    predictions: List[Dict[str, Any]]
    model_version: str
    prediction_id: str
    prediction_time: float

class ModelInfo(BaseModel):
    """Model information"""
    model_name: str
    model_type: str
    features: List[str]
    metrics: Dict[str, float]
    last_updated: str

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    model_loaded: bool
    preprocessor_loaded: bool

# Dependency for getting the model
def get_model():
    """Get the loaded model"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return model

def get_preprocessor():
    """Get the loaded preprocessor"""
    if preprocessor is None:
        raise HTTPException(status_code=503, detail="Preprocessor not loaded")
    return preprocessor

def get_monitor():
    """Get the model monitor"""
    if monitor is None:
        raise HTTPException(status_code=503, detail="Model monitor not initialized")
    return monitor

@app.on_event("startup")
async def startup_event():
    """Load model and preprocessor on startup"""
    global model, preprocessor, monitor
    
    try:
        # Load model
        model_path = config.API_CONFIG["model_path"]
        logger.info(f"Loading model from {model_path}")
        model = FraudModel.load(model_path)
        logger.info(f"Loaded model: {model.model_name} ({model.model_type})")
        
        # Load preprocessor (look in the same directory as the model)
        model_dir = Path(model_path).parent
        preprocessor_path = model_dir / "preprocessor.joblib"
        
        if preprocessor_path.exists():
            logger.info(f"Loading preprocessor from {preprocessor_path}")
            preprocessor = DataPreprocessor.load(preprocessor_path)
            logger.info("Preprocessor loaded successfully")
        else:
            logger.warning(f"No preprocessor found at {preprocessor_path}")
        
        # Initialize model monitor
        if config.MONITORING_CONFIG.get("enable_monitoring", True):
            logger.info("Initializing model monitor")
            monitor = ModelMonitor()
    
    except Exception as e:
        logger.error(f"Error loading model or preprocessor: {e}")
        # We don't raise an exception here to allow the API to start,
        # but endpoints that depend on the model will raise exceptions

@app.get("/", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "version": config.API_CONFIG["version"],
        "model_loaded": model is not None,
        "preprocessor_loaded": preprocessor is not None
    }

@app.get("/info", response_model=ModelInfo, tags=["Model"])
async def model_info(model: FraudModel = Depends(get_model)):
    """Get information about the loaded model"""
    # Get feature names
    feature_names = model.feature_names or []
    
    # Get metrics if available
    metrics = {}
    metrics_path = Path(config.API_CONFIG["model_path"]).parent / "evaluation" / f"{model.model_name}_metrics.json"
    
    if metrics_path.exists():
        with open(metrics_path, "r") as f:
            metrics = json.load(f)
    
    # Get last updated timestamp
    last_updated = model.metadata.get("saved_at", model.metadata.get("created_at", "unknown"))
    
    return {
        "model_name": model.model_name,
        "model_type": model.model_type,
        "features": feature_names,
        "metrics": metrics,
        "last_updated": last_updated
    }

@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict(
    request: PredictionRequest,
    background_tasks: BackgroundTasks,
    model: FraudModel = Depends(get_model),
    preprocessor: Optional[DataPreprocessor] = Depends(get_preprocessor),
    monitor: Optional[ModelMonitor] = Depends(get_monitor)
):
    """
    Make fraud predictions on transactions
    """
    start_time = time.time()
    prediction_id = str(uuid.uuid4())
    
    try:
        # Convert transactions to DataFrame
        data = pd.DataFrame([dict(t) for t in request.transactions])
        
        # Preprocess data if preprocessor is available
        if preprocessor:
            data_processed = preprocessor.transform(data)
        else:
            logger.warning("No preprocessor available, using raw data")
            data_processed = data
        
        # Make predictions
        if hasattr(model, 'predict_proba') and request.include_probability:
            probabilities = model.predict_proba(data_processed)[:, 1]  # Probability of fraud
            predictions = (probabilities >= request.threshold).astype(int)
        else:
            predictions = model.predict(data_processed)
            probabilities = None
        
        # Prepare response
        results = []
        for i in range(len(predictions)):
            result = {
                "is_fraud": bool(predictions[i]),
                "transaction_index": i
            }
            
            if probabilities is not None:
                result["fraud_probability"] = float(probabilities[i])
            
            results.append(result)
        
        # Log predictions in background
        if monitor:
            background_tasks.add_task(
                log_predictions,
                prediction_id=prediction_id,
                data=data,
                predictions=predictions,
                probabilities=probabilities,
                monitor=monitor
            )
        
        prediction_time = time.time() - start_time
        
        return {
            "predictions": results,
            "model_version": model.metadata.get("model_version", model.model_name),
            "prediction_id": prediction_id,
            "prediction_time": prediction_time
        }
    
    except Exception as e:
        logger.error(f"Error making predictions: {e}")
        raise HTTPException(status_code=500, detail=f"Error making predictions: {str(e)}")

def log_predictions(
    prediction_id: str,
    data: pd.DataFrame,
    predictions: np.ndarray,
    probabilities: Optional[np.ndarray],
    monitor: ModelMonitor
):
    """
    Log predictions to the monitoring system (runs as a background task)
    """
    try:
        # Add predictions to the dataframe
        data_with_predictions = data.copy()
        data_with_predictions["prediction"] = predictions
        
        if probabilities is not None:
            data_with_predictions["probability"] = probabilities
        
        # Log batch predictions
        monitor.log_batch_predictions(
            data_with_predictions,
            features_cols=data.columns.tolist(),
            prediction_col="prediction",
            probability_col="probability" if probabilities is not None else None
        )
        
        logger.info(f"Successfully logged predictions with ID: {prediction_id}")
    
    except Exception as e:
        logger.error(f"Error logging predictions: {e}")

@app.post("/feedback", tags=["Feedback"])
async def prediction_feedback(
    prediction_id: str,
    actual_label: int,
    background_tasks: BackgroundTasks,
    monitor: Optional[ModelMonitor] = Depends(get_monitor)
):
    """
    Submit feedback for a prediction
    
    This endpoint allows you to submit the actual label for a prediction,
    which helps with model monitoring and retraining.
    """
    if monitor is None:
        raise HTTPException(status_code=503, detail="Monitoring not enabled")
    
    try:
        # Update the prediction log with the true label
        log_path = monitor.metrics_path / "prediction_logs.jsonl"
        
        if not log_path.exists():
            raise HTTPException(status_code=404, detail="No prediction logs found")
        
        # Process feedback in background to avoid blocking
        background_tasks.add_task(
            process_feedback,
            prediction_id=prediction_id,
            actual_label=actual_label,
            log_path=log_path,
            monitor=monitor
        )
        
        return {"status": "success", "message": "Feedback submitted successfully"}
    
    except Exception as e:
        logger.error(f"Error processing feedback: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing feedback: {str(e)}")

def process_feedback(
    prediction_id: str,
    actual_label: int,
    log_path: Path,
    monitor: ModelMonitor
):
    """
    Process feedback by updating the prediction logs (runs as a background task)
    """
    try:
        # Read all logs
        logs = []
        updated = False
        
        with open(log_path, "r") as f:
            for line in f:
                log_entry = json.loads(line.strip())
                if log_entry.get("prediction_id") == prediction_id:
                    log_entry["true_label"] = actual_label
                    updated = True
                logs.append(log_entry)
        
        if not updated:
            logger.warning(f"No prediction found with ID: {prediction_id}")
            return
        
        # Write updated logs
        with open(log_path, "w") as f:
            for log_entry in logs:
                f.write(json.dumps(log_entry) + "\n")
        
        logger.info(f"Updated prediction log with feedback for ID: {prediction_id}")
        
        # Calculate updated metrics
        if monitor.config.get("performance_tracking", True):
            monitor.calculate_performance_metrics()
    
    except Exception as e:
        logger.error(f"Error processing feedback: {e}")

@app.get("/metrics", tags=["Monitoring"])
async def get_metrics(
    monitor: Optional[ModelMonitor] = Depends(get_monitor)
):
    """
    Get current model performance metrics
    """
    if monitor is None:
        raise HTTPException(status_code=503, detail="Monitoring not enabled")
    
    try:
        metrics = monitor.calculate_performance_metrics()
        return {"metrics": metrics}
    
    except Exception as e:
        logger.error(f"Error retrieving metrics: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving metrics: {str(e)}")

@app.get("/drift", tags=["Monitoring"])
async def check_drift(
    monitor: Optional[ModelMonitor] = Depends(get_monitor),
    model: FraudModel = Depends(get_model)
):
    """
    Check for data drift in recent predictions
    
    This endpoint compares recent predictions with the training data
    to detect potential data drift.
    """
    if monitor is None:
        raise HTTPException(status_code=503, detail="Monitoring not enabled")
    
    try:
        # Get recent predictions
        predictions = monitor.get_recent_predictions(hours=24)
        
        if len(predictions) == 0:
            return {"status": "no_data", "message": "No recent predictions available"}
        
        # Get feature names
        feature_names = model.feature_names
        
        if not feature_names:
            return {"status": "error", "message": "No feature names available in the model"}
        
        # Load reference data if available
        reference_path = Path(config.API_CONFIG["model_path"]).parent / "reference_data.parquet"
        
        if not reference_path.exists():
            return {"status": "error", "message": "No reference data available"}
        
        reference_data = pd.read_parquet(reference_path)
        
        # Extract features from recent predictions
        _, features_df = monitor.extract_predictions_for_monitoring(
            monitor.metrics_path / "prediction_logs.jsonl",
            start_date=datetime.now().replace(hour=0, minute=0, second=0) - pd.Timedelta(days=1)
        )
        
        if len(features_df) == 0:
            return {"status": "no_data", "message": "No feature data available in recent predictions"}
        
        # Check drift
        drift_results = monitor.detect_data_drift(
            reference_data,
            features_df,
            feature_names
        )
        
        return {
            "status": "success",
            "drift_detected": drift_results.get("overall_drift", False),
            "drift_details": drift_results
        }
    
    except Exception as e:
        logger.error(f"Error checking drift: {e}")
        raise HTTPException(status_code=500, detail=f"Error checking drift: {str(e)}")

def run_api():
    """Run the API server"""
    uvicorn.run(
        "api:app",
        host=config.API_CONFIG["host"],
        port=config.API_CONFIG["port"],
        log_level=config.API_CONFIG["log_level"]
    )

if __name__ == "__main__":
    run_api()