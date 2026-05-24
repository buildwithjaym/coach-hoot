const waitlistForm = document.querySelector('#waitlistForm');
const submitButton = document.querySelector('#submitButton');
const formMessage = document.querySelector('#formMessage');

function showMessage(type, message) {
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;
}

function getFormPayload(form) {
  const formData = new FormData(form);
  return {
    full_name: String(formData.get('full_name') || '').trim(),
    email: String(formData.get('email') || '').trim().toLowerCase(),
    phone: String(formData.get('phone') || '').trim(),
    exam_type: String(formData.get('exam_type') || '').trim(),
    target_exam: String(formData.get('target_exam') || '').trim(),
    price_interest: String(formData.get('price_interest') || '').trim(),
    top_need: String(formData.get('top_need') || '').trim(),
    message: String(formData.get('message') || '').trim(),
    company_website: String(formData.get('company_website') || '').trim(),
    source: 'coachhoot_landing_v2'
  };
}

function validatePayload(payload) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (payload.company_website) return 'Spam detected.';
  if (payload.full_name.length < 2) return 'Please enter your full name.';
  if (!emailPattern.test(payload.email)) return 'Please enter a valid email address.';
  if (!payload.exam_type) return 'Please choose your CSE type.';
  if (!payload.target_exam) return 'Please choose your target exam timeline.';
  if (!payload.price_interest) return 'Please choose your payment interest.';
  if (!payload.top_need) return 'Please choose what would help you most.';
  return null;
}

waitlistForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = getFormPayload(waitlistForm);
  const validationError = validatePayload(payload);

  if (validationError) {
    showMessage('error', validationError);
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Joining...';
  formMessage.className = 'form-message';
  formMessage.textContent = '';

  try {
    const response = await fetch('/.netlify/functions/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || 'Unable to submit right now.');
    }

    waitlistForm.reset();

    if (result.status === 'already_joined') {
      showMessage('success', 'You are already on the waitlist. Thank you for supporting Coach Hoot!');
    } else {
      showMessage('success', 'You’re on the list! Coach Hoot will notify you when early access opens.');
    }
  } catch (error) {
    showMessage('error', error.message || 'Unable to submit. Please try again.');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Join Early Access';
  }
});
