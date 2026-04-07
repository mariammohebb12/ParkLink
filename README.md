# ParkLink – Smart Parking System

ParkLink is a smart parking management system that uses QR codes to automate vehicle entry, exit, and billing. The system is designed to reduce manual work and improve parking efficiency.

---

## Features

* Register cars with unique QR codes
* Scan QR code for entry and exit
* Automatic parking session tracking
* Dynamic price calculation based on time
* Payment tracking system
* Notifications for entry and exit
* Admin management system

---

## Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### Frontend

* React (Vite)

---

## Project Structure

```
ParkLink/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── seed.js
│   ├── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│
├── README.md
├── .gitignore
```

---

## Installation & Setup

### 1. Clone the repository

```
git clone https://github.com/your-username/ParkLink.git
cd ParkLink
```

---

### 2. Setup Backend

```
cd backend
npm install
```

Create a `.env` file inside backend:

```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Run backend:

```
npm start
```

---

### 3. Setup Frontend

```
cd frontend
npm install
npm run dev
```

---

## How It Works

1. A car is registered and assigned a unique QR code
2. At entry, the QR is scanned and a parking session starts
3. At exit, the QR is scanned again and the session ends
4. The system calculates parking duration and price
5. Payment is recorded

---

## API Endpoints (Examples)

* `POST /api/cars` → Add new car
* `POST /api/scan/:qrId` → Scan QR (entry/exit)
* `GET /api/sessions` → Get parking sessions
* `POST /api/payment` → Process payment

---

## Environment Variables

Create a `.env` file in backend:

```
MONGO_URI=your_database_url
PORT=5000
```

---

## Notes

* `node_modules` is not included (run `npm install`)
* `.env` is ignored for security reasons

---

## Author

Mariam Ahmed Moheb
Computer Science Student – ESLSCA University

---

## Future Improvements

* Mobile app integration
* Real-time parking availability
* AI-based parking predictions
* Online payment gateway

---

