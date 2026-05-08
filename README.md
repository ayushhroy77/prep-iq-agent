# 🚀 Prep IQ Agent

<div align="center">

[![GitHub stars](https://img.shields.io/github/stars/yourusername/prep-iq-agent?style=for-the-badge)](https://github.com/yourusername/prep-iq-agent/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/prep-iq-agent?style=for-the-badge)](https://github.com/yourusername/prep-iq-agent/issues)
[![GitHub license](https://img.shields.io/github/license/yourusername/prep-iq-agent?style=for-the-badge)](https://github.com/yourusername/prep-iq-agent/blob/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com/yourusername/prep-iq-agent/pulls)

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.80.0-3ECF8E.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC.svg)](https://tailwindcss.com/)

**AI-Powered IQ Test Preparation Platform**

*Transform your IQ preparation with personalized learning, adaptive quizzes, and AI-assisted study sessions.*

[🌟 Live Demo](https://prep-iq-agent.vercel.app) • [📖 Documentation](https://docs.prep-iq-agent.com) • [🐛 Report Bug](https://github.com/yourusername/prep-iq-agent/issues) • [💡 Request Feature](https://github.com/yourusername/prep-iq-agent/issues)

![Prep IQ Agent Demo](./assets/demo.gif)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [⚡ Installation](#-installation)
- [🔧 Configuration](#-configuration)
- [📖 Usage](#-usage)
- [🔌 API Reference](#-api-reference)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)
- [📞 Support](#-support)

---

## ✨ Features

<div align="center">

### 🎯 Core Capabilities

| Feature | Description |
|---------|-------------|
| 🤖 **AI Study Buddy** | Interactive AI assistant providing personalized learning support and instant doubt resolution |
| 📊 **Smart Quiz Generator** | Dynamic quiz creation with adaptive difficulty based on user performance and learning patterns |
| 📚 **Concept Library** | Comprehensive collection of IQ concepts with detailed explanations and visual aids |
| 📅 **Study Scheduler** | AI-powered personalized study plans with progress tracking and smart reminders |
| 📈 **Analytics Dashboard** | Detailed performance insights with charts, trends, and improvement recommendations |
| 🔐 **Secure Authentication** | Supabase-powered user management with profile customization and data privacy |

### 🎨 User Experience

| Feature | Description |
|---------|-------------|
| 📱 **Responsive Design** | Optimized experience across desktop, tablet, and mobile devices |
| 🌙 **Dark Mode** | Built-in theme switching for comfortable extended study sessions |
| ⚡ **Real-time Updates** | Live progress tracking and instant feedback on quiz performance |
| 🎯 **Gamification** | Achievement system and progress badges to maintain motivation |
| 🔄 **Offline Mode** | Core study materials available without internet connection |
| 🌍 **Multi-language** | Support for multiple languages with RTL support |

</div>

---

## 🚀 Quick Start

Get started with Prep IQ Agent in under 5 minutes!

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Supabase** account ([Sign up](https://supabase.com/))
- **OpenAI** API key ([Get one](https://platform.openai.com/))

### One-Click Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/prep-iq-agent.git
cd prep-iq-agent

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

> **🎉 That's it!** Your app will be running at [http://localhost:8080](http://localhost:8080)

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=flat-square&logo=tailwind-css)

### Backend & Database
![Supabase](https://img.shields.io/badge/Supabase-2.80.0-3ECF8E?style=flat-square&logo=supabase)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql)

### AI & APIs
![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?style=flat-square&logo=openai)

### Development Tools
![ESLint](https://img.shields.io/badge/ESLint-9.32.0-4B32C3?style=flat-square&logo=eslint)
![Prettier](https://img.shields.io/badge/Prettier-3.0.0-F7B93E?style=flat-square&logo=prettier)

</div>

---

## 🏗️ Architecture

### System Overview

```mermaid
graph TB
    subgraph "User Layer"
        U[👤 Students & Educators]
    end

    subgraph "Presentation Layer"
        A[React Frontend] --> B[Vite Dev Server]
        A --> C[Supabase Client]
    end

    subgraph "Application Layer"
        C --> D[Supabase Auth]
        C --> E[Supabase Database]
        C --> F[Edge Functions]
    end

    subgraph "Service Layer"
        F --> G[AI Services]
        F --> H[Quiz Generation]
        F --> I[Chat Assistant]
        G --> J[OpenAI API]
        H --> J
        I --> J
    end

    subgraph "Data Layer"
        E --> K[(PostgreSQL)]
        K --> L[Row Level Security]
    end

    U --> A
    style A fill:#61DAFB
    style D fill:#3ECF8E
    style E fill:#4169E1
    style F fill:#FF6B6B
    style J fill:#412991
```

### Component Architecture

```mermaid
graph TD
    subgraph "Frontend Components"
        App[App.tsx] --> Router[React Router]
        Router --> Pages[Pages/]
        Router --> Layout[Layout Components]

        Pages --> Dashboard[Dashboard.tsx]
        Pages --> QuizGen[QuizGenerator.tsx]
        Pages --> StudyBuddy[AIStudyBuddy.tsx]
        Pages --> ConceptLib[ConceptLibrary.tsx]
        Pages --> StudySched[StudySchedule.tsx]

        Layout --> Nav[Navigation]
        Layout --> Header[Header]
        Layout --> Footer[Footer]
    end

    subgraph "UI Components"
        Components[Components/] --> UI[ui/ - shadcn/ui]
        Components --> Custom[Custom Components]
        UI --> Button[Button]
        UI --> Form[Form]
        UI --> Chart[Chart]
        Custom --> QuizCard[QuizCard]
        Custom --> ProgressBar[ProgressBar]
    end

    subgraph "State Management"
        State[TanStack Query] --> API[API Calls]
        State --> Local[Local State]
        Hooks[Custom Hooks] --> State
    end

    subgraph "Services"
        Supabase[Supabase Client] --> Auth[Authentication]
        Supabase --> DB[Database]
        Supabase --> Storage[File Storage]
    end

    App --> Components
    App --> State
    App --> Services
```

### Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant S as Supabase
    participant EF as Edge Functions
    participant AI as AI Services
    participant DB as Database

    U->>F: Interact with UI
    F->>S: API Request
    S->>EF: Trigger Function
    EF->>AI: AI Processing Request
    AI-->>EF: AI Response
    EF-->>S: Process Response
    S-->>DB: Store/Update Data
    DB-->>S: Data Confirmation
    S-->>F: API Response
    F-->>U: Update UI

    Note over F,S: Authentication & Authorization
    Note over EF,AI: AI Quiz Generation & Chat
    Note over S,DB: Data Persistence & RLS
```

### Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        Dev[👨‍💻 Developer] --> Git[Git Repository]
        Git --> CI[GitHub Actions]
    end

    subgraph "Build & Test"
        CI --> Test[Run Tests]
        CI --> Lint[ESLint Check]
        CI --> Build[Vite Build]
    end

    subgraph "Staging"
        Build --> Staging[Vercel Preview]
        Staging --> SupabaseStaging[Supabase Staging]
    end

    subgraph "Production"
        Staging --> Prod[Vercel Production]
        Prod --> SupabaseProd[Supabase Production]
        SupabaseProd --> CDN[CDN Distribution]
    end

    subgraph "Monitoring"
        Prod --> Analytics[Analytics]
        Prod --> Logs[Error Logging]
        Prod --> Alerts[Performance Alerts]
    end

    style Prod fill:#10B981
    style SupabaseProd fill:#3ECF8E
    style CDN fill:#F59E0B
```

### Database Schema

```mermaid
erDiagram
    profiles ||--o{ quiz_sessions : "user_attempts"
    profiles ||--o{ study_progress : "user_progress"
    profiles ||--o{ ai_chat_history : "user_chats"

    profiles {
        uuid id PK
        text email
        text full_name
        text education_level
        text[] target_exams
        text preferred_language
        timestamp created_at
        timestamp updated_at
    }

    quiz_sessions {
        uuid id PK
        uuid user_id FK
        text topic_name
        text difficulty
        integer score
        integer total_questions
        jsonb answers
        timestamp started_at
        timestamp completed_at
    }

    study_progress {
        uuid id PK
        uuid user_id FK
        text module_name
        integer progress_percentage
        timestamp last_accessed
        jsonb achievements
    }

    ai_chat_history {
        uuid id PK
        uuid user_id FK
        text message
        text response
        text conversation_id
        timestamp created_at
    }
```

### System Components

<div align="center">

| Layer | Technology | Purpose |
|-------|------------|---------|
| **🎨 Presentation** | React 18 + TypeScript + Vite | Modern, type-safe frontend with fast builds |
| **🎯 UI Framework** | shadcn/ui + Tailwind CSS | Consistent, accessible component system |
| **📊 State Management** | TanStack Query + React Hooks | Efficient server state and local state handling |
| **🔐 Authentication** | Supabase Auth | Secure user management with JWT |
| **💾 Database** | PostgreSQL + RLS | Structured data with row-level security |
| **⚡ Edge Functions** | Supabase Edge Functions | Serverless API endpoints |
| **🤖 AI Services** | OpenAI API | Intelligent quiz generation and chat |
| **📈 Analytics** | Custom Analytics | User progress and performance tracking |

</div>

### Security Architecture

```mermaid
mindmap
  root((Security))
    Authentication
      Supabase Auth
      JWT Tokens
      Social Login
    Authorization
      Row Level Security
      API Key Validation
      Session Management
    Data Protection
      Encryption at Rest
      HTTPS Only
      Input Validation
    AI Security
      Prompt Sanitization
      Rate Limiting
      Content Filtering
```

---

---

## 📁 Project Structure

```
prep-iq-agent/
├── 📁 public/                    # Static assets and favicons
│   ├── robots.txt
│   └── favicon.ico
├── 📁 src/
│   ├── 📁 components/           # Reusable UI components
│   │   ├── 📁 ui/              # shadcn/ui component library
│   │   ├── NavLink.tsx         # Navigation components
│   │   └── PageTransition.tsx  # Route transition effects
│   ├── 📁 pages/               # Page-level components
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── QuizGenerator.tsx   # Quiz creation interface
│   │   └── AIStudyBuddy.tsx    # AI chat interface
│   ├── 📁 hooks/               # Custom React hooks
│   │   ├── use-mobile.tsx      # Mobile detection
│   │   └── use-scroll-animation.tsx
│   ├── 📁 lib/                 # Utility functions
│   │   └── utils.ts            # Helper functions
│   ├── 📁 data/                # Static data and configurations
│   │   ├── quiz-data.json      # Quiz topics and subjects
│   │   └── modules.json        # Learning modules
│   ├── 📁 integrations/        # External service integrations
│   │   └── 📁 supabase/        # Supabase client and types
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # App entry point
│   └── vite-env.d.ts           # Vite type definitions
├── 📁 supabase/                # Backend configuration
│   ├── 📁 functions/           # Edge functions
│   │   ├── 📁 chat-ai/         # AI chat function
│   │   └── 📁 generate-quiz/   # Quiz generation function
│   ├── 📁 migrations/          # Database schema migrations
│   └── config.toml             # Supabase project config
├── 📁 docs/                    # Documentation
├── 📄 package.json             # Dependencies and scripts
├── 📄 vite.config.ts           # Vite configuration
├── 📄 tailwind.config.ts       # Tailwind CSS config
├── 📄 eslint.config.js         # ESLint configuration
└── 📄 README.md                # Project documentation
```

---

## ⚡ Installation

### Detailed Setup Guide

#### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/prep-iq-agent.git
cd prep-iq-agent

# Install dependencies
npm install
# or
yarn install
```

#### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key

# AI Service Configuration
LOVABLE_API_KEY=your-openai-api-key

# Optional: Analytics and Monitoring
VITE_GA_TRACKING_ID=your-google-analytics-id
```

#### 3. Supabase Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push database migrations
supabase db push

# Deploy edge functions
supabase functions deploy
```

#### 4. Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ | - |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous key | ✅ | - |
| `LOVABLE_API_KEY` | OpenAI API key for AI features | ✅ | - |
| `VITE_GA_TRACKING_ID` | Google Analytics tracking ID | ❌ | - |
| `VITE_APP_ENV` | Application environment | ❌ | `development` |

### Supabase Configuration

1. **Create a new Supabase project**
2. **Enable authentication providers** (Email, Google, etc.)
3. **Configure database tables** using the provided migrations
4. **Set up Row Level Security** policies
5. **Deploy edge functions** for AI capabilities

---

## 📖 Usage

### User Journey Map

```mermaid
journey
    title Student Learning Journey
    section Discovery
      Visit Website: 5: User
      Explore Features: 4: User
      Watch Demo: 3: User
    section Onboarding
      Create Account: 5: User
      Complete Profile: 4: User
      Take Assessment: 3: User
    section Learning
      Follow Study Plan: 5: User
      Take Practice Quizzes: 4: User
      Use AI Study Buddy: 5: User
    section Progress
      Track Performance: 4: User
      Review Analytics: 3: User
      Achieve Goals: 5: User
```

### Student Workflow

```mermaid
stateDiagram-v2
    [*] --> Landing
    Landing --> Register: Sign Up
    Landing --> Login: Sign In

    Register --> ProfileSetup
    Login --> Dashboard

    ProfileSetup --> Assessment: Complete Profile
    Assessment --> Dashboard: Take Initial Quiz

    Dashboard --> QuizGenerator: Practice Quizzes
    Dashboard --> AIStudyBuddy: Get Help
    Dashboard --> StudySchedule: View Plan
    Dashboard --> ConceptLibrary: Learn Concepts
    Dashboard --> Settings: Update Profile

    QuizGenerator --> QuizTaking: Start Quiz
    QuizTaking --> QuizResults: Complete Quiz
    QuizResults --> Dashboard: Review Performance

    AIStudyBuddy --> ChatInterface: Ask Questions
    ChatInterface --> AIStudyBuddy: Get Answers

    StudySchedule --> StudySession: Follow Plan
    StudySession --> Dashboard: Complete Session

    ConceptLibrary --> ConceptDetails: Browse Topics
    ConceptDetails --> ConceptLibrary: Study Material

    Settings --> ProfileSetup: Update Info
    Settings --> Dashboard: Save Changes

    Dashboard --> [*]: Logout
```

### Quiz Taking Process

```mermaid
flowchart TD
    A[📚 Select Topic] --> B[🎯 Choose Difficulty]
    B --> C[🔢 Set Question Count]
    C --> D[🚀 Start Quiz]

    D --> E[❓ Answer Questions]
    E --> F[⏱️ Timer Running]
    E --> G[💯 Real-time Scoring]

    F --> H{Time Up?}
    H -->|Yes| I[📊 Auto Submit]
    H -->|No| E

    G --> J{More Questions?}
    J -->|Yes| E
    J -->|No| K[📈 Calculate Final Score]

    I --> K
    K --> L[📊 Show Results]
    L --> M[🤖 AI Feedback]
    M --> N[💡 Study Recommendations]
    N --> O[🏆 Update Progress]
    O --> P[📊 Dashboard Update]
```

### AI Study Buddy Interaction Flow

```mermaid
flowchart LR
    subgraph "User Input"
        U1[💬 Text Question]
        U2[🖼️ Image Upload]
        U3[🎯 Topic Selection]
    end

    subgraph "AI Processing"
        P1[🔍 Context Analysis]
        P2[🧠 AI Reasoning]
        P3[📚 Knowledge Retrieval]
        P4[✨ Response Generation]
    end

    subgraph "Response Types"
        R1[📝 Text Explanation]
        R2[📊 Step-by-step Solution]
        R3[📈 Study Tips]
        R4[🎯 Practice Questions]
        R5[📊 Progress Insights]
    end

    U1 --> P1
    U2 --> P1
    U3 --> P1

    P1 --> P2
    P2 --> P3
    P3 --> P4

    P4 --> R1
    P4 --> R2
    P4 --> R3
    P4 --> R4
    P4 --> R5
```

### Study Schedule Management

```mermaid
gantt
    title Study Schedule Example
    dateFormat  YYYY-MM-DD
    section Week 1
    Complete Profile     :done, profile, 2024-01-01, 2024-01-01
    Initial Assessment   :done, assess, 2024-01-02, 2024-01-02
    Basic Algebra        :done, algebra, 2024-01-03, 2024-01-05
    section Week 2
    Logical Reasoning    :active, logic, 2024-01-06, 2024-01-10
    Pattern Recognition  :planned, pattern, 2024-01-11, 2024-01-15
    section Week 3
    Advanced Topics      :planned, advanced, 2024-01-16, 2024-01-20
    Practice Tests       :planned, practice, 2024-01-21, 2024-01-25
    Final Review         :planned, review, 2024-01-26, 2024-01-30
```

### Performance Analytics Flow

```mermaid
flowchart TD
    A[📊 Quiz Completion] --> B[💾 Store Results]
    B --> C[📈 Calculate Metrics]

    C --> D{Performance Analysis}
    D --> E[📊 Score Trends]
    D --> F[🎯 Weak Areas]
    D --> G[⚡ Improvement Rate]
    D --> H[🏆 Achievements]

    E --> I[🤖 AI Insights]
    F --> I
    G --> I
    H --> I

    I --> J[📧 Personalized Recommendations]
    J --> K[📅 Update Study Plan]
    K --> L[📱 Push Notifications]
    L --> M[👤 User Dashboard]

    M --> N[📊 Visual Charts]
    N --> O[📈 Progress Timeline]
    O --> P[🎯 Goal Tracking]
```

### For Students

<div align="center">

#### 🚀 Getting Started
1. **📝 Create Account**: Sign up with email or social login
2. **👤 Complete Profile**: Set learning goals and target exams
3. **📋 Take Assessment**: Initial quiz to determine skill level
4. **📚 Follow Study Plan**: AI-generated personalized schedule

#### 📖 Daily Learning
5. **🎯 Practice Quizzes**: Regular adaptive quizzes with instant feedback
6. **🤖 AI Assistance**: Get help from AI study buddy anytime
7. **📊 Track Progress**: Monitor improvement with detailed analytics
8. **🏆 Achieve Goals**: Unlock achievements and celebrate milestones

</div>

### For Educators

<div align="center">

#### 👨‍🏫 Administrative Features
1. **🎛️ Access Admin Panel**: Special educator dashboard interface
2. **📝 Create Custom Quizzes**: Design quizzes tailored to curriculum
3. **👥 Monitor Student Progress**: Track individual and class performance
4. **📊 Generate Reports**: Comprehensive analytics and insights

#### 🤖 AI-Powered Teaching
5. **🧠 AI Insights**: Get recommendations for student improvement
6. **📈 Performance Analytics**: Identify trends and learning patterns
7. **🎯 Personalized Learning**: Adaptive content based on student needs
8. **📚 Curriculum Alignment**: Ensure content matches educational standards

</div>

---

---

## 🔌 API Reference

### API Architecture Overview

```mermaid
graph LR
    subgraph "Client Applications"
        Web[🌐 Web App]
        Mobile[📱 Mobile App]
        API[🔌 Third-party APIs]
    end

    subgraph "API Gateway"
        Auth[🔐 Authentication]
        RateLimit[⚡ Rate Limiting]
        CORS[🌐 CORS Handling]
    end

    subgraph "Edge Functions"
        QuizGen[📊 Quiz Generator]
        ChatAI[🤖 AI Chat]
        Analytics[📈 Analytics]
    end

    subgraph "External Services"
        OpenAI[🧠 OpenAI API]
        Storage[💾 File Storage]
        Email[📧 Email Service]
    end

    subgraph "Database"
        Postgres[(📊 PostgreSQL)]
        RLS[🔒 Row Level Security]
    end

    Web --> Auth
    Mobile --> Auth
    API --> Auth

    Auth --> RateLimit
    RateLimit --> CORS

    CORS --> QuizGen
    CORS --> ChatAI
    CORS --> Analytics

    QuizGen --> OpenAI
    ChatAI --> OpenAI
    Analytics --> Postgres

    QuizGen --> Postgres
    ChatAI --> Postgres

    QuizGen --> Storage
    ChatAI --> Email
```

### Supabase Edge Functions

#### Generate Quiz
```http
POST /functions/v1/generate-quiz
Content-Type: application/json
Authorization: Bearer <token>

{
  "topicName": "Logical Reasoning",
  "topicDescription": "Practice logical thinking patterns",
  "difficulty": "medium",
  "questionCount": 15,
  "isMixed": false
}
```

**Response:**
```json
{
  "success": true,
  "quiz": {
    "id": "quiz_123",
    "topic": "Logical Reasoning",
    "difficulty": "medium",
    "questions": [
      {
        "id": "q1",
        "question": "Which of the following is a logical fallacy?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "A",
        "explanation": "This is an example of..."
      }
    ]
  }
}
```

#### AI Chat
```http
POST /functions/v1/chat-ai
Content-Type: application/json
Authorization: Bearer <token>

{
  "messages": [
    {
      "role": "user",
      "content": "Explain logical fallacies",
      "image": null
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": {
    "message": "A logical fallacy is an error in reasoning...",
    "suggestions": ["Practice question 1", "Practice question 2"],
    "relatedTopics": ["Critical Thinking", "Argument Analysis"]
  }
}
```

### Database Schema

#### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  education_level TEXT,
  target_exams TEXT[],
  preferred_language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 Deployment

### CI/CD Pipeline

```mermaid
flowchart TD
    subgraph "Development"
        Dev[👨‍💻 Developer] -->|Push Code| Git[GitHub Repository]
        Dev -->|Create PR| PR[Pull Request]
    end

    subgraph "Continuous Integration"
        Git --> CI[GitHub Actions]
        PR --> CI

        CI --> Lint[🔍 ESLint]
        CI --> Test[🧪 Run Tests]
        CI --> Build[📦 Vite Build]
        CI --> Security[🔒 Security Scan]

        Lint --> QA{Quality Gate}
        Test --> QA
        Build --> QA
        Security --> QA
    end

    subgraph "Deployment Stages"
        QA --> Staging[🚀 Deploy to Staging]
        Staging --> E2E[🤖 E2E Tests]
        E2E --> Review[👀 Manual Review]

        Review --> Prod{Production?}
        Prod -->|Yes| Production[🎉 Deploy to Production]
        Prod -->|No| Feedback[💬 Send Feedback]

        Feedback --> Dev
    end

    subgraph "Production"
        Production --> Frontend[Vercel/Netlify]
        Production --> Backend[Supabase Functions]
        Production --> Database[Supabase Database]

        Frontend --> CDN[🌐 CDN Distribution]
        Backend --> Monitoring[📊 Monitoring]
        Database --> Backup[💾 Automated Backups]
    end

    subgraph "Post-Deployment"
        CDN --> Health[🏥 Health Checks]
        Monitoring --> Alerts[🚨 Performance Alerts]
        Backup --> Recovery[🔄 Disaster Recovery]
    end

    style Production fill:#10B981
    style Frontend fill:#3B82F6
    style Backend fill:#8B5CF6
```

### Deployment Strategies

<div align="center">

| Strategy | Use Case | Pros | Cons |
|----------|----------|------|------|
| **Blue-Green** | Zero-downtime updates | Instant rollback, no downtime | Higher resource usage |
| **Canary** | Gradual rollouts | Risk mitigation, A/B testing | Complex monitoring |
| **Rolling** | Resource-constrained | Efficient resource use | Potential inconsistencies |

</div>

### Frontend Deployment

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Or link existing project
vercel link
```

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### Backend Deployment

#### Supabase
```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy chat-ai

# Push database migrations
supabase db push

# View function logs
supabase functions logs chat-ai
```

### Infrastructure as Code

#### Environment Setup
```bash
# Using Supabase CLI for infrastructure
supabase init
supabase start  # For local development
supabase stop   # Stop local instance
```

### Production Checklist

<div align="center">

#### 🔧 Pre-Deployment
- [ ] Environment variables configured securely
- [ ] SSL certificates enabled and valid
- [ ] Database migrations tested in staging
- [ ] API endpoints tested with Postman/Insomnia
- [ ] Performance benchmarks met

#### 🚀 Deployment
- [ ] CI/CD pipeline passes all checks
- [ ] Database backups created
- [ ] Rollback plan documented
- [ ] Monitoring and alerting configured
- [ ] CDN configured for static assets

#### ✅ Post-Deployment
- [ ] Health checks passing
- [ ] Error monitoring active
- [ ] Performance monitoring enabled
- [ ] User acceptance testing completed
- [ ] Documentation updated

</div>
- [ ] Database backups scheduled
- [ ] Monitoring and logging set up
- [ ] CDN configured for assets
- [ ] Performance optimization applied

---

## 🤝 Contributing

We love your input! We want to make contributing to Prep IQ Agent as easy and transparent as possible.

### Development Process

1. **Fork** the repo on GitHub
2. **Clone** the project to your local machine
3. **Create** a new branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes and test thoroughly
5. **Commit** your changes: `git commit -m 'Add amazing feature'`
6. **Push** to the branch: `git push origin feature/amazing-feature`
7. **Open** a Pull Request

### Guidelines

#### Code Style
- Follow the existing code style
- Use TypeScript for all new code
- Write meaningful commit messages
- Add tests for new features

#### Pull Request Process
- Update the README if needed
- Update documentation for API changes
- Ensure all tests pass
- Get approval from maintainers

#### Reporting Issues
- Use the issue templates
- Provide detailed reproduction steps
- Include environment information
- Add screenshots for UI issues

### Contributors

<a href="https://github.com/yourusername/prep-iq-agent/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=yourusername/prep-iq-agent" />
</a>

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Prep IQ Agent

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

### Core Technologies
- **React** - The library for web and native user interfaces
- **Supabase** - The open source Firebase alternative
- **Vite** - Next generation frontend tooling
- **Tailwind CSS** - A utility-first CSS framework
- **shadcn/ui** - Beautifully designed components

### Inspiration
- Educational platforms that prioritize accessibility
- AI-powered learning tools that make education engaging
- Open-source communities that foster innovation

### Special Thanks
- Our amazing contributors and early adopters
- The Supabase and React communities
- Everyone who believes in democratizing education

---

## 📞 Support

### Getting Help

- 📧 **Email**: support@prep-iq-agent.com
- 💬 **Discord**: [Join our community](https://discord.gg/prep-iq-agent)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/prep-iq-agent/issues)
- 📖 **Documentation**: [Official Docs](https://docs.prep-iq-agent.com)

### Community

- 🌟 **Star** this repo if you find it helpful!
- 🔄 **Fork** and contribute back
- 📢 **Share** with fellow learners
- 💝 **Sponsor** the project development

---

<div align="center">

**Made with ❤️ for smarter learning**

[⬆️ Back to Top](#-prep-iq-agent)

</div>
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a991ee2c-d840-47dc-bcbe-1f3fa709dfed) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
