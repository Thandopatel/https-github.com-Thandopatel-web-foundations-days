// ---------- 1. Select the elements we need ----------
const textarea = document.querySelector("#note-text");
const charCount = document.querySelector("#char-count");
const wordCount = document.querySelector("#word-count");
const clearBtn = document.querySelector("#clear-btn");
const themeToggle = document.querySelector("#theme-toggle");

// ---------- 2. Constants ----------
const DRAFT_KEY = "quicknotes-draft";
const THEME_KEY = "quicknotes-theme";
const MAX_CHARS = 200;
const WARN_CHARS = 180;

// ---------- 3. updateCounts ----------
function updateCounts() {
  const text = textarea.value;
  const chars = text.length;
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  // Character counter
  charCount.textContent = `${chars} / ${MAX_CHARS} characters`;
  charCount.classList.toggle("warning", chars > WARN_CHARS && chars <= MAX_CHARS);
  charCount.classList.toggle("over", chars > MAX_CHARS);

  // Word counter
  wordCount.textContent = words === 1 ? "1 word" : `${words} words`;
}

// ---------- 4. Draft helpers ----------
function saveDraft() {
  if (textarea.value.trim() === "") {
    localStorage.removeItem(DRAFT_KEY);
  } else {
    localStorage.setItem(DRAFT_KEY, textarea.value);
  }
}

function loadDraft() {
  const saved = localStorage.getItem(DRAFT_KEY);
  if (saved !== null) {
    textarea.value = saved;
  }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

// ---------- 5. Theme helpers ----------
function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light mode";
  } else {
    document.body.classList.remove("dark");
    themeToggle.textContent = "Dark mode";
  }
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved === "dark" ? "dark" : "light");
}

// ---------- 6. Clear everything ----------
function clearAll() {
  textarea.value = "";
  clearDraft();
  updateCounts();
  textarea.focus();
}

// ---------- 7. Event listeners ----------
textarea.addEventListener("input", () => {
  updateCounts();
  saveDraft();
});

textarea.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    clearAll();
  }
});

clearBtn.addEventListener("click", clearAll);

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
});

// ---------- 8. Init on page load ----------
loadTheme();
loadDraft();
updateCounts();
textarea.focus();