# Job Posting & Applicant Management Feature Plan (v2)

## Overview
This feature introduces the ability for admins to post job openings on behalf of specific businesses (clients). It includes a public-facing API to display these jobs and a comprehensive Applicant Tracking System (ATS) inside the dashboard.

The ATS features a **Kanban-style applicant management** board where admins can visualize and drag-and-drop applicants through customizable hiring stages. When an applicant is hired and converted to staff, an automated welcome email is sent.

---

## Decisions (Resolved)

| # | Question | Decision |
|---|----------|----------|
| 1 | **Application Submission** | Build a **public POST endpoint** (`POST /api/public/jobs/:jobId/apply`) for applicants to submit applications. |
| 2 | **Resume Storage** | Resume is a **plain string** — a Google Drive link provided by the applicant. No file upload needed. |
| 3 | **Custom Stages vs Standard** | **Custom stages per job**, but provide a **default template** on the frontend so admins can auto-populate a standard pipeline with one click instead of building from scratch. |
| 4 | **Automated Messages** | **No automated messages** at this time (no notifications on stage changes). |
| 5 | **Staff Onboarding Email** | **Yes** — when an applicant is converted to staff (hired), send an **automated welcome email** with their login credentials using the existing nodemailer plugin. |

---

## Conflict Analysis with Existing Code

> [!WARNING]
> The existing `applicant` module needs significant modification. Below is a summary of every conflict and how we'll resolve it.

### 1. Applicant Schema Conflicts

**Current** (`applicant.schema.ts`):
- Uses `position: string` for job title — a free-text field on the application
- Uses `businessId: string` to link to a business directly
- Has `status` enum: `pending | reviewed | shortlisted | interviewed | hired | rejected`
- Has `resumeUrl?: string` validated as `z.string().url()` (strict URL format)
- Has `appliedAt: string`

**New Design**:
- Add `jobId: string` field to link applicant → job post
- **Keep** `businessId` (denormalized from the job post for quick filtering)
- **Keep** `position` (denormalized from the job post title)
- **Replace** `status` enum with `stage: string` — now references a dynamic stage from the job post's `stages` array
- **Change** `resumeUrl` to `resume?: string` — a plain Google Drive link (relax the `.url()` validator to `.string()`)
- **Add** `isStaffConverted: boolean` and `staffId?: string` for the hire→staff workflow
- **Remove** resume upload endpoint (Cloudinary upload) — no longer needed

### 2. Applicant Types Conflicts (`applicant.types.ts`)

- `applicantStatusEnum` will be removed — stages are now dynamic per job
- `createApplicantSchema` needs `jobId` added, `businessId` auto-resolved from job
- `updateApplicantSchema` needs `stage` instead of `status`
- All JSON schemas need corresponding updates

### 3. Applicant Routes Conflicts (`applicant.routes.ts`)

- `POST /applicants` (public create) → will be replaced by `POST /api/public/jobs/:jobId/apply`
- `POST /applicants/:id/resume` (Cloudinary upload) → **remove entirely** (resume is now a string field)
- Filter queries need to support `jobId` in addition to `businessId`

### 4. No Conflicts with Other Features

- **EOD Feature**: No overlap. EOD is for staff daily reports.
- **Invoice Feature**: No overlap. Invoices are generated from approved EODs.
- **Staff Module**: The hire→staff conversion logic will **call into** the existing staff creation flow. We need to ensure the staff creation logic is accessible (currently in `staff.management` module). We'll import and reuse it.

---

## Core Components

### 1. Job Posts (Requisitions)

A new `jobPosts` collection and module. Admins create job descriptions tied to a business.

**Fields**:
- `businessId`: The client this job is for.
- `title`: Job title (e.g., "Virtual Assistant", "Customer Service Rep").
- `description`: Detailed job description (rich text / markdown).
- `requirements`: List of skills/requirements.
- `employmentType`: `full-time`, `part-time`, `contract`.
- `status`: `draft`, `open`, `closed`.
- `stages`: Array of stage objects defining the Kanban pipeline for this job.
- `isActive`: Soft delete flag.

### 2. Public API for Jobs

Unauthenticated endpoints for external career pages:
- `GET /api/public/jobs?businessId=xxx` — list all `open` jobs for a specific business only
- `GET /api/public/jobs/:id` — get a single job post detail
- `POST /api/public/jobs/:jobId/apply` — submit a job application

### 3. Applicant Management (Updated ATS)

When a candidate applies via the public endpoint, an applicant record is created with `stage` set to the first stage from the job post's `stages` array.

### 4. Custom Kanban Stages

Each job post has its own `stages` array. The frontend provides a **default template** that pre-fills standard stages on job creation, but admins can fully customize them.

**Default Template** (frontend-provided, not enforced by backend):
1. `New Application`
2. `Screening`
3. `1st Interview`
4. `2nd Interview`
5. `Offer Extended`
6. `Hired`
7. `Rejected`

---

## Proposed Schemas

### `jobPost.schema.ts` [NEW]
```typescript
export interface JobPostStage {
    id: string;         // Unique stage identifier (uuid or slug)
    name: string;       // Display name (e.g., "1st Interview")
    order: number;      // Sort order for Kanban columns
    type: 'active' | 'hired' | 'rejected'; // Determines behavior
}

export interface JobPostDocumentType {
    _id?: string;
    businessId: string;
    title: string;
    description: string;
    requirements: string[];
    employmentType: 'full-time' | 'part-time' | 'contract';
    status: 'draft' | 'open' | 'closed';
    stages: JobPostStage[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
```

> **Note on `stages[].type`**: The `type` field determines special behavior:
> - `active` — normal pipeline stage (drag freely)
> - `hired` — triggers the staff conversion workflow when an applicant is moved here
> - `rejected` — marks the applicant as rejected (archived/filtered out)

### `applicant.schema.ts` [MODIFY]
```typescript
export interface ApplicantDocument {
    _id?: string;
    jobId: string;          // Ref to JobPost
    businessId: string;     // Denormalized from JobPost for filtering
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    position: string;       // Denormalized from JobPost.title
    resume?: string;        // Google Drive link (plain string)
    coverLetter?: string;
    stage: string;          // References a stage ID from the job post's stages array
    adminNotes?: string;
    isStaffConverted: boolean;  // Flag: has been added to Staff collection
    staffId?: string;           // Reference to the created Staff document
    isActive: boolean;
    appliedAt: string;
    createdAt: string;
    updatedAt: string;
}
```

---

## Applicant → Staff Conversion Workflow

When an admin drags an applicant to a stage with `type: 'hired'` (or clicks a "Hire" button), the system:

1. **Prompts for salary info** (frontend modal asks for `salary` and `salaryType`).
2. **Creates a Staff record** using existing staff creation logic:
   - `firstName`, `lastName`, `email`, `phone` → from applicant
   - `businessId` → from job post
   - `position` → from job post title
   - `employmentType` → from job post
   - `dateHired` → current date
   - `status` → `active`
   - `password` → auto-generated temporary password (e.g., `FirstName` + 4 random digits)
   - `salary`, `salaryType` → from the admin modal input
3. **Flags the applicant**: `isStaffConverted = true`, `staffId = <new staff _id>`
4. **Sends welcome email** via nodemailer with:
   - Their email address
   - Their temporary password
   - A link to the dashboard login page

---

## API Endpoints Summary

### Public Endpoints (no auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/public/jobs?businessId=xxx` | List all `open` jobs for a specific business |
| `GET` | `/api/public/jobs/:id` | Get single job post detail |
| `POST` | `/api/public/jobs/:jobId/apply` | Submit a job application |

### Admin Job Post Endpoints (auth: admin token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/job-posts` | List all job posts (with filters: businessId, status) |
| `GET` | `/job-posts/:id` | Get single job post with applicant count |
| `POST` | `/job-posts` | Create a new job post |
| `PUT` | `/job-posts/:id` | Update a job post |
| `PATCH` | `/job-posts/:id/status` | Change job post status (draft/open/closed) |
| `DELETE` | `/job-posts/:id` | Soft delete a job post |

### Admin Applicant Endpoints (auth: admin token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/applicants` | List all applicants (filters: businessId, jobId, stage) |
| `GET` | `/applicants/:id` | Get single applicant detail |
| `GET` | `/job-posts/:jobId/applicants` | Get applicants for a specific job (Kanban view) |
| `PATCH` | `/applicants/:id/stage` | Move applicant to a different stage |
| `PATCH` | `/applicants/:id` | Update applicant notes/details |
| `POST` | `/applicants/:id/hire` | Convert applicant to staff member |
| `DELETE` | `/applicants/:id` | Soft delete applicant |

---

## Dashboard Views (Frontend)

### 1. Job Posts List Page
- Table of all job posts with status badges, business name, and applicant count.
- "Create Job Post" button opens a form with the stage template auto-populated.

### 2. Job Post Form
- Fields: title, description, requirements, employment type, business selector.
- **Stages editor**: Pre-filled with the default template. Admin can add, remove, reorder, and rename stages. Each stage has a `type` dropdown (`active` / `hired` / `rejected`).

### 3. Job-Specific Kanban Board
- Columns represent the stages from `jobPost.stages`, sorted by `order`.
- Cards represent applicants with name, email, and applied date.
- Drag-and-drop triggers `PATCH /applicants/:id/stage`.
- Dropping on a `hired`-type stage triggers a hire confirmation modal (salary input).

### 4. Global Applicant Dashboard
- High-level metrics (open jobs, new applicants this week).
- Master table of all applicants across all jobs, filterable by job and stage.

---

## New Files to Create

| File | Type | Description |
|------|------|-------------|
| `src/types/jobPost.types.ts` | Types | Zod schemas + JSON schemas for job posts |
| `src/schema/jobPost.schema.ts` | Schema | TypeScript interfaces for job post documents |
| `src/modules/job-post/jobPost.controllers.ts` | Controller | CRUD + status change for job posts |
| `src/modules/job-post/jobPost.routes.ts` | Routes | Admin routes for job post management |
| `src/modules/job-post/public.jobPost.routes.ts` | Routes | Public routes for job listing + application submission |

## Files to Modify

| File | Change |
|------|--------|
| `src/types/applicant.types.ts` | Replace `status` enum with `stage` string, add `jobId`, change `resumeUrl` to `resume` string, add hire fields |
| `src/schema/applicant.schema.ts` | Update interface to match new schema |
| `src/modules/applicant/applicant.controllers.ts` | Add `stage` update, hire/convert logic, remove resume upload, update create to use `jobId` |
| `src/modules/applicant/applicant.routes.ts` | Update routes, remove resume upload route, add stage/hire endpoints |
| `src/routes/routes.ts` | Register new job post routes (admin + public) |

---

## Implementation Order

1. **Job Post types, schema, module** — create the full CRUD + public listing
2. **Update applicant types & schema** — migrate to `jobId` + `stage` model
3. **Update applicant controllers & routes** — public apply, stage move, hire endpoint
4. **Hire → Staff conversion + welcome email** — reuse staff creation + nodemailer
5. **Register new routes** in `routes.ts`
6. **Frontend** (future): Job post form with stage template, Kanban board, global dashboard

---

## Verification Plan

### Automated Testing
Since there is no existing test suite, we will verify via API testing:
1. Build the project with `npm run build` to catch TypeScript compilation errors.
2. Test all endpoints manually with a REST client (Postman/Thunder Client) once the server is running.

### Manual Verification Steps
1. **Start the server**: `npm run dev` from `d:\ReactJS\CLIENT\AVS DASHBOARD\BACKEND`
2. **Create a job post** via `POST /job-posts` with sample data and custom stages
3. **List public jobs** via `GET /api/public/jobs?businessId=xxx` — verify only `open` jobs appear
4. **Submit a public application** via `POST /api/public/jobs/:jobId/apply` — verify applicant is created with the first stage
5. **Move applicant through stages** via `PATCH /applicants/:id/stage` — verify stage updates
6. **Hire an applicant** via `POST /applicants/:id/hire` — verify staff record is created and welcome email is sent
7. **Check for regressions** by testing existing endpoints (`GET /applicants`, `GET /applicants/:id`, `DELETE /applicants/:id`)
