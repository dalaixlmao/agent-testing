{{ 
    config(
        materialized='view',
        tags=['staging', 'daily']
    ) 
}}

with source_data as (
    select * from {{ source('ecommerce_raw', 'categories') }}
),

cleaned_data as (
    select
        category_id,
        parent_category_id,
        trim(category_name) as category_name,
        trim(category_description) as category_description,
        case 
            when trim(coalesce(is_active, 'true')) = 'false' then false 
            else true 
        end as is_active,
        created_at,
        last_updated_at,
        _etl_loaded_at
    from source_data
    where category_id is not null
)

select * from cleaned_data