/* =========================================================
   LearnLoop – auth.js (login and sign-up pages)
   IMPORTANT: there is no server. Accounts live in this browser's
   LocalStorage. Passwords are never saved as plain text: we store
   a salted PBKDF2 hash. This is great for learning and demos, but
   it is NOT real security. A real site needs a backend.
   ========================================================= */

/* Already logged in? Go to the dashboard. */
if (getCurrentUser()) window.location.replace('dashboard.html');

/* Where to go after login. Only our own pages are allowed
   (this stops "open redirect" tricks). */
function safeNext(fallback) {
  var wanted = new URLSearchParams(window.location.search).get('next') || '';
  return /^[a-z0-9_-]+\.html(\?[^#\s]*)?(#[\w-]+)?$/i.test(wanted) ? wanted : fallback;
}

/* Keep the "next" page when switching between login and sign-up */
document.querySelectorAll('.alt-link').forEach(function (link) {
  var wanted = new URLSearchParams(window.location.search).get('next');
  if (wanted) link.href += '?next=' + encodeURIComponent(wanted);
});

/* ----- small form helpers ----- */
function setFieldError(id, message, input) {
  document.getElementById(id).textContent = message;
  if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
}
function formError(message) { document.getElementById('form-error').textContent = message; }
function clearErrors(form) {
  form.querySelectorAll('.error').forEach(function (e) { e.textContent = ''; });
  form.querySelectorAll('[aria-invalid]').forEach(function (i) { i.setAttribute('aria-invalid', 'false'); });
}
var emailPattern = /^\S+@\S+\.\S+$/;
var cryptoMessage = 'This browser cannot create secure accounts on this page. Open the site with a local server or over https.';

/* Show / hide password buttons */
document.querySelectorAll('.pw-toggle').forEach(function (button) {
  button.addEventListener('click', function () {
    var input = button.previousElementSibling;
    var show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    button.textContent = show ? 'Hide' : 'Show';
    button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });
});

/* ----- SIGN UP ----- */
var signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    clearErrors(signupForm);
    var f = signupForm.elements;
    var name = f.name.value.trim().replace(/\s+/g, ' ');
    var email = f.email.value.trim().toLowerCase();
    var password = f.password.value;
    var bad = false;

    if (name.length < 2) { setFieldError('e-name', 'Please enter your name.', f.name); bad = true; }
    if (!emailPattern.test(email)) { setFieldError('e-email', 'Please enter a valid email address.', f.email); bad = true; }
    if (password.length < 8 || !/[a-z]/i.test(password) || !/[0-9]/.test(password)) {
      setFieldError('e-password', 'Use at least 8 characters, with a letter and a number.', f.password); bad = true;
    }
    if (f.confirm.value !== password) { setFieldError('e-confirm', 'The two passwords do not match.', f.confirm); bad = true; }
    if (bad) { showToast('Please fix the highlighted fields'); return; }
    if (!cryptoReady()) { formError(cryptoMessage); return; }

    var users = getUsers();
    if (users.some(function (u) { return u.email === email; })) {
      setFieldError('e-email', 'An account with this email already exists. Try logging in.', f.email);
      return;
    }

    var button = document.getElementById('submit-btn');
    button.disabled = true;
    var salt = newSalt();
    var user = {
      id: 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name, email: email, salt: salt,
      hash: await hashPassword(password, salt),
      created: new Date().toISOString()
    };
    users.push(user);
    saveData(USERS_KEY, users);
    saveSession(user, true);
    setFlash('Welcome to LearnLoop, ' + name.split(' ')[0] + '! Enroll in a course to unlock lessons.');
    window.location.href = safeNext('courses.html');
  });
}

/* ----- LOG IN ----- */
var loginForm = document.getElementById('login-form');
var failedLogins = 0, lockedUntil = 0;
if (loginForm) {
  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    clearErrors(loginForm);
    var f = loginForm.elements;
    var email = f.email.value.trim().toLowerCase();
    var password = f.password.value;
    var bad = false;

    if (Date.now() < lockedUntil) { formError('Too many attempts. Please wait a few seconds and try again.'); return; }
    if (!emailPattern.test(email)) { setFieldError('e-email', 'Please enter a valid email address.', f.email); bad = true; }
    if (!password) { setFieldError('e-password', 'Please enter your password.', f.password); bad = true; }
    if (bad) return;
    if (!cryptoReady()) { formError(cryptoMessage); return; }

    var button = document.getElementById('submit-btn');
    button.disabled = true;
    var user = getUsers().filter(function (u) { return u.email === email; })[0];
    var ok = !!user && (await hashPassword(password, user.salt)) === user.hash;
    button.disabled = false;

    if (!ok) {                                              // same message for "no account" and "wrong password"
      failedLogins++;
      if (failedLogins >= 5) { lockedUntil = Date.now() + 30000; failedLogins = 0; }
      formError('Email or password is incorrect.');
      return;
    }
    saveSession(user, f.remember.checked);
    setFlash('Welcome back, ' + user.name.split(' ')[0] + '!');
    window.location.href = safeNext('dashboard.html');
  });
}
