{{
    config(
        materialized='ephemeral',
        tags=['intermediate']
    )
}}

with order_items as (
    select * from {{ ref('stg_ecommerce__order_items') }}
),

products as (
    select * from {{ ref('stg_ecommerce__products') }}
),

categories as (
    select * from {{ ref('stg_ecommerce__categories') }}
),

order_items_with_product_details as (
    select
        oi.order_item_id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.unit_price,
        oi.extended_price,
        oi.discount_amount,
        oi.net_price,
        p.product_name,
        p.sku,
        p.category_id,
        c.category_name,
        (oi.unit_price - p.cost) * oi.quantity as gross_margin_amount,
        case 
            when oi.unit_price = 0 then 0
            else ((oi.unit_price - p.cost) / oi.unit_price) * 100 
        end as gross_margin_percentage
    from order_items oi
    left join products p on oi.product_id = p.product_id
    left join categories c on p.category_id = c.category_id
)

select * from order_items_with_product_details