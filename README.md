# TaskFlow - Modern Task Management App

TaskFlow is a collaborative task management application built with Next.js 14, TypeScript, Tailwind CSS, and Supabase. It features user authentication, CRUD operations for tasks, real-time updates, mobile responsiveness, AI-powered suggestions, and premium features via Stripe integration.

## Features

### Core Features
- **User Authentication**: Secure sign up and login using Supabase Auth
- **Task Management**: Create, read, update, and delete tasks with priority levels and status tracking
- **Real-time Updates**: See live changes when team members modify tasks
- **Mobile Optimization**: Responsive design with touch gestures for task management
- **Offline Support**: Access and view tasks even when offline (PWA)

### Premium Features
- **AI Task Suggestions**: Get intelligent task recommendations powered by Hugging Face
- **Unlimited Collaboration**: Real-time presence indicators and conflict resolution
- **Advanced Analytics**: Track productivity and team performance

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Serverless API routes with Next.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime for presence and live updates
- **Payments**: Stripe integration
- **AI**: Hugging Face API integration
- **PWA**: Service workers for offline functionality
- **Deployment**: Vercel-ready configuration

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- A Supabase account
- A Stripe account (for payment features)
- A Hugging Face account (for AI features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/taskflow.git
   cd taskflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Then fill in your:
   - Supabase URL and keys
   - Stripe API keys
   - Hugging Face API key
   - App URL

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Supabase Setup

1. Create a new Supabase project
2. Set up the following tables in Supabase:
   - `tasks`
   - `task_assignees`
   - `profiles`
   - `user_presence`
   - `user_preferences`
   - `subscriptions`
   - `ai_usage`

3. Enable Row Level Security (RLS) and configure appropriate policies

## Deployment

The app is ready to be deployed to Vercel:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Configure environment variables in the Vercel dashboard
4. Deploy!

## Key Code Structure

```
/src
  /app                    # App router pages
    /(auth)               # Auth-related pages
    /(dashboard)          # Dashboard pages
    /api                  # API routes
      /tasks              # Task CRUD operations
      /ai                 # AI suggestion endpoints
      /stripe             # Payment processing
  /components             # React components
    /auth                 # Authentication components
    /dashboard            # Dashboard components
    /tasks                # Task-related components
    /ui                   # Reusable UI components
  /lib                    # Utility functions
  /hooks                  # Custom React hooks
  /types                  # TypeScript type definitions
/public                   # Static assets
```

## Future Improvements

- [ ] Add end-to-end tests with Playwright or Cypress
- [ ] Implement task comments and activity feed
- [ ] Add file attachments for tasks
- [ ] Enhance offline capabilities with better conflict resolution
- [ ] Add dark mode toggle with system preference detection
- [ ] Create native mobile apps with React Native

## License

This project is licensed under the MIT License.