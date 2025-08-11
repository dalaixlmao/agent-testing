-- Test that order metrics are consistent between different models
with fct_orders_metrics as (
    select
        order_id,
        total_product_price,
        total_product_discount,
        total_product_net_price
    from {{ ref('fct_orders') }}
),

financial_orders_metrics as (
    select
        order_id,
        total_product_price,
        product_level_discount as total_product_discount,
        total_product_net_price
    from {{ ref('fact_financial_orders') }}
)

select
    fo.order_id,
    fo.total_product_price as fct_orders_product_price,
    fin.total_product_price as financial_orders_product_price,
    fo.total_product_discount as fct_orders_discount,
    fin.total_product_discount as financial_orders_discount,
    fo.total_product_net_price as fct_orders_net_price,
    fin.total_product_net_price as financial_orders_net_price
from fct_orders_metrics fo
join financial_orders_metrics fin on fo.order_id = fin.order_id
where 
    fo.total_product_price != fin.total_product_price
    or fo.total_product_discount != fin.total_product_discount
    or fo.total_product_net_price != fin.total_product_net_price