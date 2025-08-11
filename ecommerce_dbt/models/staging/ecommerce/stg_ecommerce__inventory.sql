{{ 
    config(
        materialized='view',
        tags=['staging', 'daily']
    ) 
}}

with source_data as (
    select * from {{ source('ecommerce_raw', 'inventory') }}
),

cleaned_data as (
    select
        inventory_id,
        product_id,
        warehouse_id,
        quantity_on_hand,
        quantity_reserved,
        quantity_available,
        reorder_point,
        reorder_quantity,
        created_at,
        last_updated_at,
        _etl_loaded_at
    from source_data
    where inventory_id is not null
      and product_id is not null
)

select * from cleaned_data