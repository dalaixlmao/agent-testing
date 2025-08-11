{{
    config(
        materialized='table',
        tags=['core', 'daily'],
        unique_key='customer_key'
    )
}}

with customers as (
    select * from {{ ref('stg_ecommerce__customers') }}
),

customer_orders_summary as (
    select * from {{ ref('int_customer_orders_summary') }}
),

customer_with_metrics as (
    select
        -- Surrogate key
        {{ dbt_utils.generate_surrogate_key(['c.customer_id']) }} as customer_key,
        
        -- Natural key
        c.customer_id,
        
        -- Customer attributes
        c.first_name,
        c.last_name,
        c.first_name || ' ' || c.last_name as full_name,
        c.email,
        c.is_valid_email,
        c.phone_number,
        c.customer_created_date,
        c.customer_created_at,
        c.address_line1,
        c.address_line2,
        c.city,
        c.state,
        c.postal_code,
        c.country,
        c.is_active,
        c.last_login_at,
        
        -- Customer segmentation
        case
            when cos.lifetime_order_count is null then 'New Customer'
            when cos.lifetime_order_count = 1 then 'One-time Customer'
            when cos.lifetime_order_count between 2 and 4 then 'Repeat Customer'
            when cos.lifetime_order_count >= 5 then 'Loyal Customer'
            else 'Unknown'
        end as customer_segment,
        
        -- Order metrics
        coalesce(cos.lifetime_order_count, 0) as lifetime_order_count,
        coalesce(cos.lifetime_order_value, 0) as lifetime_order_value,
        cos.first_order_date,
        cos.most_recent_order_date,
        coalesce(cos.average_order_value, 0) as average_order_value,
        
        -- Recency metrics
        date_diff('day', coalesce(cos.most_recent_order_date, c.customer_created_date), current_date()) as days_since_last_order,
        
        -- Audit columns
        current_timestamp() as dbt_updated_at,
        '{{ invocation_id }}' as dbt_updated_by,
        '{{ this }}' as dbt_source_model
        
    from customers c
    left join customer_orders_summary cos on c.customer_id = cos.customer_id
)

select * from customer_with_metrics