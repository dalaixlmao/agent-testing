{{
    config(
        materialized='table',
        tags=['core'],
        unique_key='date_key'
    )
}}

{%- set start_date = "to_date('2020-01-01')" -%}
{%- set end_date = "dateadd(year, 5, current_date())" -%}

with date_spine as (
    {{ dbt_utils.date_spine(
        datepart="day",
        start_date=start_date,
        end_date=end_date
    )
    }}
),

expanded_dates as (
    select
        cast(date_day as date) as date_day,
        extract(year from date_day) as year,
        extract(month from date_day) as month,
        extract(day from date_day) as day_of_month,
        extract(dayofweek from date_day) as day_of_week,
        extract(quarter from date_day) as quarter,
        extract(dayofyear from date_day) as day_of_year,
        extract(week from date_day) as week_of_year,
        
        case 
            when extract(month from date_day) = 1 then 'January'
            when extract(month from date_day) = 2 then 'February'
            when extract(month from date_day) = 3 then 'March'
            when extract(month from date_day) = 4 then 'April'
            when extract(month from date_day) = 5 then 'May'
            when extract(month from date_day) = 6 then 'June'
            when extract(month from date_day) = 7 then 'July'
            when extract(month from date_day) = 8 then 'August'
            when extract(month from date_day) = 9 then 'September'
            when extract(month from date_day) = 10 then 'October'
            when extract(month from date_day) = 11 then 'November'
            when extract(month from date_day) = 12 then 'December'
        end as month_name,
        
        case 
            when extract(dayofweek from date_day) = 0 then 'Sunday'
            when extract(dayofweek from date_day) = 1 then 'Monday'
            when extract(dayofweek from date_day) = 2 then 'Tuesday'
            when extract(dayofweek from date_day) = 3 then 'Wednesday'
            when extract(dayofweek from date_day) = 4 then 'Thursday'
            when extract(dayofweek from date_day) = 5 then 'Friday'
            when extract(dayofweek from date_day) = 6 then 'Saturday'
        end as day_name,
        
        case 
            when extract(dayofweek from date_day) in (0, 6) then true 
            else false 
        end as is_weekend,
        
        to_varchar(date_day, 'YYYY-MM') as year_month,
        to_varchar(extract(year from date_day)) || 'Q' || to_varchar(extract(quarter from date_day)) as year_quarter,
        
        date_day = current_date() as is_current_day,
        extract(year from date_day) = extract(year from current_date()) as is_current_year,
        extract(month from date_day) = extract(month from current_date()) and
        extract(year from date_day) = extract(year from current_date()) as is_current_month
    from date_spine
)

select
    {{ dbt_utils.generate_surrogate_key(['date_day']) }} as date_key,
    *
from expanded_dates
order by date_day