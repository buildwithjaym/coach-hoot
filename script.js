

const SUPABASE_URL = "https://rxbbuqpvzmalnzvugxgk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4YmJ1cXB2em1hbG56dnVneGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MzU0ODIsImV4cCI6MjA5NTExMTQ4Mn0.vg8mvX7gHjZN3GYzS3_xY_ckkAs2EKcAbAkbIpZwa7E";


const WAITLIST_TABLE = "coachhoot_waitlist";

const waitlistForm = document.querySelector("#waitlistForm");
const submitButton = document.querySelector("#submitButton");
const formMessage = document.querySelector("#formMessage");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "×" : "☰";
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    });
  });
}

function createToastContainer() {
  let container = document.querySelector("#toastContainer");

  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    document.body.appendChild(container);
  }

  return container;
}

function showToast(type, title, message) {
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
    review_stage: clean(formData.get("review_stage")),
    review_struggle: clean(formData.get("review_struggle")),
    top_need: clean(formData.get("top_need")),
    offline_need: clean(formData.get("offline_need")),
    price_interest: clean(formData.get("price_interest")),
    biggest_value: clean(formData.get("biggest_value")) || null,
    message: clean(formData.get("message")) || null,

    company_website: clean(formData.get("company_website")),

    source: "coachhoot_validation_landing_page",
    landing_variant: "coach_first_validation_v4",
    user_agent: navigator.userAgent
  };
}

function validatePayload(payload) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (payload.company_website) return "Spam detected.";
  if (payload.full_name.length < 2) return "Please enter your full name.";
  if (!emailPattern.test(payload.email)) return "Please enter a valid email address.";
  if (!payload.exam_type) return "Please choose your CSE type.";
  if (!payload.target_exam) return "Please choose your target exam timeline.";
  if (!payload.review_stage) return "Please choose your review status.";
  if (!payload.review_struggle) return "Please choose your biggest review struggle.";
  if (!payload.top_need) return "Please choose the feature that would help you most.";
  if (!payload.offline_need) return "Please answer how important offline access is to you.";
  if (!payload.price_interest) return "Please answer how ₱299 one-time access feels.";

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
  submitButton.textContent = isLoading ? "Submitting..." : "Submit Feedback";
}

async function submitToSupabase(payload) {
  const cleanPayload = { ...payload };

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

document.querySelectorAll("[data-exam-choice]").forEach((button) => {
  button.addEventListener("click", () => {
    const examChoice = button.dataset.examChoice;

    document.querySelectorAll("[data-exam-choice]").forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    const examSelect = document.querySelector('select[name="exam_type"]');

    if (examSelect) {
      examSelect.value = examChoice;
    }

    const waitlistSection = document.querySelector("#waitlist");

    showToast(
      "success",
      "CSE type selected",
      `${examChoice} was selected. Please answer the validation form so we can understand what you need.`
    );

    if (waitlistSection) {
      setTimeout(() => {
        waitlistSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 350);
    }
  });
});

if (!waitlistForm) {
  console.error("Coach Hoot error: #waitlistForm was not found.");
} else {
  waitlistForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    showMessage("", "");

    if (!isSupabaseConfigured()) {
      const message =
        "Supabase is not configured yet. Please add your Supabase anon key in script.js.";

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

      document.querySelectorAll("[data-exam-choice]").forEach((btn) => {
        btn.classList.remove("active");
      });

      const successText =
        "Thank you! Your feedback was submitted. This helps us decide what Coach Hoot should build first.";

      showMessage("success", successText);
      showToast("success", "Feedback submitted", successText);
    } catch (error) {
      console.error("Supabase submit error:", error);

      if (error.code === "23505" || error.status === 409) {
        const duplicateText =
          "You already submitted feedback using this email. Thank you for helping validate Coach Hoot!";

        waitlistForm.reset();
        showMessage("success", duplicateText);
        showToast("success", "Already submitted", duplicateText);
        return;
      }

      if (error.code === "42501" || error.status === 401 || error.status === 403) {
        const rlsText =
          "Submission was blocked by Supabase security policy. Please check your RLS insert policy.";

        showMessage("error", rlsText);
        showToast("error", "Supabase policy error", rlsText);
        return;
      }

      if (error.status === 404) {
        const tableText =
          "Supabase table was not found. Please make sure the table name is coachhoot_waitlist.";

        showMessage("error", tableText);
        showToast("error", "Table not found", tableText);
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