# FarmConnect – Full Stack Equipment Rental Platform MVP

FarmConnect is an agricultural equipment rental platform built using **React Native (Expo)**, **Node.js (Express)**, and **PostgreSQL**.

---

## Folder Structure

```
FarmConnect/
├── frontend/    # React Native Expo Mobile App
└── backend/     # Node.js/Express REST API Server
```

---

## 🚀 Frontend Setup (React Native Expo)

1. Open your terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install all dependencies:
   ```bash
   npm install
   ```
3. Run the application:
   ```bash
   npx expo start
   ```

*Note:* By default, the application runs on **dummy data** (configured in `frontend/src/services/`) so it works immediately. You can switch to the live backend integration by setting `USE_DUMMY = false` in the service files once your backend server is active.

---

## ⚙️ Backend Setup (Node.js + PostgreSQL)

1. Open another terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create the database in PostgreSQL:
   ```sql
   CREATE DATABASE farmconnect_db;
   ```
4. Load the database schema and seed data:
   ```bash
   psql -U postgres -d farmconnect_db -f src/database/schema.sql
   ```
   ```bash
   psql -U postgres -d farmconnect_db -f src/database/seed.sql
   ```
5. Configure your environmental variables in the `.env` file (ensure the `DB_PASSWORD` matches your local PostgreSQL setup).
6. Start the server in development mode:
   ```bash
   npm run dev
   ```

---

## 🎨 Color Palette & Design
- **Primary Green:** `#2E7D32`
- **Soil Brown:** `#8D6E63`
- **Background Cream:** `#F5F5DC`

---

## 🚜 Default Login Accounts (Demo)
Use these credentials to test the dashboard flows:

- **Farmer Flow:**
  - Email: `amit@farmer.com`
  - Password: `any` (or `password123`)

- **Provider Flow:**
  - Email: `rajesh@provider.com`
  - Password: `any` (or `password123`)
