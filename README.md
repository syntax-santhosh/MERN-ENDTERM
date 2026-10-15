# ShopKart: Customer Authentication Service (Lab 01 & Lab 02)

Welcome to **ShopKart**! This repository contains the complete full-stack customer authentication service adhering to the constraints of **Engineering Lab 01 (Backend MVC)** and **Engineering Lab 02 (Frontend React)**.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Setup Instructions (What You Need to Do)](#setup-instructions-what-you-need-to-do)
   - [Step 1: MongoDB Setup (Local or Atlas)](#step-1-mongodb-setup-local-or-atlas)
   - [Step 2: Backend Configuration & Start](#step-2-backend-configuration--start)
   - [Step 3: Frontend Configuration & Start](#step-3-frontend-configuration--start)
3. [Testing the APIs via Postman](#testing-the-apis-via-postman)
4. [Project Architecture](#project-architecture)
5. [TA Viva Questions & Answers](#ta-viva-questions--answers)

---

## Prerequisites
- **Node.js**: v16+ (tested on Node v24)
- **MongoDB**: Local MongoDB Community Server or free MongoDB Atlas account

---

## Setup Instructions (What You Need to Do)

### Step 1: MongoDB Setup (Local or Atlas)

You need a working MongoDB connection string (`MONGO_URI`). You have two choices:

#### Option A: Local MongoDB (Recommended if installed)
- Default local URL:
  ```env
  MONGO_URI=mongodb://127.0.0.1:27017/shopkart
  ```
- Make sure MongoDB Service is running on your machine (e.g. via Windows Services or MongoDB Compass).

#### Option B: Free Cloud Database (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up/log in.
2. Create a **Free Shared Cluster (M0)**.
3. Under **Database Access**, create a database user (e.g. username `admin` and password `password123`).
4. Under **Network Access**, click **Add IP Address** -> select **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** -> **Drivers (Node.js)** and copy your connection string:
   ```env
   MONGO_URI=mongodb+srv://admin:password123@cluster0.mongodb.net/shopkart?retryWrites=true&w=majority
   ```

---

### Step 2: Backend Configuration & Start

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Open `backend/.env` and ensure your `MONGO_URI` is set:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/shopkart
   JWT_SECRET=shopkart_secret_key_12345
   FRONTEND_URL=http://localhost:5173
   ```
3. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
4. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
5. You should see:
   ```text
   ✅ Connected to MongoDB successfully
   🚀 ShopKart Backend running on http://localhost:5000
   ```

---

### Step 3: Frontend Configuration & Start

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to:
   ```text
   http://localhost:5173
   ```

---

## 🧪 Testing the APIs via Postman

All endpoints use `http://localhost:5000`.

### 1. Register Customer
- **Method**: `POST`
- **URL**: `http://localhost:5000/customers/register`
- **Headers**: `Content-Type: application/json`
- **Body (raw JSON)**:
  ```json
  {
    "fullName": "John Doe",
    "email": "john@gmail.com",
    "password": "john123",
    "phone": "9876543210"
  }
  ```
- **Expected Status**: `201 Created`

### 2. Login Customer
- **Method**: `POST`
- **URL**: `http://localhost:5000/customers/login`
- **Headers**: `Content-Type: application/json`
- **Body (raw JSON)**:
  ```json
  {
    "email": "john@gmail.com",
    "password": "john123"
  }
  ```
- **Expected Status**: `200 OK`
- **Cookie**: Automatically sets `token` as an `HttpOnly` cookie.

### 3. Get Profile (Protected)
- **Method**: `GET`
- **URL**: `http://localhost:5000/customers/me`
- **Postman setting**: Postman automatically stores and sends cookies received from the login step.
- **Expected Status**: `200 OK` (returns customer profile without password).
- If unauthenticated: `401 Unauthorized`.

### 4. Logout
- **Method**: `POST`
- **URL**: `http://localhost:5000/customers/logout`
- **Expected Status**: `200 OK` (clears authentication cookie).

### 5. Change Password (Bonus)
- **Method**: `PATCH`
- **URL**: `http://localhost:5000/customers/change-password`
- **Headers**: `Content-Type: application/json`
- **Body (raw JSON)**:
  ```json
  {
    "oldPassword": "john123",
    "newPassword": "newjohnpassword456"
  }
  ```
- **Expected Status**: `200 OK`

---

## 📂 Project Architecture

```text
Lab Project - 1/
├── backend/
│   ├── controllers/
│   │   └── customer.controller.js  # Register, Login, Me, Logout, ChangePassword logic
│   ├── models/
│   │   └── customer.model.js       # Mongoose Customer schema
│   ├── routes/
│   │   └── customer.routes.js      # REST API route definitions
│   ├── middlewares/
│   │   └── auth.middleware.js      # JWT cookie verification middleware
│   ├── utils/
│   │   └── generateToken.js        # JWT signer & HttpOnly cookie setter
│   ├── index.js                    # Express app configuration & DB connection
│   └── .env                        # Environment variables (Mongo URI, Port, JWT Secret)
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx          # Top navigation bar with dynamic auth status
    │   ├── pages/
    │   │   ├── Register.jsx        # Registration form (/register)
    │   │   ├── Login.jsx           # Login form (/login)
    │   │   └── Home.jsx            # Protected customer dashboard (/home)
    │   ├── services/
    │   │   └── api.js              # Axios instance with withCredentials: true
    │   ├── App.jsx                 # Routing configuration
    │   ├── main.jsx                # React root mount
    │   └── index.css               # Clean, modern styles
    ├── index.html
    └── vite.config.js
```

---

## 🎓 TA Viva Questions & Answers

### Backend Viva Questions (Lab 01)
1. **Why do we use bcrypt instead of encrypting passwords?**
   - *Answer*: Encryption is two-way (can be decrypted if the key is compromised). Passwords should never be reversible. `bcrypt` is a one-way hashing function that uses a cryptographic salt and configurable work factor (rounds) to resist brute-force and rainbow table attacks.

2. **What information is typically stored inside a JWT payload?**
   - *Answer*: Non-sensitive identifying claims, such as the customer's unique ID (`{ id: customer._id }`) and token expiration timestamp. Passwords or sensitive private data should **never** be stored in a JWT payload because payloads are only base64-encoded, not encrypted.

3. **Why is the HttpOnly flag important for cookies?**
   - *Answer*: The `HttpOnly` flag prevents client-side JavaScript (e.g. `document.cookie`) from accessing the cookie. This protects the token against Cross-Site Scripting (XSS) attacks.

4. **Why should passwords never be returned to the frontend?**
   - *Answer*: Even hashed passwords could be exposed in network logs, browser storage, or vulnerable scripts, making them vulnerable to offline dictionary attacks. The frontend has no legitimate need for the password after authentication.

5. **What is the purpose of authentication middleware?**
   - *Answer*: It intercepts requests to private routes, extracts and verifies the JWT token from incoming cookies, checks customer validity in the database, attaches the customer object to `req.user`, and rejects unauthorized requests before they reach the controller.

### Frontend Viva Questions (Lab 02)
1. **Why do we use `withCredentials: true`?**
   - *Answer*: By default, cross-origin HTTP requests (CORS) made via Axios or `fetch` do not include cookies. Setting `withCredentials: true` tells the browser to send HttpOnly authentication cookies with every cross-origin request to the backend.

2. **Why can't JavaScript read an HttpOnly cookie?**
   - *Answer*: The browser's security model forbids JavaScript access (`document.cookie`) to cookies marked with `HttpOnly` to prevent malicious scripts injected via XSS from stealing session tokens.

3. **Why is `/home` called a protected route?**
   - *Answer*: It cannot be accessed without valid credentials. If an unauthenticated user visits `/home`, the application detects the lack of a valid session via `/customers/me` and redirects them to `/login`.

4. **Why do we fetch `/customers/me` instead of storing the user manually?**
   - *Answer*: Fetching `/customers/me` ensures the frontend state reflects current, authoritative database information verified by the server's cryptographic token, rather than stale or easily spoofed data in client storage (like localStorage).

5. **What is the difference between authentication and authorization?**
   - *Answer*: Authentication is verifying **who you are** (e.g. logging in with email and password). Authorization is verifying **what permissions you have** (e.g. whether a user has permission to access admin features or view specific customer data).
