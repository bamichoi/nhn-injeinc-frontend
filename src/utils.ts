import { CreateElementOptions } from "./types";

export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2);

export const removeElement = (element: HTMLElement | null) => {
  if (element) {
    element.remove();
  }
};

export const removeClass = (element: HTMLElement | null, className: string) => {
  if (!element) {
    throw new Error("Cannot remove class from null or undefined element");
  }
  if (!className || typeof className !== "string") {
    throw new Error("className must be a non-empty string");
  }

  if (element.classList.contains(className)) {
    element.classList.remove(className);
  }
};

export const addClass = (element: HTMLElement | null, className: string) => {
  if (!element) {
    throw new Error("Cannot add class to null or undefined element");
  }
  if (!className || typeof className !== "string") {
    throw new Error("className must be a non-empty string");
  }

  element.classList.add(className);
};

export const createElement = (
  tag: keyof HTMLElementTagNameMap,
  {
    className = "",
    text = "",
    attrs = {},
    events = {},
    children = [],
  }: CreateElementOptions = {}
) => {
  if (!tag) {
    throw new Error("Tag name is required to create an element");
  }

  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;

  Object.entries(attrs).forEach(([attrKey, value]) => {
    if (attrKey in element) {
      (element as any)[attrKey] = value;
    } else {
      element.setAttribute(attrKey, String(value));
    }
  });

  Object.entries(events).forEach(([event, handler]) => {
    element.addEventListener(event, handler as EventListener);
  });

  children.forEach((child) => {
    element.appendChild(child);
  });

  return element;
};

export const cloneElement = <T extends HTMLElement>(
  element: T | null,
  deep = true
) => {
  if (!element) {
    throw new Error("Cannot clone null or undefined element");
  }

  return element.cloneNode(deep) as T;
};

export const getClosetElement = <T extends HTMLElement>(
  event: Event,
  selector: string
): T | null => {
  if (!(event.target instanceof HTMLElement)) return null;
  const element = event.target.closest(selector) as T | null;

  return element;
};
