/* =========================================================
   LearnLoop – courses.js
   1. Course data (edit or add your own here!)
   2. Draw the cards  3. Search and filters
   ========================================================= */

/* 1. COURSE DATA – one object per course. "id" is used in links. */
var courses = [
  { id: 'web-basics', title: 'Web Basics: Build Your First Page', category: 'web', level: 'Beginner', lessons: 8, hours: 4,
    description: 'Learn HTML, CSS and a little JavaScript by building a real page, one small lesson at a time.' },
  { id: 'js-first-steps', title: 'JavaScript First Steps', category: 'web', level: 'Intermediate', lessons: 10, hours: 6,
    description: 'Variables, functions and events. Make your pages respond to clicks and typing.' },
  { id: 'design-thinking', title: 'Design Thinking Essentials', category: 'design', level: 'Beginner', lessons: 6, hours: 3, image: 'assets/images/course-design1.jpg',
    description: 'Turn ideas into simple, useful designs with a clear step-by-step method.' },
  { id: 'color-type', title: 'Colour and Type for Beginners', category: 'design', level: 'Beginner', lessons: 7, hours: 3,
    description: 'Choose colour palettes and fonts that look good and stay easy to read.' },
  { id: 'spreadsheet-data', title: 'Data Skills with Spreadsheets', category: 'data', level: 'Intermediate', lessons: 9, hours: 5,
    description: 'Clean, sort and chart data with confidence, using formulas you will use every week.' },
  { id: 'startup-basics', title: 'Business Basics: From Idea to Plan', category: 'business', level: 'Beginner', lessons: 6, hours: 3,
    description: 'Test an idea, understand your customer and write a one-page plan.' },
  { id: 'focus-habits', title: 'Focus and Study Habits', category: 'growth', level: 'Beginner', lessons: 5, hours: 2,
    description: 'Build routines that help you learn steadily without burning out.' },
  { id: 'public-speaking', title: 'Speak with Confidence', category: 'growth', level: 'Advanced', lessons: 8, hours: 4, image: 'assets/images/course-growth1.jpg',
    description: 'Structure a talk, steady your nerves and keep an audience with you.' }
];

/* Name, symbol and colour for each category (used on cards and filters) */
var categories = {
  web:      { name: 'Web Development', glyph: '&lt;/&gt;', image: 'assets/images/course-web.jpg', icon: 'assets/icons/web.svg', tone: 'linear-gradient(135deg,#2458A6,#6F9DCA)' },
  design:   { name: 'Design',          glyph: '✦', image: 'assets/images/course-design.jpg', icon: 'assets/icons/design.svg', tone: 'linear-gradient(135deg,#6F9DCA,#C5DDF2)' },
  data:     { name: 'Data',            glyph: '▥', image: 'assets/images/course-data.jpg', icon: 'assets/icons/data.svg', tone: 'linear-gradient(135deg,#183B78,#2458A6)' },
  business: { name: 'Business',        glyph: '◆', image: 'assets/images/course_business.jpg', icon: 'assets/icons/business.svg', tone: 'linear-gradient(135deg,#6F9DCA,#9DBFE0)' },
  growth:   { name: 'Personal Growth', glyph: '☀', image: 'assets/images/course-growth.jpg', icon: 'assets/icons/growth.svg', tone: 'linear-gradient(135deg,#183B78,#6F9DCA)' }
};

/* MORE DETAIL for the Course Details page, keyed by course id.
   "learn" = what you will learn, "lessons" = the lesson titles. */
var details = {
  'web-basics': { learn: ['Structure a page with HTML', 'Style it with CSS', 'Add a click with JavaScript'],
    lessons: ['What is a web page?', 'Headings, text and links', 'Styling with CSS', 'Layouts with flexbox', 'Your first button click'] },
  'js-first-steps': { learn: ['Store data in variables', 'Write reusable functions', 'React to clicks and typing'],
    lessons: ['Variables and types', 'Making decisions', 'Loops and arrays', 'Functions', 'Events on the page'] },
  'design-thinking': { learn: ['Understand a user’s problem', 'Sketch quick ideas', 'Test and improve a design'],
    lessons: ['Empathise', 'Define the problem', 'Ideate', 'Prototype', 'Test'] },
  'color-type': { learn: ['Pick a colour palette', 'Pair fonts well', 'Check that text is readable'],
    lessons: ['How colour works', 'Building a palette', 'Choosing typefaces', 'Spacing and hierarchy', 'Contrast and accessibility'] },
  'spreadsheet-data': { learn: ['Clean messy data', 'Use core formulas', 'Chart your results'],
    lessons: ['Rows, columns and tidy data', 'Sorting and filtering', 'SUM, AVERAGE and IF', 'Lookups', 'Charts that explain'] },
  'startup-basics': { learn: ['Test an idea cheaply', 'Describe your customer', 'Write a one-page plan'],
    lessons: ['Spotting a problem', 'Know your customer', 'Your idea in one sentence', 'Pricing basics', 'The one-page plan'] },
  'focus-habits': { learn: ['Plan short study sessions', 'Reduce distractions', 'Review what you learn'],
    lessons: ['How focus works', 'Planning your week', 'Beating distractions', 'Spaced review', 'Rest and routines'] },
  'public-speaking': { learn: ['Structure a clear talk', 'Calm your nerves', 'Use voice and pauses'],
    lessons: ['Know your audience', 'Structure the talk', 'Slides that help', 'Voice and body', 'Handling questions'] }
};
/* Key terms shown as learning materials for each category */
var materials = {
  web:      [['HTML', 'The structure and content of a page.'], ['CSS', 'The colours, fonts and layout of a page.'], ['JavaScript', 'The behaviour: what happens when someone clicks.']],
  design:   [['Hierarchy', 'What the eye notices first, second and third.'], ['Contrast', 'A clear difference that guides attention.'], ['Prototype', 'A quick draft you can test with real people.']],
  data:     [['Formula', 'A calculation that updates when the data changes.'], ['Filter', 'Show only the rows you care about.'], ['Chart', 'A picture that makes a pattern easy to see.']],
  business: [['Customer', 'The person who has the problem you solve.'], ['Value proposition', 'Why someone would choose you.'], ['Pricing', 'What you charge, and why it feels fair.']],
  growth:   [['Habit', 'A small action repeated until it feels automatic.'], ['Spaced review', 'Revisiting ideas at growing gaps to remember them.'], ['Focus block', 'A timed session with no task switching.']]
};
/* Keep the lesson count on every card equal to the real number of lessons */
courses.forEach(function (c) { c.lessons = details[c.id].lessons.length; });

/* Only the courses page has these elements. The details page can reuse the data above. */
var grid = document.getElementById('course-grid');
if (grid) {
  var searchBox = document.getElementById('search');
  var chipBox = document.getElementById('chips');
  var countText = document.getElementById('count');
  var emptyBox = document.getElementById('empty');
  var currentCategory = 'all';

  /* Read ?category=web from the link (the homepage category tiles use this) */
  var wanted = new URLSearchParams(window.location.search).get('category');
  if (wanted && categories[wanted]) currentCategory = wanted;

  /* 2. DRAW THE CARDS – build the HTML for every course that matches */
  function renderCourses() {
    var text = searchBox.value.trim().toLowerCase();
    var html = '';
    var shown = 0;

    courses.forEach(function (course) {
      var cat = categories[course.category];
      var matchesCategory = currentCategory === 'all' || course.category === currentCategory;
      var matchesText = (course.title + ' ' + course.description + ' ' + cat.name).toLowerCase().indexOf(text) !== -1;
      if (!matchesCategory || !matchesText) return;     // skip courses that do not match
      shown++;
      var coverImage = course.image || cat.image;
      html += '<article class="card course" style="--tone:' + cat.tone + '">' +
        '<div class="course-art"><img src="' + coverImage + '" alt="' + course.title + ' cover" width="600" height="360" loading="lazy"></div>' +
        '<div class="course-body">' +
          '<div class="meta"><span class="tag">' + cat.name + '</span><span class="badge">' + course.level + '</span></div>' +
          '<h3>' + course.title + '</h3>' +
          '<p>' + course.description + '</p>' +
          '<p class="small">' + course.lessons + ' lessons · about ' + course.hours + ' hours</p>' +
          '<div class="course-foot">' +
            '<a class="text-link" href="course-details.html?id=' + course.id + '">View details</a>' +
            '<button class="btn btn-primary btn-sm enroll-btn" data-course="' + course.id + '" data-title="' + course.title + '">Enroll</button>' +
          '</div>' +
        '</div></article>';
    });

    grid.innerHTML = html;
    emptyBox.hidden = shown !== 0;
    countText.textContent = shown + (shown === 1 ? ' course' : ' courses') + ' found';
    refreshEnrollButtons();                              // from main.js: set "Enrolled ✓" states
  }

  /* 3. SEARCH AND FILTERS */
  function drawChips() {
    var html = '<button class="chip" data-cat="all">All</button>';
    for (var key in categories) {
      html += '<button class="chip" data-cat="' + key + '">' + categories[key].name + '</button>';
    }
    chipBox.innerHTML = html;
    markChips();
  }
  function markChips() {
    chipBox.querySelectorAll('.chip').forEach(function (chip) {
      chip.setAttribute('aria-pressed', chip.dataset.cat === currentCategory);
    });
  }
  chipBox.addEventListener('click', function (event) {
    var chip = event.target.closest('.chip');
    if (!chip) return;
    currentCategory = chip.dataset.cat;
    markChips();
    renderCourses();
  });
  searchBox.addEventListener('input', renderCourses);    // update while typing
  document.getElementById('reset-btn').addEventListener('click', function () {
    searchBox.value = '';
    currentCategory = 'all';
    markChips();
    renderCourses();
  });

  drawChips();
  renderCourses();
}


/* =========================================================
   4. COURSE DETAILS PAGE (course-details.html?id=web-basics)
   Guests and non-enrolled people see a preview. Lessons,
   materials and the quiz unlock after login + enrollment.
   ========================================================= */
var detailRoot = document.getElementById('detail-root');
var courseId, course, progress;

if (detailRoot) {
  courseId = new URLSearchParams(window.location.search).get('id');
  course = courses.filter(function (c) { return c.id === courseId; })[0];
  progress = loadData(dataKey('progress'), {});            // { "web-basics": [0, 2] } = finished lesson numbers

  if (!course) {
    detailRoot.innerHTML = '<section class="section"><div class="container empty card"><h1>We could not find that course</h1>' +
      '<p>The link may be old. Pick a course from the list.</p><a class="btn btn-primary" href="courses.html">Browse courses</a></div></section>';
  } else {
    drawCourse();
    detailRoot.addEventListener('change', handleLessonTick);
    detailRoot.addEventListener('click', handleStartClick);
    document.addEventListener('learnloop:enrolled', drawCourse);   // unlock everything right after enrolling
  }
}

function doneList() { return progress[course.id] || []; }
/* The key question: is this person logged in AND enrolled in this course? */
function canLearn() { return !!getCurrentUser() && enrolled.indexOf(course.id) !== -1; }

function drawCourse() {
  var cat = categories[course.category];
  var info = details[course.id];
  var coverImage = course.image || cat.image;
  var unlocked = canLearn();
  var user = getCurrentUser();
  document.title = course.title + ' – LearnLoop';

  var learnHtml = info.learn.map(function (item) { return '<li>' + item + '</li>'; }).join('');

  /* Curriculum: two modules. Checkboxes are disabled while locked. */
  var split = Math.ceil(info.lessons.length / 2);
  function moduleHtml(title, from, to, open) {
    var rows = '';
    for (var i = from; i < to; i++) {
      rows += '<li><label class="lesson' + (unlocked ? '' : ' is-locked') + '"><input type="checkbox" data-index="' + i + '"' +
        (doneList().indexOf(i) !== -1 ? ' checked' : '') + (unlocked ? '' : ' disabled') + '><span>' + info.lessons[i] + '</span></label></li>';
    }
    return '<details class="module card"' + (open ? ' open' : '') + '><summary>' + title + '</summary><ul class="lessons">' + rows + '</ul></details>';
  }

  /* Banner that explains why things are locked */
  var banner = '';
  if (!user) {
    banner = '<div class="lock-banner card"><strong>You are previewing this course.</strong> ' +
      '<a href="login.html?next=' + nextParam() + '">Log in</a> or <a href="signup.html?next=' + nextParam() + '">create a free account</a>, then enroll to unlock the lessons, materials and quiz.</div>';
  } else if (!unlocked) {
    banner = '<div class="lock-banner card"><strong>Enroll to unlock this course.</strong> Lessons, learning materials and the quiz open as soon as you enroll.</div>';
  }

  var materialHtml = unlocked
    ? materials[course.category].map(function (m) { return '<div class="term card"><h3>' + m[0] + '</h3><p>' + m[1] + '</p></div>'; }).join('')
    : '<div class="locked-box card"><span aria-hidden="true">🔒</span> Learning materials unlock when you enroll.</div>';

  var startLabel = !user ? 'Sign up to start' : !unlocked ? 'Enroll and start' : (doneList().length ? 'Continue learning' : 'Start learning');
  var sideProgress = unlocked
    ? '<div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" id="bar"><div class="progress-fill" id="fill"></div></div><p class="small" id="progress-text"></p>'
    : '<p class="small">Log in and enroll to track your progress.</p>';
  var quizPart = unlocked
    ? '<a class="text-link" href="quiz.html?id=' + course.id + '">Take the quiz</a>'
    : '<p class="small">🔒 The quiz unlocks when you enroll.</p>';

  detailRoot.innerHTML =
    '<section class="page-hero"><div class="aurora" aria-hidden="true"><span></span><span></span></div>' +
      '<div class="container detail-head"><img class="detail-cover" src="' + coverImage + '" alt="' + course.title + ' cover" width="150" height="150">' +
      '<div><p class="meta"><a class="tag" href="courses.html?category=' + course.category + '">' + cat.name + '</a><span class="badge">' + course.level + '</span></p>' +
      '<h1>' + course.title + '</h1><p class="lead">' + course.description + '</p></div></div></section>' +
    '<section class="section detail-body"><div class="container detail-layout"><div class="detail-main">' +
      '<h2>What you will learn</h2><ul class="learn-list">' + learnHtml + '</ul>' + banner +
      '<h2 id="lessons">Curriculum and lessons</h2><p>' + (unlocked ? 'Tick each lesson when you finish it. Your progress is saved to your account.' : 'Here is what is inside. Lessons unlock after you enroll.') + '</p>' +
      '<div class="modules">' + moduleHtml('Module 1: Getting started', 0, split, true) + moduleHtml('Module 2: Putting it together', split, info.lessons.length, false) + '</div>' +
      '<h2>Learning materials</h2><div class="terms">' + materialHtml + '</div>' +
    '</div>' +
    '<aside class="side-card card" aria-label="Your progress"><h2>Your progress</h2>' + sideProgress +
      '<button class="btn btn-primary" id="start-btn">' + startLabel + '</button>' +
      '<button class="btn btn-ghost enroll-btn" data-course="' + course.id + '" data-title="' + course.title + '">Enroll</button>' + quizPart +
      '<p class="small">' + info.lessons.length + ' lessons · about ' + course.hours + ' hours</p>' +
    '</aside></div></section>';

  updateProgress();
  refreshEnrollButtons();                                 // from main.js
}

/* Ticking a lesson saves it and updates the progress bar */
function handleLessonTick(event) {
  var box = event.target;
  if (box.type !== 'checkbox' || !canLearn()) return;
  var index = Number(box.dataset.index);
  var list = doneList().filter(function (n) { return n !== index; });   // remove, then add back if ticked
  if (box.checked) list.push(index);
  progress[course.id] = list;
  saveData(dataKey('progress'), progress);
  updateProgress();
  if (box.checked) recordActivity();                      // counts toward today's activity
  if (box.checked) showToast(list.length === details[course.id].lessons.length ? 'Course complete! Try the quiz.' : 'Lesson complete');
}

/* Start learning: guests go to sign up, others enroll if needed, then jump to the next lesson */
function handleStartClick(event) {
  if (!event.target.closest('#start-btn')) return;
  if (!getCurrentUser()) {
    setFlash('Create a free account to start this course.');
    window.location.href = 'signup.html?next=' + nextParam();
    return;
  }
  if (!canLearn()) { enrollInCourse(); drawCourse(); }
  var boxes = detailRoot.querySelectorAll('.lesson input');
  var next = Array.prototype.filter.call(boxes, function (b) { return !b.checked; })[0];
  if (!next) { showToast('You finished every lesson. Take the quiz!'); return; }
  next.closest('details').open = true;
  next.scrollIntoView({ behavior: 'smooth', block: 'center' });
  next.focus({ preventScroll: true });
  showToast('Next up: ' + next.nextElementSibling.textContent);
}

function enrollInCourse() {
  if (enrolled.indexOf(course.id) === -1) {
    enrolled.push(course.id);
    saveData(dataKey('enrolled'), enrolled);
    showToast('Enrolled in ' + course.title);
    refreshEnrollButtons();
  }
}

function updateProgress() {
  var fill = document.getElementById('fill');
  if (!fill) return;                                      // locked view has no progress bar
  var total = details[course.id].lessons.length;
  var done = doneList().length;
  var percent = Math.round((done / total) * 100);
  fill.style.width = percent + '%';
  document.getElementById('bar').setAttribute('aria-valuenow', percent);
  document.getElementById('progress-text').textContent = done + ' of ' + total + ' lessons done (' + percent + '%)';
}
