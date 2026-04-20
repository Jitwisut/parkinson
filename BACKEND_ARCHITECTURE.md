# Backend Architecture

Backend for Parkinson Care Assistant is scaffolded under `server/` with the structure from `plan.md`.

## Selected Tech Stack

- Runtime: Node.js
- Framework: Express.js
- Database: PostgreSQL
- ORM: Prisma
- Realtime: Socket.IO
- Auth: Firebase Auth (JWT verification via `firebase-admin`)
- Push notifications: Firebase Cloud Messaging
- Background jobs: `node-cron`
- Validation: Zod
- PDF export: PDFKit
- Local infrastructure: Docker Compose

## Folder Layout

```text
server/
  prisma/
    schema.prisma
  src/
    config/
    jobs/
    lib/
    middleware/
    routes/
    services/
    utils/
    app.js
    index.js
```

## API Coverage

- `POST /auth/verify`
- `POST /auth/register`
- `POST /symptoms`
- `POST /symptoms/bulk`
- `GET /symptoms`
- `GET /symptoms/summary`
- `GET /symptoms/export`
- `GET /medications`
- `POST /medications`
- `PUT /medications/:id`
- `DELETE /medications/:id`
- `POST /medications/:id/log`
- `GET /medications/logs`
- `GET /medications/compliance`
- `GET /alerts`
- `POST /alerts/:id/resolve`
- `GET /alerts/history`
- `POST /sensor/tremor`
- `GET /sensor/tremor/baseline`
- `POST /sensor/tremor/baseline`
- `POST /sensor/steps`
- `GET /caregiver/patients`
- `GET /caregiver/patients/:id/status`
- `GET /reports/monthly`
- `GET /reports/pdf`

## Notes

- During local development, endpoints can use `x-patient-id` and `x-caregiver-id` headers before Firebase is wired up.
- `src/jobs/offCheck.js` runs the rule-based OFF detection job every 5 minutes by default.
- `src/services/` is where the real business logic should continue to grow as the project moves through later phases.
