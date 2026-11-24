# MERN Stack Blog Project

A simple, clean, and beginner-friendly full-stack blogging web application built with the MERN stack (MongoDB, Express, React, Node.js).

---

## 📁 Project Architecture

```
blog-project/
├── client/
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components (Navbar, Footer, PostCard, CommentBox, etc.)
│       ├── pages/          # Application views (Home, Login, Register, CreatePost, PostDetails, Profile)
│       │   └── admin/      # Admin dashboard pages
│       ├── App.jsx         # Main router and layout
│       ├── App.css         # Custom styling
│       ├── index.js        # React root renderer
│       └── index.css       # Global styling & Tailwind CSS
├── server/
│   ├── config/             # Database connection (db.js)
│   ├── controllers/        # Request handlers (authController.js, postController.js, etc.)
│   ├── middleware/         # Auth verification (authMiddleware.js)
│   ├── models/             # Mongoose schemas (User.js, Post.js, Category.js, etc.)
│   ├── routes/             # API routes (authRoutes.js, postRoutes.js, etc.)
│   ├── .env                # Environment variables
│   └── server.js           # Express app entry point
├── .gitignore
└── README.md
```

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Vite, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB & Mongoose
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs

---

## 🚀 How to Run the Project

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed
- MongoDB installed locally or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI

### 2. Configure Environment Variables
Inside `server/.env` (or root `.env`):
```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
DEFAULT_ADMIN_EMAIL=admin@gmail.com
DEFAULT_ADMIN_PASSWORD=admin@1234
CLIENT_ORIGIN=http://localhost:3000
```

### 3. Run the Backend Server
In your first terminal:
```bash
# If using real MongoDB:
npm run server
# or: cd server && npm start

# If using local in-memory MongoDB (no MongoDB install needed):
npm run server:dev
```
The server will run on `http://localhost:4000`.

### 4. Run the Frontend Client
In your second terminal:
```bash
npm run client
# or: cd client && npm run dev
```
The React app will open on `http://localhost:3000`.

---

## 🔑 Default Admin Account
- **Email**: `admin@gmail.com`
- **Password**: `admin@1234`
- **Role**: Admin (accesses `/admin` dashboard)
