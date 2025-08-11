# E-Commerce Dimensional Modeling Guide

## Introduction

This document outlines the dimensional modeling approach implemented in the e-commerce dbt project. The design follows established best practices to create a reliable, performant, and easy-to-understand data model for business intelligence and reporting needs.

## Dimensional Modeling Overview

Dimensional modeling is a database design technique optimized for data warehouses and business intelligence systems. It uses:

- **Dimension Tables**: Contain descriptive attributes about business entities
- **Fact Tables**: Contain business metrics and foreign keys to dimensions
- **Star Schema**: A fact table in the center connected to dimension tables

## Core Dimension Tables

### 1. Customer Dimension (`dim_customers`)

The customer dimension consolidates all customer attributes and derived metrics into a single view.

**Key attributes**:
- Customer biographical information
- Contact details
- Geographic data
- Customer segments
- Lifetime value metrics

**Example fields**:
```
customer_key (PK)
customer_id (natural key)
first_name
last_name
email
customer_created_date
city, state, country
customer_segment
lifetime_order_count
lifetime_order_value
days_since_last_order
```

### 2. Product Dimension (`dim_products`)

The product dimension combines product attributes with category information and inventory status.

**Key attributes**:
- Product details
- Pricing information
- Category hierarchy
- Inventory metrics
- Margin calculations

**Example fields**:
```
product_key (PK)
product_id (natural key)
product_name
product_description
category_id, category_name
parent_category_id, parent_category_name
price, cost
margin, margin_percentage
total_quantity_available
stock_status
```

### 3. Date Dimension (`dim_dates`)

The date dimension provides various date attributes for time-based analysis.

**Key attributes**:
- Calendar hierarchies
- Fiscal periods
- Weekday/weekend flags
- Holiday indicators

**Example fields**:
```
date_key (PK)
date_day
year, quarter, month, day_of_month
month_name, day_name
is_weekend
year_month, year_quarter
is_current_day, is_current_month
```

## Core Fact Tables

### 1. Orders Fact (`fct_orders`)

The orders fact table contains order-level metrics and transactions.

**Key attributes**:
- Order headers
- Order totals
- Payment information
- Shipping details
- Marketing attribution

**Example fields**:
```
order_key (PK)
order_id (natural key)
customer_key (FK)
order_date, order_date_key (FK)
order_status
total_items
order_total, shipping_cost, tax_amount
discount_amount
payment_status
source_channel
```

### 2. Order Items Fact (`fct_order_items`)

The order items fact table contains line-item level detail for each order.

**Key attributes**:
- Product quantities
- Item prices
- Discounts
- Margins

**Example fields**:
```
order_item_key (PK)
order_key (FK)
product_key (FK)
customer_key (FK)
order_date, order_date_key (FK)
quantity
unit_price
extended_price
discount_amount
net_price
gross_margin_amount
gross_margin_percentage
```

## Additional Fact Tables

### 1. Marketing Performance (`fact_marketing_performance`)

Tracks daily marketing campaign performance metrics.

**Key fields**:
```
marketing_performance_key (PK)
campaign_id
date_day, date_key (FK)
email_opens, email_clicks
website_visits, product_views
attributed_orders, attributed_revenue
roi
```

### 2. Financial Orders (`fact_financial_orders`)

Financial perspective on orders with accounting categorizations.

**Key fields**:
```
financial_order_key (PK)
order_id (natural key)
order_date, order_date_key (FK)
order_year, order_quarter, order_month
financial_status
gross_order_value
tax_amount, shipping_cost
total_discounts
total_gross_margin_amount
payment_status
```

## Modeling Principles Applied

### 1. Surrogate Keys

All dimension and fact tables use generated surrogate keys:

```sql
{{ dbt_utils.generate_surrogate_key(['customer_id']) }} as customer_key
```

Benefits:
- Insulates the warehouse from source system changes
- Enables integration of multiple source systems
- Supports type-2 slowly changing dimensions

### 2. Conformed Dimensions

Dimensions like customers and products are conformed across fact tables, ensuring consistent attributes regardless of which fact table is used.

### 3. Denormalized Dimensions

Dimensions incorporate related attributes from multiple source tables:
- `dim_products` includes category information
- `dim_customers` includes geographic details

### 4. Fact Table Granularity

Each fact table has a clearly defined granularity:
- `fct_orders`: One row per order
- `fct_order_items`: One row per order line item
- `fact_marketing_performance`: One row per campaign per day

### 5. Performance Optimizations

Fact tables implement appropriate physical optimizations:

```yaml
config(
    materialized='table',
    partition_by={
        "field": "order_date", 
        "data_type": "date",
        "granularity": "month"
    },
    cluster_by=["customer_key"]
)
```

## Implementation Pattern Examples

### Dimension Table Pattern

```sql
select
    {{ dbt_utils.generate_surrogate_key(['c.customer_id']) }} as customer_key,
    c.customer_id,
    -- Customer attributes
    c.first_name,
    c.last_name,
    -- Derived fields
    c.first_name || ' ' || c.last_name as full_name,
    -- Related metrics
    coalesce(cos.lifetime_order_count, 0) as lifetime_order_count,
    -- Segmentation logic
    case
        when cos.lifetime_order_count is null then 'New Customer'
        when cos.lifetime_order_count = 1 then 'One-time Customer'
        when cos.lifetime_order_count between 2 and 4 then 'Repeat Customer'
        else 'Loyal Customer'
    end as customer_segment
from customers c
left join customer_orders_summary cos on c.customer_id = cos.customer_id
```

### Fact Table Pattern

```sql
select
    {{ dbt_utils.generate_surrogate_key(['o.order_id']) }} as order_key,
    o.order_id,
    dc.customer_key,
    {{ dbt_utils.generate_surrogate_key(['o.order_date']) }} as order_date_key,
    -- Fact measures
    o.order_total,
    o.tax_amount,
    o.shipping_cost,
    -- Derived measures
    coalesce(oia.total_items, 0) as total_items,
    coalesce(oia.total_gross_margin_amount, 0) as total_gross_margin_amount
from orders o
left join dim_customers dc on o.customer_id = dc.customer_id
left join order_items_agg oia on o.order_id = oia.order_id
```

## Data Model Diagram

The dimensional model follows a classic star schema pattern with shared dimensions across multiple fact tables:

```
dim_customers <---- fct_orders ----> dim_products
                      |
                      |
                      v
                fct_order_items
                      |
                      |
                      v
         fact_marketing_performance
                      |
                      v
            fact_financial_orders
                      |
                      v
                  dim_dates
```

## Business Benefits of This Approach

1. **Simplified queries**: Star schema makes it easy to write analytics queries
2. **Consistent metrics**: Single source of truth for business metrics
3. **Performance**: Optimized for analytical queries
4. **Flexibility**: New fact tables can be added without disrupting existing models
5. **Maintainability**: Clear separation of dimensions and facts makes the model easier to maintain
6. **Scalability**: Model can grow with the business by adding new dimensions and facts