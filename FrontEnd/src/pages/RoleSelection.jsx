import React, { useState, useEffect, useRef } from "react";
import { Button } from "antd";
import { motion } from "framer-motion";
import { 
  Rocket, 
  CheckCircle2, 
  AlertCircle, 
  Zap,
  Github,
  Shield,
  Users,
  Calendar,
  Bell,
  FileText,
  DollarSign,
  Database,
  Cpu,
  Globe,
  Lock,
  Clock,
  UserCheck,
  BarChart3,
  Mail,
  Upload,
  CheckCircle,
  Settings,
  TrendingUp,
  Award,
  Target,
  LineChart,
  BookOpen,
  ClipboardCheck
} from "lucide-react";
import logo from "../assets/logo1.png";
import "./RoleSelection.css";

// Video Mockup Component with proper path handling
const VideoMockup = ({ src, title, description, role, address }) => {
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const [videoStatus, setVideoStatus] = useState('loading');

  // Get the correct video path
  const getVideoPath = (filename) => {
    // Since this is in src/pages, we need to go up to public folder
    return `/videos/${filename}`;
  };

  const videoPath = getVideoPath(src);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoLoaded = () => {
    console.log(`✅ Video loaded successfully: ${videoPath}`);
    setVideoStatus('loaded');
  };

  const handleVideoError = (e) => {
    console.error(`❌ Error loading video: ${videoPath}`, e);
    setVideoError(true);
    setVideoStatus('error');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="product-mockup"
      style={{ maxWidth: '1000px' }} // Wider for laptop screen recordings
    >
      <div className="mockup-header">
        <div className="mockup-dots">
          <span style={{ background: '#ef4444' }} />
          <span style={{ background: '#f59e0b' }} />
          <span style={{ background: '#10b981' }} />
        </div>
        <div className="mockup-address">{address || "proctors-diary.vu.edu.pk"}</div>
      </div>
      
      <div className="mockup-content">
        {videoError || videoStatus === 'error' ? (
          <div className="video-placeholder">
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(99, 102, 241, 0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              {role === 'admin' && <Settings size={32} color="#6366f1" />}
              {role === 'superintendent' && <UserCheck size={32} color="#3b82f6" />}
              {role === 'invigilator' && <Users size={32} color="#8b5cf6" />}
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '2rem',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <span style={{
                padding: '0.5rem 1.2rem',
                background: 'rgba(99, 102, 241, 0.15)',
                borderRadius: '20px',
                color: '#6366f1',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Zap size={14} />
                {role.toUpperCase()} INTERFACE
              </span>
              <span style={{
                padding: '0.5rem 1.2rem',
                background: 'rgba(59, 130, 246, 0.15)',
                borderRadius: '20px',
                color: '#3b82f6',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <BarChart3 size={14} />
                INTERACTIVE
              </span>
              <span style={{
                padding: '0.5rem 1.2rem',
                background: 'rgba(139, 92, 246, 0.15)',
                borderRadius: '20px',
                color: '#8b5cf6',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Clock size={14} />
                REAL-TIME
              </span>
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative', height: '100%' }}>
            <video
              ref={videoRef}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              onLoadedData={handleVideoLoaded}
              onError={handleVideoError}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain', // Changed from cover to contain for better laptop screen display
                backgroundColor: '#000'
              }}
            >
              <source src={videoPath} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {videoStatus === 'loaded' && (
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '1rem',
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '0.75rem 1.5rem',
                borderRadius: '50px',
                alignItems: 'center',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <button
                  onClick={handlePlayPause}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                </button>
                
                <div style={{ width: '1px', height: '20px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
                
                <button
                  onClick={handleMuteToggle}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {isMuted ? '🔇 Muted' : '🔊 Unmute'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Tech Pill Component with light text
const TechPill = ({ children, icon: Icon }) => (
  <motion.span
    whileHover={{ scale: 1.05, y: -3 }}
    whileTap={{ scale: 0.95 }}
    className="tech-pill-item"
    style={{
      background: 'rgba(99, 102, 241, 0.2)',
      border: '1px solid rgba(99, 102, 241, 0.4)',
      color: '#e0e7ff' // Light text color
    }}
  >
    {Icon && <Icon size={20} color="#c7d2fe" />}
    <span>{children}</span>
  </motion.span>
);

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="feature-card"
  >
    <div className="feature-icon">
      <Icon size={24} color="#6366f1" />
    </div>
    <h4>{title}</h4>
    <p>{description}</p>
  </motion.div>
);

// Animated Stat Card Component
const StatCard = ({ number, label, icon: Icon, color, delay }) => {
  const gradientColors = {
    blue: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
    purple: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    teal: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
    pink: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        scale: 1.05, 
        rotateY: 5,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}
      viewport={{ once: true }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      style={{
        background: gradientColors[color],
        padding: '2rem',
        borderRadius: '16px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        zIndex: 1
      }}></div>
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '60px',
          height: '60px',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '50%',
          marginBottom: '1rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {Icon && <Icon size={28} color="white" />}
        </div>
        
        <div style={{
          fontSize: '2.5rem',
          fontWeight: '900',
          color: 'white',
          marginBottom: '0.5rem',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
        }}>
          {number}
        </div>
        
        <div style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: 'rgba(255, 255, 255, 0.9)',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {label}
        </div>
      </div>
    </motion.div>
  );
};

const RoleSelection = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    { icon: Users, title: "Multi-role Management", description: "Separate interfaces for Admin, Superintendents, and Invigilators with role-based permissions" },
    { icon: Calendar, title: "Smart Scheduling", description: "Automated duty assignment based on availability, qualifications, and location preferences" },
    { icon: Bell, title: "Automated Notifications", description: "Email & SMS notifications for duty assignments, updates, and reminders" },
    { icon: UserCheck, title: "Attendance Tracking", description: "Digital attendance marking with verification system for accuracy" },
    { icon: FileText, title: "Report Management", description: "Superintendents can upload exam reports and daily attendance records" },
    { icon: Clock, title: "Leave Management", description: "Integrated leave application and availability update system" },
    { icon: DollarSign, title: "Payment System", description: "Automated payment calculation and processing for finance department" },
    { icon: BarChart3, title: "Analytics Dashboard", description: "Comprehensive insights on duty allocation, attendance, and performance" },
  ];

  const stats = [
    { number: "3", label: "User Roles", icon: Users, color: "blue" },
    { number: "8", label: "Core Features", icon: Award, color: "purple" },
    { number: "500+", label: "Proctor Capacity", icon: Target, color: "teal" },
    { number: "24/7", label: "Accessibility", icon: Clock, color: "pink" }
  ];

  const userRoles = [
    {
      role: "admin",
      title: "Administrator",
      icon: Settings,
      color: "#ef4444",
      features: [
        "Manage all users (Superintendents & Invigilators)",
        "Assign duties based on availability and qualifications",
        "Verify attendance and reports",
        "Generate payment details",
        "Access comprehensive analytics dashboard",
        "Manage examination centers"
      ],
      video: "admin-demo.mp4",
      description: "Complete administrative control panel for managing the entire examination process"
    },
    {
      role: "superintendent",
      title: "Superintendent",
      icon: UserCheck,
      color: "#3b82f6",
      features: [
        "View assigned duties and schedules",
        "Mark attendance for exams",
        "Upload daily attendance reports",
        "Apply for leave and update availability",
        "View payment details and history",
        "Receive notifications for updates"
      ],
      video: "superintendent-demo.mp4",
      description: "Superintendent interface for managing exam duties and reporting"
    },
    {
      role: "invigilator",
      title: "Invigilator",
      icon: Users,
      color: "#8b5cf6",
      features: [
        "View assigned exam schedules",
        "Mark personal attendance",
        "Update availability status",
        "Apply for leaves",
        "View payment information",
        "Receive duty notifications"
      ],
      video: "invigilator-demo.mp4",
      description: "Invigilator portal for duty management and communication"
    }
  ];

  return (
    <div className="product-page">
      {/* Floating Background Elements */}
      <div className="floating-element" style={{ top: '10%', left: '5%', width: '300px', height: '300px' }}></div>
      <div className="floating-element" style={{ bottom: '20%', right: '5%', width: '250px', height: '250px' }}></div>

      {/* Fixed Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`product-nav ${isScrolled ? "nav-active" : ""}`}
      >
        <div className="nav-inner">
          <motion.div 
            className="nav-brand"
            whileHover={{ scale: 1.05 }}
          >
            <motion.img 
              src={logo} 
              alt="VU Logo" 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            />
            <span>VU Proctors Diary</span>
          </motion.div>
          <div className="nav-cta">
           
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="gradient-btn">
                <Github size={20} />
                <a href="https://github.com/Sehrishzarin/Vu-Proctors-Diary">
                <span>Source Code</span></a>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-text-center"
          >
            <motion.div 
              className="tech-badge"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                background: 'rgba(99, 102, 241, 0.2)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                color: '#e0e7ff' // Light text color
              }}
            >
              <Zap size={16} />
              <span>ENTERPRISE PLATFORM</span>
            </motion.div>
            <h1>
              VU <span className="text-gradient">Proctors Diary</span>
            </h1>
            <p>
              A comprehensive web platform revolutionizing exam management for Virtual University. 
              Streamline scheduling, attendance, payments, and communication for proctors across 
              all examination centers.
            </p>
            
            <motion.div 
              className="mt-8 flex justify-center gap-4 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
  <Button
    size="large"
    className="gradient-btn"
    onClick={() =>
      window.open(
        "https://github.com/Sehrishzarin/Vu-Proctors-Diary/tree/main/Documentation",
        "_blank",
        "noopener,noreferrer"
      )
    }
  >
    <BookOpen size={20} />
    <span>Project Documentation</span>
  </Button>
</motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
  <a
    href="https://docs.google.com/document/d/1D_FD53tJDuYTTmAlHKlqTfXPISdZnG2Re_XDF-FM5WQ/edit?usp=sharing"
    target="_blank"
    rel="noopener noreferrer"
    style={{ textDecoration: "none" }}
  >
    <Button size="large" className="ghost-btn">
      <ClipboardCheck size={20} />
      <span>View Final Report</span>
    </Button>
  </a>
</motion.div>

            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Project Overview with Animated Stats */}
      <section className="feature-block">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title">Platform Highlights</h2>
            <p className="features-subtitle">
              Designed to handle complex examination management with efficiency and precision
            </p>
          </motion.div>

          <div className="overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} delay={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="features-title">Core Features</h2>
            <p className="features-subtitle">
              Comprehensive tools designed specifically for Virtual University's examination needs
            </p>
          </motion.div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Showcase */}
      <section className="user-roles-section">
        <div className="container">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title"
          >
            User Interface Demos
          </motion.h2>
          
          <p className="features-subtitle" style={{ marginBottom: '3rem' }}>
            Each role has a tailored interface with specific functionalities
          </p>

          {userRoles.map((roleData, index) => (
            <div key={roleData.role} className="feature-block">
              <div className="container grid-two" style={index % 2 === 0 ? {} : { direction: 'rtl' }}>
                <div className="feature-info" style={index % 2 === 0 ? { textAlign: 'left' } : { textAlign: 'left', direction: 'ltr' }}>
                  <div className={`status-tag ${roleData.role === 'admin' ? 'error' : 'success'}`}>
                    {roleData.role === 'admin' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                    {roleData.role.toUpperCase()} INTERFACE
                  </div>
                  <h2 style={{ textAlign: 'left' }}>{roleData.title} Portal</h2>
                  <p style={{ textAlign: 'left' }}>{roleData.description}</p>
                  
                  <ul className="feature-list" style={{ textAlign: 'left' }}>
                    {roleData.features.map((feature, idx) => (
                      <li key={idx} style={{ textAlign: 'left' }}>{feature}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="feature-visual" style={index % 2 === 0 ? {} : { direction: 'ltr' }}>
                  <VideoMockup 
                    src={roleData.video}
                    title={`${roleData.title} Dashboard`}
                    description={`Interactive interface showing ${roleData.title.toLowerCase()} functionalities including duty management, reporting, and communication features`}
                    role={roleData.role}
                    address={`proctors-diary.vu.edu.pk/${roleData.role}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="feature-block">
        <div className="container">
          <div className="grid-two">
            <motion.div 
              className="feature-info"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ textAlign: 'left' }}
            >
              <div className="status-tag error">
                <AlertCircle size={14} />
                THE CHALLENGE
              </div>
              <h2 style={{ textAlign: 'left' }}>Manual Exam Management</h2>
              <p style={{ textAlign: 'left' }}>
                Traditional paper-based systems for scheduling, attendance tracking, 
                and payment processing lead to errors, delays, and communication gaps 
                across multiple examination centers.
              </p>
              <ul className="feature-list" style={{ textAlign: 'left' }}>
                <li>Scheduling conflicts and overlaps</li>
                <li>Manual attendance tracking errors</li>
                <li>Delayed payment processing</li>
                <li>Poor communication between stakeholders</li>
                <li>Difficulty in report management</li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="feature-info"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ textAlign: 'left' }}
            >
              <div className="status-tag success">
                <CheckCircle2 size={14} />
                 SOLUTION
              </div>
              <h2 style={{ textAlign: 'left' }}>Automated Platform</h2>
              <p style={{ textAlign: 'left' }}>
                A centralized web application that automates the entire examination 
                management process from scheduling to payments, ensuring accuracy, 
                efficiency, and transparency.
              </p>
              <ul className="feature-list" style={{ textAlign: 'left' }}>
                <li>Automated conflict-free scheduling</li>
                <li>Digital attendance with verification</li>
                <li>Real-time notifications and updates</li>
                <li>Automated payment calculation</li>
                <li>Centralized report management</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="tech-footer">
        <div className="container">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Technology Stack
          </motion.h3>
          <p className="features-subtitle">
            Built with modern technologies for scalability and performance
          </p>
          
          <motion.div 
            className="tech-pills"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <TechPill icon={Database}>MongoDB</TechPill>
            <TechPill icon={Globe}>Express.js</TechPill>
            <TechPill icon={Cpu}>React.js</TechPill>
            <TechPill icon={Zap}>Node.js</TechPill>
            <TechPill icon={Lock}>JWT Authentication</TechPill>
            <TechPill icon={Mail}>Nodemailer</TechPill>
            <TechPill icon={TrendingUp}>Chart.js</TechPill>
            <TechPill icon={Shield}>Ant Design</TechPill>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ marginBottom: '2rem' }}
          >
            <div className="nav-brand" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
              <img src={logo} alt="VU Logo" style={{ height: '50px', width: '50px' }} />
              <span>VU Proctors Diary</span>
            </div>
          </motion.div>
          <p>© {new Date().getFullYear()} Virtual University Project</p>
          <p>Comprehensive examination management system</p>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--gray-text)' }}>
            Streamlining exam management for academic excellence
          </p>
        </div>
      </footer>
    </div>
  );
};

export default RoleSelection;