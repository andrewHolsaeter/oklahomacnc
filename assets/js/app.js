// Tab navigation
/* document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = e.target.getAttribute('data-page'); //.substring(1);
    console.log(e);

    document.querySelectorAll('.tab-content').forEach(div => div.style.display = 'none');
    document.getElementById(target).style.display = 'block';
  });
}); */

// Contact form submission
/* const form = document.getElementById('contact-form');
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
}); */

const content = document.getElementById("main");
const navItems = document.querySelectorAll("#nav ul.links li");

async function loadPage(page) {
  const response = await fetch(`partials/${page}.html`);
  const html = await response.text();
  content.innerHTML = html;

  setActiveTab(page);
}

function setActiveTab(page) {
  navItems.forEach(li => {
    const link = li.querySelector("a");
    const isActive = link?.dataset.page === page;

    li.classList.toggle("active", isActive);
  });
}

// Handle nav clicks
navItems.forEach(li => {
  const link = li.querySelector("a");
  if (!link || !link.dataset.page) return;

  link.addEventListener("click", e => {
    e.preventDefault();
    const page = link.dataset.page;

    history.pushState({}, "", `#${page}`);
    loadPage(page);
  });
});

// Initial load (supports refresh & direct links)
const initialPage = location.hash.replace("#", "") || "about";
loadPage(initialPage);

// Back / forward support
window.addEventListener("popstate", () => {
  const page = location.hash.replace("#", "") || "about";
  loadPage(page);
});
