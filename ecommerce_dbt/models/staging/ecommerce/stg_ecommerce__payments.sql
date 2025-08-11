{{ 
    config(
        materialized='view',
        tags=['staging', 'daily']
    ) 
}}

with source_data as (
    select * from {{ source('ecommerce_raw', 'payments') }}
),

cleaned_data as (
    select
        payment_id,
        order_id,
        trim(payment_method) as payment_method,
        amount,
        trim(status) as payment_status,
        payment_date,
        created_at,
        last_updated_at,
        _etl_loaded_at
    from source_data
    where payment_id is not null
      and order_id is not null
)

select * from cleaned_data