#!/usr/bin/env python
"""
Prediction script for fraud detection models
"""

import argparse
import logging
import sys
import os
import pandas as pd
import numpy as np
from pathlib import Path
import time
import uuid

from utils.logging_config import setup_logging
from utils.data_processing import DataPreprocessor
from models.base_model import BaseModel
from utils.monitoring import ModelMonitor
import config

def parse_arguments():
    """
    Parse command line arguments
    
    Returns:
        Parsed arguments
    """
    parser = argparse.ArgumentParser(description="Make predictions with fraud detection model")
    
    parser.add_argument(
        "--model_path",
        type=str,
        default=str(config.API_CONFIG["model_path"]),
        help="Path to the trained model"
    )
    
    parser.add_argument(
        "--preprocessor_path",
        type=str,
        default=None,
        help="Path to the data preprocessor"
    )
    
    parser.add_argument(
        "--input_file",
        type=str,
        required=True,
        help="Path to the input data file"
    )
    
    parser.add_argument(
        "--output_file",
        type=str,
        required=True,
        help="Path to save the predictions"
    )
    
    parser.add_argument(
        "--threshold",
        type=float,
        default=0.5,
        help="Classification threshold for binary predictions"
    )
    
    parser.add_argument(
        "--include_probs",
        action="store_true",
        help="Include probability scores in the output"
    )
    
    parser.add_argument(
        "--enable_monitoring",
        action="store_true",
        help="Enable prediction monitoring"
    )
    
    args = parser.parse_args()
    
    # Infer preprocessor path if not provided
    if args.preprocessor_path is None:
        model_dir = Path(args.model_path).parent
        default_preprocessor = model_dir / "preprocessor.joblib"
        
        if default_preprocessor.exists():
            args.preprocessor_path = str(default_preprocessor)
    
    return args

def main():
    """Main function to make predictions using a trained fraud detection model"""
    # Parse arguments
    args = parse_arguments()
    
    # Set up logging
    logger = setup_logging()
    logger.info("Starting fraud detection prediction")
    
    # Load model
    try:
        logger.info(f"Loading model from {args.model_path}")
        model = BaseModel.load(args.model_path)
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        sys.exit(1)
    
    # Load preprocessor if available
    preprocessor = None
    if args.preprocessor_path:
        try:
            logger.info(f"Loading preprocessor from {args.preprocessor_path}")
            preprocessor = DataPreprocessor.load(args.preprocessor_path)
        except Exception as e:
            logger.warning(f"Failed to load preprocessor: {e}. Will try to use raw data.")
    
    # Load input data
    try:
        logger.info(f"Loading input data from {args.input_file}")
        input_path = Path(args.input_file)
        
        if input_path.suffix.lower() == '.csv':
            data = pd.read_csv(input_path)
        elif input_path.suffix.lower() in ['.xls', '.xlsx']:
            data = pd.read_excel(input_path)
        elif input_path.suffix.lower() == '.parquet':
            data = pd.read_parquet(input_path)
        else:
            raise ValueError(f"Unsupported file format: {input_path.suffix}")
        
        logger.info(f"Loaded {len(data)} records from {args.input_file}")
    except Exception as e:
        logger.error(f"Failed to load input data: {e}")
        sys.exit(1)
    
    # Check if data has expected target column and separate if present
    target_column = config.FEATURES.get("target", "is_fraud")
    has_target = target_column in data.columns
    
    if has_target:
        logger.info(f"Found target column '{target_column}' in input data")
        y_true = data[target_column]
        X = data.drop(columns=[target_column])
    else:
        X = data.copy()
    
    # Preprocess data if preprocessor is available
    if preprocessor:
        try:
            logger.info("Preprocessing input data")
            X_processed = preprocessor.transform(X)
        except Exception as e:
            logger.error(f"Failed to preprocess data: {e}")
            sys.exit(1)
    else:
        logger.warning("No preprocessor available, using raw data")
        X_processed = X
    
    # Make predictions
    start_time = time.time()
    
    # Get probability scores if available
    y_probs = None
    if args.include_probs and hasattr(model, 'predict_proba'):
        try:
            logger.info("Generating probability scores")
            y_probs = model.predict_proba(X_processed)[:, 1]  # Probability of fraud class
        except Exception as e:
            logger.warning(f"Failed to generate probability scores: {e}")
    
    # Get binary predictions
    try:
        if y_probs is not None:
            logger.info(f"Generating binary predictions using threshold {args.threshold}")
            y_pred = (y_probs >= args.threshold).astype(int)
        else:
            logger.info("Generating binary predictions")
            y_pred = model.predict(X_processed)
    except Exception as e:
        logger.error(f"Failed to generate predictions: {e}")
        sys.exit(1)
    
    prediction_time = time.time() - start_time
    logger.info(f"Generated predictions for {len(X)} records in {prediction_time:.4f} seconds")
    logger.info(f"Average prediction time: {prediction_time / len(X) * 1000:.4f} ms per record")
    
    # Prepare output dataframe
    output_df = X.copy()
    output_df["prediction"] = y_pred
    
    if y_probs is not None:
        output_df["fraud_probability"] = y_probs
    
    if has_target:
        output_df[target_column] = y_true
    
    # Save predictions
    try:
        output_path = Path(args.output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Saving predictions to {args.output_file}")
        
        if output_path.suffix.lower() == '.csv':
            output_df.to_csv(output_path, index=False)
        elif output_path.suffix.lower() in ['.xls', '.xlsx']:
            output_df.to_excel(output_path, index=False)
        elif output_path.suffix.lower() == '.parquet':
            output_df.to_parquet(output_path, index=False)
        else:
            # Default to CSV
            csv_path = output_path.with_suffix(".csv")
            output_df.to_csv(csv_path, index=False)
            logger.info(f"Saved as CSV to {csv_path}")
    except Exception as e:
        logger.error(f"Failed to save predictions: {e}")
        sys.exit(1)
    
    # Calculate metrics if target column is available
    if has_target:
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
        
        accuracy = accuracy_score(y_true, y_pred)
        precision = precision_score(y_true, y_pred, zero_division=0)
        recall = recall_score(y_true, y_pred, zero_division=0)
        f1 = f1_score(y_true, y_pred, zero_division=0)
        
        logger.info("Prediction metrics:")
        logger.info(f"  Accuracy:  {accuracy:.4f}")
        logger.info(f"  Precision: {precision:.4f}")
        logger.info(f"  Recall:    {recall:.4f}")
        logger.info(f"  F1 Score:  {f1:.4f}")
        
        # Calculate confusion matrix
        cm = confusion_matrix(y_true, y_pred)
        logger.info(f"  True Negatives: {cm[0, 0]}")
        logger.info(f"  False Positives: {cm[0, 1]}")
        logger.info(f"  False Negatives: {cm[1, 0]}")
        logger.info(f"  True Positives: {cm[1, 1]}")
    
    # Log predictions to monitoring system if enabled
    if args.enable_monitoring and config.MONITORING_CONFIG.get("enable_monitoring", True):
        logger.info("Logging predictions to monitoring system")
        
        monitor = ModelMonitor()
        
        # Create a batch ID for these predictions
        batch_id = f"batch_{uuid.uuid4().hex[:8]}_{time.strftime('%Y%m%d_%H%M%S')}"
        
        # Determine which columns are features
        if preprocessor and hasattr(preprocessor, 'feature_names'):
            feature_cols = preprocessor.feature_names
        else:
            # Exclude prediction and target columns
            feature_cols = [col for col in output_df.columns 
                          if col not in ["prediction", "fraud_probability", target_column]]
        
        # Log the batch predictions
        monitor.log_batch_predictions(
            output_df,
            features_cols=feature_cols,
            prediction_col="prediction",
            probability_col="fraud_probability" if y_probs is not None else None,
            true_label_col=target_column if has_target else None
        )
        
        # Calculate performance metrics if target is available
        if has_target:
            metrics = monitor.calculate_performance_metrics()
            logger.info(f"Updated monitoring metrics: {metrics}")
    
    logger.info("Prediction completed successfully")

if __name__ == "__main__":
    main()