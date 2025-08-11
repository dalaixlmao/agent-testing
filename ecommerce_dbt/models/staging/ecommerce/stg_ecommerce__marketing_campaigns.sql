{{ 
    config(
        materialized='view',
        tags=['staging', 'marketing']
    ) 
}}

with source_data as (
    select * from {{ source('ecommerce_raw', 'marketing_campaigns') }}
),

cleaned_data as (
    select
        campaign_id,
        trim(campaign_name) as campaign_name,
        trim(campaign_type) as campaign_type,
        start_date,
        end_date,
        budget,
        trim(campaign_manager) as campaign_manager,
        trim(campaign_objective) as campaign_objective,
        case 
            when trim(coalesce(is_active, 'true')) = 'false' then false 
            else true 
        end as is_active,
        created_at,
        last_updated_at,
        _etl_loaded_at
    from source_data
    where campaign_id is not null
)

select * from cleaned_data