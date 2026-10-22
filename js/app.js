/* ======================================
   To-Do List Life Dashboard - JavaScript
   ====================================== */

"use strict";

const STORAGE_KEYS = Object.freeze({
  namePromptHandled: "namePromptHandled",
  userName: "userName",
  theme: "dashboardTheme",
  tasks: "tasks",
  quickLinks: "quickLinks",
});

const TIMER_DURATION_SECONDS = 25 * 60;

const getElement = (id) => document.getElementById(id);

const elements = {
  greeting: getElement("greeting"),
  currentTime: getElement("current-time"),
  currentDate: getElement("current-date"),
  editNameButton: getElement("edit-name-btn"),
  themeToggle: getElement("theme-toggle"),
  timerDisplay: getElement("timer-display"),
  timerStatus: getElement("timer-status"),
  timerStart: getElement("timer-start"),
  timerStop: getElement("timer-stop"),
  timerReset: getElement("timer-reset"),
  todoInput: getElement("todo-input"),
  todoAddButton: getElement("todo-add-btn"),
  todoFeedback: getElement("todo-feedback"),
  todoList: getElement("todo-list"),
  linkNameInput: getElement("link-name-input"),
  linkUrlInput: getElement("link-url-input"),
  linkAddButton: getElement("link-add-btn"),
  linksFeedback: getElement("links-feedback"),
  linksList: getElement("links-list"),
};

/* Shared helpers */
function readStoredArray(key, isValidItem) {
  try {
    const storedValue = JSON.parse(localStorage.getItem(key) || "[]");

    if (!Array.isArray(storedValue)) {
      return [];
    }

    return storedValue.filter(isValidItem);
  } catch {
    return [];
  }
}

function showFeedback(element, errorClass, message, isError = false) {
  element.textContent = message;
  element.classList.toggle(errorClass, isError);
}

function createUniqueId(items) {
  let id = Date.now();

  while (items.some((item) => item.id === id)) {
    id += 1;
  }

  return id;
}

function createButton(text, accessibleName, onClick, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = text;
  button.setAttribute("aria-label", accessibleName);
  button.addEventListener("click", onClick);
  return button;
}

/* Greeting and custom name */
function getGreetingByHour(hour) {
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 21) return "Good Evening";
  return "Good Night";
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatClockTime(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function updateClock() {
  const now = new Date();
  const savedName = localStorage.getItem(STORAGE_KEYS.userName);
  const greeting = getGreetingByHour(now.getHours());

  elements.greeting.textContent = savedName ? `${greeting}, ${savedName}!` : `${greeting}!`;
  elements.currentTime.textContent = formatClockTime(now);
  elements.currentDate.textContent = formatDate(now);
}

function showInitialNamePrompt() {
  localStorage.setItem(STORAGE_KEYS.namePromptHandled, "true");

  const input = window.prompt("What's your name?", "");

  if (input === null) {
    return;
  }

  const name = input.trim();
  if (name) {
    localStorage.setItem(STORAGE_KEYS.userName, name);
  }
}

function editName() {
  const currentName = localStorage.getItem(STORAGE_KEYS.userName) || "";
  const input = window.prompt("What's your name?", currentName);

  if (input === null) {
    return;
  }

  const name = input.trim();
  if (name) {
    localStorage.setItem(STORAGE_KEYS.userName, name);
  } else {
    localStorage.removeItem(STORAGE_KEYS.userName);
  }

  updateClock();
}

function initGreeting() {
  if (localStorage.getItem(STORAGE_KEYS.namePromptHandled) === null) {
    showInitialNamePrompt();
  }

  updateClock();
  window.setInterval(updateClock, 1000);
  elements.editNameButton.addEventListener("click", editName);
}

/* Light and dark themes */
function applyTheme(theme) {
  const isDark = theme === "dark";

  if (isDark) {
    document.body.dataset.theme = "dark";
  } else {
    delete document.body.dataset.theme;
  }

  elements.themeToggle.textContent = isDark ? "🌞 Light Mode" : "🌚 Dark Mode";
  elements.themeToggle.setAttribute("aria-label", isDark ? "Switch to Light Mode" : "Switch to Dark Mode");
}

function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  applyTheme(savedTheme === "dark" ? "dark" : "light");

  elements.themeToggle.addEventListener("click", () => {
    const currentTheme = document.body.dataset.theme === "dark" ? "dark" : "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
    applyTheme(nextTheme);
  });
}

/* Focus Timer */
let timerInterval = null;
let timeRemaining = TIMER_DURATION_SECONDS;

function formatTimerTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function renderTimer() {
  elements.timerDisplay.textContent = formatTimerTime(timeRemaining);
}

function updateTimerButtons() {
  const isRunning = timerInterval !== null;
  const isComplete = timeRemaining === 0;

  elements.timerStart.disabled = isRunning || isComplete;
  elements.timerStop.disabled = !isRunning;
}

function stopTimer() {
  if (timerInterval !== null) {
    window.clearInterval(timerInterval);
    timerInterval = null;
  }

  updateTimerButtons();
}

function startTimer() {
  if (timerInterval !== null || timeRemaining === 0) {
    return;
  }

  elements.timerStatus.textContent = "";
  updateTimerButtons();

  timerInterval = window.setInterval(() => {
    timeRemaining = Math.max(0, timeRemaining - 1);
    renderTimer();

    if (timeRemaining === 0) {
      stopTimer();
      elements.timerStatus.textContent = "✅ Focus session complete!";
      return;
    }

    updateTimerButtons();
  }, 1000);

  updateTimerButtons();
}

function resetTimer() {
  stopTimer();
  timeRemaining = TIMER_DURATION_SECONDS;
  elements.timerStatus.textContent = "";
  renderTimer();
  updateTimerButtons();
}

function initTimer() {
  renderTimer();
  updateTimerButtons();

  elements.timerStart.addEventListener("click", startTimer);
  elements.timerStop.addEventListener("click", stopTimer);
  elements.timerReset.addEventListener("click", resetTimer);
}

/* To-Do List */
function isValidTask(task) {
  return task !== null && typeof task === "object" && Number.isFinite(task.id) && typeof task.text === "string" && typeof task.completed === "boolean";
}

function loadTasks() {
  return readStoredArray(STORAGE_KEYS.tasks, isValidTask);
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
}

function isDuplicateTask(candidate, tasks, excludedId = null) {
  const normalizedCandidate = candidate.trim().toLowerCase();

  return tasks.some((task) => {
    const isOtherTask = task.id !== excludedId;
    const normalizedTask = task.text.trim().toLowerCase();

    return isOtherTask && normalizedTask === normalizedCandidate;
  });
}

function showTodoFeedback(message, isError = false) {
  showFeedback(elements.todoFeedback, "todo-feedback-error", message, isError);
}

function createTaskElement(task, tasks) {
  const item = document.createElement("li");
  item.className = `todo-item${task.completed ? " todo-item-completed" : ""}`;
  item.dataset.id = String(task.id);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-item_checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", `Mark "${task.text}" as ${task.completed ? "incomplete" : "complete"}`);
  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked;
    saveTasks(tasks);
    renderTodoList(tasks);
    showTodoFeedback(task.completed ? "Task marked complete." : "Task marked incomplete.");
  });

  const taskText = document.createElement("span");
  taskText.className = "todo-item_text";
  taskText.textContent = task.text;

  const editButton = createButton("✏️", `Edit task: ${task.text}`, () => enterEditMode(item, task, tasks), "todo-item_btn");

  const deleteButton = createButton(
    "🗑️",
    `Delete task: ${task.text}`,
    () => {
      const taskIndex = tasks.indexOf(task);
      if (taskIndex === -1) return;

      tasks.splice(taskIndex, 1);
      saveTasks(tasks);
      renderTodoList(tasks);
      showTodoFeedback("Task deleted.");
    },
    "todo-item_btn",
  );

  item.append(checkbox, taskText, editButton, deleteButton);
  return item;
}

function enterEditMode(item, task, tasks) {
  item.replaceChildren();

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-item_checkbox";
  checkbox.checked = task.completed;
  checkbox.disabled = true;
  checkbox.setAttribute("aria-label", "Task completion status");

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "todo-item_edit-input";
  editInput.value = task.text;
  editInput.maxLength = 200;
  editInput.setAttribute("aria-label", "Edit task text");

  function saveEdit() {
    const newText = editInput.value.trim();

    if (!newText) {
      showTodoFeedback("Task name cannot be empty.", true);
      editInput.focus();
      return;
    }

    if (isDuplicateTask(newText, tasks, task.id)) {
      showTodoFeedback(`"${newText}" already exists. Please use a different name.`, true);
      editInput.focus();
      return;
    }

    task.text = newText;
    saveTasks(tasks);
    renderTodoList(tasks);
    showTodoFeedback("Task updated.");
  }

  const saveButton = createButton("💾", "Save changes", saveEdit, "todo-item_btn");

  const cancelEdit = () => {
    renderTodoList(tasks);
    showTodoFeedback("Edit cancelled.");
  };

  const cancelButton = createButton("✖️", "Cancel edit", cancelEdit, "todo-item_btn");

  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveEdit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
    }
  });

  item.append(checkbox, editInput, saveButton, cancelButton);
  editInput.focus();
  editInput.select();
}

function renderTodoList(tasks) {
  elements.todoList.replaceChildren();

  if (tasks.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.className = "todo-empty";
    emptyState.textContent = "No tasks yet. Add one above!";
    elements.todoList.appendChild(emptyState);
    return;
  }

  tasks.forEach((task) => {
    elements.todoList.appendChild(createTaskElement(task, tasks));
  });
}

function addTask(tasks) {
  const taskInput = elements.todoInput;
  const text = taskInput.value.trim();

  if (!text) {
    showTodoFeedback("Please enter a task name.", true);
    taskInput.focus();
    return;
  }

  if (isDuplicateTask(text, tasks)) {
    showTodoFeedback(`"${text}" is already on your list.`, true);
    taskInput.focus();
    return;
  }

  tasks.push({
    id: createUniqueId(tasks),
    text,
    completed: false,
  });

  saveTasks(tasks);
  renderTodoList(tasks);
  taskInput.value = "";
  showTodoFeedback("Task added.");
  taskInput.focus();
}

function initTodo() {
  const tasks = loadTasks();
  renderTodoList(tasks);

  elements.todoAddButton.addEventListener("click", () => addTask(tasks));
  elements.todoInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTask(tasks);
    }
  });
}

/* Quick Links */
function getSafeHttpUrl(value) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function isValidLink(link) {
  return link !== null && typeof link === "object" && Number.isFinite(link.id) && typeof link.name === "string" && typeof link.url === "string" && getSafeHttpUrl(link.url) !== null;
}

function loadLinks() {
  return readStoredArray(STORAGE_KEYS.quickLinks, isValidLink);
}

function saveLinks(links) {
  localStorage.setItem(STORAGE_KEYS.quickLinks, JSON.stringify(links));
}

function showLinksFeedback(message, isError = false) {
  showFeedback(elements.linksFeedback, "links-feedback-error", message, isError);
}

function createLinkElement(link, links) {
  const item = document.createElement("li");
  item.className = "links-item";

  const anchor = document.createElement("a");
  anchor.className = "links-item_anchor";
  anchor.textContent = `🔗 ${link.name}`;
  anchor.href = getSafeHttpUrl(link.url);
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.setAttribute("aria-label", `Open ${link.name} in a new tab`);

  const deleteButton = createButton(
    "✕",
    `Remove ${link.name}`,
    () => {
      const linkIndex = links.indexOf(link);
      if (linkIndex === -1) return;

      links.splice(linkIndex, 1);
      saveLinks(links);
      renderLinksList(links);
      showLinksFeedback("Link removed.");
    },
    "links-item_delete",
  );

  item.append(anchor, deleteButton);
  return item;
}

function renderLinksList(links) {
  elements.linksList.replaceChildren();

  if (links.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.className = "links-empty";
    emptyState.textContent = "No links saved yet. Add one above!";
    elements.linksList.appendChild(emptyState);
    return;
  }

  links.forEach((link) => {
    elements.linksList.appendChild(createLinkElement(link, links));
  });
}

function addLink(links) {
  const name = elements.linkNameInput.value.trim();
  const url = elements.linkUrlInput.value.trim();

  if (!name) {
    showLinksFeedback("Please enter a name for the link.", true);
    elements.linkNameInput.focus();
    return;
  }

  if (!url) {
    showLinksFeedback("Please enter a URL.", true);
    elements.linkUrlInput.focus();
    return;
  }

  const safeUrl = getSafeHttpUrl(url);
  if (!safeUrl) {
    showLinksFeedback("Please enter a valid URL starting with https:// or http://.", true);
    elements.linkUrlInput.focus();
    return;
  }

  links.push({
    id: createUniqueId(links),
    name,
    url: safeUrl,
  });

  saveLinks(links);
  renderLinksList(links);
  elements.linkNameInput.value = "";
  elements.linkUrlInput.value = "";
  showLinksFeedback("Link added.");
  elements.linkNameInput.focus();
}

function initLinks() {
  const links = loadLinks();
  renderLinksList(links);

  elements.linkAddButton.addEventListener("click", () => addLink(links));

  [elements.linkNameInput, elements.linkUrlInput].forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addLink(links);
      }
    });
  });
}

function initDashboard() {
  initTheme();
  initGreeting();
  initTimer();
  initTodo();
  initLinks();
}

initDashboard();
