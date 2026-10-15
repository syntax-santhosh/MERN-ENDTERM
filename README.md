# ShopKart — Full-Stack MERN E-Commerce Platform

A production-grade Full-Stack MERN (MongoDB, Express.js, React, Node.js) E-Commerce Web Application featuring secure authentication, a dynamic product catalog, interactive cart and wishlist, Razorpay checkout integration, order tracking, and an automated MongoDB fallback for zero-friction evaluation.

---

## 🌟 Key Features

### 🔐 1. Authentication & Security
- **JWT in HttpOnly Cookies**: Token is stored in `HttpOnly`, `SameSite` cookies to protect against XSS and client-side theft.
- **Bcrypt Password Hashing**: Passwords salted and hashed before persistence.
- **Protected Routes**: Frontend routes (`/home`, `/cart`, `/wishlist`, `/orders`, `/checkout`) and backend endpoints protected via `authMiddleware`.
- **User Profile Management**: Retrieve current user session and change password securely.

### 🛍️ 2. Product Catalog & Management
- Product listing with category filters, price sorting, and live search.
- Product details page with image preview, stock status, ratings, and detailed specifications.
- Modal to add new products directly into the database.
- **Auto-Seeding**: Automatic seed script populates sample products on first boot if the catalog is empty.

### 🛒 3. Cart & Wishlist
- **Persistent Server-Side Cart**: Syncs quantity updates, items, and total prices in MongoDB.
- **Wishlist Toggle**: Quick toggle items into/out of user's personal wishlist with instant UI updates.
- **Cart Context**: React Context for smooth, responsive state updates across the app.

### 💳 4. Checkout & Orders
- **Razorpay Integration**: Supports simulated or live payments via Razorpay API.
- **Order Processing**: Generates orders with shipping details, price summaries, and status tracking.
- **Order History & Details**: View past orders and detailed itemized receipts (`/orders/:orderId`).

### ⚡ 5. Zero-Friction Database Setup (Auto Fallback)
- Connects to your configured `MONGO_URI` (Local MongoDB or MongoDB Atlas).
- **Embedded In-Memory Fallback**: If local MongoDB is not running, the backend automatically starts an in-memory MongoDB instance (`mongodb-memory-server`) so evaluators can run the project immediately without installing or configuring external services.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Axios, Vanilla CSS (Modern Design System) |
| **Backend** | Node.js, Express.js, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, `cookie-parser`, `cors` |
| **Payment Gateway** | Razorpay SDK |
| **Database** | MongoDB (Local / Atlas / Embedded in-memory fallback) |

---

## 📂 Project Directory Structure

```text
MERN-ENDTERM/
├── .gitignore                      # Excludes node_modules, .env, build outputs
├── README.md                       # Complete documentation & setup guide
│
├── backend/
│   ├── config/
│   │   └── razorpay.js             # Razorpay client instance
│   ├── controllers/
│   │   ├── customer.controller.js  # Auth & customer operations
│   │   ├── product.controller.js   # Product CRUD & search
│   │   ├── cart.controller.js      # Cart management
│   │   ├── wishlist.controller.js  # Wishlist toggle & fetch
│   │   └── order.controller.js     # Order placement & history
│   ├── middlewares/
│   │   └── auth.middleware.js      # JWT cookie authentication check
│   ├── models/
│   │   ├── customer.model.js       # Customer schema
│   │   ├── product.model.js        # Product schema
│   │   └── order.model.js          # Order schema
│   ├── routes/
│   │   ├── customer.routes.js      # Customer endpoints (/customers)
│   │   ├── product.routes.js       # Product endpoints (/products)
│   │   ├── cart.routes.js          # Cart endpoints (/cart)
│   │   ├── wishlist.routes.js      # Wishlist endpoints (/wishlist)
│   │   └── order.routes.js         # Order endpoints (/orders)
│   ├── utils/
│   │   ├── generateToken.js        # Signs JWT & sets HttpOnly cookie
│   │   └── seedData.js             # Initial product catalog seeder
│   ├── index.js                    # Server entry, DB connection, auto-fallback
│   ├── .env.example                # Template for backend environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx          # Top navigation with live cart count & auth state
    │   │   ├── ProductCard.jsx     # Product card with cart/wishlist quick-actions
    │   │   ├── CartItem.jsx        # Cart item row with quantity adjusters
    │   │   ├── WishlistCard.jsx    # Wishlist item display
    │   │   ├── SearchBar.jsx       # Real-time search & filters
    │   │   └── AddProductModal.jsx # Add new product modal dialog
    │   ├── context/
    │   │   └── CartContext.jsx     # Global Cart state & operations provider
    │   ├── pages/
    │   │   ├── Home.jsx            # Featured hero, categories, recent products
    │   │   ├── Products.jsx        # Complete product catalog with filters
    │   │   ├── ProductDetails.jsx  # Single product view & specs
    │   │   ├── Cart.jsx            # Shopping cart overview
    │   │   ├── Checkout.jsx        # Checkout & payment processing
    │   │   ├── Orders.jsx          # User order history
    │   │   ├── OrderDetails.jsx    # Individual order breakdown
    │   │   ├── OrderSuccess.jsx    # Order confirmation screen
    │   │   ├── Wishlist.jsx        # Saved wishlist items
    │   │   ├── Login.jsx           # Customer login
    │   │   └── Register.jsx        # Customer registration
    │   ├── services/
    │   │   └── api.js              # Axios client configured with withCredentials
    │   ├── App.jsx                 # Client routing & layouts
    │   ├── main.jsx                # Application root entry
    │   └── index.css               # Design system & responsive styles
    ├── .env.example                # Template for frontend environment variables
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Optional: if not running locally, backend automatically falls back to an embedded in-memory database)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/syntax-santhosh/MERN-ENDTERM.git
cd MERN-ENDTERM
```

---

### Step 2: Backend Setup

1. Open a terminal and enter the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   # On Windows PowerShell:
   # Copy-Item .env.example .env
   ```

4. Verify your `backend/.env` contents:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/shopkart
   JWT_SECRET=shopkart_secret_key_12345
   FRONTEND_URL=http://localhost:5173
   RAZORPAY_KEY_ID=rzp_test_shopkart1234
   RAZORPAY_KEY_SECRET=test_secret_shopkart1234
   ```
   > **Note:** If you don't have MongoDB installed or running locally, simply leave `MONGO_URI` as-is. The backend will automatically detect this and start an embedded in-memory MongoDB server.

5. Start the backend:
   ```bash
   npm run dev
   # or
   npm start
   ```
   You will see:
   ```text
   ✅ Connected to MongoDB successfully
   🚀 ShopKart Backend running on http://localhost:5000
   ```

---

### Step 3: Frontend Setup

1. Open a **new terminal** window and enter the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create `frontend/.env` if customizing the backend URL:
   ```bash
   cp .env.example .env
   ```
   Default `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```text
   http://localhost:5173
   ```

---

## 📡 REST API Reference

All requests and responses use JSON. Authenticated endpoints read credentials from the HttpOnly `token` cookie.

### 👤 Authentication & Customer
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/customers/register` | Register a new customer | No |
| `POST` | `/customers/login` | Login and receive HttpOnly cookie | No |
| `GET` | `/customers/me` | Fetch currently authenticated profile | **Yes** |
| `POST` | `/customers/logout` | Clear session cookie | **Yes** |
| `PATCH`| `/customers/change-password` | Update account password | **Yes** |

### 📦 Products
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | List all products (with optional search/filters) | No |
| `GET` | `/products/:id` | Get details of a single product | No |
| `POST` | `/products` | Create a new product | **Yes** |

### 🛒 Cart
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/cart` | Fetch user's cart | **Yes** |
| `POST` | `/cart/add` | Add product to cart or increment quantity | **Yes** |
| `PUT` | `/cart/update` | Update item quantity in cart | **Yes** |
| `DELETE`| `/cart/remove/:productId` | Remove specific item from cart | **Yes** |
| `DELETE`| `/cart/clear` | Clear all items in cart | **Yes** |

### ❤️ Wishlist
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/wishlist` | Fetch customer's wishlist | **Yes** |
| `POST` | `/wishlist/toggle` | Toggle item in/out of wishlist | **Yes** |

### 📑 Orders & Checkout
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders/create-razorpay-order` | Initiate Razorpay payment order | **Yes** |
| `POST` | `/orders` | Place confirmed order | **Yes** |
| `GET` | `/orders` | Fetch user's order history | **Yes** |
| `GET` | `/orders/:id` | Fetch specific order details | **Yes** |

---

## 🔒 Security & Best Practices Implemented

1. **Zero Secret Leaks**: All credentials (`.env`) are strictly excluded via `.gitignore`. Templates are supplied via `.env.example`.
2. **HttpOnly Cookies**: Prevents client-side scripts from reading tokens (`XSS` mitigation).
3. **CORS Whitelisting**: Strict origin specification (`FRONTEND_URL`) with `credentials: true`.
4. **Mongoose Sanitization**: Validates schema fields and prevents NoSQL injection.
5. **Clean MVC Separation**: Clear boundaries across controllers, models, routes, middlewares, and services.

---

## 🎓 Viva & Architecture Reference

- **Why `HttpOnly` cookie instead of `localStorage` for JWT?**
  - Storing JWTs in `localStorage` leaves tokens vulnerable to theft via Cross-Site Scripting (XSS). An `HttpOnly` cookie is inaccessible to JavaScript running in the browser and is automatically sent by the browser on requests.
- **Why is `withCredentials: true` required on Axios?**
  - By default, cross-origin HTTP requests do not transmit cookies. Enabling `withCredentials: true` ensures the browser includes the session cookie with cross-origin requests.
- **Why one-way hashing with bcrypt?**
  - Passwords should never be reversible. Bcrypt uses a cryptographic salt and slow hashing algorithm to resist rainbow table and brute-force attacks.

---

## 👨‍💻 Author
- **Syntax Santhosh**
- GitHub: [@syntax-santhosh](https://github.com/syntax-santhosh)
