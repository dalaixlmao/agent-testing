{% macro detect_nulls(model, columns) %}

{%- set null_checks_query %}
select 
    {% for column in columns %}
    sum(case when {{ column }} is null then 1 else 0 end) as {{ column }}_nulls{% if not loop.last %},{% endif %}
    {% endfor %}
from {{ model }}
{% endset -%}

{% do return(run_query(null_checks_query)) %}

{% endmacro %}