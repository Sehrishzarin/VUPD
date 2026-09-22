import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { motion } from "framer-motion";
import { 
  Github, 
  BookOpen, 
  ClipboardCheck, 
  Shield, 
  Users, 
  UserCheck, 
  Calendar, 
  Bell, 
  FileText, 
  DollarSign, 
  Database, 
  Cpu, 
  Globe, 
  Lock, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  BarChart3, 
  Layers, 
  Server, 
  Terminal, 
  ArrowRight, 
  Code2, 
  CheckCircle,
  Settings,
  Target
} from "lucide-react";
import logo from "../assets/logo1.png";
import "./RoleSelection.css";

// Tech Stack Tag Component
const TechTag = ({ name, icon: Icon }) => (
  <div className="tech-tag">
    {Icon && <Icon size={14} className="tech-tag-icon" />}
    <span>{name}</span>
  </div>
);

// Stat Card Component
const SystemMetric = ({ value, label, description }) => (
  <div className="system-metric-card">
    <div className="metric-value">{value}</div>
    <div className="metric-label">{label}</div>
    <div className="metric-desc">{description}</div>
  </div>
);

const RoleSelection = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("allocation");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const workflows = {
    allocation: {
      title: "1. Conflict-Free Duty Allocation",
      subtitle: "Automated matching engine ensuring zero shift overlaps",
      steps: [
        { step: "01", title: "Availability Input", desc: "Proctors set weekly availability schedules and preferred exam center locations in their portal profile." },
        { step: "02", title: "Conflict Check Engine", desc: "System checks existing duty rosters, pending leave requests, and session timing overlaps." },
        { step: "03", title: "Smart Assignment", desc: "Admin triggers duty generation; algorithm matches qualified staff to examination shifts." },
        { step: "04", title: "Instant Dispatch", desc: "Socket.io websockets & email notifications send shift assignments to proctor dashboards." }
      ]
    },
    attendance: {
      title: "2. Two-Step Attendance Audit",
      subtitle: "Verified reporting mechanism for exam integrity",
      steps: [
        { step: "01", title: "On-Site Check-In", desc: "Invigilators mark digital attendance upon arriving at the assigned exam center." },
        { step: "02", title: "Superintendent Report", desc: "Center Superintendent uploads daily session attendance logs and exam conduct reports." },
        { step: "03", title: "Admin Audit", desc: "Admin reviews superintendent logs against invigilator check-ins for duty verification." },
        { step: "04", title: "Status Locking", desc: "Verified duties transition to 'Completed' state, locking records for payroll calculation." }
      ]
    },
    payroll: {
      title: "3. Automated Payroll & Payouts",
      subtitle: "Stipend calculation based on verified duty logs",
      steps: [
        { step: "01", title: "Duty Log Verification", desc: "System compiles all admin-verified duties for the billing cycle." },
        { step: "02", title: "Stipend Calculation", desc: "Calculates total remuneration based on role rates, hours served, and approved sessions." },
        { step: "03", title: "Withdrawal Request", desc: "Proctors submit payout requests via their financial hub dashboard." },
        { step: "04", title: "Finance Approval", desc: "Admin approves payout batches and exports payment dispatches for disbursement." }
      ]
    }
  };

  const userRolesData = [
    {
      role: "admin",
      title: "Administrator",
      icon: Settings,
      badgeColor: "#ef4444",
      permissions: "Full System Authority (Read/Write/Delete)",
      capabilities: [
        "User account approval & role elevation (Superintendent/Invigilator)",
        "Automated conflict-check duty allocation & manual override",
        "Exam center management & capacity configuration",
        "Attendance report verification & absentees auto-marking",
        "Payroll approval & withdrawal batch processing"
      ]
    },
    {
      role: "superintendent",
      title: "Superintendent",
      icon: UserCheck,
      badgeColor: "#3b82f6",
      permissions: "Center Operations & Supervision Tier",
      capabilities: [
        "View center duty rosters and assigned invigilators",
        "Mark session attendance for allocated exam shifts",
        "Upload daily examination conduct & attendance reports",
        "Submit leave applications & update availability status",
        "Track verified duty history & submit payout requests"
      ]
    },
    {
      role: "invigilator",
      title: "Invigilator",
      icon: Users,
      badgeColor: "#8b5cf6",
      permissions: "Exam Duty Execution Tier",
      capabilities: [
        "View personalized exam duty schedules & hall assignments",
        "Digital attendance check-in for active exam shifts",
        "Update venue preferences & weekly availability calendar",
        "Submit duty leave requests with conflict validation",
        "View earned stipends & submit withdrawal requests"
      ]
    }
  ];

  return (
    <div className="case-study-page">
      {/* SINGLE Sticky Header Navbar */}
      <header className={`sticky-header ${isScrolled ? "header-scrolled" : ""}`}>
        <div className="header-container">
          <div className="header-brand">
            <img src={logo} alt="VU Logo" className="brand-logo" />
            <div className="brand-text">
              <span className="brand-title">VU Proctors' Diary</span>
              <span className="brand-subtitle">Final Year Project | VU</span>
            </div>
          </div>

          <nav className="header-nav">
            <a href="#overview">Overview</a>
            <a href="#architecture">Workflow</a>
            <a href="#capabilities">Capabilities</a>
            <a href="#roles">Roles</a>
            <a href="#engineering">Engineering</a>
          </nav>

          <div className="header-actions">
            <a 
              href="https://github.com/Sehrishzarin/VUPD" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="github-nav-btn"
            >
              <Github size={16} />
              <span>GitHub Repo</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section - Case Study Style */}
      <section id="overview" className="hero-section">
        <div className="case-study-container">
          <div className="hero-content">
            <div className="meta-badge">
              <Code2 size={14} className="meta-icon" />
              <span>Academic Final Year Project (S25PROJECTD59AC) &bull; Virtual University of Pakistan</span>
            </div>

            <h1 className="hero-title">
              VU Proctors' <span className="highlight-text">Diary</span>
            </h1>

            <p className="hero-description">
              A specialized MERN-stack web platform designed to digitize exam invigilation logistics, 
              automated shift scheduling, multi-tier attendance verification, and payroll processing 
              for Virtual University examination centers.
            </p>

            <div className="tech-stack-row">
              <TechTag name="React 19" icon={Cpu} />
              <TechTag name="Node.js" icon={Server} />
              <TechTag name="Express 5" icon={Globe} />
              <TechTag name="MongoDB & Mongoose" icon={Database} />
              <TechTag name="Socket.io" icon={Zap} />
              <TechTag name="JWT Security" icon={Lock} />
              <TechTag name="Ant Design" icon={Layers} />
            </div>

            <div className="hero-cta-group">
              <a 
                href="https://github.com/Sehrishzarin/VUPD" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary"
              >
                <Github size={18} />
                <span>View Source Code</span>
              </a>

              <a 
                href="https://github.com/Sehrishzarin/VUPD/tree/main/Documentation" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-secondary"
              >
                <BookOpen size={18} />
                <span>Project Documentation</span>
              </a>

              <a 
                href="https://docs.google.com/document/d/1D_FD53tJDuYTTmAlHKlqTfXPISdZnG2Re_XDF-FM5WQ/edit?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-secondary"
              >
                <ClipboardCheck size={18} />
                <span>Final Report (Google Doc)</span>
              </a>
            </div>

            <div className="author-card">
              <div className="author-info">
                <span className="author-label">Developed By</span>
                <span className="author-name">Sehrish Zarin</span>
                <span className="author-detail">BS Computer Science &bull; Virtual University of Pakistan</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Metrics Section */}
      <section className="metrics-section">
        <div className="case-study-container">
          <div className="metrics-grid">
            <SystemMetric 
              value="3 Roles" 
              label="RBAC Architecture" 
              description="Admin, Superintendent, and Invigilator with strict JWT middleware enforcement." 
            />
            <SystemMetric 
              value="5 Subsystems" 
              label="Core Modules" 
              description="Auth, Shift Allocation, Attendance Audit, Leave Portal, and Payroll Processing." 
            />
            <SystemMetric 
              value="100%" 
              label="Conflict Validation" 
              description="Automated pre-assignment check against shift overlaps and pending leaves." 
            />
            <SystemMetric 
              value="2-Step Audit" 
              label="Attendance Integrity" 
              description="Digital on-site check-in backed by Superintendent session report verification." 
            />
          </div>
        </div>
      </section>

      {/* System Workflow & Architecture Section */}
      <section id="architecture" className="section-padding alt-bg">
        <div className="case-study-container">
          <div className="section-header">
            <span className="section-kicker">System Architecture</span>
            <h2 className="section-heading">Operational Workflow & Logic</h2>
            <p className="section-subheading">
              How data flows between proctors, center superintendents, and administrators to ensure seamless exam execution.
            </p>
          </div>

          <div className="workflow-tabs">
            <button 
              className={`tab-btn ${activeTab === 'allocation' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('allocation')}
            >
              <Calendar size={16} />
              <span>1. Duty Allocation</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'attendance' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('attendance')}
            >
              <UserCheck size={16} />
              <span>2. Attendance Verification</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'payroll' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('payroll')}
            >
              <DollarSign size={16} />
              <span>3. Payroll & Payout</span>
            </button>
          </div>

          <div className="workflow-display-card">
            <div className="workflow-card-header">
              <h3>{workflows[activeTab].title}</h3>
              <p>{workflows[activeTab].subtitle}</p>
            </div>

            <div className="workflow-steps-grid">
              {workflows[activeTab].steps.map((item, idx) => (
                <div key={idx} className="workflow-step-box">
                  <div className="step-number">{item.step}</div>
                  <h4 className="step-title">{item.title}</h4>
                  <p className="step-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Engineering Capabilities */}
      <section id="capabilities" className="section-padding">
        <div className="case-study-container">
          <div className="section-header">
            <span className="section-kicker">Technical Features</span>
            <h2 className="section-heading">Core System Capabilities</h2>
            <p className="section-subheading">
              Key modules implemented in the backend REST API and frontend interface.
            </p>
          </div>

          <div className="capabilities-grid">
            <div className="capability-card">
              <div className="cap-icon-wrapper">
                <Shield size={22} className="cap-icon" />
              </div>
              <h3>Role-Based Access Control (RBAC)</h3>
              <p>
                Secured REST API endpoints using JWT authentication tokens. Route access is 
                restricted by role-checking middleware (`verifyToken`, `verifyAdmin`, `verifySuperintendent`).
              </p>
            </div>

            <div className="capability-card">
              <div className="cap-icon-wrapper">
                <Calendar size={22} className="cap-icon" />
              </div>
              <h3>Smart Duty Allocation Engine</h3>
              <p>
                Automated assignment logic that evaluates proctor availability calendars, exam center 
                preferences, and active leave records to prevent double-booking or scheduling conflicts.
              </p>
            </div>

            <div className="capability-card">
              <div className="cap-icon-wrapper">
                <CheckCircle2 size={22} className="cap-icon" />
              </div>
              <h3>Digital Attendance Verification</h3>
              <p>
                Two-stage verification process: Invigilators log attendance on arrival, while Superintendents 
                upload session summary reports. Administrators verify records before unlocking payment logs.
              </p>
            </div>

            <div className="capability-card">
              <div className="cap-icon-wrapper">
                <Zap size={22} className="cap-icon" />
              </div>
              <h3>Real-Time Websocket Push</h3>
              <p>
                Socket.io event layer delivering instant notifications for shift assignments, duty updates, 
                and leave approval status directly to connected proctor sessions.
              </p>
            </div>

            <div className="capability-card">
              <div className="cap-icon-wrapper">
                <DollarSign size={22} className="cap-icon" />
              </div>
              <h3>Automated Payroll Calculation</h3>
              <p>
                Calculates total stipends based on verified session hours. Includes a proctor withdrawal 
                request pipeline and admin payment batch approval engine.
              </p>
            </div>

            <div className="capability-card">
              <div className="cap-icon-wrapper">
                <FileText size={22} className="cap-icon" />
              </div>
              <h3>Exam Conduct Reporting</h3>
              <p>
                Superintendent reporting portal supporting document and file uploads (`multer` storage) 
                for daily attendance sheets, incident logs, and center operational summaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based System Access Showcase */}
      <section id="roles" className="section-padding alt-bg">
        <div className="case-study-container">
          <div className="section-header">
            <span className="section-kicker">Multi-Tenant Portals</span>
            <h2 className="section-heading">Role-Based System Access</h2>
            <p className="section-subheading">
              Customized interfaces designed for specific administrative and proctoring operational tiers.
            </p>
          </div>

          <div className="roles-showcase-list">
            {userRolesData.map((roleInfo) => (
              <div key={roleInfo.role} className="role-spec-card">
                <div className="role-spec-header">
                  <div className="role-title-group">
                    <roleInfo.icon size={24} style={{ color: roleInfo.badgeColor }} />
                    <h3>{roleInfo.title} Portal</h3>
                  </div>
                  <span className="permissions-badge" style={{ borderColor: `${roleInfo.badgeColor}40`, color: roleInfo.badgeColor }}>
                    {roleInfo.permissions}
                  </span>
                </div>

                <div className="role-spec-content">
                  <h4>Key Subsystem Access & Actions:</h4>
                  <ul className="spec-feature-list">
                    {roleInfo.capabilities.map((cap, i) => (
                      <li key={i}>
                        <CheckCircle size={15} className="spec-check-icon" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engineering Decisions & Architecture Trade-offs */}
      <section id="engineering" className="section-padding">
        <div className="case-study-container">
          <div className="section-header">
            <span className="section-kicker">Engineering Insights</span>
            <h2 className="section-heading">Architecture & Development Trade-offs</h2>
            <p className="section-subheading">
              Technical decisions, data modeling strategies, and deployment rationale.
            </p>
          </div>

          <div className="engineering-grid">
            <div className="eng-card">
              <div className="eng-card-header">
                <Database size={20} className="eng-icon" />
                <h3>Data Modeling & MongoDB Schemas</h3>
              </div>
              <p>
                Structured relational MongoDB models using Mongoose object references for `User`, `Duty`, 
                `Leave`, `Attendance`, and `Withdrawal`. Indexed queries speed up shift availability 
                checks and date range overlaps during duty generation.
              </p>
            </div>

            <div className="eng-card">
              <div className="eng-card-header">
                <Lock size={20} className="eng-icon" />
                <h3>State & Token Security</h3>
              </div>
              <p>
                Stateless JWT authorization using Bearer tokens attached via Axios request interceptors. 
                React Context API (`AuthContext`) manages persistent auth state, role redirection, 
                and Socket.io lifecycle connections.
              </p>
            </div>

            <div className="eng-card full-width-eng">
              <div className="eng-card-header">
                <Terminal size={20} className="eng-icon" />
                <h3>Environment & Deployment Rationale</h3>
              </div>
              <p>
                This project was developed and evaluated as an academic Final Year Project (FYP). The backend 
                is configured to connect to a cloud MongoDB Atlas database (`vupd` cluster) while running on a 
                local Express server environment. 
              </p>
              <div className="deployment-note">
                <AlertCircle size={16} className="note-icon" />
                <span>
                  <strong>Academic Project Note:</strong> In accordance with standard FYP evaluation practices, 
                  the application is designed for local demonstration and testing rather than continuous paid cloud hosting.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Professional Academic Case Study */}
      <footer className="case-study-footer">
        <div className="case-study-container">
          <div className="footer-content">
            <div className="footer-brand-section">
              <div className="footer-brand">
                <img src={logo} alt="VU Logo" className="footer-logo" />
                <span>VU Proctors' Diary</span>
              </div>
              <p className="footer-summary">
                Final Year Project (S25PROJECTD59AC) &bull; Virtual University of Pakistan
              </p>
            </div>

            <div className="footer-links-section">
              <div className="footer-col">
                <h4>Developer</h4>
                <p>Sehrish Zarin</p>
                <p className="footer-subtext">BS Computer Science</p>
              </div>

              <div className="footer-col">
                <h4>Repository & Artifacts</h4>
                <a href="https://github.com/Sehrishzarin/VUPD" target="_blank" rel="noopener noreferrer">GitHub Source Code</a>
                <a href="https://github.com/Sehrishzarin/Vu-Proctors-Diary/tree/main/Documentation" target="_blank" rel="noopener noreferrer">Project Documentation</a>
                <a href="https://docs.google.com/document/d/1D_FD53tJDuYTTmAlHKlqTfXPISdZnG2Re_XDF-FM5WQ/edit?usp=sharing" target="_blank" rel="noopener noreferrer">Final Year Report</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 Sehrish Zarin. Developed for Virtual University Final Year Project Evaluation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RoleSelection;