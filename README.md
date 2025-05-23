# Chat Backend

A real-time chat application backend built with Node.js, Express, PostgreSQL, and Socket.IO.

## Database Design

[View database diagram](https://drive.google.com/file/d/1X16z_1eKzXC7LDAlCuvv8l5FkLzcYG_P/view?usp=sharing)

## Features

- User authentication (register, login, logout)
- Email verification
- Password reset functionality
- User profile management
- Real-time messaging with Socket.IO
- Direct and group conversations
- Message typing indicators , File attachments
- Group conversation management

## Installation & Setup

1. **Clone the repository**

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment variables**

   - Copy `.env.example` to `.env`
   - Configure environment variables as needed

4. **Start Docker containers**

   ```bash
   docker compose up
   ```

   This will start:

   - PostgreSQL database
   - Adminer (for database management)
   - MailHog (for development email testing)

5. **Database setup**
   ```bash
   npm run db
   ```
   This will run migrations and seed the database

## Usage

**Start development server**

```bash
npm run dev
```

The server will start at `http://localhost:3000` (or the port specified in your .env file)

## API Documentation

API documentation is available via Swagger UI at:

```
http://localhost:3000/api-docs
```

## Available Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/verify-email` - Email verification
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### User Management

- `GET /api/v1/user/me` - Get current user profile
- `GET /api/v1/user/:id` - Get user by ID
- `PATCH /api/v1/user/:id` - Update user profile
- `POST /api/v1/user/update-password` - Update password

### Conversations

- `GET /api/v1/conversation` - Get all conversations
- `GET /api/v1/conversation/:id` - Get conversation by ID
- `POST /api/v1/conversation/direct` - Create direct conversation
- `POST /api/v1/conversation/group` - Create group conversation
- `PATCH /api/v1/conversation/:id` - Update group details
- `DELETE /api/v1/conversation/:id` - Delete conversation

### Messages

- `POST /api/v1/message` - Create message
- `GET /api/v1/message/conversation/:conversationId` - Get conversation messages
- `PATCH /api/v1/message/:messageId` - Update message
- `DELETE /api/v1/message/:messageId` - Delete message

## Project Structure

The project follows a modular structure:

```
src/
├── modules/           # Feature modules
│   ├── auth/          # Authentication
│   │   ├── auth.controller.ts       # Handles authentication-related requests
│   │   ├── auth.routes.ts           # Defines routes for authentication
│   │   ├── auth.schema.ts           # Validation schema for authentication requests
│   │   ├── auth.service.ts          # Business logic for authentication
│   │   ├── userToken.model.ts       # Defines UserToken model/schema
│   ├── user/          # User management
│   ├── conversation/  # Conversations
│   └── message/       # Messages
├── middlewares/       # Express middlewares
├── utils/             # Utility functions
└── app.ts             # Application entry point
```

## Authentication

The application uses stateless JWT authentication. Tokens are provided upon login and must be included in the Authorization header for protected routes.

## Available Scripts

- `npm run dev` - Run development server
- `npm run build` - Build production code
- `npm run start` - Run production server
- `npm run lint` - Run ESLint
- `npm run db` - Run migrations and seed database
- `npm run db:reset` - Drop, create, and seed database
- `npm run db:refresh` - Reset migrations and run again
