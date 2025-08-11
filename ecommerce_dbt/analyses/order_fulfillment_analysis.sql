/*
    Analysis of order fulfillment times and their relationship to customer satisfaction
    
    This analysis explores the time between order placement and fulfillment,
    segmented by product category and geographic region, to identify
    bottlenecks in the fulfillment process.
*/

with orders as (
    select * from {{ ref('fct_orders') }}
),

customers as (
    select * from {{ ref('dim_customers') }}
),

order_items as (
    select * from {{ ref('fct_order_items') }}
),

products as (
    select * from {{ ref('dim_products') }}
),

order_dates as (
    select
        o.order_id,
        o.order_date as placement_date,
        -- Assuming we have a fulfillment date field or can derive it
        o.last_updated_at as last_status_date,
        -- Calculate fulfillment time in days
        datediff('day', o.order_date, o.last_updated_at) as fulfillment_days,
        -- Define fulfillment speed categories
        case
            when datediff('day', o.order_date, o.last_updated_at) <= 1 then 'Same/Next Day'
            when datediff('day', o.order_date, o.last_updated_at) between 2 and 3 then '2-3 Days'
            when datediff('day', o.order_date, o.last_updated_at) between 4 and 7 then '4-7 Days'
            else 'Over 7 Days'
        end as fulfillment_speed,
        o.order_status,
        o.customer_key
    from orders o
    where o.order_status in ('shipped', 'delivered', 'completed')
),

-- Group by customer region and product category
fulfillment_by_region_category as (
    select
        c.state,
        c.country,
        p.category_name,
        avg(od.fulfillment_days) as avg_fulfillment_days,
        median(od.fulfillment_days) as median_fulfillment_days,
        count(*) as order_count,
        sum(case when od.fulfillment_days <= 2 then 1 else 0 end) as fast_fulfillment_count,
        sum(case when od.fulfillment_days > 7 then 1 else 0 end) as slow_fulfillment_count
    from order_dates od
    join customers c on od.customer_key = c.customer_key
    join order_items oi on od.order_id = oi.order_id
    join products p on oi.product_key = p.product_key
    group by 1, 2, 3
),

-- Overall fulfillment metrics
fulfillment_summary as (
    select
        count(*) as total_orders,
        avg(fulfillment_days) as avg_fulfillment_days,
        median(fulfillment_days) as median_fulfillment_days,
        percentile_cont(0.90) within group (order by fulfillment_days) as p90_fulfillment_days,
        min(fulfillment_days) as min_fulfillment_days,
        max(fulfillment_days) as max_fulfillment_days,
        stddev(fulfillment_days) as stddev_fulfillment_days,
        sum(case when fulfillment_days <= 2 then 1 else 0 end) / count(*) as pct_fast_fulfillment,
        sum(case when fulfillment_days > 7 then 1 else 0 end) / count(*) as pct_slow_fulfillment
    from order_dates
)

-- Main analysis output
select
    'Overall Fulfillment Metrics' as analysis_section,
    fs.total_orders,
    fs.avg_fulfillment_days,
    fs.median_fulfillment_days,
    fs.p90_fulfillment_days,
    fs.pct_fast_fulfillment,
    fs.pct_slow_fulfillment
from fulfillment_summary fs

union all

select
    'Regional Category Fulfillment' as analysis_section,
    frc.order_count as total_orders,
    frc.avg_fulfillment_days,
    frc.median_fulfillment_days,
    null as p90_fulfillment_days,
    frc.fast_fulfillment_count / frc.order_count as pct_fast_fulfillment,
    frc.slow_fulfillment_count / frc.order_count as pct_slow_fulfillment
from fulfillment_by_region_category frc
order by analysis_section, avg_fulfillment_days desc