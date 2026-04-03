# Finance Dashboard API

A backend REST API for a finance dashboard system built with Node.js, Express, and MongoDB. The system supports role-based access control, financial record management, and dashboard analytics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v22 |
| Framework | Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | JWT (JSON Web Tokens) |
| Password Hashing | bcryptjs |
| Validation | express-validator |

---

## Project Structure

server/
├── config/
│   └── db.js                  # MongoDB connection
├── middleware/
│   ├── auth.js                # JWT verification middleware
│   ├── roleGuard.js           # Role-based access control
│   └── errorHandler.js        # Global error handler
├── modules/
│   ├── auth/                  # Register and login
│   ├── users/                 # User management
│   ├── records/               # Financial records CRUD
│   └── dashboard/             # Analytics and summaries
├── utils/
│   └── response.js            # Consistent response helpers
├── .env
└── index.js

---

## Getting Started

### Prerequisites
- Node.js v18 or higher
- MongoDB Atlas account or local MongoDB instance

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd finance-dashboard/server
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the `server/` folder
```bash
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```
4. Start the server
```bash
npm run dev
```

Server will run at `http://localhost:8000`

---

## Roles and Permissions

| Action | Viewer | Analyst | Admin |
|---|---|---|---|
| View records | ✅ | ✅ | ✅ |
| View summary | ✅ | ✅ | ✅ |
| View recent activity | ✅ | ✅ | ✅ |
| View trends and category breakdown | ❌ | ✅ | ✅ |
| Create records | ❌ | ❌ | ✅ |
| Update records | ❌ | ❌ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## API Reference

### Auth

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | /api/auth/register | Register a new user | Public |
| POST | /api/auth/login | Login and get token | Public |

#### Register

POST /api/auth/register
```json
{
  "name": "Admin User",
  "email": "admin@test.com",
  "password": "123456",
  "role": "admin"
}
```

#### Login
POST /api/auth/login
```json
{
  "email": "admin@test.com",
  "password": "123456"
}
```

---

### Users

All user routes require Admin role.

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/users | Get all users |
| GET | /api/users/:id | Get single user |
| PATCH | /api/users/:id/role | Update user role |
| PATCH | /api/users/:id/status | Activate or deactivate user |
| DELETE | /api/users/:id | Delete a user |

#### Update Role
PATCH /api/users/:id/role
```json
{
  "role": "analyst"
}
```

#### Update Status
PATCH /api/users/:id/status
```json
{
  "isActive": false
}
```

---

### Financial Records

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/records | All roles | Get all records with filters |
| GET | /api/records/:id | All roles | Get single record |
| POST | /api/records | Admin only | Create a record |
| PUT | /api/records/:id | Admin only | Update a record |
| DELETE | /api/records/:id | Admin only | Soft delete a record |

#### Create Record
POST /api/records
```json
{
  "amount": 5000,
  "type": "income",
  "category": "Salary",
  "date": "2026-04-01",
  "notes": "Monthly salary"
}
```

#### Filter Records
GET /api/records?type=income&category=salary&startDate=2026-01-01&endDate=2026-04-30&page=1&limit=10

Supported query parameters:

| Parameter | Description | Example |
|---|---|---|
| type | Filter by income or expense | type=income |
| category | Filter by category name | category=salary |
| startDate | Filter from date | startDate=2026-01-01 |
| endDate | Filter to date | endDate=2026-04-30 |
| page | Page number | page=1 |
| limit | Records per page | limit=10 |

---

### Dashboard

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/dashboard/summary | All roles | Total income, expenses, net balance |
| GET | /api/dashboard/recent | All roles | Recent transactions |
| GET | /api/dashboard/by-category | Analyst and Admin | Category wise breakdown |
| GET | /api/dashboard/trends | Analyst and Admin | Monthly or weekly trends |

#### Summary Response
```json
{
  "success": true,
  "data": {
    "totalIncome": 8000,
    "totalExpenses": 2500,
    "netBalance": 5500
  }
}
```

#### Trends
GET /api/dashboard/trends?period=monthly
GET /api/dashboard/trends?period=weekly

#### Recent Activity
GET /api/dashboard/recent?limit=5

---

## Standard Response Format

Every API response follows this consistent structure.

#### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

#### Error
```json
{
  "success": false,
  "error": {
    "message": "Something went wrong",
    "details": []
  }
}
```

---

## Authentication

All protected routes require a Bearer token in the Authorization header.
Authorization: Bearer your_jwt_token

Tokens are obtained by logging in via `POST /api/auth/login` and expire after 7 days.

---

## Assumptions Made

1. **Role assignment on register** — The role can be passed during registration for development and testing purposes. In a production system this would be restricted so that only admins can assign roles.

2. **Soft deletes** — Financial records are never permanently deleted. A deleted record has `isDeleted: true` and is excluded from all queries. This preserves data integrity and audit history.

3. **Authentication** — JWT based stateless authentication is used. There is no refresh token mechanism as this is outside the scope of this assignment.

4. **Single admin seeding** — There is no database seeding script. The first admin user is created by passing `role: admin` during registration.

5. **Pagination defaults** — Records default to page 1 with 10 items per page if no pagination parameters are provided.

---

## Design Decisions

- **Module based structure** — Each feature (auth, users, records, dashboard) is self contained with its own routes, controller, service, and model. This makes the codebase easy to navigate and extend.

- **Service layer** — All business logic lives in service files. Controllers only handle request and response. This separation makes logic easy to test and reuse.

- **Consistent error handling** — All errors are caught and returned in the same format with appropriate HTTP status codes. A global error handler catches any unhandled errors.

- **MongoDB aggregation for dashboard** — Dashboard endpoints use MongoDB aggregation pipelines directly instead of fetching and processing data in JavaScript. This is more efficient and scalable.

- **ES Modules** — The project uses native ES module syntax throughout for cleaner and more modern code.

---

## Error Codes Used

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad request or validation error |
| 401 | Unauthorized, missing or invalid token |
| 403 | Forbidden, insufficient role |
| 404 | Resource not found |
| 409 | Conflict, duplicate entry |
| 500 | Internal server error |

---



