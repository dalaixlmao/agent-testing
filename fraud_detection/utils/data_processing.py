"""
Data processing utilities for fraud detection system
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Union, Optional
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.impute import SimpleImputer
from imblearn.over_sampling import SMOTE
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import logging
from pathlib import Path

from config import PREPROCESSING_CONFIG, FEATURES

logger = logging.getLogger(__name__)

class DataPreprocessor:
    """
    Class for preprocessing data for fraud detection models
    """
    
    def __init__(self, config: Dict = None):
        """
        Initialize the preprocessor with configuration
        
        Args:
            config: Dictionary containing preprocessing configuration
        """
        self.config = config or PREPROCESSING_CONFIG
        self.categorical_features = FEATURES.get("categorical_features", [])
        self.numerical_features = FEATURES.get("numerical_features", [])
        self.datetime_features = FEATURES.get("datetime_features", [])
        self.target = FEATURES.get("target", "is_fraud")
        
        self.numeric_pipeline = None
        self.categorical_pipeline = None
        self.preprocessor = None
        self.feature_names = None
        self.encoder_dict = {}

    def fit(self, data: pd.DataFrame) -> 'DataPreprocessor':
        """
        Fit preprocessing steps on training data
        
        Args:
            data: Training data as pandas DataFrame
            
        Returns:
            self: The fitted preprocessor
        """
        logger.info("Starting data preprocessing fit")
        self._infer_feature_types(data)
        self._create_preprocessing_pipeline()
        
        # Extract features and fit the pipeline
        features = data.drop(columns=[self.target], errors='ignore')
        self.preprocessor.fit(features)
        
        # Save the feature names
        self._update_feature_names(features)
        
        logger.info("Data preprocessing fit completed")
        return self
        
    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Transform data using fitted preprocessing steps
        
        Args:
            data: Data to transform as pandas DataFrame
            
        Returns:
            Transformed data as pandas DataFrame
        """
        logger.info("Transforming data with preprocessor")
        
        # Check if target is in the data
        has_target = self.target in data.columns
        
        if has_target:
            features = data.drop(columns=[self.target])
            target = data[self.target]
        else:
            features = data.copy()
        
        # Transform the features
        transformed_features = self.preprocessor.transform(features)
        
        # Convert to dataframe with proper column names
        transformed_df = pd.DataFrame(
            transformed_features,
            columns=self.feature_names,
            index=features.index
        )
        
        # Add target back if it was in the original data
        if has_target:
            transformed_df[self.target] = target
            
        return transformed_df
    
    def fit_transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Fit and transform in one step
        
        Args:
            data: Data to fit and transform
            
        Returns:
            Transformed data as pandas DataFrame
        """
        return self.fit(data).transform(data)
    
    def _infer_feature_types(self, data: pd.DataFrame) -> None:
        """
        Infer feature types if not specified in config
        
        Args:
            data: Training data
        """
        # Skip if features are already defined
        if self.categorical_features and self.numerical_features:
            return
        
        logger.info("Inferring feature types from data")
        
        # Exclude target from feature type inference
        features = data.drop(columns=[self.target], errors='ignore')
        
        # Infer categorical and numerical features
        self.categorical_features = []
        self.numerical_features = []
        self.datetime_features = []
        
        for column in features.columns:
            if pd.api.types.is_datetime64_any_dtype(features[column]):
                self.datetime_features.append(column)
            elif pd.api.types.is_categorical_dtype(features[column]) or features[column].nunique() < 20:
                self.categorical_features.append(column)
            else:
                self.numerical_features.append(column)
        
        logger.info(f"Inferred {len(self.numerical_features)} numerical features, "
                    f"{len(self.categorical_features)} categorical features, and "
                    f"{len(self.datetime_features)} datetime features")
    
    def _create_preprocessing_pipeline(self) -> None:
        """
        Create preprocessing pipeline based on configuration
        """
        logger.info("Creating preprocessing pipeline")
        
        # Numerical features pipeline
        numeric_steps = []
        
        # Add imputer for missing values if configured
        if self.config.get("handle_missing", True) and self.numerical_features:
            numeric_steps.append(
                ('imputer', SimpleImputer(strategy='median'))
            )
        
        # Add scaler based on configuration
        scaling_method = self.config.get("feature_scaling")
        if scaling_method and self.numerical_features:
            if scaling_method == "standard":
                numeric_steps.append(('scaler', StandardScaler()))
            elif scaling_method == "minmax":
                numeric_steps.append(('scaler', MinMaxScaler()))
            elif scaling_method == "robust":
                numeric_steps.append(('scaler', RobustScaler()))
        
        self.numeric_pipeline = Pipeline(steps=numeric_steps) if numeric_steps else None
        
        # Categorical features pipeline
        categorical_steps = []
        
        # Add imputer for missing values if configured
        if self.config.get("handle_missing", True) and self.categorical_features:
            categorical_steps.append(
                ('imputer', SimpleImputer(strategy='most_frequent'))
            )
        
        # Add encoder based on configuration
        encoding_method = self.config.get("encoding_method")
        if encoding_method and self.categorical_features:
            if encoding_method == "one_hot":
                categorical_steps.append(
                    ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
                )
            elif encoding_method == "label":
                categorical_steps.append(
                    ('encoder', LabelEncoder())
                )
        
        self.categorical_pipeline = Pipeline(steps=categorical_steps) if categorical_steps else None
        
        # Create column transformer
        transformers = []
        
        if self.numeric_pipeline and self.numerical_features:
            transformers.append(('num', self.numeric_pipeline, self.numerical_features))
            
        if self.categorical_pipeline and self.categorical_features:
            transformers.append(('cat', self.categorical_pipeline, self.categorical_features))
        
        self.preprocessor = ColumnTransformer(
            transformers=transformers,
            remainder='drop'  # Drop other columns
        )
    
    def _update_feature_names(self, data: pd.DataFrame) -> None:
        """
        Update feature names after preprocessing for better interpretability
        
        Args:
            data: Original data with features
        """
        feature_names = []
        
        # Get the column transformer
        column_transformer = self.preprocessor
        
        # Iterate through transformers
        for name, transformer, columns in column_transformer.transformers_:
            if name == 'remainder':
                continue
                
            # Handle different types of transformers
            if name == 'num':
                # For numerical features, names remain the same
                feature_names.extend(columns)
            elif name == 'cat':
                # For categorical features with one-hot encoding
                encoder = transformer.named_steps.get('encoder')
                if encoder and hasattr(encoder, 'get_feature_names_out'):
                    # For OneHotEncoder
                    encoder_features = encoder.get_feature_names_out(columns)
                    feature_names.extend(encoder_features)
                else:
                    # For other encoders
                    feature_names.extend(columns)
        
        self.feature_names = feature_names
    
    def save(self, path: Union[str, Path]) -> None:
        """
        Save the preprocessor to disk
        
        Args:
            path: Path to save the preprocessor
        """
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        
        joblib.dump(self, path)
        logger.info(f"Saved preprocessor to {path}")
    
    @classmethod
    def load(cls, path: Union[str, Path]) -> 'DataPreprocessor':
        """
        Load a preprocessor from disk
        
        Args:
            path: Path to load the preprocessor from
            
        Returns:
            Loaded DataPreprocessor object
        """
        path = Path(path)
        preprocessor = joblib.load(path)
        logger.info(f"Loaded preprocessor from {path}")
        return preprocessor


def load_and_split_data(
    file_path: Union[str, Path],
    target: str = None,
    test_size: float = 0.2,
    val_size: float = 0.1,
    random_state: int = 42,
    stratify: bool = True
) -> Dict[str, pd.DataFrame]:
    """
    Load data from file and split into train, validation, and test sets
    
    Args:
        file_path: Path to the data file
        target: Name of the target column
        test_size: Proportion of data to use for testing
        val_size: Proportion of training data to use for validation
        random_state: Random state for reproducibility
        stratify: Whether to stratify splits based on target
        
    Returns:
        Dictionary containing train, val, and test DataFrames
    """
    logger.info(f"Loading data from {file_path}")
    
    # Detect file format and load accordingly
    file_path = Path(file_path)
    if file_path.suffix.lower() == '.csv':
        data = pd.read_csv(file_path)
    elif file_path.suffix.lower() in ['.xls', '.xlsx']:
        data = pd.read_excel(file_path)
    elif file_path.suffix.lower() == '.parquet':
        data = pd.read_parquet(file_path)
    else:
        raise ValueError(f"Unsupported file format: {file_path.suffix}")
    
    logger.info(f"Loaded data with {data.shape[0]} rows and {data.shape[1]} columns")
    
    # Use target from config if not specified
    if target is None:
        target = FEATURES.get("target", "is_fraud")
    
    # Check if target exists in data
    if target not in data.columns:
        raise ValueError(f"Target column '{target}' not found in data")
    
    # Split data into train+val and test
    stratify_col = data[target] if stratify else None
    train_val_data, test_data = train_test_split(
        data,
        test_size=test_size,
        random_state=random_state,
        stratify=stratify_col
    )
    
    # Split train+val into train and val
    if val_size > 0:
        # Adjust val_size to be relative to train_val_data size
        adjusted_val_size = val_size / (1 - test_size)
        stratify_col = train_val_data[target] if stratify else None
        
        train_data, val_data = train_test_split(
            train_val_data,
            test_size=adjusted_val_size,
            random_state=random_state,
            stratify=stratify_col
        )
    else:
        train_data = train_val_data
        val_data = None
    
    result = {
        "train": train_data,
        "test": test_data
    }
    
    if val_data is not None:
        result["val"] = val_data
    
    # Log split sizes
    logger.info(f"Train set: {train_data.shape[0]} samples")
    if val_data is not None:
        logger.info(f"Validation set: {val_data.shape[0]} samples")
    logger.info(f"Test set: {test_data.shape[0]} samples")
    
    return result


def handle_class_imbalance(
    X: pd.DataFrame,
    y: pd.Series,
    method: str = "smote",
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Handle class imbalance using various techniques
    
    Args:
        X: Feature matrix
        y: Target vector
        method: Method to use for handling imbalance ("smote", "undersampling", etc.)
        random_state: Random state for reproducibility
        
    Returns:
        Rebalanced feature matrix and target vector
    """
    logger.info(f"Handling class imbalance using {method}")
    
    # Calculate class imbalance
    class_counts = y.value_counts()
    imbalance_ratio = class_counts.min() / class_counts.max()
    
    logger.info(f"Class distribution: {class_counts.to_dict()}")
    logger.info(f"Imbalance ratio: {imbalance_ratio:.4f}")
    
    # Apply selected method
    if method == "smote":
        smote = SMOTE(random_state=random_state)
        X_resampled, y_resampled = smote.fit_resample(X, y)
        logger.info(f"After SMOTE: {y_resampled.value_counts().to_dict()}")
        return X_resampled, y_resampled
    
    elif method == "none" or method is None:
        # Return original data
        return X, y
    
    else:
        logger.warning(f"Unknown imbalance handling method: {method}, using original data")
        return X, y


def generate_synthetic_fraud_data(
    n_samples: int = 10000,
    fraud_ratio: float = 0.05,
    random_state: int = 42,
    output_path: Optional[Union[str, Path]] = None
) -> pd.DataFrame:
    """
    Generate synthetic fraud transaction data for testing
    
    Args:
        n_samples: Number of samples to generate
        fraud_ratio: Ratio of fraudulent transactions
        random_state: Random state for reproducibility
        output_path: Path to save the generated data
        
    Returns:
        DataFrame with synthetic fraud data
    """
    logger.info(f"Generating {n_samples} synthetic transactions with {fraud_ratio:.1%} fraud ratio")
    
    np.random.seed(random_state)
    
    # Calculate number of fraudulent and legitimate transactions
    n_fraud = int(n_samples * fraud_ratio)
    n_legitimate = n_samples - n_fraud
    
    # Generate timestamps over the last 30 days
    end_date = pd.Timestamp.now()
    start_date = end_date - pd.Timedelta(days=30)
    timestamps = pd.date_range(start=start_date, end=end_date, periods=n_samples)
    np.random.shuffle(timestamps)
    
    # Generate user IDs (1000 distinct users)
    user_ids = np.random.randint(1, 1001, size=n_samples)
    
    # Generate merchant IDs (500 distinct merchants)
    merchant_ids = np.random.randint(1, 501, size=n_samples)
    
    # Generate legitimate transaction data
    legitimate_data = {
        'timestamp': timestamps[:n_legitimate],
        'user_id': user_ids[:n_legitimate],
        'merchant_id': merchant_ids[:n_legitimate],
        'amount': np.random.exponential(scale=50, size=n_legitimate),
        'distance_from_home': np.random.exponential(scale=10, size=n_legitimate),
        'distance_from_last_transaction': np.random.exponential(scale=5, size=n_legitimate),
        'ratio_to_median_purchase_price': np.random.normal(loc=1, scale=0.5, size=n_legitimate),
        'repeat_retailer': np.random.binomial(1, 0.8, size=n_legitimate),
        'used_chip': np.random.binomial(1, 0.9, size=n_legitimate),
        'used_pin_number': np.random.binomial(1, 0.8, size=n_legitimate),
        'online_order': np.random.binomial(1, 0.2, size=n_legitimate),
        'is_fraud': 0
    }
    
    # Generate fraudulent transaction data with different distributions
    fraud_data = {
        'timestamp': timestamps[n_legitimate:],
        'user_id': user_ids[n_legitimate:],
        'merchant_id': merchant_ids[n_legitimate:],
        'amount': np.random.exponential(scale=200, size=n_fraud),  # Higher amounts
        'distance_from_home': np.random.exponential(scale=50, size=n_fraud),  # Further from home
        'distance_from_last_transaction': np.random.exponential(scale=20, size=n_fraud),  # Further from last transaction
        'ratio_to_median_purchase_price': np.random.normal(loc=3, scale=1, size=n_fraud),  # Higher ratio
        'repeat_retailer': np.random.binomial(1, 0.2, size=n_fraud),  # Less likely to be repeat retailer
        'used_chip': np.random.binomial(1, 0.3, size=n_fraud),  # Less likely to use chip
        'used_pin_number': np.random.binomial(1, 0.2, size=n_fraud),  # Less likely to use PIN
        'online_order': np.random.binomial(1, 0.8, size=n_fraud),  # More likely to be online order
        'is_fraud': 1
    }
    
    # Combine legitimate and fraudulent data
    combined_data = {}
    for key in legitimate_data.keys():
        combined_data[key] = np.concatenate([legitimate_data[key], fraud_data[key]])
    
    # Create DataFrame
    data = pd.DataFrame(combined_data)
    
    # Add some additional features
    data['day_of_week'] = data['timestamp'].dt.dayofweek
    data['hour_of_day'] = data['timestamp'].dt.hour
    
    # Shuffle the data
    data = data.sample(frac=1, random_state=random_state).reset_index(drop=True)
    
    logger.info(f"Generated data with {data.shape[0]} rows and {data.shape[1]} columns")
    
    # Save to file if output path is provided
    if output_path:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        if output_path.suffix.lower() == '.csv':
            data.to_csv(output_path, index=False)
        elif output_path.suffix.lower() in ['.xls', '.xlsx']:
            data.to_excel(output_path, index=False)
        elif output_path.suffix.lower() == '.parquet':
            data.to_parquet(output_path, index=False)
        else:
            data.to_csv(output_path.with_suffix('.csv'), index=False)
        
        logger.info(f"Saved synthetic data to {output_path}")
    
    return data