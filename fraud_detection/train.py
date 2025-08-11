#!/usr/bin/env python
"""
Training script for fraud detection models
"""

import argparse
import logging
import sys
import os
import pandas as pd
import numpy as np
from pathlib import Path
import time
import json

from utils.logging_config import setup_logging
from utils.data_processing import DataPreprocessor, load_and_split_data, handle_class_imbalance
from utils.evaluation import ModelEvaluator
from models.model_factory import ModelFactory
from utils.monitoring import ModelMonitor
import config

def parse_arguments():
    """
    Parse command line arguments
    
    Returns:
        Parsed arguments
    """
    parser = argparse.ArgumentParser(description="Train fraud detection model")
    
    parser.add_argument(
        "--data_path",
        type=str,
        help="Path to the data file",
        default=None
    )
    
    parser.add_argument(
        "--model_type",
        type=str,
        default="ensemble",
        choices=ModelFactory.list_available_models(),
        help="Type of model to train"
    )
    
    parser.add_argument(
        "--output_dir",
        type=str,
        default=str(config.MODEL_REGISTRY_PATH),
        help="Directory to save the trained model"
    )
    
    parser.add_argument(
        "--model_name",
        type=str,
        default=None,
        help="Name for the trained model"
    )
    
    parser.add_argument(
        "--test_size",
        type=float,
        default=config.TRAIN_CONFIG["test_size"],
        help="Proportion of data to use for testing"
    )
    
    parser.add_argument(
        "--val_size",
        type=float,
        default=config.TRAIN_CONFIG["validation_size"],
        help="Proportion of training data to use for validation"
    )
    
    parser.add_argument(
        "--handle_imbalance",
        type=str,
        default="smote",
        choices=["smote", "none"],
        help="Method to handle class imbalance"
    )
    
    parser.add_argument(
        "--generate_synthetic",
        action="store_true",
        help="Generate synthetic data if no data path is provided"
    )
    
    parser.add_argument(
        "--synthetic_samples",
        type=int,
        default=10000,
        help="Number of synthetic samples to generate"
    )
    
    parser.add_argument(
        "--evaluate_only",
        action="store_true",
        help="Only evaluate an existing model without training"
    )
    
    parser.add_argument(
        "--existing_model",
        type=str,
        default=None,
        help="Path to existing model for evaluation"
    )
    
    args = parser.parse_args()
    
    # Validate arguments
    if args.evaluate_only and args.existing_model is None:
        parser.error("--evaluate_only requires --existing_model")
    
    if not args.evaluate_only and args.data_path is None and not args.generate_synthetic:
        parser.error("Either --data_path or --generate_synthetic must be provided")
    
    return args

def main():
    """Main function to train and evaluate fraud detection models"""
    # Parse arguments
    args = parse_arguments()
    
    # Set up logging
    logger = setup_logging()
    logger.info("Starting fraud detection model training")
    
    # Generate model name if not provided
    if args.model_name is None:
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        args.model_name = f"fraud_detection_{args.model_type}_{timestamp}"
    
    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Load or generate data
    if args.data_path is not None:
        logger.info(f"Loading data from {args.data_path}")
        data = load_and_split_data(
            args.data_path,
            test_size=args.test_size,
            val_size=args.val_size
        )
    elif args.generate_synthetic:
        logger.info(f"Generating {args.synthetic_samples} synthetic data samples")
        from utils.data_processing import generate_synthetic_fraud_data
        
        # Generate data
        synthetic_data = generate_synthetic_fraud_data(
            n_samples=args.synthetic_samples,
            fraud_ratio=0.05,  # 5% fraud
            output_path=config.DATA_DIR / "synthetic_fraud_data.csv"
        )
        
        # Split data
        data = load_and_split_data(
            config.DATA_DIR / "synthetic_fraud_data.csv",
            test_size=args.test_size,
            val_size=args.val_size
        )
    else:
        logger.error("No data source specified")
        sys.exit(1)
    
    # Extract data splits
    train_data = data["train"]
    test_data = data["test"]
    val_data = data.get("val")
    
    # Set target variable
    target = config.FEATURES.get("target", "is_fraud")
    
    if target not in train_data.columns:
        logger.error(f"Target column '{target}' not found in data")
        sys.exit(1)
    
    # Prepare data
    X_train = train_data.drop(columns=[target])
    y_train = train_data[target]
    
    X_test = test_data.drop(columns=[target])
    y_test = test_data[target]
    
    if val_data is not None:
        X_val = val_data.drop(columns=[target])
        y_val = val_data[target]
    
    # Preprocess data
    logger.info("Preprocessing data")
    preprocessor = DataPreprocessor()
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)
    
    if val_data is not None:
        X_val_processed = preprocessor.transform(X_val)
    
    # Handle class imbalance if needed
    if args.handle_imbalance != "none":
        logger.info(f"Handling class imbalance using {args.handle_imbalance}")
        X_train_resampled, y_train_resampled = handle_class_imbalance(
            X_train_processed, y_train, method=args.handle_imbalance
        )
    else:
        X_train_resampled, y_train_resampled = X_train_processed, y_train
    
    # Train or load model
    if not args.evaluate_only:
        # Create and train model
        logger.info(f"Training {args.model_type} model: {args.model_name}")
        
        model = ModelFactory.create_model(args.model_type, args.model_name)
        
        training_start = time.time()
        model.fit(X_train_resampled, y_train_resampled)
        training_time = time.time() - training_start
        
        logger.info(f"Training completed in {training_time:.2f} seconds")
        
        # Save model and preprocessor
        model_dir = output_dir / args.model_name
        model_dir.mkdir(parents=True, exist_ok=True)
        
        model_path = model_dir / "model.joblib"
        preprocessor_path = model_dir / "preprocessor.joblib"
        
        model.save(model_path)
        preprocessor.save(preprocessor_path)
        
        logger.info(f"Saved model to {model_path}")
        logger.info(f"Saved preprocessor to {preprocessor_path}")
        
        # Save training metadata
        metadata = {
            "model_name": args.model_name,
            "model_type": args.model_type,
            "training_time": training_time,
            "data_shape": X_train.shape,
            "training_params": vars(args),
            "feature_names": list(X_train.columns),
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        with open(model_dir / "training_metadata.json", "w") as f:
            json.dump(metadata, f, indent=2)
    
    else:
        # Load existing model
        from models.base_model import BaseModel
        
        logger.info(f"Loading existing model from {args.existing_model}")
        model = BaseModel.load(args.existing_model)
        
        # Try to load preprocessor
        preprocessor_path = Path(args.existing_model).parent / "preprocessor.joblib"
        if preprocessor_path.exists():
            preprocessor = DataPreprocessor.load(preprocessor_path)
            logger.info(f"Loaded preprocessor from {preprocessor_path}")
        else:
            logger.warning(f"Preprocessor not found at {preprocessor_path}")
    
    # Evaluate model
    logger.info("Evaluating model")
    evaluator = ModelEvaluator()
    
    # Evaluate on train data
    train_metrics = evaluator.evaluate(model, X_train_processed, y_train, "train")
    logger.info("Training metrics:")
    for key, value in train_metrics.items():
        if key != "timestamp":
            logger.info(f"  {key}: {value}")
    
    # Evaluate on test data
    test_metrics = evaluator.evaluate(model, X_test_processed, y_test, "test")
    logger.info("Test metrics:")
    for key, value in test_metrics.items():
        if key != "timestamp":
            logger.info(f"  {key}: {value}")
    
    # Evaluate on validation data if available
    if val_data is not None:
        val_metrics = evaluator.evaluate(model, X_val_processed, y_val, "val")
        logger.info("Validation metrics:")
        for key, value in val_metrics.items():
            if key != "timestamp":
                logger.info(f"  {key}: {value}")
        
        # Find optimal threshold on validation data
        logger.info("Finding optimal threshold on validation data")
        optimal_threshold = evaluator.find_optimal_threshold("val", metric="f1")
        
        # Re-evaluate with optimal threshold
        evaluator.threshold = optimal_threshold
        test_metrics = evaluator.evaluate(model, X_test_processed, y_test, "test")
        
        logger.info(f"Test metrics with optimal threshold ({optimal_threshold:.4f}):")
        for key, value in test_metrics.items():
            if key != "timestamp":
                logger.info(f"  {key}: {value}")
    
    # Generate plots
    if not args.evaluate_only:
        plot_dir = model_dir / "plots"
        plot_dir.mkdir(exist_ok=True)
        
        # Confusion matrix
        evaluator.plot_confusion_matrix("test", save_path=plot_dir / "confusion_matrix.png")
        
        # ROC curve
        evaluator.plot_roc_curve("test", save_path=plot_dir / "roc_curve.png")
        
        # Precision-recall curve
        evaluator.plot_precision_recall_curve("test", save_path=plot_dir / "pr_curve.png")
        
        # Feature importance
        try:
            feature_importance = model.get_feature_importance()
            if feature_importance:
                # Save feature importance
                with open(plot_dir / "feature_importance.json", "w") as f:
                    json.dump(feature_importance, f, indent=2)
                
                # Plot top features
                import matplotlib.pyplot as plt
                
                # Sort features by importance
                sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
                top_features = sorted_features[:20]
                
                plt.figure(figsize=(10, 8))
                plt.barh([f[0] for f in top_features], [f[1] for f in top_features])
                plt.xlabel('Importance')
                plt.ylabel('Feature')
                plt.title('Top 20 Feature Importances')
                plt.tight_layout()
                plt.savefig(plot_dir / "feature_importance.png", dpi=300, bbox_inches='tight')
        except Exception as e:
            logger.warning(f"Could not generate feature importance: {e}")
        
        # SHAP analysis if possible
        try:
            # Calculate SHAP values
            shap_values, X_sampled = evaluator.calculate_shap_values(model, X_test_processed.sample(100))
            
            if shap_values is not None:
                # Plot SHAP summary
                evaluator.plot_shap_summary(shap_values, X_sampled, save_path=plot_dir / "shap_summary.png")
        except Exception as e:
            logger.warning(f"Could not generate SHAP analysis: {e}")
    
    # Save evaluation report
    model_dir = Path(args.existing_model).parent if args.evaluate_only else model_dir
    evaluator.save_evaluation_report(model_dir / "evaluation", args.model_name, "test")
    
    logger.info(f"Saved evaluation report to {model_dir / 'evaluation'}")
    
    # Initialize model monitoring
    if config.MONITORING_CONFIG.get("enable_monitoring", True):
        monitor = ModelMonitor()
        
        # Track model performance
        from utils.evaluation import track_model_performance
        
        model_path = args.existing_model if args.evaluate_only else model_path
        track_model_performance(
            model_path,
            test_metrics,
            model_dir / "monitoring" / "performance_history.csv"
        )
    
    logger.info("Model training and evaluation completed successfully")

if __name__ == "__main__":
    main()