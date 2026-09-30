(function () {
  "use strict";

  window.AEPX_ASSISTANT_DATA = {
    welcomeMessage:
      "Hi! I am the AEPX TECH assistant. I can answer common questions about our product, monitoring system, use cases, and contact process.",

    fallbackMessage:
      "I do not have a specific answer for that yet. Please use the contact section and describe what you want to monitor. The AEPX TECH team can answer your question directly.",

    quickQuestions: [
      "What is AEPX TECH?",
      "How does the system work?",
      "What can it monitor?",
      "Who is it for?",
      "How can I contact the team?",
    ],

    faqs: [
      {
        question: "What is AEPX TECH?",
        keywords: [
          "what is aepx",
          "what is aepx tech",
          "about aepx",
          "about aepx tech",
          "company",
        ],
        answer:
          "AEPX TECH builds practical smart water monitoring solutions that help teams understand important readings, view information clearly, and respond to changes earlier.",
      },
      {
        question: "How does the system work?",
        keywords: [
          "how does it work",
          "how does the system work",
          "how it works",
          "working",
          "sensor",
        ],
        answer:
          "Monitoring devices collect readings from selected locations. The information can then be organized in a dashboard so users can review current conditions, history, and important alerts.",
      },
      {
        question: "What can it monitor?",
        keywords: [
          "what can it monitor",
          "what does it monitor",
          "monitor",
          "readings",
          "water level",
          "flow",
          "quality",
        ],
        answer:
          "The exact readings depend on the installation and requirements. AEPX TECH can be configured around the water-related conditions that matter to a specific setup.",
      },
      {
        question: "Who is it for?",
        keywords: [
          "who is it for",
          "who can use",
          "housing",
          "institution",
          "industry",
          "agriculture",
          "farm",
        ],
        answer:
          "The solution can support housing societies, institutions, industrial sites, agricultural operations, and other environments that depend on reliable water monitoring.",
      },
      {
        question: "What are early alerts?",
        keywords: [
          "early alerts",
          "alerts",
          "notifications",
          "warning",
          "issue",
        ],
        answer:
          "Early alerts notify users when selected readings move outside the conditions they want to monitor. This helps them investigate and respond sooner.",
      },
      {
        question: "How can I contact AEPX TECH?",
        keywords: ["contact", "email", "talk", "reach", "message", "team"],
        answer:
          "You can use the contact form on this page or email the AEPX TECH team directly at hello@aepxtech.com.",
      },
    ],
  };
})();
