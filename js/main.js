(function () {
  "use strict";

  /* -----------------------------
     Mobile navigation
  ------------------------------ */

  var menuButton = document.querySelector(".menu-btn");
  var navigation = document.querySelector("#nav");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", function () {
      var isOpen = navigation.classList.toggle("open");

      menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    navigation.addEventListener("click", function (event) {
      var link = event.target.closest("a");

      if (!link) {
        return;
      }

      navigation.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  }

  /* -----------------------------
     Formspree contact form
  ------------------------------ */

  var form = document.querySelector("#leadForm");

  if (!form) {
    return;
  }

  function setError(id, message) {
    var errorElement = document.querySelector("#" + id + "-e");

    if (errorElement) {
      errorElement.textContent = message;
    }

    return message === "";
  }

  form.addEventListener("submit", function (event) {
    var nameInput = document.querySelector("#n");
    var emailInput = document.querySelector("#e");
    var messageInput = document.querySelector("#m");
    var honeypotInput = document.querySelector("#w");

    var valid = true;

    valid =
      setError(
        "n",
        nameInput && nameInput.value.trim() ? "" : "Please enter your name.",
      ) && valid;

    valid =
      setError(
        "e",
        emailInput && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())
          ? ""
          : "Please enter a valid email address.",
      ) && valid;

    valid =
      setError(
        "m",
        messageInput && messageInput.value.trim()
          ? ""
          : "Please tell us what you want to monitor.",
      ) && valid;

    /*
      Invalid form:
      Stop submission and focus the first invalid field.
    */
    if (!valid) {
      event.preventDefault();

      var firstError = form.querySelector(".err:not(:empty)");

      if (firstError && firstError.previousElementSibling) {
        firstError.previousElementSibling.focus();
      }

      return;
    }

    /*
      Honeypot:
      Stop submissions where the hidden field was filled.
    */
    if (honeypotInput && honeypotInput.value.trim()) {
      event.preventDefault();
    }

    /*
      Important:
      Do not call event.preventDefault() for valid submissions.
      The browser must submit the form normally to Formspree.
    */
  });
})();
