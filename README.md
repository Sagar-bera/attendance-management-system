# Student Attendance Management System

A full-stack, production-style **Student Attendance Management System** with two portals — a
**Student Portal** and an **Admin Portal** — built with the MERN-adjacent stack (MongoDB,
Express.js, React + Vite, Node.js).

---

## 1. Project Overview

Admins can manage students, subjects, and attendance, generate reports, and monitor low
attendance. Students can log in to view their own attendance, subject-wise breakdowns, history,
and manage their profile and password. Authentication is JWT-based with role-based access
control enforced on both the API and the frontend routes.

---

## 2. Features

### Admin Portal
- Secure login (rate-limited)
- Dashboard with stats (total students, subjects, present/absent today, average attendance)
- Charts: daily trend, monthly trend, present vs absent, department-wise %, subject-wise %
- Full student CRUD with search, filter (department/semester/section) and pagination
- Reset a student's password
- Subject CRUD
- Departments overview (auto-derived from student/subject data)
- Mark attendance in bulk for a whole class (Present/Absent/Late, "mark all" shortcuts)
- View/search/filter/edit/delete attendance records
- Daily, monthly, per-student and per-subject reports, exportable as CSV
- Low-attendance list with a configurable threshold
- Editable admin profile and system settings

### Student Portal
- Register / login (by email or Student ID)
- Dashboard: overall attendance %, present/absent/late counts, total classes, low-attendance
  warning banner
- View full attendance history (filterable by subject/month/status/date range)
- Attendance history grouped by month
- Subject-wise attendance breakdown with progress bars
- Editable profile (permitted fields only — academic fields are admin-managed)
- Change password
- Students cannot modify their own attendance

### Shared / Security
- JWT authentication, bcrypt password hashing, role-based middleware
- Forgot/reset password flow with expiring tokens
- Centralized error handling, consistent JSON error responses
- Helmet, CORS, rate limiting on login
- No passwords or secrets ever returned in API responses

---

## 3. Technology Stack

**Frontend:** React 18, Vite, React Router DOM, Axios, React Icons, React Toastify, Recharts,
Context API for auth state, plain CSS3 (responsive, mobile-first sidebar).

**Backend:** Node.js, Express.js, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, Helmet,
`express-rate-limit`, Morgan, dotenv.

**Database:** MongoDB (local or MongoDB Atlas).

---

## 4. Folder Structure

```text
attendance-management-system/
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI: Sidebar, Navbar, Modal, StatCard, etc.
│   │   ├── pages/
│   │   │   ├── auth/       # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── student/    # Student portal pages
│   │   │   └── admin/      # Admin portal pages
│   │   ├── layouts/        # AdminLayout, StudentLayout (sidebar + navbar shell)
│   │   ├── routes/         # ProtectedRoute (auth + role guard)
│   │   ├── services/       # Axios instance + one service module per resource
│   │   ├── context/        # AuthContext
│   │   ├── hooks/          # useAuth
│   │   ├── styles/         # index.css (design system)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── config/db.js
│   ├── controllers/        # auth, student, subject, attendance, report, dashboard, settings
│   ├── middleware/         # authMiddleware, roleMiddleware, errorMiddleware, rateLimiter
│   ├── models/              # Admin, Student, Subject, Attendance, Settings
│   ├── routes/
│   ├── utils/               # asyncHandler, AppError, generateToken, calcPercentage
│   ├── seed/seed.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 5. Installation

### Prerequisites
- Node.js 18+
- MongoDB running locally, **or** a MongoDB Atlas connection string

### Clone / unzip the project, then set up each side.

---

## 6. MongoDB Setup

**Option A — Local MongoDB**
```bash
# macOS (Homebrew)
brew tap mongodb/brew && brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install -y mongodb
sudo systemctl start mongod
```
Your local connection string will be: `mongodb://127.0.0.1:27017/attendance_db`

**Option B — MongoDB Atlas**
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user and allow your IP (or `0.0.0.0/0` for development)
3. Copy the connection string, e.g.
   `mongodb+srv://<user>:<password>@cluster0.mongodb.net/attendance_db`

---

## 7. Environment Variables

### backend/.env
```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://127.0.0.1:27017/attendance_db

JWT_SECRET=change_this_to_a_long_random_secret_string
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

SEED_ADMIN_NAME=Admin
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=Admin@123
```
> ⚠️ **Change `JWT_SECRET` and the seed admin password before any real deployment.**

### frontend/.env
```env
VITE_API_URL=http://localhost:5000/api
```

Both `.env.example` files are provided — copy them to `.env` and adjust as needed.

---

## 8. Backend Setup

```bash
cd backend
npm install
npm run seed     # creates the default admin, 10 sample students, 6 subjects, ~30 days of attendance
npm run dev       # starts the API on http://localhost:5000 with nodemon
```

The API is also available via `npm start` for a non-watching production-style run.

---

## 9. Frontend Setup

```bash
cd frontend
npm install
npm run dev       # starts Vite dev server on http://localhost:5173
```

Open http://localhost:5173 in your browser.

---

## 10. Database Seed

Running `npm run seed` inside `backend/` wipes and repopulates the database with:
- 1 admin account
- 6 subjects (React JS, Node JS, Express JS, MongoDB, JavaScript, HTML & CSS)
- 10 students (ST001–ST010), all in "Computer Science", Semester 3, Section A
- ~30 days of realistic, weighted-random attendance records across those subjects
- Default system settings (low attendance threshold: 75%)

---

## 11. Login Credentials (after seeding)

**Admin**
```
Email: admin@example.com
Password: Admin@123
```

**Sample Student**
```
Student ID: ST001   (or email: st001@example.com)
Password: Student@123
```
Any of ST001–ST010 will work, all sharing the password `Student@123`.

---

## 12. API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require:
```
Authorization: Bearer <token>
```

### Authentication
| Method | Endpoint | Body | Notes |
|---|---|---|---|
| POST | `/auth/login` | `{ email or studentId, password }` | Returns `{ token, user }` |
| POST | `/auth/register` | student fields + `password` | Student self-registration |
| POST | `/auth/logout` | — | Auth required |
| POST | `/auth/forgot-password` | `{ email }` | Returns a dev reset token (no email service configured) |
| POST | `/auth/reset-password` | `{ token, newPassword }` | |
| POST | `/auth/change-password` | `{ currentPassword, newPassword }` | Auth required |
| GET | `/auth/me` | — | Auth required |

**Example**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```
Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOi...",
  "user": { "_id": "...", "name": "Admin", "email": "admin@example.com", "role": "admin" }
}
```

### Students (admin unless noted)
| Method | Endpoint | Notes |
|---|---|---|
| GET | `/students` | `?search=&department=&semester=&section=&page=&limit=` |
| GET | `/students/:id` | Admin: any. Student: own only |
| POST | `/students` | Create |
| PUT | `/students/:id` | Admin: any field. Student: own permitted fields |
| DELETE | `/students/:id` | |
| PATCH | `/students/:id/reset-password` | `{ newPassword }` |
| GET | `/students/meta/departments` | Distinct department list |
| GET | `/students/:id/attendance-summary` | Present/absent/late/percentage |

### Subjects
| Method | Endpoint |
|---|---|
| GET | `/subjects` |
| GET | `/subjects/:id` |
| POST | `/subjects` (admin) |
| PUT | `/subjects/:id` (admin) |
| DELETE | `/subjects/:id` (admin) |

### Attendance (admin unless noted)
| Method | Endpoint | Notes |
|---|---|---|
| GET | `/attendance` | Filterable records list |
| GET | `/attendance/students-for-marking` | `?department=&semester=&course=&section=&subject=&date=` |
| GET | `/attendance/student/:studentId` | Admin: any. Student: own only |
| POST | `/attendance` | Single record; rejects duplicates |
| POST | `/attendance/bulk` | `{ subject, date, entries: [{ student, status, remarks }] }` |
| PUT | `/attendance/:id` | |
| DELETE | `/attendance/:id` | |

### Reports (admin unless noted)
| Method | Endpoint |
|---|---|
| GET | `/reports/daily?date=YYYY-MM-DD` |
| GET | `/reports/monthly?month=YYYY-MM` |
| GET | `/reports/student/:id` (admin: any, student: own) |
| GET | `/reports/subject/:id` |
| GET | `/reports/low-attendance?threshold=75` |

### Dashboard
| Method | Endpoint |
|---|---|
| GET | `/admin/dashboard` |
| GET | `/student/dashboard` |

### Settings (admin)
| Method | Endpoint |
|---|---|
| GET | `/settings` |
| PUT | `/settings` — `{ lowAttendanceThreshold }` |
| PUT | `/settings/profile` — `{ name, email, profileImage }` |

---

## 13. How to Run the Application

1. Start MongoDB (local service or Atlas is already running).
2. `cd backend && npm install && npm run seed && npm run dev`
3. In a second terminal: `cd frontend && npm install && npm run dev`
4. Visit http://localhost:5173, and log in with the admin or a sample student account above.

---

## 14. Common Errors and Fixes

| Error | Fix |
|---|---|
| `MongoDB connection error: connect ECONNREFUSED` | MongoDB isn't running, or `MONGO_URI` in `backend/.env` is wrong. Start MongoDB or fix the URI. |
| `401 Not authorized, no token provided` | The frontend didn't attach a token — make sure you're logged in and `localStorage` has a `token` key. |
| CORS error in the browser console | Confirm `CLIENT_URL` in `backend/.env` matches the frontend's actual origin (default `http://localhost:5173`). |
| `409 Email already registered` / `Student ID already exists` | Use a different email/ID, or edit the existing student instead of creating a new one. |
| `409 Attendance already marked for this student, subject and date` | Use the "Edit" action on Attendance Records instead of marking again, or use Mark Attendance which updates existing entries automatically. |
| `ERR_CONNECTION_REFUSED` or requests going to port 8081 | This project uses backend port `5000`. Set `VITE_API_URL=http://localhost:5000/api` in `frontend/.env`, restart Vite, and start the backend with `npm run dev`. |
| `npm install` fails on bcryptjs/native modules | `bcryptjs` is pure JS (no native build step) specifically to avoid this — make sure you're using the `backend/package.json` provided, not `bcrypt`. |

---

## 15. Security Notes for Real Deployments

- Change `JWT_SECRET` to a long, random value and keep it out of version control.
- Change the seeded admin password immediately after first login.
- Put the app behind HTTPS in production.
- Configure a real email provider for the forgot-password flow (currently the reset token is
  returned directly in the API response for local development/testing purposes only).
- Consider adding centralized logging/monitoring and stricter rate limits for a production
  deployment.
