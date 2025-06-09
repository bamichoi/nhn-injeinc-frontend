import { FilterType, Todo } from "types";
import { dragAndDropManager } from "./dragAndDropManager";
import "./style.css";
import { todoManager } from "./todoManager";
import { createElement, getClosetElement } from "./utils";

const IDS = {
  TODO_INPUT: "todo-input",
  ADD_BUTTON: "add-button",
  TODO_LIST: "todo-list",
  FILTERS: "filters",
  ALL_FILTER: "all-filter",
  TODO_FILTER: "todo-filter",
  DONE_FILTER: "done-filter",
  CLEANUP_DONE_BUTTON: "cleanup-done-button",
} as const;

const CLASSNAMES = {
  FILTER_BUTTON: "todo-app__filter-button",
  FILTER_BUTTON_ACTIVE: "todo-app__filter-button--active",
  ALL_TODOS_COUNT: "todo-app__all-todos-count",
  TODOS_COUNT: "todo-app__todos-count",
  DONE_TODOS_COUNT: "todo-app__done-todos-count",
  TODO_ITEM: "todo-item",
  TODO_ITEM_DELETE_BUTTON: "todo-item__delete-button",
  TODO_ITEM_TEXT: "todo-item__text",
  TODO_ITEM_CHECKBOX: "todo-item__checkbox",
  TODO_ITEM_CONTENT: "todo-item__content",
} as const;

const input = document.getElementById(IDS.TODO_INPUT) as HTMLInputElement;
const addButton = document.getElementById(IDS.ADD_BUTTON) as HTMLButtonElement;
const todoList = document.getElementById(IDS.TODO_LIST) as HTMLUListElement;
const filters = document.getElementById(IDS.FILTERS) as HTMLDivElement;
const filterButtons = document.querySelectorAll<HTMLButtonElement>(
  `.${CLASSNAMES.FILTER_BUTTON}`
);
const allFilterButton = document.getElementById(
  IDS.ALL_FILTER
) as HTMLButtonElement;
const todoFilterButton = document.getElementById(
  IDS.TODO_FILTER
) as HTMLButtonElement;
const doneFilterButton = document.getElementById(
  IDS.DONE_FILTER
) as HTMLButtonElement;
const cleanupDoneButton = document.getElementById(
  IDS.CLEANUP_DONE_BUTTON
) as HTMLButtonElement;
const allTodosCountSpan = allFilterButton.querySelector(
  `.${CLASSNAMES.ALL_TODOS_COUNT}`
) as HTMLSpanElement;
const todosCountSpan = todoFilterButton.querySelector(
  `.${CLASSNAMES.TODOS_COUNT}`
) as HTMLSpanElement;
const doneTodosCountSpans = document.querySelectorAll<HTMLSpanElement>(
  `.${CLASSNAMES.DONE_TODOS_COUNT}`
);

const {
  addTodo,
  deleteTodo,
  deleteAllDoneTodos,
  toggleDone,
  getCurrentTodos,
  getAllTodosCount,
  getTodoCount,
  getDoneTodosCount,
  getCurrentFilter,
  setFilter,
  changeTodosOrder,
} = todoManager();

const { handleDragStart } = dragAndDropManager({
  itemList: todoList as HTMLUListElement,
  onOrderChange: changeTodosOrder,
});

const isCurrentFilterEmpty = () => {
  const currentFilter = getCurrentFilter();
  if (currentFilter === "todo" && getTodoCount() === 0) return true;
  if (currentFilter === "done" && getDoneTodosCount() === 0) return true;
  return false;
};

const changeFilter = (filter: FilterType) => {
  setFilter(filter);
  filterButtons.forEach((button) => {
    if (button.dataset.filter === filter) {
      button.classList.add(CLASSNAMES.FILTER_BUTTON_ACTIVE);
      button.setAttribute("aria-selected", "true");
    } else {
      button.classList.remove(CLASSNAMES.FILTER_BUTTON_ACTIVE);
      button.setAttribute("aria-selected", "false");
    }
  });
};

const disabledButtons = () => {
  const todoCount = getTodoCount();
  const doneCount = getDoneTodosCount();

  todoFilterButton.disabled = todoCount === 0;
  doneFilterButton.disabled = doneCount === 0;
  cleanupDoneButton.disabled = doneCount === 0;
};

const renderCounts = () => {
  const allCount = getAllTodosCount();
  const todoCount = getTodoCount();
  const doneCount = getDoneTodosCount();

  allTodosCountSpan.textContent = `(${allCount})`;
  todosCountSpan.textContent = `(${todoCount})`;
  doneTodosCountSpans.forEach((span) => (span.textContent = `(${doneCount})`));
};

const updateControlButtonsState = () => {
  renderCounts();
  disabledButtons();
};

const handleDeleteClick = (todoId: string) => {
  deleteTodo(todoId);
  if (isCurrentFilterEmpty()) {
    changeFilter("all");
  }
  renderTodos();
  updateControlButtonsState();
};

const handleTodoToggle = (todoId: string) => {
  toggleDone(todoId);
  if (isCurrentFilterEmpty()) {
    changeFilter("all");
  }
  renderTodos();
  updateControlButtonsState();
};

const createTodoElement = (todo: Todo) => {
  const deleteButton = createElement("button", {
    text: "삭제",
    className: CLASSNAMES.TODO_ITEM_DELETE_BUTTON,
    attrs: {
      "aria-label": `${todo.text} 삭제`,
    },
    events: {
      click: () => handleDeleteClick(todo.id),
      mousedown: (event) => {
        event.stopPropagation();
      },
    },
  });

  const span = createElement("span", {
    text: todo.text,
    className: CLASSNAMES.TODO_ITEM_TEXT,
    attrs: {
      role: "button",
      "aria-label": `${todo.text} 상태 토글`,
    },
    events: {
      click: () => {
        handleTodoToggle(todo.id);
      },
      mousedown: (event) => {
        event.stopPropagation();
      },
    },
  });

  const checkbox = createElement("input", {
    className: CLASSNAMES.TODO_ITEM_CHECKBOX,
    attrs: {
      type: "checkbox",
      checked: todo.done,
      "aria-checked": todo.done,
      "aria-label": `${todo.text} 완료 여부`,
    },
    events: {
      change: () => {
        handleTodoToggle(todo.id);
      },
      mousedown: (event) => {
        event.stopPropagation();
      },
    },
  });

  const content = createElement("div", {
    className: CLASSNAMES.TODO_ITEM_CONTENT,
    children: [checkbox, span],
  });

  const li = createElement("li", {
    className: CLASSNAMES.TODO_ITEM,
    attrs: {
      "data-id": todo.id,
      "data-done": todo.done,
      "aria-label": todo.text,
      "aria-checked": todo.done,
    },
    children: [content, deleteButton],
  });

  return li;
};

const sortTodos = (todos: Todo[], currentFilter: FilterType) => {
  const sortedTodos = [...todos].sort((a, b) => {
    if (currentFilter === "all" && a.done !== b.done) {
      return Number(a.done) - Number(b.done);
    }
    return a.createdAt - b.createdAt;
  });

  return sortedTodos;
};

const renderEmpty = () => {
  const emptyElement = createElement("div", {
    className: "todo-app__empty",
    text: "할 일을 추가해주세요.",
  });

  todoList.appendChild(emptyElement);
};

const renderTodos = () => {
  todoList.innerHTML = "";

  const currentTodos = getCurrentTodos();
  const currentFilter = getCurrentFilter();

  if (currentFilter === "all" && currentTodos.length === 0) {
    renderEmpty();
    return;
  }

  const sortedTodos = sortTodos(currentTodos, currentFilter);

  sortedTodos.forEach((todo) => {
    const li = createTodoElement(todo);

    todoList.appendChild(li);
  });
};

const handleAddTodo = () => {
  const text = input.value.trim();

  if (text === "") return;

  addTodo(text);
  renderTodos();
  updateControlButtonsState();
  input.value = "";
};

const handleAddClick = (event: MouseEvent) => {
  if (event.button !== 0) return;

  handleAddTodo();
};

const handleAddKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.isComposing) {
    handleAddTodo();
  }
};

const activeFilterButton = (button: HTMLButtonElement) => {
  filterButtons.forEach((btn) => {
    btn.classList.remove(CLASSNAMES.FILTER_BUTTON_ACTIVE);
    btn.setAttribute("aria-selected", "false");
  });
  button.classList.add(CLASSNAMES.FILTER_BUTTON_ACTIVE);
  button.setAttribute("aria-selected", "true");
};

const handleFilterClick = (event: MouseEvent) => {
  const button = getClosetElement<HTMLButtonElement>(
    event,
    `.${CLASSNAMES.FILTER_BUTTON}`
  );

  if (!button || !button.dataset.filter) return;

  const filter = button.dataset.filter as FilterType;

  activeFilterButton(button);
  setFilter(filter);
  renderTodos();
};

const handleListItemMouseDown = (event: MouseEvent) => {
  if (event.button !== 0) return;

  const li = getClosetElement<HTMLLIElement>(event, "li");

  if (!li || !todoList.contains(li) || li.dataset.done === "true") return;

  handleDragStart(li, event);
};

const handleCleanupDoneClick = () => {
  deleteAllDoneTodos();
  if (isCurrentFilterEmpty()) {
    changeFilter("all");
  }
  renderTodos();
  updateControlButtonsState();
};

input.addEventListener("keydown", handleAddKeydown);

addButton.addEventListener("click", handleAddClick);

cleanupDoneButton.addEventListener("click", handleCleanupDoneClick);

filters.addEventListener("click", (event: MouseEvent) => {
  handleFilterClick(event);
});

todoList.addEventListener("mousedown", (event: MouseEvent) => {
  handleListItemMouseDown(event);
});

renderTodos();
updateControlButtonsState();
