(function () {
  "use strict";

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

  var form = document.querySelector("#leadForm");

  if (!form) {
    return;
  }

  function setError(id, message) {
    var error = document.querySelector("#" + id + "-e");

    if (error) {
      error.textContent = message;
    }

    return message === "";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var nameInput = document.querySelector("#n");
    var emailInput = document.querySelector("#e");
    var messageInput = document.querySelector("#m");
    var honeypot = document.querySelector("#w");
    var successMessage = document.querySelector("#ok");

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

    if (!valid) {
      var firstError = form.querySelector(".err:not(:empty)");

      if (firstError && firstError.previousElementSibling) {
        firstError.previousElementSibling.focus();
      }

      return;
    }

    if (honeypot && honeypot.value) {
      return;
    }

    if (successMessage) {
      successMessage.hidden = false;
    }

    form.reset();
  });
})();
