/* =========================================================
   LearnLoop – quiz.js
   1. Questions (edit or add your own!)  2. Quiz flow
   3. Results and saving the best score
   ========================================================= */

/* 1. QUESTIONS – for each course id: question, 4 options, the
   number of the right option (0 = first) and a short explanation. */
var quizzes = {
  'web-basics': [
    { q: 'Which language gives a web page its structure?', options: ['CSS', 'HTML', 'JavaScript', 'Python'], answer: 1, why: 'HTML marks up the headings, paragraphs and links that make up a page.' },
    { q: 'Which CSS property changes the colour of text?', options: ['font-style', 'margin', 'color', 'display'], answer: 2, why: 'The color property sets text colour. Background colour uses background-color.' },
    { q: 'Which tag creates the biggest heading?', options: ['<h6>', '<h1>', '<head>', '<title>'], answer: 1, why: '<h1> is the top-level heading. <h6> is the smallest.' }
  ],
  'js-first-steps': [
    { q: 'Which keyword creates a variable whose value can change?', options: ['let', 'const', 'print', 'fix'], answer: 0, why: 'let declares a variable you can change later. const is for values that stay the same.' },
    { q: 'What does a function do?', options: ['Stores a picture', 'Styles a page', 'Groups reusable steps under a name', 'Deletes variables'], answer: 2, why: 'A function packages steps so you can run them again by calling its name.' },
    { q: 'Which event runs code when someone presses a button?', options: ['scroll', 'load', 'resize', 'click'], answer: 3, why: 'The click event fires when an element is clicked or tapped.' }
  ],
  'design-thinking': [
    { q: 'What is the first stage of design thinking?', options: ['Empathise', 'Prototype', 'Test', 'Ideate'], answer: 0, why: 'You start by understanding the people you are designing for.' },
    { q: 'What is a prototype?', options: ['The final product', 'A quick draft you can test', 'A logo', 'A bug report'], answer: 1, why: 'Prototypes are cheap, quick drafts that let you learn before you build.' },
    { q: 'Why test with real people?', options: ['To make it look expensive', 'To skip ideas', 'To find problems you missed', 'To shorten the brief'], answer: 2, why: 'Real users reveal problems that the design team cannot see.' }
  ],
  'color-type': [
    { q: 'What does good contrast help with?', options: ['Making text easy to read', 'Using more fonts', 'Adding animation', 'Shrinking images'], answer: 0, why: 'Strong contrast between text and background makes reading easier for everyone.' },
    { q: 'How many typefaces suit a simple page?', options: ['Six', 'Ten', 'One or two', 'As many as possible'], answer: 2, why: 'One or two typefaces keep a page calm and consistent.' },
    { q: 'What does visual hierarchy do?', options: ['Hides content', 'Guides what readers notice first', 'Adds colour', 'Speeds up the page'], answer: 1, why: 'Size, weight and spacing tell readers what matters most.' }
  ],
  'spreadsheet-data': [
    { q: 'Which formula adds up numbers?', options: ['JOIN', 'SORT', 'SUM', 'FIND'], answer: 2, why: 'SUM adds a range of cells, for example =SUM(A1:A10).' },
    { q: 'What does a filter do?', options: ['Shows only rows that match', 'Deletes data', 'Adds a chart', 'Locks the sheet'], answer: 0, why: 'A filter temporarily hides rows that do not match your rule. The data is still there.' },
    { q: 'Which chart is best for change over time?', options: ['Pie chart', 'Line chart', 'Table', 'Word cloud'], answer: 1, why: 'A line chart shows how a value moves across days, months or years.' }
  ],
  'startup-basics': [
    { q: 'What does a value proposition explain?', options: ['Your office address', 'Your tax plan', 'Why customers would choose you', 'Your logo colours'], answer: 2, why: 'It states, simply, the benefit you offer and why it matters to your customer.' },
    { q: 'What is a cheap way to test an idea?', options: ['Talk to likely customers', 'Rent an office', 'Build everything first', 'Print merchandise'], answer: 0, why: 'Conversations cost almost nothing and show whether the problem is real.' },
    { q: 'What belongs in a one-page plan?', options: ['A long history', 'Customer, problem, solution and price', 'Only a logo', 'Staff birthdays'], answer: 1, why: 'A one-page plan keeps the essentials together on a single page.' }
  ],
  'focus-habits': [
    { q: 'What is a focus block?', options: ['A long break', 'A timed session with no task switching', 'A group chat', 'A to-do list'], answer: 1, why: 'A focus block is a set period spent on one task only.' },
    { q: 'What is spaced review?', options: ['Studying once', 'Studying only at night', 'Revisiting ideas at growing gaps', 'Skipping revision'], answer: 2, why: 'Returning to an idea after longer and longer gaps helps memory last.' },
    { q: 'What helps most against distraction?', options: ['Keeping your phone out of sight', 'Studying with more tabs open', 'Working longer', 'Skipping breaks'], answer: 0, why: 'Removing temptations works better than relying on willpower.' }
  ],
  'public-speaking': [
    { q: 'How should a strong talk usually begin?', options: ['With an apology', 'By reading your slides', 'With a long biography', 'With a clear opening idea'], answer: 3, why: 'A clear opening idea tells the audience why they should listen.' },
    { q: 'How do pauses help a speaker?', options: ['They let the audience absorb ideas', 'They waste time', 'They hide mistakes', 'They replace slides'], answer: 0, why: 'A pause gives listeners time to think and gives you time to breathe.' },
    { q: 'What should slides do?', options: ['Replace your voice', 'Hold every word you say', 'Support what you say', 'Be as busy as possible'], answer: 2, why: 'Slides work best as support. You are the main event.' }
  ]
};

/* 2. QUIZ FLOW */
var quizRoot = document.getElementById('quiz-root');
var quizCourse, quizList, qIndex, qScore, qPicked, qLocked, qAnswers;

if (quizRoot) {
  startQuizPage();
  quizRoot.addEventListener('click', handleQuizClick);     // one listener for all quiz buttons
}

function startQuizPage() {
  var id = new URLSearchParams(window.location.search).get('id');
  quizCourse = courses.filter(function (c) { return c.id === id; })[0];

  /* Access rules: logged in, and enrolled in this course */
  if (!getCurrentUser()) {
    quizRoot.innerHTML = gateCard('Log in to take quizzes', 'Quizzes are for registered learners, so your scores can be saved to your account.');
    return;
  }
  var myIds = loadData(dataKey('enrolled'), []);
  if (!quizCourse || !quizzes[id]) { drawPicker(myIds); return; }
  if (myIds.indexOf(id) === -1) {
    drawLocked('Enroll in “' + quizCourse.title + '” to unlock its quiz.', 'course-details.html?id=' + id, 'Go to the course');
    return;
  }
  quizList = quizzes[id];
  document.title = 'Quiz: ' + quizCourse.title + ' – LearnLoop';
  qIndex = 0; qScore = 0; qAnswers = [];
  drawQuestion();
}

/* A friendly "locked" message with one button */
function drawLocked(message, href, label) {
  quizRoot.innerHTML = '<div class="card quiz-card locked-card"><h2>Quiz locked</h2><p>' + message + '</p><a class="btn btn-primary" href="' + href + '">' + label + '</a></div>';
}

/* No course chosen: list the quizzes of the courses the learner is enrolled in */
function drawPicker(myIds) {
  var scores = loadData(dataKey('scores'), {});
  var mine = courses.filter(function (c) { return myIds.indexOf(c.id) !== -1; });
  if (!mine.length) { drawLocked('You have not enrolled in any course yet. Enroll in a course to unlock its quiz.', 'courses.html', 'Explore courses'); return; }
  var html = '<div class="card quiz-card"><h2>Choose a quiz</h2><ul class="picker">';
  mine.forEach(function (c) {
    var best = scores[c.id] ? ' <span class="badge">Best ' + scores[c.id].best + '/' + scores[c.id].total + '</span>' : '';
    html += '<li><a href="quiz.html?id=' + c.id + '">' + c.title + '</a>' + best + '</li>';
  });
  quizRoot.innerHTML = html + '</ul></div>';
}

function drawQuestion() {
  var item = quizList[qIndex];
  qPicked = null; qLocked = false;
  var options = item.options.map(function (text, i) {
    return '<button class="option" data-i="' + i + '" aria-pressed="false"><span class="letter">' + 'ABCD'.charAt(i) + '</span><span></span></button>';
  }).join('');
  var percent = Math.round((qIndex / quizList.length) * 100);
  quizRoot.innerHTML =
    '<div class="card quiz-card">' +
      '<div class="quiz-top"><p class="small">' + quizCourse.title + '</p><p class="small">Question ' + (qIndex + 1) + ' of ' + quizList.length + '</p></div>' +
      '<div class="progress-bar" aria-hidden="true"><div class="progress-fill" style="width:' + percent + '%"></div></div>' +
      '<h2 id="q-text" tabindex="-1">' + item.q.replace(/</g, '&lt;') + '</h2>' +
      '<div class="options" role="group" aria-labelledby="q-text">' + options + '</div>' +
      '<div class="feedback" id="feedback" role="status" aria-live="polite"></div>' +
      '<div class="quiz-actions"><button class="btn btn-primary" id="submit-btn" disabled>Submit answer</button></div>' +
    '</div>';
  /* put the option text in with textContent so symbols like <h1> show correctly */
  quizRoot.querySelectorAll('.option').forEach(function (btn, i) { btn.lastChild.textContent = item.options[i]; });
  document.getElementById('q-text').focus();
}

function handleQuizClick(event) {
  var option = event.target.closest('.option');
  if (option && !qLocked) {                                // choose an answer
    qPicked = Number(option.dataset.i);
    quizRoot.querySelectorAll('.option').forEach(function (b) {
      var on = b === option;
      b.classList.toggle('selected', on);
      b.setAttribute('aria-pressed', on);
    });
    document.getElementById('submit-btn').disabled = false;
    return;
  }
  if (event.target.closest('#submit-btn')) {
    var button = document.getElementById('submit-btn');
    if (qLocked) {                                         // second click = go on
      qIndex++;
      if (qIndex < quizList.length) drawQuestion(); else drawResults();
    } else {
      checkAnswer(button);
    }
    return;
  }
  if (event.target.closest('#retake-btn')) startQuizPage();
}

/* Submit: lock the question, mark right and wrong, explain */
function checkAnswer(button) {
  var item = quizList[qIndex];
  var isRight = qPicked === item.answer;
  qLocked = true;
  if (isRight) qScore++;
  qAnswers.push({ picked: qPicked, right: item.answer });
  quizRoot.querySelectorAll('.option').forEach(function (b, i) {
    b.classList.add('locked');
    if (i === item.answer) b.classList.add('correct');
    if (i === qPicked && !isRight) b.classList.add('wrong');
  });
  var feedback = document.getElementById('feedback');
  feedback.className = 'feedback show ' + (isRight ? 'good' : 'bad');
  feedback.textContent = (isRight ? 'Correct! ' : 'Not quite. The right answer is “' + item.options[item.answer] + '”. ') + item.why;
  button.textContent = qIndex === quizList.length - 1 ? 'See results' : 'Next question';
}

/* 3. RESULTS AND SAVING THE BEST SCORE */
function drawResults() {
  var total = quizList.length;
  var percent = Math.round((qScore / total) * 100);
  var scores = loadData(dataKey('scores'), {});
  var oldBest = scores[quizCourse.id] ? scores[quizCourse.id].best : 0;
  scores[quizCourse.id] = { best: Math.max(oldBest, qScore), total: total, last: qScore };
  saveData(dataKey('scores'), scores);
  recordActivity();

  var message = percent === 100 ? 'Perfect score. Well done!' : percent >= 60 ? 'Nice work. You know this well.' : 'A good start. Review the lessons and try again.';
  var review = quizList.map(function (item, i) {
    var a = qAnswers[i];
    var ok = a.picked === a.right;
    return '<li class="' + (ok ? 'good' : 'bad') + '"><strong>' + (ok ? 'Correct' : 'Incorrect') + ':</strong> ' + item.q.replace(/</g, '&lt;') +
      (ok ? '' : '<br><span class="small">Right answer: ' + item.options[item.answer].replace(/</g, '&lt;') + '</span>') + '</li>';
  }).join('');

  quizRoot.innerHTML =
    '<div class="card quiz-card result">' +
      '<div class="score-ring" style="--pct:' + percent + '" role="img" aria-label="Score ' + qScore + ' out of ' + total + '"><span>' + qScore + '/' + total + '</span></div>' +
      '<h2 tabindex="-1" id="result-title">' + message + '</h2>' +
      '<p>Best score for this quiz: ' + scores[quizCourse.id].best + '/' + total + '</p>' +
      '<ul class="review">' + review + '</ul>' +
      '<div class="quiz-actions"><button class="btn btn-primary" id="retake-btn">Retake quiz</button>' +
      '<a class="btn btn-ghost" href="course-details.html?id=' + quizCourse.id + '">Back to course</a>' +
      '<a class="btn btn-ghost" href="dashboard.html">My learning</a></div>' +
    '</div>';
  document.getElementById('result-title').focus();
  showToast('Quiz finished: ' + qScore + ' out of ' + total);
}
