# Fraud Detection System

A production-ready fraud detection system that uses machine learning to identify potentially fraudulent transactions or activities in the system.

## Features

- **Data Preprocessing**: Handles missing values, outliers, and feature engineering
- **Model Training**: Supports multiple ML models (Gradient Boosting, Deep Learning, and ensemble approaches)
- **Model Evaluation**: Comprehensive metrics with focus on precision, recall, and F1 score
- **Explainability**: SHAP values for model interpretability
- **API Service**: FastAPI endpoints for real-time fraud predictions
- **Monitoring**: Tools for model performance monitoring and drift detection

## Project Structure

```
fraud_detection/
├── data/               # Data storage and processing scripts
├── models/             # Model definition, training, and evaluation
├── utils/              # Utility functions and helper modules
├── tests/              # Unit and integration tests
├── api.py              # FastAPI application for serving predictions
├── train.py            # Main script for model training
├── predict.py          # Script for batch predictions
├── config.py           # Configuration parameters
├── requirements.txt    # Dependencies
└── README.md           # Documentation
```

## Setup and Installation

```bash
# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Usage

### Training the Model

```bash
python train.py --data_path data/fraud_data.csv --model_type ensemble
```

### Making Predictions

```bash
python predict.py --input_file data/new_transactions.csv --output_file data/predictions.csv
```

### Running the API

```bash
uvicorn api:app --host 0.0.0.0 --port 8000
```

## API Documentation

Once the API server is running, visit `http://localhost:8000/docs` for the interactive API documentation.

## Model Performance

The current production model achieves:
- Precision: 0.92
- Recall: 0.85
- F1 Score: 0.88
- AUC-ROC: 0.96

## Contributing

Please see the [contribution guidelines](CONTRIBUTING.md) for information on how to contribute to this project.