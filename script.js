

const SUPABASE_URL = "https://rxbbuqpvzmalnzvugxgk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4YmJ1cXB2em1hbG56dnVneGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MzU0ODIsImV4cCI6MjA5NTExMTQ4Mn0.vg8mvX7gHjZN3GYzS3_xY_ckkAs2EKcAbAkbIpZwa7E";

const WAITLIST_TABLE = "coachhoot_waitlist";

const waitlistForm = document.querySelector("#waitlistForm");
const submitButton = document.querySelector("#submitButton");
const formMessage = document.querySelector("#formMessage");



function createToastContainer() {
  let container = document.querySelector("#toastContainer");

  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    document.body.appendChild(container);
  }

  return container;
}

function injectToastStyles() {
  if (document.querySelector("#coachHootToastStyles")) return;

  const style = document.createElement("style");
  style.id = "coachHootToastStyles";
  style.textContent = `
    #toastContainer {
      position: fixed;
      top: 22px;
      right: 22px;
      z-index: 99999;
      display: grid;
      gap: 12px;
      width: min(360px, calc(100vw - 32px));
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 15px 16px;
      border-radius: 18px;
      background: #ffffff;
      border: 1px solid rgba(10, 29, 77, 0.12);
      box-shadow: 0 22px 60px rgba(10, 29, 77, 0.18);
      color: #0F172A;
      animation: toastSlideIn 0.28s ease forwards;
    }

    .toast-icon {
      width: 34px;
      height: 34px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      font-weight: 900;
    }

    .toast.success .toast-icon {
      background: rgba(46, 139, 87, 0.12);
      color: #2E8B57;
    }

    .toast.error .toast-icon {
      background: rgba(220, 38, 38, 0.10);
      color: #B91C1C;
    }

    .toast.info .toast-icon {
      background: rgba(10, 29, 77, 0.10);
      color: #0A1D4D;
    }

    .toast-content strong {
      display: block;
      color: #0A1D4D;
      font-size: 0.95rem;
      line-height: 1.2;
      margin-bottom: 3px;
    }

    .toast-content span {
      display: block;
      color: #64748B;
      font-size: 0.86rem;
      line-height: 1.35;
    }

    .toast-close {
      margin-left: auto;
      border: 0;
      background: transparent;
      color: #94A3B8;
      cursor: pointer;
      font-size: 1.2rem;
      line-height: 1;
    }

    @keyframes toastSlideIn {
      from {
        opacity: 0;
        transform: translateY(-12px) translateX(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0) translateX(0);
      }
    }

    @keyframes toastSlideOut {
      from {
        opacity: 1;
        transform: translateY(0) translateX(0);
      }
      to {
        opacity: 0;
        transform: translateY(-8px) translateX(16px);
      }
    }

    @media (max-width: 640px) {
      #toastContainer {
        top: 14px;
        right: 14px;
        left: 14px;
        width: auto;
      }
    }
  `;

  document.head.appendChild(style);
}

function showToast(type, title, message) {
  injectToastStyles();

  const container = createToastContainer();

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icon = type === "success" ? "✓" : type === "error" ? "!" : "i";

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <strong>${title}</strong>
      <span>${message}</span>
    </div>
    <button class="toast-close" type="button" aria-label="Close notification">×</button>
  `;

  const closeButton = toast.querySelector(".toast-close");

  function removeToast() {
    toast.style.animation = "toastSlideOut 0.22s ease forwards";
    setTimeout(() => toast.remove(), 220);
  }

  closeButton.addEventListener("click", removeToast);

  container.appendChild(toast);

  setTimeout(removeToast, 5200);
}


function showMessage(type, message) {
  if (!formMessage) return;

  formMessage.textContent = message || "";
  formMessage.className = "form-message";

  if (type === "success") formMessage.classList.add("success");
  if (type === "error") formMessage.classList.add("error");

  formMessage.style.display = message ? "block" : "none";
}


function clean(value) {
  return String(value || "").trim();
}

function getFormPayload(form) {
  const formData = new FormData(form);

  return {
    full_name: clean(formData.get("full_name")),
    email: clean(formData.get("email")).toLowerCase(),
    phone: clean(formData.get("phone")) || null,
    exam_type: clean(formData.get("exam_type")),
    target_exam: clean(formData.get("target_exam")),
    price_interest: clean(formData.get("price_interest")),
    top_need: clean(formData.get("top_need")),
    message: clean(formData.get("message")) || null,

    // Honeypot anti-spam field
    company_website: clean(formData.get("company_website")),

    source: "coachhoot_landing_v2",
    landing_variant: "pure_html_css_js_rest_api",
    user_agent: navigator.userAgent
  };
}

function validatePayload(payload) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (payload.company_website) return "Spam detected.";
  if (payload.full_name.length < 2) return "Please enter your full name.";
  if (!emailPattern.test(payload.email)) return "Please enter a valid email address.";
  if (!payload.exam_type) return "Please choose your CSE type: Professional or SubProfessional.";
  if (!payload.target_exam) return "Please choose your target exam timeline.";
  if (!payload.price_interest) return "Please answer if ₱299 one-time unlock feels worth it.";
  if (!payload.top_need) return "Please choose what would help you most.";

  return null;
}

function isSupabaseConfigured() {
  const hasUrl =
    SUPABASE_URL &&
    SUPABASE_URL.includes("supabase.co") &&
    !SUPABASE_URL.includes("YOUR_PROJECT_REF");

  const hasKey =
    SUPABASE_ANON_KEY &&
    SUPABASE_ANON_KEY !== "PASTE_YOUR_SUPABASE_ANON_KEY_HERE" &&
    SUPABASE_ANON_KEY.length > 20;

  return hasUrl && hasKey;
}

function setLoading(isLoading) {
  if (!submitButton) return;

  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Joining..." : "Join Early Access";
}



async function submitToSupabase(payload) {
  const cleanPayload = { ...payload };

  // Do not save honeypot field
  delete cleanPayload.company_website;

  const endpoint = `${SUPABASE_URL}/rest/v1/${WAITLIST_TABLE}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Prefer": "return=minimal"
    },
    body: JSON.stringify(cleanPayload)
  });

  if (!response.ok) {
    let errorData = {};

    try {
      errorData = await response.json();
    } catch {
      errorData = {};
    }

    const error = new Error(
      errorData.message || `Supabase request failed with status ${response.status}`
    );

    error.status = response.status;
    error.code = errorData.code;
    error.details = errorData.details;

    throw error;
  }

  return true;
}


if (!waitlistForm) {
  console.error("Coach Hoot error: #waitlistForm was not found.");
} else {
  waitlistForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    showMessage("", "");

    if (!isSupabaseConfigured()) {
      const message =
        "Supabase is not configured yet. Please add your Supabase URL and anon key in script.js.";

      showMessage("error", message);
      showToast("error", "Setup needed", message);
      return;
    }

    const payload = getFormPayload(waitlistForm);
    const validationError = validatePayload(payload);

    if (validationError) {
      showMessage("error", validationError);
      showToast("error", "Please check the form", validationError);
      return;
    }

    setLoading(true);

    try {
      await submitToSupabase(payload);

      waitlistForm.reset();

      const successText =
        "You’re on the list! Coach Hoot will notify you when early access opens.";

      showMessage("success", successText);
      showToast("success", "Successfully sent!", successText);
    } catch (error) {
      console.error("Supabase submit error:", error);

      if (error.code === "23505" || error.status === 409) {
        const duplicateText =
          "You are already on the Coach Hoot waitlist. Thank you for supporting us!";

        waitlistForm.reset();
        showMessage("success", duplicateText);
        showToast("success", "Already joined", duplicateText);
        return;
      }

      if (error.code === "42501" || error.status === 401 || error.status === 403) {
        const rlsText =
          "Submission blocked by Supabase security policy. Please check your RLS insert policy.";

        showMessage("error", rlsText);
        showToast("error", "Supabase policy error", rlsText);
        return;
      }

      const fallbackText =
        error.message || "Unable to submit right now. Please try again.";

      showMessage("error", fallbackText);
      showToast("error", "Submission failed", fallbackText);
    } finally {
      setLoading(false);
    }
  });
}