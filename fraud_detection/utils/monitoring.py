"""
Monitoring utilities for the fraud detection system
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Union, Optional, Any, Tuple
import logging
from pathlib import Path
import json
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from scipy.stats import ks_2samp

from config import MONITORING_CONFIG

logger = logging.getLogger(__name__)

class ModelMonitor:
    """
    Class for monitoring the fraud detection model in production
    """
    
    def __init__(self, config: Dict = None):
        """
        Initialize the model monitor with configuration
        
        Args:
            config: Dictionary containing monitoring configuration
        """
        self.config = config or MONITORING_CONFIG
        self.metrics_path = Path(self.config.get("metrics_path", "monitoring/metrics"))
        self.metrics_path.mkdir(parents=True, exist_ok=True)
        
        self.enable_monitoring = self.config.get("enable_monitoring", True)
        self.alert_threshold = self.config.get("alert_threshold", {
            "precision": 0.8,
            "recall": 0.8,
            "f1": 0.8
        })
    
    def log_prediction(self, 
                      prediction_id: str,
                      features: Dict[str, Any],
                      prediction: Union[int, float],
                      probability: Optional[float] = None,
                      true_label: Optional[Union[int, float]] = None,
                      metadata: Optional[Dict[str, Any]] = None) -> None:
        """
        Log a single prediction for monitoring
        
        Args:
            prediction_id: Unique ID for the prediction
            features: Dictionary of features used for prediction
            prediction: Model prediction (0/1 or class label)
            probability: Prediction probability (for binary classification)
            true_label: Actual label if available (for feedback loop)
            metadata: Additional metadata about the prediction
        """
        if not self.enable_monitoring:
            return
        
        # Create prediction log
        log_entry = {
            "prediction_id": prediction_id,
            "timestamp": datetime.now().isoformat(),
            "prediction": prediction,
            "probability": probability,
            "true_label": true_label,
            "features": features
        }
        
        if metadata:
            log_entry["metadata"] = metadata
        
        # Save to log file
        log_path = self.metrics_path / "prediction_logs.jsonl"
        
        with open(log_path, "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    
    def log_batch_predictions(self, 
                           predictions_df: pd.DataFrame,
                           features_cols: List[str],
                           prediction_col: str,
                           probability_col: Optional[str] = None,
                           true_label_col: Optional[str] = None,
                           id_col: Optional[str] = None) -> None:
        """
        Log a batch of predictions for monitoring
        
        Args:
            predictions_df: DataFrame with predictions
            features_cols: List of feature column names
            prediction_col: Name of the prediction column
            probability_col: Name of the probability column
            true_label_col: Name of the true label column
            id_col: Name of the ID column
        """
        if not self.enable_monitoring:
            return
        
        # Generate prediction IDs if not provided
        if id_col is None or id_col not in predictions_df.columns:
            predictions_df["prediction_id"] = [
                f"pred_{datetime.now().strftime('%Y%m%d')}_{i}" 
                for i in range(len(predictions_df))
            ]
            id_col = "prediction_id"
        
        # Prepare log entries
        log_entries = []
        
        for _, row in predictions_df.iterrows():
            features = {col: row[col] for col in features_cols if col in row}
            
            log_entry = {
                "prediction_id": str(row[id_col]),
                "timestamp": datetime.now().isoformat(),
                "prediction": float(row[prediction_col]) if prediction_col in row else None,
                "features": features
            }
            
            if probability_col and probability_col in row:
                log_entry["probability"] = float(row[probability_col])
                
            if true_label_col and true_label_col in row:
                log_entry["true_label"] = float(row[true_label_col])
            
            log_entries.append(log_entry)
        
        # Save to log file
        log_path = self.metrics_path / "prediction_logs.jsonl"
        
        with open(log_path, "a") as f:
            for entry in log_entries:
                f.write(json.dumps(entry) + "\n")
        
        logger.info(f"Logged {len(log_entries)} predictions to {log_path}")
    
    def calculate_performance_metrics(self, 
                                    start_time: Optional[datetime] = None,
                                    end_time: Optional[datetime] = None) -> Dict[str, float]:
        """
        Calculate performance metrics based on logged predictions
        
        Args:
            start_time: Start time for filtering logs
            end_time: End time for filtering logs
            
        Returns:
            Dictionary of performance metrics
        """
        if not self.enable_monitoring:
            return {}
        
        log_path = self.metrics_path / "prediction_logs.jsonl"
        
        if not log_path.exists():
            logger.warning(f"No prediction logs found at {log_path}")
            return {}
        
        # Load logs
        logs = []
        with open(log_path, "r") as f:
            for line in f:
                logs.append(json.loads(line))
        
        # Filter logs by time if specified
        if start_time or end_time:
            filtered_logs = []
            for log in logs:
                log_time = datetime.fromisoformat(log["timestamp"])
                
                if start_time and log_time < start_time:
                    continue
                    
                if end_time and log_time > end_time:
                    continue
                
                filtered_logs.append(log)
            
            logs = filtered_logs
        
        # Extract predictions and true labels
        predictions = []
        true_labels = []
        probabilities = []
        
        for log in logs:
            if "prediction" in log and "true_label" in log and log["true_label"] is not None:
                predictions.append(log["prediction"])
                true_labels.append(log["true_label"])
                
                if "probability" in log and log["probability"] is not None:
                    probabilities.append(log["probability"])
        
        if not true_labels or not predictions:
            logger.warning("No labeled data found in logs for calculating metrics")
            return {}
        
        # Calculate metrics
        metrics = {}
        metrics["count"] = len(true_labels)
        metrics["accuracy"] = float(accuracy_score(true_labels, predictions))
        metrics["precision"] = float(precision_score(true_labels, predictions, zero_division=0))
        metrics["recall"] = float(recall_score(true_labels, predictions, zero_division=0))
        metrics["f1"] = float(f1_score(true_labels, predictions, zero_division=0))
        
        # Save metrics
        metrics_path = self.metrics_path / "performance_metrics.json"
        
        # Load existing metrics if available
        existing_metrics = []
        if metrics_path.exists():
            with open(metrics_path, "r") as f:
                existing_metrics = json.load(f)
                if not isinstance(existing_metrics, list):
                    existing_metrics = [existing_metrics]
        
        # Add timestamp to new metrics
        metrics["timestamp"] = datetime.now().isoformat()
        
        # Append new metrics
        existing_metrics.append(metrics)
        
        # Save metrics
        with open(metrics_path, "w") as f:
            json.dump(existing_metrics, f, indent=2)
        
        logger.info(f"Calculated performance metrics: {metrics}")
        
        # Check for alerts
        self._check_metric_alerts(metrics)
        
        return metrics
    
    def detect_data_drift(self, 
                        reference_data: pd.DataFrame,
                        current_data: pd.DataFrame,
                        feature_columns: List[str],
                        threshold: float = 0.05) -> Dict[str, Any]:
        """
        Detect drift between reference data and current data
        
        Args:
            reference_data: Reference data (training data)
            current_data: Current data to compare
            feature_columns: List of feature columns to check for drift
            threshold: P-value threshold for drift detection
            
        Returns:
            Dictionary with drift statistics
        """
        if not self.config.get("drift_detection", True):
            return {}
        
        drift_results = {
            "timestamp": datetime.now().isoformat(),
            "n_reference": len(reference_data),
            "n_current": len(current_data),
            "features": {},
            "overall_drift": False
        }
        
        for column in feature_columns:
            if column not in reference_data.columns or column not in current_data.columns:
                continue
                
            # Skip non-numeric columns
            if not pd.api.types.is_numeric_dtype(reference_data[column]) or \
               not pd.api.types.is_numeric_dtype(current_data[column]):
                continue
            
            # Skip columns with all missing values
            if reference_data[column].isnull().all() or current_data[column].isnull().all():
                continue
            
            # Fill missing values for KS test
            ref_values = reference_data[column].fillna(reference_data[column].median())
            cur_values = current_data[column].fillna(current_data[column].median())
            
            # Perform Kolmogorov-Smirnov test
            ks_stat, p_value = ks_2samp(ref_values, cur_values)
            
            drift_detected = p_value < threshold
            
            drift_results["features"][column] = {
                "ks_stat": float(ks_stat),
                "p_value": float(p_value),
                "drift_detected": drift_detected
            }
            
            if drift_detected:
                drift_results["overall_drift"] = True
        
        # Save drift results
        drift_path = self.metrics_path / "drift_metrics.json"
        
        # Load existing metrics if available
        existing_metrics = []
        if drift_path.exists():
            with open(drift_path, "r") as f:
                existing_metrics = json.load(f)
                if not isinstance(existing_metrics, list):
                    existing_metrics = [existing_metrics]
        
        # Append new metrics
        existing_metrics.append(drift_results)
        
        # Save metrics
        with open(drift_path, "w") as f:
            json.dump(existing_metrics, f, indent=2)
        
        if drift_results["overall_drift"]:
            logger.warning("Data drift detected in production data")
            
            # List drifted features
            drifted_features = [
                f for f, v in drift_results["features"].items() 
                if v.get("drift_detected", False)
            ]
            
            logger.warning(f"Drifted features: {', '.join(drifted_features)}")
        
        return drift_results
    
    def get_recent_predictions(self, 
                             hours: int = 24,
                             limit: int = 1000) -> pd.DataFrame:
        """
        Get recent predictions from logs
        
        Args:
            hours: Number of hours to look back
            limit: Maximum number of predictions to return
            
        Returns:
            DataFrame with recent predictions
        """
        log_path = self.metrics_path / "prediction_logs.jsonl"
        
        if not log_path.exists():
            logger.warning(f"No prediction logs found at {log_path}")
            return pd.DataFrame()
        
        # Load logs
        logs = []
        with open(log_path, "r") as f:
            for line in f:
                logs.append(json.loads(line))
        
        # Filter logs by time
        start_time = datetime.now() - timedelta(hours=hours)
        
        filtered_logs = []
        for log in logs:
            log_time = datetime.fromisoformat(log["timestamp"])
            
            if log_time >= start_time:
                filtered_logs.append(log)
        
        # Sort by timestamp (newest first)
        filtered_logs.sort(key=lambda x: x["timestamp"], reverse=True)
        
        # Apply limit
        filtered_logs = filtered_logs[:limit]
        
        # Convert to dataframe
        if not filtered_logs:
            return pd.DataFrame()
        
        # Extract base fields
        df = pd.DataFrame([
            {
                "prediction_id": log.get("prediction_id", ""),
                "timestamp": log.get("timestamp", ""),
                "prediction": log.get("prediction", None),
                "probability": log.get("probability", None),
                "true_label": log.get("true_label", None)
            }
            for log in filtered_logs
        ])
        
        # Parse timestamp
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        
        return df
    
    def plot_performance_trend(self, 
                             metric: str = "f1",
                             days: int = 30,
                             save_path: Optional[Union[str, Path]] = None) -> plt.Figure:
        """
        Plot performance trend over time
        
        Args:
            metric: Metric to plot
            days: Number of days to look back
            save_path: Path to save the plot
            
        Returns:
            Matplotlib figure
        """
        metrics_path = self.metrics_path / "performance_metrics.json"
        
        if not metrics_path.exists():
            logger.warning(f"No performance metrics found at {metrics_path}")
            return plt.figure()
        
        # Load metrics
        with open(metrics_path, "r") as f:
            metrics_data = json.load(f)
            if not isinstance(metrics_data, list):
                metrics_data = [metrics_data]
        
        # Convert to dataframe
        df = pd.DataFrame(metrics_data)
        
        # Parse timestamp
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        
        # Filter by days
        start_time = datetime.now() - timedelta(days=days)
        df = df[df["timestamp"] >= start_time]
        
        if len(df) == 0:
            logger.warning(f"No performance data found within the last {days} days")
            return plt.figure()
        
        # Sort by timestamp
        df = df.sort_values("timestamp")
        
        # Check if metric exists
        if metric not in df.columns:
            logger.warning(f"Metric {metric} not found in performance data")
            return plt.figure()
        
        # Create plot
        plt.figure(figsize=(10, 6))
        plt.plot(df["timestamp"], df[metric], marker='o')
        plt.axhline(y=self.alert_threshold.get(metric, 0), color='r', linestyle='--', 
                   label=f'Alert Threshold ({self.alert_threshold.get(metric, 0)})')
        
        plt.title(f'{metric.capitalize()} Trend Over Time')
        plt.xlabel('Time')
        plt.ylabel(metric.capitalize())
        plt.grid(True, alpha=0.3)
        plt.legend()
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        # Save plot if path is provided
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        return plt.gcf()
    
    def _check_metric_alerts(self, metrics: Dict[str, float]) -> None:
        """
        Check if metrics are below alert thresholds
        
        Args:
            metrics: Dictionary of performance metrics
        """
        alerts = []
        
        for metric, threshold in self.alert_threshold.items():
            if metric in metrics and metrics[metric] < threshold:
                alerts.append(f"{metric} ({metrics[metric]:.4f}) below threshold ({threshold})")
        
        if alerts:
            logger.warning(f"Performance alerts: {', '.join(alerts)}")


def extract_predictions_for_monitoring(
    log_path: Union[str, Path],
    start_date: Optional[Union[str, datetime]] = None,
    end_date: Optional[Union[str, datetime]] = None
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Extract predictions and features from logs for monitoring
    
    Args:
        log_path: Path to prediction logs
        start_date: Start date for filtering logs
        end_date: End date for filtering logs
        
    Returns:
        Tuple of (predictions_df, features_df)
    """
    log_path = Path(log_path)
    
    if not log_path.exists():
        logger.warning(f"No prediction logs found at {log_path}")
        return pd.DataFrame(), pd.DataFrame()
    
    # Parse dates if provided as strings
    if isinstance(start_date, str):
        start_date = datetime.fromisoformat(start_date)
    
    if isinstance(end_date, str):
        end_date = datetime.fromisoformat(end_date)
    
    # Load logs
    logs = []
    with open(log_path, "r") as f:
        for line in f:
            try:
                logs.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    
    # Filter logs by time if specified
    if start_date or end_date:
        filtered_logs = []
        for log in logs:
            try:
                log_time = datetime.fromisoformat(log["timestamp"])
                
                if start_date and log_time < start_date:
                    continue
                    
                if end_date and log_time > end_date:
                    continue
                
                filtered_logs.append(log)
            except (KeyError, ValueError):
                continue
        
        logs = filtered_logs
    
    if not logs:
        logger.warning("No logs found for the specified time period")
        return pd.DataFrame(), pd.DataFrame()
    
    # Extract base predictions dataframe
    predictions_data = []
    for log in logs:
        prediction_data = {
            "prediction_id": log.get("prediction_id", ""),
            "timestamp": log.get("timestamp", ""),
            "prediction": log.get("prediction", None),
            "probability": log.get("probability", None),
            "true_label": log.get("true_label", None)
        }
        predictions_data.append(prediction_data)
    
    predictions_df = pd.DataFrame(predictions_data)
    if "timestamp" in predictions_df.columns:
        predictions_df["timestamp"] = pd.to_datetime(predictions_df["timestamp"])
    
    # Extract features dataframe
    features_data = []
    for log in logs:
        if "features" not in log or not isinstance(log["features"], dict):
            continue
            
        feature_data = {
            "prediction_id": log.get("prediction_id", "")
        }
        
        # Add all features
        feature_data.update(log["features"])
        features_data.append(feature_data)
    
    features_df = pd.DataFrame(features_data)
    
    # Return both dataframes
    return predictions_df, features_df