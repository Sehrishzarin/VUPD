# VU Proctors' Diary

A MERN-stack web platform built to digitize exam invigilation logistics for Virtual University: automated duty scheduling, multi-tier attendance verification, and payroll processing for proctors across examination centers.

**Final Year Project** · Project ID `S25PROJECTD59AC` · Virtual University of Pakistan
Developed by **Sehrish Zarin**, BS Computer Science

[Project Documentation](https://github.com/Sehrishzarin/VUPD/tree/main/Documentation) · [Final Report](https://docs.google.com/document/d/1D_FD53tJDuYTTmAlHKlqTfXPISdZnG2Re_XDF-FM5WQ/edit?usp=sharing)

---

## Overview

Exam centers coordinate dozens of Superintendents and Invigilators per session, and doing that manually means scheduling conflicts, untracked attendance, and delayed payments. This project replaces that manual process with a role-based web application where:

- Admins allocate duties and approve payroll
- Superintendents supervise a center, verify attendance, and manage their own team's leave requests
- Invigilators view their assigned duties, check in on-site, and track their earnings

## Core Features

**Role-Based Access Control (RBAC)**
REST API endpoints secured with JWT authentication. Route access is restricted through middleware (`verifyToken`, `verifyAdmin`, `verifySuperintendent`) so each role can only reach its own permitted actions.

**Smart Duty Allocation Engine**
Automated assignment logic that checks proctor availability, exam center preferences, and active leave records before assigning a duty, preventing double-booking and scheduling overlaps.

**Digital Attendance Verification**
Two-stage verification: Invigilators log attendance on arrival, Superintendents upload session summary reports, and Admins verify records before payment logs unlock.

**Real-Time Notifications**
Socket.io event layer pushing instant updates for shift assignments, duty changes, and leave approvals directly to connected proctor sessions.

**Automated Payroll Calculation**
Stipends are calculated from verified session hours, with a proctor-initiated withdrawal request pipeline and an admin batch approval step.

**Exam Conduct Reporting**
Superintendent reporting portal with file uploads (via `multer`) for daily attendance sheets, incident logs, and center operational summaries.

## System Workflow

1. **Registration** — Staff create profiles and set weekly availability and center preferences.
2. **Allocation** — Admin triggers duty generation; the conflict-check engine matches qualified, available staff to exam shifts.
3. **Dispatch** — Socket.io and email notifications alert assigned staff.
4. **Execution** — Invigilators check in on-site; Superintendents upload attendance and incident reports.
5. **Verification** — Admin reviews and verifies submitted records.
6. **Payout** — Verified duty hours flow into the payroll engine; Admin approves withdrawal batches.

## Technology Stack

**Frontend**
- React 19
- Ant Design — component library
- Context API (`AuthContext`) — persistent auth state, role-based redirection, and Socket.io connection handling

**Backend**
- Node.js & Express 5 — REST API and server-side logic
- MongoDB & Mongoose — structured schemas with object references between `User`, `Duty`, `Leave`, `Attendance`, and `Withdrawal` models
- Socket.io — real-time push notifications
- JWT — stateless authentication via Bearer tokens attached through Axios interceptors
- Nodemailer — email notifications
- Chart.js — analytics dashboard

## Deployment Note

This project was built and evaluated as an academic Final Year Project. The backend connects to a MongoDB Atlas cluster (`vupd`) but runs on a local Express server rather than a hosted deployment, in line with standard FYP evaluation practice (local demonstration and testing rather than continuous paid cloud hosting). There is no live public instance.

## Installation & Setup

**Prerequisites:** Node.js, npm, and a MongoDB connection string (local or Atlas).

```bash
# Clone the repository
git clone https://github.com/yourusername/vu-proctors-diary.git
cd vu-proctors-diary

# Backend
cd Backend
npm install
# create a .env file with MONGO_URI, JWT_SECRET, and email credentials
nodemon server.js

# Frontend (new terminal)
cd Frontend
npm install
npm run dev
```

## Roles at a Glance

| Role | Access |
|---|---|
| Admin | Full system authority: user approval, duty allocation override, exam center configuration, payroll approval |
| Superintendent | Center-level supervision: attendance verification, leave approval for their team, session reporting |
| Invigilator | Personal duty view, on-site attendance check-in, leave requests, earnings tracking |

## Project Status

Completed as a Final Year Project for Virtual University of Pakistan. Not currently deployed to a live environment; see the Deployment Note above.
