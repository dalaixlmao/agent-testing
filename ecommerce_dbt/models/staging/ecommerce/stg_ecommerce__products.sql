{{ 
    config(
        materialized='view',
        tags=['staging', 'daily']
    ) 
}}

with source_data as (
    select * from {{ source('ecommerce_raw', 'products') }}
),

cleaned_data as (
    select
        product_id,
        trim(product_name) as product_name,
        trim(product_description) as product_description,
        category_id,
        price,
        cost,
        case 
            when trim(coalesce(is_active, 'true')) = 'false' then false 
            else true 
        end as is_active,
        trim(coalesce(sku, '')) as sku,
        weight,
        weight_unit,
        created_at,
        last_updated_at,
        _etl_loaded_at
    from source_data
    where product_id is not null
)

select * from cleaned_data