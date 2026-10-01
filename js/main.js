document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     Mobile navigation
  ========================================================= */

  const menuButton = document.querySelector(".menu-btn");
  const navigation = document.querySelector("#nav");
  const navLinks = navigation ? navigation.querySelectorAll("a") : [];

  const openMenu = () => {
    if (!menuButton || !navigation) return;

    navigation.classList.add("open");
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.textContent = "Close";
  };

  const closeMenu = () => {
    if (!menuButton || !navigation) return;

    navigation.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.textContent = "Menu";
  };

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.contains("open");

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

    document.addEventListener("click", (event) => {
      const clickedInsideNavigation = navigation.contains(event.target);
      const clickedMenuButton = menuButton.contains(event.target);

      if (
        navigation.classList.contains("open") &&
        !clickedInsideNavigation &&
        !clickedMenuButton
      ) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
        menuButton.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) {
        closeMenu();
      }
    });
  }

  /* =========================================================
     Contact form validation
  ========================================================= */

  const form = document.querySelector("#leadForm");
  const nameInput = document.querySelector("#n");
  const emailInput = document.querySelector("#e");
  const messageInput = document.querySelector("#m");

  const nameError = document.querySelector("#n-e");
  const emailError = document.querySelector("#e-e");
  const messageError = document.querySelector("#m-e");
  const successMessage = document.querySelector("#ok");

  const setError = (element, message) => {
    if (element) {
      element.textContent = message;
    }
  };

  const clearErrors = () => {
    setError(nameError, "");
    setError(emailError, "");
    setError(messageError, "");
  };

  const validateForm = () => {
    let isValid = true;

    clearErrors();

    if (nameInput && nameInput.value.trim().length < 2) {
      setError(nameError, "Please enter your name.");
      isValid = false;
    }

    if (emailInput) {
      const email = emailInput.value.trim();
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!validEmail) {
        setError(emailError, "Please enter a valid email address.");
        isValid = false;
      }
    }

    if (messageInput && messageInput.value.trim().length < 10) {
      setError(
        messageError,
        "Please describe your monitoring requirements in at least 10 characters.",
      );
      isValid = false;
    }

    return isValid;
  };

  if (form) {
    form.addEventListener("submit", (event) => {
      if (!validateForm()) {
        event.preventDefault();

        const firstInvalidInput = [nameInput, emailInput, messageInput].find(
          (input) => {
            if (!input) return false;

            if (input === nameInput) {
              return input.value.trim().length < 2;
            }

            if (input === emailInput) {
              return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
            }

            return input.value.trim().length < 10;
          },
        );

        if (firstInvalidInput) {
          firstInvalidInput.focus();
        }

        return;
      }

      if (successMessage) {
        successMessage.hidden = false;
      }
    });

    [nameInput, emailInput, messageInput].forEach((input) => {
      if (!input) return;

      input.addEventListener("input", () => {
        if (successMessage) {
          successMessage.hidden = true;
        }
      });
    });
  }

  /* =========================================================
     Website assistant
  ========================================================= */

  const assistantLauncher = document.querySelector("#assistantLauncher");
  const assistantPanel = document.querySelector("#assistantPanel");
  const assistantClose = document.querySelector("#assistantClose");

  if (assistantLauncher && assistantPanel) {
    const assistantInput = assistantPanel.querySelector("#assistantInput");

    const openAssistant = () => {
      assistantPanel.hidden = false;
      assistantLauncher.setAttribute("aria-expanded", "true");

      if (assistantInput) {
        assistantInput.focus();
      }
    };

    const closeAssistant = () => {
      assistantPanel.hidden = true;
      assistantLauncher.setAttribute("aria-expanded", "false");
      assistantLauncher.focus();
    };

    assistantLauncher.addEventListener("click", () => {
      if (assistantPanel.hidden) {
        openAssistant();
      } else {
        closeAssistant();
      }
    });

    if (assistantClose) {
      assistantClose.addEventListener("click", closeAssistant);
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !assistantPanel.hidden) {
        closeAssistant();
      }
    });
  }
});
