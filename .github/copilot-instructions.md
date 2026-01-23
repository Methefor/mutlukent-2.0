# Mutlukent 2.0 - AI Coding Agent Instructions

## Project Overview
**Mutlukent 2.0** is a Next.js-based sales dashboard application for managing daily reports across multiple branches. Built with TypeScript, React 19, and Supabase for real-time data management.

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, TypeScript 5
- **Database**: Supabase (PostgreSQL)
- **UI**: shadcn/ui (Radix UI primitives) + Tailwind CSS 4
- **Forms**: React Hook Form + Zod validation
- **Charts**: ECharts for data visualization
- **Auth**: Supabase Auth with Server Components

### Directory Structure
```
app/                    # Next.js App Router
  (auth)/              # Authentication routes (route groups)
    login/             # Login page
  (dashboard)/         # Protected dashboard routes
    dashboard/         # Main dashboard & reports
    reports/           # Detailed reports page
    layout.tsx         # Shared dashboard layout
  layout.tsx           # Root layout with AuthProvider
  globals.css          # Tailwind directives

components/
  ui/                  # shadcn/ui component library (generated)
  layout/              # Sidebar, Header (reusable layout)
  forms/               # Form components (e.g., daily-report-form)
  dashboard/           # Dashboard-specific components

lib/
  supabase/           # Supabase client setup
    client.ts         # Browser client
    server.ts         # Server-side client
    database.types.ts # Auto-generated types
  auth/               # Authentication context & actions
    context.tsx       # AuthProvider & useAuth hook
    actions.ts        # Auth server actions
  actions/            # Server actions for data fetching
    dashboard.ts      # Dashboard stats & trends
    reports.ts        # Report data operations
    branches.ts       # Branch data operations
  utils.ts            # Utility functions (cn for class merging)
```

## Authentication & Authorization Flow

### Admin-Only Mode
- **Simplified approach**: Only "admin" role exists
- All authenticated users have full application access
- No role-based menu hiding or feature restrictions
- No branch-level access control

### Middleware Protection (`middleware.ts`)
- Server-side route protection using Supabase SSR
- Redirects unauthenticated users from `/dashboard` → `/login`
- Redirects authenticated users from `/login` → `/dashboard`
- Works with route groups: `(auth)` and `(dashboard)` are logically separated

### Auth Context (`lib/auth/context.tsx`)
- Wraps entire app as `<AuthProvider>` in root `layout.tsx`
- `useAuth()` hook provides:
  - `user` object (authenticated session)
  - Session state for conditional rendering
- Simple auth check: if `user` exists, user is authenticated

## Key Features & Patterns

### 1. Server Actions (`'use server'`)
Server actions handle all data fetching from Supabase. Examples:
- `getDashboardStats()`: Calculates daily/weekly/monthly sales from `daily_reports` table
- `getWeeklyTrend()`: Time-series data for chart visualization
- `getTopBranches()`: Aggregates sales by branch (top 5 this month)
- `getRecentReports()`: Fetches 5 latest reports with branch data

**Pattern**: Functions format dates using Turkish locale (`date-fns/locale/tr`) and return typed objects (e.g., `DashboardStats`, `SalesTrend[]`).

### 2. Database Schema & Relations
- **daily_reports**: `id`, `report_date`, `total_sales`, `branch_id`
- **branches**: `id`, `name` (related via foreign key)
- Server actions use `.select()` with nested relations to fetch joined data

### 3. UI Component Hierarchy
- Dashboard layout uses flexbox grid with collapsible sidebar
- Sidebar: Role-based menu filtering + active route highlighting
- Mobile: MobileSidebar sheet component for responsive design
- Cards, Charts, Tables use shadcn/ui with Tailwind styling

### 4. Form Handling
- React Hook Form for state management
- Zod for validation schemas
- shadcn/ui form wrapper components in `components/ui/form.tsx`
- Example: `components/forms/daily-report-form.tsx`

### 5. Charts & Visualization
- ECharts-for-React wrapper
- Data formatted from server actions
- Example: `components/dashboard/sales-chart.tsx` (weekly trend visualization)

## Development Workflow

### Commands
```bash
npm run dev      # Start development server on http://localhost:3000
npm run build    # Production build
npm run start    # Run production server
npm run lint     # ESLint check (no fix)
```

### Environment Variables (`lib/supabase/client.ts`)
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Path Aliases (TypeScript)
Configured in `tsconfig.json`:
- `@/*` → root directory
- Components, utils, lib, hooks accessible via `@/components`, `@/lib`, etc.

## Common Development Tasks

### Adding a New Protected Route
1. Create route in `app/(dashboard)/newroute/page.tsx`
2. Add menu item to `menuItems` in `components/layout/sidebar.tsx` with role filtering
3. Create server action in `lib/actions/newroute.ts` for data fetching
4. Implement page component using the server action

### Adding a New UI Component
1. Use `npx shadcn-ui@latest add <component>` (already configured via `components.json`)
2. Component added to `components/ui/` with Tailwind styling
3. Import and use in feature components

### Creating a Server Action
1. Create `.ts` file in `lib/actions/`
2. Start with `'use server'` directive
3. Use `createClient()` from `@/lib/supabase/server` for database queries
4. Return typed objects (define types at file top)
5. Handle errors gracefully (log, return empty/default)

### Admin-Only Access Pattern
All authenticated users have full access (admin-only mode):
```tsx
const { user } = useAuth()
if (!user) return <LoginPrompt />

// Render full UI - no conditional visibility needed
return <AdminDashboard />
```

## Critical Conventions

1. **Turkish Locale**: All date formatting uses `date-fns` with Turkish locale (`tr`)
2. **Class Names**: Use `cn()` utility from `@/lib/utils` to merge Tailwind classes
3. **Component Naming**: Feature components in subdirectories (e.g., `components/dashboard/`), UI components in `components/ui/`)
4. **Error Handling**: Log errors to console, return safe defaults instead of throwing
5. **Database Queries**: Always use Supabase client from server context, never expose raw queries to client

## Important Files Reference

- [middleware.ts](middleware.ts) - Route protection logic
- [lib/auth/context.tsx](lib/auth/context.tsx) - Auth provider & hook
- [lib/actions/dashboard.ts](lib/actions/dashboard.ts) - Core stats calculations
- [components/layout/sidebar.tsx](components/layout/sidebar.tsx) - Navigation & role-based filtering
- [app/(dashboard)/layout.tsx](app/(dashboard)/layout.tsx) - Dashboard grid layout
- [components.json](components.json) - shadcn/ui configuration & path aliases
