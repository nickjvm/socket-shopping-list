This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Overview

This app is a basic recreation of the Reminders iOS app, built specifically for shopping lists.

### Highlights

- For all users viewing a list, items are updated in real time through a socket connection.
- If an item is created without a category, OpenAI will attempt to categorize it.
- Items can be dragged and dropped to update the sort order or category.
- Dark and light mode are supported. Appearance will default to your system preferences.

**Lists are public - anyone with the link can view and edit a list.**

## Getting Started

### Environment Variables

You will need a `.env` with values for:

- [OpenAI API Key](https://platform.openai.com/api-keys)
- [Turso](https://turso.tech/) database URL
  - You just need to create an empty database to start. Read on for migration & seeding details
- Turso auth token

`.env` keys:

```
OPENAI_API_KEY=
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
```

### Setup the Database

Once you have your .env file created and populated, run `npm run db:migrate`. This should create the appropriate tables and columns. You can see the schema in `./drizzle/schema.ts`.

Once you've built out your database, you can optionally populate it with `npm run db:seed`

### Run It!

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.
