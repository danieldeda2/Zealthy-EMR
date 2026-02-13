# Zealthy Mini-EMR & Patient Portal

A full-stack healthcare application featuring an admin EMR interface for managing patients, appointments, and prescriptions, alongside a patient-facing portal for viewing upcoming care.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios |
| Backend | Python, FastAPI, Motor (async MongoDB) |
| Database | MongoDB Atlas |
| Auth | JWT (python-jose) + bcrypt |

## Project Structure

```
├── frontend/          React application (CRA)
│   └── src/
│       ├── components/    Reusable UI components
│       ├── pages/         Route-level pages
│       ├── context/       Auth context provider
│       ├── services/      API client layer
│       └── utils/         Helpers & date utilities
│
└── backend/           FastAPI application
    ├── routes/            API route handlers
    ├── models/            Pydantic schemas
    ├── utils/             Auth & serializers
    ├── database.py        MongoDB connection
    ├── main.py            App entry point
    ├── seed.py            Database seeder
    └── requirements.txt
```

### Test Credentials

| Email | Password |
|---|---|
| `mark@some-email-provider.net` | `Password123!` |
| `lisa@some-email-provider.net` | `Password123!` |

## Application Routes

### Patient Portal (`/`)
- `/` — Login
- `/dashboard` — Summary (upcoming appointments & refills within 7 days)
- `/appointments` — Full appointment schedule (3 months)
- `/prescriptions` — All medications with refill timelines

### Admin EMR (`/admin`)
- `/admin` — Patient directory with search
- `/admin/patients/new` — Create patient
- `/admin/patients/:id` — Patient detail (manage appointments & prescriptions)
- `/admin/patients/:id/edit` — Edit patient info

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Patient login |
| `GET` | `/api/auth/me` | Current user (JWT) |
| `GET` | `/api/patients` | List all patients |
| `POST` | `/api/patients` | Create patient |
| `GET` | `/api/patients/:id` | Get patient |
| `PUT` | `/api/patients/:id` | Update patient |
| `GET` | `/api/patients/:id/appointments` | List appointments |
| `POST` | `/api/patients/:id/appointments` | Create appointment |
| `PUT` | `/api/patients/:id/appointments/:aid` | Update appointment |
| `DELETE` | `/api/patients/:id/appointments/:aid` | Delete appointment |
| `GET` | `/api/patients/:id/prescriptions` | List prescriptions |
| `POST` | `/api/patients/:id/prescriptions` | Create prescription |
| `PUT` | `/api/patients/:id/prescriptions/:rid` | Update prescription |
| `DELETE` | `/api/patients/:id/prescriptions/:rid` | Delete prescription |
| `GET` | `/api/reference/medications` | Available medications |
| `GET` | `/api/reference/dosages` | Available dosages |
| `GET` | `/api/health` | Health check |
