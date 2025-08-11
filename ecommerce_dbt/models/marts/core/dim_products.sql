{{
    config(
        materialized='table',
        tags=['core', 'daily'],
        unique_key='product_key'
    )
}}

with products as (
    select * from {{ ref('stg_ecommerce__products') }}
),

categories as (
    select * from {{ ref('stg_ecommerce__categories') }}
),

inventory as (
    select 
        product_id,
        sum(quantity_on_hand) as total_quantity_on_hand,
        sum(quantity_available) as total_quantity_available,
        sum(quantity_reserved) as total_quantity_reserved
    from {{ ref('stg_ecommerce__inventory') }}
    group by 1
),

products_with_categories as (
    select
        -- Surrogate key
        {{ dbt_utils.generate_surrogate_key(['p.product_id']) }} as product_key,
        
        -- Natural key
        p.product_id,
        
        -- Product attributes
        p.product_name,
        p.product_description,
        p.sku,
        p.price,
        p.cost,
        p.is_active,
        p.weight,
        p.weight_unit,
        p.created_at as product_created_at,
        
        -- Category attributes
        p.category_id,
        c.category_name,
        c.category_description,
        c.parent_category_id,
        pc.category_name as parent_category_name,
        
        -- Inventory data
        coalesce(i.total_quantity_on_hand, 0) as total_quantity_on_hand,
        coalesce(i.total_quantity_available, 0) as total_quantity_available,
        coalesce(i.total_quantity_reserved, 0) as total_quantity_reserved,
        
        -- Derived metrics
        p.price - p.cost as margin,
        case 
            when p.price = 0 then 0
            else ((p.price - p.cost) / p.price) * 100 
        end as margin_percentage,
        
        -- Stock status flag
        case
            when coalesce(i.total_quantity_available, 0) <= 0 then 'Out of Stock'
            when coalesce(i.total_quantity_available, 0) between 1 and 10 then 'Low Stock'
            when coalesce(i.total_quantity_available, 0) between 11 and 50 then 'Medium Stock'
            when coalesce(i.total_quantity_available, 0) > 50 then 'High Stock'
            else 'Unknown'
        end as stock_status,
        
        -- Audit columns
        current_timestamp() as dbt_updated_at,
        '{{ invocation_id }}' as dbt_updated_by,
        '{{ this }}' as dbt_source_model
        
    from products p
    left join categories c on p.category_id = c.category_id
    left join categories pc on c.parent_category_id = pc.category_id
    left join inventory i on p.product_id = i.product_id
)

select * from products_with_categories