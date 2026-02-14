# EVBnB Backend

Backend server for EVBnB - an EV charging station rental platform.

## Tech Stack

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **CORS** enabled for cross-origin requests

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or remote instance)

## Installation

1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the Backend directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/evbnb
   ```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` by default.

## API Endpoints

| Resource       | Base Route            |
|----------------|----------------------|
| Listings       | `/api/listings`      |
| Reservations   | `/api/reservations`  |
| Schedules      | `/api/schedules`     |
| Users          | `/api/users`         |
| Sessions       | `/api/sessions`      |
| Transactions   | `/api/transactions`  |

### Health Check
- `GET /api/health` - Check server status
- `GET /api/ping` - Simple ping endpoint

## Project Structure

```
Backend/
├── index.js              # Entry point
├── package.json
├── controllers/          # Request handlers
│   ├── listingController.js
│   ├── reservationController.js
│   ├── scheduleController.js
│   ├── sessionController.js
│   ├── transactionController.js
│   └── userController.js
├── models/               # Mongoose schemas
│   ├── Listing.js
│   ├── Reservation.js
│   ├── Schedule.js
│   ├── Session.js
│   ├── Transaction.js
│   └── User.js
└── routes/               # API route definitions
    ├── listings.js
    ├── reservations.js
    ├── schedules.js
    ├── sessions.js
    ├── transactions.js
    └── users.js
```
