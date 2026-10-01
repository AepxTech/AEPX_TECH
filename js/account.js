/**
 * =========================================
 * AEPX TECH
 * ACCOUNT PAGE
 * =========================================
 */

/*
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

let mode = "login";

/**
 * =========================================
 * MESSAGE
 * =========================================
 */

function setMessage(text, type = "") {
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

  /*
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

      /*
       * If email confirmation is
       * disabled, Supabase may return
       * a session immediately.
       */

      if (data.session) {
        /*
         * Sync profile before leaving
         * the account page.
         */

        if (data.user) {
          await syncUserProfile(data.user);
        }

        window.location.href = "https://aepxtech.vercel.app/";
        return;
      }

      /*
       * Otherwise the user must
       * confirm their email first.
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

      /*
       * Sync the authenticated user's
       * profile before redirecting.
       */

      if (data.user) {
        await syncUserProfile(data.user);
      }

      /*
       * Successful email login.
       */

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
 * SYNC USER PROFILE TO DATABASE
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

  /*
   * Save/update the public.profiles row.
   *
   * The user's auth UUID is used as the
   * profiles table ID.
   *
   * Email comes from Supabase Auth.
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
 * DISPLAY ACCOUNT
 * =========================================
 */

function displayAccount(user) {
  const metadata = user.user_metadata || {};

  /*
   * Google normally supplies:
   *
   * full_name
   * name
   * avatar_url
   * picture
   */

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

    /*
     * If Google's profile picture
     * cannot load, show the user's
     * first initial instead.
     */

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
    /*
     * Save the user's name/email into
     * public.profiles whenever the
     * account page loads.
     */

    await syncUserProfile(session.user);

    displayAccount(session.user);
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

  /*
   * Return to homepage after logout.
   */

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
      /*
       * Run profile syncing outside the
       * immediate auth callback.
       */

      setTimeout(async () => {
        await syncUserProfile(session.user);

        displayAccount(session.user);
      }, 0);
    }

    if (event === "SIGNED_OUT") {
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
