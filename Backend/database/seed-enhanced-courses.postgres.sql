-- Enhanced Course Seeding for E-Learning Platform
-- Based on Software Design Document Requirements
-- Half free, half paid courses with realistic educational content

-- First, ensure we have the enhanced schema applied
-- Run: psql -U your_user -d your_database -f database/schema-enhanced.postgres.sql

-- ===========================================
-- Insert Categories
-- ===========================================

INSERT INTO categories (name, description, icon_url, sort_order, is_active) VALUES
('Web Development', 'Learn to build modern websites and web applications', '/images/categories/web-dev.png', 1, true),
('Data Science', 'Master data analysis, machine learning, and AI', '/images/categories/data-science.png', 2, true),
('Mobile Development', 'Build native and cross-platform mobile apps', '/images/categories/mobile-dev.png', 3, true),
('Cloud Computing', 'Learn cloud infrastructure and DevOps', '/images/categories/cloud.png', 4, true),
('Cybersecurity', 'Protect systems and networks from cyber threats', '/images/categories/security.png', 5, true),
('Digital Marketing', 'Master online marketing strategies and tools', '/images/categories/marketing.png', 6, true),
('Business & Management', 'Develop leadership and business skills', '/images/categories/business.png', 7, true),
('Design & Creative', 'Learn graphic design, UI/UX, and creative skills', '/images/categories/design.png', 8, true)
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- Get Instructor ID for seeding
-- ===========================================
-- This assumes there's a teacher user. Adjust as needed.

-- ===========================================
-- FREE COURSES (5 courses)
-- ===========================================

-- Free Course 1: Introduction to Web Development
INSERT INTO courses (
  title, subtitle, description, category, level, price, discount_price, 
  thumbnail_url, instructor_id, is_published, featured,
  learning_outcomes, prerequisites, syllabus, tags, language, duration
) VALUES (
  'Introduction to Web Development',
  'Your First Step into the World of Web Programming',
  'Learn the fundamentals of HTML, CSS, and JavaScript to build your first website. This comprehensive beginner course covers everything you need to know to start your web development journey.',
  'Web Development',
  'Beginner',
  0.00,
  NULL,
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
  (SELECT id FROM users WHERE email = 'teacher@edulearn.com' LIMIT 1),
  true,
  true,
  '["Understand HTML structure and semantics", "Style web pages with CSS", "Add interactivity with JavaScript", "Deploy your first website", "Follow web development best practices"]',
  'No prior programming experience required. Basic computer skills and internet access are all you need.',
  'Module 1: HTML Fundamentals (4 lessons)
Module 2: CSS Styling (5 lessons)
Module 3: JavaScript Basics (6 lessons)
Module 4: Building Your First Project (3 lessons)
Module 5: Deployment and Next Steps (2 lessons)',
  'html, css, javascript, web development, beginner, frontend',
  'English',
  '20 hours'
) ON CONFLICT DO NOTHING;

-- Free Course 2: Digital Literacy for Beginners
INSERT INTO courses (
  title, subtitle, description, category, level, price, discount_price, 
  thumbnail_url, instructor_id, is_published, featured,
  learning_outcomes, prerequisites, syllabus, tags, language, duration
) VALUES (
  'Digital Literacy for Beginners',
  'Essential Computer Skills for the Modern World',
  'Master essential digital skills including email, internet safety, document creation, and online communication. Perfect for complete beginners who want to become confident computer users.',
  'Business & Management',
  'Beginner',
  0.00,
  NULL,
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
  (SELECT id FROM users WHERE email = 'teacher@edulearn.com' LIMIT 1),
  true,
  false,
  '["Use email effectively and professionally", "Navigate the internet safely", "Create and manage documents", "Protect personal information online", "Use online communication tools"]',
  'No prior experience required. Access to a computer or smartphone is helpful.',
  'Module 1: Computer Basics (3 lessons)
Module 2: Internet and Email (4 lessons)
Module 3: Document Management (3 lessons)
Module 4: Online Safety (4 lessons)
Module 5: Communication Tools (3 lessons)',
  'digital literacy, computer skills, beginner, office skills',
  'English',
  '15 hours'
) ON CONFLICT DO NOTHING;

-- Free Course 3: Introduction to Data Analysis
INSERT INTO courses (
  title, subtitle, description, category, level, price, discount_price, 
  thumbnail_url, instructor_id, is_published, featured,
  learning_outcomes, prerequisites, syllabus, tags, language, duration
) VALUES (
  'Introduction to Data Analysis',
  'Unlock Insights from Data with Excel and Basic Statistics',
  'Learn to analyze data using Microsoft Excel and understand fundamental statistical concepts. Perfect for business professionals, students, and anyone who works with data.',
  'Data Science',
  'Beginner',
  0.00,
  NULL,
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  (SELECT id FROM users WHERE email = 'teacher@edulearn.com' LIMIT 1),
  true,
  false,
  '["Use Excel for data analysis", "Apply basic statistical concepts", "Create meaningful charts and graphs", "Interpret data for decision making", "Present data insights effectively"]',
  'Basic computer skills. Access to Microsoft Excel or Google Sheets.',
  'Module 1: Data Fundamentals (3 lessons)
Module 2: Excel Basics (5 lessons)
Module 3: Statistical Concepts (4 lessons)
Module 4: Data Visualization (4 lessons)
Module 5: Practical Analysis (4 lessons)',
  'data analysis, excel, statistics, beginner, business intelligence',
  'English',
  '18 hours'
) ON CONFLICT DO NOTHING;

-- Free Course 4: Graphic Design Fundamentals
INSERT INTO courses (
  title, subtitle, description, category, level, price, discount_price, 
  thumbnail_url, instructor_id, is_published, featured,
  learning_outcomes, prerequisites, syllabus, tags, language, duration
) VALUES (
  'Graphic Design Fundamentals',
  'Create Stunning Visuals with Basic Design Principles',
  'Learn the core principles of graphic design including color theory, typography, layout, and composition. Create professional-looking designs using free tools.',
  'Design & Creative',
  'Beginner',
  0.00,
  NULL,
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
  (SELECT id FROM users WHERE email = 'teacher@edulearn.com' LIMIT 1),
  true,
  false,
  '["Understand color theory and psychology", "Apply typography principles", "Create balanced layouts", "Use design tools effectively", "Develop a professional design portfolio"]',
  'No prior design experience required. Access to a computer with internet.',
  'Module 1: Design Principles (4 lessons)
Module 2: Color Theory (3 lessons)
Module 3: Typography (4 lessons)
Module 4: Layout and Composition (5 lessons)
Module 5: Tools and Projects (4 lessons)',
  'graphic design, design principles, color theory, typography, beginner',
  'English',
  '16 hours'
) ON CONFLICT DO NOTHING;

-- Free Course 5: Personal Finance Basics
INSERT INTO courses (
  title, subtitle, description, category, level, price, discount_price, 
  thumbnail_url, instructor_id, is_published, featured,
  learning_outcomes, prerequisites, syllabus, tags, language, duration
) VALUES (
  'Personal Finance Basics',
  'Take Control of Your Money and Build Financial Security',
  'Learn essential personal finance skills including budgeting, saving, investing, and debt management. Build a solid financial foundation for your future.',
  'Business & Management',
  'Beginner',
  0.00,
  NULL,
  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80',
  (SELECT id FROM users WHERE email = 'teacher@edulearn.com' LIMIT 1),
  true,
  false,
  '["Create and maintain a budget", "Build an emergency fund", "Understand basic investment principles", "Manage and reduce debt effectively", "Plan for long-term financial goals"]',
  'No prior financial knowledge required. Basic math skills helpful.',
  'Module 1: Financial Foundations (3 lessons)
Module 2: Budgeting and Saving (4 lessons)
Module 3: Debt Management (3 lessons)
Module 4: Investing Basics (4 lessons)
Module 5: Future Planning (3 lessons)',
  'personal finance, budgeting, saving, investing, financial literacy',
  'English',
  '12 hours'
) ON CONFLICT DO NOTHING;

-- ===========================================
-- PAID COURSES (5 courses)
-- ===========================================

-- Paid Course 1: Full-Stack Web Development Bootcamp
INSERT INTO courses (
  title, subtitle, description, category, level, price, discount_price, 
  thumbnail_url, instructor_id, is_published, featured,
  learning_outcomes, prerequisites, syllabus, tags, language, duration
) VALUES (
  'Full-Stack Web Development Bootcamp',
  'From Zero to Professional Developer in 12 Weeks',
  'Master modern web development with React, Node.js, PostgreSQL, and more. Build real-world projects and become job-ready in this comprehensive bootcamp.',
  'Web Development',
  'Intermediate',
  199.99,
  149.99,
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
  (SELECT id FROM users WHERE email = 'teacher@edulearn.com' LIMIT 1),
  true,
  true,
  '["Build complete web applications from scratch", "Master React and modern frontend development", "Develop backend APIs with Node.js and Express", "Work with PostgreSQL databases", "Deploy applications to cloud platforms", "Build a professional portfolio"]',
  'Basic HTML, CSS, and JavaScript knowledge. Understanding of programming fundamentals.',
  'Module 1: Advanced JavaScript (8 lessons)
Module 2: React Fundamentals (10 lessons)
Module 3: State Management with Redux (6 lessons)
Module 4: Node.js and Express (8 lessons)
Module 5: Database Design with PostgreSQL (6 lessons)
Module 6: Authentication and Security (5 lessons)
Module 7: API Development (7 lessons)
Module 8: Testing and Debugging (5 lessons)
Module 9: Deployment and DevOps (4 lessons)
Module 10: Capstone Project (8 lessons)',
  'react, node.js, express, postgresql, full-stack, web development, javascript',
  'English',
  '80 hours'
) ON CONFLICT DO NOTHING;

-- Paid Course 2: Machine Learning with Python
INSERT INTO courses (
  title, subtitle, description, category, level, price, discount_price, 
  thumbnail_url, instructor_id, is_published, featured,
  learning_outcomes, prerequisites, syllabus, tags, language, duration
) VALUES (
  'Machine Learning with Python',
  'Build Intelligent Systems with Modern ML Techniques',
  'Learn machine learning fundamentals and implement algorithms using Python, scikit-learn, and TensorFlow. Work on real-world projects and build predictive models.',
  'Data Science',
  'Intermediate',
  179.99,
  129.99,
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80',
  (SELECT id FROM users WHERE email = 'teacher@edulearn.com' LIMIT 1),
  true,
  true,
  '["Understand machine learning concepts and algorithms", "Implement ML models with Python and scikit-learn", "Build neural networks with TensorFlow", "Work with real-world datasets", "Evaluate and optimize model performance", "Deploy ML models to production"]',
  'Python programming experience. Basic understanding of statistics and linear algebra.',
  'Module 1: ML Fundamentals (6 lessons)
Module 2: Data Preprocessing (5 lessons)
Module 3: Supervised Learning (8 lessons)
Module 4: Unsupervised Learning (5 lessons)
Module 5: Deep Learning Basics (7 lessons)
Module 6: Model Evaluation (4 lessons)
Module 7: Feature Engineering (5 lessons)
Module 8: Real-World Projects (6 lessons)',
  'machine learning, python, tensorflow, scikit-learn, data science, ai',
  'English',
  '60 hours'
) ON CONFLICT DO NOTHING;

-- Paid Course 3: Mobile App Development with React Native
INSERT INTO courses (
  title, subtitle, description, category, level, price, discount_price, 
  thumbnail_url, instructor_id, is_published, featured,
  learning_outcomes, prerequisites, syllabus, tags, language, duration
) VALUES (
  'Mobile App Development with React Native',
  'Build Cross-Platform Mobile Apps for iOS and Android',
  'Create native mobile applications using React Native. Learn to build, test, and deploy apps for both iOS and Android from a single codebase.',
  'Mobile Development',
  'Intermediate',
  159.99,
  119.99,
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
  (SELECT id FROM users WHERE email = 'teacher@edulearn.com' LIMIT 1),
  true,
  false,
  '["Build cross-platform mobile apps", "Master React Native components and APIs", "Implement navigation and state management", "Work with device hardware features", "Test and debug mobile applications", "Publish apps to App Store and Google Play"]',
  'React.js experience. JavaScript proficiency. Understanding of mobile app concepts.',
  'Module 1: React Native Basics (7 lessons)
Module 2: Core Components (8 lessons)
Module 3: Navigation (5 lessons)
Module 4: State Management (6 lessons)
Module 5: APIs and Data (6 lessons)
Module 6: Device Features (5 lessons)
Module 7: Testing (4 lessons)
Module 8: Deployment (4 lessons)
Module 9: Final Project (6 lessons)',
  'react native, mobile development, ios, android, cross-platform',
  'English',
  '50 hours'
) ON CONFLICT DO NOTHING;

-- Paid Course 4: Cloud Computing with AWS
INSERT INTO courses (
  title, subtitle, description, category, level, price, discount_price, 
  thumbnail_url, instructor_id, is_published, featured,
  learning_outcomes, prerequisites, syllabus, tags, language, duration
) VALUES (
  'Cloud Computing with AWS',
  'Master Amazon Web Services and Cloud Architecture',
  'Learn to design, deploy, and manage applications on AWS. Prepare for AWS certification and become a cloud professional.',
  'Cloud Computing',
  'Intermediate',
  189.99,
  139.99,
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  (SELECT id FROM users WHERE email = 'teacher@edulearn.com' LIMIT 1),
  true,
  false,
  '["Design scalable cloud architectures", "Deploy applications on AWS", "Implement security best practices", "Optimize cloud costs", "Prepare for AWS certification", "Build real-world cloud solutions"]',
  'Basic understanding of networking and operating systems. Some programming experience helpful.',
  'Module 1: Cloud Fundamentals (5 lessons)
Module 2: EC2 and Compute (7 lessons)
Module 3: Storage Solutions (6 lessons)
Module 4: Databases on AWS (6 lessons)
Module 5: Networking (5 lessons)
Module 6: Security and IAM (6 lessons)
Module 7: Serverless and Lambda (5 lessons)
Module 8: DevOps and CI/CD (5 lessons)
Module 9: Monitoring and Optimization (4 lessons)
Module 10: Capstone Project (6 lessons)',
  'aws, cloud computing, devops, infrastructure, certification',
  'English',
  '55 hours'
) ON CONFLICT DO NOTHING;

-- Paid Course 5: Cybersecurity Professional
INSERT INTO courses (
  title, subtitle, description, category, level, price, discount_price, 
  thumbnail_url, instructor_id, is_published, featured,
  learning_outcomes, prerequisites, syllabus, tags, language, duration
) VALUES (
  'Cybersecurity Professional',
  'Protect Systems and Networks from Cyber Threats',
  'Master cybersecurity fundamentals including network security, ethical hacking, and incident response. Prepare for CompTIA Security+ certification.',
  'Cybersecurity',
  'Intermediate',
  169.99,
  124.99,
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
  (SELECT id FROM users WHERE email = 'teacher@edulearn.com' LIMIT 1),
  true,
  false,
  '["Understand cybersecurity threats and vulnerabilities", "Implement network security measures", "Conduct ethical hacking and penetration testing", "Respond to security incidents", "Secure systems and applications", "Prepare for Security+ certification"]',
  'Basic networking knowledge. Understanding of computer systems. Some IT experience recommended.',
  'Module 1: Security Fundamentals (6 lessons)
Module 2: Network Security (7 lessons)
Module 3: Threats and Attacks (6 lessons)
Module 4: Cryptography (5 lessons)
Module 5: Identity and Access Management (5 lessons)
Module 6: Security Operations (6 lessons)
Module 7: Incident Response (5 lessons)
Module 8: Ethical Hacking Basics (6 lessons)
Module 9: Compliance and Governance (4 lessons)
Module 10: Certification Prep (5 lessons)',
  'cybersecurity, ethical hacking, network security, comptia security+, it security',
  'English',
  '58 hours'
) ON CONFLICT DO NOTHING;

-- ===========================================
-- Summary
-- ===========================================

/*
Created 10 courses total:
- 5 FREE courses (Introduction to Web Development, Digital Literacy, Data Analysis, Graphic Design, Personal Finance)
- 5 PAID courses (Full-Stack Web Development, Machine Learning, Mobile Development, Cloud Computing, Cybersecurity)

Each course includes:
- Complete metadata (subtitle, learning outcomes, prerequisites, syllabus, tags, language, duration)
- Realistic educational content
- Proper categorization and leveling
- Featured flags for homepage display
- Professional descriptions
*/
