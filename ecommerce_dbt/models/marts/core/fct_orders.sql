{{
    config(
        materialized='table',
        tags=['core', 'daily'],
        unique_key='order_key',
        partition_by={
            "field": "order_date",
            "data_type": "date",
            "granularity": "month"
        },
        cluster_by=["customer_key"]
    )
}}

with orders as (
    select * from {{ ref('stg_ecommerce__orders') }}
),

order_items_products as (
    select * from {{ ref('int_order_items_products') }}
),

order_payments as (
    select * from {{ ref('int_order_payments') }}
),

dim_customers as (
    select
        customer_key,
        customer_id
    from {{ ref('dim_customers') }}
),

dim_products as (
    select
        product_key,
        product_id
    from {{ ref('dim_products') }}
),

-- Get order items aggregated at the order level
order_items_agg as (
    select
        order_id,
        sum(quantity) as total_items,
        sum(extended_price) as total_extended_price,
        sum(discount_amount) as total_discount_amount,
        sum(net_price) as total_net_price,
        sum(gross_margin_amount) as total_gross_margin_amount,
        avg(gross_margin_percentage) as avg_gross_margin_percentage,
        count(distinct product_id) as distinct_product_count,
        array_agg(distinct category_name) as product_categories
    from order_items_products
    group by 1
),

final as (
    select
        -- Keys
        {{ dbt_utils.generate_surrogate_key(['o.order_id']) }} as order_key,
        o.order_id,
        dc.customer_key,
        o.customer_id,
        
        -- Dates
        o.order_date,
        {{ dbt_utils.generate_surrogate_key(['o.order_date']) }} as order_date_key,
        
        -- Order attributes
        o.order_status,
        o.shipping_method,
        o.shipping_cost,
        o.tax_amount,
        o.order_total,
        o.promo_code,
        o.discount_amount,
        o.source_channel,
        
        -- Order items metrics
        coalesce(oia.total_items, 0) as total_items,
        coalesce(oia.distinct_product_count, 0) as distinct_product_count,
        coalesce(oia.total_extended_price, 0) as total_product_price,
        coalesce(oia.total_discount_amount, 0) as total_product_discount,
        coalesce(oia.total_net_price, 0) as total_product_net_price,
        coalesce(oia.total_gross_margin_amount, 0) as total_gross_margin_amount,
        coalesce(oia.avg_gross_margin_percentage, 0) as avg_gross_margin_percentage,
        oia.product_categories,
        
        -- Payment metrics
        op.payment_methods,
        coalesce(op.total_payment_amount, 0) as total_payment_amount,
        coalesce(op.successful_payment_amount, 0) as successful_payment_amount,
        op.payment_count,
        op.last_payment_date,
        
        -- Payment status
        case
            when o.order_total = coalesce(op.successful_payment_amount, 0) then 'Fully Paid'
            when coalesce(op.successful_payment_amount, 0) > 0 and coalesce(op.successful_payment_amount, 0) < o.order_total then 'Partially Paid'
            else 'Not Paid'
        end as payment_status,
        
        -- Shipping address
        o.shipping_address_line1,
        o.shipping_address_line2,
        o.shipping_city,
        o.shipping_state,
        o.shipping_postal_code,
        o.shipping_country,
        
        -- Audit columns
        o.created_at,
        o.last_updated_at,
        current_timestamp() as dbt_updated_at,
        '{{ invocation_id }}' as dbt_updated_by,
        '{{ this }}' as dbt_source_model
        
    from orders o
    left join dim_customers dc on o.customer_id = dc.customer_id
    left join order_items_agg oia on o.order_id = oia.order_id
    left join order_payments op on o.order_id = op.order_id
)

select * from final