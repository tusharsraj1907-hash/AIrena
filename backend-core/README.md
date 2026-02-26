# GCC FUSION - Backend Core

**NestJS (TypeScript) Backend Service**

This is the core backend service for the GCC FUSION AI-Powered Hackathon Platform. It handles authentication, hackathon management, submissions, reviews, and orchestrates communication with the AI Service.

## 🏗️ Architecture

- **Framework**: NestJS 10
- **Language**: TypeScript
- **Database**: In-memory storage (replace with your preferred database)
- **Cache/Queue**: Redis (ioredis)
- **File Storage**: Azure Blob Storage (Primary)
- **Authentication**: JWT with Passport
- **API Style**: RESTful

## 📁 Project Structure

```
backend-core/
├── database/
│   └── schema.database          # Database schema
├── src/
│   ├── auth/                  # Authentication & RBAC
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── strategies/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/                 # User management
│   ├── hackathons/            # Hackathon lifecycle
│   ├── teams/                 # Team management
│   ├── submissions/           # Submission draft/final logic
│   ├── reviews/               # Offline review system
│   ├── notifications/          # Notification system
│   ├── analytics/             # Analytics & reporting
│   ├── uploads/               # File upload (Azure Blob Storage)
│   ├── common/                # Shared utilities
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── database/
│   ├── app.module.ts
│   └── main.ts
├── .env.example
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+ (optional for development)
- Azure Storage Account (for Blob Storage file uploads)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration
```

### Database Setup

```bash
# Generate in-memory storage Client
npm run database:generate

# Run migrations
npm run database:migrate

# (Optional) Open in-memory storage Studio
npm run database:studio
```

### Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3001/api/v1`

## 🔐 Authentication

### Register

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "PARTICIPANT" // Optional: PARTICIPANT, ORGANIZER, JUDGE, ADMIN
}
```

### Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PARTICIPANT",
    "status": "ACTIVE"
  }
}
```

### Protected Routes

Include the JWT token in the Authorization header:

```bash
Authorization: Bearer <accessToken>
```

## 📋 API Endpoints

### Hackathons

- `GET /api/v1/hackathons` - List all hackathons (with filters)
- `GET /api/v1/hackathons/:id` - Get hackathon details
- `POST /api/v1/hackathons` - Create hackathon (ORGANIZER only)
- `PATCH /api/v1/hackathons/:id` - Update hackathon (owner only)
- `PATCH /api/v1/hackathons/:id/status` - Update status (owner only)
- `DELETE /api/v1/hackathons/:id` - Delete hackathon (owner only)

### Submissions

- `GET /api/v1/submissions` - List submissions (with filters)
- `GET /api/v1/submissions/:id` - Get submission details
- `POST /api/v1/submissions` - Create submission (draft or final)
- `PATCH /api/v1/submissions/:id` - Update submission
- `DELETE /api/v1/submissions/:id` - Delete draft submission

### Teams

- `GET /api/v1/teams` - List teams
- `POST /api/v1/teams` - Create team
- `PATCH /api/v1/teams/:id` - Update team
- `POST /api/v1/teams/:id/members` - Add team member
- `DELETE /api/v1/teams/:id/members/:userId` - Remove team member

## 🔄 Event Lifecycle

The hackathon lifecycle is managed automatically based on dates:

1. **DRAFT** → Created by organizer
2. **PUBLISHED** → Made public
3. **REGISTRATION_OPEN** → Registration period active
4. **REGISTRATION_CLOSED** → Registration ended
5. **IN_PROGRESS** → Hackathon started
6. **SUBMISSION_OPEN** → Accepting submissions
7. **SUBMISSION_CLOSED** → Submission deadline passed
8. **JUDGING** → Under review
9. **COMPLETED** → Winners announced

Run lifecycle updates:
```bash
# This should be called periodically (cron job)
POST /api/v1/hackathons/lifecycle/update
```

## 🤖 AI Service Integration

The backend calls the AI Service for:

1. **AI Mentor** - Chat-based guidance for participants
2. **AI Analyzer** - Automatic submission review and scoring

AI Service URL is configured via `AI_SERVICE_URL` environment variable.

## 📝 Submission Flow

1. **Draft Submission**: User creates a draft (`isDraft: true`)
2. **Final Submission**: User marks as final (`isFinal: true`)
3. **AI Review**: Automatically triggered for final submissions
4. **AI Decision**: 
   - `PASS_TO_OFFLINE_REVIEW` → Proceeds to judge review
   - `NEEDS_IMPROVEMENT` → User can update and resubmit
   - `REJECTED` → Submission rejected

## 🔒 Role-Based Access Control (RBAC)

- **PARTICIPANT**: Can create submissions, join teams
- **ORGANIZER**: Can create/manage hackathons, view analytics
- **JUDGE**: Can review submissions, assign scores
- **ADMIN**: Full system access

Use the `@Roles()` decorator to protect routes:

```typescript
@Roles(UserRole.ORGANIZER, UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
```

## 🗄️ Database

in-memory storage is used for database management. Key models:

- `User` - User accounts with roles
- `Hackathon` - Hackathon events
- `Team` - Teams participating in hackathons
- `Submission` - Project submissions
- `Review` - Judge reviews
- `Notification` - User notifications
- `AuditLog` - System audit trail

## 📦 Environment Variables

See `.env.example` for all required environment variables.

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [in-memory storage Documentation](https://www.database.io/docs)
- [JWT Authentication](https://docs.nestjs.com/security/authentication)

## 🛠️ Development

### Code Style

- ESLint + Prettier configured
- Follow NestJS conventions
- Use TypeScript strict mode

### Adding New Features

1. Create module folder in `src/`
2. Define DTOs in `dto/` subfolder
3. Implement service logic
4. Create controller with routes
5. Register module in `app.module.ts`

## 📄 License

Private - GCC FUSION Platform

