-- Run this once against your Neon database before first use.
-- (Neon SQL Editor, or: psql "$DATABASE_URL" -f schema.sql)

create table if not exists settings (
  id integer primary key,
  company_name text default '',
  address text default '',
  phone text default '',
  email text default '',
  website text default '',
  currency text default '৳',
  prefix text default 'QTN-',
  next_number integer default 1,
  logo_data_url text default '',
  terms text default '',
  bank text default '',
  constraint settings_singleton check (id = 1)
);

insert into settings (id) values (1)
  on conflict (id) do nothing;

create table if not exists categories (
  id serial primary key,
  name text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists items (
  id serial primary key,
  category_id integer not null references categories(id) on delete cascade,
  name text not null,
  unit text default 'pcs',
  price numeric(12,2) default 0,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Optional starter data — remove if you'd rather start empty.
insert into categories (name)
  select 'Standard Range' where not exists (select 1 from categories);
