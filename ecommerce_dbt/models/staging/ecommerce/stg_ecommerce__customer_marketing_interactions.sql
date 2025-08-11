{{ 
    config(
        materialized='view',
        tags=['staging', 'marketing']
    ) 
}}

with source_data as (
    select * from {{ source('ecommerce_raw', 'customer_marketing_interactions') }}
),

cleaned_data as (
    select
        interaction_id,
        customer_id,
        campaign_id,
        trim(interaction_type) as interaction_type,
        interaction_date,
        interaction_value,
        created_at,
        last_updated_at,
        _etl_loaded_at
    from source_data
    where interaction_id is not null
      and customer_id is not null
      and campaign_id is not null
)

select * from cleaned_data