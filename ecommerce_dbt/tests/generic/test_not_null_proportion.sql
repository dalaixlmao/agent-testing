{% test not_null_proportion(model, column_name, at_least=0.95) %}

with validation as (
    select
        sum(case when {{ column_name }} is not null then 1 else 0 end) as not_null_count,
        count(*) as total_count
    from {{ model }}
)

select *
from validation
where (not_null_count::float / total_count) < {{ at_least }}

{% endtest %}