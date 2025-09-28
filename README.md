# Bookipi Flash Sales Platform

A modern e-commerce platform specializing in time-limited flash sales, built with React, NestJS, and TypeScript.

## Features

- ⚡ Time-sensitive Flash Sales
- 🔐 User Authentication & Authorization
- 🛒 Real-time Order Processing
- 💰 Purchase Validation
- 📊 Stock Management
- ⏰ Dynamic Countdown Timers
- 🌐 RESTful API Integration

## Tech Stack

### Frontend

- React
- TypeScript
- React Bootstrap
- Axios for API integration
- React Query for state management
- React Router for navigation
- Styled Components

### Backend

- NestJS
- TypeORM
- PostgreSQL
- Redis for caching
- JWT Authentication
- Docker

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- Redis
- Docker & Docker Compose

### Installation

1. Clone the repository

```bash
git clone https://github.com/olasunkanmi-SE/Bookipi.git
cd Bookipi
```

2. Backend Setup

```bash
cd backend
npm install
```

Configure your environment variables:

```env
# .env
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url
JWT_SECRET=your_jwt_secret
PORT=3000
```

3. Frontend Setup

```bash
cd Frontend
npm install
```

### Running the Application

1. Start the Backend

```bash
cd backend
npm run start:dev
```

2. Start the Frontend

```bash
cd Frontend
npm run start:dev
```

## Architecture

### Backend Structure

```
backend/
├── src/
│   ├── common/         # Shared utilities and constants
│   ├── fash-sales/     # Flash sales module
│   ├── orders/         # Order processing
│   ├── products/       # Product management
│   ├── users/          # User authentication
│   └── infrastructure/ # Database and cache configuration
```

### Frontend Structure

```
Frontend/
├── src/
│   ├── apis/          # API integration
│   ├── components/    # Reusable components
│   ├── contexts/      # Context providers
│   ├── hooks/         # Custom hooks
│   ├── interfaces/    # TypeScript interfaces
│   └── pages/         # Route components
```

## Key Features Explained

### Flash Sales

- Time-limited sales events
- Real-time countdown timers
- Stock quantity tracking
- Purchase validation

### Order Processing

- Idempotent order creation
- Purchase validation
- Order status tracking
- User purchase history

### Authentication

- JWT-based authentication
- Protected routes
- Token refresh mechanism
- Session management

## API Endpoints

### Flash Sales

- `GET /flash-sales` - Get active flash sales
- `POST /flash-sales` - Create new flash sale (Admin)

### Orders

- `POST /orders/create` - Create new order
- `GET /orders/user` - Get user's orders

### Users

- `POST /users/signin` - User login
- `POST /users/signup` - User registration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Amazon's flash sales model
- Built for the Bookipi platform
