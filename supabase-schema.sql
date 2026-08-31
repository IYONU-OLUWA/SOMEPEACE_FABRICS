-- SOMEPEACE FABRICS database setup
-- Run this in Supabase SQL Editor.

create table if not exists public.fabrics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Fabrics',
  description text default '',
  badge text default '',
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.fabrics enable row level security;

-- Only this Supabase Auth user is allowed to manage the catalogue.
-- Must match ADMIN_USER_ID in admin.js.
create or replace function public.is_somepeace_admin()
returns boolean
language sql
stable
as $$
  select auth.uid() = '7d8f5687-0abd-4778-9bc3-3d642785938b'::uuid;
$$;

drop policy if exists "Public can view fabrics" on public.fabrics;
create policy "Public can view fabrics" on public.fabrics
for select using (true);

drop policy if exists "Authenticated admins can insert fabrics" on public.fabrics;
create policy "Admin can insert fabrics" on public.fabrics
for insert to authenticated with check (public.is_somepeace_admin());

drop policy if exists "Authenticated admins can update fabrics" on public.fabrics;
create policy "Admin can update fabrics" on public.fabrics
for update to authenticated using (public.is_somepeace_admin()) with check (public.is_somepeace_admin());

drop policy if exists "Authenticated admins can delete fabrics" on public.fabrics;
create policy "Admin can delete fabrics" on public.fabrics
for delete to authenticated using (public.is_somepeace_admin());

-- Public image bucket.
insert into storage.buckets (id, name, public)
values ('product-images','product-images',true)
on conflict (id) do update set public=true;

drop policy if exists "Anyone can view product images" on storage.objects;
create policy "Anyone can view product images" on storage.objects
for select using (bucket_id='product-images');

drop policy if exists "Authenticated admins can upload product images" on storage.objects;
create policy "Admin can upload product images" on storage.objects
for insert to authenticated with check (bucket_id='product-images' and public.is_somepeace_admin());

drop policy if exists "Authenticated admins can update product images" on storage.objects;
create policy "Admin can update product images" on storage.objects
for update to authenticated using (bucket_id='product-images' and public.is_somepeace_admin()) with check (bucket_id='product-images' and public.is_somepeace_admin());

drop policy if exists "Authenticated admins can delete product images" on storage.objects;
create policy "Admin can delete product images" on storage.objects
for delete to authenticated using (bucket_id='product-images' and public.is_somepeace_admin());

-- Initial products use files already shipped with the Netlify site.
insert into public.fabrics (name, category, description, badge, image_url, sort_order)
select 'Rossberry Platinum','Ankara','Bold circular pattern with rich red, black and white tones.','FEATURED','assets/somepeace-ankara-rossberry.jpg',10
where not exists (select 1 from public.fabrics where name='Rossberry Platinum');

insert into public.fabrics (name, category, description, badge, image_url, sort_order)
select 'Textured Collection','Fabrics','Soft-looking textured fabrics available in beautiful colours.','COLOURS','assets/somepeace-fabric-1.jpg',20
where not exists (select 1 from public.fabrics where name='Textured Collection');

insert into public.fabrics (name, category, description, badge, image_url, sort_order)
select 'Statement Prints','Embroidered','Decorative patterns made to stand out at special occasions.','DETAILS','assets/somepeace-fabric-2.webp',30
where not exists (select 1 from public.fabrics where name='Statement Prints');

insert into public.fabrics (name, category, description, badge, image_url, sort_order)
select 'More Fabrics','Fabrics','More product photos will be added as the collection expands.','COMING SOON','assets/somepeace-promo.jpg',40
where not exists (select 1 from public.fabrics where name='More Fabrics');

-- IMPORTANT:
-- In Supabase Authentication, create your admin user manually.
-- Then disable public email/password sign-ups so only your created admin account can access admin.html.
