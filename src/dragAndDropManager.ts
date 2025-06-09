import {
  DragAndDropParams,
  DragState,
  DropGuidelineState,
  PreviewState,
} from "types";
import {
  addClass,
  createElement,
  removeElement,
  removeClass,
  cloneElement,
} from "./utils";

export const dragAndDropManager = ({
  itemList,
  onOrderChange,
}: DragAndDropParams) => {
  const CLASSNAMES = {
    DROP_GUIDELINE: "drop-guideline",
    DRAGGED: "dragged",
    PREVIEW: "preview",
    SHOW: "show",
  } as const;

  const VALUES = {
    PREVIEW_INSERT_DELAY: 2000,
    OFFSET_TOP: 1,
    SCROLL_SPEED: 5,
    SCROLL_THRESHOLD: 50,
    MIN_DRAG_DISTANCE: 5,
  } as const;

  const dragState: DragState = {
    isDragging: false,
    selectedItem: null,
    draggingItem: null,
    selectedItemIndex: null,
    offsetX: 0,
    offsetY: 0,
    startX: 0,
    startY: 0,
  };

  const dropGuidelineState: DropGuidelineState = {
    element: null,
    insertIndex: null,
    insertReferenceItem: null,
  };

  const previewState: PreviewState = {
    element: null,
    timer: null,
    insertIndex: null,
    lastPosition: null,
  };

  const resetDragState = () => {
    dragState.isDragging = false;
    dragState.selectedItem = null;
    dragState.draggingItem = null;
    dragState.selectedItemIndex = null;
    dragState.offsetX = 0;
    dragState.offsetY = 0;
    dragState.startX = 0;
    dragState.startY = 0;
  };

  const resetDropGuidelineState = () => {
    dropGuidelineState.element = null;
    dropGuidelineState.insertIndex = null;
    dropGuidelineState.insertReferenceItem = null;
  };

  const clearPreviewTimer = () => {
    if (previewState.timer) {
      clearTimeout(previewState.timer);
      previewState.timer = null;
    }
  };

  const resetPreviewState = () => {
    previewState.element = null;
    previewState.insertIndex = null;
    previewState.lastPosition = null;
    clearPreviewTimer();
  };

  const resetState = () => {
    resetDragState();
    resetDropGuidelineState();
    resetPreviewState();
  };

  const resetDOM = () => {
    removeClass(dragState.selectedItem, CLASSNAMES.DRAGGED);
    removeElement(dragState.draggingItem);
    removeElement(dropGuidelineState.element);
    removeElement(previewState.element);
  };

  const addEventListeners = () => {
    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("keydown", handleEscKeyDown);
  };

  const removeEventListeners = () => {
    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("keydown", handleEscKeyDown);
  };

  const resetDragAndDrop = () => {
    resetDOM();
    resetState();
    removeEventListeners();
  };

  const handleEscKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      resetDragAndDrop();
    }
  };

  const getNonDraggingItems = () => {
    const items = [
      ...itemList.querySelectorAll<HTMLLIElement>(
        `li:not(.${CLASSNAMES.DRAGGED}):not(.${CLASSNAMES.PREVIEW})`
      ),
    ];

    return items;
  };

  const getInsertPosition = (insertReferenceItem: HTMLElement) => {
    const itemListRect = itemList.getBoundingClientRect();
    const insertReferenceItemRect = insertReferenceItem.getBoundingClientRect();

    return (
      insertReferenceItemRect.top -
      itemListRect.top +
      itemList.scrollTop -
      VALUES.OFFSET_TOP
    );
  };

  const getLastItemPosition = (items: HTMLLIElement[]) => {
    const itemListRect = itemList.getBoundingClientRect();
    const lastItem = items[items.length - 1];
    const lastItemRect = lastItem.getBoundingClientRect();

    return (
      lastItemRect.bottom -
      itemListRect.top +
      itemList.scrollTop +
      VALUES.OFFSET_TOP
    );
  };

  const getDropPosition = (
    insertReferenceItem: HTMLElement | null,
    items: HTMLLIElement[]
  ) => {
    if (insertReferenceItem) {
      return getInsertPosition(insertReferenceItem);
    }
    if (items.length > 0) {
      return getLastItemPosition(items);
    }
  };

  const shouldShowDropGuideline = () => {
    return (
      dropGuidelineState.insertIndex === dragState.selectedItemIndex ||
      dropGuidelineState.insertIndex === previewState.insertIndex
    );
  };

  const updateDropGuidelinePosition = (
    insertReferenceItem: HTMLElement | null,
    items: HTMLLIElement[]
  ) => {
    const dropGuideline = dropGuidelineState.element;

    if (!dropGuideline) return;
    if (shouldShowDropGuideline()) {
      removeClass(dropGuideline, CLASSNAMES.SHOW);
      return;
    }

    const newGuidelinePosition = getDropPosition(insertReferenceItem, items);

    if (newGuidelinePosition) {
      dropGuideline.style.top = newGuidelinePosition + "px";
      addClass(dropGuideline, CLASSNAMES.SHOW);
    }
  };

  const removePreview = () => {
    if (previewState.element) {
      removeElement(previewState.element);
      resetPreviewState();
    }
  };

  const createPreviewItem = () => {
    const previewItem = cloneElement(dragState.selectedItem);

    removeClass(previewItem, CLASSNAMES.DRAGGED);
    addClass(previewItem, CLASSNAMES.PREVIEW);

    return previewItem;
  };

  const insertPreview = (insertIndex: number) => {
    if (insertIndex === dragState.selectedItemIndex) return;

    removePreview();

    const items = getNonDraggingItems();
    const previewItem = createPreviewItem();

    if (insertIndex >= items.length) {
      itemList.appendChild(previewItem);
    } else {
      itemList.insertBefore(previewItem, items[insertIndex]);
    }

    previewState.element = previewItem;
    previewState.insertIndex = insertIndex;

    if (dropGuidelineState.element) {
      removeClass(dropGuidelineState.element, CLASSNAMES.SHOW);
    }
  };

  const updatePreviewTimer = (insertIndex: number) => {
    clearPreviewTimer();

    previewState.timer = setTimeout(() => {
      insertPreview(insertIndex);
    }, VALUES.PREVIEW_INSERT_DELAY);
  };

  const shouldRemovePreview = (newInsertIndex: number) => {
    const isInsertIndexChanged =
      dropGuidelineState.insertIndex !== newInsertIndex;

    return isInsertIndexChanged;
  };

  const updatePreviewPosition = (
    insertReferenceItem: HTMLElement | null,
    items: HTMLLIElement[],
    insertIndex: number
  ) => {
    if (shouldRemovePreview(insertIndex)) {
      removePreview();
      return;
    }

    const newPreviewPosition = getDropPosition(insertReferenceItem, items);

    if (
      newPreviewPosition &&
      previewState.lastPosition !== newPreviewPosition
    ) {
      updatePreviewTimer(insertIndex);
      previewState.lastPosition = newPreviewPosition;
    }
  };

  const getItemMiddlePosition = (
    item: HTMLElement,
    itemListRect: DOMRect
  ): number => {
    const itemRect = item.getBoundingClientRect();

    return (
      itemRect.top - itemListRect.top + itemList.scrollTop + itemRect.height / 2
    );
  };

  const findInsertReferenceItem = (
    items: HTMLLIElement[],
    relativeMouseY: number,
    itemListRect: DOMRect
  ) => {
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const itemMiddle = getItemMiddlePosition(item, itemListRect);

      if (relativeMouseY < itemMiddle) {
        return {
          insertIndex: index,
          insertReferenceItem: item,
        };
      }
    }

    return {
      insertIndex: items.length,
      insertReferenceItem: null,
    };
  };

  const updateDropPositions = (mouseY: number) => {
    const items = getNonDraggingItems();

    const itemListRect = itemList.getBoundingClientRect();
    const relativeMouseY = mouseY - itemListRect.top + itemList.scrollTop;

    const { insertIndex, insertReferenceItem } = findInsertReferenceItem(
      items,
      relativeMouseY,
      itemListRect
    );

    updateDropGuidelinePosition(insertReferenceItem, items);
    updatePreviewPosition(insertReferenceItem, items, insertIndex);

    dropGuidelineState.insertIndex = insertIndex;
    dropGuidelineState.insertReferenceItem = insertReferenceItem;
  };

  const createDropGuideline = () => {
    const dropGuideline = createElement("div", {
      className: CLASSNAMES.DROP_GUIDELINE,
    });
    return dropGuideline;
  };

  const getSelectedItemIndex = (selectedItem: HTMLLIElement) => {
    const items = [...itemList.querySelectorAll<HTMLLIElement>("li")];
    return items.indexOf(selectedItem);
  };

  const initializeDragState = (
    selectedItem: HTMLLIElement,
    event: MouseEvent
  ) => {
    dragState.selectedItem = selectedItem;
    dragState.startX = event.clientX;
    dragState.startY = event.clientY;
    dragState.selectedItemIndex = getSelectedItemIndex(selectedItem);

    const selectedItemRect = selectedItem.getBoundingClientRect();

    dragState.offsetX = event.clientX - selectedItemRect.left;
    dragState.offsetY = event.clientY - selectedItemRect.top;
  };

  const createDraggingItem = (selectedItem: HTMLLIElement) => {
    const selectedItemRect = selectedItem.getBoundingClientRect();
    const draggingItem = cloneElement(selectedItem);

    draggingItem.style.position = "fixed";
    draggingItem.style.left = selectedItemRect.left + "px";
    draggingItem.style.top = selectedItemRect.top + "px";
    draggingItem.style.width = selectedItemRect.width + "px";
    draggingItem.style.height = selectedItemRect.height + "px";

    return draggingItem;
  };

  const handleDragStart = (selectedItem: HTMLLIElement, event: MouseEvent) => {
    addClass(selectedItem, CLASSNAMES.DRAGGED);
    initializeDragState(selectedItem, event);

    const draggingItem = createDraggingItem(selectedItem);

    document.body.appendChild(draggingItem);
    dragState.draggingItem = draggingItem;

    dropGuidelineState.element = createDropGuideline();
    itemList.appendChild(dropGuidelineState.element);

    addEventListeners();
  };

  const isValidDrag = (event: MouseEvent) => {
    const deltaX = Math.abs(event.clientX - dragState.startX);
    const deltaY = Math.abs(event.clientY - dragState.startY);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    return distance > VALUES.MIN_DRAG_DISTANCE;
  };

  const handleAutoScroll = (mouseY: number) => {
    const itemListRect = itemList.getBoundingClientRect();
    const topThreshold = itemListRect.top + VALUES.SCROLL_THRESHOLD;
    const bottomThreshold = itemListRect.bottom - VALUES.SCROLL_THRESHOLD;

    if (mouseY < topThreshold) {
      itemList.scrollTop -= VALUES.SCROLL_SPEED;
    } else if (mouseY > bottomThreshold) {
      itemList.scrollTop += VALUES.SCROLL_SPEED;
    }
  };

  const updateDraggingItemPosition = (event: MouseEvent) => {
    if (!dragState.draggingItem) return;

    dragState.draggingItem.style.left =
      event.clientX - dragState.offsetX + "px";
    dragState.draggingItem.style.top = event.clientY - dragState.offsetY + "px";
  };

  const handleDragMove = (event: MouseEvent) => {
    if (!dragState.draggingItem) return;

    if (!dragState.isDragging && isValidDrag(event)) {
      dragState.isDragging = true;
    }

    if (dragState.isDragging) {
      updateDraggingItemPosition(event);
      updateDropPositions(event.clientY);
      handleAutoScroll(event.clientY);
    }
  };

  const isInsideitemList = (x: number, y: number) => {
    const itemListRect = itemList.getBoundingClientRect();

    return (
      x >= itemListRect.left &&
      x <= itemListRect.right &&
      y >= itemListRect.top &&
      y <= itemListRect.bottom
    );
  };

  const insertSelectedItem = () => {
    const insertIndex = dropGuidelineState.insertIndex;
    const insertReferenceItem = dropGuidelineState.insertReferenceItem;

    if (!dragState.selectedItem) return;

    if (insertIndex === itemList.children.length) {
      itemList.appendChild(dragState.selectedItem);
    } else {
      itemList.insertBefore(dragState.selectedItem, insertReferenceItem);
    }
  };

  const handleDragEnd = (event: MouseEvent) => {
    if (
      !dragState.isDragging ||
      !isInsideitemList(event.clientX, event.clientY)
    ) {
      resetDragAndDrop();
      return;
    }

    insertSelectedItem();
    resetDragAndDrop();

    const items = getNonDraggingItems();
    onOrderChange(items);
  };

  return { handleDragStart };
};
