# Bookipi

<img width="703" height="783" alt="Screenshot 2025-09-28 at 8 29 57 PM" src="https://github.com/user-attachments/assets/4abbeabc-1fd6-459f-8ccc-25bf187a69bc" />


### 1. Clone the repository

```bash
git clone <repository-url>
cd Bookipi
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=yourpassword
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres3
POSTGRES_DB=BOOKIPI
JWT_SECRET=your-jwt-secret-key
```

### 3. Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file in the Frontend directory with your API base URL.

```
VITE_SECRET=yoursecret
```

### 4. Start Infrastructure Services

```bash
cd backend
docker-compose up -d
```

This will start PostgreSQL and Redis containers.

## Running the Application

### Development Mode

**Backend:**

```bash
cd backend
npm run start:dev
```

The API will be available at `http://localhost:3000`

**Frontend:**

```bash
cd Frontend
npm run start:dev
```

The web application will be available at `http://localhost:5173`

A full-stack e-commerce application with flash sales functionality, built with NestJS backend and React frontend.

**System Architecture Diagram**
<img width="1680" height="1050" alt="Screenshot 2025-09-28 at 10 42 55 PM" src="https://github.com/user-attachments/assets/3b9d2dcd-bcf5-4282-96ff-86e57fe5c244" />

**Sequence Diagram: Creating an Order**
<img width="1680" height="1050" alt="Screenshot 2025-09-28 at 10 45 07 PM" src="https://github.com/user-attachments/assets/29203b2b-a94f-47f9-b6d0-b9f7bc245f27" />


# How to test

- Create a new user by calling this endpoint localhost:{port}/users/create
- Body

```json
{
  "username": "testuser",
  "password": "testpassword",
  "email": "test@test.com"
}
```

- Login by calling this endpoint localhost:{port}/users/signin
- Body

```json
{
  "username": "testuser",
  "password": "testpassword"
}
```

- Create a product by calling this endpoint localhost:{port}/orders/create
- Body. This doesn't need the access token because this is supposed to be handled by an admin

```json
{
  "name": "AirPod Max",
  "stock": 50,
  "price": 50
}
```

- Create a flash sale by calling this endpoint localhost:{port}/flash-sales/create
- Body. This also do not require an access token, because this is supposed to be taken care by an admin, but for this app, we wont be catering for an admin.

The access token is automatically added in the header in the Frontend app.

```json
{
  "startDate": "2025-09-28",
  "endDate": "2025-09-28",
  "productId": "fc89a914-18d7-47da-8f96-93ea347918b1"
}
```

- To create an order paste the access token from the signed in user response in the header and call localhost:{port}/orders/create endpoint
- Body. The product ID is the id of the product created initially.

```json
{
  "productId": "fc89a914-18d7-47da-8f96-93ea347918b1"
}
```

## Functional requirements

- **Flash sale period**: The flashsale period is configurable by calling this patch endpoint localhost:3000/flash-sales/cd6adeb9-b513-4182-9cd5-53d945c90de5
- Body

```json
{
  "startDate": "2025-09-28",
  "endDate": "2025-09-28"
}
```

- To ensure that order can only be bought within the start and end date window, the application uses a flashSaleGuard to enforce this rule and returns an error accordingly

- **Single Product, Limited stock**: Even though the application allow for creation of several products, it only returns the latest created product.

- **One Item Per user**: The application only allows one product per user by checking the order db againt the current product and the userId

**API Server**

- Endpoint to check the status of the flashsale. This is handled by checking the present day against the flashsale, startDate and endDate and it is displayed to the user on the UI
- EndPoint for a user to attempt a purchase. The create order does some validation before allowing the user make a purchase request.
- The get localhost:3000/orders/ endpoint checks for the for the user purchased order.
  **Frontend**
- A user can see the status of their purchase
- A user sees a feedback on if their purchase attempt was successful.
- The current status of the flash sale is displayed for the user to see, also the duration and a countdown timer.

**High Concurrency Handling**

- Initial Cache Check (Optimistic): Before hitting the database, the service first checks the stock count in Redis. It uses Redis's atomic DECR command.
- If the result is less than 0, the request is rejected immediately without touching the database. This filters out the majority of requests when stock is depleted.

- Start Database Transaction: If the cache check passes, the service begins a database transaction to ensure atomicity.

- Pessimistic Locking: The service reads the product's stock count from the database using a pessimistic lock (e.g., SELECT stock FROM products WHERE id = :productId FOR UPDATE). This lock prevents any other transaction from reading or writing to that specific row until the current transaction is completed.

- Final Validation: The code checks if the stock read from the database is > 0.
  Commit or Rollback:
  If stock > 0, the service creates the Order record and executes an UPDATE products SET stock = stock - 1 .... It then commits the transaction, releasing the lock.
- If stock <= 0 (because another transaction got the lock first), the service rolls back the transaction and returns an "Out of Stock" error. It would also update Redis to reflect the zero stock to prevent future database hits.

- The application uses Redis and Bull queue to handle high concurrency during flash sales.

- **Order Processing**: Orders are processed asynchronously using a job queue to ensure reliability and performance

- **User Authentication**: Users can register and login to the application. JWT is used for authentication.

**Stress Test**

- The application was stress tested using Artillery. You can find the script in the root directory named flashsale.yml. To perform stress test

```bash
cd Backend
artillery run stress.yml --output test-report.json
```

## Features

## Features

- **Product Management**: Create, read, update, and delete products
- **Flash Sales**: Time-limited sales events with special pricing
- **User Authentication**: JWT-based authentication system
- **Order Processing**: Complete order management with queue processing
- **Real-time Caching**: Redis integration for improved performance
- **Purchase Tracking**: Comprehensive purchase history and analytics

## Tech Stack

### Backend

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis
- **Queue**: Bull (Redis-based job queue)
- **Authentication**: JWT
- **Validation**: Class Validator & Joi

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: React Bootstrap
- **State Management**: React Query
- **Forms**: React Hook Form with Zod validation
- **Styling**: Styled Components
- **Routing**: React Router DOM

## Project Structure

```
Bookipi/
├── backend/           # NestJS API server
│   ├── src/
│   │   ├── common/           # Shared utilities and constants
│   │   ├── fash-sales/       # Flash sales module
│   │   ├── infrastructure/   # Database, cache, and guards
│   │   ├── orders/          # Order management
│   │   ├── products/        # Product management
│   │   ├── purchases/       # Purchase tracking
│   │   └── users/           # User management and auth
│   └── docker-compose.yml   # Database and Redis setup
└── Frontend/          # React client application
    └── src/
        ├── components/      # Reusable UI components
        ├── contexts/        # React contexts
        ├── hooks/          # Custom hooks
        ├── pages/          # Route components
        └── apis/           # API integration
```

## Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- npm or yarn

## Installation

## API Endpoints

### Authentication

- `POST /users/register` - User registration
- `POST /users/login` - User login

### Products

- `GET /products` - List all products
- `POST /products` - Create new product
- `GET /products/:id` - Get product by ID
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Flash Sales

- `GET /flash-sales` - List active flash sales
- `POST /flash-sales` - Create flash sale
- `GET /flash-sales/:id` - Get flash sale details

### Orders

- `POST /orders` - Create new order
- `GET /orders` - List user orders
- `GET /orders/:id` - Get order details


### Backend Tests

```bash
cd backend
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Test coverage
```

### Frontend Tests

```bash
cd Frontend
npm run lint          # ESLint checks
```

## Database Migrations

- You may not need to run migration because I made these properties true for testing purposes in prod this should be made false.

```bash
autoLoadEntities: true,
synchronize: true,
```

## License

This project is licensed under the UNLICENSED License.
