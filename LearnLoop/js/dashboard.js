/* =========================================================
   LearnLoop – dashboard.js
   Reads everything saved in LocalStorage and draws the page:
   enrolled courses, progress, quiz scores and weekly activity.
   ========================================================= */
var dashRoot = document.getElementById('dash-root');
if (dashRoot) drawDashboard();

/* Count how many days in a row (up to today) have activity */
function calcStreak(activity) {
  var day = new Date();
  if (!activity[dateKey(day)]) day.setDate(day.getDate() - 1);   // today may not have started yet
  var days = 0;
  while (activity[dateKey(day)]) { days++; day.setDate(day.getDate() - 1); }
  return days;
}

function drawDashboard() {
  var user = getCurrentUser();
  if (!user) {                                            // guests see a log-in box instead
    document.getElementById('welcome-title').textContent = 'My Learning';
    document.getElementById('welcome-text').textContent = 'Log in to see your courses, progress and quiz scores.';
    dashRoot.innerHTML = gateCard('Log in to see your learning', 'Your enrolled courses, progress and quiz scores are saved to your account on this device.');
    return;
  }
  var enrolledIds = loadData(dataKey('enrolled'), []);
  var progressData = loadData(dataKey('progress'), {});
  var scores = loadData(dataKey('scores'), {});
  var activity = loadData(dataKey('activity'), {});
  var myCourses = courses.filter(function (c) { return enrolledIds.indexOf(c.id) !== -1; });

  /* Welcome text changes with the time of day */
  var hour = new Date().getHours();
  var greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('welcome-title').textContent = greeting + ', ' + user.name.split(' ')[0];
  document.getElementById('welcome-text').textContent = 'Pick up where you left off. You can edit your details on your profile page.';

  /* Numbers for the stat tiles */
  var lessonsDone = 0, lessonsTotal = 0;
  myCourses.forEach(function (c) {
    lessonsDone += (progressData[c.id] || []).length;
    lessonsTotal += details[c.id].lessons.length;
  });
  var scoreIds = Object.keys(scores);
  var avg = 0;
  scoreIds.forEach(function (id) { avg += scores[id].best / scores[id].total; });
  var avgText = scoreIds.length ? Math.round((avg / scoreIds.length) * 100) + '%' : '–';
  var streak = calcStreak(activity);

  var html = '<div class="stats">' +
    stat(myCourses.length, 'Courses enrolled') +
    stat(lessonsDone + (lessonsTotal ? ' / ' + lessonsTotal : ''), 'Lessons completed') +
    stat(streak, streak === 1 ? 'Day streak' : 'Day streak') +
    stat(avgText, 'Average quiz score') + '</div>';

  html += '<div class="dash-grid">';

  /* Continue learning: the first enrolled course that is not finished */
  var next = myCourses.filter(function (c) { return (progressData[c.id] || []).length < details[c.id].lessons.length; })[0];
  html += '<section class="card continue" aria-labelledby="cont-h"><h2 id="cont-h">Continue learning</h2>';
  if (!myCourses.length) {
    html += '<p>You have not enrolled in a course yet. Choose one to begin.</p><a class="btn btn-primary" href="courses.html">Explore courses</a>';
  } else if (!next) {
    html += '<p>You finished every lesson in your courses. Test yourself with a quiz or find a new course.</p><a class="btn btn-primary" href="courses.html">Find a new course</a>';
  } else {
    var done = (progressData[next.id] || []).length, total = details[next.id].lessons.length;
    var nextLesson = details[next.id].lessons[firstMissing(progressData[next.id] || [], total)];
    html += '<h3>' + next.title + '</h3><p class="small">Next lesson: ' + nextLesson + '</p>' + bar(done, total) +
      '<a class="btn btn-primary" href="course-details.html?id=' + next.id + '#lessons">Continue</a>';
  }
  html += '</section>';

  /* Daily activity for the last 7 days */
  var names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var week = [], max = 1;
  for (var i = 6; i >= 0; i--) {
    var d = new Date(); d.setDate(d.getDate() - i);
    var count = activity[dateKey(d)] || 0;
    if (count > max) max = count;
    week.push({ label: names[d.getDay()], count: count });
  }
  html += '<section class="card activity" aria-labelledby="act-h"><h2 id="act-h">Daily activity</h2><div class="week">';
  week.forEach(function (w) {
    html += '<div class="day"><span class="n">' + w.count + '</span><i style="--h:' + Math.max(4, Math.round((w.count / max) * 100)) + '%"></i><span>' + w.label + '</span></div>';
  });
  html += '</div><p class="small">Lessons ticked and quizzes finished each day.</p></section>';

  /* Enrolled courses with progress and quiz scores */
  html += '<section class="card enrolled-list" aria-labelledby="enr-h"><h2 id="enr-h">My courses</h2>';
  if (!myCourses.length) html += '<p>Courses you enroll in will appear here.</p>';
  myCourses.forEach(function (c) {
    var d2 = (progressData[c.id] || []).length, t2 = details[c.id].lessons.length;
    var sc = scores[c.id] ? '<span class="badge">Quiz ' + scores[c.id].best + '/' + scores[c.id].total + '</span>' : '<a class="text-link" href="quiz.html?id=' + c.id + '">Take quiz</a>';
    html += '<div class="row"><div class="mini-glyph" style="background:' + categories[c.category].tone + '" aria-hidden="true">' + categories[c.category].glyph + '</div>' +
      '<div class="row-main"><a href="course-details.html?id=' + c.id + '"><strong>' + c.title + '</strong></a>' + bar(d2, t2) + '</div>' + sc + '</div>';
  });
  html += '</section>';

  /* Completed lessons */
  html += '<section class="card completed" aria-labelledby="comp-h"><h2 id="comp-h">Completed lessons</h2>';
  var items = '';
  myCourses.forEach(function (c) {
    (progressData[c.id] || []).slice().sort().forEach(function (n) {
      items += '<li><span class="tick" aria-hidden="true">✓</span>' + details[c.id].lessons[n] + ' <span class="small">· ' + c.title + '</span></li>';
    });
  });
  html += items ? '<ul class="done-list">' + items + '</ul>' : '<p>Lessons you finish will be listed here.</p>';
  html += '</section></div>';

  html += '<div class="reset-row"><button class="btn btn-ghost btn-sm" id="reset-progress">Reset my progress</button></div>';
  dashRoot.innerHTML = html;

  document.getElementById('reset-progress').addEventListener('click', function () {
    if (!confirm('Reset all enrolled courses, progress and quiz scores in this browser?')) return;
    [dataKey('enrolled'), dataKey('progress'), dataKey('scores'), dataKey('activity')].forEach(function (k) { localStorage.removeItem(k); });
    showToast('Progress reset');
    setTimeout(function () { window.location.reload(); }, 700);
  });
}

/* Small helpers that return pieces of HTML */
function stat(value, label) { return '<div class="stat glass"><strong>' + value + '</strong><span>' + label + '</span></div>'; }
function bar(done, total) {
  var percent = Math.round((done / total) * 100);
  return '<div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + percent + '"><div class="progress-fill" style="width:' + percent + '%"></div></div><p class="small">' + done + ' of ' + total + ' lessons (' + percent + '%)</p>';
}
function firstMissing(doneList2, total) {                  // number of the first lesson not yet done
  for (var i = 0; i < total; i++) { if (doneList2.indexOf(i) === -1) return i; }
  return 0;
}
