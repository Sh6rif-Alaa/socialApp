# Social App 💬

A Node.js backend application - a social media platform where users can manage their profiles and authenticate securely.

## 📋 Features

- **User Authentication** - Secure signup and signin with JWT tokens
- **Email Verification** - OTP-based email verification for enhanced security
- **Password Recovery** - Secure password reset with OTP verification
- **Email Notifications** - Automated email delivery for verification codes and OTP
- **Token Management** - JWT access and refresh tokens
- **Secure Password Storage** - Bcrypt encryption for password security
- **Input Validation** - Comprehensive Zod-based validation for all API requests
- **Rate Limiting** - API request rate limiting for protection against abuse
- **HTTP Security** - Security headers via Helmet middleware
- **Caching & Sessions** - Redis-based caching for improved performance

## 🛠️ Technologies

- **Node.js** - Runtime environment
- **Express.js v5.2** - Web framework with enhanced error handling and native error middleware support
- **MongoDB** - NoSQL database
- **Mongoose v9.x** - MongoDB object modeling and schema validation
- **JWT (jsonwebtoken)** - JSON Web Tokens for authentication
- **Bcrypt v6.x** - Secure password hashing and verification
- **CORS** - Cross-Origin Resource Sharing middleware
- **Helmet** - HTTP headers security middleware
- **express-rate-limit** - Rate limiting middleware for API protection
- **Nodemailer** - Email sending for notifications and OTP delivery
- **Redis v5.x** - In-memory data store for caching and session management
- **dotenv** - Environment variable management
- **cross-env** - Cross-platform environment variable setting
- **zod** - Data validation and schema description language

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas cloud instance)
- Redis Server
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Sh6rif-Alaa/socialApp.git
cd socialApp
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.development
```

Edit `.env.development` with your configuration.

4. **Run the application**

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000` (or your specified PORT)

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register a new user | No |
| POST | `/auth/signin` | Login user | No |
| POST | `/auth/reSendOtp` | Resend OTP code | No |
| PATCH | `/auth/verifyEmail` | Verify email with OTP | No |
| PATCH | `/auth/forget-password` | Request password reset | No |
| PATCH | `/auth/reset-password` | Reset password using OTP | No |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/user/refreshToken` | Exchange refresh token for access token | Yes |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication with both access and refresh tokens.

### Token Management

- **Access Token**: Short-lived for API access
- **Refresh Token**: Long-lived for obtaining new access tokens
- Use the `/user/refreshToken` endpoint to get new access tokens when they expire. Provide your refresh token in the Authorization header.

```
Authorization: <Bearer_or_your_prefix> <your_token_here>
```

## 🔧 Development

### Scripts

- `npm start` - Start the production server (`NODE_ENV=development` with `tsc` and `node`)
- `npm run dev` - Start the development server with nodemon running concurrently with typescript watcher

### Error Handling

The application uses global error middleware. All errors are caught and returned in a consistent format:

```json
{
  "message": "Error message",
  "stack": "Error stack trace (in development)"
}
```

## ✅ Validation

The API uses **zod** for comprehensive input validation on all endpoints.

### Custom Validation Response

When validation fails, the API returns a 400 status with detailed error information:

```json
{
  "message": "validation error",
  "error": [
    {
      "key": "body",
      "message": "email must be a valid email",
      "path": "email",
      "type": "string.email"
    }
  ]
}
```

## 🌍 Environment Variables

The application supports multiple environments:

```bash
npm run dev
# NODE_ENV=development
```

### Environment Files
- `.env.development` - Development-specific variables

All environment files are listed in `.gitignore` for security.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

[@Sh6rif-Alaa](https://github.com/Sh6rif-Alaa)