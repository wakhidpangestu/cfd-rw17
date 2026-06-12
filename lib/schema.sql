-- ============================================
-- CFD & BAZAR UMKM RW 17 - Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- UMKM / Penjual table
create table if not exists umkm_registrations (
  id uuid default gen_random_uuid() primary key,
  nama_usaha text not null,
  nama_pemilik text not null,
  jenis_produk text not null,
  kategori text not null,
  nomor_hp text not null,
  lokasi_lapak text,
  deskripsi text,
  event_date date not null default current_date,
  created_at timestamptz default now()
);

-- UMKM Kehadiran (Attendance) table
-- Stores per-UMKM presence per event date. UMKM is registered once; attendance is tracked separately.
create table if not exists umkm_kehadiran (
  id uuid default gen_random_uuid() primary key,
  umkm_id uuid not null references umkm_registrations(id) on delete cascade,
  event_date date not null default current_date,
  hadir boolean not null default true,
  created_at timestamptz default now(),
  unique(umkm_id, event_date)
);

alter table umkm_kehadiran enable row level security;
create policy "allow_all_kehadiran" on umkm_kehadiran for all using (true) with check (true);

-- Pengunjung CFD counter
create table if not exists pengunjung_counter (
  id uuid default gen_random_uuid() primary key,
  count integer not null default 0,
  event_date date not null default current_date,
  last_updated timestamptz default now(),
  unique(event_date)
);

-- Parkiran counter per type
create table if not exists parkiran_counter (
  id uuid default gen_random_uuid() primary key,
  motor integer not null default 0,
  mobil integer not null default 0,
  sepeda integer not null default 0,
  event_date date not null default current_date,
  last_updated timestamptz default now(),
  unique(event_date)
);

-- Enable RLS but allow all for simplicity (hidden pages)
alter table umkm_registrations enable row level security;
alter table pengunjung_counter enable row level security;
alter table parkiran_counter enable row level security;

-- Allow all operations (no auth needed for hidden pages)
create policy "allow_all_umkm" on umkm_registrations for all using (true) with check (true);
create policy "allow_all_pengunjung" on pengunjung_counter for all using (true) with check (true);
create policy "allow_all_parkiran" on parkiran_counter for all using (true) with check (true);

-- Function to upsert pengunjung counter
create or replace function increment_pengunjung(target_date date)
returns void as $$
begin
  insert into pengunjung_counter (count, event_date, last_updated)
  values (1, target_date, now())
  on conflict (event_date)
  do update set count = pengunjung_counter.count + 1, last_updated = now();
end;
$$ language plpgsql;

-- Function to upsert parkiran counter
create or replace function increment_parkiran(target_date date, vehicle_type text)
returns void as $$
begin
  insert into parkiran_counter (motor, mobil, sepeda, event_date, last_updated)
  values (
    case when vehicle_type = 'motor' then 1 else 0 end,
    case when vehicle_type = 'mobil' then 1 else 0 end,
    case when vehicle_type = 'sepeda' then 1 else 0 end,
    target_date,
    now()
  )
  on conflict (event_date)
  do update set
    motor = parkiran_counter.motor + (case when vehicle_type = 'motor' then 1 else 0 end),
    mobil = parkiran_counter.mobil + (case when vehicle_type = 'mobil' then 1 else 0 end),
    sepeda = parkiran_counter.sepeda + (case when vehicle_type = 'sepeda' then 1 else 0 end),
    last_updated = now();
end;
$$ language plpgsql;

-- Function to decrement pengunjung
create or replace function decrement_pengunjung(target_date date)
returns void as $$
begin
  update pengunjung_counter
  set count = greatest(0, count - 1), last_updated = now()
  where event_date = target_date;
end;
$$ language plpgsql;

-- Function to decrement parkiran
create or replace function decrement_parkiran(target_date date, vehicle_type text)
returns void as $$
begin
  update parkiran_counter
  set
    motor = greatest(0, motor - (case when vehicle_type = 'motor' then 1 else 0 end)),
    mobil = greatest(0, mobil - (case when vehicle_type = 'mobil' then 1 else 0 end)),
    sepeda = greatest(0, sepeda - (case when vehicle_type = 'sepeda' then 1 else 0 end)),
    last_updated = now()
  where event_date = target_date;
end;
$$ language plpgsql;
