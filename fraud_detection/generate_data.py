#!/usr/bin/env python
"""
Script to generate synthetic data for fraud detection
"""

import argparse
import logging
from pathlib import Path

from utils.logging_config import setup_logging
from utils.data_processing import generate_synthetic_fraud_data
import config

def parse_arguments():
    """
    Parse command line arguments
    
    Returns:
        Parsed arguments
    """
    parser = argparse.ArgumentParser(description="Generate synthetic fraud data")
    
    parser.add_argument(
        "--n_samples",
        type=int,
        default=10000,
        help="Number of samples to generate"
    )
    
    parser.add_argument(
        "--fraud_ratio",
        type=float,
        default=0.05,
        help="Ratio of fraudulent transactions"
    )
    
    parser.add_argument(
        "--output_path",
        type=str,
        default=str(config.DATA_DIR / "synthetic_fraud_data.csv"),
        help="Path to save the generated data"
    )
    
    parser.add_argument(
        "--random_state",
        type=int,
        default=42,
        help="Random state for reproducibility"
    )
    
    return parser.parse_args()

def main():
    """Main function to generate synthetic data"""
    # Parse arguments
    args = parse_arguments()
    
    # Set up logging
    logger = setup_logging()
    logger.info("Starting synthetic data generation")
    
    # Create output directory if it doesn't exist
    output_path = Path(args.output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Generate data
    logger.info(f"Generating {args.n_samples} samples with fraud ratio {args.fraud_ratio}")
    data = generate_synthetic_fraud_data(
        n_samples=args.n_samples,
        fraud_ratio=args.fraud_ratio,
        random_state=args.random_state,
        output_path=output_path
    )
    
    logger.info(f"Generated {len(data)} samples with {data['is_fraud'].sum()} fraudulent transactions")
    logger.info(f"Data saved to {output_path}")
    
    # Print data summary
    logger.info("Data summary:")
    logger.info(f"  Shape: {data.shape}")
    logger.info(f"  Columns: {', '.join(data.columns)}")
    logger.info(f"  Fraud ratio: {data['is_fraud'].mean():.4f}")
    
    # Print example transactions
    logger.info("Example legitimate transaction:")
    logger.info(data[data['is_fraud'] == 0].iloc[0].to_dict())
    
    logger.info("Example fraudulent transaction:")
    logger.info(data[data['is_fraud'] == 1].iloc[0].to_dict())

if __name__ == "__main__":
    main()