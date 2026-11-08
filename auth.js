/* ===== auth.js =====
   Logic for the sign up, login, verify and dashboard pages.
   Load order on every page:
     1. Supabase library (CDN)   2. supabase.js   3. avatar.js   4. auth.js
   Each page sets <body data-page="signup | login | verify | dashboard">.
*/
(function () {
  "use strict";

  var PENDING_EMAIL = "ffv_pending_email";
  var PENDING_TYPE = "ffv_pending_type"; // "signup" or "email"
  var RESEND_SECONDS = 60;

  function $(id) { return document.getElementById(id); }
  function goTo(url) { window.location.href = url; }
  function pageUrl(name) { return new URL(name, window.location.href).href; }

  /* ---------- small helpers ---------- */

  function showMsg(el, text, type) {
    if (!el) return;
    el.textContent = text || "";
    el.className = "msg" + (text ? " show " + (type || "error") : "");
  }

  function setBusy(btn, busy, busyText) {
    if (!btn) return;
    if (!btn.dataset.label) btn.dataset.label = btn.textContent;
    btn.disabled = busy;
    btn.textContent = busy ? busyText : btn.dataset.label;
  }

  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function isUsername(v) { return /^[A-Za-z0-9_]{3,20}$/.test(v); }

  function passwordProblems(pw) {
    var p = [];
    if (pw.length < 8) p.push("at least 8 characters");
    if (!/[a-z]/.test(pw)) p.push("a lowercase letter");
    if (!/[A-Z]/.test(pw)) p.push("an uppercase letter");
    if (!/[0-9]/.test(pw)) p.push("a number");
    return p;
  }

  function strengthScore(pw) {
    var s = 4 - passwordProblems(pw).length;
    if (pw.length >= 12) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return Math.max(0, s); // 0 to 6
  }

  function bindStrength(input, bar, text) {
    var labels = ["Too weak", "Too weak", "Weak", "Fair", "Good", "Strong", "Very strong"];
    var defaultText = text.textContent;
    input.addEventListener("input", function () {
      var pw = input.value;
      if (!pw) {
        bar.style.width = "0";
        bar.dataset.level = "0";
        text.textContent = defaultText;
        return;
      }
      var score = strengthScore(pw);
      bar.style.width = Math.round((score / 6) * 100) + "%";
      bar.dataset.level = String(score);
      text.textContent = "Password strength: " + labels[score];
    });
  }

  // Turns Supabase errors into short, safe messages.
  function friendlyError(err) {
    var m = ((err && err.message) || "").toLowerCase();
    var c = ((err && err.code) || "").toLowerCase();
    if (m.indexOf("invalid login credentials") !== -1) return "Incorrect email or password.";
    if (m.indexOf("already registered") !== -1) return "An account with this email already exists. Try logging in.";
    if (c === "over_email_send_rate_limit" || m.indexOf("rate limit") !== -1 || m.indexOf("too many") !== -1 || (err && err.status === 429)) {
      return "Too many attempts. Please wait a minute and try again.";
    }
    if (m.indexOf("expired") !== -1 || m.indexOf("invalid") !== -1 && m.indexOf("token") !== -1) {
      return "That code is wrong or has expired. Request a new one.";
    }
    if (m.indexOf("password should") !== -1 || c === "weak_password") return "That password is too weak. Choose a stronger one.";
    if (m.indexOf("failed to fetch") !== -1 || m.indexOf("network") !== -1) return "Network problem. Check your connection and try again.";
    return "Something went wrong. Please try again.";
  }

  function maskEmail(email) {
    var parts = email.split("@");
    var name = parts[0] || "";
    return name.slice(0, 2) + "***@" + (parts[1] || "");
  }

  async function redirectIfSignedIn() {
    var res = await supabaseClient.auth.getSession();
    if (res.data && res.data.session) goTo("dashboard.html");
  }

  /* ---------- shared widgets ---------- */

  function initPasswordToggles() {
    document.querySelectorAll("[data-toggle-password]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var input = $(btn.dataset.togglePassword);
        var show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.textContent = show ? "Hide" : "Show";
        btn.setAttribute("aria-pressed", show ? "true" : "false");
      });
    });
  }

  function initSocialButtons() {
    document.querySelectorAll("[data-provider]").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        var msg = $("message");
        showMsg(msg, "");
        btn.disabled = true;
        var res = await supabaseClient.auth.signInWithOAuth({
          provider: btn.dataset.provider,
          options: { redirectTo: pageUrl("dashboard.html") }
        });
        if (res.error) {
          btn.disabled = false;
          showMsg(msg, "Could not start " + btn.dataset.provider + " login. Please try again.");
        }
      });
    });
  }

  /* ---------- SIGN UP ---------- */

  function initSignup() {
    redirectIfSignedIn();

    var form = $("signupForm");
    var msg = $("message");
    var btn = $("submitBtn");
    var picker = renderAvatarPicker($("avatarPicker"), 1);
    bindStrength($("password"), $("strengthBar"), $("strengthText"));

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      showMsg(msg, "");

      if (form.elements.website.value) return; // honeypot: bots fill this in

      var username = $("username").value.trim();
      var email = $("email").value.trim().toLowerCase();
      var password = $("password").value;
      var confirm = $("confirmPassword").value;

      if (!isUsername(username)) return showMsg(msg, "Username must be 3 to 20 letters, numbers or underscores.");
      if (!isEmail(email)) return showMsg(msg, "Please enter a valid email address.");
      var problems = passwordProblems(password);
      if (problems.length) return showMsg(msg, "Your password needs " + problems.join(", ") + ".");
      if (password !== confirm) return showMsg(msg, "The two passwords do not match.");
      if (!$("terms").checked) return showMsg(msg, "Please agree to the Terms and Privacy Policy.");

      setBusy(btn, true, "Creating account...");
      var res = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: { data: { username: username, avatar: picker.get() } }
      });
      setBusy(btn, false);

      if (res.error) return showMsg(msg, friendlyError(res.error));

      sessionStorage.setItem(PENDING_EMAIL, email);
      sessionStorage.setItem(PENDING_TYPE, "signup");
      goTo("verify.html");
    });
  }

  /* ---------- LOGIN ---------- */

  function initLogin() {
    redirectIfSignedIn();

    var form = $("loginForm");
    var msg = $("message");
    var btn = $("submitBtn");
    var pwField = $("passwordField");
    var switchBtn = $("switchMode");
    var mode = "password"; // or "code"
    var fails = 0;
    var lockUntil = 0;

    function setMode(next) {
      mode = next;
      var code = next === "code";
      pwField.hidden = code;
      btn.dataset.label = code ? "Email me a code" : "Log in";
      btn.textContent = btn.dataset.label;
      switchBtn.textContent = code ? "Use my password instead" : "Email me a login code instead";
      showMsg(msg, "");
    }
    switchBtn.addEventListener("click", function () {
      setMode(mode === "password" ? "code" : "password");
    });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      showMsg(msg, "");

      var email = $("email").value.trim().toLowerCase();
      if (!isEmail(email)) return showMsg(msg, "Please enter a valid email address.");

      // Email code login
      if (mode === "code") {
        setBusy(btn, true, "Sending code...");
        var sent = await supabaseClient.auth.signInWithOtp({ email: email, options: { shouldCreateUser: false } });
        setBusy(btn, false);
        // Do not reveal whether an account exists for this email.
        var unknownUser = sent.error && /signups? not allowed|not found/i.test(sent.error.message || "");
        if (sent.error && !unknownUser) return showMsg(msg, friendlyError(sent.error));
        sessionStorage.setItem(PENDING_EMAIL, email);
        sessionStorage.setItem(PENDING_TYPE, "email");
        return goTo("verify.html");
      }

      // Password login
      var password = $("password").value;
      if (!password) return showMsg(msg, "Please enter your password.");
      if (Date.now() < lockUntil) {
        return showMsg(msg, "Too many attempts. Please wait a few seconds and try again.");
      }

      setBusy(btn, true, "Logging in...");
      var res = await supabaseClient.auth.signInWithPassword({ email: email, password: password });
      setBusy(btn, false);

      if (res.error) {
        // Account exists but the email was never verified: send a fresh code.
        if (/not confirmed/i.test(res.error.message || "")) {
          await supabaseClient.auth.resend({ type: "signup", email: email });
          sessionStorage.setItem(PENDING_EMAIL, email);
          sessionStorage.setItem(PENDING_TYPE, "signup");
          return goTo("verify.html");
        }
        fails++;
        if (fails >= 5) {
          fails = 0;
          lockUntil = Date.now() + 30000;
          return showMsg(msg, "Too many attempts. Please wait 30 seconds.");
        }
        return showMsg(msg, friendlyError(res.error));
      }
      goTo("dashboard.html");
    });
  }

  /* ---------- VERIFY (6-digit code) ---------- */

  function initVerify() {
    var email = sessionStorage.getItem(PENDING_EMAIL);
    var type = sessionStorage.getItem(PENDING_TYPE) === "email" ? "email" : "signup";
    if (!email) { goTo("login.html"); return; }

    $("emailShown").textContent = maskEmail(email);

    var form = $("verifyForm");
    var msg = $("message");
    var btn = $("submitBtn");
    var resendBtn = $("resendBtn");
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".otp-input"));
    var last = inputs.length - 1;

    function fill(start, digits) {
      digits.split("").slice(0, inputs.length - start).forEach(function (d, k) {
        inputs[start + k].value = d;
      });
      inputs[Math.min(start + digits.length, last)].focus();
    }

    inputs.forEach(function (input, i) {
      input.addEventListener("focus", function () { input.select(); });
      input.addEventListener("input", function () {
        var digits = input.value.replace(/\D/g, "");
        if (digits.length > 1) { fill(i, digits); return; } // paste or autofill
        input.value = digits;
        if (digits && i < last) inputs[i + 1].focus();
      });
      input.addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && !input.value && i > 0) inputs[i - 1].focus();
        if (e.key === "ArrowLeft" && i > 0) inputs[i - 1].focus();
        if (e.key === "ArrowRight" && i < last) inputs[i + 1].focus();
      });
      input.addEventListener("paste", function (e) {
        e.preventDefault();
        var text = (e.clipboardData && e.clipboardData.getData("text")) || "";
        var digits = text.replace(/\D/g, "").slice(0, inputs.length);
        if (digits) fill(0, digits);
      });
    });
    inputs[0].focus();

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      showMsg(msg, "");
      var code = inputs.map(function (i) { return i.value; }).join("");
      if (!/^\d{6}$/.test(code)) return showMsg(msg, "Enter the 6-digit code from your email.");

      setBusy(btn, true, "Verifying...");
      var res = await supabaseClient.auth.verifyOtp({ email: email, token: code, type: type });
      setBusy(btn, false);

      if (res.error) {
        inputs.forEach(function (i) { i.value = ""; });
        inputs[0].focus();
        return showMsg(msg, friendlyError(res.error));
      }
      sessionStorage.removeItem(PENDING_EMAIL);
      sessionStorage.removeItem(PENDING_TYPE);
      goTo("dashboard.html");
    });

    // Resend with a cooldown
    var timer = null;
    function startCooldown() {
      var left = RESEND_SECONDS;
      resendBtn.disabled = true;
      resendBtn.textContent = "Resend code in " + left + "s";
      clearInterval(timer);
      timer = setInterval(function () {
        left--;
        if (left <= 0) {
          clearInterval(timer);
          resendBtn.disabled = false;
          resendBtn.textContent = "Resend code";
        } else {
          resendBtn.textContent = "Resend code in " + left + "s";
        }
      }, 1000);
    }
    startCooldown();

    resendBtn.addEventListener("click", async function () {
      showMsg(msg, "");
      resendBtn.disabled = true;
      var res = type === "signup"
        ? await supabaseClient.auth.resend({ type: "signup", email: email })
        : await supabaseClient.auth.signInWithOtp({ email: email, options: { shouldCreateUser: false } });
      if (res.error) {
        resendBtn.disabled = false;
        return showMsg(msg, friendlyError(res.error));
      }
      showMsg(msg, "A new code is on its way. Check your inbox and spam folder.", "success");
      startCooldown();
    });

    $("wrongEmail").addEventListener("click", function () {
      sessionStorage.removeItem(PENDING_EMAIL);
      sessionStorage.removeItem(PENDING_TYPE);
    });
  }

  /* ---------- DASHBOARD (protected) ---------- */

  async function initDashboard() {
    // Ask the server who is logged in. If nobody, send them to login.
    var who = await supabaseClient.auth.getUser();
    if (who.error || !who.data || !who.data.user) { goTo("login.html"); return; }
    var user = who.data.user;
    var meta = user.user_metadata || {};

    var prof = await supabaseClient.from("profiles").select("username, avatar").eq("id", user.id).maybeSingle();
    var profile = prof.data;

    var username = (profile && profile.username) || meta.username || meta.full_name || meta.name || (user.email || "player").split("@")[0];
    var avatar = normalizeAvatar(profile ? profile.avatar : meta.avatar);

    function paintProfile() {
      $("welcomeName").textContent = username;
      $("currentAvatar").replaceChildren(makeAvatarImg(avatar, "avatar-img"));
    }
    paintProfile();

    $("userEmail").textContent = user.email || "";
    $("memberSince").textContent = new Date(user.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    var provider = (user.app_metadata && user.app_metadata.provider) || "email";
    $("provider").textContent = provider.charAt(0).toUpperCase() + provider.slice(1);

    document.body.classList.remove("is-loading");

    // Account settings: username + avatar
    $("username").value = username;
    var picker = renderAvatarPicker($("avatarPicker"), avatar);
    var profileMsg = $("profileMessage");
    var profileBtn = $("profileBtn");

    $("profileForm").addEventListener("submit", async function (e) {
      e.preventDefault();
      showMsg(profileMsg, "");
      var newName = $("username").value.trim();
      if (!isUsername(newName)) return showMsg(profileMsg, "Username must be 3 to 20 letters, numbers or underscores.");

      setBusy(profileBtn, true, "Saving...");
      var res = await supabaseClient
        .from("profiles")
        .update({ username: newName, avatar: picker.get() })
        .eq("id", user.id)
        .select("id");
      setBusy(profileBtn, false);

      if (res.error) return showMsg(profileMsg, "Could not save your changes. Please try again.");
      if (!res.data || !res.data.length) return showMsg(profileMsg, "Profile not found. Make sure you ran setup.sql in Supabase.");

      username = newName;
      avatar = picker.get();
      paintProfile();
      showMsg(profileMsg, "Saved!", "success");
    });

    // Change password
    var pwMsg = $("passwordMessage");
    var pwBtn = $("passwordBtn");
    bindStrength($("newPassword"), $("strengthBar"), $("strengthText"));

    $("passwordForm").addEventListener("submit", async function (e) {
      e.preventDefault();
      showMsg(pwMsg, "");
      var np = $("newPassword").value;
      var cp = $("confirmNewPassword").value;
      var problems = passwordProblems(np);
      if (problems.length) return showMsg(pwMsg, "Your password needs " + problems.join(", ") + ".");
      if (np !== cp) return showMsg(pwMsg, "The two passwords do not match.");

      setBusy(pwBtn, true, "Updating...");
      var res = await supabaseClient.auth.updateUser({ password: np });
      setBusy(pwBtn, false);

      if (res.error) return showMsg(pwMsg, friendlyError(res.error));
      $("passwordForm").reset();
      $("strengthBar").style.width = "0";
      showMsg(pwMsg, "Password updated.", "success");
    });

    // Log out
    $("logoutBtn").addEventListener("click", async function () {
      await supabaseClient.auth.signOut();
      goTo("login.html");
    });

    // If the session ends in another tab, leave this page too.
    supabaseClient.auth.onAuthStateChange(function (event) {
      if (event === "SIGNED_OUT") goTo("login.html");
    });
  }

  /* ---------- start ---------- */

  initPasswordToggles();
  initSocialButtons();

  var page = document.body.dataset.page;
  if (page === "signup") initSignup();
  else if (page === "login") initLogin();
  else if (page === "verify") initVerify();
  else if (page === "dashboard") initDashboard();
})();

document.addEventListener("DOMContentLoaded", () => {
    const avatar = localStorage.getItem("ffverseAvatar");
    const homeAvatar = document.getElementById("homeAvatar");

    if (avatar && homeAvatar) {
        homeAvatar.src = avatar;
    }
});