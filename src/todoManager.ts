import { FilterType, Todo } from "types";
import { generateId } from "./utils";

export const todoManager = () => {
  let todos: Todo[] = [];

  let currentFilter: FilterType = "all";

  const todosByFilter = {
    all: () => todos,
    todo: () => todos.filter((todo) => !todo.done),
    done: () => todos.filter((todo) => todo.done),
  };

  const addTodo = (text: string) => {
    const newTodo = {
      id: generateId(),
      text,
      done: false,
      createdAt: Date.now(),
    };

    todos.push(newTodo);
  };

  const deleteTodo = (id: string) => {
    todos = todos.filter((todo) => todo.id !== id);
  };

  const toggleDone = (id: string) => {
    todos = todos.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    );
  };

  const deleteAllDoneTodos = () => {
    todos = todos.filter((todo) => !todo.done);
  };

  const setFilter = (filter: FilterType) => {
    currentFilter = filter;
  };

  const getCurrentTodos = () => {
    return todosByFilter[currentFilter]();
  };

  const getAllTodosCount = () => {
    return todos.length;
  };

  const getTodoCount = () => {
    return todos.filter((todo) => !todo.done).length;
  };

  const getDoneTodosCount = () => {
    return todos.filter((todo) => todo.done).length;
  };

  const changeTodosOrder = (items: HTMLElement[]) => {
    const newOrderedTodos = [...items]
      .map((item) => todos.find((todo) => todo.id === item.dataset.id))
      .filter((todo) => todo !== undefined);

    todos = newOrderedTodos;
  };

  const getCurrentFilter = () => currentFilter;

  return {
    addTodo,
    deleteTodo,
    toggleDone,
    deleteAllDoneTodos,
    setFilter,
    getCurrentTodos,
    getAllTodosCount,
    getTodoCount,
    getDoneTodosCount,
    changeTodosOrder,
    getCurrentFilter,
  };
};
