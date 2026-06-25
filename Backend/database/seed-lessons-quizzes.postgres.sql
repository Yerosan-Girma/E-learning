-- Lessons and Quizzes Seeding for E-Learning Platform
-- Adds lessons and quizzes for all 10 courses

-- ===========================================
-- FREE COURSE 1: Introduction to Web Development
-- ===========================================

-- Lessons
INSERT INTO course_lessons (course_id, title, lesson_type, video_url, notes_content, attachment_url, sort_order, is_preview, module_name) VALUES
((SELECT id FROM courses WHERE title = 'Introduction to Web Development' LIMIT 1),
'Course Introduction and Setup',
'video',
'https://www.youtube.com/embed/qz0aGYrrlhU',
'<h5>Course Introduction</h5><p>Welcome to Introduction to Web Development! In this lesson, we will cover:</p><ul><li>What is web development?</li><li>Frontend vs Backend vs Full Stack</li><li>Setting up your development environment</li><li>Installing VS Code and necessary extensions</li></ul>',
NULL,
1,
true,
'Module 1: HTML Fundamentals'),

((SELECT id FROM courses WHERE title = 'Introduction to Web Development' LIMIT 1),
'HTML Document Structure',
'video',
'https://www.youtube.com/embed/UB1O30fR-EE',
'<h5>HTML Structure</h5><p>Learn the basic structure of an HTML document including DOCTYPE, html, head, and body tags.</p><pre><code>&lt;!DOCTYPE html&gt;\n&lt;html&gt;\n  &lt;head&gt;\n    &lt;title&gt;My Page&lt;/title&gt;\n  &lt;/head&gt;\n  &lt;body&gt;\n    &lt;h1&gt;Hello World&lt;/h1&gt;\n  &lt;/body&gt;\n&lt;/html&gt;</code></pre>',
NULL,
2,
true,
'Module 1: HTML Fundamentals'),

((SELECT id FROM courses WHERE title = 'Introduction to Web Development' LIMIT 1),
'HTML Text Formatting and Semantics',
'video',
'https://www.youtube.com/embed/yfoY53QXEnI',
'<h5>Text Elements</h5><p>Master headings, paragraphs, lists, and semantic HTML elements.</p><ul><li>h1-h6 headings</li><li>p paragraphs</li><li>strong and em for emphasis</li><li>ul, ol, dl lists</li></ul>',
NULL,
3,
false,
'Module 1: HTML Fundamentals'),

((SELECT id FROM courses WHERE title = 'Introduction to Web Development' LIMIT 1),
'HTML Forms and Inputs',
'video',
'https://www.youtube.com/embed/oqY5GK2QzDk',
'<h5>HTML Forms</h5><p>Create interactive forms with various input types.</p><pre><code>&lt;form&gt;\n  &lt;input type="text" name="username"&gt;\n  &lt;input type="email" name="email"&gt;\n  &lt;button type="submit"&gt;Submit&lt;/button&gt;\n&lt;/form&gt;</code></pre>',
NULL,
4,
false,
'Module 1: HTML Fundamentals'),

((SELECT id FROM courses WHERE title = 'Introduction to Web Development' LIMIT 1),
'CSS Fundamentals and Selectors',
'video',
'https://www.youtube.com/embed/1Rs2ND1ryYc',
'<h5>CSS Basics</h5><p>Learn how to style HTML elements with CSS selectors and properties.</p><pre><code>h1 { color: blue; font-size: 32px; }\n.container { max-width: 1200px; margin: 0 auto; }</code></pre>',
NULL,
5,
true,
'Module 2: CSS Styling'),

((SELECT id FROM courses WHERE title = 'Introduction to Web Development' LIMIT 1),
'Flexbox Layout',
'video',
'https://www.youtube.com/embed/K74l26pEzYA',
'<h5>Flexbox</h5><p>Master modern CSS layout with Flexbox.</p><pre><code>.container { display: flex; justify-content: center; align-items: center; }</code></pre>',
NULL,
6,
false,
'Module 2: CSS Styling'),

((SELECT id FROM courses WHERE title = 'Introduction to Web Development' LIMIT 1),
'JavaScript Basics',
'video',
'https://www.youtube.com/embed/W6NZfCO5SIk',
'<h5>JavaScript Introduction</h5><p>Learn variables, functions, and basic JavaScript concepts.</p><pre><code>let name = "John";\nfunction greet() { console.log("Hello " + name); }</code></pre>',
NULL,
7,
true,
'Module 3: JavaScript Basics'),

((SELECT id FROM courses WHERE title = 'Introduction to Web Development' LIMIT 1),
'DOM Manipulation',
'video',
'https://www.youtube.com/embed/Bv_5Zv5c-Ts',
'<h5>DOM Manipulation</h5><p>Interact with HTML elements using JavaScript.</p><pre><code>document.getElementById("myDiv").innerHTML = "New Content";</code></pre>',
NULL,
8,
false,
'Module 3: JavaScript Basics'),

((SELECT id FROM courses WHERE title = 'Introduction to Web Development' LIMIT 1),
'Building Your First Project',
'video',
'https://www.youtube.com/embed/hu0X013M0gA',
'<h5>Final Project</h5><p>Combine HTML, CSS, and JavaScript to build your first website.</p>',
NULL,
9,
false,
'Module 4: Building Your First Project'),

((SELECT id FROM courses WHERE title = 'Introduction to Web Development' LIMIT 1),
'Deployment and Next Steps',
'video',
'https://www.youtube.com/embed/8QK0Ck52Y8g',
'<h5>Deployment</h5><p>Learn how to deploy your website using GitHub Pages or Netlify.</p>',
NULL,
10,
false,
'Module 5: Deployment and Next Steps');

-- Quiz
INSERT INTO course_quizzes (course_id, title, description, passing_score) VALUES
((SELECT id FROM courses WHERE title = 'Introduction to Web Development' LIMIT 1),
'Web Development Fundamentals Quiz',
'Test your knowledge of HTML, CSS, and JavaScript basics.',
70.0);

-- Quiz Questions
INSERT INTO quiz_questions (quiz_id, question_text, options_json, correct_option, explanation, sort_order) VALUES
((SELECT id FROM course_quizzes WHERE title = 'Web Development Fundamentals Quiz' LIMIT 1),
'What does HTML stand for?',
'["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"]',
0,
'HTML stands for Hyper Text Markup Language.',
1),

((SELECT id FROM course_quizzes WHERE title = 'Web Development Fundamentals Quiz' LIMIT 1),
'Which CSS property is used to change text color?',
'["text-color", "color", "font-color", "text-style"]',
1,
'The color property is used to change text color in CSS.',
2),

((SELECT id FROM course_quizzes WHERE title = 'Web Development Fundamentals Quiz' LIMIT 1),
'How do you declare a variable in JavaScript?',
'["variable myVar;", "var myVar;", "v myVar;", "declare myVar;"]',
1,
'In JavaScript, you declare variables using var, let, or const.',
3),

((SELECT id FROM course_quizzes WHERE title = 'Web Development Fundamentals Quiz' LIMIT 1),
'What tag is used for the largest heading in HTML?',
'["<heading>", "<h6>", "<h1>", "<head>"]',
2,
'<h1> is used for the largest heading in HTML.',
4),

((SELECT id FROM course_quizzes WHERE title = 'Web Development Fundamentals Quiz' LIMIT 1),
'Which CSS display value creates a flex container?',
'["block", "inline", "flex", "grid"]',
2,
'display: flex creates a flex container in CSS.',
5);

-- ===========================================
-- FREE COURSE 2: Digital Literacy for Beginners
-- ===========================================

INSERT INTO course_lessons (course_id, title, lesson_type, video_url, notes_content, attachment_url, sort_order, is_preview, module_name) VALUES
((SELECT id FROM courses WHERE title = 'Digital Literacy for Beginners' LIMIT 1),
'Introduction to Computers',
'video',
'https://www.youtube.com/embed/VFkO1hM4R8U',
'<h5>Computer Basics</h5><p>Learn about hardware, software, and how computers work.</p>',
NULL,
1,
true,
'Module 1: Computer Basics'),

((SELECT id FROM courses WHERE title = 'Digital Literacy for Beginners' LIMIT 1),
'Operating Systems',
'video',
'https://www.youtube.com/embed/9bZkp7q19f0',
'<h5>Operating Systems</h5><p>Understanding Windows, macOS, and Linux basics.</p>',
NULL,
2,
true,
'Module 1: Computer Basics'),

((SELECT id FROM courses WHERE title = 'Digital Literacy for Beginners' LIMIT 1),
'File Management',
'video',
'https://www.youtube.com/embed/8V7S9K4j8E0',
'<h5>Managing Files</h5><p>Learn to create, organize, and manage files and folders.</p>',
NULL,
3,
false,
'Module 1: Computer Basics'),

((SELECT id FROM courses WHERE title = 'Digital Literacy for Beginners' LIMIT 1),
'Internet Basics',
'video',
'https://www.youtube.com/embed/ZXxYpX8k8X0',
'<h5>Internet Fundamentals</h5><p>Understanding how the internet works and web browsers.</p>',
NULL,
4,
true,
'Module 2: Internet and Email'),

((SELECT id FROM courses WHERE title = 'Digital Literacy for Beginners' LIMIT 1),
'Email Communication',
'video',
'https://www.youtube.com/embed/7V7K4k4k4K4',
'<h5>Email Skills</h5><p>Professional email writing and management.</p>',
NULL,
5,
false,
'Module 2: Internet and Email'),

((SELECT id FROM courses WHERE title = 'Digital Literacy for Beginners' LIMIT 1),
'Online Safety',
'video',
'https://www.youtube.com/embed/6K6k4k4k4K4',
'<h5>Cybersecurity Basics</h5><p>Passwords, phishing, and staying safe online.</p>',
NULL,
6,
true,
'Module 4: Online Safety'),

((SELECT id FROM courses WHERE title = 'Digital Literacy for Beginners' LIMIT 1),
'Document Creation',
'video',
'https://www.youtube.com/embed/5K5k4k4k4K4',
'<h5>Word Processing</h5><p>Creating documents with Google Docs or Microsoft Word.</p>',
NULL,
7,
false,
'Module 3: Document Management');

INSERT INTO course_quizzes (course_id, title, description, passing_score) VALUES
((SELECT id FROM courses WHERE title = 'Digital Literacy for Beginners' LIMIT 1),
'Digital Literacy Quiz',
'Test your basic computer and internet skills.',
70.0);

INSERT INTO quiz_questions (quiz_id, question_text, options_json, correct_option, explanation, sort_order) VALUES
((SELECT id FROM course_quizzes WHERE title = 'Digital Literacy Quiz' LIMIT 1),
'Which of the following is a web browser?',
'["Microsoft Word", "Google Chrome", "Windows Explorer", "Adobe Photoshop"]',
1,
'Google Chrome is a web browser.',
1),

((SELECT id FROM course_quizzes WHERE title = 'Digital Literacy Quiz' LIMIT 1),
'What makes a strong password?',
'["123456", "password", "MyDog2024!", "admin"]',
2,
'A strong password includes letters, numbers, and special characters.',
2),

((SELECT id FROM course_quizzes WHERE title = 'Digital Literacy Quiz' LIMIT 1),
'What is phishing?',
'["A type of computer virus", "A scam to steal personal information", "A fishing game online", "A type of firewall"]',
1,
'Phishing is a scam that tries to steal your personal information.',
3);

-- ===========================================
-- FREE COURSE 3: Introduction to Data Analysis
-- ===========================================

INSERT INTO course_lessons (course_id, title, lesson_type, video_url, notes_content, attachment_url, sort_order, is_preview, module_name) VALUES
((SELECT id FROM courses WHERE title = 'Introduction to Data Analysis' LIMIT 1),
'Data Fundamentals',
'video',
'https://www.youtube.com/embed/4K4k4k4k4K4',
'<h5>Understanding Data</h5><p>Types of data, data sources, and data quality.</p>',
NULL,
1,
true,
'Module 1: Data Fundamentals'),

((SELECT id FROM courses WHERE title = 'Introduction to Data Analysis' LIMIT 1),
'Excel Interface',
'video',
'https://www.youtube.com/embed/3K3k4k4k4K4',
'<h5>Excel Basics</h5><p>Navigating Excel, cells, rows, columns, and basic operations.</p>',
NULL,
2,
true,
'Module 2: Excel Basics'),

((SELECT id FROM courses WHERE title = 'Introduction to Data Analysis' LIMIT 1),
'Excel Formulas',
'video',
'https://www.youtube.com/embed/2K2k4k4k4K4',
'<h5>Basic Formulas</h5><p>SUM, AVERAGE, COUNT, and basic Excel functions.</p>',
NULL,
3,
false,
'Module 2: Excel Basics'),

((SELECT id FROM courses WHERE title = 'Introduction to Data Analysis' LIMIT 1),
'Data Visualization',
'video',
'https://www.youtube.com/embed/1K1k4k4k4K4',
'<h5>Charts and Graphs</h5><p>Creating bar charts, line graphs, and pie charts.</p>',
NULL,
4,
true,
'Module 4: Data Visualization'),

((SELECT id FROM courses WHERE title = 'Introduction to Data Analysis' LIMIT 1),
'Statistical Concepts',
'video',
'https://www.youtube.com/embed/0K0k4k4k4K4',
'<h5>Basic Statistics</h5><p>Mean, median, mode, and standard deviation.</p>',
NULL,
5,
false,
'Module 3: Statistical Concepts');

INSERT INTO course_quizzes (course_id, title, description, passing_score) VALUES
((SELECT id FROM courses WHERE title = 'Introduction to Data Analysis' LIMIT 1),
'Data Analysis Quiz',
'Test your Excel and statistics knowledge.',
70.0);

INSERT INTO quiz_questions (quiz_id, question_text, options_json, correct_option, explanation, sort_order) VALUES
((SELECT id FROM course_quizzes WHERE title = 'Data Analysis Quiz' LIMIT 1),
'What does AVERAGE() calculate in Excel?',
'["The sum of values", "The middle value", "The arithmetic mean", "The most frequent value"]',
2,
'AVERAGE() calculates the arithmetic mean of values.',
1),

((SELECT id FROM course_quizzes WHERE title = 'Data Analysis Quiz' LIMIT 1),
'Which chart is best for showing trends over time?',
'["Pie chart", "Bar chart", "Line chart", "Scatter plot"]',
2,
'Line charts are best for showing trends over time.',
2),

((SELECT id FROM course_quizzes WHERE title = 'Data Analysis Quiz' LIMIT 1),
'What is the median of [2, 4, 6, 8, 10]?',
'["4", "6", "8", "10"]',
1,
'The median is the middle value: 6.',
3);

-- ===========================================
-- FREE COURSE 4: Graphic Design Fundamentals
-- ===========================================

INSERT INTO course_lessons (course_id, title, lesson_type, video_url, notes_content, attachment_url, sort_order, is_preview, module_name) VALUES
((SELECT id FROM courses WHERE title = 'Graphic Design Fundamentals' LIMIT 1),
'Design Principles',
'video',
'https://www.youtube.com/embed/9K9k4k4k4K4',
'<h5>Core Principles</h5><p>Balance, contrast, hierarchy, and alignment.</p>',
NULL,
1,
true,
'Module 1: Design Principles'),

((SELECT id FROM courses WHERE title = 'Graphic Design Fundamentals' LIMIT 1),
'Color Theory',
'video',
'https://www.youtube.com/embed/8K8k4k4k4K4',
'<h5>Understanding Color</h5><p>Color wheel, complementary colors, and color psychology.</p>',
NULL,
2,
true,
'Module 2: Color Theory'),

((SELECT id FROM courses WHERE title = 'Graphic Design Fundamentals' LIMIT 1),
'Typography',
'video',
'https://www.youtube.com/embed/7K7k4k4k4K4',
'<h5>Fonts and Type</h5><p>Serif vs sans-serif, font pairing, and readability.</p>',
NULL,
3,
false,
'Module 3: Typography'),

((SELECT id FROM courses WHERE title = 'Graphic Design Fundamentals' LIMIT 1),
'Layout and Composition',
'video',
'https://www.youtube.com/embed/6K6k4k4k4K4',
'<h5>Composition Rules</h5><p>Rule of thirds, grids, and visual flow.</p>',
NULL,
4,
true,
'Module 4: Layout and Composition');

INSERT INTO course_quizzes (course_id, title, description, passing_score) VALUES
((SELECT id FROM courses WHERE title = 'Graphic Design Fundamentals' LIMIT 1),
'Graphic Design Quiz',
'Test your design principles knowledge.',
70.0);

INSERT INTO quiz_questions (quiz_id, question_text, options_json, correct_option, explanation, sort_order) VALUES
((SELECT id FROM course_quizzes WHERE title = 'Graphic Design Quiz' LIMIT 1),
'What are complementary colors?',
'["Colors that are the same", "Colors opposite on the color wheel", "Colors that are similar", "Black and white"]',
1,
'Complementary colors are opposite each other on the color wheel.',
1),

((SELECT id FROM course_quizzes WHERE title = 'Graphic Design Quiz' LIMIT 1),
'What is the rule of thirds?',
'["Divide image into 3 equal parts", "Divide image into 9 equal parts", "Use 3 colors only", "Repeat elements 3 times"]',
1,
'The rule of thirds divides an image into 9 equal parts using 2 horizontal and 2 vertical lines.',
2);

-- ===========================================
-- FREE COURSE 5: Personal Finance Basics
-- ===========================================

INSERT INTO course_lessons (course_id, title, lesson_type, video_url, notes_content, attachment_url, sort_order, is_preview, module_name) VALUES
((SELECT id FROM courses WHERE title = 'Personal Finance Basics' LIMIT 1),
'Financial Foundations',
'video',
'https://www.youtube.com/embed/5K5k4k4k4K4',
'<h5>Money Basics</h5><p>Income, expenses, and net worth.</p>',
NULL,
1,
true,
'Module 1: Financial Foundations'),

((SELECT id FROM courses WHERE title = 'Personal Finance Basics' LIMIT 1),
'Budgeting',
'video',
'https://www.youtube.com/embed/4K4k4k4k4K4',
'<h5>Creating a Budget</h5><p>50/30/20 rule and expense tracking.</p>',
NULL,
2,
true,
'Module 2: Budgeting and Saving'),

((SELECT id FROM courses WHERE title = 'Personal Finance Basics' LIMIT 1),
'Saving and Emergency Funds',
'video',
'https://www.youtube.com/embed/3K3k4k4k4K4',
'<h5>Building Savings</h5><p>Emergency funds and saving strategies.</p>',
NULL,
3,
false,
'Module 2: Budgeting and Saving'),

((SELECT id FROM courses WHERE title = 'Personal Finance Basics' LIMIT 1),
'Debt Management',
'video',
'https://www.youtube.com/embed/2K2k4k4k4K4',
'<h5>Managing Debt</h5><p>Good vs bad debt, debt payoff strategies.</p>',
NULL,
4,
false,
'Module 3: Debt Management'),

((SELECT id FROM courses WHERE title = 'Personal Finance Basics' LIMIT 1),
'Investing Basics',
'video',
'https://www.youtube.com/embed/1K1k4k4k4K4',
'<h5>Investment Fundamentals</h5><p>Stocks, bonds, and compound interest.</p>',
NULL,
5,
true,
'Module 4: Investing Basics');

INSERT INTO course_quizzes (course_id, title, description, passing_score) VALUES
((SELECT id FROM courses WHERE title = 'Personal Finance Basics' LIMIT 1),
'Personal Finance Quiz',
'Test your financial literacy.',
70.0);

INSERT INTO quiz_questions (quiz_id, question_text, options_json, correct_option, explanation, sort_order) VALUES
((SELECT id FROM course_quizzes WHERE title = 'Personal Finance Quiz' LIMIT 1),
'What is the 50/30/20 rule?',
'["50% needs, 30% wants, 20% savings", "50% savings, 30% needs, 20% wants", "50% wants, 30% needs, 20% savings", "50% debt, 30% savings, 20% wants"]',
0,
'The 50/30/20 rule allocates 50% to needs, 30% to wants, and 20% to savings.',
1),

((SELECT id FROM course_quizzes WHERE title = 'Personal Finance Quiz' LIMIT 1),
'What is compound interest?',
'["Interest on principal only", "Interest on principal and accumulated interest", "Fixed interest rate", "No interest at all"]',
1,
'Compound interest is interest calculated on both principal and accumulated interest.',
2);

-- ===========================================
-- PAID COURSE 1: Full-Stack Web Development Bootcamp
-- ===========================================

INSERT INTO course_lessons (course_id, title, lesson_type, video_url, notes_content, attachment_url, sort_order, is_preview, module_name) VALUES
((SELECT id FROM courses WHERE title = 'Full-Stack Web Development Bootcamp' LIMIT 1),
'Advanced JavaScript Concepts',
'video',
'https://www.youtube.com/embed/PkZNo7MFNFg',
'<h5>JS Advanced</h5><p>Closures, prototypes, and async/await.</p>',
NULL,
1,
true,
'Module 1: Advanced JavaScript'),

((SELECT id FROM courses WHERE title = 'Full-Stack Web Development Bootcamp' LIMIT 1),
'React Fundamentals',
'video',
'https://www.youtube.com/embed/w7ejDZ8SWv8',
'<h5>React Basics</h5><p>Components, props, and state.</p>',
NULL,
2,
true,
'Module 2: React Fundamentals'),

((SELECT id FROM courses WHERE title = 'Full-Stack Web Development Bootcamp' LIMIT 1),
'React Hooks',
'video',
'https://www.youtube.com/embed/TNhaISbSyi8',
'<h5>React Hooks</h5><p>useState, useEffect, and custom hooks.</p>',
NULL,
3,
false,
'Module 2: React Fundamentals'),

((SELECT id FROM courses WHERE title = 'Full-Stack Web Development Bootcamp' LIMIT 1),
'Redux State Management',
'video',
'https://www.youtube.com/embed/CqQiEaWxpT8',
'<h5>Redux</h5><p>Actions, reducers, and Redux toolkit.</p>',
NULL,
4,
false,
'Module 3: State Management with Redux'),

((SELECT id FROM courses WHERE title = 'Full-Stack Web Development Bootcamp' LIMIT 1),
'Node.js and Express',
'video',
'https://www.youtube.com/embed/Oe421EPjeBE',
'<h5>Backend Basics</h5><p>Setting up Express server and REST APIs.</p>',
NULL,
5,
true,
'Module 4: Node.js and Express'),

((SELECT id FROM courses WHERE title = 'Full-Stack Web Development Bootcamp' LIMIT 1),
'Database Design with PostgreSQL',
'video',
'https://www.youtube.com/embed/qw--VYGpxKk',
'<h5>PostgreSQL</h5><p>SQL basics, tables, and relationships.</p>',
NULL,
6,
false,
'Module 5: Database Design with PostgreSQL'),

((SELECT id FROM courses WHERE title = 'Full-Stack Web Development Bootcamp' LIMIT 1),
'Authentication and Security',
'video',
'https://www.youtube.com/embed/ses8IdJtBrY',
'<h5>Security</h5><p>JWT, hashing, and authentication best practices.</p>',
NULL,
7,
false,
'Module 6: Authentication and Security'),

((SELECT id FROM courses WHERE title = 'Full-Stack Web Development Bootcamp' LIMIT 1),
'API Development',
'video',
'https://www.youtube.com/embed/L72fhGm1tfE',
'<h5>RESTful APIs</h5><p>Building robust APIs with Express.</p>',
NULL,
8,
false,
'Module 7: API Development'),

((SELECT id FROM courses WHERE title = 'Full-Stack Web Development Bootcamp' LIMIT 1),
'Testing and Debugging',
'video',
'https://www.youtube.com/embed/1JsJX1sJS3U',
'<h5>Testing</h5><p>Unit testing with Jest and debugging techniques.</p>',
NULL,
9,
false,
'Module 8: Testing and Debugging'),

((SELECT id FROM courses WHERE title = 'Full-Stack Web Development Bootcamp' LIMIT 1),
'Deployment and DevOps',
'video',
'https://www.youtube.com/embed/3RTwP7kW5is',
'<h5>Deployment</h5><p>Deploying to Vercel, Render, and CI/CD.</p>',
NULL,
10,
false,
'Module 9: Deployment and DevOps'),

((SELECT id FROM courses WHERE title = 'Full-Stack Web Development Bootcamp' LIMIT 1),
'Capstone Project',
'video',
'https://www.youtube.com/embed/Ke90Tje7VS0',
'<h5>Final Project</h5><p>Build a complete full-stack application.</p>',
NULL,
11,
false,
'Module 10: Capstone Project');

INSERT INTO course_quizzes (course_id, title, description, passing_score) VALUES
((SELECT id FROM courses WHERE title = 'Full-Stack Web Development Bootcamp' LIMIT 1),
'Full-Stack Development Quiz',
'Comprehensive quiz on full-stack development.',
75.0);

INSERT INTO quiz_questions (quiz_id, question_text, options_json, correct_option, explanation, sort_order) VALUES
((SELECT id FROM course_quizzes WHERE title = 'Full-Stack Development Quiz' LIMIT 1),
'What is a React Hook?',
'["A fishing tool", "A function that lets you hook into React state", "A component lifecycle method", "A CSS framework"]',
1,
'React Hooks are functions that let you hook into React state and lifecycle features.',
1),

((SELECT id FROM course_quizzes WHERE title = 'Full-Stack Development Quiz' LIMIT 1),
'What does JWT stand for?',
'["Java Web Tool", "JSON Web Token", "JavaScript Web Template", "Java Web Technology"]',
1,
'JWT stands for JSON Web Token, used for authentication.',
2),

((SELECT id FROM course_quizzes WHERE title = 'Full-Stack Development Quiz' LIMIT 1),
'Which HTTP method is typically used to update data?',
'["GET", "POST", "PUT/PATCH", "DELETE"]',
2,
'PUT or PATCH is used to update data in REST APIs.',
3);

-- ===========================================
-- PAID COURSE 2: Machine Learning with Python
-- ===========================================

INSERT INTO course_lessons (course_id, title, lesson_type, video_url, notes_content, attachment_url, sort_order, is_preview, module_name) VALUES
((SELECT id FROM courses WHERE title = 'Machine Learning with Python' LIMIT 1),
'ML Fundamentals',
'video',
'https://www.youtube.com/embed/ukzFI9ldwfE',
'<h5>ML Basics</h5><p>Supervised vs unsupervised learning, types of ML problems.</p>',
NULL,
1,
true,
'Module 1: ML Fundamentals'),

((SELECT id FROM courses WHERE title = 'Machine Learning with Python' LIMIT 1),
'Data Preprocessing',
'video',
'https://www.youtube.com/embed/0v5i1nWdK5g',
'<h5>Data Prep</h5><p>Cleaning, scaling, and feature engineering.</p>',
NULL,
2,
true,
'Module 2: Data Preprocessing'),

((SELECT id FROM courses WHERE title = 'Machine Learning with Python' LIMIT 1),
'Supervised Learning',
'video',
'https://www.youtube.com/embed/0v5i1nWdK5g',
'<h5>Supervised ML</h5><p>Linear regression, logistic regression, decision trees.</p>',
NULL,
3,
false,
'Module 3: Supervised Learning'),

((SELECT id FROM courses WHERE title = 'Machine Learning with Python' LIMIT 1),
'Unsupervised Learning',
'video',
'https://www.youtube.com/embed/0v5i1nWdK5g',
'<h5>Unsupervised ML</h5><p>K-means clustering, PCA, dimensionality reduction.</p>',
NULL,
4,
false,
'Module 4: Unsupervised Learning'),

((SELECT id FROM courses WHERE title = 'Machine Learning with Python' LIMIT 1),
'Deep Learning Basics',
'video',
'https://www.youtube.com/embed/aircAruvnKk',
'<h5>Neural Networks</h5><p>Introduction to neural networks and TensorFlow.</p>',
NULL,
5,
true,
'Module 5: Deep Learning Basics'),

((SELECT id FROM courses WHERE title = 'Machine Learning with Python' LIMIT 1),
'Model Evaluation',
'video',
'https://www.youtube.com/embed/0v5i1nWdK5g',
'<h5>Evaluation</h5><p>Accuracy, precision, recall, F1-score, cross-validation.</p>',
NULL,
6,
false,
'Module 6: Model Evaluation');

INSERT INTO course_quizzes (course_id, title, description, passing_score) VALUES
((SELECT id FROM courses WHERE title = 'Machine Learning with Python' LIMIT 1),
'Machine Learning Quiz',
'Test your ML knowledge.',
75.0);

INSERT INTO quiz_questions (quiz_id, question_text, options_json, correct_option, explanation, sort_order) VALUES
((SELECT id FROM course_quizzes WHERE title = 'Machine Learning Quiz' LIMIT 1),
'What is supervised learning?',
'["Learning without labels", "Learning with labeled data", "Learning from unlabeled data", "Reinforcement learning"]',
1,
'Supervised learning uses labeled data to train models.',
1),

((SELECT id FROM course_quizzes WHERE title = 'Machine Learning Quiz' LIMIT 1),
'What is K-means used for?',
'["Classification", "Regression", "Clustering", "Dimensionality reduction"]',
2,
'K-means is a clustering algorithm.',
2);

-- ===========================================
-- PAID COURSE 3: Mobile App Development with React Native
-- ===========================================

INSERT INTO course_lessons (course_id, title, lesson_type, video_url, notes_content, attachment_url, sort_order, is_preview, module_name) VALUES
((SELECT id FROM courses WHERE title = 'Mobile App Development with React Native' LIMIT 1),
'React Native Basics',
'video',
'https://www.youtube.com/embed/onT0hY3-2ek',
'<h5>RN Intro</h5><p>Setting up React Native environment and first app.</p>',
NULL,
1,
true,
'Module 1: React Native Basics'),

((SELECT id FROM courses WHERE title = 'Mobile App Development with React Native' LIMIT 1),
'Core Components',
'video',
'https://www.youtube.com/embed/onT0hY3-2ek',
'<h5>Components</h5><p>View, Text, Image, ScrollView, and core RN components.</p>',
NULL,
2,
true,
'Module 2: Core Components'),

((SELECT id FROM courses WHERE title = 'Mobile App Development with React Native' LIMIT 1),
'Navigation',
'video',
'https://www.youtube.com/embed/onT0hY3-2ek',
'<h5>Navigation</h5><p>React Navigation setup and implementation.</p>',
NULL,
3,
false,
'Module 3: Navigation'),

((SELECT id FROM courses WHERE title = 'Mobile App Development with React Native' LIMIT 1),
'State Management',
'video',
'https://www.youtube.com/embed/onT0hY3-2ek',
'<h5>State</h5><p>Context API and state management in RN.</p>',
NULL,
4,
false,
'Module 4: State Management'),

((SELECT id FROM courses WHERE title = 'Mobile App Development with React Native' LIMIT 1),
'APIs and Data',
'video',
'https://www.youtube.com/embed/onT0hY3-2ek',
'<h5>Data Fetching</h5><p>Fetching APIs, AsyncStorage, and data persistence.</p>',
NULL,
5,
false,
'Module 5: APIs and Data'),

((SELECT id FROM courses WHERE title = 'Mobile App Development with React Native' LIMIT 1),
'Device Features',
'video',
'https://www.youtube.com/embed/onT0hY3-2ek',
'<h5>Native Features</h5><p>Camera, location, and device APIs.</p>',
NULL,
6,
false,
'Module 6: Device Features'),

((SELECT id FROM courses WHERE title = 'Mobile App Development with React Native' LIMIT 1),
'Deployment',
'video',
'https://www.youtube.com/embed/onT0hY3-2ek',
'<h5>Publishing</h5><p>Building and publishing to App Store and Play Store.</p>',
NULL,
7,
false,
'Module 8: Deployment');

INSERT INTO course_quizzes (course_id, title, description, passing_score) VALUES
((SELECT id FROM courses WHERE title = 'Mobile App Development with React Native' LIMIT 1),
'React Native Quiz',
'Test your React Native knowledge.',
75.0);

INSERT INTO quiz_questions (quiz_id, question_text, options_json, correct_option, explanation, sort_order) VALUES
((SELECT id FROM course_quizzes WHERE title = 'React Native Quiz' LIMIT 1),
'What is the basic building block in React Native?',
'["<div>", "<View>", "<Container>", "<Section>"]',
1,
'<View> is the basic building block in React Native.',
1),

((SELECT id FROM course_quizzes WHERE title = 'React Native Quiz' LIMIT 1),
'Which library is used for navigation in React Native?',
'["React Router", "React Navigation", "React Native Navigation", "All of the above"]',
1,
'React Navigation is the standard navigation library for React Native.',
2);

-- ===========================================
-- PAID COURSE 4: Cloud Computing with AWS
-- ===========================================

INSERT INTO course_lessons (course_id, title, lesson_type, video_url, notes_content, attachment_url, sort_order, is_preview, module_name) VALUES
((SELECT id FROM courses WHERE title = 'Cloud Computing with AWS' LIMIT 1),
'Cloud Fundamentals',
'video',
'https://www.youtube.com/embed/mflgeESwRwk',
'<h5>Cloud Basics</h5><p>IaaS, PaaS, SaaS, and cloud computing models.</p>',
NULL,
1,
true,
'Module 1: Cloud Fundamentals'),

((SELECT id FROM courses WHERE title = 'Cloud Computing with AWS' LIMIT 1),
'EC2 and Compute',
'video',
'https://www.youtube.com/embed/mflgeESwRwk',
'<h5>EC2</h5><p>Launching EC2 instances and managing compute resources.</p>',
NULL,
2,
true,
'Module 2: EC2 and Compute'),

((SELECT id FROM courses WHERE title = 'Cloud Computing with AWS' LIMIT 1),
'Storage Solutions',
'video',
'https://www.youtube.com/embed/mflgeESwRwk',
'<h5>S3</h5><p>Amazon S3 for object storage and data management.</p>',
NULL,
3,
false,
'Module 3: Storage Solutions'),

((SELECT id FROM courses WHERE title = 'Cloud Computing with AWS' LIMIT 1),
'Databases on AWS',
'video',
'https://www.youtube.com/embed/mflgeESwRwk',
'<h5>RDS</h5><p>Amazon RDS for managed databases.</p>',
NULL,
4,
false,
'Module 4: Databases on AWS'),

((SELECT id FROM courses WHERE title = 'Cloud Computing with AWS' LIMIT 1),
'Networking',
'video',
'https://www.youtube.com/embed/mflgeESwRwk',
'<h5>VPC</h5><p>VPC, subnets, and networking in AWS.</p>',
NULL,
5,
false,
'Module 5: Networking'),

((SELECT id FROM courses WHERE title = 'Cloud Computing with AWS' LIMIT 1),
'Security and IAM',
'video',
'https://www.youtube.com/embed/mflgeESwRwk',
'<h5>IAM</h5><p>AWS Identity and Access Management.</p>',
NULL,
6,
false,
'Module 6: Security and IAM'),

((SELECT id FROM courses WHERE title = 'Cloud Computing with AWS' LIMIT 1),
'Serverless and Lambda',
'video',
'https://www.youtube.com/embed/mflgeESwRwk',
'<h5>Lambda</h5><p>AWS Lambda for serverless computing.</p>',
NULL,
7,
false,
'Module 7: Serverless and Lambda');

INSERT INTO course_quizzes (course_id, title, description, passing_score) VALUES
((SELECT id FROM courses WHERE title = 'Cloud Computing with AWS' LIMIT 1),
'AWS Cloud Quiz',
'Test your AWS knowledge.',
75.0);

INSERT INTO quiz_questions (quiz_id, question_text, options_json, correct_option, explanation, sort_order) VALUES
((SELECT id FROM course_quizzes WHERE title = 'AWS Cloud Quiz' LIMIT 1),
'What is EC2?',
'["Elastic Compute Cloud", "Elastic Container Cloud", "Elastic Content Cloud", "Elastic Computer Cloud"]',
0,
'EC2 stands for Elastic Compute Cloud.',
1),

((SELECT id FROM course_quizzes WHERE title = 'AWS Cloud Quiz' LIMIT 1),
'What service does AWS provide for object storage?',
'["EBS", "S3", "EFS", "RDS"]',
1,
'Amazon S3 is the object storage service in AWS.',
2);

-- ===========================================
-- PAID COURSE 5: Cybersecurity Professional
-- ===========================================

INSERT INTO course_lessons (course_id, title, lesson_type, video_url, notes_content, attachment_url, sort_order, is_preview, module_name) VALUES
((SELECT id FROM courses WHERE title = 'Cybersecurity Professional' LIMIT 1),
'Security Fundamentals',
'video',
'https://www.youtube.com/embed/inWWhr5tnEA',
'<h5>Security Basics</h5><p>CIA triad, threat landscape, and security principles.</p>',
NULL,
1,
true,
'Module 1: Security Fundamentals'),

((SELECT id FROM courses WHERE title = 'Cybersecurity Professional' LIMIT 1),
'Network Security',
'video',
'https://www.youtube.com/embed/inWWhr5tnEA',
'<h5>Network Security</h5><p>Firewalls, IDS/IPS, and network protection.</p>',
NULL,
2,
true,
'Module 2: Network Security'),

((SELECT id FROM courses WHERE title = 'Cybersecurity Professional' LIMIT 1),
'Threats and Attacks',
'video',
'https://www.youtube.com/embed/inWWhr5tnEA',
'<h5>Attack Types</h5><p>Malware, phishing, DDoS, and attack vectors.</p>',
NULL,
3,
false,
'Module 3: Threats and Attacks'),

((SELECT id FROM courses WHERE title = 'Cybersecurity Professional' LIMIT 1),
'Cryptography',
'video',
'https://www.youtube.com/embed/inWWhr5tnEA',
'<h5>Encryption</h5><p>Symmetric, asymmetric encryption, and hashing.</p>',
NULL,
4,
false,
'Module 4: Cryptography'),

((SELECT id FROM courses WHERE title = 'Cybersecurity Professional' LIMIT 1),
'Identity and Access Management',
'video',
'https://www.youtube.com/embed/inWWhr5tnEA',
'<h5>IAM</h5><p>Authentication, authorization, and access control.</p>',
NULL,
5,
false,
'Module 5: Identity and Access Management'),

((SELECT id FROM courses WHERE title = 'Cybersecurity Professional' LIMIT 1),
'Security Operations',
'video',
'https://www.youtube.com/embed/inWWhr5tnEA',
'<h5>SecOps</h5><p>Monitoring, incident response, and security operations.</p>',
NULL,
6,
false,
'Module 6: Security Operations'),

((SELECT id FROM courses WHERE title = 'Cybersecurity Professional' LIMIT 1),
'Incident Response',
'video',
'https://www.youtube.com/embed/inWWhr5tnEA',
'<h5>IR</h5><p>Incident response lifecycle and procedures.</p>',
NULL,
7,
false,
'Module 7: Incident Response'),

((SELECT id FROM courses WHERE title = 'Cybersecurity Professional' LIMIT 1),
'Ethical Hacking Basics',
'video',
'https://www.youtube.com/embed/inWWhr5tnEA',
'<h5>Penetration Testing</h5><p>Reconnaissance, scanning, and exploitation basics.</p>',
NULL,
8,
false,
'Module 8: Ethical Hacking Basics');

INSERT INTO course_quizzes (course_id, title, description, passing_score) VALUES
((SELECT id FROM courses WHERE title = 'Cybersecurity Professional' LIMIT 1),
'Cybersecurity Quiz',
'Test your cybersecurity knowledge.',
75.0);

INSERT INTO quiz_questions (quiz_id, question_text, options_json, correct_option, explanation, sort_order) VALUES
((SELECT id FROM course_quizzes WHERE title = 'Cybersecurity Quiz' LIMIT 1),
'What does CIA stand for in security?',
'["Central Intelligence Agency", "Confidentiality, Integrity, Availability", "Cyber Intelligence Agency", "Critical Infrastructure Assessment"]',
1,
'CIA triad stands for Confidentiality, Integrity, and Availability.',
1),

((SELECT id FROM course_quizzes WHERE title = 'Cybersecurity Quiz' LIMIT 1),
'What is a firewall?',
'["A physical wall", "A network security system", "A type of virus", "A password manager"]',
1,
'A firewall is a network security system that monitors and controls incoming and outgoing traffic.',
2);
