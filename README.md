# SSRMS | Spaza Shop Registration & Management System

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.57.4-3ECF8E.svg)](https://supabase.com/)

## 🏪 Overview

The **Spaza Shop Registration & Management System (SSRMS)** is a comprehensive full-stack digital platform designed to streamline the registration, verification, and compliance monitoring of spaza shops across South Africa. Built with React, TypeScript, and Supabase, the system empowers local entrepreneurs while ensuring quality standards and regulatory compliance for customer protection.

### 🎯 Mission

To create a fair, transparent, and efficient ecosystem for spaza shop operations that:
- Supports local entrepreneurship
- Ensures food safety and quality standards
- Builds trust between shop owners and customers
- Facilitates government oversight and compliance monitoring

## ✨ Features

### 👥 Multi-Role System

#### 🛒 **Customer Features**
- Browse and search verified spaza shops
- View shop profiles with compliance ratings
- Leave reviews and ratings
- Report safety concerns
- Find nearby shops with map integration
- Track favorite shops

#### 🏪 **Shop Owner Features**
- Digital shop registration and profile management
- Document upload and compliance tracking
- Business performance analytics
- Customer feedback management
- Inspection scheduling and history
- Compliance score monitoring

#### 🏛️ **Government Official Features**
- Review and approve shop applications
- Schedule and manage inspections
- Monitor compliance across jurisdictions
- Generate regulatory reports
- Issue warnings and notifications
- Track regional statistics

### 🔧 Technical Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Clean, intuitive interface with Lucide React icons
- **Authentication**: Secure role-based access control with Supabase Auth
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Real-time Updates**: Live compliance monitoring with Supabase real-time
- **Scalable Architecture**: Modular component structure

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tshimangadzo3v5/The-Genesis.git
   cd The-Genesis
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Update the `.env` file with your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Create database tables**
   ```bash
   npm run db:reset
   ```

5. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/                          # React components
│   ├── AuthModal.tsx                    # Authentication modal with role-based signup
│   ├── LandingPage.tsx                  # Homepage with navigation and footer
│   ├── SignInPage.tsx                   # Dedicated sign-in page
│   ├── CustomerDashboard.tsx            # Customer role dashboard
│   ├── ShopOwnerDashboard.tsx           # Shop owner role dashboard
│   ├── GovernmentDashboard.tsx          # Government official dashboard
│   ├── ShopProfile.tsx                  # Shop profile and details page
│   └── RegisterModal.tsx                # Registration modal component
├── lib/                                 # Utility libraries
│   └── supabase.ts                      # Supabase client configuration
├── pages/                               # Static and informational pages
│   ├── AboutPage.tsx                    # About SSRMS page
│   ├── FeaturesPage.tsx                 # Platform features overview
│   ├── SupportPage.tsx                  # Help and support center
│   ├── ContactPage.tsx                  # Contact information and form
│   ├── FeedbackPage.tsx                 # User feedback and suggestions
│   ├── PrivacyPolicyPage.tsx            # POPIA-compliant privacy policy
│   ├── TermsOfServicePage.tsx           # Terms of service
│   └── CompliancePage.tsx               # Compliance standards and process
├── contexts/                            # React contexts
│   └── AuthContext.tsx                  # Authentication context with Supabase integration
├── supabase/                            # Supabase configuration
│   └── migrations/                      # Database migration files
├── App.tsx                              # Main application with routing
├── main.tsx                             # Application entry point
└── index.css                            # Global Tailwind CSS styles
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run db:reset` | Reset Supabase database with migrations |

## 🔧 Technology Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript 5.5.3** - Type safety
- **Vite 5.4.2** - Build tool and dev server
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **React Router DOM 7.8.2** - Client-side routing
- **Lucide React 0.344.0** - Icon library

### Backend & Database
- **Supabase 2.57.4** - Backend-as-a-Service platform
- **PostgreSQL** - Relational database with Row Level Security
- **Supabase Auth** - Authentication and user management
- **Supabase Real-time** - Live data synchronization

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing
- **Supabase CLI** - Database management and migrations

## 🌐 Deployment

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Deployment Options

- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Drag and drop the `dist/` folder or connect via Git
- **GitHub Pages**: Use GitHub Actions for automated deployment
- **Firebase Hosting**: Deploy with Firebase CLI

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Follow commit conventions**
   ```bash
   git commit -m "feat: add new feature description"
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request**

### Commit Message Convention

We use conventional commits for clear project history:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Code Style

- Use TypeScript for all new code
- Follow existing component patterns
- Use Tailwind CSS for styling
- Ensure responsive design
- Add proper error handling

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- [x] Core UI components
- [x] Authentication system with Supabase
- [x] Role-based dashboards
- [x] Responsive design
- [x] Database schema with RLS
- [x] User registration and authentication

### Phase 2: Enhanced Features 🚧
- [ ] Shop registration workflow
- [ ] Document upload and verification
- [ ] Real-time compliance monitoring
- [ ] Government approval workflows

### Phase 3: Advanced Features 📋
- [ ] Real-time notifications
- [ ] Map integration
- [ ] Payment processing
- [ ] Advanced analytics

### Phase 4: Mobile & PWA 📱
- [ ] Progressive Web App features
- [ ] Mobile app development
- [ ] Offline functionality
- [ ] Push notifications

## 📊 System Requirements

### Minimum Requirements
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)
- Internet connection for real-time features
- JavaScript enabled

### Recommended
- High-speed internet connection
- Desktop/laptop for government officials
- Mobile device for customers and shop owners

### Current Demo Limitations
- Shop registration workflow is not fully implemented
- Document upload functionality is simulated
- File uploads are simulated
- Maps and charts show placeholder content
- Payment processing not implemented

## 🔒 Security

- Role-based access control
- Secure authentication with Supabase Auth
- Row Level Security (RLS) policies
- Input validation and sanitization
- HTTPS enforcement in production
- Regular security audits

## 🙏 Acknowledgments

- South African spaza shop community for inspiration
- Open source contributors and maintainers
- Government partners for regulatory guidance
- Beta testers and early adopters

---

<div align="center">

**Built with ❤️ for South African communities**

[Website](https://ssrms.co.za) • [Documentation](https://docs.ssrms.co.za) • [Support](mailto:support@ssrms.co.za)

</div>
