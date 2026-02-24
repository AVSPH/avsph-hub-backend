# Job Posting & Applicant Management Feature Plan

## Overview
This feature introduces the ability for admins to post job openings on behalf of specific businesses (clients). It includes a public-facing API to display these jobs and a comprehensive Applicant Tracking System (ATS) inside the dashboard.

The ATS features a **Kanban-style applicant management** board where admins can visualize and drag-and-drop applicants through various hiring stages (e.g., Application Received, 1st Screening, 2nd Screening, Interview, Offered, Rejected).

## Core Components

### 1. Job Postings (Requisitions)
Admins need to create and manage job descriptions linked to a specific business.
- **Fields**:
  - `businessId`: The client this job is for.
  - `title`: Job title (e.g., "Virtual Assistant", "Customer Service Rep").
  - `description`: Detailed job description.
  - `requirements`: List of skills/requirements.
  - `status`: `open`, `closed`, `draft`.
  - `type`: Full-time, Part-time, Contract, etc.
  - Public visibility flag.

### 2. Public API for Jobs
An unauthenticated endpoint (`GET /api/public/jobs`) that lists all currently `open` job posts. This will likely be consumed by a careers page or external website to show available roles.

### 3. Applicant Management (The ATS)
When a candidate applies (likely via a public site consuming another public API endpoint), an applicant record is created. 
- **Fields**:
  - `jobId`: The specific job post applied to.
  - `firstName`, `lastName`, `email`, `phone`.
  - `resumeUrl`: Link to uploaded resume.
  - `portfolioUrl`: Link to portfolio (optional).
  - `stage`: The current Kanban stage.
  - `notes`: Admin notes on the candidate.
  - `appliedAt`: Timestamp.

### 4. Kanban Stages (The Pipeline)
To enable the drag-and-drop workflow, we need defined stages. We can either hardcode these stages or make them customizable per business/job. 
*Recommendation: Start with a hardcoded, standard pipeline to keep the initial MVP simple.*
- **Proposed Standard Stages**:
  1. `New Application`
  2. `Screening`
  3. `1st Interview`
  4. `2nd Interview`
  5. `Offer Extended`
  6. `Hired`
  7. `Rejected` (Usually a separate "archived" bucket rather than a column, but can be a column).

## Proposed Schemas

### `jobPost.schema.ts`
```typescript
export interface JobPostDocument {
    _id?: string;
    businessId: string; // The client
    title: string;
    description: string;
    requirements: string[]; // Or rich text string
    employmentType: 'Full-time' | 'Part-time' | 'Contract';
    status: 'draft' | 'open' | 'closed';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
```

### `applicant.schema.ts`
```typescript
export type ApplicantStage = 
  | 'new' 
  | 'screening' 
  | 'first_interview' 
  | 'second_interview' 
  | 'offer' 
  | 'hired' 
  | 'rejected';

export interface ApplicantDocument {
    _id?: string;
    jobId: string; // Ref to JobPost
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    resumeUrl?: string; // S3 or equivalent link
    coverLetter?: string;
    stage: ApplicantStage; // The Kanban column
    adminNotes?: string;
    isActive: boolean;
    createdAt: string; // Application date
    updatedAt: string;
}
```

## Dashboard Views (Frontend)

1. **Global Applicant Dashboard**:
   - A high-level overview showing metrics (e.g., Total open jobs, total new applicants this week).
   - A master list/table of all applicants across all jobs, with filtering by `Job` and `Stage`.

2. **Job-Specific Kanban Board**:
   - When an admin clicks on a specific Job Post, they see the Kanban board.
   - Columns represent the `ApplicantStage`.
   - Cards represent the applicants.
   - Dragging a card from "Screening" to "1st Interview" triggers an API call (`PATCH /api/applicants/:id/stage`) to update the applicant's status in the database.

## Questions for You
1. **Application Submission**: Do you already have a form where applicants apply, or will we need to build a public POST endpoint for applications as well?
2. **Resume Storage**: Where will resumes be stored? (e.g., AWS S3, local storage, another cloud provider)?
3. **Custom Stages vs. Standard Stages**: Are you okay with the standard stages proposed above (`new`, `screening`, `first_interview`, etc.), or do you need the ability to create completely custom stages for every single job?
4. **Notifications**: Do we need to send automated emails when an applicant receives an offer or gets rejected?

Please review this plan and let me know your thoughts on the questions above!
