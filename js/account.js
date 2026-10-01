/**
 * =========================================
 * AEPX TECH
 * ACCOUNT PAGE
 * =========================================
 */

/**
 * Wait for js/supabase.js to create
 * window.aepxSupabase.
 */

async function getSupabaseClient() {
  for (let i = 0; i < 100; i++) {
    if (window.aepxSupabase) {
      return window.aepxSupabase;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 25);
    });
  }

  return null;
}

const client = await getSupabaseClient();

/**
 * =========================================
 * ELEMENTS
 * =========================================
 */

const loading = document.getElementById("loading");

const authView = document.getElementById("authView");

const accountDashboard = document.getElementById("accountDashboard");

const form = document.getElementById("accountForm");

const email = document.getElementById("email");

const password = document.getElementById("password");

const confirmPassword = document.getElementById("confirmPassword");

const confirmWrap = document.getElementById("confirmWrap");

const submitButton = document.getElementById("submitButton");

const googleButton = document.getElementById("googleButton");

const message = document.getElementById("message");

const intro = document.getElementById("intro");

const logoutButton = document.getElementById("logoutButton");

const loginTab = document.getElementById("loginTab");

const signupTab = document.getElementById("signupTab");

/**
 * Phone elements
 */

const accountPhone = document.getElementById("accountPhone");

const editPhoneButton = document.getElementById("editPhoneButton");

const phoneEditor = document.getElementById("phoneEditor");

const phoneCountryCode = document.getElementById("phoneCountryCode");

const phoneNumber = document.getElementById("phoneNumber");

const savePhoneButton = document.getElementById("savePhoneButton");

const cancelPhoneButton = document.getElementById("cancelPhoneButton");

const phoneMessage = document.getElementById("phoneMessage");

/**
 * =========================================
 * STATE
 * =========================================
 */

let mode = "login";

let currentUser = null;

let currentPhone = null;

/**
 * =========================================
 * MESSAGE
 * =========================================
 */

function setMessage(text, type = "") {
  if (!message) {
    return;
  }

  message.textContent = text;

  message.classList.remove("success", "error");

  if (type) {
    message.classList.add(type);
  }
}

/**
 * =========================================
 * LOGIN / SIGNUP MODE
 * =========================================
 */

function setMode(nextMode) {
  mode = nextMode;

  const signup = mode === "signup";

  confirmWrap.hidden = !signup;

  confirmPassword.required = signup;

  submitButton.textContent = signup ? "Create account" : "Log in";

  password.autocomplete = signup ? "new-password" : "current-password";

  loginTab.classList.toggle("active", !signup);

  signupTab.classList.toggle("active", signup);

  intro.textContent = signup
    ? "Create an AEPX TECH account using your email."
    : "Sign in to access your AEPX TECH account.";

  setMessage("");
}

loginTab.addEventListener("click", () => {
  setMode("login");
});

signupTab.addEventListener("click", () => {
  setMode("signup");
});

/**
 * =========================================
 * GOOGLE LOGIN
 * =========================================
 */

googleButton.addEventListener("click", async () => {
  if (!client) {
    setMessage("Supabase did not load.", "error");

    return;
  }

  googleButton.disabled = true;

  setMessage("Connecting to Google...");

  try {
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",

      options: {
        redirectTo: "https://aepxtech.vercel.app/",
      },
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Google login error:", error);

    setMessage(error.message || "Google login could not be started.", "error");

    googleButton.disabled = false;
  }
});

/**
 * =========================================
 * EMAIL LOGIN / SIGNUP
 * =========================================
 */

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!client) {
    setMessage("Supabase did not load.", "error");

    return;
  }

  const userEmail = email.value.trim();

  const userPassword = password.value;

  /**
   * Make sure passwords match
   * when creating an account.
   */

  if (mode === "signup" && userPassword !== confirmPassword.value) {
    setMessage("Passwords do not match.", "error");

    return;
  }

  submitButton.disabled = true;

  setMessage("Please wait...");

  try {
    /**
     * =========================
     * SIGN UP
     * =========================
     */

    if (mode === "signup") {
      const { data, error } = await client.auth.signUp({
        email: userEmail,

        password: userPassword,

        options: {
          emailRedirectTo: "https://aepxtech.vercel.app/",
        },
      });

      if (error) {
        throw error;
      }

      /**
       * If email confirmation is
       * disabled, Supabase may return
       * a session immediately.
       */

      if (data.session) {
        if (data.user) {
          await syncUserProfile(data.user);
        }

        window.location.href = "https://aepxtech.vercel.app/";

        return;
      }

      /**
       * Otherwise the user must
       * confirm their email.
       */

      setMessage(
        "Account created. Check your email to confirm your account.",
        "success",
      );
    } else {
      /**
       * =========================
       * LOGIN
       * =========================
       */

      const { data, error } = await client.auth.signInWithPassword({
        email: userEmail,
        password: userPassword,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await syncUserProfile(data.user);
      }

      window.location.href = "https://aepxtech.vercel.app/";

      return;
    }
  } catch (error) {
    console.error("Authentication error:", error);

    setMessage(error.message || "Something went wrong.", "error");
  } finally {
    submitButton.disabled = false;
  }
});

/**
 * =========================================
 * SYNC USER PROFILE
 * =========================================
 */

async function syncUserProfile(user) {
  if (!client || !user) {
    return false;
  }

  const metadata = user.user_metadata || {};

  const fullName =
    metadata.full_name ||
    metadata.name ||
    user.email?.split("@")[0] ||
    "AEPX User";

  /**
   * Upsert makes sure the user's
   * profile exists.
   *
   * Existing phone numbers are NOT
   * included here, so this does not
   * overwrite profiles.phone.
   */

  const { error } = await client.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
      email: user.email || null,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
    console.error("Profile sync error:", error);

    return false;
  }

  console.log("Profile synced successfully.");

  return true;
}

/**
 * =========================================
 * PHONE NUMBER
 * =========================================
 */

function setPhoneMessage(text, type = "") {
  if (!phoneMessage) {
    return;
  }

  phoneMessage.textContent = text;

  phoneMessage.classList.remove("success", "error");

  if (type) {
    phoneMessage.classList.add(type);
  }
}

/**
 * Only digits are stored after the
 * selected country calling code.
 */

function cleanPhoneNumber(value) {
  return value.replace(/\D/g, "");
}

/**
 * Split an existing phone number
 * back into country code + number
 * for editing.
 */

function splitPhoneNumber(phone) {
  const supportedCodes = ["+971", "+91", "+44", "+61", "+65", "+1"];

  for (const code of supportedCodes) {
    if (phone.startsWith(code)) {
      return {
        countryCode: code,
        number: phone.slice(code.length),
      };
    }
  }

  return {
    countryCode: "+91",
    number: phone.replace(/^\+/, ""),
  };
}

/**
 * Display phone editor.
 */

function showPhoneEditor() {
  if (!phoneEditor) {
    return;
  }

  setPhoneMessage("");

  if (currentPhone) {
    const parts = splitPhoneNumber(currentPhone);

    phoneCountryCode.value = parts.countryCode;

    phoneNumber.value = parts.number;
  } else {
    phoneCountryCode.value = "+91";

    phoneNumber.value = "";
  }

  phoneEditor.hidden = false;

  phoneNumber.focus();
}

/**
 * Hide phone editor.
 */

function hidePhoneEditor() {
  if (!phoneEditor) {
    return;
  }

  phoneEditor.hidden = true;

  setPhoneMessage("");
}

/**
 * Load the user's phone number
 * from public.profiles.
 */

async function loadPhoneNumber(user) {
  if (!client || !user) {
    return;
  }

  const { data, error } = await client
    .from("profiles")
    .select("phone")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Phone load error:", error);

    if (accountPhone) {
      accountPhone.textContent = "Not available";
    }

    return;
  }

  currentPhone = data?.phone || null;

  if (accountPhone) {
    accountPhone.textContent = currentPhone || "Not added";
  }

  if (editPhoneButton) {
    editPhoneButton.textContent = currentPhone ? "Edit" : "Add phone number";
  }
}

/**
 * Save phone number.
 */

async function savePhoneNumber() {
  if (!client || !currentUser) {
    setPhoneMessage(
      "Your account could not be loaded. Please refresh the page.",
      "error",
    );

    return;
  }

  const nationalNumber = cleanPhoneNumber(phoneNumber.value);

  /**
   * Basic validation.
   */

  if (nationalNumber.length < 7 || nationalNumber.length > 15) {
    setPhoneMessage("Enter a valid phone number.", "error");

    phoneNumber.focus();

    return;
  }

  const fullPhoneNumber = `${phoneCountryCode.value}${nationalNumber}`;

  savePhoneButton.disabled = true;

  savePhoneButton.textContent = "Saving...";

  setPhoneMessage("");

  const { error } = await client
    .from("profiles")
    .update({
      phone: fullPhoneNumber,

      updated_at: new Date().toISOString(),
    })
    .eq("id", currentUser.id);

  if (error) {
    console.error("Phone save error:", error);

    setPhoneMessage(
      error.message || "Phone number could not be saved.",
      "error",
    );

    savePhoneButton.disabled = false;

    savePhoneButton.textContent = "Save phone number";

    return;
  }

  currentPhone = fullPhoneNumber;

  accountPhone.textContent = currentPhone;

  editPhoneButton.textContent = "Edit";

  setPhoneMessage("Phone number saved.", "success");

  savePhoneButton.disabled = false;

  savePhoneButton.textContent = "Save phone number";

  /**
   * Keep the success message visible
   * briefly before closing.
   */

  setTimeout(() => {
    hidePhoneEditor();
  }, 700);
}

/**
 * =========================================
 * PHONE EVENTS
 * =========================================
 */

if (editPhoneButton) {
  editPhoneButton.addEventListener("click", () => {
    showPhoneEditor();
  });
}

if (cancelPhoneButton) {
  cancelPhoneButton.addEventListener("click", () => {
    hidePhoneEditor();
  });
}

if (savePhoneButton) {
  savePhoneButton.addEventListener("click", async () => {
    await savePhoneNumber();
  });
}

if (phoneNumber) {
  /**
   * Remove letters/spaces from
   * phone number input.
   */

  phoneNumber.addEventListener("input", () => {
    phoneNumber.value = cleanPhoneNumber(phoneNumber.value);
  });

  /**
   * Enter = Save
   * Escape = Cancel
   */

  phoneNumber.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      await savePhoneNumber();
    }

    if (event.key === "Escape") {
      hidePhoneEditor();

      editPhoneButton?.focus();
    }
  });
}

/**
 * =========================================
 * DISPLAY ACCOUNT
 * =========================================
 */

function displayAccount(user) {
  currentUser = user;

  const metadata = user.user_metadata || {};

  const name =
    metadata.full_name ||
    metadata.name ||
    user.email?.split("@")[0] ||
    "AEPX User";

  const avatar = metadata.avatar_url || metadata.picture || null;

  const provider = user.app_metadata?.provider || "email";

  /**
   * =========================
   * PROFILE INFORMATION
   * =========================
   */

  document.getElementById("userName").textContent = name;

  document.getElementById("userEmail").textContent = user.email || "";

  document.getElementById("accountEmail").textContent = user.email || "";

  document.getElementById("accountProvider").textContent =
    provider === "google" ? "Google" : "Email & Password";

  /**
   * =========================
   * MEMBER SINCE
   * =========================
   */

  if (user.created_at) {
    const date = new Date(user.created_at);

    document.getElementById("memberSince").textContent =
      date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
  } else {
    document.getElementById("memberSince").textContent = "—";
  }

  /**
   * =========================
   * PROFILE PICTURE
   * =========================
   */

  const avatarContainer = document.getElementById("avatarContainer");

  avatarContainer.innerHTML = "";

  if (avatar) {
    const img = document.createElement("img");

    img.src = avatar;

    img.alt = `${name} profile picture`;

    img.className = "avatar";

    img.onerror = () => {
      avatarContainer.innerHTML = "";

      createFallbackAvatar(avatarContainer, name);
    };

    avatarContainer.appendChild(img);
  } else {
    createFallbackAvatar(avatarContainer, name);
  }

  /**
   * =========================
   * SHOW DASHBOARD
   * =========================
   */

  loading.style.display = "none";

  authView.hidden = true;

  accountDashboard.style.display = "block";
}

/**
 * =========================================
 * FALLBACK AVATAR
 * =========================================
 */

function createFallbackAvatar(container, name) {
  const fallback = document.createElement("div");

  fallback.className = "avatar-fallback";

  fallback.textContent = name.charAt(0).toUpperCase();

  container.appendChild(fallback);
}

/**
 * =========================================
 * DISPLAY LOGIN
 * =========================================
 */

function displayLogin() {
  currentUser = null;
  currentPhone = null;

  loading.style.display = "none";

  accountDashboard.style.display = "none";

  authView.hidden = false;
}

/**
 * =========================================
 * SESSION CHECK
 * =========================================
 */

async function updateSession() {
  if (!client) {
    loading.style.display = "none";

    authView.hidden = false;

    setMessage(
      "Supabase client could not be loaded. Check js/supabase.js.",
      "error",
    );

    return;
  }

  const { data, error } = await client.auth.getSession();

  if (error) {
    console.error("Session error:", error);

    displayLogin();

    setMessage(error.message, "error");

    return;
  }

  const session = data.session;

  if (session && session.user) {
    /**
     * Keep public.profiles
     * synchronized with Auth.
     */

    await syncUserProfile(session.user);

    displayAccount(session.user);

    /**
     * Load phone after the
     * profile exists.
     */

    await loadPhoneNumber(session.user);
  } else {
    displayLogin();
  }
}

/**
 * =========================================
 * LOGOUT
 * =========================================
 */

logoutButton.addEventListener("click", async () => {
  if (!client) {
    return;
  }

  logoutButton.disabled = true;

  logoutButton.textContent = "Logging out...";

  const { error } = await client.auth.signOut();

  if (error) {
    console.error("Logout error:", error);

    logoutButton.disabled = false;

    logoutButton.textContent = "Log out";

    return;
  }

  currentUser = null;
  currentPhone = null;

  window.location.href = "https://aepxtech.vercel.app/";
});

/**
 * =========================================
 * AUTH STATE LISTENER
 * =========================================
 */

if (client) {
  client.auth.onAuthStateChange((event, session) => {
    console.log("Auth event:", event);

    if (event === "SIGNED_IN" && session?.user) {
      /**
       * Run database operations outside
       * the immediate auth callback.
       */

      setTimeout(async () => {
        await syncUserProfile(session.user);

        displayAccount(session.user);

        await loadPhoneNumber(session.user);
      }, 0);
    }

    if (event === "SIGNED_OUT") {
      currentUser = null;
      currentPhone = null;

      displayLogin();
    }
  });
}

/**
 * =========================================
 * INITIAL SESSION CHECK
 * =========================================
 */

await updateSession();
