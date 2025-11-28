import { useState, useRef, useEffect } from 'react';

export const useGameViewport = (initialZoom = 1) => {
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const stateRef = useRef({ zoom: initialZoom, pan: { x: 0, y: 0 }, isDragging: false, start: { x: 0, y: 0 } });

  useEffect(() => {
    stateRef.current.zoom = zoom;
    stateRef.current.pan = pan;
    stateRef.current.isDragging = isDragging;
  }, [zoom, pan, isDragging]);

  const applyZoom = (delta, centerPoint = { x: window.innerWidth / 2, y: window.innerHeight / 2 }) => {
    const currentZoom = stateRef.current.zoom;
    const newZoom = Math.max(0.2, Math.min(2.0, currentZoom + delta));
    if (newZoom === currentZoom) return;
    const worldFocusX = (centerPoint.x - stateRef.current.pan.x) / currentZoom;
    const newPanX = centerPoint.x - (worldFocusX * newZoom);
    setZoom(newZoom);
    setPan(prev => ({ ...prev, x: newPanX }));
  };

  const startDrag = (e) => {
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    setIsDragging(true);
    stateRef.current.start = { x: cx, panX: stateRef.current.pan.x };
  };

  const doDrag = (e) => {
    if (!stateRef.current.isDragging) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const delta = cx - stateRef.current.start.x;
    setPan(prev => ({ ...prev, x: stateRef.current.start.panX + delta }));
  };

  const endDrag = () => setIsDragging(false);

  const centerOn = (worldX) => {
    const screenCenter = window.innerWidth / 2;
    const newPanX = screenCenter - (worldX * stateRef.current.zoom);
    setPan(prev => ({ ...prev, x: newPanX }));
  };

  return { zoom, pan, isDragging, startDrag, doDrag, endDrag, applyZoom, centerOn, setZoom, setPan };
};