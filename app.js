const STORAGE_KEY = "little-todo.tasks";

const seedTasks = [
  {
    id: crypto.randomUUID(),
    title: "Sketch the next version",
    group: "This week",
    due: "",
    priority: "normal",
    done: false
  },
  {
    id: crypto.randomUUID(),
    title: "Pick a color palette",
    group: "This week",
    due: "",
    priority: "high",
    done: false
  },
  {
    id: crypto.randomUUID(),
    title: "Add a tiny animation",
    group: "This week",
    due: "",
    priority: "normal",
    done: false
  },
  {
    id: crypto.randomUUID(),
    title: "Share the published link",
    group: "Errands",
    due: "",
    priority: "normal",
    done: false
  },
  {
    id: crypto.randomUUID(),
    title: "Try the mobile layout",
    group: "Later",
    due: "",
    priority: "low",
    done: false
  },
  {
    id: crypto.randomUUID(),
    title: "Decide what to redesign first",
    group: "Later",
    due: "",
    priority: "low",
    done: false
  }
];

const state = {
  filter: "all",
  tasks: loadTasks()
};

const els = {
  form: document.querySelector("#taskForm"),
  input: document.querySelector("#taskInput"),
  list: document.querySelector("#taskList"),
  due: document.querySelector("#taskDue"),
  tasks: document.querySelector("#tasks"),
  template: document.querySelector("#taskTemplate"),
  empty: document.querySelector("#emptyState"),
  filters: document.querySelectorAll(".filter"),
  viewTitle: document.querySelector("#viewTitle"),
  openCount: document.querySelector("#openCount"),
  doneCount: document.querySelector("#doneCount"),
  clearDone: document.querySelector("#clearDone")
};

els.form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = els.input.value.trim();
  if (!title) return;

  state.tasks.unshift({
    id: crypto.randomUUID(),
    title,
    group: els.list.value,
    due: els.due.value,
    priority: new FormData(els.form).get("priority"),
    done: false
  });

  els.form.reset();
  els.form.querySelector('input[value="normal"]').checked = true;
  els.input.focus();
  persist();
  render();
});

els.filters.forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    render();
  });
});

els.clearDone.addEventListener("click", () => {
  state.tasks = state.tasks.filter((task) => !task.done);
  persist();
  render();
});

function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return seedTasks;

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : seedTasks;
  } catch {
    return seedTasks;
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

function render() {
  const visibleTasks = getVisibleTasks();
  const completed = state.tasks.filter((task) => task.done).length;

  els.openCount.textContent = state.tasks.length - completed;
  els.doneCount.textContent = completed;
  els.viewTitle.textContent = getViewTitle();

  els.filters.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === state.filter);
  });

  els.tasks.replaceChildren();
  els.empty.classList.toggle("is-visible", visibleTasks.length === 0);

  visibleTasks.forEach((task) => {
    const node = els.template.content.firstElementChild.cloneNode(true);
    const checkbox = node.querySelector(".task-check");
    const name = node.querySelector(".task-name");
    const group = node.querySelector(".task-group");
    const due = node.querySelector(".task-due");
    const priority = node.querySelector(".task-priority");
    const deleteButton = node.querySelector(".delete-button");

    node.dataset.priority = task.priority;
    node.classList.toggle("is-done", task.done);

    checkbox.checked = task.done;
    name.value = task.title;
    group.textContent = task.group;
    due.textContent = task.due ? `Due ${formatDate(task.due)}` : "No due date";
    priority.textContent = `${task.priority} priority`;

    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      persist();
      render();
    });

    name.addEventListener("change", () => {
      task.title = name.value.trim() || task.title;
      persist();
      render();
    });

    deleteButton.addEventListener("click", () => {
      state.tasks = state.tasks.filter((item) => item.id !== task.id);
      persist();
      render();
    });

    els.tasks.append(node);
  });
}

function getVisibleTasks() {
  const priorityWeight = { high: 0, normal: 1, low: 2 };

  return state.tasks
    .filter((task) => {
      if (state.filter === "open") return !task.done;
      if (state.filter === "done") return task.done;
      if (state.filter === "high") return task.priority === "high";
      return true;
    })
    .sort((a, b) => {
      if (a.done !== b.done) return Number(a.done) - Number(b.done);
      return priorityWeight[a.priority] - priorityWeight[b.priority];
    });
}

function getViewTitle() {
  const labels = {
    all: "All tasks",
    open: "Open tasks",
    done: "Done tasks",
    high: "High priority"
  };

  return labels[state.filter];
}

function formatDate(value) {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric"
  }).format(date);
}

render();
