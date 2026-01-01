# Routinely - Personal Habit Tracker

A full-stack personal habit tracking application to monitor daily routines including budget, gym streaks, DSA practice, and German language learning.

## Features

- **Budget Tracker**: Track income and expenses with categories, budgets, and visualizations
- **Gym Streak**: Monitor gym sessions, workout types, duration, and maintain streaks
- **DSA Tracker**: Track solved problems, platforms, difficulty levels, and topics
- **German Language Streak**: Monitor study sessions, lessons completed, vocabulary, and time spent

## Tech Stack

### Frontend
- React 18 with Vite
- TailwindCSS for styling
- Clerk for authentication
- Recharts for data visualizations

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Clerk for authentication

### Deployment
- Docker for containerization
- Render for hosting
- MongoDB Atlas for database

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (or MongoDB Atlas)
- Docker (optional, for containerized setup)
- Clerk account (for authentication)

### Environment Variables

#### Backend (.env in backend/)
```
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env in frontend/)
```
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### Installation

1. Clone the repository
2. Install root dependencies: `npm install`
3. Install backend dependencies: `cd backend && npm install`
4. Install frontend dependencies: `cd frontend && npm install`
5. Set up environment variables in both frontend and backend
6. Start MongoDB (or use MongoDB Atlas)
7. Run the development servers: `npm run dev`

### Docker Setup

```bash
docker-compose up
```

This will start MongoDB, backend, and frontend services.

## Project Structure

```
routinely/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── docker-compose.yml # Docker orchestration
└── README.md
```

## License

ISC
