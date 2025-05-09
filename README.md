# Self-Improvement Tracker API

A comprehensive backend API for a self-improvement tracking application that helps users manage behaviors, todos, and track their progress.

## Features

### Core Features
- **User Authentication**: Register, login, and JWT authentication
- **Behavior Management**: Create, read, update, and delete behaviors
- **Todo Management**: Add, update, delete, and toggle todos for each behavior
- **Top Behaviors**: Get top 5 behaviors with the most todo items

### Bonus Features (for selection)
- **JWT Refresh Tokens**: Enhanced security with token refresh mechanism
- **User Preferences**: Dark/light mode and language preferences
- **Advanced Statistics**: User and behavior-specific statistics and analytics
- **Achievement System**: Gamification with unlockable achievements
- **Streak Tracking**: Monitor consistent daily activity
- **Rate Limiting**: API protection against abuse
- **Password Reset**: Secure password recovery flow
- **Theme Support**: Dark/light mode across the application

## Tech Stack

- **Node.js & Express**: Fast, unopinionated, minimalist web framework
- **MongoDB & Mongoose**: NoSQL database with elegant ODM
- **JWT Authentication**: Secure, stateless authentication
- **Rate Limiting**: Protection against abuse
- **Statistics & Analytics**: User progress tracking
- **Gamification**: Achievement system to increase engagement

## Installation and Setup

### Prerequisites
- Node.js (v14+ recommended)
- MongoDB (local instance or MongoDB Atlas)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd self-improvement-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file with the following:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/self-improvement-app
   JWT_SECRET=your_secure_jwt_secret
   JWT_EXPIRE=30d
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## API Documentation

### Authentication Endpoints

#### Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**: 
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: User data and JWT tokens (access + refresh)

#### Login User
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**: 
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: User data and JWT tokens (access + refresh)

#### Refresh Token
- **URL**: `/api/auth/refresh-token`
- **Method**: `POST`
- **Body**: 
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```
- **Response**: New access and refresh tokens

#### Get Current User
- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer your-access-token`
- **Response**: Current user data

#### Update User Details
- **URL**: `/api/auth/updatedetails`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer your-access-token`
- **Body**: 
  ```json
  {
    "name": "Updated Name",
    "email": "updated@example.com"
  }
  ```
- **Response**: Updated user data

#### Update User Preferences
- **URL**: `/api/auth/preferences`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer your-access-token`
- **Body**: 
  ```json
  {
    "theme": "dark",
    "language": "en"
  }
  ```
- **Response**: Updated user preferences

#### Update Password
- **URL**: `/api/auth/updatepassword`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer your-access-token`
- **Body**: 
  ```json
  {
    "currentPassword": "current-password",
    "newPassword": "new-password"
  }
  ```
- **Response**: User data and new JWT tokens

#### Forgot Password
- **URL**: `/api/auth/forgotpassword`
- **Method**: `POST`
- **Body**: 
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**: Success message with reset token

#### Reset Password
- **URL**: `/api/auth/resetpassword/:resettoken`
- **Method**: `PUT`
- **Body**: 
  ```json
  {
    "password": "new-password"
  }
  ```
- **Response**: User data and new JWT tokens

#### Logout
- **URL**: `/api/auth/logout`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer your-access-token`
- **Response**: Success message

### Behavior Endpoints

#### Get All Behaviors
- **URL**: `/api/behaviors`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer your-access-token`
- **Response**: List of all user behaviors

#### Get Top 5 Behaviors
- **URL**: `/api/behaviors/top`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer your-access-token`
- **Response**: Top 5 behaviors with most todos

#### Get Single Behavior
- **URL**: `/api/behaviors/:id`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer your-access-token`
- **Response**: Single behavior with todos

#### Create Behavior
- **URL**: `/api/behaviors`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer your-access-token`
- **Body**: 
  ```json
  {
    "title": "Health and Hygiene",
    "color": "#DC3545"
  }
  ```
- **Response**: Created behavior

#### Update Behavior
- **URL**: `/api/behaviors/:id`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer your-access-token`
- **Body**: 
  ```json
  {
    "title": "Updated Title",
    "color": "#28A745"
  }
  ```
- **Response**: Updated behavior

#### Delete Behavior
- **URL**: `/api/behaviors/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer your-access-token`
- **Response**: Success message

### Todo Endpoints

#### Get All Todos for a Behavior
- **URL**: `/api/behaviors/:behaviorId/todos`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer your-access-token`
- **Response**: List of todos for the behavior

#### Add Todo to Behavior
- **URL**: `/api/behaviors/:behaviorId/todos`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer your-access-token`
- **Body**: 
  ```json
  {
    "text": "Brush teeth twice daily"
  }
  ```
- **Response**: Created todo

#### Get Single Todo
- **URL**: `/api/todos/:id`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer your-access-token`
- **Response**: Single todo

#### Update Todo
- **URL**: `/api/todos/:id`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer your-access-token`
- **Body**: 
  ```json
  {
    "text": "Updated todo text",
    "completed": true
  }
  ```
- **Response**: Updated todo

#### Toggle Todo Status
- **URL**: `/api/todos/:id/toggle`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer your-access-token`
- **Response**: Updated todo with toggled completion status

#### Delete Todo
- **URL**: `/api/todos/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer your-access-token`
- **Response**: Success message

### Statistics Endpoints

#### Get User Statistics
- **URL**: `/api/stats`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer your-access-token`
- **Response**: Overall user statistics and summary

#### Get Behavior Statistics
- **URL**: `/api/stats/behaviors/:id`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer your-access-token`
- **Response**: Statistics for a specific behavior

#### Get Streak Data
- **URL**: `/api/stats/streak`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer your-access-token`
- **Response**: Current streak and history data

### Achievements Endpoints

#### Get All Achievements
- **URL**: `/api/achievements`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer your-access-token`
- **Response**: List of all achievements with earned status

#### Check for New Achievements
- **URL**: `/api/achievements/check`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer your-access-token`
- **Response**: Newly earned and all achievements

## Security Features

### JWT Authentication
- Access tokens with short expiry
- Refresh tokens for obtaining new access tokens
- Secure token handling and storage

### Password Security
- Passwords hashed using bcrypt
- Password reset functionality
- Minimum password length requirements

### API Protection
- Rate limiting to prevent abuse
- Input validation for all requests
- Proper error handling and logging

## Bonus Features Details

### 1. JWT Refresh Tokens
The application implements a secure authentication system with access tokens and refresh tokens. Access tokens have a short expiry time for security, while refresh tokens allow users to obtain new access tokens without re-authentication.

### 2. User Preferences
Users can customize their experience with:
- Theme preference (light/dark mode)
- Language preference
These settings are persisted and automatically applied across sessions.

### 3. Advanced Statistics
The system tracks various statistics:
- Overall completion rates
- Behavior-specific analytics
- Daily/weekly/monthly trends
- Streak tracking for consistent usage

### 4. Achievement System
A gamification system with unlockable achievements:
- First behavior created
- First todo completed
- Consistency streaks
- Milestone completions (10/50/100 todos)
- Behavior mastery achievements

### 5. Streak Tracking
The application monitors user consistency:
- Daily activity tracking
- Current streak counter
- Maximum streak history
- Calendar view of active days

### 6. Theme Support
Full dark/light mode support:
- Theme preference stored in user profile
- Theme information included in API responses
- Compatible with frontend implementations

## Testing

Run the included test suite:

```bash
npm test
```

## Deployment

The API is ready for deployment to platforms like:
- Heroku
- AWS
- Digital Ocean
- Google Cloud
- Azure

## License

[MIT License](LICENSE)