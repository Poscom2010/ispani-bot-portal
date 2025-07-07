# ISpaniBot - AI-Powered Proposal Generator

<div align="center">
  <img src="src/assets/ispanibot-icon.png" alt="ISpaniBot Logo" width="120" height="120">
  
  [![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.11-blue.svg)](https://tailwindcss.com/)
  [![Vite](https://img.shields.io/badge/Vite-5.4.1-purple.svg)](https://vitejs.dev/)
</div>

## 🚀 Overview

ISpaniBot is a cutting-edge AI-powered platform designed to revolutionize how freelancers and professionals create, manage, and track their project proposals. Built with modern web technologies and powered by advanced AI, ISpaniBot streamlines the proposal creation process while providing comprehensive analytics and earnings management.

### ✨ Key Features

- **🤖 AI-Powered Proposal Generation**: Leverage advanced AI (Groq/Llama 3.3) to create professional, compelling proposals
- **📊 Advanced Analytics Dashboard**: Track proposal performance, approval rates, and earnings with beautiful visualizations
- **💰 Earnings Management**: Monitor and manage your income with detailed tracking and status updates
- **📈 Real-time Metrics**: Get insights into your proposal success rates and business performance
- **🔐 Secure Authentication**: Built-in user authentication with Supabase Auth
- **📱 Responsive Design**: Beautiful, mobile-first design that works on all devices
- **⚡ Lightning Fast**: Built with Vite for optimal performance and development experience
- **🧪 One-click Demo Access**: Auto-login for seamless community testing (no registration required)

## 🏗️ Architecture

### Frontend Stack
- **React 18.3.1** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development with full IntelliSense support
- **Vite** - Next-generation frontend tooling for fast development
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **shadcn/ui** - High-quality, accessible UI components
- **React Query** - Powerful data synchronization for React
- **React Router** - Declarative routing for React applications

### Backend & Database
- **Supabase** - Open-source Firebase alternative
  - PostgreSQL database with Row Level Security (RLS)
  - Real-time subscriptions
  - Built-in authentication
  - Edge Functions for serverless computing
- **Groq API** - High-performance AI inference for proposal generation

### AI Integration
- **Groq Cloud** - Ultra-fast AI inference platform
- **Llama 3.3 70B** - Advanced language model for proposal generation
- **Custom Prompts** - Tailored system prompts for professional proposal creation

## 📋 Database Schema

### Core Tables

#### `profiles`
User profile information and verification status
```sql
- id (UUID, Primary Key)
- full_name (TEXT)
- freelance_title (TEXT)
- verified (BOOLEAN)
- created_at (TIMESTAMP)
```

#### `proposals`
AI-generated proposals with status tracking
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- title (TEXT)
- initial_prompt (TEXT)
- generated_content (JSONB)
- status (ENUM: draft, pending, approved, rejected, completed)
- estimated_value (DECIMAL)
- actual_value (DECIMAL)
- completion_date (TIMESTAMP)
- created_at (TIMESTAMP)
```

#### `earnings`
Financial tracking and payment management
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- proposal_id (UUID, Foreign Key)
- amount (DECIMAL)
- status (ENUM: pending, paid, cancelled)
- payment_date (TIMESTAMP)
- description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `proposal_metrics`
Aggregated analytics and performance metrics
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- total_proposals (INTEGER)
- approved_proposals (INTEGER)
- pending_proposals (INTEGER)
- completed_proposals (INTEGER)
- total_earnings (DECIMAL)
- last_updated (TIMESTAMP)
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Groq API key

### 1. Clone the Repository
```bash
git clone <YOUR_GIT_URL>
cd ispanibot-portal
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

### 4. Database Setup
The project includes automated database migrations. The schema will be automatically applied when you connect to Supabase.

### 5. Supabase Edge Functions
Deploy the AI proposal generator function:
```bash
# The edge function is automatically deployed with your Supabase project
# Located in: supabase/functions/ispanibot-generator/
```

### 6. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 🎯 Usage Guide

### Getting Started
1. **Sign Up/Sign In**: Create an account or sign in with existing credentials
2. **Complete Profile**: Add your name and freelance title for personalization
3. **Generate First Proposal**: Click "Generate Proposal" and describe your project
4. **Manage Proposals**: Track status, update values, and monitor progress
5. **Monitor Earnings**: Add and track your income from completed projects

### AI Proposal Generation
1. **Title**: Enter a descriptive title for your proposal
2. **Description**: Provide detailed project requirements and context
3. **Generate**: Let AI create a professional proposal with:
   - Compelling project overview
   - Detailed deliverables list
   - Realistic timeline estimation
   - Competitive pricing suggestions

### Analytics Dashboard
- **Overview Tab**: Quick stats and recent proposals
- **Analytics Tab**: Detailed charts and performance metrics
- **Earnings Tab**: Financial tracking and payment management
- **Manage Proposals Tab**: Update proposal status and values

### 🧪 Demo & Community Testing Mode (Auto-Login)

#### What is Auto-Login?
For hackathon/demo purposes, ISpaniBot supports a special auto-login mode that allows anyone with the app link to instantly access and test the platform—no registration or sign-in required. This is perfect for sharing your app on platforms like Padlet for community voting and feedback.

#### How It Works
- On app load, the frontend automatically calls a Supabase Edge Function (`auto-login`) that returns a valid session.
- The session is stored in localStorage and injected into Supabase Auth, bypassing the login page entirely.
- Users are redirected straight to the dashboard and can use all app features as a demo user.
- The login page is never shown while auto-login is active.

#### Edge Function Details
- **URL:** `https://uufbuatrnoprynesbirw.supabase.co/functions/v1/auto-login`
- **Response Format:**
  ```json
  {
    "message": "Auto-login successful",
    "session": {
      "access_token": "...",
      "refresh_token": "...",
      "expires_at": 1234567890,
      "user": { ... }
    },
    "user": { ... }
  }
  ```
- **Integration:** See `src/lib/autoLogin.ts` and `src/contexts/AuthContext.tsx` for implementation details.

#### How to Share for Community Testing
1. **Deploy your app** (e.g., on Bolt.new, Vercel, Netlify, etc.).
2. **Share the deployed link** on Padlet or other platforms.
3. **Anyone with the link** will be auto-logged in and can test the app immediately—no sign up required!

#### Disabling Auto-Login (for production)
To revert to normal authentication, simply remove or comment out the auto-login logic in `AuthContext.tsx` and remove the `autoLogin` utility import. This will restore the standard sign up/sign in flow.

---

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── dashboard/      # Dashboard-specific components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/      # Supabase client and types
├── lib/               # Utility functions
├── pages/             # Route components
└── assets/            # Static assets

supabase/
├── functions/         # Edge Functions
│   └── ispanibot-generator/  # AI proposal generator
└── migrations/        # Database migrations
```

### Key Components

#### Authentication (`src/contexts/AuthContext.tsx`)
- Handles user authentication state
- Provides sign in/up/out functionality
- Manages user session persistence

#### Dashboard (`src/pages/Dashboard.tsx`)
- Main application interface
- Tabbed navigation for different features
- Real-time data updates with React Query

#### AI Integration (`supabase/functions/ispanibot-generator/`)
- Serverless function for AI proposal generation
- Integrates with Groq API for fast inference
- Structured JSON response formatting

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🚀 Deployment

### Automatic Deployment
The project is configured for automatic deployment through your Git provider integration.

### Manual Deployment
1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**:
   - Netlify (recommended)
   - Vercel
   - AWS Amplify
   - Any static hosting service

### Environment Variables for Production
Ensure these environment variables are set in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GROQ_API_KEY` (for Edge Functions)

## 🔐 Security Features

### Row Level Security (RLS)
All database tables implement RLS policies ensuring users can only access their own data:
- Profiles: Users manage their own profile
- Proposals: Users see only their proposals
- Earnings: Users track only their earnings
- Metrics: Users view only their analytics

### Authentication
- Secure email/password authentication
- Session management with automatic refresh
- Protected routes with authentication guards

### Data Privacy
- All user data is isolated and secure
- No cross-user data access
- Encrypted data transmission

## 📊 Analytics & Metrics

### Proposal Analytics
- **Approval Rate**: Percentage of proposals that get approved
- **Completion Rate**: Percentage of approved proposals completed
- **Average Proposal Value**: Mean estimated value of proposals
- **Monthly Trends**: Proposal creation and success over time

### Earnings Analytics
- **Total Earnings**: Sum of all recorded earnings
- **Collection Rate**: Percentage of earnings actually received
- **Payment Status**: Breakdown of pending vs. paid earnings
- **Monthly Revenue**: Earnings trends over time

### Visual Charts
- Pie charts for proposal status distribution
- Bar charts for monthly proposal creation
- Line charts for earnings trends
- Key performance indicators (KPIs)

## 🤝 Contributing

We welcome contributions to ISpaniBot! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Contribution Guidelines
- Follow TypeScript best practices
- Maintain consistent code formatting
- Add tests for new features
- Update documentation as needed
- Ensure all existing tests pass

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues
- Verify Supabase URL and API keys
- Check if RLS policies are properly configured
- Ensure user is authenticated

#### AI Generation Failures
- Verify Groq API key is valid
- Check Edge Function logs in Supabase
- Ensure proper CORS configuration

#### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run lint`
- Verify all environment variables are set

### Getting Help
- Check the [Issues](https://github.com/your-repo/issues) page
- Review Supabase documentation
- Check Groq API documentation

## 📈 Roadmap

### Upcoming Features
- **Writing Assistant**: AI-powered content creation tools
- **Job Matching**: Intelligent job recommendation system
- **Team Collaboration**: Multi-user proposal collaboration
- **Advanced Templates**: Industry-specific proposal templates
- **Integration Hub**: Connect with popular freelance platforms
- **Mobile App**: Native iOS and Android applications

### Performance Improvements
- Enhanced caching strategies
- Optimized database queries
- Improved AI response times
- Better offline support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** - For providing an excellent backend-as-a-service platform
- **Groq** - For ultra-fast AI inference capabilities
- **shadcn/ui** - For beautiful, accessible UI components
- **Tailwind CSS** - For rapid UI development
- **React Team** - For the amazing React framework

## 📞 Support

For support, email support@ispanibot.com or join our community discussions.

---

<div align="center">
  <p>Built with ❤️ by the ISpaniBot team</p>
  <p>© 2025 ISpaniBot. All rights reserved.</p>
</div>