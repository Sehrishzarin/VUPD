# `VU Proctors-Diary`

> **A premium web platform designed to digitize exam invigilation, scheduling, and payroll for Virtual University centers.**

---

### 📋 `Project Overview`

> "The `VU Proctors-Diary` is a specialized solution for managing exam logistics. It automates the assignment of `Superintendents` and `Invigilators`, tracks `Attendance` in real-time, and streamlines `Payment Processing` through a centralized dashboard."

---

### 🚀 `Functional Requirements`

* **`Staff Management`**: Proctors can register profiles with `Employee ID`, `Center Preferences`, and `Qualifications`.
* **`Smart Scheduling`**: An automated `Duty Assignment System` that checks for `Scheduling Conflicts` and staff `Availability`.
* **`Automated Alerts`**: Integration for `Email` and `SMS Notifications` to keep staff updated on duty changes.
* **`Attendance & Reporting`**: 
    * `Superintendents` upload daily `Attendance Reports`.
    * `Admin` performs `Duty Verification` for every exam session.
* **`Leave Portal`**: Staff can apply for `Leaves`, which instantly updates the `Scheduling Engine`.
* **`Finance Hub`**: Automatic `Payment Generation` based on verified duties and `Attendance Calculation`.

---

### 🛠 `Technology Stack`

> **Front-End Architecture**
> * `React JS` — For building a dynamic User Interface.
> * `Ant Design` — A professional UI library for high-quality components.
> * `Context API` — For efficient global `State Management`.

> **Back-End Architecture**
> * `Node.js` & `Express` — Handling the server-side logic and `RESTful APIs`.
> * `MongoDB` — A flexible `NoSQL Database` for storing staff records and duty logs.

---

### ⚙️ `System Workflow`

1.  **`Registration`**: Staff create accounts and set their `Availability`.
2.  **`Allocation`**: Admin assigns duties; the system runs a `Conflict Check`.
3.  **`Execution`**: Staff receive `SMS Alerts` and mark `Attendance` on-site.
4.  **`Verification`**: Superintendents upload `Reports`; Admin verifies logs.
5.  **`Payout`**: The `Finance Department` processes payments via the platform.

---

### 🎓 `Project Details`

> **Project ID**: `S25PROJECTD59AC`  
> **Institution**: `Virtual University of Pakistan`  
> **Developer**: `Sehrish Zarin`  
> **Status**: `Final Year Project`

---

### 📦 `Installation & Setup`

> To run this project locally, follow these steps:

1. **`Clone Repository`**
   `git clone https://github.com/yourusername/vu-proctors-diary.git`

2. **`Setup Backend`**
   `cd Backend && npm install && nodemon server.js`

3. **`Setup Frontend`**
   `cd Frontend && npm install && npm run dev`