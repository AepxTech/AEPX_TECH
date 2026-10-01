(function () {
  "use strict";

  var data = window.AEPX_ASSISTANT_DATA;

  if (!data) {
    return;
  }

  var launcher = document.querySelector("#assistantLauncher");
  var panel = document.querySelector("#assistantPanel");
  var closeButton = document.querySelector("#assistantClose");
  var messages = document.querySelector("#assistantMessages");
  var quickActions = document.querySelector("#assistantQuickActions");
  var form = document.querySelector("#assistantForm");
  var input = document.querySelector("#assistantInput");

  if (
    !launcher ||
    !panel ||
    !closeButton ||
    !messages ||
    !quickActions ||
    !form ||
    !input
  ) {
    return;
  }

  var lastFocusedElement = null;
  var answerTimer = null;

  var focusableSelector = [
    "button:not([disabled])",
    "input:not([disabled])",
    "textarea:not([disabled])",
    "select:not([disabled])",
    "a[href]",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");

  function normalize(value) {
    return value
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function scrollToLatestMessage() {
    messages.scrollTop = messages.scrollHeight;
  }

  function createMessage(text, sender) {
    var message = document.createElement("article");
    var author = document.createElement("span");
    var content = document.createElement("p");
    var isUser = sender === "user";

    message.className = isUser
      ? "assistant-message assistant-message-user"
      : "assistant-message assistant-message-bot";

    message.setAttribute(
      "aria-label",
      isUser ? "Your message" : "AEPX assistant message",
    );

    author.className = "assistant-message-author";
    author.textContent = isUser ? "You" : "AEPX assistant";

    content.textContent = text;

    message.appendChild(author);
    message.appendChild(content);
    messages.appendChild(message);

    scrollToLatestMessage();
  }

  function showWelcomeMessage() {
    if (!messages.children.length) {
      createMessage(data.welcomeMessage, "bot");
    }
  }

  function findAnswer(question) {
    var normalizedQuestion = normalize(question);

    var exactMatch = data.faqs.find(function (faq) {
      return normalize(faq.question) === normalizedQuestion;
    });

    if (exactMatch) {
      return exactMatch.answer;
    }

    var directMatch = data.faqs.find(function (faq) {
      return faq.keywords.some(function (keyword) {
        return normalizedQuestion.includes(normalize(keyword));
      });
    });

    if (directMatch) {
      return directMatch.answer;
    }

    return data.fallbackMessage;
  }

  function submitQuestion(question) {
    var cleanQuestion = question.trim();

    if (!cleanQuestion) {
      input.focus();
      return;
    }

    createMessage(cleanQuestion, "user");
    input.value = "";

    if (answerTimer) {
      window.clearTimeout(answerTimer);
    }

    answerTimer = window.setTimeout(function () {
      createMessage(findAnswer(cleanQuestion), "bot");
      input.focus();
    }, 250);
  }

  function openAssistant() {
    lastFocusedElement = document.activeElement;

    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");

    showWelcomeMessage();

    window.requestAnimationFrame(function () {
      input.focus();
      scrollToLatestMessage();
    });
  }

  function closeAssistant() {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    } else {
      launcher.focus();
    }
  }

  function toggleAssistant() {
    if (panel.hidden) {
      openAssistant();
    } else {
      closeAssistant();
    }
  }
  function handleFocusTrap(event) {
    if (panel.hidden || event.key !== "Tab") {
      return;
    }

    var focusable = panel.querySelectorAll(focusableSelector);

    if (!focusable.length) {
      return;
    }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  data.quickQuestions.forEach(function (question) {
    var button = document.createElement("button");

    button.type = "button";
    button.className = "assistant-quick-button";
    button.textContent = question;

    button.addEventListener("click", function () {
      submitQuestion(question);
    });

    quickActions.appendChild(button);
  });

  launcher.addEventListener("click", toggleAssistant);
  closeButton.addEventListener("click", closeAssistant);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    submitQuestion(input.value);
  });

  panel.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeAssistant();
      return;
    }

    handleFocusTrap(event);
  });
})();
