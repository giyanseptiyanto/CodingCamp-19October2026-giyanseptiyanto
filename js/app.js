// =============================================================
// Life Dashboard — Main Script
// app.js (only JavaScript file in this project)
// =============================================================

// ----- Greeting Widget ---------------------------------------
// Displays current time (live), current date, and a greeting
// based on the hour. Supports a custom user name stored in
// Local Storage so the prompt only appears on the first visit.

/** Returns a greeting string based on the current hour (0–23). */
function getGreetingByHour(hour) {
  if (hour >= 5 && hour < 12)  return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
}

/**
 * Formats a Date object into a human-readable date string.
 * Example: "Thursday, October 22, 2026"
 */
function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

/**
 * Formats a Date object into HH:MM:SS (24-hour, zero-padded).
 * Example: "09:05:03"
 */
function formatTime(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** Updates the greeting, time, and date elements with fresh values. */
function updateClock() {
  const now  = new Date();
  const hour = now.getHours();
  const name = localStorage.getItem('userName');

  // Build greeting: include name only when one is saved
  const base    = getGreetingByHour(hour);
  const greeting = name ? `${base}, ${name}!` : `${base}!`;

  document.getElementById('greeting').textContent     = greeting;
  document.getElementById('current-time').textContent = formatTime(now);
  document.getElementById('current-date').textContent = formatDate(now);
}

/**
 * Shows the initial name prompt on the very first visit.
 * Marks the prompt as handled in Local Storage BEFORE the dialog
 * opens, so a Cancel still prevents the prompt from reappearing.
 * Does NOT update Local Storage on Cancel — preserving any
 * previously saved name is not relevant here (there is none on a
 * first visit), but the pattern is kept consistent with editName.
 */
function initialNamePrompt() {
  // Mark as handled immediately — even if the user cancels,
  // we must not show the prompt again on the next page load.
  localStorage.setItem('namePromptHandled', 'true');

  const input = window.prompt('What\'s your name?', '');

  // Cancel → leave userName unset; greeting shows without a name
  if (input === null) return;

  const trimmed = input.trim();
  if (trimmed !== '') {
    localStorage.setItem('userName', trimmed);
  }
  // Empty string → do nothing; greeting shows without a name
}

/**
 * Called when the user clicks the ✏️ edit button.
 * Cancel here must preserve the previously saved name, so we
 * only write to Local Storage when the user confirms a value.
 */
function editName() {
  const input = window.prompt('What\'s your name?', localStorage.getItem('userName') || '');

  // Cancel → keep existing name unchanged
  if (input === null) return;

  const trimmed = input.trim();
  if (trimmed !== '') {
    localStorage.setItem('userName', trimmed);
  } else {
    // Empty submission clears the saved name
    localStorage.removeItem('userName');
  }

  updateClock();
}

/** Initialises the greeting widget. */
function initGreeting() {
  // Show the name prompt only on the very first visit
  if (localStorage.getItem('namePromptHandled') === null) {
    initialNamePrompt();
  }

  // Render once immediately, then tick every second
  updateClock();
  setInterval(updateClock, 1000);

  // Wire up the edit-name button
  document.getElementById('edit-name-btn').addEventListener('click', editName);
}

// Bootstrap the greeting widget
initGreeting();



// ----- Light / Dark Mode ------------------------------------
// Applies a data-theme attribute on <body> to switch between
// light (default) and dark themes. Persists the choice in
// Local Storage under the key "dashboardTheme".

/**
 * Applies a theme and updates the toggle button label.
 * @param {'light'|'dark'} theme
 */
function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    document.getElementById('theme-toggle').textContent    = '☀️ Light Mode';
    document.getElementById('theme-toggle').setAttribute('aria-label', 'Switch to Light Mode');
  } else {
    document.body.removeAttribute('data-theme');
    document.getElementById('theme-toggle').textContent    = '🌙 Dark Mode';
    document.getElementById('theme-toggle').setAttribute('aria-label', 'Switch to Dark Mode');
  }
}

/** Initialises the theme widget. */
function initTheme() {
  // Restore saved theme; fall back to light if nothing is stored
  const saved = localStorage.getItem('dashboardTheme') || 'light';
  applyTheme(saved);

  document.getElementById('theme-toggle').addEventListener('click', function () {
    // Determine the NEW theme (opposite of whatever is active now)
    const current = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next    = current === 'dark' ? 'light' : 'dark';

    applyTheme(next);
    localStorage.setItem('dashboardTheme', next);
  });
}

// Bootstrap the theme widget
initTheme();



// ----- Focus Timer ------------------------------------------
// 25-minute countdown with Start, Stop, and Reset.
// A guard variable (timerInterval) prevents multiple intervals
// from stacking if Start is clicked more than once.

const TIMER_DURATION = 25 * 60; // seconds

let timerInterval  = null;   // holds the active setInterval ID (null = not running)
let timeRemaining  = TIMER_DURATION;

/** Formats a total number of seconds into "MM:SS". */
function formatTimerTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Writes the current timeRemaining to the display element. */
function renderTimer() {
  document.getElementById('timer-display').textContent = formatTimerTime(timeRemaining);
}

/** Clears any running interval and updates button states. */
function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  setTimerButtonStates(false); // running = false
}

/**
 * Enables / disables buttons to reflect whether the timer is running.
 * Start is disabled while running; Stop is disabled while stopped.
 */
function setTimerButtonStates(running) {
  document.getElementById('timer-start').disabled = running;
  document.getElementById('timer-stop').disabled  = !running;
}

/** Starts the countdown. Ignored if the timer is already running. */
function startTimer() {
  // Guard: do nothing if an interval is already active
  if (timerInterval !== null) return;

  // Clear any previous completion message
  document.getElementById('timer-status').textContent = '';

  setTimerButtonStates(true); // running = true

  timerInterval = setInterval(function () {
    timeRemaining -= 1;

    // Clamp to zero so the display never goes negative
    if (timeRemaining <= 0) {
      timeRemaining = 0;
      renderTimer();
      stopTimer();
      document.getElementById('timer-status').textContent = '✅ Focus session complete!';
      return;
    }

    renderTimer();
  }, 1000);
}

/** Resets the timer to 25:00 and stops any active countdown. */
function resetTimer() {
  stopTimer();
  timeRemaining = TIMER_DURATION;
  renderTimer();
  document.getElementById('timer-status').textContent = '';
}

/** Initialises the Focus Timer widget. */
function initTimer() {
  renderTimer();
  setTimerButtonStates(false); // start enabled, stop disabled initially

  document.getElementById('timer-start').addEventListener('click', startTimer);
  document.getElementById('timer-stop').addEventListener('click', stopTimer);
  document.getElementById('timer-reset').addEventListener('click', resetTimer);
}

// Bootstrap the timer widget
initTimer();



// ----- To-Do List -------------------------------------------
// Tasks are stored as an array of objects in Local Storage:
//   { id: number, text: string, completed: boolean }
// Every mutation (add / edit / complete / delete) saves the
// entire array back to Local Storage via saveTasks().

const TASKS_KEY = 'tasks'; // Local Storage key

/** Loads the task array from Local Storage (returns [] if empty). */
function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
  } catch (_) {
    return [];
  }
}

/** Serialises the current task array to Local Storage. */
function saveTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

/**
 * Checks whether a task name already exists in the list.
 * Comparison is case-insensitive and whitespace-trimmed.
 * Pass `excludeId` when editing so the task's own name is not
 * flagged as a duplicate.
 *
 * @param {string}   text      - The candidate task name.
 * @param {Object[]} tasks     - Current task array.
 * @param {number|null} excludeId - ID of the task being edited (or null).
 * @returns {boolean}
 */
function isDuplicate(text, tasks, excludeId) {
  const normalised = text.trim().toLowerCase();
  return tasks.some(function (task) {
    return task.id !== excludeId &&
           task.text.trim().toLowerCase() === normalised;
  });
}

/**
 * Shows a feedback message below the input field.
 * Pass an empty string to clear it.
 * Add isError=true to style it as an error.
 */
function showTodoFeedback(message, isError) {
  var el = document.getElementById('todo-feedback');
  el.textContent = message;
  if (isError) {
    el.classList.add('todo-feedback--error');
  } else {
    el.classList.remove('todo-feedback--error');
  }
}

/**
 * Builds and returns a single <li> element for a task.
 * In view mode:   checkbox | text | Edit btn | Delete btn
 * In edit mode:   checkbox | input | Save btn | Cancel btn
 */
function createTaskElement(task, tasks) {
  var li = document.createElement('li');
  li.className = 'todo-item' + (task.completed ? ' todo-item--completed' : '');
  li.dataset.id = task.id;

  // --- Checkbox ---
  var checkbox = document.createElement('input');
  checkbox.type      = 'checkbox';
  checkbox.className = 'todo-item__checkbox';
  checkbox.checked   = task.completed;
  checkbox.setAttribute('aria-label', 'Mark "' + task.text + '" as ' + (task.completed ? 'incomplete' : 'complete'));

  checkbox.addEventListener('change', function () {
    task.completed = checkbox.checked;
    saveTasks(tasks);
    renderTodoList(tasks); // re-render so strikethrough updates
  });

  // --- Text span (view mode) ---
  var span = document.createElement('span');
  span.className   = 'todo-item__text';
  span.textContent = task.text;

  // --- Edit button ---
  var editBtn = document.createElement('button');
  editBtn.className = 'todo-item__btn';
  editBtn.textContent = '✏️';
  editBtn.setAttribute('aria-label', 'Edit task: ' + task.text);

  editBtn.addEventListener('click', function () {
    enterEditMode(li, task, tasks);
  });

  // --- Delete button ---
  var deleteBtn = document.createElement('button');
  deleteBtn.className = 'todo-item__btn';
  deleteBtn.textContent = '🗑️';
  deleteBtn.setAttribute('aria-label', 'Delete task: ' + task.text);

  deleteBtn.addEventListener('click', function () {
    var index = tasks.indexOf(task);
    if (index !== -1) {
      tasks.splice(index, 1);
      saveTasks(tasks);
      renderTodoList(tasks);
      showTodoFeedback('Task deleted.', false);
    }
  });

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(editBtn);
  li.appendChild(deleteBtn);

  return li;
}

/**
 * Switches a task row into inline-edit mode.
 * Replaces the text span + Edit/Delete buttons with an input
 * field + Save/Cancel buttons.
 */
function enterEditMode(li, task, tasks) {
  // Clear the row
  li.innerHTML = '';

  // Keep the checkbox
  var checkbox = document.createElement('input');
  checkbox.type      = 'checkbox';
  checkbox.className = 'todo-item__checkbox';
  checkbox.checked   = task.completed;
  checkbox.setAttribute('aria-label', 'Mark as complete');
  // checkbox is disabled during edit to keep focus on the text input
  checkbox.disabled = true;

  // Edit input — pre-filled with current task text
  var editInput = document.createElement('input');
  editInput.type      = 'text';
  editInput.className = 'todo-item__edit-input';
  editInput.value     = task.text;
  editInput.maxLength = 200;
  editInput.setAttribute('aria-label', 'Edit task text');

  // Save button
  var saveBtn = document.createElement('button');
  saveBtn.className   = 'todo-item__btn';
  saveBtn.textContent = '💾';
  saveBtn.setAttribute('aria-label', 'Save changes');

  // Cancel button
  var cancelBtn = document.createElement('button');
  cancelBtn.className   = 'todo-item__btn';
  cancelBtn.textContent = '✖️';
  cancelBtn.setAttribute('aria-label', 'Cancel edit');

  // Save logic
  function saveEdit() {
    var newText = editInput.value.trim();

    if (newText === '') {
      showTodoFeedback('Task name cannot be empty.', true);
      editInput.focus();
      return;
    }

    if (isDuplicate(newText, tasks, task.id)) {
      showTodoFeedback('"' + newText + '" already exists. Please use a different name.', true);
      editInput.focus();
      return;
    }

    task.text = newText;
    saveTasks(tasks);
    showTodoFeedback('Task updated.', false);
    renderTodoList(tasks);
  }

  saveBtn.addEventListener('click', saveEdit);

  // Save on Enter key
  editInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') {
      showTodoFeedback('', false);
      renderTodoList(tasks); // cancel — redraw without changes
    }
  });

  cancelBtn.addEventListener('click', function () {
    showTodoFeedback('', false);
    renderTodoList(tasks);
  });

  li.appendChild(checkbox);
  li.appendChild(editInput);
  li.appendChild(saveBtn);
  li.appendChild(cancelBtn);

  editInput.focus();
  editInput.select();
}

/**
 * Renders the complete task list into #todo-list.
 * Shows an empty-state message when there are no tasks.
 */
function renderTodoList(tasks) {
  var ul = document.getElementById('todo-list');
  ul.innerHTML = '';

  if (tasks.length === 0) {
    var empty = document.createElement('li');
    empty.className   = 'todo-empty';
    empty.textContent = 'No tasks yet. Add one above!';
    ul.appendChild(empty);
    return;
  }

  tasks.forEach(function (task) {
    ul.appendChild(createTaskElement(task, tasks));
  });
}

/** Initialises the To-Do List widget. */
function initTodo() {
  var tasks = loadTasks();

  renderTodoList(tasks);

  // Wire up the Add button
  document.getElementById('todo-add-btn').addEventListener('click', function () {
    addTask(tasks);
  });

  // Also allow pressing Enter in the input to add
  document.getElementById('todo-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addTask(tasks);
  });
}

/**
 * Reads the input field, validates the new task, and adds it to
 * the list if it passes all checks.
 * @param {Object[]} tasks - Live task array (mutated in place).
 */
function addTask(tasks) {
  var input   = document.getElementById('todo-input');
  var newText = input.value.trim();

  // Reject empty input
  if (newText === '') {
    showTodoFeedback('Please enter a task name.', true);
    input.focus();
    return;
  }

  // Reject duplicate (case-insensitive)
  if (isDuplicate(newText, tasks, null)) {
    showTodoFeedback('"' + newText + '" is already on your list.', true);
    input.focus();
    return;
  }

  // Create new task object
  var newTask = {
    id:        Date.now(),   // simple unique ID
    text:      newText,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks(tasks);
  renderTodoList(tasks);

  // Clear input and feedback
  input.value = '';
  showTodoFeedback('', false);
  input.focus();
}

// Bootstrap the To-Do List widget
initTodo();



// ----- Quick Links ------------------------------------------
// Links are stored as an array of objects in Local Storage:
//   { id: number, name: string, url: string }
// Every addition and deletion saves the array immediately.

const LINKS_KEY = 'quickLinks'; // Local Storage key

/** Loads the links array from Local Storage (returns [] if empty). */
function loadLinks() {
  try {
    return JSON.parse(localStorage.getItem(LINKS_KEY)) || [];
  } catch (_) {
    return [];
  }
}

/** Serialises the links array to Local Storage. */
function saveLinks(links) {
  localStorage.setItem(LINKS_KEY, JSON.stringify(links));
}

/**
 * Validates a URL string.
 * - Must be parseable by the URL constructor.
 * - Protocol must be exactly "http:" or "https:".
 * Returns true if safe, false otherwise.
 */
function isValidUrl(value) {
  var trimmed = value.trim();
  try {
    var parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

/**
 * Shows a feedback message in the Quick Links section.
 * Pass isError=true for error styling.
 */
function showLinksFeedback(message, isError) {
  var el = document.getElementById('links-feedback');
  el.textContent = message;
  if (isError) {
    el.classList.add('links-feedback--error');
  } else {
    el.classList.remove('links-feedback--error');
  }
}

/**
 * Builds and returns a single <li> pill element for one link.
 * Structure: [🔗 Name ×]
 */
function createLinkElement(link, links) {
  var li = document.createElement('li');
  li.className = 'links-item';

  // Clickable anchor — opens in a new tab
  var anchor = document.createElement('a');
  anchor.className  = 'links-item__anchor';
  anchor.textContent = '🔗 ' + link.name;
  anchor.href        = link.url;
  anchor.target      = '_blank';
  anchor.rel         = 'noopener noreferrer'; // security best practice
  anchor.setAttribute('aria-label', 'Open ' + link.name + ' in a new tab');

  // Delete button
  var deleteBtn = document.createElement('button');
  deleteBtn.className   = 'links-item__delete';
  deleteBtn.textContent = '✕';
  deleteBtn.setAttribute('aria-label', 'Remove ' + link.name);

  deleteBtn.addEventListener('click', function () {
    var index = links.indexOf(link);
    if (index !== -1) {
      links.splice(index, 1);
      saveLinks(links);
      renderLinksList(links);
      showLinksFeedback('Link removed.', false);
    }
  });

  li.appendChild(anchor);
  li.appendChild(deleteBtn);

  return li;
}

/**
 * Renders the full links list into #links-list.
 * Shows an empty-state message when there are no links.
 */
function renderLinksList(links) {
  var ul = document.getElementById('links-list');
  ul.innerHTML = '';

  if (links.length === 0) {
    var empty = document.createElement('li');
    empty.className   = 'links-empty';
    empty.textContent = 'No links saved yet. Add one above!';
    ul.appendChild(empty);
    return;
  }

  links.forEach(function (link) {
    ul.appendChild(createLinkElement(link, links));
  });
}

/**
 * Reads the name and URL inputs, validates them, and adds a new
 * link if all checks pass.
 * @param {Object[]} links - Live links array (mutated in place).
 */
function addLink(links) {
  var nameInput = document.getElementById('link-name-input');
  var urlInput  = document.getElementById('link-url-input');

  var name = nameInput.value.trim();
  var url  = urlInput.value.trim();

  // Reject empty name
  if (name === '') {
    showLinksFeedback('Please enter a name for the link.', true);
    nameInput.focus();
    return;
  }

  // Reject empty URL
  if (url === '') {
    showLinksFeedback('Please enter a URL.', true);
    urlInput.focus();
    return;
  }

  // Reject invalid or unsafe URLs
  if (!isValidUrl(url)) {
    showLinksFeedback('Please enter a valid URL starting with https:// or http://', true);
    urlInput.focus();
    return;
  }

  // Build the link object using the parsed URL so it is always
  // stored in a normalised form (e.g. trailing slash added by URL()).
  var newLink = {
    id:   Date.now(),
    name: name,
    url:  new URL(url).href,
  };

  links.push(newLink);
  saveLinks(links);
  renderLinksList(links);

  // Clear inputs and feedback
  nameInput.value = '';
  urlInput.value  = '';
  showLinksFeedback('', false);
  nameInput.focus();
}

/** Initialises the Quick Links widget. */
function initLinks() {
  var links = loadLinks();

  renderLinksList(links);

  // Wire up the Add button
  document.getElementById('link-add-btn').addEventListener('click', function () {
    addLink(links);
  });

  // Allow pressing Enter in either input to trigger Add
  document.getElementById('link-name-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addLink(links);
  });
  document.getElementById('link-url-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addLink(links);
  });
}

// Bootstrap the Quick Links widget
initLinks();

