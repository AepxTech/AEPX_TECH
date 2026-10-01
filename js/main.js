document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     Mobile navigation
  ========================================================= */

  const menuButton = document.querySelector(".menu-btn");
  const navigation = document.querySelector("#nav");

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

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      const clickedNavigation = navigation.contains(event.target);
      const clickedMenuButton = menuButton.contains(event.target);

      if (
        navigation.classList.contains("open") &&
        !clickedNavigation &&
        !clickedMenuButton
      ) {
        closeMenu();
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

  const leadForm = document.querySelector("#leadForm");
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

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateLeadForm = () => {
    let valid = true;

    clearErrors();

    if (nameInput && nameInput.value.trim().length < 2) {
      setError(nameError, "Please enter your name.");
      valid = false;
    }

    if (emailInput && !isValidEmail(emailInput.value.trim())) {
      setError(emailError, "Please enter a valid email address.");
      valid = false;
    }

    if (messageInput && messageInput.value.trim().length < 10) {
      setError(
        messageError,
        "Please describe your requirements in at least 10 characters.",
      );
      valid = false;
    }

    return valid;
  };

  if (leadForm) {
    leadForm.addEventListener("submit", (event) => {
      if (!validateLeadForm()) {
        event.preventDefault();

        if (nameInput && nameInput.value.trim().length < 2) {
          nameInput.focus();
          return;
        }

        if (emailInput && !isValidEmail(emailInput.value.trim())) {
          emailInput.focus();
          return;
        }

        if (messageInput && messageInput.value.trim().length < 10) {
          messageInput.focus();
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
   Product demo video modal and sound control
========================================================= */

  const videoOpenButton = document.querySelector(".video-open-btn");
  const videoModal = document.querySelector("#productVideoModal");
  const productDemoVideo = document.querySelector("#productDemoVideo");
  const videoCloseButtons = document.querySelectorAll("[data-video-close]");
  const videoSoundToggle = document.querySelector("#videoSoundToggle");

  const updateSoundButton = () => {
    if (!productDemoVideo || !videoSoundToggle) return;

    const isMuted = productDemoVideo.muted;

    videoSoundToggle.setAttribute("aria-pressed", String(!isMuted));
    videoSoundToggle.setAttribute(
      "aria-label",
      isMuted ? "Unmute video" : "Mute video",
    );

    const soundIcon = videoSoundToggle.querySelector(".sound-icon");
    const soundLabel = videoSoundToggle.querySelector(".sound-label");

    if (soundIcon) {
      soundIcon.textContent = isMuted ? "🔇" : "🔊";
    }

    if (soundLabel) {
      soundLabel.textContent = isMuted ? "Unmute" : "Mute";
    }
  };

  const openVideoModal = () => {
    if (!videoModal || !productDemoVideo) return;

    videoModal.hidden = false;
    document.body.classList.add("video-modal-open");

    productDemoVideo.currentTime = 0;

    /*
    Starts muted only when the modal opens.
    The visitor can then click Unmute, and JavaScript will not force it
    back to muted while the modal stays open.
  */
    productDemoVideo.muted = true;
    productDemoVideo.volume = 1;
    updateSoundButton();

    const playPromise = productDemoVideo.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        /* Browser may require visitor to press play manually. */
      });
    }

    const closeButton = videoModal.querySelector(".video-modal-close");

    if (closeButton) {
      closeButton.focus();
    }
  };

  const closeVideoModal = () => {
    if (!videoModal || !productDemoVideo) return;

    productDemoVideo.pause();
    productDemoVideo.currentTime = 0;

    videoModal.hidden = true;
    document.body.classList.remove("video-modal-open");

    if (videoOpenButton) {
      videoOpenButton.focus();
    }
  };

  if (videoOpenButton && videoModal && productDemoVideo) {
    videoOpenButton.addEventListener("click", openVideoModal);

    videoCloseButtons.forEach((button) => {
      button.addEventListener("click", closeVideoModal);
    });

    if (videoSoundToggle) {
      videoSoundToggle.addEventListener("click", () => {
        productDemoVideo.muted = !productDemoVideo.muted;

        if (!productDemoVideo.muted && productDemoVideo.volume === 0) {
          productDemoVideo.volume = 1;
        }

        updateSoundButton();
      });
    }

    productDemoVideo.addEventListener("volumechange", updateSoundButton);

    updateSoundButton();
  }

  /* =========================================================
     Website assistant
  ========================================================= */

  const assistantLauncher = document.querySelector("#assistantLauncher");
  const assistantPanel = document.querySelector("#assistantPanel");
  const assistantClose = document.querySelector("#assistantClose");

  const openAssistant = () => {
    if (!assistantLauncher || !assistantPanel) return;

    assistantPanel.hidden = false;
    assistantLauncher.setAttribute("aria-expanded", "true");

    const assistantInput = assistantPanel.querySelector("#assistantInput");

    if (assistantInput) {
      assistantInput.focus();
    }
  };

  const closeAssistant = () => {
    if (!assistantLauncher || !assistantPanel) return;

    assistantPanel.hidden = true;
    assistantLauncher.setAttribute("aria-expanded", "false");
    assistantLauncher.focus();
  };

  if (assistantLauncher && assistantPanel) {
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
  }

  /* =========================================================
     Escape key for video, assistant, and menu
  ========================================================= */

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (videoModal && !videoModal.hidden) {
      closeVideoModal();
      return;
    }

    if (assistantPanel && !assistantPanel.hidden) {
      closeAssistant();
      return;
    }

    if (navigation && navigation.classList.contains("open")) {
      closeMenu();

      if (menuButton) {
        menuButton.focus();
      }
    }
  });
});

/* =========================================================
   BOOK PRODUCT - COMING SOON
========================================================= */

const productBookButton = document.getElementById("productBookButton");

const productComingSoon = document.getElementById("productComingSoon");

if (productBookButton && productComingSoon) {
  productBookButton.addEventListener("click", () => {
    // Show coming soon message
    productComingSoon.hidden = false;

    // Update button
    productBookButton.textContent = "Coming Soon";
    productBookButton.disabled = true;
  });
}
