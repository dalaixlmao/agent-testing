{{ 
    config(
        materialized='view',
        tags=['staging', 'daily']
    ) 
}}

with source_data as (
    select * from {{ source('ecommerce_raw', 'order_items') }}
),

cleaned_data as (
    select
        order_item_id,
        order_id,
        product_id,
        quantity,
        unit_price,
        -- Calculate extended price (quantity * unit price)
        quantity * unit_price as extended_price,
        discount_amount,
        -- Calculate net price (extended price - discount)
        (quantity * unit_price) - coalesce(discount_amount, 0) as net_price,
        created_at,
        last_updated_at,
        _etl_loaded_at
    from source_data
    where order_item_id is not null
      and order_id is not null
      and product_id is not null
      and quantity > 0
)

select * from cleaned_data