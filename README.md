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
```
server/
├── config/
│   └── db.js
├── middleware/
│   ├── auth.js
│   ├── roleGuard.js
│   └── errorHandler.js
├── modules/
│   ├── auth/
│   ├── users/
│   ├── records/
│   └── dashboard/
├── utils/
│   └── response.js
├── .env
└── index.js
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB Atlas account or local MongoDB instance

### Installation

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd finance-dashboard/server
```

**2. Install dependencies**
```bash
npm install
```

**3. Create a `.env` file inside the `server/` folder**
```
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

**4. Start the server**
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
| View trends and categories | ❌ | ✅ | ✅ |
| Create records | ❌ | ❌ | ✅ |
| Update records | ❌ | ❌ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## API Reference

### Authentication

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and get token | Public |

**Register**
```
POST /api/auth/register
```
```json
{
  "name": "Admin User",
  "email": "admin@test.com",
  "password": "123456",
  "role": "admin"
}
```

**Login**
```
POST /api/auth/login
```
```json
{
  "email": "admin@test.com",
  "password": "123456"
}
```

---

### Users

All user routes require **Admin** role.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get single user |
| PATCH | `/api/users/:id/role` | Update user role |
| PATCH | `/api/users/:id/status` | Activate or deactivate user |
| DELETE | `/api/users/:id` | Delete a user |

**Update Role**
```
PATCH /api/users/:id/role
Authorization: Bearer your_token
```
```json
{
  "role": "analyst"
}
```

**Update Status**
```
PATCH /api/users/:id/status
Authorization: Bearer your_token
```
```json
{
  "isActive": false
}
```

---

### Financial Records

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/records` | All roles | Get all records with filters |
| GET | `/api/records/:id` | All roles | Get single record |
| POST | `/api/records` | Admin only | Create a record |
| PUT | `/api/records/:id` | Admin only | Update a record |
| DELETE | `/api/records/:id` | Admin only | Soft delete a record |

**Create Record**
```
POST /api/records
Authorization: Bearer your_token
```
```json
{
  "amount": 5000,
  "type": "income",
  "category": "Salary",
  "date": "2026-04-01",
  "notes": "Monthly salary"
}
```

**Filter Records**
```
GET /api/records?type=income&category=salary&startDate=2026-01-01&endDate=2026-04-30&page=1&limit=10
Authorization: Bearer your_token
```

Supported query parameters:

| Parameter | Description | Example |
|---|---|---|
| `type` | income or expense | `type=income` |
| `category` | category name | `category=salary` |
| `startDate` | filter from date | `startDate=2026-01-01` |
| `endDate` | filter to date | `endDate=2026-04-30` |
| `page` | page number | `page=1` |
| `limit` | records per page | `limit=10` |

---

### Dashboard

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard/summary` | All roles | Total income, expenses, net balance |
| GET | `/api/dashboard/recent` | All roles | Recent transactions |
| GET | `/api/dashboard/by-category` | Analyst and Admin | Category wise breakdown |
| GET | `/api/dashboard/trends` | Analyst and Admin | Monthly or weekly trends |

**Summary Response**
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

**Trends**
```
GET /api/dashboard/trends?period=monthly
GET /api/dashboard/trends?period=weekly
Authorization: Bearer your_token
```

**Recent Activity**
```
GET /api/dashboard/recent?limit=5
Authorization: Bearer your_token
```

---

## Standard Response Format

**Success**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Error**
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
```
Authorization: Bearer your_jwt_token
```

Tokens are obtained by logging in via `POST /api/auth/login` and expire after 7 days.

---

## Assumptions Made

1. **Role assignment on register** — Role can be passed during registration for testing purposes. In production this would be restricted to admins only.
2. **Soft deletes** — Financial records are never permanently deleted. A deleted record has `isDeleted: true` and is excluded from all queries.
3. **Authentication** — JWT based stateless authentication is used with no refresh token mechanism.
4. **Single admin seeding** — The first admin is created by passing `role: admin` during registration. No seeding script is needed.
5. **Pagination defaults** — Records default to page 1 with 10 items per page if no pagination parameters are provided.

---

## Design Decisions

- **Module based structure** — Each feature is self contained with its own routes, controller, service, and model.
- **Service layer** — All business logic lives in service files. Controllers only handle request and response.
- **Consistent error handling** — All errors are returned in the same format with appropriate HTTP status codes.
- **MongoDB aggregation for dashboard** — Dashboard endpoints use aggregation pipelines directly for better performance.
- **ES Modules** — The project uses native ES module syntax throughout.

---

## Error Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Missing or invalid token |
| 403 | Insufficient role |
| 404 | Resource not found |
| 409 | Duplicate entry |
| 500 | Internal server error |

---

## Running Tests

The project includes 50 integration tests across 4 test suites covering all API routes.

### Setup test environment

Create a `.env.test` file inside the `server/` folder:
```
PORT=8000
MONGO_URI=your_mongodb_connection_string_with_test_database
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

> Use a separate database name in your MONGO_URI for tests, for example `finance-dashboard-test` instead of `finance-dashboard`. This keeps test data separate from real data.

### Run tests
```bash
npm test
```

### Test coverage

| Test Suite | Tests | What is covered |
|---|---|---|
| auth.test.js | 11 | Register, login, validation, duplicate email |
| users.test.js | 13 | Get users, update role, update status, delete, access control |
| records.test.js | 14 | Create, read, update, soft delete, filters, pagination, access control |
| dashboard.test.js | 12 | Summary, trends, categories, recent activity, role restrictions |
| **Total** | **50** | **All routes and role based access** |

---

## Seeding the Database

To quickly populate the database with sample data for testing:
```bash
npm run seed
```

This creates 3 users and 15 financial records across 4 months.

**Test accounts created by seed:**

| Role | Email | Password |
|---|---|---|
| Admin | admin@test.com | password123 |
| Analyst | analyst@test.com | password123 |
| Viewer | viewer@test.com | password123 |

---
## Future Improvements

- Refresh token mechanism
- Rate limiting
- Unit and integration tests
- Search functionality across records
- Export records to CSV
- React frontend dashboard