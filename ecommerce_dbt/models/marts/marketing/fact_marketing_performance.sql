{{
    config(
        materialized='table',
        tags=['marketing', 'daily'],
        unique_key='marketing_performance_key',
        partition_by={
            "field": "date_day", 
            "data_type": "date",
            "granularity": "month"
        },
        cluster_by=["campaign_id"]
    )
}}

with campaigns as (
    select * from {{ ref('stg_ecommerce__marketing_campaigns') }}
),

interactions as (
    select * from {{ ref('stg_ecommerce__customer_marketing_interactions') }}
),

orders as (
    select * from {{ ref('stg_ecommerce__orders') }}
),

-- Create date spine to ensure we have all dates
date_spine as (
    select date_day
    from {{ ref('dim_dates') }}
    where date_day between 
        (select min(start_date) from campaigns) and 
        greatest((select max(end_date) from campaigns), current_date())
),

-- Get campaign dates
campaign_dates as (
    select
        c.campaign_id,
        c.campaign_name,
        c.campaign_type,
        c.campaign_objective,
        c.budget,
        ds.date_day
    from campaigns c
    cross join date_spine ds
    where ds.date_day between c.start_date and coalesce(c.end_date, current_date())
),

-- Get daily interactions
daily_interactions as (
    select
        campaign_id,
        date(interaction_date) as date_day,
        interaction_type,
        count(*) as interaction_count,
        sum(interaction_value) as interaction_value_total
    from interactions
    group by 1, 2, 3
),

-- Get orders attributed to campaigns via source_channel
campaign_orders as (
    select
        date(o.order_date) as date_day,
        c.campaign_id,
        count(distinct o.order_id) as attributed_orders,
        sum(o.order_total) as attributed_revenue
    from orders o
    join campaigns c on o.source_channel = c.campaign_name
    where o.order_status not in ('cancelled', 'returned')
    group by 1, 2
),

-- Final aggregation
final as (
    select
        {{ dbt_utils.generate_surrogate_key(['cd.campaign_id', 'cd.date_day']) }} as marketing_performance_key,
        cd.campaign_id,
        cd.campaign_name,
        cd.campaign_type,
        cd.campaign_objective,
        cd.budget,
        cd.date_day,
        {{ dbt_utils.generate_surrogate_key(['cd.date_day']) }} as date_key,
        
        -- Interaction metrics
        coalesce(sum(case when di.interaction_type = 'email_open' then di.interaction_count else 0 end), 0) as email_opens,
        coalesce(sum(case when di.interaction_type = 'email_click' then di.interaction_count else 0 end), 0) as email_clicks,
        coalesce(sum(case when di.interaction_type = 'website_visit' then di.interaction_count else 0 end), 0) as website_visits,
        coalesce(sum(case when di.interaction_type = 'add_to_cart' then di.interaction_count else 0 end), 0) as add_to_carts,
        coalesce(sum(case when di.interaction_type = 'product_view' then di.interaction_count else 0 end), 0) as product_views,
        coalesce(sum(case when di.interaction_type = 'social_engagement' then di.interaction_count else 0 end), 0) as social_engagements,
        
        -- Order metrics
        coalesce(co.attributed_orders, 0) as attributed_orders,
        coalesce(co.attributed_revenue, 0) as attributed_revenue,
        
        -- ROI metrics
        case
            when cd.budget > 0 then (coalesce(co.attributed_revenue, 0) / cd.budget)
            else 0
        end as roi,
        
        -- Daily budget allocation (assuming even distribution)
        cd.budget / 
            (datediff('day', 
                (select min(date_day) from campaign_dates where campaign_id = cd.campaign_id), 
                (select max(date_day) from campaign_dates where campaign_id = cd.campaign_id)
            ) + 1) as daily_budget,
        
        -- Audit columns
        current_timestamp() as dbt_updated_at,
        '{{ invocation_id }}' as dbt_updated_by,
        '{{ this }}' as dbt_source_model
        
    from campaign_dates cd
    left join daily_interactions di on cd.campaign_id = di.campaign_id and cd.date_day = di.date_day
    left join campaign_orders co on cd.campaign_id = co.campaign_id and cd.date_day = co.date_day
    group by 1, 2, 3, 4, 5, 6, 7, 8, co.attributed_orders, co.attributed_revenue
)

select * from final