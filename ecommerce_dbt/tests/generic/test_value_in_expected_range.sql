{% test value_in_expected_range(model, column_name, min_value=none, max_value=none, inclusive=true, at_least_pct=1.0) %}

{%- if min_value is none and max_value is none -%}
    {{ exceptions.raise_compiler_error("Either min_value or max_value must be specified for value_in_expected_range test") }}
{%- endif -%}

with validation as (
    select
        {{ column_name }} as value_to_check,
        count(*) as record_count
    from {{ model }}
    group by 1
),

outside_range as (
    select
        sum(record_count) as invalid_count,
        (select sum(record_count) from validation) as total_count
    from validation
    where
        {%- if min_value is not none and max_value is not none -%}
            {%- if inclusive -%}
                value_to_check < {{ min_value }} or value_to_check > {{ max_value }}
            {%- else -%}
                value_to_check <= {{ min_value }} or value_to_check >= {{ max_value }}
            {%- endif -%}
        {%- elif min_value is not none -%}
            {%- if inclusive -%}
                value_to_check < {{ min_value }}
            {%- else -%}
                value_to_check <= {{ min_value }}
            {%- endif -%}
        {%- elif max_value is not none -%}
            {%- if inclusive -%}
                value_to_check > {{ max_value }}
            {%- else -%}
                value_to_check >= {{ max_value }}
            {%- endif -%}
        {%- endif -%}
)

select *
from outside_range
where (invalid_count::float / total_count) > (1 - {{ at_least_pct }})

{% endtest %}