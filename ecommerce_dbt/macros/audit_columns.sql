{% macro audit_columns() %}
    current_timestamp() as created_at,
    current_timestamp() as updated_at,
    '{{ this.identifier }}' as source_model,
    '{{ invocation_id }}' as invocation_id
{% endmacro %}