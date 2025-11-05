# Xash Platform - React Web Application

A modern, dark-themed React application for the Xash Platform with authentication, transaction history, commissions tracking, and profile management.

## 🚀 Features

- **User Authentication** (Register, Login, Set Password, Logout)
- **Transaction History** with filtering and search
- **Commissions Tracking** with detailed breakdown
- **Profile Management** with API key regeneration
- **Dark Theme** with blue and violet accent colors
- **Responsive Design** for all devices
- **Production Ready** with environment configuration

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Build Tool**: Vite

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 14 or higher)
- **npm** or **yarn** package manager

## 🏃‍♂️ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd xash-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Development Environment
VITE_APP_ENV=development
VITE_API_BASE_URL=https://xvdev.xash.co.zw/api/v1
VITE_USE_DUMMY_DATA=true
```

For production, create a `.env.production` file:

```env
# Production Environment
VITE_APP_ENV=production
VITE_API_BASE_URL=https://xv.xash.co.zw/api/v1
VITE_USE_DUMMY_DATA=false
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### 6. Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── ui/            # Reusable UI components
│   └── layout/        # Layout components
├── pages/             # Page components
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
└── assets/            # Static assets
```

## 🔐 Authentication Flow

1. **Registration**: Users register with personal details
2. **Set Password**: Users set their password after registration
3. **Login**: Users login with user number and password
4. **Resend User Number**: Option to resend user number if forgotten

## 🎨 Design System

- **Primary Color**: Blue (#0ea5e9)
- **Secondary Color**: Violet (#7c3aed)
- **Background**: Dark gray (#111827)
- **Text**: Light gray variants

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 API Integration

The application supports two modes:

### Development Mode (Dummy Data)
- Uses mock API responses
- Simulates real API behavior
- No actual network calls to Xash API

### Production Mode (Real API)
- Makes actual API calls to Xash endpoints
- Requires valid API credentials
- Uses real user data

## 📱 Responsive Breakpoints

- **sm**: 640px and above
- **md**: 768px and above
- **lg**: 1024px and above
- **xl**: 1280px and above

## 🔄 State Management

- **Authentication**: Managed via React Context
- **API Calls**: Centralized in `utils/api.js`
- **Form State**: Local component state

## 🛡️ Security Features

- JWT Token-based authentication
- Secure password requirements
- API key management with regeneration
- Input validation and error handling

## 📊 Pages Overview

- **Dashboard**: Overview with quick stats and recent activity
- **History**: Transaction history with filtering
- **Commissions**: Commission earnings and history
- **Profile**: User profile and API key management

## 🎯 Key Components

### Authentication
- `Login.jsx` - User login form
- `Register.jsx` - User registration form
- `SetPassword.jsx` - Password setup form
- `ResendUserNumber.jsx` - User number recovery

### UI Components
- `Button.jsx` - Reusable button with variants
- `Input.jsx` - Form input with validation
- `Card.jsx` - Container component

### Pages
- `Dashboard.jsx` - Main dashboard with overview
- `History.jsx` - Transaction history
- `Commissions.jsx` - Commission tracking
- `Profile.jsx` - User profile management

## 🔌 API Endpoints Used

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/set-password` - Set user password
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/resend-user-number/{phone}` - Resend user number

### Data
- `GET /reports/history/{currency}` - Transaction history
- `GET /reports/commissions` - Commission data

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   ```

2. **Dependencies issues**
   ```bash
   npm install --force
   # or
   rm -rf node_modules package-lock.json && npm install
   ```

3. **Environment variables not loading**
   - Ensure `.env` file is in root directory
   - Restart development server after changes

4. **Build errors**
   ```bash
   npm run build -- --debug
   ```

## 📞 Support

For technical support or questions:
- Email: support@xash.co.zw
- API Documentation: https://vdocs.xash.co.zw

## 📄 License

This project is proprietary and owned by Xash Solutions.

---

**Happy Coding!** 🎉