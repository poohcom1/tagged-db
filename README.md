# My Tagged DB

A simple spreadsheet for tagging all your favorite things.

![Spreadsheet](.github/images/sheet.png)

## Features

### Spreadsheet

- [x] Cell types
  - [x] Text / Links
  - [x] Number
  - [x] Dropdown
  - [x] Tags
  - [x] Dates
- [ ] View
  - [x] Column sorting
  - [ ] Text filtering
  - [x] Tag filtering
- [ ] Refactoring
  - [x] Dropdown option renaming
  - [ ] Tag renaming
- [x] Navigation
  - [x] Cell tab controls

### File Manager

- [x] Local storage
- [x] Configurable remotes
  - [ ] MongoDB Backend
  - [x] FS Backend
  - [x] Memory Backend
- [ ] Native file protocols integration
- [ ] CSS export/import
- [x] Adorable retro aesthetic

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


