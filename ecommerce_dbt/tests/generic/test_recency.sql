{% test recency(model, column_name, datepart, interval) %}

{%- set datepart = datepart | lower -%}

with recent_data as (
    select
        max({{ column_name }}) as most_recent_date
    from {{ model }}
)

select
    most_recent_date
from recent_data
where most_recent_date < dateadd({{ datepart }}, -{{ interval }}, current_date())

{% endtest %}