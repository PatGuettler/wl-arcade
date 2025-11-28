import { useState, useRef, useEffect } from "react";

// Mobile-app style pinch zoom & pan
export const useGameViewport = (initialZoom = 1) => {
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const stateRef = useRef({
    zoom: initialZoom,
    pan: { x: 0, y: 0 },
    isDragging: false,
    dragStart: { x: 0, y: 0, panX: 0, panY: 0 },
    pinchStartDist: 0,
    pinchStartZoom: 1,
    pinchCenter: { x: 0, y: 0 },
    isPinching: false
  });

  // Keep stateRef synced
  useEffect(() => {
    stateRef.current.zoom = zoom;
    stateRef.current.pan = pan;
    stateRef.current.isDragging = isDragging;
  }, [zoom, pan, isDragging]);

  const startDrag = (e) => {
    if (e.touches && e.touches.length === 2) return; // pinch mode takes over

    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;

    stateRef.current.dragStart = {
      x,
      y,
      panX: stateRef.current.pan.x,
      panY: stateRef.current.pan.y
    };

    setIsDragging(true);
  };

  const doDrag = (e) => {
    // Pinch zooming takes over
    if (stateRef.current.isPinching) return;

    if (!stateRef.current.isDragging) return;

    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = x - stateRef.current.dragStart.x;
    const dy = y - stateRef.current.dragStart.y;

    setPan({
      x: stateRef.current.dragStart.panX + dx,
      y: stateRef.current.dragStart.panY + dy
    });
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  // ------------------------------
  //      PINCH-TO-ZOOM SUPPORT
  // ------------------------------
  const touchStart = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();

      const [a, b] = e.touches;

      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);

      stateRef.current.isPinching = true;
      stateRef.current.pinchStartDist = dist;
      stateRef.current.pinchStartZoom = stateRef.current.zoom;

      stateRef.current.pinchCenter = {
        x: (a.clientX + b.clientX) / 2,
        y: (a.clientY + b.clientY) / 2
      };
    }
  };

  const touchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();

      const [a, b] = e.touches;
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);

      const scale = dist / stateRef.current.pinchStartDist;
      const newZoom = Math.max(0.2, Math.min(3.0, stateRef.current.pinchStartZoom * scale));

      const cx = stateRef.current.pinchCenter.x;
      const cy = stateRef.current.pinchCenter.y;

      const worldX = (cx - stateRef.current.pan.x) / stateRef.current.zoom;
      const worldY = (cy - stateRef.current.pan.y) / stateRef.current.zoom;

      const newPanX = cx - worldX * newZoom;
      const newPanY = cy - worldY * newZoom;

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    }
  };

  const touchEnd = () => {
    stateRef.current.isPinching = false;
    setIsDragging(false);
  };

  // ----------------------------------
  // Mouse + wheel zoom (desktop)
  // ----------------------------------
  const applyZoom = (delta, center = null) => {
    const focus = center || { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const current = stateRef.current.zoom;
    const newZoom = Math.max(0.2, Math.min(3.0, current + delta));
    if (newZoom === current) return;

    const worldX = (focus.x - stateRef.current.pan.x) / current;
    const worldY = (focus.y - stateRef.current.pan.y) / current;

    const newPanX = focus.x - worldX * newZoom;
    const newPanY = focus.y - worldY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  const centerOn = (worldX) => {
    const screenCenter = window.innerWidth / 2;
    const newPanX = screenCenter - worldX * stateRef.current.zoom;
    setPan((prev) => ({ ...prev, x: newPanX }));
  };

  return {
    zoom,
    pan,
    isDragging,
    startDrag,
    doDrag,
    endDrag,
    applyZoom,
    centerOn,
    // Pass through the new touch handlers
    touchStart,
    touchMove,
    touchEnd,
    setZoom,
    setPan
  };
};
