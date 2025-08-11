{% snapshot orders_snapshot %}

{{
    config(
      target_schema='snapshots',
      strategy='timestamp',
      unique_key='order_id',
      updated_at='last_updated_at',
      tags=['snapshot', 'daily']
    )
}}

select * from {{ source('ecommerce_raw', 'orders') }}

{% endsnapshot %}