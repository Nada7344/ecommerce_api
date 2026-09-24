# 🛍️ E-Commerce REST API

A production-style RESTful e-commerce backend built with **Node.js, Express, and MongoDB**. Features JWT authentication with email OTP verification, Redis-backed session/OTP management, Cloudinary image uploads, a full shopping flow (cart → order → review), and an admin analytics dashboard.

> **Live API:** `https://ecommerce-api-ex23.onrender.com` *(hosted on Render's free tier — the first request after inactivity may take up to a minute to respond while the instance spins up)*

---

## ✨ Features

- **Authentication & Security**
  - JWT access/refresh token flow, separate secrets for user and admin (system) tokens
  - Email verification and password reset via OTP (One-Time Password), with expiry, max-attempt, and block limits stored in Redis
  - Token revocation on logout (refresh tokens invalidated via Redis)
  - Role-based authorization middleware (user / admin)
  - Security headers via Helmet, request rate limiting, and an explicit CORS origin allowlist

- **Catalog**
  - Categories & subcategories management
  - Product listing with filtering, search, sorting, and pagination
  - New arrivals / top sales / featured endpoints
  - Multi-image upload to Cloudinary (memory-based multer pipeline)
  - Soft delete & stock/status flags for products

- **Shopping**
  - Cart with add / update quantity / remove / sync / clear
  - A `/cart/sync` endpoint that merges a client-held cart into the authenticated user's database cart after login
  - Order creation, cancellation, and status tracking
  - Product reviews with a moderation workflow (approve/reject) and automated admin email notifications on new submissions

- **Admin Dashboard (API)**
  - Sales overview & revenue trends
  - Top-selling products
  - New user growth over time
  - User management (list, view, block/unblock)

- **Infrastructure**
  - Centralized error handling & consistent success/error response format
  - Request validation middleware (schema-based)
  - Environment-based configuration (`development` / `production`)
  - Redis used for OTP storage and token revocation

---

## 🧰 Tech Stack

| Layer            | Technology                          |
|-------------------|--------------------------------------|
| Runtime           | Node.js (ESM)                        |
| Framework         | Express.js                           |
| Database          | MongoDB + Mongoose                   |
| Cache / Sessions  | Redis                                |
| Auth              | JWT (access + refresh tokens)        |
| File Storage      | Cloudinary                           |
| Email             | Nodemailer (Gmail SMTP)              |
| Security          | Helmet, express-rate-limit, CORS     |
| Validation        | Custom schema-based middleware       |
| Hosting           | Render                               |

---

## 📁 Project Structure

src/
├── app.bootstrap.js # Express app setup, middleware, route mounting
├── main.js # Entry point
├── DB/ # Mongoose connection, Redis connection, generic repository
├── middleware/ # Auth, authorization, validation, error handling, CORS
├── common/
│ ├── services/ # Redis service, token service
│ ├── utils/ # Email, multer/Cloudinary, response helpers, exceptions
│ └── enums/
└── modules/
├── auth/ # Signup, login, OTP verification, password reset
├── user/ # Profile, addresses, admin user management
├── category/ # Categories & subcategories
├── product/ # Product catalog & admin product management
├── cart/ # Shopping cart
├── order/ # Orders
├── review/ # Product reviews
└── report/ # Admin analytics


Each module follows the same pattern: `*.controller.js` (routes), `*.service.js` (business logic), `*.validation.js` (request schemas).

---

## 🔌 API Reference

Base URL: `/`

### Auth — `/auth`
| Method | Endpoint              | Description                       |
|--------|------------------------|------------------------------------|
| POST   | `/signup`              | Register a new user                |
| PATCH  | `/verify-email`        | Verify email using OTP              |
| PATCH  | `/resend-otp`          | Resend OTP code                    |
| POST   | `/forgot-password`     | Request password reset OTP          |
| POST   | `/reset-password`      | Reset password using OTP            |
| POST   | `/login`               | Login and receive tokens            |
| POST   | `/refresh-token`       | Get a new access token              |
| POST   | `/logout`              | Revoke refresh token                |

### User — `/user`
| Method | Endpoint                          | Description                  |
|--------|-------------------------------------|--------------------------------|
| GET    | `/profile`                          | Get current user's profile     |
| PATCH  | `/profile`                          | Update profile                 |
| PATCH  | `/password`                         | Change password                |
| POST   | `/address`                          | Add address                    |
| PATCH  | `/address/:addressId`               | Update address                 |
| DELETE | `/address/:addressId`               | Delete address                 |
| GET    | `/orders`                           | Get current user's orders      |
| GET    | `/admin/users` 🔒                    | List all users (admin)         |
| GET    | `/admin/users/:userId` 🔒            | Get a user by id (admin)       |
| PATCH  | `/admin/users/:userId/block` 🔒      | Block/unblock a user (admin)   |

### Category — `/category`
| Method | Endpoint                                     | Description                     |
|--------|-------------------------------------------------|-----------------------------------|
| GET    | `/navbar`                                       | Public category list for navbar   |
| GET    | `/admin` 🔒                                      | List categories (admin)           |
| POST   | `/admin` 🔒                                      | Create category (admin)           |
| GET    | `/admin/:categoryId` 🔒                          | Get category by id (admin)        |
| PATCH  | `/admin/:categoryId` 🔒                          | Update category (admin)           |
| DELETE | `/admin/:categoryId` 🔒                          | Delete category (admin)           |
| POST   | `/admin/:categoryId/subcategory` 🔒               | Add subcategory (admin)           |
| PATCH  | `/admin/subcategory/:subCategoryId` 🔒            | Update subcategory (admin)        |
| DELETE | `/admin/subcategory/:subCategoryId` 🔒            | Delete subcategory (admin)        |

### Products — `/products`
| Method | Endpoint                            | Description                          |
|--------|----------------------------------------|-----------------------------------------|
| GET    | `/`                                    | List products (filter, search, sort, paginate) |
| GET    | `/new-arrivals`                        | Latest products                          |
| GET    | `/top-sales`                           | Best-selling products                    |
| GET    | `/:slug`                               | Get product details by slug              |
| GET    | `/admin` 🔒                             | List products (admin)                    |
| POST   | `/admin` 🔒                             | Create product (admin)                   |
| GET    | `/admin/:productId` 🔒                  | Get product by id (admin)                |
| PATCH  | `/admin/:productId` 🔒                  | Update product (admin)                   |
| DELETE | `/admin/:productId` 🔒                  | Soft-delete product (admin)              |
| PATCH  | `/admin/:productId/stock` 🔒             | Update stock (admin)                     |
| PATCH  | `/admin/:productId/status` 🔒            | Activate/deactivate product (admin)      |
| PATCH  | `/admin/:productId/flags` 🔒             | Update product flags (admin)             |

### Cart — `/cart` 🔒
| Method | Endpoint          | Description                                        |
|--------|--------------------|--------------------------------------------------------|
| GET    | `/`                | Get current user's cart                                 |
| POST   | `/`                | Add item to cart                                         |
| POST   | `/sync`            | Merge a client-held cart into the user's database cart   |
| PATCH  | `/:productId`      | Update item quantity                                     |
| DELETE | `/:productId`      | Remove item from cart                                     |
| DELETE | `/`                | Clear cart                                                |

### Orders — `/orders` 🔒
| Method | Endpoint                        | Description                    |
|--------|-------------------------------------|-----------------------------------|
| POST   | `/`                                 | Create an order from the cart      |
| GET    | `/`                                 | List current user's orders          |
| GET    | `/:orderId`                         | Get order details                   |
| PATCH  | `/:orderId/cancel`                  | Cancel an order                     |
| GET    | `/admin` 🔒                          | List all orders (admin)             |
| GET    | `/admin/:orderId` 🔒                 | Get order details (admin)           |
| PATCH  | `/admin/:orderId/status` 🔒          | Update order status (admin)         |

Order status values: `Pending`, `In Progress`, `Shipped`, `Delivered`, `Cancelled by Customer`, `Cancelled by Admin`, `Rejected`, `Refunded`.

### Reviews — `/reviews`
| Method | Endpoint                          | Description                        |
|--------|--------------------------------------|----------------------------------------|
| POST   | `/` 🔒                               | Submit a product review                |
| GET    | `/mine` 🔒                           | Get current user's reviews              |
| GET    | `/featured`                          | Get featured/top reviews                |
| GET    | `/:productId`                        | Get reviews for a product               |
| GET    | `/admin` 🔒                          | List reviews for moderation (admin)     |
| PATCH  | `/admin/:reviewId/status` 🔒          | Approve/decline a review (admin)        |

Review status values: `Pending`, `Approved`, `Declined`. Admins are notified by email whenever a new review is submitted.

### Reports — `/reports` 🔒 (admin)
| Method | Endpoint          | Description                     |
|--------|--------------------|------------------------------------|
| GET    | `/overview`        | Dashboard summary stats             |
| GET    | `/sales`           | Sales/revenue over time             |
| GET    | `/top-products`    | Best-selling products               |
| GET    | `/new-users`        | New user growth over time           |

🔒 = requires authentication (and admin role where noted)

---

## 🚀 Deployment

- **API** deployed on [Render](https://render.com) (free tier, Node web service)
- **Database** on [MongoDB Atlas](https://www.mongodb.com/atlas) (free M0 cluster)
- **Cache** on [Upstash](https://upstash.com) (free Redis)

Environment variables are configured directly on the hosting platform — never committed to the repository.


