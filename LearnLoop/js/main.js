/* =========================================================
   LearnLoop – main.js (shared by every page)
   1. LocalStorage helpers + accounts  2. Toast  3. Dark mode
   4. Mobile menu  5. Enroll buttons  6. Activity  7. Contact form
   ========================================================= */

/* 1. LOCALSTORAGE HELPERS
   LocalStorage keeps data in the browser. It only stores text,
   so we convert with JSON.stringify (save) and JSON.parse (load). */
function loadData(key, fallback) {
  try {
    var saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    return fallback;            // storage blocked or data broken: use the default
  }
}
function saveData(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* ignore */ }
}

/* ---------- ACCOUNTS (stored in this browser only: a learning demo, not real security) ----------
   getUsers()        -> all accounts created in this browser
   getCurrentUser()  -> the logged-in account, or null for a guest
   dataKey('name')   -> a storage key that belongs to the current user */
var USERS_KEY = 'learnloop_users';
var SESSION_KEY = 'learnloop_session';
function getUsers() { return loadData(USERS_KEY, []); }
function getCurrentUser() {
  var session = null;
  try {
    session = JSON.parse(sessionStorage.getItem(SESSION_KEY)) || JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch (error) { session = null; }
  if (!session) return null;
  return getUsers().filter(function (u) { return u.id === session.id; })[0] || null;
}
function saveSession(user, remember) {                     // remember = stay logged in after closing the browser
  try { (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify({ id: user.id })); } catch (error) { /* ignore */ }
}
function dataKey(name) {
  var user = getCurrentUser();
  return 'learnloop_' + (user ? user.id : 'guest') + '_' + name;
}
function setFlash(message) {                               // a message to show on the NEXT page
  try { sessionStorage.setItem('learnloop_flash', message); } catch (error) { /* ignore */ }
}
function logout() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  setFlash('You have been logged out.');
  window.location.href = 'index.html';
}
function escapeHtml(text) {                                // makes user-typed text safe to show
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function nextParam() {                                     // "come back here after login"
  return encodeURIComponent(window.location.pathname.split('/').pop() + window.location.search + window.location.hash);
}
function gateCard(title, text) {                           // the "please log in" box
  return '<div class="card gate"><h2>' + title + '</h2><p>' + text + '</p><div class="gate-actions">' +
    '<a class="btn btn-primary" href="login.html?next=' + nextParam() + '">Log in</a>' +
    '<a class="btn btn-ghost" href="signup.html?next=' + nextParam() + '">Create free account</a></div></div>';
}

/* PASSWORD HASHING with the browser's built-in crypto (used by sign-up, login and the profile page) */
function cryptoReady() { return !!(window.crypto && window.crypto.subtle); }
function bytesToHex(buffer) {
  return Array.from(new Uint8Array(buffer)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
}
function newSalt() {
  var bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}
async function hashPassword(password, saltHex) {            // "async" = this step takes a moment
  var key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  var salt = new Uint8Array(saltHex.match(/../g).map(function (h) { return parseInt(h, 16); }));
  var bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  return bytesToHex(bits);
}

/* 2. TOAST NOTIFICATION – a small message that fades away */
var toastTimer;
function showToast(message) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2800);
}

/* 3. DARK / LIGHT MODE – remembered between visits */
var themeButton = document.getElementById('theme-toggle');
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeButton) {
    themeButton.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeButton.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
}
applyTheme(loadData('learnloop_theme', 'light'));
if (themeButton) {
  themeButton.addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveData('learnloop_theme', next);
    showToast(next === 'dark' ? 'Dark mode on' : 'Light mode on');
  });
}

/* 3b. HEADER ACCOUNT BUTTONS and one-time messages */
var currentUser = getCurrentUser();
var authSlot = document.getElementById('auth-slot');
if (authSlot) {
  if (currentUser) {
    authSlot.innerHTML = '<a class="avatar" href="profile.html" aria-label="My profile (signed in as ' + escapeHtml(currentUser.name) + ')">' +
      escapeHtml(currentUser.name.charAt(0).toUpperCase()) + '</a><button class="btn btn-ghost btn-sm" id="logout-btn">Log out</button>';
    document.getElementById('logout-btn').addEventListener('click', logout);
  } else {
    authSlot.innerHTML = '<a class="btn btn-ghost btn-sm" href="login.html?next=' + nextParam() + '">Log in</a>' +
      '<a class="btn btn-primary btn-sm signup-link" href="signup.html?next=' + nextParam() + '">Sign up</a>';
  }
}
var flashMessage = null;
try { flashMessage = sessionStorage.getItem('learnloop_flash'); sessionStorage.removeItem('learnloop_flash'); } catch (error) { /* ignore */ }
if (flashMessage) showToast(flashMessage);

/* 4. MOBILE MENU – opens and closes the link list on small screens */
var menuButton = document.getElementById('menu-btn');
var navLinks = document.getElementById('nav-links');
if (menuButton && navLinks) {
  menuButton.addEventListener('click', function () {
    var isOpen = navLinks.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', isOpen);
    menuButton.textContent = isOpen ? '✕' : '☰';
  });
}

/* 5. ENROLL BUTTONS – save enrolled course ids in LocalStorage
   One click listener on the whole page, so it also works for
   buttons that JavaScript adds later (like the course cards). */
var enrolled = loadData(dataKey('enrolled'), []);       // e.g. ["web-basics"]
function updateEnrollButton(button) {
  var isEnrolled = enrolled.indexOf(button.dataset.course) !== -1;
  button.textContent = isEnrolled ? 'Enrolled ✓' : 'Enroll';
  button.classList.toggle('enrolled', isEnrolled);
}
function refreshEnrollButtons() {
  document.querySelectorAll('.enroll-btn').forEach(updateEnrollButton);
}
refreshEnrollButtons();
document.addEventListener('click', function (event) {
  var button = event.target.closest('.enroll-btn');
  if (!button) return;
  var id = button.dataset.course;
  if (!currentUser) {                                     // guests: log in first, then come back
    setFlash('Log in or create a free account to enroll in ' + button.dataset.title + '.');
    window.location.href = 'login.html?next=' + nextParam();
    return;
  }
  if (enrolled.indexOf(id) === -1) {
    enrolled.push(id);
    showToast('Enrolled in ' + button.dataset.title);
    document.dispatchEvent(new CustomEvent('learnloop:enrolled', { detail: id }));   // lets other code unlock lessons
  } else {
    showToast('You are already enrolled in ' + button.dataset.title);
  }
  saveData(dataKey('enrolled'), enrolled);
  updateEnrollButton(button);
});

/* 6. SHARED HELPERS FOR DAILY ACTIVITY (used by lessons, quizzes and the dashboard) */
function dateKey(date) {                                  // 2026-11-18 style text for a date
  var m = String(date.getMonth() + 1).padStart(2, '0');
  var d = String(date.getDate()).padStart(2, '0');
  return date.getFullYear() + '-' + m + '-' + d;
}
function recordActivity() {                               // +1 action for today
  var activity = loadData(dataKey('activity'), {});
  var today = dateKey(new Date());
  activity[today] = (activity[today] || 0) + 1;
  saveData(dataKey('activity'), activity);
}

/* 7. CONTACT FORM – checks the fields, then opens the visitor's email app.
   (There is no server, so we do not pretend to "send" anything.) */
var CONTACT_EMAIL = 'hello@learnloop.example';            // change this to your real address
var contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var fields = {
      name: contactForm.elements.name,
      email: contactForm.elements.email,
      message: contactForm.elements.message
    };
    var problems = {
      name: fields.name.value.trim() === '' ? 'Please enter your name.' : '',
      email: /^\S+@\S+\.\S+$/.test(fields.email.value.trim()) ? '' : 'Please enter a valid email address.',
      message: fields.message.value.trim().length < 10 ? 'Please write at least 10 characters.' : ''
    };
    var firstBad = null;
    for (var key in problems) {
      document.getElementById('e-' + key).textContent = problems[key];
      fields[key].setAttribute('aria-invalid', problems[key] ? 'true' : 'false');
      if (problems[key] && !firstBad) firstBad = fields[key];
    }
    if (firstBad) { firstBad.focus(); showToast('Please fix the highlighted fields'); return; }

    var subject = 'LearnLoop: ' + contactForm.elements.topic.value;
    var body = fields.message.value.trim() + '\n\nFrom: ' + fields.name.value.trim() + ' (' + fields.email.value.trim() + ')';
    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    showToast('Opening your email app…');
    contactForm.reset();
  });
}
