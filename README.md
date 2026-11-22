# ADNU Prints

ADNU Prints is a MERN application: React/Vite client, Express API, and MongoDB.
The former PHP/MySQL application has been replaced.

## Requirements

- Node.js (current LTS)
- MongoDB locally or a MongoDB Atlas connection string

## Configure MongoDB

In PowerShell:

```powershell
Copy-Item server\.env.example server\.env
```

Set `MONGODB_URI` and replace `JWT_SECRET` in `server\.env`. Keep this file
private; it contains credentials.

## Install and run

Install dependencies once in each folder:

```powershell
cd server
npm install
cd ..\client
npm install
```

Run the API and client in separate terminals:

```powershell
cd server
npm start
```

```powershell
cd client
npm run dev -- --host 127.0.0.1
```

Open [http://localhost:5173](http://localhost:5173). The API listens on
`http://localhost:5000`; its health endpoint is `/api/health`.

Register a student or faculty account through the site. Admin accounts are
created with `server/scripts/createAdmin.js`. To reset an existing admin
password, use `server/scripts/resetAdminPassword.js`. Both scripts validate
their input and read JSON from standard input; enter passwords locally rather
than sharing them.

Uploaded documents are stored under `server/private-uploads`, not served as
public static files.
