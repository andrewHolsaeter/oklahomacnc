const content = document.getElementById("main");
const navItems = document.querySelectorAll("#nav ul.links li");
const FORMINIT_FORM_ID = "geeoozyqna8";
const RECAPTCHA_SITE_KEY = "6LeNtUQtAAAAAM1bZ5i-EHQ7o-mqqU-XUSpDyrsE";
const KNOWN_PAGES = new Set(["about", "contact"]);
const HOME_PAGE = "tour";

async function loadPage(page, section = null) {
  const safePage = KNOWN_PAGES.has(page) ? page : HOME_PAGE;

  try {
    const response = await fetch(`partials/${safePage}.html`);
    if (!response.ok) throw new Error(`Unable to load ${safePage}.`);

    const html = await response.text();
    content.innerHTML = html;

    initPageLinks(content);
    setActiveTab(safePage, section);

    if (safePage === "contact") {
      initQuoteForm();
    }

    if (section) {
      scrollToSection(section);
    }
  } catch (error) {
    console.error(error);
    content.innerHTML = `<article class="post"><header class="major"><h2>Page unavailable</h2><p>Please refresh and try again.</p></header></article>`;
  }
}

function setActiveTab(page, section = null) {
  navItems.forEach(li => {
    const link = li.querySelector("a");
    const isActive = section
      ? link?.dataset.section === section
      : link?.dataset.page === page;

    li.classList.toggle("active", Boolean(isActive));
  });
}

function scrollToSection(section) {
  requestAnimationFrame(() => {
    const target = document.getElementById(section);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

function scrollToMain() {
  requestAnimationFrame(() => {
    if (content) {
      content.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

function goToPage(page) {
  history.pushState({}, "", `#${page}`);
  loadPage(page).then(scrollToMain);
}

function goToSection(section) {
  history.pushState({}, "", `#${section}`);
  loadPage(HOME_PAGE, section);
}

function initPageLinks(scope = document) {
  scope.querySelectorAll("a[data-page]").forEach(link => {
    if (link.dataset.boundPageLink === "true") return;
    link.dataset.boundPageLink = "true";

    link.addEventListener("click", event => {
      event.preventDefault();
      goToPage(link.dataset.page);
    });
  });

  scope.querySelectorAll("a[data-section]").forEach(link => {
    if (link.dataset.boundSectionLink === "true") return;
    link.dataset.boundSectionLink = "true";

    link.addEventListener("click", event => {
      event.preventDefault();
      goToSection(link.dataset.section);
    });
  });
}

function initQuoteForm() {
  const form = document.getElementById("quote-form");
  if (!form || form.dataset.initialized === "true") return;

  form.dataset.initialized = "true";

  const uploadBox = document.getElementById("quote-upload");
  const fileInput = document.getElementById("quote-files");
  const fileList = document.getElementById("quote-file-list");
  const fileError = document.getElementById("quote-file-error");
  const status = document.getElementById("quote-form-status");
  const submitButton = form.querySelector('button[type="submit"]');
  const phoneInput = document.getElementById("quote-phone");
  const phoneE164Input = document.getElementById("quote-phone-e164");
  const recaptchaResponseInput = document.getElementById("quote-recaptcha-response");

  const allowedExtensions = [
    "jpg", "jpeg", "png", "webp", "pdf",
    "stl", "obj", "step", "stp", "iges", "igs", "3mf", "zip"
  ];
  const maxFileSize = 25 * 1024 * 1024;

  function formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  function getExtension(filename) {
    return filename.includes(".") ? filename.split(".").pop().toLowerCase() : "";
  }

  function validateFiles(files) {
    return Array.from(files).every(file => {
      const extension = getExtension(file.name);
      return allowedExtensions.includes(extension) && file.size <= maxFileSize;
    });
  }

  function parseUsPhone(value) {
    const raw = value.trim();
    if (!raw) return "";

    // Accept common U.S. inputs such as:
    // 5551234567, 555-123-4567, (555) 123-4567, 1-555-123-4567, +1 555 123 4567.
    // For Forminit's sender.phone field, only send a normalized E.164 value when it also
    // matches the North American Numbering Plan: area code and exchange start with 2-9.
    let digits = raw.replace(/\D/g, "");

    if (digits.length === 11 && digits.startsWith("1")) {
      digits = digits.slice(1);
    }

    if (digits.length !== 10) return null;

    const areaCodeStartsValid = /^[2-9]/.test(digits);
    const exchangeStartsValid = /^[2-9]/.test(digits.slice(3));

    if (!areaCodeStartsValid || !exchangeStartsValid) {
      return null;
    }

    return `+1${digits}`;
  }

  function renderFiles() {
    fileList.innerHTML = "";
    fileError.hidden = true;

    const files = Array.from(fileInput.files);
    if (!files.length) return;

    files.forEach(file => {
      const item = document.createElement("li");
      const name = document.createElement("span");
      const size = document.createElement("span");

      name.textContent = file.name;
      size.textContent = formatBytes(file.size);
      size.className = "quote-file-size";

      item.append(name, size);
      fileList.appendChild(item);
    });

    fileError.hidden = validateFiles(files);
  }

  function setRecaptchaToken(token) {
    if (recaptchaResponseInput) {
      recaptchaResponseInput.value = token || "";
    }
  }

  function loadRecaptchaScript() {
    if (document.querySelector('script[src*="recaptcha/enterprise.js"]')) return;

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }

  uploadBox.addEventListener("click", () => fileInput.click());
  uploadBox.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fileInput.click();
    }
  });

  uploadBox.addEventListener("dragover", event => {
    event.preventDefault();
    uploadBox.classList.add("dragover");
  });

  uploadBox.addEventListener("dragleave", () => uploadBox.classList.remove("dragover"));

  uploadBox.addEventListener("drop", event => {
    event.preventDefault();
    uploadBox.classList.remove("dragover");
    fileInput.files = event.dataTransfer.files;
    renderFiles();
  });

  fileInput.addEventListener("change", renderFiles);
  loadRecaptchaScript();

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const files = Array.from(fileInput.files);
    const honeypot = form.querySelector('input[name="website"]');

    if (honeypot && honeypot.value.trim() !== "") return;

    if (files.length && !validateFiles(files)) {
      fileError.hidden = false;
      status.textContent = "Please remove unsupported or oversized files before submitting.";
      status.className = "quote-status quote-status-error";
      return;
    }

    // Keep the visible phone field exactly as the visitor typed it.
    // If it is a valid U.S. number, also send a normalized E.164 copy to Forminit's sender.phone field.
    // If it is not a real NANP-style number, still send the typed value as regular text instead of
    // letting Forminit reject the whole quote request.
    if (phoneE164Input) {
      phoneE164Input.disabled = true;
      phoneE164Input.value = "";
    }

    if (phoneInput && phoneInput.value.trim() !== "") {
      const normalizedPhone = parseUsPhone(phoneInput.value);

      if (normalizedPhone && phoneE164Input) {
        phoneE164Input.value = normalizedPhone;
        phoneE164Input.disabled = false;
      }
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (typeof Forminit === "undefined") {
      status.textContent = "Form service did not load. Please refresh the page and try again.";
      status.className = "quote-status quote-status-error";
      return;
    }

    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Verifying...";
    status.textContent = "Checking security verification...";
    status.className = "quote-status quote-status-loading";

    try {
      if (typeof window.grecaptcha === "undefined" || typeof window.grecaptcha.enterprise === "undefined" || typeof window.grecaptcha.enterprise.ready !== "function" || typeof window.grecaptcha.enterprise.execute !== "function") {
        throw new Error("reCAPTCHA Enterprise is not available right now.");
      }

      const token = await new Promise((resolve, reject) => {
        window.grecaptcha.enterprise.ready(() => {
          window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action: "quote_submit" })
            .then(resolve)
            .catch(reject);
        });
      });

      if (!token) {
        throw new Error("reCAPTCHA verification failed.");
      }

      setRecaptchaToken(token);
      submitButton.textContent = "Sending...";
      status.textContent = "Sending your quote request...";

      const forminit = new Forminit();
      const { error } = await forminit.submit(FORMINIT_FORM_ID, new FormData(form));

      if (error) {
        status.textContent = error.message || "Something went wrong. Please try again.";
        status.className = "quote-status quote-status-error";
        return;
      }

      form.reset();
      setRecaptchaToken("");
      fileList.innerHTML = "";
      fileError.hidden = true;
      status.textContent = "Thanks — your quote request was sent successfully.";
      status.className = "quote-status quote-status-success";
    } catch (error) {
      setRecaptchaToken("");
      status.textContent = error.message || "Something went wrong. Please try again.";
      status.className = "quote-status quote-status-error";
      console.error(error);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}

function resolveInitialRoute() {
  const route = location.hash.replace("#", "");

  if (!route) {
    return { page: HOME_PAGE, section: null };
  }

  if (KNOWN_PAGES.has(route)) {
    return { page: route, section: null };
  }

  return { page: HOME_PAGE, section: route };
}

initPageLinks(document);

const initialRoute = resolveInitialRoute();
loadPage(initialRoute.page, initialRoute.section);

window.addEventListener("popstate", () => {
  const route = resolveInitialRoute();
  loadPage(route.page, route.section);
});
