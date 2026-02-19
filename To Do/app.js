// =============================
// DOM ELEMENTS
// =============================
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const darkModeBtn = document.getElementById("darkModeBtn");
const filterButtons = document.querySelectorAll(".filters button");

// =============================
// STATE
// =============================
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

// =============================
// SAVE TO LOCALSTORAGE
// =============================
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// =============================
// RENDER TASKS
// =============================
function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    if (currentFilter === "active" && task.completed) return;
    if (currentFilter === "completed" && !task.completed) return;

    const li = document.createElement("li");
    li.className = "task-item";
    li.draggable = true;
    li.dataset.index = index;

    if (task.completed) {
      li.classList.add("completed");
    }

    li.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""}>
      <span class="task-text">${task.text}</span>
      <button class="delete-btn">Delete</button>
    `;

    taskList.appendChild(li);

    // Animation
    setTimeout(() => li.classList.add("show"), 10);
  });

  saveTasks();
}

// =============================
// ADD TASK
// =============================
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({
    text: text,
    completed: false,
  });

  taskInput.value = "";
  renderTasks();
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});

// =============================
// TASK ACTIONS (EVENT DELEGATION)
// =============================
taskList.addEventListener("click", (e) => {
  const li = e.target.closest(".task-item");
  if (!li) return;

  const index = li.dataset.index;

  // Delete
  if (e.target.classList.contains("delete-btn")) {
    li.classList.remove("show");
    setTimeout(() => {
      tasks.splice(index, 1);
      renderTasks();
    }, 300);
  }

  // Toggle Complete
  if (e.target.type === "checkbox") {
    tasks[index].completed = e.target.checked;
    renderTasks();
  }
});

// =============================
// INLINE EDIT (DOUBLE CLICK)
// =============================
taskList.addEventListener("dblclick", (e) => {
  if (!e.target.classList.contains("task-text")) return;

  const li = e.target.closest(".task-item");
  const index = li.dataset.index;

  const newText = prompt("Edit your task:", tasks[index].text);
  if (newText && newText.trim() !== "") {
    tasks[index].text = newText.trim();
    renderTasks();
  }
});

// =============================
// FILTERS
// =============================
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// =============================
// DARK MODE
// =============================
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

darkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark")
  );
});

// =============================
// DRAG & DROP
// =============================
taskList.addEventListener("dragstart", (e) => {
  if (!e.target.classList.contains("task-item")) return;
  e.target.classList.add("dragging");
});

taskList.addEventListener("dragend", (e) => {
  if (!e.target.classList.contains("task-item")) return;
  e.target.classList.remove("dragging");

  // Update array order
  const newTasks = [];
  const items = taskList.querySelectorAll(".task-item");

  items.forEach((item) => {
    const text = item.querySelector(".task-text").textContent;
    const task = tasks.find((t) => t.text === text);
    if (task) newTasks.push(task);
  });

  tasks = newTasks;
  saveTasks();
  renderTasks();
});

taskList.addEventListener("dragover", (e) => {
  e.preventDefault();
  const dragging = document.querySelector(".dragging");
  const afterElement = getDragAfterElement(taskList, e.clientY);

  if (afterElement == null) {
    taskList.appendChild(dragging);
  } else {
    taskList.insertBefore(dragging, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".task-item:not(.dragging)")
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - (box.top + box.height / 2);

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

// =============================
// INITIAL LOAD
// =============================
renderTasks();
