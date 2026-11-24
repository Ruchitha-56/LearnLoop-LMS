/* =========================================================
   LearnLoop – profile.js
   Shows the logged-in learner's details and lets them change
   their name or password, log out, or delete the account.
   ========================================================= */
var profileRoot = document.getElementById('profile-root');
if (profileRoot) drawProfile();

function drawProfile() {
  var user = getCurrentUser();
  if (!user) {                                              // guests see a log-in box
    profileRoot.innerHTML = gateCard('Log in to see your profile', 'Your profile shows your details and your learning summary.');
    return;
  }

  /* Numbers for the learning summary */
  var enrolledIds = loadData(dataKey('enrolled'), []);
  var progressData = loadData(dataKey('progress'), {});
  var scores = loadData(dataKey('scores'), {});
  var activity = loadData(dataKey('activity'), {});
  var myCourses = courses.filter(function (c) { return enrolledIds.indexOf(c.id) !== -1; });
  var lessonsDone = 0;
  myCourses.forEach(function (c) { lessonsDone += (progressData[c.id] || []).length; });
  var day = new Date(), streak = 0;
  if (!activity[dateKey(day)]) day.setDate(day.getDate() - 1);
  while (activity[dateKey(day)]) { streak++; day.setDate(day.getDate() - 1); }

  var since = new Date(user.created).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  var courseLinks = myCourses.length
    ? '<ul class="my-links">' + myCourses.map(function (c) { return '<li><a href="course-details.html?id=' + c.id + '">' + c.title + '</a></li>'; }).join('') + '</ul>'
    : '<p class="small">No courses yet. <a href="courses.html">Explore courses</a></p>';

  profileRoot.innerHTML =
    '<div class="profile-grid">' +
      '<div class="profile-left">' +
        '<section class="card id-card"><div class="big-avatar" aria-hidden="true">' + escapeHtml(user.name.charAt(0).toUpperCase()) + '</div>' +
          '<h2>' + escapeHtml(user.name) + '</h2><p class="small">' + escapeHtml(user.email) + '<br>Member since ' + since + '</p>' +
          '<button class="btn btn-ghost btn-sm" id="profile-logout">Log out</button></section>' +
        '<section class="card summary"><h2>Learning summary</h2><div class="profile-stats">' +
          '<div><strong>' + myCourses.length + '</strong><span>Courses</span></div>' +
          '<div><strong>' + lessonsDone + '</strong><span>Lessons done</span></div>' +
          '<div><strong>' + Object.keys(scores).length + '</strong><span>Quizzes taken</span></div>' +
          '<div><strong>' + streak + '</strong><span>Day streak</span></div></div>' +
          '<h3>My courses</h3>' + courseLinks + '<a class="text-link" href="dashboard.html">Open My Learning</a></section>' +
      '</div>' +
      '<div class="profile-right">' +
        '<form class="card contact-form" id="name-form" novalidate><h2>Your details</h2>' +
          '<label for="p-name">Name</label><input id="p-name" name="name" type="text" autocomplete="name" value="' + escapeHtml(user.name) + '">' +
          '<span class="error" id="e-pname"></span>' +
          '<label for="p-email">Email (cannot be changed)</label><input id="p-email" type="email" value="' + escapeHtml(user.email) + '" disabled>' +
          '<button class="btn btn-primary" type="submit">Save name</button></form>' +
        '<form class="card contact-form" id="pw-form" novalidate><h2>Change password</h2>' +
          '<label for="p-old">Current password</label><input id="p-old" name="old" type="password" autocomplete="current-password"><span class="error" id="e-old"></span>' +
          '<label for="p-new">New password</label><input id="p-new" name="newpw" type="password" autocomplete="new-password" aria-describedby="p-hint"><span class="small" id="p-hint">At least 8 characters, with a letter and a number.</span><span class="error" id="e-new"></span>' +
          '<label for="p-confirm">Confirm new password</label><input id="p-confirm" name="confirm" type="password" autocomplete="new-password"><span class="error" id="e-confirm"></span>' +
          '<button class="btn btn-primary" type="submit">Change password</button></form>' +
        '<section class="card danger-zone"><h2>Delete account</h2><p>This removes your account, enrollments, progress and quiz scores from this browser. It cannot be undone.</p>' +
          '<button class="btn btn-ghost btn-sm danger" id="delete-account">Delete my account</button></section>' +
      '</div></div>';

  document.getElementById('profile-logout').addEventListener('click', logout);

  /* Save a new name */
  document.getElementById('name-form').addEventListener('submit', function (event) {
    event.preventDefault();
    var name = document.getElementById('p-name').value.trim().replace(/\s+/g, ' ');
    if (name.length < 2) { document.getElementById('e-pname').textContent = 'Please enter your name.'; return; }
    var users = getUsers();
    users.forEach(function (u) { if (u.id === user.id) u.name = name; });
    saveData(USERS_KEY, users);
    setFlash('Name updated.');
    window.location.reload();
  });

  /* Change password: check the old one first, then store a new salted hash */
  document.getElementById('pw-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    var form = event.target, f = form.elements;
    form.querySelectorAll('.error').forEach(function (e) { e.textContent = ''; });
    var bad = false;
    if (!f.old.value) { document.getElementById('e-old').textContent = 'Please enter your current password.'; bad = true; }
    if (f.newpw.value.length < 8 || !/[a-z]/i.test(f.newpw.value) || !/[0-9]/.test(f.newpw.value)) { document.getElementById('e-new').textContent = 'Use at least 8 characters, with a letter and a number.'; bad = true; }
    if (f.confirm.value !== f.newpw.value) { document.getElementById('e-confirm').textContent = 'The two passwords do not match.'; bad = true; }
    if (bad) return;
    if (!cryptoReady()) { showToast('This browser cannot change passwords on this page.'); return; }
    if ((await hashPassword(f.old.value, user.salt)) !== user.hash) { document.getElementById('e-old').textContent = 'That is not your current password.'; return; }
    var salt = newSalt();
    var newHash = await hashPassword(f.newpw.value, salt);
    var users = getUsers();
    users.forEach(function (u) { if (u.id === user.id) { u.salt = salt; u.hash = newHash; } });
    saveData(USERS_KEY, users);
    form.reset();
    showToast('Password changed');
  });

  /* Delete the account and everything saved for it in this browser */
  document.getElementById('delete-account').addEventListener('click', function () {
    if (!confirm('Delete your account and all of its saved progress from this browser? This cannot be undone.')) return;
    var prefix = 'learnloop_' + user.id + '_';
    Object.keys(localStorage).filter(function (k) { return k.indexOf(prefix) === 0; }).forEach(function (k) { localStorage.removeItem(k); });
    saveData(USERS_KEY, getUsers().filter(function (u) { return u.id !== user.id; }));
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setFlash('Your account was deleted.');
    window.location.href = 'index.html';
  });
}
