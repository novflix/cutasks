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

const DRAG_THRESHOLD = 6;
const GHOST_OPACITY = 0.88;

export function useDragDrop({ onReorderTask, onReorderSection }: UseDragDropOptions) {
  const stateRef = useRef<DragState | null>(null);
  const pendingRef = useRef<{ item: DragItem; startX: number; startY: number; pointerId: number; sourceEl: HTMLElement } | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const indicatorRef = useRef<HTMLElement | null>(null);

  // Ghost element
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
      transform: scale(1.02) rotate(0.6deg);
      transition: none;
      box-shadow: 0 16px 48px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1);
      border-radius: 14px;
      background: var(--bg-card);
      will-change: top, left;
    `;
    ghost.setAttribute('data-drag-ghost', 'true');
    ghost.querySelectorAll('button, input, textarea, [data-drag-handle]').forEach(el => {
      (el as HTMLElement).style.pointerEvents = 'none';
    });
    document.body.appendChild(ghost);
    return ghost;
  }, []);

  const moveGhost = useCallback((ghost: HTMLElement, dx: number, dy: number, originRect: DOMRect) => {
    ghost.style.top  = `${originRect.top  + dy}px`;
    ghost.style.left = `${originRect.left + dx}px`;
  }, []);

  // Drop indicator — rendered as a fixed-position overlay line (no DOM layout shifts)
  const showIndicator = useCallback((target: DropTarget | null) => {
    if (indicatorRef.current) {
      indicatorRef.current.remove();
      indicatorRef.current = null;
    }
    if (!target) return;

    let anchorEl: HTMLElement | null = null;
    let placeAfter = false;

    if (target.type === 'task') {
      anchorEl   = document.querySelector(`[data-task-id="${target.id}"]`);
      placeAfter = !(target.insertBefore ?? true);
    } else if (target.type === 'section') {
      anchorEl   = document.querySelector(`[data-section-id="${target.id}"]`);
      placeAfter = !(target.insertBefore ?? true);
    } else if (target.type === 'section-zone') {
      anchorEl   = document.querySelector(`[data-section-drop-zone="${target.id}"]`);
      placeAfter = true;
    }

    if (!anchorEl) return;

    const rect = anchorEl.getBoundingClientRect();
    const y    = placeAfter ? rect.bottom : rect.top;

    const indicator = document.createElement('div');
    indicator.setAttribute('data-drop-indicator', 'true');
    indicator.style.cssText = `
      position: fixed;
      top: ${y - 1.5}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: 3px;
      background: var(--accent, #ed9b6d);
      border-radius: 999px;
      pointer-events: none;
      z-index: 10000;
      box-shadow: 0 0 0 2px rgba(237,155,109,0.15), 0 0 12px rgba(237,155,109,0.45);
    `;

    const cap = document.createElement('div');
    cap.style.cssText = `
      position: absolute;
      left: -3px;
      top: 50%;
      transform: translateY(-50%);
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: var(--accent, #ed9b6d);
    `;
    indicator.appendChild(cap);
    document.body.appendChild(indicator);
    indicatorRef.current = indicator;
  }, []);

  // Hit testing — multi-pass for maximum coverage
  const findDropTarget = useCallback((x: number, y: number, dragItem: DragItem): DropTarget | null => {
    const ghost = stateRef.current?.ghost;
    if (ghost) ghost.style.display = 'none';
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (ghost) ghost.style.display = '';
    if (!el) return null;

    if (dragItem.type === 'task') {
      // 1. Direct task hit
      const taskEl = el.closest('[data-task-id]') as HTMLElement | null;
      if (taskEl) {
        const targetId = taskEl.getAttribute('data-task-id')!;
        if (targetId === dragItem.id) return null;
        const rect = taskEl.getBoundingClientRect();
        const insertBefore = y < rect.top + rect.height / 2;
        const targetSectionId = taskEl.getAttribute('data-task-section') ?? undefined;
        return { type: 'task', id: targetId, sectionId: targetSectionId || undefined, insertBefore };
      }

      // 2. Section header → drop into that section at end
      const sectionHeaderEl = el.closest('[data-section-header-id]') as HTMLElement | null;
      if (sectionHeaderEl) {
        const sectionId = sectionHeaderEl.getAttribute('data-section-header-id')!;
        return { type: 'section-zone', id: sectionId };
      }

      // 3. Section body / zone
      const sectionZoneEl = el.closest('[data-section-drop-zone]') as HTMLElement | null;
      if (sectionZoneEl) {
        const sectionId = sectionZoneEl.getAttribute('data-section-drop-zone')!;
        // Find nearest task inside this zone
        const taskEls = Array.from(sectionZoneEl.querySelectorAll('[data-task-id]')) as HTMLElement[];
        if (taskEls.length > 0) {
          let best: HTMLElement | null = null;
          let bestDist = Infinity;
          for (const t of taskEls) {
            const tr = t.getBoundingClientRect();
            const dist = Math.abs(y - (tr.top + tr.height / 2));
            if (dist < bestDist) { bestDist = dist; best = t; }
          }
          if (best && best.getAttribute('data-task-id') !== dragItem.id) {
            const rect = best.getBoundingClientRect();
            const insertBefore = y < rect.top + rect.height / 2;
            return { type: 'task', id: best.getAttribute('data-task-id')!, sectionId: sectionId || undefined, insertBefore };
          }
        }
        return { type: 'section-zone', id: sectionId };
      }

      // 4. Fallback: nearest task by Y within 80px
      const allTasks = Array.from(document.querySelectorAll('[data-task-id]')) as HTMLElement[];
      let best: HTMLElement | null = null;
      let bestDist = Infinity;
      for (const t of allTasks) {
        if (t.getAttribute('data-task-id') === dragItem.id) continue;
        const tr = t.getBoundingClientRect();
        if (tr.width === 0) continue;
        const dist = Math.abs(y - (tr.top + tr.height / 2));
        if (dist < bestDist && dist < 80) { bestDist = dist; best = t; }
      }
      if (best) {
        const rect = best.getBoundingClientRect();
        const insertBefore = y < rect.top + rect.height / 2;
        const targetSectionId = best.getAttribute('data-task-section') ?? undefined;
        return { type: 'task', id: best.getAttribute('data-task-id')!, sectionId: targetSectionId || undefined, insertBefore };
      }
    }

    if (dragItem.type === 'section') {
      // 1. Direct section header hit
      const sectionHeaderEl = el.closest('[data-section-header-id]') as HTMLElement | null;
      if (sectionHeaderEl) {
        const targetId = sectionHeaderEl.getAttribute('data-section-header-id')!;
        if (targetId === dragItem.id) return null;
        const rect = sectionHeaderEl.getBoundingClientRect();
        const insertBefore = y < rect.top + rect.height / 2;
        return { type: 'section', id: targetId, insertBefore };
      }

      // 2. Section body — snap to the section block
      const sectionZoneEl = el.closest('[data-section-drop-zone]') as HTMLElement | null;
      if (sectionZoneEl) {
        const sectionId = sectionZoneEl.getAttribute('data-section-drop-zone')!;
        if (sectionId && sectionId !== dragItem.id) {
          const sectionBlockEl = sectionZoneEl.closest('[data-section-id]') as HTMLElement | null;
          if (sectionBlockEl) {
            const rect = sectionBlockEl.getBoundingClientRect();
            const insertBefore = y < rect.top + rect.height / 2;
            return { type: 'section', id: sectionId, insertBefore };
          }
        }
      }

      // 3. Fallback: nearest section header within 100px
      const allSections = Array.from(document.querySelectorAll('[data-section-header-id]')) as HTMLElement[];
      let best: HTMLElement | null = null;
      let bestDist = Infinity;
      for (const s of allSections) {
        if (s.getAttribute('data-section-header-id') === dragItem.id) continue;
        const sr = s.getBoundingClientRect();
        if (sr.width === 0) continue;
        const dist = Math.abs(y - (sr.top + sr.height / 2));
        if (dist < bestDist && dist < 100) { bestDist = dist; best = s; }
      }
      if (best) {
        const rect = best.getBoundingClientRect();
        const insertBefore = y < rect.top + rect.height / 2;
        return { type: 'section', id: best.getAttribute('data-section-header-id')!, insertBefore };
      }
    }

    return null;
  }, []);

  // Pointer handlers
  const onPointerDown = useCallback((
    e: React.PointerEvent,
    item: DragItem,
    sourceEl: HTMLElement
  ) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pendingRef.current = { item, startX: e.clientX, startY: e.clientY, pointerId: e.pointerId, sourceEl };
  }, []);

  const onPointerMove = useCallback((e: PointerEvent) => {
    const pending = pendingRef.current;
    const state   = stateRef.current;
    if (!pending && !state) return;

    const x = e.clientX;
    const y = e.clientY;

    if (pending && !state) {
      const ddx  = x - pending.startX;
      const ddy  = y - pending.startY;
      if (Math.sqrt(ddx * ddx + ddy * ddy) < DRAG_THRESHOLD) return;

      const rect  = pending.sourceEl.getBoundingClientRect();
      const ghost = createGhost(pending.sourceEl);

      stateRef.current = {
        item: pending.item, startX: pending.startX, startY: pending.startY,
        currentX: x, currentY: y, ghost, sourceEl: pending.sourceEl,
        dropTarget: null, pointerId: pending.pointerId,
      };

      pending.sourceEl.style.opacity    = '0.3';
      pending.sourceEl.style.transition = 'opacity 0.1s';
      pendingRef.current = null;

      document.body.classList.add('dragging');
      document.body.style.userSelect = 'none';
      (document.body.style as CSSStyleDeclaration & { webkitUserSelect: string }).webkitUserSelect = 'none';
      document.body.style.touchAction = 'none';

      moveGhost(ghost, ddx, ddy, rect);
      return;
    }

    if (!state || !state.ghost) return;
    e.preventDefault();

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      if (!state || !state.ghost) return;
      const dx = x - state.startX;
      const dy = y - state.startY;
      moveGhost(state.ghost, dx, dy, state.sourceEl!.getBoundingClientRect());
      const target     = findDropTarget(x, y, state.item);
      state.dropTarget = target;
      state.currentX   = x;
      state.currentY   = y;
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
      state.ghost.style.transition = 'opacity 0.12s ease-out';
      state.ghost.style.opacity    = '0';
      setTimeout(() => state.ghost?.remove(), 120);
    }
    if (state.sourceEl) {
      state.sourceEl.style.opacity    = '';
      state.sourceEl.style.transition = '';
    }

    showIndicator(null);

    const target = state.dropTarget;
    if (target) {
      if (state.item.type === 'task') {
        if (target.type === 'task') {
          const targetSectionId = target.sectionId;
          if (!target.insertBefore) {
            const taskEls = Array.from(document.querySelectorAll('[data-task-id]'))
              .filter(el => el.getAttribute('data-task-section') === (targetSectionId ?? ''))
              .map(el => el.getAttribute('data-task-id')!);
            const idx    = taskEls.indexOf(target.id);
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
            const idx    = sectionEls.indexOf(target.id);
            const nextId = sectionEls[idx + 1];
            onReorderSection(state.item.id, nextId);
          }
        }
      }
    }

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    stateRef.current = null;
  }, [onReorderTask, onReorderSection, showIndicator]);

  const onPointerUp     = useCallback(() => { finishDrag(); }, [finishDrag]);
  const onPointerCancel = useCallback(() => {
    const state = stateRef.current;
    if (state?.ghost) state.ghost.remove();
    if (state?.sourceEl) { state.sourceEl.style.opacity = ''; state.sourceEl.style.transition = ''; }
    showIndicator(null);
    stateRef.current = null;
    pendingRef.current = null;
    document.body.classList.remove('dragging');
    document.body.style.userSelect  = '';
    document.body.style.touchAction = '';
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, [showIndicator]);

  useEffect(() => {
    window.addEventListener('pointermove',   onPointerMove,   { passive: false });
    window.addEventListener('pointerup',     onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    return () => {
      window.removeEventListener('pointermove',   onPointerMove);
      window.removeEventListener('pointerup',     onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      indicatorRef.current?.remove();
    };
  }, [onPointerMove, onPointerUp, onPointerCancel]);

  return { onPointerDown };
}