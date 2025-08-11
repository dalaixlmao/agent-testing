"""
Evaluation utilities for fraud detection models
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, List, Tuple, Union, Any, Optional
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, 
    roc_auc_score, confusion_matrix, precision_recall_curve, 
    average_precision_score, roc_curve
)
import logging
from pathlib import Path
import shap
import joblib
import json
from datetime import datetime
import time

logger = logging.getLogger(__name__)

class ModelEvaluator:
    """
    Class for evaluating fraud detection models
    """
    
    def __init__(self, threshold: float = 0.5):
        """
        Initialize the evaluator
        
        Args:
            threshold: Classification threshold for binary predictions
        """
        self.threshold = threshold
        self.results = {}
        
    def evaluate(self, 
                model: Any, 
                X: Union[pd.DataFrame, np.ndarray], 
                y_true: Union[pd.Series, np.ndarray], 
                dataset_name: str = "test") -> Dict[str, float]:
        """
        Evaluate a model on the given dataset
        
        Args:
            model: Trained model object with predict_proba method
            X: Feature matrix
            y_true: Ground truth labels
            dataset_name: Name of the dataset (e.g., "train", "test")
            
        Returns:
            Dictionary of evaluation metrics
        """
        logger.info(f"Evaluating model on {dataset_name} dataset")
        
        start_time = time.time()
        
        # Get predictions
        if hasattr(model, "predict_proba"):
            y_prob = model.predict_proba(X)[:, 1]
            y_pred = (y_prob >= self.threshold).astype(int)
        else:
            y_pred = model.predict(X)
            y_prob = None
        
        inference_time = time.time() - start_time
        avg_inference_time_per_sample = inference_time / len(X) if len(X) > 0 else 0
        
        # Calculate basic metrics
        metrics = {}
        metrics["accuracy"] = float(accuracy_score(y_true, y_pred))
        metrics["precision"] = float(precision_score(y_true, y_pred, zero_division=0))
        metrics["recall"] = float(recall_score(y_true, y_pred, zero_division=0))
        metrics["f1"] = float(f1_score(y_true, y_pred, zero_division=0))
        
        if y_prob is not None:
            metrics["auc_roc"] = float(roc_auc_score(y_true, y_prob))
            metrics["avg_precision"] = float(average_precision_score(y_true, y_prob))
        
        # Calculate confusion matrix
        cm = confusion_matrix(y_true, y_pred)
        metrics["tn"] = int(cm[0, 0])
        metrics["fp"] = int(cm[0, 1])
        metrics["fn"] = int(cm[1, 0])
        metrics["tp"] = int(cm[1, 1])
        
        # Calculate performance metrics
        metrics["inference_time_total"] = float(inference_time)
        metrics["inference_time_per_sample"] = float(avg_inference_time_per_sample)
        metrics["timestamp"] = datetime.now().isoformat()
        
        # Store results
        self.results[dataset_name] = {
            "metrics": metrics,
            "y_true": y_true,
            "y_pred": y_pred,
            "y_prob": y_prob if y_prob is not None else y_pred
        }
        
        logger.info(f"Evaluation results for {dataset_name} dataset:")
        for metric, value in metrics.items():
            if metric != "timestamp":
                logger.info(f"  {metric}: {value}")
        
        return metrics
    
    def plot_confusion_matrix(self, 
                            dataset_name: str = "test", 
                            normalize: bool = False,
                            save_path: Optional[Union[str, Path]] = None) -> plt.Figure:
        """
        Plot confusion matrix
        
        Args:
            dataset_name: Name of the dataset
            normalize: Whether to normalize the confusion matrix
            save_path: Path to save the plot
            
        Returns:
            Matplotlib figure
        """
        if dataset_name not in self.results:
            raise ValueError(f"No results found for dataset '{dataset_name}'")
        
        y_true = self.results[dataset_name]["y_true"]
        y_pred = self.results[dataset_name]["y_pred"]
        
        cm = confusion_matrix(y_true, y_pred)
        
        if normalize:
            cm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
        
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='.2f' if normalize else 'd', cmap='Blues', 
                    xticklabels=['Legitimate', 'Fraud'], yticklabels=['Legitimate', 'Fraud'])
        plt.title(f'Confusion Matrix - {dataset_name} dataset')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        return plt.gcf()
    
    def plot_roc_curve(self, 
                     dataset_name: str = "test",
                     save_path: Optional[Union[str, Path]] = None) -> plt.Figure:
        """
        Plot ROC curve
        
        Args:
            dataset_name: Name of the dataset
            save_path: Path to save the plot
            
        Returns:
            Matplotlib figure
        """
        if dataset_name not in self.results:
            raise ValueError(f"No results found for dataset '{dataset_name}'")
        
        y_true = self.results[dataset_name]["y_true"]
        y_prob = self.results[dataset_name]["y_prob"]
        
        fpr, tpr, _ = roc_curve(y_true, y_prob)
        auc = roc_auc_score(y_true, y_prob)
        
        plt.figure(figsize=(8, 6))
        plt.plot(fpr, tpr, label=f'AUC = {auc:.4f}')
        plt.plot([0, 1], [0, 1], 'k--', label='Random')
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title(f'ROC Curve - {dataset_name} dataset')
        plt.legend(loc='lower right')
        plt.grid(True, alpha=0.3)
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        return plt.gcf()
    
    def plot_precision_recall_curve(self, 
                                  dataset_name: str = "test",
                                  save_path: Optional[Union[str, Path]] = None) -> plt.Figure:
        """
        Plot precision-recall curve
        
        Args:
            dataset_name: Name of the dataset
            save_path: Path to save the plot
            
        Returns:
            Matplotlib figure
        """
        if dataset_name not in self.results:
            raise ValueError(f"No results found for dataset '{dataset_name}'")
        
        y_true = self.results[dataset_name]["y_true"]
        y_prob = self.results[dataset_name]["y_prob"]
        
        precision, recall, _ = precision_recall_curve(y_true, y_prob)
        avg_precision = average_precision_score(y_true, y_prob)
        
        plt.figure(figsize=(8, 6))
        plt.plot(recall, precision, label=f'AP = {avg_precision:.4f}')
        plt.xlabel('Recall')
        plt.ylabel('Precision')
        plt.title(f'Precision-Recall Curve - {dataset_name} dataset')
        plt.legend(loc='upper right')
        plt.grid(True, alpha=0.3)
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        return plt.gcf()
    
    def find_optimal_threshold(self, 
                             dataset_name: str = "val",
                             metric: str = "f1") -> float:
        """
        Find the optimal classification threshold based on the specified metric
        
        Args:
            dataset_name: Name of the dataset
            metric: Metric to optimize ('f1', 'precision', 'recall')
            
        Returns:
            Optimal threshold value
        """
        if dataset_name not in self.results:
            raise ValueError(f"No results found for dataset '{dataset_name}'")
        
        y_true = self.results[dataset_name]["y_true"]
        y_prob = self.results[dataset_name]["y_prob"]
        
        # Define the metrics to optimize
        if metric == 'f1':
            def score_func(threshold):
                y_pred = (y_prob >= threshold).astype(int)
                return f1_score(y_true, y_pred)
        elif metric == 'precision':
            def score_func(threshold):
                y_pred = (y_prob >= threshold).astype(int)
                return precision_score(y_true, y_pred, zero_division=0)
        elif metric == 'recall':
            def score_func(threshold):
                y_pred = (y_prob >= threshold).astype(int)
                return recall_score(y_true, y_pred, zero_division=0)
        else:
            raise ValueError(f"Unknown metric '{metric}'")
        
        # Try different thresholds
        thresholds = np.arange(0.01, 1.0, 0.01)
        scores = [score_func(threshold) for threshold in thresholds]
        
        # Find threshold with highest score
        best_idx = np.argmax(scores)
        best_threshold = thresholds[best_idx]
        best_score = scores[best_idx]
        
        logger.info(f"Optimal threshold: {best_threshold:.4f} (based on {metric}, score: {best_score:.4f})")
        
        # Update the threshold
        self.threshold = best_threshold
        
        return best_threshold
    
    def calculate_shap_values(self, 
                            model: Any, 
                            X: pd.DataFrame,
                            n_samples: int = 100,
                            background_samples: int = 100) -> Tuple[np.ndarray, np.ndarray]:
        """
        Calculate SHAP values for model interpretability
        
        Args:
            model: Trained model object
            X: Feature matrix (can be a subset for speed)
            n_samples: Number of samples to use for SHAP calculation
            background_samples: Number of background samples for SHAP explainer
            
        Returns:
            Tuple of (shap_values, X_sampled)
        """
        logger.info("Calculating SHAP values for model interpretability")
        
        # Sample data if it's too large
        if len(X) > n_samples:
            X_sampled = X.sample(n_samples, random_state=42)
        else:
            X_sampled = X
        
        # Calculate SHAP values based on model type
        if hasattr(model, "predict_proba"):
            # Try tree explainer first (works for tree-based models)
            try:
                background = X.sample(min(background_samples, len(X)), random_state=42)
                explainer = shap.TreeExplainer(model, background)
                shap_values = explainer.shap_values(X_sampled)
                
                # For tree-based models with binary classification, shap_values may be a list
                if isinstance(shap_values, list):
                    shap_values = shap_values[1]  # Get SHAP values for the positive class
            
            # Fall back to kernel explainer for other model types
            except Exception as e:
                logger.info(f"Tree explainer failed, using Kernel explainer: {e}")
                background = X.sample(min(background_samples, len(X)), random_state=42)
                
                # Define prediction function (for positive class probability)
                def predict_proba_positive(x):
                    return model.predict_proba(x)[:, 1]
                
                explainer = shap.KernelExplainer(predict_proba_positive, background)
                shap_values = explainer.shap_values(X_sampled)
        
        else:
            # For models without predict_proba
            try:
                background = X.sample(min(background_samples, len(X)), random_state=42)
                explainer = shap.KernelExplainer(model.predict, background)
                shap_values = explainer.shap_values(X_sampled)
            except Exception as e:
                logger.error(f"SHAP calculation failed: {e}")
                return None, X_sampled
        
        logger.info(f"Successfully calculated SHAP values for {len(X_sampled)} samples")
        
        return shap_values, X_sampled
    
    def plot_shap_summary(self,
                        shap_values: np.ndarray,
                        X_sampled: pd.DataFrame,
                        save_path: Optional[Union[str, Path]] = None) -> plt.Figure:
        """
        Plot SHAP summary plot
        
        Args:
            shap_values: SHAP values from calculate_shap_values
            X_sampled: Feature matrix used for SHAP calculation
            save_path: Path to save the plot
            
        Returns:
            Matplotlib figure
        """
        plt.figure(figsize=(10, 8))
        shap.summary_plot(shap_values, X_sampled, show=False)
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        return plt.gcf()
    
    def save_metrics(self, 
                   path: Union[str, Path],
                   dataset_name: str = "test") -> None:
        """
        Save metrics to a JSON file
        
        Args:
            path: Path to save the metrics
            dataset_name: Name of the dataset
        """
        if dataset_name not in self.results:
            raise ValueError(f"No results found for dataset '{dataset_name}'")
        
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        
        metrics = self.results[dataset_name]["metrics"]
        
        with open(path, 'w') as f:
            json.dump(metrics, f, indent=4)
        
        logger.info(f"Saved metrics to {path}")
    
    def save_evaluation_report(self, 
                             path: Union[str, Path],
                             model_name: str,
                             dataset_name: str = "test") -> None:
        """
        Save a comprehensive evaluation report with metrics and plots
        
        Args:
            path: Directory path to save the report
            model_name: Name of the model
            dataset_name: Name of the dataset
        """
        path = Path(path)
        path.mkdir(parents=True, exist_ok=True)
        
        # Save metrics
        self.save_metrics(path / f"{model_name}_metrics.json", dataset_name)
        
        # Save plots
        self.plot_confusion_matrix(dataset_name, save_path=path / f"{model_name}_confusion_matrix.png")
        self.plot_roc_curve(dataset_name, save_path=path / f"{model_name}_roc_curve.png")
        self.plot_precision_recall_curve(dataset_name, save_path=path / f"{model_name}_pr_curve.png")
        
        logger.info(f"Saved evaluation report to {path}")


def compare_models(
    models: Dict[str, Any],
    X: pd.DataFrame,
    y: pd.Series,
    metrics: List[str] = ["accuracy", "precision", "recall", "f1", "auc_roc"],
    threshold: float = 0.5
) -> pd.DataFrame:
    """
    Compare multiple models on the same dataset
    
    Args:
        models: Dictionary mapping model names to model objects
        X: Feature matrix
        y: Target vector
        metrics: List of metrics to compare
        threshold: Classification threshold
        
    Returns:
        DataFrame with comparison results
    """
    logger.info(f"Comparing {len(models)} models: {list(models.keys())}")
    
    results = {}
    
    for name, model in models.items():
        logger.info(f"Evaluating model: {name}")
        evaluator = ModelEvaluator(threshold=threshold)
        model_metrics = evaluator.evaluate(model, X, y)
        
        results[name] = {metric: model_metrics.get(metric, np.nan) for metric in metrics}
    
    # Convert to DataFrame for easy comparison
    results_df = pd.DataFrame.from_dict(results, orient='index')
    
    # Log best model for each metric
    for metric in metrics:
        if metric in results_df.columns:
            best_model = results_df[metric].idxmax()
            best_value = results_df[metric].max()
            logger.info(f"Best model for {metric}: {best_model} ({best_value:.4f})")
    
    return results_df


def track_model_performance(
    model_path: Union[str, Path],
    metrics: Dict[str, float],
    metrics_history_path: Optional[Union[str, Path]] = None
) -> pd.DataFrame:
    """
    Track model performance over time
    
    Args:
        model_path: Path to the model file
        metrics: Dictionary of evaluation metrics
        metrics_history_path: Path to save the metrics history
        
    Returns:
        DataFrame with metrics history
    """
    model_path = Path(model_path)
    
    # Generate default metrics history path if not provided
    if metrics_history_path is None:
        metrics_dir = model_path.parent / "metrics_history"
        metrics_dir.mkdir(parents=True, exist_ok=True)
        metrics_history_path = metrics_dir / f"{model_path.stem}_history.csv"
    
    metrics_history_path = Path(metrics_history_path)
    
    # Add timestamp and model path
    metrics_entry = metrics.copy()
    metrics_entry["timestamp"] = datetime.now().isoformat()
    metrics_entry["model_path"] = str(model_path)
    
    # Create or load metrics history
    if metrics_history_path.exists():
        history_df = pd.read_csv(metrics_history_path)
        history_df = pd.concat([history_df, pd.DataFrame([metrics_entry])], ignore_index=True)
    else:
        history_df = pd.DataFrame([metrics_entry])
    
    # Save updated history
    metrics_history_path.parent.mkdir(parents=True, exist_ok=True)
    history_df.to_csv(metrics_history_path, index=False)
    
    logger.info(f"Updated metrics history at {metrics_history_path}")
    
    return history_df