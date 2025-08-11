{{ 
    config(
        materialized='view',
        tags=['staging', 'daily']
    ) 
}}

with source_data as (
    select * from {{ source('ecommerce_raw', 'orders') }}
),

cleaned_data as (
    select
        order_id,
        customer_id,
        order_date,
        order_status,
        trim(shipping_address_line1) as shipping_address_line1,
        trim(coalesce(shipping_address_line2, '')) as shipping_address_line2,
        trim(shipping_city) as shipping_city,
        trim(shipping_state) as shipping_state,
        trim(shipping_postal_code) as shipping_postal_code,
        trim(shipping_country) as shipping_country,
        trim(coalesce(shipping_method, 'standard')) as shipping_method,
        shipping_cost,
        order_total,
        tax_amount,
        case 
            when trim(coalesce(promo_code, '')) = '' then null 
            else trim(promo_code) 
        end as promo_code,
        discount_amount,
        source_channel,
        created_at,
        last_updated_at,
        _etl_loaded_at
    from source_data
    where order_id is not null
)

select * from cleaned_data