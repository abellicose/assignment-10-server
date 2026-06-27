# Property Rental & Booking Platform — Server

Express + MongoDB REST API for the Property Rental & Booking Platform. Handles
authentication, role-based access control, property management, bookings,
Stripe payments, reviews, and favorites.

## Live API

https://assignment-10-server-two-eta.vercel.app

## Repositories

- Client: https://github.com/abellicose/assignment-10-client
- Server: https://github.com/abellicose/assignment-10-server

## Tech Stack

- Express
- MongoDB (native driver)
- JSON Web Token (JWT)
- Stripe
- CORS, cookie-parser, dotenv

## Roles

- **Tenant** — browse, favorite, book and pay, review
- **Owner** — list and manage properties, handle booking requests, view analytics
- **Admin** — moderate properties, manage users and roles, monitor bookings and transactions

## Environment Variables

Create a `.env` file based on `.env.example`:

```
PORT=5000
DB_USER=your_db_user
DB_PASS=your_db_password
ACCESS_TOKEN_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
CLIENT_URL=http://localhost:3000
```

## Scripts

```bash
npm install
npm run dev    # nodemon
npm start      # node
```

## API Overview

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/jwt` | Public | Issue JWT for an email |
| PUT | `/users` | Public | Upsert user on login (default role Tenant) |
| GET | `/users` | Admin | List all users |
| PATCH | `/users/role/:id` | Admin | Change a user role |
| GET | `/properties` | Public | Search/filter/sort/paginate approved properties |
| GET | `/properties/featured` | Public | 6 latest approved properties |
| POST | `/properties` | Owner | Create a property (Pending) |
| PATCH | `/properties/status/:id` | Admin | Approve/Reject with feedback |
| POST | `/bookings` | Tenant | Create a booking |
| GET | `/bookings/requests` | Owner | Paid booking requests |
| PATCH | `/bookings/status/:id` | Owner | Approve/Reject booking |
| POST | `/payments/create-intent` | Tenant | Stripe payment intent |
| POST | `/payments/confirm` | Tenant | Confirm payment, save transaction |
| GET | `/payments/owner-stats` | Owner | Earnings + 12-month chart data |
| GET | `/payments/transactions` | Admin | All transactions |
| GET | `/reviews` | Public | Top reviews |
| GET/POST/DELETE | `/favorites` | Tenant | Manage favorites |

## npm Packages

`express`, `mongodb`, `jsonwebtoken`, `stripe`, `cors`, `cookie-parser`,
`dotenv`, `nodemon` (dev).
