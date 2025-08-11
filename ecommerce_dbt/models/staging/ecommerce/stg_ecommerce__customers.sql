{{ 
    config(
        materialized='view',
        tags=['staging', 'daily']
    ) 
}}

with source_data as (
    select * from {{ source('ecommerce_raw', 'customers') }}
),

cleaned_data as (
    select
        customer_id,
        trim(first_name) as first_name,
        trim(last_name) as last_name,
        trim(email) as email,
        case 
            when email is null or email not like '%@%' then false 
            else true 
        end as is_valid_email,
        trim(phone_number) as phone_number,
        date(created_at) as customer_created_date,
        created_at as customer_created_at,
        trim(coalesce(address_line1, '')) as address_line1,
        trim(coalesce(address_line2, '')) as address_line2,
        trim(coalesce(city, '')) as city,
        trim(coalesce(state, '')) as state,
        trim(coalesce(postal_code, '')) as postal_code,
        trim(coalesce(country, '')) as country,
        case 
            when trim(coalesce(is_active, 'false')) = 'true' then true 
            else false 
        end as is_active,
        coalesce(last_login_at, created_at) as last_login_at,
        last_updated_at,
        _etl_loaded_at
    from source_data
    where customer_id is not null
)

select * from cleaned_data