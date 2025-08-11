{{
    config(
        materialized='ephemeral',
        tags=['intermediate']
    )
}}

with orders as (
    select * from {{ ref('stg_ecommerce__orders') }}
),

customer_orders as (
    select
        customer_id,
        count(*) as lifetime_order_count,
        sum(order_total) as lifetime_order_value,
        min(order_date) as first_order_date,
        max(order_date) as most_recent_order_date,
        avg(order_total) as average_order_value,
        sum(case when promo_code is not null then 1 else 0 end) as orders_with_promo_count,
        sum(discount_amount) as total_discount_amount
    from orders
    where order_status not in ('cancelled', 'returned')
    group by 1
)

select * from customer_orders