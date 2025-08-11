{% macro get_data_quality_metrics(model, columns=none) %}

{%- if not columns -%}
    {% set columns_query %}
        select column_name
        from information_schema.columns
        where table_name = '{{ model.name }}'
        and table_schema = '{{ model.schema }}'
    {% endset %}
    
    {% set columns_results = run_query(columns_query) %}
    
    {% if execute %}
        {% set columns = columns_results.columns['column_name'].values() %}
    {% else %}
        {% set columns = [] %}
    {% endif %}
{%- endif -%}

{%- set metrics_query %}
select 
    '{{ model }}' as model_name,
    count(*) as row_count,
    {% for column in columns %}
    sum(case when {{ column }} is null then 1 else 0 end) as {{ column }}_null_count,
    round((sum(case when {{ column }} is null then 1 else 0 end) / count(*) * 100), 2) as {{ column }}_null_percent{% if not loop.last %},{% endif %}
    {% endfor %}
from {{ model }}
{% endset -%}

{% do return(run_query(metrics_query)) %}

{% endmacro %}