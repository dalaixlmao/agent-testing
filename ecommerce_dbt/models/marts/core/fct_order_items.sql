{{
    config(
        materialized='table',
        tags=['core', 'daily'],
        unique_key='order_item_key',
        partition_by={
            "field": "order_date", 
            "data_type": "date",
            "granularity": "month"
        },
        cluster_by=["order_key", "product_key"]
    )
}}

with order_items_products as (
    select * from {{ ref('int_order_items_products') }}
),

orders as (
    select * from {{ ref('stg_ecommerce__orders') }}
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

final as (
    select
        -- Keys
        {{ dbt_utils.generate_surrogate_key(['oip.order_item_id']) }} as order_item_key,
        {{ dbt_utils.generate_surrogate_key(['oip.order_id']) }} as order_key,
        {{ dbt_utils.generate_surrogate_key(['oip.product_id']) }} as product_key,
        {{ dbt_utils.generate_surrogate_key(['o.customer_id']) }} as customer_key,
        
        -- Natural keys
        oip.order_item_id,
        oip.order_id,
        oip.product_id,
        o.customer_id,
        
        -- Dates
        o.order_date,
        {{ dbt_utils.generate_surrogate_key(['o.order_date']) }} as order_date_key,
        
        -- Order attributes
        o.order_status,
        o.source_channel,
        
        -- Product attributes
        oip.product_name,
        oip.category_id,
        oip.category_name,
        oip.sku,
        
        -- Order item metrics
        oip.quantity,
        oip.unit_price,
        oip.extended_price,
        oip.discount_amount,
        oip.net_price,
        oip.gross_margin_amount,
        oip.gross_margin_percentage,
        
        -- Audit columns
        current_timestamp() as dbt_updated_at,
        '{{ invocation_id }}' as dbt_updated_by,
        '{{ this }}' as dbt_source_model
        
    from order_items_products oip
    join orders o on oip.order_id = o.order_id
)

select * from final