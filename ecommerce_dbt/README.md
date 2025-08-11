# E-Commerce dbt Project

This dbt project implements a production-ready data modeling framework for an e-commerce company, focusing on data quality, performance, and scalability.

## Project Structure

The project follows a standard dimensional modeling approach with the following components:

- **Staging models**: Basic cleaning and standardization of source data
- **Intermediate models**: Business logic and aggregations shared across multiple marts
- **Mart models**:
  - Core: Key dimensional and fact tables (customers, products, orders)
  - Marketing: Marketing campaign performance data
  - Finance: Financial reporting and analysis models

## Getting Started

### Prerequisites

- dbt installed (v1.6.0 or higher)
- Access to a Snowflake data warehouse
- Python 3.8+

### Installation

1. Clone this repository
2. Set up your dbt profile in `~/.dbt/profiles.yml` or use the provided profiles
3. Install dependencies: `dbt deps`
4. Run the project: `dbt build`

## Data Flow

1. Raw data is loaded into the `ecommerce_raw` schema in Snowflake
2. Staging models clean and standardize the raw data
3. Intermediate models perform calculations and transformations
4. Mart models structure the data into dimensional models for analytics

## Testing & Data Quality

Comprehensive testing is implemented throughout the project:

- Source freshness checks
- Schema tests (not null, unique, referential integrity)
- Custom data quality tests
- Data value range validations
- Cross-model consistency tests

## CI/CD Integration

The project includes GitHub Actions workflows for:

- Continuous integration testing
- SQL linting
- PR validation checks
- Production deployment

## Contributing

1. Create a feature branch from `development`
2. Make your changes
3. Run tests: `dbt test`
4. Submit a pull request to `development`

## Project Status

This project is actively maintained.

## License

Internal use only.