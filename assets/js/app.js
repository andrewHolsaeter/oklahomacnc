// Tab navigation
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = e.target.getAttribute('href').substring(1);

    document.querySelectorAll('.tab-content').forEach(div => div.style.display = 'none');
    document.getElementById(target).style.display = 'block';
  });
});

// Contact form submission
const form = document.getElementById('contact-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('form-status');
  const data = Object.fromEntries(new FormData(form));

  try {
    const response = await fetch('/contact', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.success) {
      status.textContent = "Message sent!";
      form.reset();
    } else {
      status.textContent = "Failed to send message.";
    }
  } catch (err) {
    status.textContent = "Error sending message.";
    console.error(err);
  }
});
