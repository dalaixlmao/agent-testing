{{
    config(
        materialized='table',
        tags=['finance', 'daily'],
        unique_key='financial_order_key',
        partition_by={
            "field": "order_date", 
            "data_type": "date",
            "granularity": "month"
        }
    )
}}

with orders as (
    select * from {{ ref('stg_ecommerce__orders') }}
),

order_items as (
    select * from {{ ref('int_order_items_products') }}
),

payments as (
    select * from {{ ref('stg_ecommerce__payments') }}
),

order_items_agg as (
    select
        order_id,
        sum(quantity) as total_items,
        sum(extended_price) as total_product_price,
        sum(discount_amount) as total_product_discount,
        sum(net_price) as total_net_price,
        sum(gross_margin_amount) as total_gross_margin_amount
    from order_items
    group by 1
),

payments_agg as (
    select
        order_id,
        sum(amount) as total_payment_amount,
        sum(case when payment_status = 'successful' then amount else 0 end) as successful_payment_amount,
        sum(case when payment_status = 'refunded' then amount else 0 end) as refunded_amount,
        count(*) as payment_count,
        array_agg(distinct payment_method) as payment_methods
    from payments
    group by 1
),

final as (
    select
        {{ dbt_utils.generate_surrogate_key(['o.order_id']) }} as financial_order_key,
        o.order_id,
        o.customer_id,
        o.order_date,
        {{ dbt_utils.generate_surrogate_key(['o.order_date']) }} as order_date_key,
        
        -- Extract month and year for financial reporting
        date_trunc('month', o.order_date) as order_month,
        extract(year from o.order_date) as order_year,
        extract(quarter from o.order_date) as order_quarter,
        
        -- Order status and financial categorization
        o.order_status,
        case
            when o.order_status = 'completed' then 'Revenue'
            when o.order_status in ('processing', 'shipped') then 'Accounts Receivable'
            when o.order_status = 'cancelled' then 'Cancelled'
            when o.order_status = 'returned' then 'Returns'
            else 'Other'
        end as financial_status,
        
        -- Order revenue components
        o.order_total as gross_order_value,
        o.tax_amount,
        o.shipping_cost,
        o.discount_amount as order_level_discount,
        coalesce(oia.total_product_discount, 0) as product_level_discount,
        (o.discount_amount + coalesce(oia.total_product_discount, 0)) as total_discounts,
        
        -- Product metrics
        coalesce(oia.total_items, 0) as total_items,
        coalesce(oia.total_product_price, 0) as total_product_price,
        coalesce(oia.total_net_price, 0) as total_product_net_price,
        coalesce(oia.total_gross_margin_amount, 0) as total_gross_margin_amount,
        
        -- Payment metrics
        pa.payment_methods,
        coalesce(pa.total_payment_amount, 0) as total_payment_amount,
        coalesce(pa.successful_payment_amount, 0) as successful_payment_amount,
        coalesce(pa.refunded_amount, 0) as refunded_amount,
        (o.order_total - coalesce(pa.successful_payment_amount, 0)) as outstanding_amount,
        
        -- Payment status 
        case
            when o.order_status = 'cancelled' then 'Cancelled'
            when o.order_status = 'returned' then 'Returned'
            when o.order_total = coalesce(pa.successful_payment_amount, 0) then 'Fully Paid'
            when coalesce(pa.successful_payment_amount, 0) > 0 and 
                 coalesce(pa.successful_payment_amount, 0) < o.order_total then 'Partially Paid'
            else 'Not Paid'
        end as payment_status,
        
        -- Channel information
        o.source_channel,
        case
            when o.source_channel like '%email%' then 'Email'
            when o.source_channel like '%social%' then 'Social Media'
            when o.source_channel like '%search%' then 'Search'
            when o.source_channel like '%referral%' then 'Referral'
            when o.source_channel like '%direct%' then 'Direct'
            else 'Other'
        end as marketing_channel,
        
        -- Promo code usage
        o.promo_code is not null as used_promo_code,
        o.promo_code,
        
        -- Audit columns
        current_timestamp() as dbt_updated_at,
        '{{ invocation_id }}' as dbt_updated_by,
        '{{ this }}' as dbt_source_model
        
    from orders o
    left join order_items_agg oia on o.order_id = oia.order_id
    left join payments_agg pa on o.order_id = pa.order_id
)

select * from final