class Task {
  constructor(name, completed = false) {
    this.id = this.generateUniqueId();
    this.name = name;
    this.completed = completed;
  }

  generateUniqueId() {
    return "_" + Math.random().toString(36).substr(2, 9);
  }
}

class TaskManager {
  constructor() {
    this.listInput = document.getElementById("listInput");
    this.addListButton = document.getElementById("addListButton");
    this.listsArea = document.querySelector(".listsArea");
    this.lists = JSON.parse(localStorage.getItem("lists")) || {};

    this.init();
  }

  init() {
    this.addListButton.addEventListener("click", () => this.addList());
    this.listInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") this.addList();
    });

    this.loadLists();
  }

  addList() {
    const listName = this.listInput.value.trim();
    if (!listName || this.lists[listName]) return;

    this.lists[listName] = []; // רשימת משימות חדשה
    this.saveToLocalStorage("lists", this.lists);
    this.renderList(listName);
    this.listInput.value = "";
  }

  renderList(listName) {
    const listDiv = document.createElement("div");
    listDiv.classList.add("list");
    listDiv.innerHTML = `<h2>${listName}</h2><div class="tasks"></div>`;

    this.addTaskInput(listDiv, listName);
    this.addDeleteListButton(listDiv, listName);

    this.listsArea.appendChild(listDiv);

    // Render tasks for this list
    this.lists[listName].forEach((task) =>
      this.renderTask(listDiv.querySelector(".tasks"), task, listName)
    );
  }

  addTaskInput(listDiv, listName) {
    const inputContainer = document.createElement("div");
    inputContainer.classList.add("task-input-container");

    const taskInput = document.createElement("input");
    taskInput.type = "text";
    taskInput.placeholder = "הוסף משימה";
    taskInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") this.addTask(taskInput, listDiv, listName);
    });

    const taskButton = document.createElement("button");
    taskButton.textContent = "הוסף משימה";
    taskButton.onclick = () => this.addTask(taskInput, listDiv, listName);

    inputContainer.appendChild(taskInput);
    inputContainer.appendChild(taskButton);
    listDiv.appendChild(inputContainer);
  }

  addDeleteListButton(listDiv, listName) {
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "X";
    deleteButton.classList.add("delete-button");
    deleteButton.onclick = () => this.deleteList(listDiv, listName);
    listDiv.appendChild(deleteButton);
  }

  addTask(taskInput, listDiv, listName) {
    const taskName = taskInput.value.trim();
    if (!taskName) return;

    const task = new Task(taskName); // יצירת משימה חדשה באמצעות מחלקת Task
    this.lists[listName].push(task);
    this.saveToLocalStorage("lists", this.lists);
    this.renderTask(listDiv.querySelector(".tasks"), task, listName);
    taskInput.value = "";
  }

  renderTask(tasksContainer, task, listName) {
    const taskDiv = document.createElement("div");
    taskDiv.classList.add("task-row");

    const taskContent = document.createElement("div");
    taskContent.classList.add("task-content");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.onchange = () => {
      task.completed = checkbox.checked;
      this.saveToLocalStorage("lists", this.lists);
    };

    const label = document.createElement("label");
    label.textContent = task.name;

    taskContent.appendChild(checkbox);
    taskContent.appendChild(label);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "X";
    deleteButton.classList.add("delete-button");
    deleteButton.onclick = () => this.deleteTask(taskDiv, task.id, listName);

    taskDiv.appendChild(taskContent);
    taskDiv.appendChild(deleteButton);
    tasksContainer.appendChild(taskDiv);
  }

  deleteList(listDiv, listName) {
    delete this.lists[listName];
    this.saveToLocalStorage("lists", this.lists);
    listDiv.remove();
  }

  deleteTask(taskDiv, taskId, listName) {
    this.lists[listName] = this.lists[listName].filter((task) => task.id !== taskId);
    this.saveToLocalStorage("lists", this.lists);
    taskDiv.remove();
  }

  loadLists() {
    Object.keys(this.lists).forEach((listName) => this.renderList(listName));
  }

  saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

document.addEventListener("DOMContentLoaded", () => new TaskManager());
