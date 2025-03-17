import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Section {
  id: string;
  title: string;
  content: string[];
}

const WhyThisAppIsCool = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections: Section[] = [
    {
      id: 'backend',
      title: '🌱 Backend',
      content: [
        'Spring Boot structures a RESTful API with MVC and dependency injection',
        'PostgreSQL with JPA/Hibernate optimizes ORM and database scalability',
        'JWT and Spring Security enforce stateless auth with role-based access control',
      ]
    },
    {
      id: 'frontend',
      title: '💻 Frontend',
      content: [
        'React with TypeScript enforces static typing and component reusability',
        'Framer Motion implements performant, GPU-accelerated animations',
        'Tailwind CSS provides utility-first styling with responsive design principles',
        'Habit calendar leverages state management and real-time updates'
      ]
    },
    {
      id: 'deployment',
      title: '🐳 Deployment - Docker & CI/CD',
      content: [
        'Docker containerizes app for reproducible builds and easy deployment',
        'Neon provisions a serverless PostgreSQL instance',
        'Render and Netlify integrate CI/CD pipelines with Github',
        'Three different moving parts, three different platforms orchestrated'
      ]
    },
    {
      id: 'why',
      title: '🎯 Why I Built This',
      content: [
        'Wanted to learn the basics of Spring Boot, went full-stack & deployed for extra practical experience',
        'Idea -> Plan -> Execution in 4 days - I like planing, I like speed, I like finishing things',
        'Do I know all the details of the frameworks and technologies I used? No. I know how to learn fast and I know how to get things done',
        'I like to code;)'
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    hover: { scale: 1.02, transition: { duration: 0.2 } }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }
  };

  return (
    <motion.div
      className="p-6 rounded-lg mt-8"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Why This App Is Cool!</h2>
      
      <div className="space-y-4">
        {sections.map((section) => (
          <motion.div
            key={section.id}
            className="rounded-lg overflow-hidden"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
            variants={cardVariants}
            whileHover="hover"
          >
            <button
              className="w-full p-4 text-left font-medium flex justify-between items-center hover:bg-opacity-80"
              onClick={() => toggleSection(section.id)}
            >
              <span>{section.title}</span>
              <motion.span
                animate={{ rotate: expandedSection === section.id ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ▼
              </motion.span>
            </button>
            
            {expandedSection === section.id && (
              <motion.div
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="px-4 pb-4"
              >
                <div className="max-h-96 overflow-y-auto">
                  <ul className="list-disc pl-5 space-y-2">
                    {section.content.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 text-center text-sm opacity-70" style={{ borderTop: '1px solid var(--bg-tertiary)' }}>
        Built by Theo | Full-Stack Developer |{' '}
        <a href="https://github.com/haris444" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">
          GitHub
        </a>{' '}
        |{' '}
        <a href="https://www.linkedin.com/in/theocharis-vasilakis/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">
          LinkedIn
        </a>
      </div>
    </motion.div>
  );
};

export default WhyThisAppIsCool;