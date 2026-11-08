/* ===== FFVERSE Contact Page ===== */

/* ---------- SETTINGS: edit these ---------- */
const CONFIG = {
  // Free form service endpoint. Create a form at https://formspree.io and paste its URL here,
  // e.g. "https://formspree.io/f/abcdwxyz". Leave empty to use the email fallback below.
  FORM_ENDPOINT: "",

  // Your real support email (used for the mailto fallback and the email link).
  CONTACT_EMAIL: "support@ffverse.com",

  // Seconds a visitor must wait between messages (basic spam protection).
  COOLDOWN_SECONDS: 60
};
/* ------------------------------------------ */

(function () {
  "use strict";

  const form = document.getElementById("contactForm");
  const submitBtn = document.getElementById("submitBtn");
  const statusEl = document.getElementById("formStatus");
  const messageEl = document.getElementById("message");
  const counterEl = document.getElementById("counter");
  const topicEl = document.getElementById("topic");
  const deviceField = document.getElementById("deviceField");
  const COOLDOWN_KEY = "ffverse_contact_last_sent";

  // Fill in links and year
  document.getElementById("year").textContent = new Date().getFullYear();
  const emailLink = document.getElementById("emailLink");
  emailLink.href = "mailto:" + CONFIG.CONTACT_EMAIL;
  emailLink.textContent = CONFIG.CONTACT_EMAIL;

  // Character counter
  function updateCounter() {
    counterEl.textContent = messageEl.value.length + " / " + messageEl.maxLength;
  }
  messageEl.addEventListener("input", updateCounter);
  updateCounter();

  // Show phone model field only for relevant topics
  function toggleDevice() {
    const t = topicEl.value;
    const relevant = t === "Sensitivity generator help" || t === "Bug report";
    deviceField.style.display = relevant || !t ? "" : "none";
  }
  topicEl.addEventListener("change", toggleDevice);
  toggleDevice();

  // Validation
  const rules = {
    name: function (v) {
      if (v.length < 2) return "Please enter your name.";
      return "";
    },
    email: function (v) {
      if (!v) return "Please enter your email.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Please enter a valid email address.";
      return "";
    },
    topic: function (v) {
      if (!v) return "Please choose a topic.";
      return "";
    },
    message: function (v) {
      if (v.length < 10) return "Your message should be at least 10 characters.";
      return "";
    }
  };

  function showError(name, msg) {
    const field = form.elements[name].closest(".field");
    const errEl = form.querySelector('[data-error-for="' + name + '"]');
    errEl.textContent = msg;
    field.classList.toggle("invalid", Boolean(msg));
  }

  function validateField(name) {
    const value = form.elements[name].value.trim();
    const msg = rules[name](value);
    showError(name, msg);
    return !msg;
  }

  Object.keys(rules).forEach(function (name) {
    const el = form.elements[name];
    el.addEventListener("blur", function () { validateField(name); });
    el.addEventListener("input", function () {
      if (el.closest(".field").classList.contains("invalid")) validateField(name);
    });
  });

  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = "status" + (type ? " " + type : "");
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle("loading", isLoading);
    submitBtn.querySelector(".btn__label").textContent = isLoading ? "Sending" : "Send Message";
  }

  function cooldownRemaining() {
    try {
      const last = Number(localStorage.getItem(COOLDOWN_KEY)) || 0;
      const left = CONFIG.COOLDOWN_SECONDS - Math.floor((Date.now() - last) / 1000);
      return left > 0 ? left : 0;
    } catch (e) {
      return 0;
    }
  }

  function markSent() {
    try { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); } catch (e) { /* ignore */ }
  }

  function mailtoFallback(data) {
    const subject = "[FFVERSE] " + data.topic + " - " + data.name;
    const body =
      "Name: " + data.name + "\n" +
      "Email: " + data.email + "\n" +
      (data.device ? "Phone: " + data.device + "\n" : "") +
      "\n" + data.message;
    window.location.href =
      "mailto:" + CONFIG.CONTACT_EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    setStatus("", "");

    // Honeypot: bots fill this in, people never see it
    if (form.elements.website.value) return;

    const valid = Object.keys(rules).map(validateField).every(Boolean);
    if (!valid) {
      const firstBad = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
      if (firstBad) firstBad.focus();
      return;
    }

    const wait = cooldownRemaining();
    if (wait > 0) {
      setStatus("Please wait " + wait + " seconds before sending another message.", "fail");
      return;
    }

    const data = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      topic: form.elements.topic.value,
      device: form.elements.device.value.trim(),
      message: form.elements.message.value.trim()
    };

    // No endpoint set: open the visitor's email app instead
    if (!CONFIG.FORM_ENDPOINT) {
      mailtoFallback(data);
      setStatus("Opening your email app. Press send there to finish.", "success");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(CONFIG.FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          _replyto: data.email,
          _subject: "[FFVERSE] " + data.topic,
          topic: data.topic,
          phone_model: data.device,
          message: data.message
        })
      });

      if (!res.ok) throw new Error("Request failed with status " + res.status);

      markSent();
      form.reset();
      updateCounter();
      toggleDevice();
      setStatus("Message sent! Thanks for contacting FFVERSE. We will reply soon.", "success");
    } catch (err) {
      setStatus("Could not send your message. Please try again, or email us at " + CONFIG.CONTACT_EMAIL + ".", "fail");
    } finally {
      setLoading(false);
    }
  });
})();