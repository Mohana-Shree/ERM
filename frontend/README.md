# ERM Frontend Application

A complete React frontend application for a job application & internship/employee management system built with React 18, TypeScript, TailwindCSS, and Supabase.

## Features

### User Features
- **Authentication**: Sign up, sign in, and sign out
- **Dashboard**: View application status and documents
- **Apply for Roles**: Submit applications for internships or full-time positions
- **Document Management**: Upload and manage personal documents
- **Application Tracking**: Monitor application status and interview details

### Admin Features
- **Admin Dashboard**: Overview of all applications with filtering
- **Application Management**: Review applications, schedule interviews, make offers
- **Intern/Employee Management**: Track active interns and employees
- **Template Management**: Manage offer letters and certificates

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **React Router DOM** for navigation
- **Supabase** for backend (Auth, Database, Storage)
- **Lucide React** for icons
- **Day.js** for date handling

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the `frontend` directory:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Run the provided SQL schema in your Supabase SQL editor
3. Create the following storage buckets:
   - `resumes` - for user resume uploads
   - `offers` - for offer letters
   - `certificates` - for certificates and documents
   - `terms` - for terms and conditions documents

4. Set up Row Level Security (RLS) policies for your tables

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── user/          # User-specific components
│   ├── admin/         # Admin-specific components
│   ├── ui/            # Reusable UI components
│   └── layout/        # Layout and navigation
├── contexts/          # React contexts (Auth)
├── services/          # API service functions
├── types/             # TypeScript type definitions
├── lib/               # Utility libraries
└── config.ts          # Configuration
```

## Key Components

### Authentication
- `Login.tsx` - User sign in
- `Signup.tsx` - User registration
- `AuthContext.tsx` - Authentication state management

### User Components
- `UserDashboard.tsx` - Main user dashboard
- `ApplyForm.tsx` - Job application form
- `ApplicationList.tsx` - List of user applications

### Admin Components
- `AdminDashboard.tsx` - Admin overview dashboard
- `ApplicantDetail.tsx` - Detailed applicant view
- `InternsManagement.tsx` - Manage interns and employees

### UI Components
- `StatusBadge.tsx` - Status indicators
- `DataTable.tsx` - Reusable data table
- `Modal.tsx` - Modal dialogs
- `FormInput.tsx` - Form input fields
- `FileUpload.tsx` - File upload component

## API Integration

The application uses Supabase's JavaScript client for all backend operations:

- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL with RLS
- **Storage**: Supabase Storage for file uploads
- **Real-time**: Supabase real-time subscriptions

## Database Schema

The application expects the following tables:
- `users` - User profiles and roles
- `applications` - Job applications
- `interviews` - Interview scheduling
- `internships` - Intern/employee offers
- `documents` - User document uploads
- `templates` - Offer letter templates
- `certificates` - Completion certificates
- `admin_actions` - Audit trail

## Usage

### For Users
1. Sign up for an account
2. Complete your profile
3. Apply for internships or full-time positions
4. Upload required documents
5. Track application status
6. Attend scheduled interviews
7. Accept offers and complete onboarding

### For Admins
1. Sign in with admin credentials
2. Review submitted applications
3. Schedule interviews with candidates
4. Make job offers
5. Manage active interns and employees
6. Generate certificates upon completion

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new components in appropriate directories
2. Add new service functions for API calls
3. Update types as needed
4. Add new routes to the App component
5. Update navigation in Layout component

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel/Netlify

1. Connect your repository
2. Set environment variables
3. Deploy automatically on push

## Troubleshooting

### Common Issues

1. **Supabase Connection Errors**: Check environment variables and project URL
2. **Authentication Issues**: Verify Supabase Auth settings
3. **File Upload Failures**: Check storage bucket permissions
4. **RLS Policy Errors**: Ensure proper database policies are set

### Getting Help

- Check Supabase documentation
- Review React and TypeScript documentation
- Check browser console for errors
- Verify environment configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
