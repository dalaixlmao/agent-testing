-- Test that all customer lifetime values are non-negative
select
    customer_key,
    customer_id,
    lifetime_order_value
from {{ ref('dim_customers') }}
where lifetime_order_value < 0