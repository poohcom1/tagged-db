# My Tagged DB

A minimal spreadsheet app for tagging all your favorite things.

![Spreadsheet](.github/images/sheet.png)

## Features

- A minimal spreadsheet system with set column types.
- A tagging system with filtering and sorting.
- Formulas with Python scripting.
- A "bring your own backend" system for cloud storage.
- CSV importing/exporting.

## Development

### Quickstart

1. Install NodeJs 20+
2. In the root directory, run:

```sh
npm install
npm run dev
```

3. Go to http://localhost:5173

### Setting Up a Backend with Docker

1. Create a `.env` file in the /server directory.
2. Setup a passkey if needed:

- `AUTH_TYPE=none` for no passkey. If anyone knows your url they can nuke your spreadsheets.
- `AUTH_TYPE=passkey` for a passkey.
  - Set `AUTH_PASSKEY` to your passkey.
  - Set `AUTH_JWT_SECRET` to a random string.

3. Setup your https certs in a directory, and set the following in `.env` (example):
   - `CERTS_PATH=/etc/certs`
   - `HTTPS_KEY_PATH=/etc/certs/my-cert.key`
   - `HTTPS_CERT_PATH=/etc/certs/my-cert.crt`
4. Run the following docker command:

```sh
docker compose -f server/docker-compose.https.yml up -d --force-recreate --build
```

5. Go to https://my-tagged-db.vercel.app/ and add your backend by clicking on "+".


