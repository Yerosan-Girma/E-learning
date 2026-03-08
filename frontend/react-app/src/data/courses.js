import { slugifyCategory } from "../utils/format";

const baseCourses = [
  {
    id: 1,
    title: "Web Development Bootcamp 2024",
    instructor: "Yerosan Girma",
    rating: 4.8,
    reviews: 1247,
    durationHours: 42,
    lectures: 320,
    level: "Beginner",
    price: 89.99,
    discountPrice: 64.99,
    image:
      "c:/Users/pc/OneDrive/Desktop/PC/Distande education/frontend/react-app/public/images/yerosan.jpg",
    category: "Web Development",
    isFeatured: true,
    isFree: false,
    students: 8500,
    shortDescription:
      "Master HTML, CSS, JavaScript, React, and modern backend basics by building production-ready projects.",
  },
  {
    id: 2,
    title: "Data Science & Machine Learning",
    instructor: "Dr. Michael Chen",
    rating: 4.9,
    reviews: 892,
    durationHours: 56,
    lectures: 420,
    level: "Intermediate",
    price: 99.99,
    discountPrice: 74.99,
    image:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Data Science",
    isFeatured: true,
    isFree: false,
    students: 5600,
    shortDescription:
      "Learn data analysis, feature engineering, model training, and deployment with practical Python workflows.",
  },
  {
    id: 3,
    title: "Digital Marketing Masterclass",
    instructor: "Alex Rodriguez",
    rating: 4.7,
    reviews: 654,
    durationHours: 38,
    lectures: 280,
    level: "All Levels",
    price: 79.99,
    discountPrice: 59.99,
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Marketing",
    isFeatured: true,
    isFree: false,
    students: 4200,
    shortDescription:
      "Build end-to-end digital campaigns across SEO, social media, paid ads, and analytics.",
  },
  {
    id: 4,
    title: "Mobile App Development with React Native",
    instructor: "Maria Gonzalez",
    rating: 4.6,
    reviews: 523,
    durationHours: 35,
    lectures: 240,
    level: "Intermediate",
    price: 74.99,
    discountPrice: 54.99,
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Mobile Development",
    isFeatured: false,
    isFree: false,
    students: 3200,
    shortDescription:
      "Create cross-platform mobile apps with React Native, navigation, APIs, and app publishing.",
  },
  {
    id: 5,
    title: "Python for Beginners",
    instructor: "David Wilson",
    rating: 4.5,
    reviews: 987,
    durationHours: 28,
    lectures: 180,
    level: "Beginner",
    price: 0,
    discountPrice: 0,
    image:
      "frontend/react-app/public/images/pythonimage.avif",
    category: "Programming",
    isFeatured: false,
    isFree: true,
    students: 12500,
    shortDescription:

      "Start coding with Python syntax, control flow, functions, files, and practical beginner projects.",
  },
  {
    id: 6,
    title: "UI/UX Design Fundamentals",
    instructor: "Emma Thompson",
    rating: 4.8,
    reviews: 432,
    durationHours: 32,
    lectures: 210,
    level: "Beginner",
    price: 69.99,
    discountPrice: 49.99,
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Design",
    isFeatured: false,
    isFree: false,
    students: 3800,
    shortDescription:
      "Design user-centered digital products with clear research, wireframing, prototyping, and testing.",
  },
  {
    id: 7,
    title: "Business Analytics & Excel",
    instructor: "Robert Kim",
    rating: 4.4,
    reviews: 321,
    durationHours: 24,
    lectures: 150,
    level: "Beginner",
    price: 59.99,
    discountPrice: 39.99,
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Business",
    isFeatured: false,
    isFree: false,
    students: 2700,
    shortDescription:
      "Analyze business data and build professional dashboards using Excel formulas, pivots, and charts.",
  },
  {
    id: 8,
    title: "Advanced JavaScript Patterns",
    instructor: "Kevin Patel",
    rating: 4.9,
    reviews: 289,
    durationHours: 45,
    lectures: 310,
    level: "Advanced",
    price: 89.99,
    discountPrice: 69.99,
    image:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Web Development",
    isFeatured: false,
    isFree: false,
    students: 1900,
    shortDescription:
      "Deep dive into architecture patterns, async flows, state modeling, and performance optimization.",
  },
  {
    id: 9,
    title: "Cybersecurity Fundamentals",
    instructor: "Lisa Anderson",
    rating: 4.7,
    reviews: 198,
    durationHours: 40,
    lectures: 280,
    level: "Intermediate",
    price: 94.99,
    discountPrice: 74.99,
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Security",
    isFeatured: false,
    isFree: false,
    students: 2100,
    shortDescription:
      "Understand threats, defensive security strategy, secure coding basics, and incident response workflows.",
  },
  {
    id: 10,
    title: "Graphic Design with Adobe Suite",
    instructor: "Tom Harris",
    rating: 4.6,
    reviews: 456,
    durationHours: 50,
    lectures: 350,
    level: "All Levels",
    price: 84.99,
    discountPrice: 64.99,
    image:
      "https://images.unsplash.com/photo-1561070791-4c9b95a9e2a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Design",
    isFeatured: false,
    isFree: false,
    students: 3100,
    shortDescription:
      "Create polished visual assets with Photoshop, Illustrator, and practical branding workflows.",
  },
  {
    id: 11,
    title: "Cloud Computing with AWS",
    instructor: "Sophia Martinez",
    rating: 4.8,
    reviews: 367,
    durationHours: 48,
    lectures: 320,
    level: "Intermediate",
    price: 99.99,
    discountPrice: 79.99,
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Cloud",
    isFeatured: false,
    isFree: false,
    students: 2900,
    shortDescription:
      "Deploy scalable cloud infrastructure on AWS with IAM, EC2, S3, and architecture best practices.",
  },
  {
    id: 12,
    title: "Project Management Professional (PMP)",
    instructor: "James Wilson",
    rating: 4.5,
    reviews: 512,
    durationHours: 36,
    lectures: 240,
    level: "All Levels",
    price: 89.99,
    discountPrice: 69.99,
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Business",
    isFeatured: false,
    isFree: false,
    students: 3400,
    shortDescription:
      "Prepare for PMP with project lifecycle, risk, stakeholders, and delivery planning strategies.",
  },
];

function buildCourseDetails(course) {
  return {
    ...course,
    slug: slugifyCategory(course.category),
    fullDescription:
      `${course.title} takes you from fundamentals to hands-on delivery. ` +
      "You will build practical skills through guided lessons, mini projects, and assessments.",
    whatYouLearn: [
      `Understand core ${course.category.toLowerCase()} concepts and workflows`,
      "Practice using industry tools and real-world scenarios",
      "Build portfolio-ready projects step by step",
      "Apply best practices for performance, quality, and collaboration",
      "Develop confidence through guided exercises and quizzes",
      "Prepare for interviews and practical implementation",
    ],
    requirements: [
      "Basic computer and internet usage",
      "A laptop or desktop with internet access",
      "Willingness to practice consistently",
    ],
    instructorBio:
      `${course.instructor} has trained thousands of students and focuses on practical teaching ` +
      "with clear explanations, real projects, and career guidance.",
    reviewsList: [
      {
        id: `${course.id}-r1`,
        author: "Amanuel K.",
        rating: 5,
        comment: "Very practical and easy to follow. I was able to apply lessons quickly.",
        date: "March 2, 2026",
      },
      {
        id: `${course.id}-r2`,
        author: "Helen M.",
        rating: 4,
        comment: "Structured content and useful projects. Great value for the price.",
        date: "February 17, 2026",
      },
    ],
  };
}

export const COURSES = baseCourses.map(buildCourseDetails);

export const FEATURED_COURSES = COURSES.filter((course) => course.isFeatured);

export const COURSES_BY_ID = Object.fromEntries(
  COURSES.map((course) => [course.id, course])
);

export const COURSE_CATEGORIES = Array.from(
  new Set(COURSES.map((course) => course.category))
).sort((a, b) => a.localeCompare(b));

export const COURSE_LEVELS = ["All Levels", "Beginner", "Intermediate", "Advanced"];

const defaultCurriculum = [
  {
    id: "module-1",
    title: "Getting Started",
    duration: "2h 10m",
    lessons: [
      "Course Introduction",
      "Learning Path and Goals",
      "Tooling and Environment Setup",
      "First Practical Exercise",
    ],
  },
  {
    id: "module-2",
    title: "Core Concepts",
    duration: "4h 30m",
    lessons: [
      "Key Concepts Deep Dive",
      "Hands-on Walkthrough",
      "Common Mistakes and Fixes",
      "Mini Quiz",
    ],
  },
  {
    id: "module-3",
    title: "Projects and Deployment",
    duration: "5h 20m",
    lessons: [
      "Project Planning",
      "Implementation",
      "Testing and Debugging",
      "Final Review",
    ],
  },
];

export function getCurriculumByCourseId(courseId) {
  const course = COURSES_BY_ID[Number(courseId)];
  if (!course) return defaultCurriculum;

  if (Number(courseId) === 1) {
    return [
      {
        id: "wd-1",
        title: "Introduction to Web Development",
        duration: "2h",
        lessons: [
          "Course Overview",
          "How the Web Works",
          "Setting Up Environment",
          "Introduction to HTML",
        ],
      },
      {
        id: "wd-2",
        title: "HTML5 Fundamentals",
        duration: "4h",
        lessons: [
          "HTML Document Structure",
          "Text Formatting and Semantics",
          "HTML Forms",
          "HTML5 New Features",
        ],
      },
      {
        id: "wd-3",
        title: "CSS3 Styling",
        duration: "6h",
        lessons: ["CSS Basics", "Flexbox", "Grid", "Responsive Design"],
      },
    ];
  }

  return defaultCurriculum.map((module, index) => ({
    ...module,
    id: `${course.id}-m-${index + 1}`,
    title: `${module.title} - ${course.category}`,
  }));
}

const primaryLearningCourse = {
  courseId: 1,
  title: "Web Development Bootcamp",
  lectures: [
    {
      id: 1,
      title: "Introduction to Web Development",
      youtubeId: "qz0aGYrrlhU",
      notes: `
        <h5>What is Web Development?</h5>
        <p>Web development refers to building, creating, and maintaining websites.</p>
        <ul>
          <li><strong>Frontend:</strong> What users see (HTML, CSS, JavaScript)</li>
          <li><strong>Backend:</strong> Server-side logic (Node.js, Python, PHP)</li>
          <li><strong>Database:</strong> Data storage (MySQL, MongoDB)</li>
        </ul>
        <h5 class="mt-4">What You Will Learn</h5>
        <ul>
          <li>HTML5 structure</li>
          <li>CSS3 styling</li>
          <li>JavaScript interactivity</li>
          <li>Responsive layouts</li>
        </ul>
      `,
      resources: [
        { name: "HTML Cheat Sheet", type: "pdf", size: "1.2MB" },
        { name: "Course Slides", type: "ppt", size: "3.5MB" },
      ],
    },
    {
      id: 2,
      title: "HTML Basics - Building Your First Webpage",
      youtubeId: "UB1O30fR-EE",
      notes: `
        <h5>HTML Structure</h5>
        <p>HTML is the backbone of every web page.</p>
        <pre><code>&lt;h1&gt;Hello World&lt;/h1&gt;</code></pre>
        <h5 class="mt-4">Common Tags</h5>
        <ul>
          <li><code>&lt;h1&gt; - &lt;h6&gt;</code> headings</li>
          <li><code>&lt;p&gt;</code> paragraphs</li>
          <li><code>&lt;a&gt;</code> links</li>
          <li><code>&lt;img&gt;</code> images</li>
        </ul>
      `,
      resources: [{ name: "HTML Practice Exercises", type: "zip", size: "2.1MB" }],
    },
    {
      id: 3,
      title: "CSS Fundamentals - Styling Your Website",
      youtubeId: "yfoY53QXEnI",
      notes: `
        <h5>What is CSS?</h5>
        <p>CSS controls the visual style of HTML elements.</p>
        <pre><code>h1 { color: blue; font-size: 32px; }</code></pre>
        <h5 class="mt-4">CSS Box Model</h5>
        <ul>
          <li>Content</li>
          <li>Padding</li>
          <li>Border</li>
          <li>Margin</li>
        </ul>
      `,
      resources: [{ name: "CSS Properties Guide", type: "pdf", size: "2.8MB" }],
    },
  ],
  resources: [
    { name: "Complete Course Code", type: "zip", size: "15MB" },
    { name: "Project Files", type: "zip", size: "8.2MB" },
    { name: "Reference Guide", type: "pdf", size: "3.4MB" },
  ],
};

const secondaryLearningCourse = {
  courseId: 2,
  title: "JavaScript for Beginners",
  lectures: [
    {
      id: 1,
      title: "JavaScript Introduction",
      youtubeId: "W6NZfCO5SIk",
      notes: `
        <h5>JavaScript Basics</h5>
        <p>JavaScript makes web pages dynamic and interactive.</p>
        <p>You will start with variables, functions, conditions, and loops.</p>
      `,
      resources: [],
    },
    {
      id: 2,
      title: "Variables and Data Types",
      youtubeId: "Bv_5Zv5c-Ts",
      notes: `
        <h5>Variables</h5>
        <p>Use <code>let</code> and <code>const</code> to store data values.</p>
      `,
      resources: [{ name: "JavaScript Quick Reference", type: "pdf", size: "1.1MB" }],
    },
  ],
  resources: [{ name: "JS Starter Files", type: "zip", size: "4.2MB" }],
};

export const LEARNING_COURSES = [primaryLearningCourse, secondaryLearningCourse];

export function getLearningCourse(courseId) {
  const id = Number(courseId);
  const course = LEARNING_COURSES.find((item) => item.courseId === id);

  if (course) return course;

  const fallbackCourse = COURSES_BY_ID[id] || COURSES_BY_ID[1];

  return {
    courseId: fallbackCourse.id,
    title: fallbackCourse.title,
    lectures: [
      {
        id: 1,
        title: `${fallbackCourse.category} Fundamentals`,
        youtubeId: "dQw4w9WgXcQ",
        notes: `<h5>${fallbackCourse.title}</h5><p>This lecture set is being prepared. Start with this orientation lesson.</p>`,
        resources: [],
      },
    ],
    resources: [{ name: "Starter Materials", type: "zip", size: "2.0MB" }],
  };
}
