// ---------- Storage helpers ----------

const USERS_KEY   = "snapshare:users";    // { [username]: password }
const SESSION_KEY = "snapshare:session";  // logged-in username
const PHOTOS_KEY  = "snapshare:photos";   // [{ id, owner, caption, dataUrl, createdAt }]

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------- Auth ----------

const users       = () => readJSON(USERS_KEY, {});
const saveUsers   = (u) => writeJSON(USERS_KEY, u);
const currentUser = () => localStorage.getItem(SESSION_KEY);
const setSession  = (u) => u ? localStorage.setItem(SESSION_KEY, u) : localStorage.removeItem(SESSION_KEY);

// ---------- DOM refs ----------

const authView    = document.getElementById("auth-view");
const appView     = document.getElementById("app-view");
const welcomeEl   = document.getElementById("welcome");
const logoutBtn   = document.getElementById("logout-btn");
const authForm    = document.getElementById("auth-form");
const authUser    = document.getElementById("auth-username");
const authPass    = document.getElementById("auth-password");
const authSubmit  = document.getElementById("auth-submit");
const authError   = document.getElementById("auth-error");
const tabLogin    = document.getElementById("tab-login");
const tabSignup   = document.getElementById("tab-signup");

const photoInput  = document.getElementById("photo-input");
const photoCaption= document.getElementById("photo-caption");
const uploadBtn   = document.getElementById("upload-btn");
const uploadStatus= document.getElementById("upload-status");
const feedList    = document.getElementById("feed-list");
const feedEmpty   = document.getElementById("feed-empty");

// ---------- Auth UI ----------

let mode = "login"; // or "signup"

function setMode(next) {
  mode = next;
  tabLogin.classList.toggle("active", mode === "login");
  tabSignup.classList.toggle("active", mode === "signup");
  authSubmit.textContent = mode === "login" ? "Log in" : "Sign up";
  authError.textContent = "";
}

tabLogin.addEventListener("click", () => setMode("login"));
tabSignup.addEventListener("click", () => setMode("signup"));

authForm.addEventListener("submit", (e) => {
  e.preventDefault();
  authError.textContent = "";

  const username = authUser.value.trim();
  const password = authPass.value;

  if (username.length < 3) { authError.textContent = "Username must be at least 3 characters."; return; }
  if (password.length < 4) { authError.textContent = "Password must be at least 4 characters."; return; }

  const all = users();

  if (mode === "signup") {
    if (all[username]) { authError.textContent = "That username is taken."; return; }
    all[username] = password;
    saveUsers(all);
    setSession(username);
    onLoggedIn();
  } else {
    if (!all[username] || all[username] !== password) {
      authError.textContent = "Wrong username or password.";
      return;
    }
    setSession(username);
    onLoggedIn();
  }

  authForm.reset();
});

logoutBtn.addEventListener("click", () => {
  setSession(null);
  onLoggedOut();
});

function onLoggedIn() {
  authView.hidden = true;
  appView.hidden  = false;
  welcomeEl.textContent = "Logged in as " + currentUser();
  logoutBtn.hidden = false;
  renderFeed();
}

function onLoggedOut() {
  authView.hidden = false;
  appView.hidden  = true;
  welcomeEl.textContent = "";
  logoutBtn.hidden = true;
  feedList.innerHTML = "";
  uploadStatus.textContent = "";
  setMode("login");
}

// ---------- Photos ----------

const photos    = () => readJSON(PHOTOS_KEY, []);
const savePhotos= (p) => writeJSON(PHOTOS_KEY, p);

uploadBtn.addEventListener("click", () => {
  const file = photoInput.files[0];
  if (!file) { uploadStatus.textContent = "Pick a photo first."; return; }
  if (!file.type.startsWith("image/")) { uploadStatus.textContent = "Only image files are allowed."; return; }
  if (file.size > 2 * 1024 * 1024) { uploadStatus.textContent = "Max photo size is 2 MB."; return; }

  const reader = new FileReader();
  uploadStatus.textContent = "Reading file…";

  reader.onload = () => {
    const photo = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      owner: currentUser(),
      caption: photoCaption.value.trim(),
      dataUrl: reader.result,
      createdAt: Date.now(),
    };

    const all = photos();
    all.unshift(photo);
    savePhotos(all);

    photoInput.value = "";
    photoCaption.value = "";
    uploadStatus.textContent = "Uploaded!";
    setTimeout(() => { uploadStatus.textContent = ""; }, 1500);

    renderFeed();
  };

  reader.onerror = () => { uploadStatus.textContent = "Could not read the file."; };
  reader.readAsDataURL(file);
});

function renderFeed() {
  const all = photos();
  feedList.innerHTML = "";

  if (all.length === 0) {
    feedEmpty.hidden = false;
    return;
  }
  feedEmpty.hidden = true;

  for (const p of all) {
    const card = document.createElement("article");
    card.className = "photo-card";

    const img = document.createElement("img");
    img.src = p.dataUrl;
    img.alt = p.caption || "Photo by " + p.owner;

    const meta = document.createElement("div");
    meta.className = "meta";

    const caption = document.createElement("span");
    caption.className = "caption";
    caption.textContent = (p.caption ? p.caption + " — " : "") + "@" + p.owner;

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      if (p.owner !== currentUser()) { alert("You can only delete your own photos."); return; }
      const remaining = photos().filter(x => x.id !== p.id);
      savePhotos(remaining);
      renderFeed();
    });

    meta.appendChild(caption);
    meta.appendChild(del);

    card.appendChild(img);
    card.appendChild(meta);
    feedList.appendChild(card);
  }
}

// ---------- Boot ----------

if (currentUser()) {
  onLoggedIn();
} else {
  onLoggedOut();
}