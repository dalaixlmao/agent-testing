{{
    config(
        materialized='ephemeral',
        tags=['intermediate']
    )
}}

with payments as (
    select * from {{ ref('stg_ecommerce__payments') }}
),

aggregated_payments as (
    select
        order_id,
        sum(amount) as total_payment_amount,
        array_agg(distinct payment_method) as payment_methods,
        max(payment_date) as last_payment_date,
        count(*) as payment_count,
        sum(case when payment_status = 'successful' then amount else 0 end) as successful_payment_amount
    from payments
    group by 1
)

select * from aggregated_payments