# SOMEPEACE FABRICS v4 — Admin-enabled rebuild

This version keeps the existing public design but makes Collections data-driven.

## What it does
- Public `index.html` loads fabrics from Supabase.
- `admin.html` provides protected login + add/edit/delete.
- Product images are uploaded to Supabase Storage.
- CSS Grid automatically grows to any number of products without overlap.
- Existing four products are seeded with the site's existing `/assets/...` image paths.

## Setup
1. Create a Supabase project.
2. Open SQL Editor and run `supabase-schema.sql`.
3. In Supabase Authentication, create your admin user manually.
4. Disable public sign-ups in Authentication settings.
5. Copy Project URL and anon/public key from Project Settings → API.
6. Put them in `supabase-config.js`.
7. Deploy this folder to Netlify.

Do not put a service-role key in this project. Only the Supabase anon/public key belongs in the browser.

## Important
The SQL policies only allow the account whose ID matches `ADMIN_USER_ID` (set in `admin.js`) to insert, update or delete fabrics/images — this is enforced in the database itself, not just in the browser. If you ever create a new admin account, update `ADMIN_USER_ID` in `admin.js` and the ID inside `is_somepeace_admin()` in `supabase-schema.sql` to match, then re-run the SQL. Disabling public sign-up in Authentication settings is still recommended as an extra layer of protection.

## Current contact
WhatsApp/phone: +2349159186865
Instagram: @somepeace2026
