const DUMMY_PDF =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

function lesson(
  title,
  moduleName,
  videoUrl,
  notesHtml,
  sortOrder,
  isPreview,
  attachmentLabel
) {
  return {
    title,
    moduleName,
    lessonType: "mixed",
    videoUrl,
    notesContent: notesHtml,
    sortOrder,
    isPreview,
    attachmentUrl: attachmentLabel
      ? `${DUMMY_PDF}?name=${encodeURIComponent(attachmentLabel)}`
      : null,
  };
}

function quiz(title, description, questions) {
  return {
    title,
    description,
    passingScore: 70,
    questions,
  };
}

function q(text, options, correct, explanation) {
  return {
    questionText: text,
    options,
    correctOption: correct,
    explanation,
  };
}

const DEMO_COURSES = [
  {
    title: "Web Development Bootcamp 2024",
    category: "Web Development",
    level: "Beginner",
    price: 89.99,
    discountPrice: 64.99,
    thumbnailUrl: "/images/courses/course-01.jpg",
    description:
      "Master HTML, CSS, JavaScript, React, and backend basics through guided, practical projects.",
    modules: [
      {
        name: "Module 1: Foundations",
        lessons: [
          lesson(
            "Course Overview and Setup",
            "Module 1: Foundations",
            "https://www.youtube.com/embed/qz0aGYrrlhU",
            "<h5>Welcome</h5><p>Understand the course path, tools, and project structure before you begin.</p><ul><li>Install VS Code and browser dev tools</li><li>Review the final project requirements</li></ul>",
            1,
            true,
            "Web Dev Setup Guide"
          ),
          lesson(
            "HTML Foundations",
            "Module 1: Foundations",
            "https://www.youtube.com/embed/UB1O30fR-EE",
            "<h5>HTML Basics</h5><p>Build semantic page structure with headings, lists, links, and forms.</p><p><strong>Practice:</strong> Create a personal portfolio skeleton.</p>",
            2,
            false,
            "HTML Cheat Sheet"
          ),
        ],
      },
      {
        name: "Module 2: Styling & Layout",
        lessons: [
          lesson(
            "CSS Flexbox and Grid",
            "Module 2: Styling & Layout",
            "https://www.youtube.com/embed/JJSoEo8JSnc",
            "<h5>Modern Layout</h5><p>Master Flexbox and CSS Grid for responsive designs without frameworks.</p>",
            3,
            false,
            "CSS Layout Workbook"
          ),
          lesson(
            "Responsive Design Patterns",
            "Module 2: Styling & Layout",
            "https://www.youtube.com/embed/srvUrASNj0s",
            "<h5>Mobile First</h5><p>Apply media queries and fluid typography for all screen sizes.</p>",
            4,
            false,
            "Responsive Design Checklist"
          ),
        ],
      },
      {
        name: "Module 3: JavaScript & React",
        lessons: [
          lesson(
            "JavaScript ES6 Essentials",
            "Module 3: JavaScript & React",
            "https://www.youtube.com/embed/PkZNo7MFNFg",
            "<h5>Modern JS</h5><p>Arrow functions, destructuring, promises, and async/await.</p>",
            5,
            false,
            "JavaScript ES6 Reference"
          ),
          lesson(
            "React Components and State",
            "Module 3: JavaScript & React",
            "https://www.youtube.com/embed/Tn6pHGtw2_8",
            "<h5>React Basics</h5><p>Build interactive UIs with components, props, and hooks.</p>",
            6,
            false,
            "React Starter Template"
          ),
        ],
      },
    ],
    quizzes: [
      quiz(
        "Web Development Fundamentals Quiz",
        "Test your knowledge of HTML, CSS, and JavaScript basics.",
        [
          q("Which HTML tag is used for the largest heading?", ["<h6>", "<h1>", "<head>", "<header>"], 1, "h1 is the largest heading level."),
          q("What does CSS Flexbox primarily help with?", ["Database queries", "Layout alignment", "Server routing", "File compression"], 1, "Flexbox is a layout model for alignment."),
          q("Which keyword declares a block-scoped variable in ES6?", ["var", "let", "function", "class"], 1, "let and const are block-scoped."),
        ]
      ),
    ],
  },
  {
    title: "Data Science & Machine Learning",
    category: "Data Science",
    level: "Intermediate",
    price: 99.99,
    discountPrice: 74.99,
    thumbnailUrl: "/images/courses/course-02.jpg",
    description:
      "Learn data cleaning, exploratory analysis, feature engineering, and machine learning workflows.",
    modules: [
      {
        name: "Module 1: Data Foundations",
        lessons: [
          lesson(
            "Data Science Workflow",
            "Module 1: Data Foundations",
            "https://www.youtube.com/embed/r-uOLxNrNk8",
            "<h5>Workflow</h5><p>Move from raw data to actionable insights using a practical analysis pipeline.</p>",
            1,
            true,
            "Data Science Workflow Map"
          ),
          lesson(
            "Python for Data Analysis",
            "Module 1: Data Foundations",
            "https://www.youtube.com/embed/r-uOLxNrNk8",
            "<h5>Pandas & NumPy</h5><p>Load, clean, and transform datasets with industry-standard libraries.</p>",
            2,
            false,
            "Pandas Quick Reference"
          ),
        ],
      },
      {
        name: "Module 2: Visualization",
        lessons: [
          lesson(
            "Exploratory Data Analysis",
            "Module 2: Visualization",
            "https://www.youtube.com/embed/ua-CiDNNj30",
            "<h5>EDA</h5><p>Discover patterns with summary statistics and visual exploration.</p>",
            3,
            false,
            "EDA Template Notebook"
          ),
          lesson(
            "Data Visualization with Matplotlib",
            "Module 2: Visualization",
            "https://www.youtube.com/embed/UO95lATEiq4",
            "<h5>Charts</h5><p>Create bar charts, histograms, and scatter plots for storytelling.</p>",
            4,
            false,
            "Visualization Style Guide"
          ),
        ],
      },
      {
        name: "Module 3: Machine Learning",
        lessons: [
          lesson(
            "Feature Engineering",
            "Module 3: Machine Learning",
            "https://www.youtube.com/embed/7eh4d6sabA0",
            "<h5>Features</h5><p>Encode categorical variables and scale numeric features.</p>",
            5,
            false,
            "Feature Engineering Guide"
          ),
          lesson(
            "Training Your First Model",
            "Module 3: Machine Learning",
            "https://www.youtube.com/embed/7eh4d6sabA0",
            "<h5>Model Training</h5><p>Train, validate, and evaluate a first machine learning model.</p>",
            6,
            false,
            "ML Model Evaluation Sheet"
          ),
        ],
      },
    ],
    quizzes: [
      quiz(
        "Data Science Assessment",
        "Evaluate your understanding of data analysis and ML concepts.",
        [
          q("Which library is commonly used for data manipulation in Python?", ["Flask", "Pandas", "React", "Express"], 1, "Pandas is the standard data manipulation library."),
          q("What is the purpose of a train/test split?", ["Speed up training", "Evaluate model generalization", "Reduce dataset size", "Encrypt data"], 1, "It measures how well the model generalizes."),
          q("Which plot helps detect outliers in numeric data?", ["Pie chart", "Box plot", "Map chart", "Gantt chart"], 1, "Box plots show distribution and outliers."),
        ]
      ),
    ],
  },
  {
    title: "Digital Marketing Masterclass",
    category: "Marketing",
    level: "All Levels",
    price: 0,
    discountPrice: 0,
    thumbnailUrl: "/images/courses/course-03.jpg",
    description:
      "Plan SEO, social media, paid ads, and campaign analytics in one practical marketing track.",
    modules: [
      {
        name: "Module 1: Marketing Strategy",
        lessons: [
          lesson(
            "Marketing Foundations",
            "Module 1: Marketing Strategy",
            "https://www.youtube.com/embed/nU-IIXBWlS4",
            "<h5>Foundations</h5><p>Understand channels, audiences, and campaign goals.</p>",
            1,
            true,
            "Marketing Strategy Template"
          ),
          lesson(
            "Audience Research Methods",
            "Module 1: Marketing Strategy",
            "https://www.youtube.com/embed/hn0Kh4k4aXc",
            "<h5>Research</h5><p>Define personas and map customer journeys.</p>",
            2,
            false,
            "Audience Persona Worksheet"
          ),
        ],
      },
      {
        name: "Module 2: Digital Channels",
        lessons: [
          lesson(
            "SEO Fundamentals",
            "Module 2: Digital Channels",
            "https://www.youtube.com/embed/xh4RTlN2u5c",
            "<h5>SEO</h5><p>Optimize on-page content and technical SEO basics.</p>",
            3,
            false,
            "SEO Audit Checklist"
          ),
          lesson(
            "Social Media Marketing",
            "Module 2: Digital Channels",
            "https://www.youtube.com/embed/9No-FiEInLA",
            "<h5>Social</h5><p>Plan content calendars and engagement strategies.</p>",
            4,
            false,
            "Social Media Calendar"
          ),
        ],
      },
      {
        name: "Module 3: Campaign Execution",
        lessons: [
          lesson(
            "Paid Advertising Basics",
            "Module 3: Campaign Execution",
            "https://www.youtube.com/embed/9No-FiEInLA",
            "<h5>Paid Ads</h5><p>Run Google and social media ad campaigns with budgets.</p>",
            5,
            false,
            "Ad Campaign Planner"
          ),
          lesson(
            "Building a Campaign Strategy",
            "Module 3: Campaign Execution",
            "https://www.youtube.com/embed/hn0Kh4k4aXc",
            "<h5>Strategy</h5><p>Create a coordinated campaign with clear messaging and measurement.</p>",
            6,
            false,
            "Campaign ROI Calculator"
          ),
        ],
      },
    ],
    quizzes: [
      quiz(
        "Digital Marketing Quiz",
        "Test your marketing strategy and channel knowledge.",
        [
          q("What does SEO stand for?", ["Social Engagement Optimization", "Search Engine Optimization", "Sales Email Outreach", "Secure Email Operations"], 1, "SEO optimizes for search engines."),
          q("Which metric measures ad click-through rate?", ["CTR", "CPA", "ROAS", "LTV"], 0, "CTR = clicks / impressions."),
          q("A customer persona describes:", ["Server configuration", "Ideal customer profile", "Product pricing", "Team structure"], 1, "Personas represent target customers."),
        ]
      ),
    ],
  },
  {
    title: "Mobile App Development with React Native",
    category: "Mobile Development",
    level: "Intermediate",
    price: 74.99,
    discountPrice: 54.99,
    thumbnailUrl: "/images/courses/course-04.jpg",
    description:
      "Create cross-platform mobile apps with navigation, APIs, and real production structure.",
    modules: [
      {
        name: "Module 1: Getting Started",
        lessons: [
          lesson(
            "React Native Environment Setup",
            "Module 1: Getting Started",
            "https://www.youtube.com/embed/0-S5a0eXPoc",
            "<h5>Setup</h5><p>Install tools and structure your first React Native project.</p>",
            1,
            true,
            "RN Setup Guide"
          ),
          lesson(
            "Core Components and Styling",
            "Module 1: Getting Started",
            "https://www.youtube.com/embed/0-S5a0eXPoc",
            "<h5>Components</h5><p>View, Text, Image, and StyleSheet fundamentals.</p>",
            2,
            false,
            "RN Component Reference"
          ),
        ],
      },
      {
        name: "Module 2: Navigation",
        lessons: [
          lesson(
            "Navigation and Screens",
            "Module 2: Navigation",
            "https://www.youtube.com/embed/ANdSdIlgsEw",
            "<h5>Navigation</h5><p>Create screens and route between them with a clean UX flow.</p>",
            3,
            false,
            "Navigation Patterns Guide"
          ),
          lesson(
            "Stack and Tab Navigators",
            "Module 2: Navigation",
            "https://www.youtube.com/embed/ANdSdIlgsEw",
            "<h5>Navigators</h5><p>Implement stack, tab, and drawer navigation patterns.</p>",
            4,
            false,
            "Navigator Examples"
          ),
        ],
      },
      {
        name: "Module 3: APIs & State",
        lessons: [
          lesson(
            "Fetching Data from APIs",
            "Module 3: APIs & State",
            "https://www.youtube.com/embed/0-S5a0eXPoc",
            "<h5>APIs</h5><p>Connect to REST APIs and handle loading states.</p>",
            5,
            false,
            "API Integration Guide"
          ),
          lesson(
            "State Management Patterns",
            "Module 3: APIs & State",
            "https://www.youtube.com/embed/0-S5a0eXPoc",
            "<h5>State</h5><p>Manage app state with Context and custom hooks.</p>",
            6,
            false,
            "State Management Patterns"
          ),
        ],
      },
    ],
    quizzes: [
      quiz(
        "React Native Quiz",
        "Assess your mobile development skills.",
        [
          q("React Native uses which language?", ["Swift only", "JavaScript/TypeScript", "C#", "Ruby"], 1, "React Native uses JS/TS."),
          q("Which component wraps screen content?", ["View", "Screen", "Page", "Container"], 0, "View is the primary container."),
          q("Expo simplifies:", ["Database design", "Development setup", "Hardware manufacturing", "DNS configuration"], 1, "Expo streamlines RN development."),
        ]
      ),
    ],
  },
  {
    title: "Python for Beginners",
    category: "Programming",
    level: "Beginner",
    price: 0,
    discountPrice: 0,
    thumbnailUrl: "/images/courses/course-05.jpg",
    description:
      "Start coding with Python syntax, variables, loops, functions, and beginner projects.",
    modules: [
      {
        name: "Module 1: Python Basics",
        lessons: [
          lesson(
            "Python Basics",
            "Module 1: Python Basics",
            "https://www.youtube.com/embed/_uQrJ0TkZlc",
            "<h5>Python Basics</h5><p>Learn syntax, variables, and expressions in your first Python program.</p>",
            1,
            true,
            "Python Syntax Guide"
          ),
          lesson(
            "Data Types and Operators",
            "Module 1: Python Basics",
            "https://www.youtube.com/embed/_uQrJ0TkZlc",
            "<h5>Types</h5><p>Work with strings, numbers, lists, and dictionaries.</p>",
            2,
            false,
            "Python Data Types Sheet"
          ),
        ],
      },
      {
        name: "Module 2: Control Flow",
        lessons: [
          lesson(
            "Conditions and Loops",
            "Module 2: Control Flow",
            "https://www.youtube.com/embed/kqtD5dpn9C8",
            "<h5>Control Flow</h5><p>Use if/else statements and for/while loops.</p>",
            3,
            false,
            "Control Flow Exercises"
          ),
          lesson(
            "Functions and Control Flow",
            "Module 2: Control Flow",
            "https://www.youtube.com/embed/kqtD5dpn9C8",
            "<h5>Functions</h5><p>Use conditions, loops, and functions to solve small problems.</p>",
            4,
            false,
            "Functions Practice Set"
          ),
        ],
      },
      {
        name: "Module 3: Projects",
        lessons: [
          lesson(
            "File Handling",
            "Module 3: Projects",
            "https://www.youtube.com/embed/Uh2ebFW8OYM",
            "<h5>Files</h5><p>Read and write text files with Python.</p>",
            5,
            false,
            "File Handling Guide"
          ),
          lesson(
            "Build a Calculator App",
            "Module 3: Projects",
            "https://www.youtube.com/embed/_uQrJ0TkZlc",
            "<h5>Project</h5><p>Combine all concepts into a command-line calculator.</p>",
            6,
            false,
            "Calculator Project Spec"
          ),
        ],
      },
    ],
    quizzes: [
      quiz(
        "Python Basics Quiz",
        "Test your Python fundamentals.",
        [
          q("How do you print in Python 3?", ["echo()", "print()", "printf()", "console.log()"], 1, "print() outputs to console."),
          q("Which creates a list?", ["list = {}", "list = []", "list = ()", "list = <>"], 1, "Square brackets create lists."),
          q("def keyword is used to:", ["Define a function", "Delete a file", "Import a module", "Create a class"], 0, "def defines functions."),
        ]
      ),
    ],
  },
  {
    title: "UI/UX Design Fundamentals",
    category: "Design",
    level: "Beginner",
    price: 0,
    discountPrice: 0,
    thumbnailUrl: "/images/courses/course-06.jpg",
    description:
      "Design user-centered digital products through research, wireframes, prototypes, and testing.",
    modules: [
      {
        name: "Module 1: Design Thinking",
        lessons: [
          lesson(
            "Design Thinking Basics",
            "Module 1: Design Thinking",
            "https://www.youtube.com/embed/_Hp_dI0DzY4",
            "<h5>Design Thinking</h5><p>Learn empathize, define, ideate, prototype, and test.</p>",
            1,
            true,
            "Design Thinking Canvas"
          ),
          lesson(
            "User Research Methods",
            "Module 1: Design Thinking",
            "https://www.youtube.com/embed/_Hp_dI0DzY4",
            "<h5>Research</h5><p>Conduct interviews and usability studies.</p>",
            2,
            false,
            "User Research Template"
          ),
        ],
      },
      {
        name: "Module 2: Wireframing",
        lessons: [
          lesson(
            "Wireframes and Prototypes",
            "Module 2: Wireframing",
            "https://www.youtube.com/embed/c9Wg6Cb_YlU",
            "<h5>Wireframing</h5><p>Move from sketches to digital prototypes with clear user journeys.</p>",
            3,
            false,
            "Wireframe Kit"
          ),
          lesson(
            "Low vs High Fidelity Design",
            "Module 2: Wireframing",
            "https://www.youtube.com/embed/c9Wg6Cb_YlU",
            "<h5>Fidelity</h5><p>Choose the right fidelity level for each design phase.</p>",
            4,
            false,
            "Fidelity Comparison Guide"
          ),
        ],
      },
      {
        name: "Module 3: Visual Design",
        lessons: [
          lesson(
            "Color Theory and Typography",
            "Module 3: Visual Design",
            "https://www.youtube.com/embed/_Hp_dI0DzY4",
            "<h5>Visual</h5><p>Apply color palettes and type scales for readable interfaces.</p>",
            5,
            false,
            "Color & Typography Guide"
          ),
          lesson(
            "Usability Testing",
            "Module 3: Visual Design",
            "https://www.youtube.com/embed/c9Wg6Cb_YlU",
            "<h5>Testing</h5><p>Run usability tests and iterate on feedback.</p>",
            6,
            false,
            "Usability Test Script"
          ),
        ],
      },
    ],
    quizzes: [
      quiz(
        "UI/UX Design Quiz",
        "Evaluate your design fundamentals.",
        [
          q("Wireframes are primarily used for:", ["Final visual design", "Layout structure", "Code generation", "Database design"], 1, "Wireframes show layout structure."),
          q("UX focuses on:", ["User experience", "Server uptime", "Compiler optimization", "Network security"], 0, "UX is about user experience."),
          q("A design system provides:", ["Reusable components and guidelines", "Server configs", "Payment processing", "SEO rankings"], 0, "Design systems unify UI patterns."),
        ]
      ),
    ],
  },
  {
    title: "Business Analytics & Excel",
    category: "Business",
    level: "Beginner",
    price: 0,
    discountPrice: 0,
    thumbnailUrl: "/images/courses/course-07.jpg",
    description:
      "Build professional spreadsheets, reports, and dashboards for business decision making.",
    modules: [
      {
        name: "Module 1: Excel Essentials",
        lessons: [
          lesson(
            "Excel Essentials",
            "Module 1: Excel Essentials",
            "https://www.youtube.com/embed/rwbho0CgEAE",
            "<h5>Excel Basics</h5><p>Understand worksheet structure, formulas, and core spreadsheet skills.</p>",
            1,
            true,
            "Excel Basics Workbook"
          ),
          lesson(
            "Formulas and Functions",
            "Module 1: Excel Essentials",
            "https://www.youtube.com/embed/rwbho0CgEAE",
            "<h5>Formulas</h5><p>Master SUM, AVERAGE, IF, and VLOOKUP functions.</p>",
            2,
            false,
            "Excel Formula Reference"
          ),
        ],
      },
      {
        name: "Module 2: Data Analysis",
        lessons: [
          lesson(
            "Pivot Tables",
            "Module 2: Data Analysis",
            "https://www.youtube.com/embed/9NUjHBNWe9M",
            "<h5>Pivots</h5><p>Summarize large datasets with pivot tables.</p>",
            3,
            false,
            "Pivot Table Guide"
          ),
          lesson(
            "Charts and Dashboards",
            "Module 2: Data Analysis",
            "https://www.youtube.com/embed/9NUjHBNWe9M",
            "<h5>Dashboards</h5><p>Build visual summaries for reporting and performance tracking.</p>",
            4,
            false,
            "Dashboard Template"
          ),
        ],
      },
      {
        name: "Module 3: Business Reporting",
        lessons: [
          lesson(
            "Financial Modeling Basics",
            "Module 3: Business Reporting",
            "https://www.youtube.com/embed/rwbho0CgEAE",
            "<h5>Modeling</h5><p>Create revenue forecasts and budget models.</p>",
            5,
            false,
            "Financial Model Template"
          ),
          lesson(
            "Executive Reporting",
            "Module 3: Business Reporting",
            "https://www.youtube.com/embed/9NUjHBNWe9M",
            "<h5>Reporting</h5><p>Present data insights to stakeholders effectively.</p>",
            6,
            false,
            "Executive Report Template"
          ),
        ],
      },
    ],
    quizzes: [
      quiz(
        "Excel Analytics Quiz",
        "Test your spreadsheet and analytics skills.",
        [
          q("Which function finds values in a table?", ["SUM", "VLOOKUP", "LEN", "NOW"], 1, "VLOOKUP searches vertically."),
          q("Pivot tables help with:", ["Data summarization", "Image editing", "Video encoding", "DNS lookup"], 0, "Pivots summarize data."),
          q("A dashboard typically includes:", ["Charts and KPIs", "Source code", "Firewall rules", "Email templates"], 0, "Dashboards show KPIs visually."),
        ]
      ),
    ],
  },
  {
    title: "Advanced JavaScript Patterns",
    category: "Web Development",
    level: "Advanced",
    price: 89.99,
    discountPrice: 69.99,
    thumbnailUrl: "/images/courses/course-08.jpg",
    description:
      "Dive into architecture patterns, async flows, state modeling, and performance optimization.",
    modules: [
      {
        name: "Module 1: Modern JavaScript",
        lessons: [
          lesson(
            "Modern JavaScript Review",
            "Module 1: Modern JavaScript",
            "https://www.youtube.com/embed/PkZNo7MFNFg",
            "<h5>Review</h5><p>Refresh closures, promises, modules, and clean code conventions.</p>",
            1,
            true,
            "JS Advanced Reference"
          ),
          lesson(
            "Async Patterns Deep Dive",
            "Module 1: Modern JavaScript",
            "https://www.youtube.com/embed/PoRJizFvM7o",
            "<h5>Async</h5><p>Master promises, async/await, and error handling patterns.</p>",
            2,
            false,
            "Async Patterns Guide"
          ),
        ],
      },
      {
        name: "Module 2: Architecture",
        lessons: [
          lesson(
            "Patterns for Large Applications",
            "Module 2: Architecture",
            "https://www.youtube.com/embed/Bv_5Zv5c-Ts",
            "<h5>Patterns</h5><p>Explore architecture choices for maintainable JavaScript systems.</p>",
            3,
            false,
            "Architecture Patterns PDF"
          ),
          lesson(
            "Module and Dependency Patterns",
            "Module 2: Architecture",
            "https://www.youtube.com/embed/Bv_5Zv5c-Ts",
            "<h5>Modules</h5><p>ES modules, bundlers, and dependency injection.</p>",
            4,
            false,
            "Module System Guide"
          ),
        ],
      },
      {
        name: "Module 3: Performance",
        lessons: [
          lesson(
            "Performance Optimization",
            "Module 3: Performance",
            "https://www.youtube.com/embed/PkZNo7MFNFg",
            "<h5>Performance</h5><p>Profile and optimize JavaScript runtime performance.</p>",
            5,
            false,
            "Performance Checklist"
          ),
          lesson(
            "Testing and Debugging",
            "Module 3: Performance",
            "https://www.youtube.com/embed/PkZNo7MFNFg",
            "<h5>Testing</h5><p>Unit testing, integration tests, and debugging strategies.</p>",
            6,
            false,
            "Testing Best Practices"
          ),
        ],
      },
    ],
    quizzes: [
      quiz(
        "Advanced JavaScript Quiz",
        "Challenge your JS architecture knowledge.",
        [
          q("A closure allows a function to:", ["Access outer scope variables", "Delete databases", "Compile C code", "Render HTML"], 0, "Closures capture outer scope."),
          q("async/await is built on:", ["Promises", "Callbacks only", "WebSockets", "Cookies"], 0, "async/await uses promises."),
          q("Debouncing limits:", ["Function call frequency", "Memory usage only", "Network bandwidth", "CSS rendering"], 0, "Debounce limits rapid calls."),
        ]
      ),
    ],
  },
  {
    title: "Cybersecurity Fundamentals",
    category: "Security",
    level: "Intermediate",
    price: 94.99,
    discountPrice: 74.99,
    thumbnailUrl: "/images/courses/course-09.jpg",
    description:
      "Understand modern security threats, secure coding basics, and defensive security strategy.",
    modules: [
      {
        name: "Module 1: Security Landscape",
        lessons: [
          lesson(
            "Threat Landscape Overview",
            "Module 1: Security Landscape",
            "https://www.youtube.com/embed/inWWhr5tnEA",
            "<h5>Threats</h5><p>Review common threats, attack surfaces, and defense principles.</p>",
            1,
            true,
            "Threat Landscape Report"
          ),
          lesson(
            "Attack Vectors and Mitigations",
            "Module 1: Security Landscape",
            "https://www.youtube.com/embed/inWWhr5tnEA",
            "<h5>Vectors</h5><p>Phishing, malware, and social engineering defenses.</p>",
            2,
            false,
            "Attack Vector Matrix"
          ),
        ],
      },
      {
        name: "Module 2: Secure Development",
        lessons: [
          lesson(
            "Secure Development Practices",
            "Module 2: Secure Development",
            "https://www.youtube.com/embed/3Kq1MIfTWCE",
            "<h5>Secure Coding</h5><p>Apply security best practices throughout the development lifecycle.</p>",
            3,
            false,
            "Secure Coding Checklist"
          ),
          lesson(
            "Authentication and Authorization",
            "Module 2: Secure Development",
            "https://www.youtube.com/embed/3Kq1MIfTWCE",
            "<h5>Auth</h5><p>Implement secure login, sessions, and access control.</p>",
            4,
            false,
            "Auth Security Guide"
          ),
        ],
      },
      {
        name: "Module 3: Network Security",
        lessons: [
          lesson(
            "Network Security Basics",
            "Module 3: Network Security",
            "https://www.youtube.com/embed/inWWhr5tnEA",
            "<h5>Networks</h5><p>Firewalls, VPNs, and network segmentation.</p>",
            5,
            false,
            "Network Security Guide"
          ),
          lesson(
            "Incident Response Planning",
            "Module 3: Network Security",
            "https://www.youtube.com/embed/3Kq1MIfTWCE",
            "<h5>Incidents</h5><p>Detect, respond, and recover from security incidents.</p>",
            6,
            false,
            "Incident Response Playbook"
          ),
        ],
      },
    ],
    quizzes: [
      quiz(
        "Cybersecurity Quiz",
        "Assess your security fundamentals.",
        [
          q("Phishing is a type of:", ["Social engineering attack", "Hardware failure", "Design pattern", "Database index"], 0, "Phishing exploits human trust."),
          q("HTTPS provides:", ["Encrypted communication", "Faster DNS", "Image compression", "File backup"], 0, "HTTPS encrypts traffic."),
          q("MFA adds:", ["An extra authentication factor", "More storage", "UI themes", "SEO ranking"], 0, "MFA adds security layers."),
        ]
      ),
    ],
  },
  {
    title: "Graphic Design with Adobe Suite",
    category: "Design",
    level: "All Levels",
    price: 0,
    discountPrice: 0,
    thumbnailUrl: "/images/courses/course-10.jpg",
    description:
      "Create polished visual assets with Photoshop, Illustrator, and practical branding workflows.",
    modules: [
      {
        name: "Module 1: Adobe Workflow",
        lessons: [
          lesson(
            "Adobe Workflow Basics",
            "Module 1: Adobe Workflow",
            "https://www.youtube.com/embed/Ib8UBwu3yGA",
            "<h5>Workflow</h5><p>Understand where Photoshop, Illustrator, and InDesign each fit.</p>",
            1,
            true,
            "Adobe Suite Overview"
          ),
          lesson(
            "Photoshop Essentials",
            "Module 1: Adobe Workflow",
            "https://www.youtube.com/embed/Ib8UBwu3yGA",
            "<h5>Photoshop</h5><p>Layers, masks, and photo retouching basics.</p>",
            2,
            false,
            "Photoshop Quick Start"
          ),
        ],
      },
      {
        name: "Module 2: Vector Design",
        lessons: [
          lesson(
            "Illustrator Vector Graphics",
            "Module 2: Vector Design",
            "https://www.youtube.com/embed/68w2VwalD5w",
            "<h5>Vectors</h5><p>Create scalable logos and icons with paths.</p>",
            3,
            false,
            "Illustrator Guide"
          ),
          lesson(
            "Brand Asset Creation",
            "Module 2: Vector Design",
            "https://www.youtube.com/embed/68w2VwalD5w",
            "<h5>Brand Assets</h5><p>Create reusable, polished assets for campaigns and product design.</p>",
            4,
            false,
            "Brand Asset Kit"
          ),
        ],
      },
      {
        name: "Module 3: Print & Digital",
        lessons: [
          lesson(
            "Layout with InDesign",
            "Module 3: Print & Digital",
            "https://www.youtube.com/embed/Ib8UBwu3yGA",
            "<h5>InDesign</h5><p>Design brochures, magazines, and print-ready documents.</p>",
            5,
            false,
            "InDesign Layout Guide"
          ),
          lesson(
            "Exporting for Web and Print",
            "Module 3: Print & Digital",
            "https://www.youtube.com/embed/68w2VwalD5w",
            "<h5>Export</h5><p>Export assets in correct formats and resolutions.</p>",
            6,
            false,
            "Export Settings Guide"
          ),
        ],
      },
    ],
    quizzes: [
      quiz(
        "Graphic Design Quiz",
        "Test your Adobe and design knowledge.",
        [
          q("Illustrator is best for:", ["Vector graphics", "Video editing", "3D modeling", "Spreadsheets"], 0, "Illustrator creates vectors."),
          q("Layers in Photoshop help:", ["Organize and edit elements separately", "Increase file size only", "Remove colors", "Encrypt files"], 0, "Layers organize edits."),
          q("CMYK is used for:", ["Print color", "Web animation", "Audio mixing", "Code compilation"], 0, "CMYK is for print."),
        ]
      ),
    ],
  },
  {
    title: "Cloud Computing with AWS",
    category: "Cloud",
    level: "Intermediate",
    price: 99.99,
    discountPrice: 79.99,
    thumbnailUrl: "/images/courses/course-11.jpg",
    description:
      "Deploy scalable cloud infrastructure on AWS with IAM, EC2, S3, and core architecture patterns.",
    modules: [
      {
        name: "Module 1: AWS Foundations",
        lessons: [
          lesson(
            "AWS Core Services",
            "Module 1: AWS Foundations",
            "https://www.youtube.com/embed/ulprqHHWlng",
            "<h5>AWS Services</h5><p>Understand IAM, EC2, S3, and foundational cloud terminology.</p>",
            1,
            true,
            "AWS Services Map"
          ),
          lesson(
            "IAM and Security",
            "Module 1: AWS Foundations",
            "https://www.youtube.com/embed/ulprqHHWlng",
            "<h5>IAM</h5><p>Manage users, roles, and policies securely.</p>",
            2,
            false,
            "IAM Best Practices"
          ),
        ],
      },
      {
        name: "Module 2: Compute & Storage",
        lessons: [
          lesson(
            "EC2 Instances",
            "Module 2: Compute & Storage",
            "https://www.youtube.com/embed/k1RI5locZE4",
            "<h5>EC2</h5><p>Launch and configure virtual servers.</p>",
            3,
            false,
            "EC2 Setup Guide"
          ),
          lesson(
            "S3 Storage Solutions",
            "Module 2: Compute & Storage",
            "https://www.youtube.com/embed/k1RI5locZE4",
            "<h5>S3</h5><p>Store and serve static assets with S3 buckets.</p>",
            4,
            false,
            "S3 Configuration Guide"
          ),
        ],
      },
      {
        name: "Module 3: Deployment",
        lessons: [
          lesson(
            "Deploying a Simple Architecture",
            "Module 3: Deployment",
            "https://www.youtube.com/embed/k1RI5locZE4",
            "<h5>Deployment</h5><p>Put together a practical cloud deployment with security and scale in mind.</p>",
            5,
            false,
            "Architecture Diagram"
          ),
          lesson(
            "Monitoring and Scaling",
            "Module 3: Deployment",
            "https://www.youtube.com/embed/ulprqHHWlng",
            "<h5>Scaling</h5><p>Use CloudWatch and auto-scaling groups.</p>",
            6,
            false,
            "Monitoring Setup Guide"
          ),
        ],
      },
    ],
    quizzes: [
      quiz(
        "AWS Cloud Quiz",
        "Evaluate your AWS knowledge.",
        [
          q("S3 is used for:", ["Object storage", "Email hosting", "DNS only", "GPU rendering"], 0, "S3 stores objects."),
          q("EC2 provides:", ["Virtual servers", "Email service", "Design tools", "Spreadsheets"], 0, "EC2 is compute."),
          q("IAM manages:", ["Access and permissions", "Image editing", "Video streaming", "Font licensing"], 0, "IAM controls access."),
        ]
      ),
    ],
  },
  {
    title: "Project Management Professional (PMP)",
    category: "Business",
    level: "All Levels",
    price: 0,
    discountPrice: 0,
    thumbnailUrl: "/images/courses/course-12.jpg",
    description:
      "Prepare for PMP concepts across scope, schedule, risk, stakeholders, and delivery planning.",
    modules: [
      {
        name: "Module 1: Project Lifecycle",
        lessons: [
          lesson(
            "Project Lifecycle Overview",
            "Module 1: Project Lifecycle",
            "https://www.youtube.com/embed/GC7pN8Mjot8",
            "<h5>Lifecycle</h5><p>Understand initiation, planning, execution, monitoring, and closure.</p>",
            1,
            true,
            "Project Lifecycle Guide"
          ),
          lesson(
            "Scope and Requirements",
            "Module 1: Project Lifecycle",
            "https://www.youtube.com/embed/GC7pN8Mjot8",
            "<h5>Scope</h5><p>Define scope statements and manage requirements.</p>",
            2,
            false,
            "Scope Statement Template"
          ),
        ],
      },
      {
        name: "Module 2: Planning",
        lessons: [
          lesson(
            "Schedule Management",
            "Module 2: Planning",
            "https://www.youtube.com/embed/7M7QGZy2pPw",
            "<h5>Schedule</h5><p>Create Gantt charts and critical path schedules.</p>",
            3,
            false,
            "Schedule Template"
          ),
          lesson(
            "Risk and Stakeholder Planning",
            "Module 2: Planning",
            "https://www.youtube.com/embed/7M7QGZy2pPw",
            "<h5>Planning</h5><p>Manage risks and stakeholders with structured project communication.</p>",
            4,
            false,
            "Risk Register Template"
          ),
        ],
      },
      {
        name: "Module 3: Execution",
        lessons: [
          lesson(
            "Team Leadership",
            "Module 3: Execution",
            "https://www.youtube.com/embed/GC7pN8Mjot8",
            "<h5>Leadership</h5><p>Lead teams through execution and change management.</p>",
            5,
            false,
            "Team Leadership Guide"
          ),
          lesson(
            "Project Closure",
            "Module 3: Execution",
            "https://www.youtube.com/embed/7M7QGZy2pPw",
            "<h5>Closure</h5><p>Close projects with lessons learned and handoff documentation.</p>",
            6,
            false,
            "Closure Checklist"
          ),
        ],
      },
    ],
    quizzes: [
      quiz(
        "PMP Concepts Quiz",
        "Test your project management knowledge.",
        [
          q("A project charter defines:", ["Project purpose and authority", "Server configuration", "Color palette", "Database schema"], 0, "Charter authorizes the project."),
          q("Critical path is:", ["Longest sequence of dependent tasks", "Shortest meeting", "Budget surplus", "Team size"], 0, "Critical path determines minimum duration."),
          q("Risk mitigation aims to:", ["Reduce risk impact or probability", "Increase project scope", "Remove all stakeholders", "Skip testing"], 0, "Mitigation reduces risk."),
        ]
      ),
    ],
  },
];

module.exports = { DEMO_COURSES, DUMMY_PDF };
