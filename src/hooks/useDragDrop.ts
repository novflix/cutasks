import { useRef, useCallback, useEffect } from 'react';

export type DragItemType = 'task' | 'section';

export interface DragItem {
  type: DragItemType;
  id: string;
  sectionId?: string;
}

export interface DropTarget {
  type: 'task' | 'section' | 'section-zone';
  id: string;
  sectionId?: string;
  insertBefore?: boolean;
}

export interface DragState {
  item: DragItem;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  ghost: HTMLElement | null;
  sourceEl: HTMLElement | null;
  dropTarget: DropTarget | null;
  pointerId: number;
}

export interface UseDragDropOptions {
  onReorderTask: (taskId: string, targetSectionId: string | undefined, beforeTaskId: string | undefined) => void;
  onReorderSection: (sectionId: string, beforeSectionId: string | undefined) => void;
}

const DRAG_THRESHOLD = 8;
const GHOST_OPACITY = 0.85;

export function useDragDrop({ onReorderTask, onReorderSection }: UseDragDropOptions) {
  const stateRef = useRef<DragState | null>(null);
  const pendingRef = useRef<{ item: DragItem; startX: number; startY: number; pointerId: number; sourceEl: HTMLElement } | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const indicatorRef = useRef<HTMLElement | null>(null);

  // ── Ghost element ───────────────────────────────────
  const createGhost = useCallback((sourceEl: HTMLElement): HTMLElement => {
    const rect = sourceEl.getBoundingClientRect();
    const ghost = sourceEl.cloneNode(true) as HTMLElement;

    ghost.style.cssText = `
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      margin: 0;
      pointer-events: none;
      z-index: 9999;
      opacity: ${GHOST_OPACITY};
      transform: scale(1.03) rotate(1deg);
      transition: none;
      box-shadow: 0 12px 40px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.12);
      border-radius: 14px;
      background: var(--bg-card);
    `;
    ghost.setAttribute('data-drag-ghost', 'true');

    ghost.querySelectorAll('button, input, textarea, [data-drag-handle]').forEach(el => {
      (el as HTMLElement).style.pointerEvents = 'none';
    });

    document.body.appendChild(ghost);
    return ghost;
  }, []);

  const moveGhost = useCallback((ghost: HTMLElement, dx: number, dy: number, originRect: DOMRect) => {
    ghost.style.top = `${originRect.top + dy}px`;
    ghost.style.left = `${originRect.left + dx}px`;
  }, []);

  // ── Drop indicator ───────────────────────────────────
  const showIndicator = useCallback((target: DropTarget | null) => {
    if (indicatorRef.current) {
      indicatorRef.current.remove();
      indicatorRef.current = null;
    }
    if (!target) return;

    let anchorEl: HTMLElement | null = null;
    let insertBefore = target.insertBefore ?? true;

    if (target.type === 'task') {
      anchorEl = document.querySelector(`[data-task-id="${target.id}"]`);
    } else if (target.type === 'section') {
      anchorEl = document.querySelector(`[data-section-id="${target.id}"]`);
    } else if (target.type === 'section-zone') {
      const zone = document.querySelector(`[data-section-drop-zone="${target.id}"]`);
      if (zone) {
        anchorEl = zone as HTMLElement;
        insertBefore = false;
      }
    }

    if (!anchorEl) return;

    const indicator = document.createElement('div');
    indicator.setAttribute('data-drop-indicator', 'true');
    indicator.style.cssText = `
      height: 2px;
      background: var(--accent, #ed9b6d);
      border-radius: 999px;
      margin: 2px 0;
      pointer-events: none;
      position: relative;
      z-index: 100;
      box-shadow: 0 0 8px rgba(237,155,109,0.6);
      animation: indicator-pulse 0.8s ease infinite alternate;
    `;

    if (insertBefore) {
      anchorEl.parentElement?.insertBefore(indicator, anchorEl);
    } else {
      anchorEl.parentElement?.appendChild(indicator);
    }

    indicatorRef.current = indicator;
  }, []);

  // ── Hit testing ──────────────────────────────────────
  const findDropTarget = useCallback((x: number, y: number, dragItem: DragItem): DropTarget | null => {
    const ghost = stateRef.current?.ghost;
    if (ghost) ghost.style.display = 'none';

    const el = document.elementFromPoint(x, y) as HTMLElement | null;

    if (ghost) ghost.style.display = '';
    if (!el) return null;

    const taskEl = el.closest('[data-task-id]') as HTMLElement | null;
    const sectionZoneEl = el.closest('[data-section-drop-zone]') as HTMLElement | null;

    if (dragItem.type === 'task') {
      if (taskEl) {
        const targetId = taskEl.getAttribute('data-task-id')!;
        if (targetId === dragItem.id) return null;

        const rect = taskEl.getBoundingClientRect();
        const insertBefore = y < rect.top + rect.height / 2;
        const targetSectionId = taskEl.getAttribute('data-task-section') ?? undefined;

        return { type: 'task', id: targetId, sectionId: targetSectionId || undefined, insertBefore };
      }

      if (sectionZoneEl) {
        const sectionId = sectionZoneEl.getAttribute('data-section-drop-zone')!;
        return { type: 'section-zone', id: sectionId };
      }
    }

    if (dragItem.type === 'section') {
      const sectionHeaderEl = el.closest('[data-section-header-id]') as HTMLElement | null;
      if (sectionHeaderEl) {
        const targetId = sectionHeaderEl.getAttribute('data-section-header-id')!;
        if (targetId === dragItem.id) return null;

        const rect = sectionHeaderEl.getBoundingClientRect();
        const insertBefore = y < rect.top + rect.height / 2;

        return { type: 'section', id: targetId, insertBefore };
      }
    }

    return null;
  }, []);

  // ── Pointer events ───────────────────────────────────
  const onPointerDown = useCallback((
    e: React.PointerEvent,
    item: DragItem,
    sourceEl: HTMLElement
  ) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    e.currentTarget.setPointerCapture(e.pointerId);

    pendingRef.current = {
      item,
      startX: e.clientX,
      startY: e.clientY,
      pointerId: e.pointerId,
      sourceEl,
    };
  }, []);

  const onPointerMove = useCallback((e: PointerEvent) => {
    const pending = pendingRef.current;
    const state = stateRef.current;

    if (!pending && !state) return;

    const x = e.clientX;
    const y = e.clientY;

    // Activate drag once threshold is exceeded
    if (pending && !state) {
      const ddx = x - pending.startX;
      const ddy = y - pending.startY;
      const dist = Math.sqrt(ddx * ddx + ddy * ddy);

      if (dist < DRAG_THRESHOLD) return;

      const rect = pending.sourceEl.getBoundingClientRect();
      const ghost = createGhost(pending.sourceEl);

      stateRef.current = {
        item: pending.item,
        startX: pending.startX,
        startY: pending.startY,
        currentX: x,
        currentY: y,
        ghost,
        sourceEl: pending.sourceEl,
        dropTarget: null,
        pointerId: pending.pointerId,
      };

      pending.sourceEl.style.opacity = '0.35';
      pending.sourceEl.style.transition = 'opacity 0.15s';
      pendingRef.current = null;

      document.body.classList.add('dragging');
      document.body.style.userSelect = 'none';
      (document.body.style as CSSStyleDeclaration & { webkitUserSelect: string }).webkitUserSelect = 'none';
      document.body.style.touchAction = 'none';

      moveGhost(ghost, ddx, ddy, rect);
      return;
    }

    if (!state || !state.ghost) return;

    // Block page scroll while actively dragging on touch devices
    e.preventDefault();

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      if (!state || !state.ghost) return;

      const dx = x - state.startX;
      const dy = y - state.startY;
      const rect = state.sourceEl!.getBoundingClientRect();
      moveGhost(state.ghost, dx, dy, rect);

      const target = findDropTarget(x, y, state.item);
      state.dropTarget = target;
      state.currentX = x;
      state.currentY = y;

      showIndicator(target);
    });
  }, [createGhost, moveGhost, findDropTarget, showIndicator]);

  const finishDrag = useCallback(() => {
    const state = stateRef.current;
    pendingRef.current = null;

    document.body.classList.remove('dragging');
    document.body.style.userSelect = '';
    (document.body.style as CSSStyleDeclaration & { webkitUserSelect: string }).webkitUserSelect = '';
    document.body.style.touchAction = '';

    if (!state) return;

    if (state.ghost) {
      state.ghost.style.transition = 'opacity 0.15s ease-out';
      state.ghost.style.opacity = '0';
      setTimeout(() => state.ghost?.remove(), 150);
    }

    if (state.sourceEl) {
      state.sourceEl.style.opacity = '';
      state.sourceEl.style.transition = '';
    }

    showIndicator(null);

    const target = state.dropTarget;
    if (target) {
      if (state.item.type === 'task') {
        if (target.type === 'task') {
          const targetSectionId = target.sectionId;
          if (!target.insertBefore) {
            // Insert after target — find the next sibling task in same section
            const taskEls = Array.from(document.querySelectorAll('[data-task-id]'))
              .filter(el => el.getAttribute('data-task-section') === (targetSectionId ?? ''))
              .map(el => el.getAttribute('data-task-id')!);
            const idx = taskEls.indexOf(target.id);
            const nextId = taskEls[idx + 1];
            onReorderTask(state.item.id, targetSectionId, nextId);
          } else {
            onReorderTask(state.item.id, targetSectionId, target.id);
          }
        } else if (target.type === 'section-zone') {
          onReorderTask(state.item.id, target.id || undefined, undefined);
        }
      } else if (state.item.type === 'section') {
        if (target.type === 'section') {
          if (target.insertBefore) {
            onReorderSection(state.item.id, target.id);
          } else {
            const sectionEls = Array.from(document.querySelectorAll('[data-section-header-id]'))
              .map(el => el.getAttribute('data-section-header-id')!);
            const idx = sectionEls.indexOf(target.id);
            const nextId = sectionEls[idx + 1];
            onReorderSection(state.item.id, nextId);
          }
        }
      }
    }

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    stateRef.current = null;
  }, [onReorderTask, onReorderSection, showIndicator]);

  const onPointerUp = useCallback(() => {
    finishDrag();
  }, [finishDrag]);

  const onPointerCancel = useCallback(() => {
    const state = stateRef.current;
    if (state?.ghost) state.ghost.remove();
    if (state?.sourceEl) {
      state.sourceEl.style.opacity = '';
      state.sourceEl.style.transition = '';
    }
    showIndicator(null);
    stateRef.current = null;
    pendingRef.current = null;
    document.body.classList.remove('dragging');
    document.body.style.userSelect = '';
    document.body.style.touchAction = '';
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, [showIndicator]);

  useEffect(() => {
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      indicatorRef.current?.remove();
    };
  }, [onPointerMove, onPointerUp, onPointerCancel]);

  return { onPointerDown };
}