# Catalogue Collection

A small Next.js and Supabase app for cataloguing inventory and recording sales with a shared event workspace.

## Features

- Email/password auth with Supabase
- Create events and invite collaborators by email
- Shared inventory per event
- Item records with title, photo, notes, price, and quantity
- Stock adjustments with movement history
- Sale logging with payment type, account, amount override, and quantity

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and add your Supabase project values:

```bash
cp .env.example .env.local
```

3. In Supabase SQL Editor, run [`supabase/schema.sql`](/Users/macintosh/Desktop/sites/react/catalogue-collection/supabase/schema.sql).

4. In Supabase Storage, create the public bucket `item-images`.

5. Start the app:

```bash
npm run dev
```

## Notes

- Invites are stored by email. When an invited user signs in with the same email, membership is claimed automatically.
- Item images upload directly to Supabase Storage under `organizationId/userId/...`.
- Sales reduce stock immediately. Manual stock changes are tracked separately as stock movements.
# bookfair-cataloguer
