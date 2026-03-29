'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import About from '../sections/about';
import Projects from '../sections/projects';
import Art from '../sections/art';
import Skills from '../sections/skills';
import Contact from '../sections/contact';

type WindowId = 'about' | 'projects' | 'art' | 'skills' | 'contact';

interface WindowState {
  id: WindowId;
  open: boolean;
  focused: boolean;
  pos: { x: number; y: number };
  size: { w: number; h: number };
}

const ICONS: {
  id: WindowId;
  img: string;
  label: string;
  defaultPos: { x: number; y: number };
}[] = [
  { id: 'about', img: '/icons/about.png', label: 'about me', defaultPos: { x: 0.03, y: 0.10 } },
  { id: 'projects', img: '/icons/projects.png', label: 'projects', defaultPos: { x: 0.03, y: 0.25 } },
  { id: 'art', img: '/icons/art.png', label: 'art', defaultPos: { x: 0.03, y: 0.40 } },
  { id: 'skills', img: '/icons/skills.png', label: 'skills', defaultPos: { x: 0.03, y: 0.55 } },
  { id: 'contact', img: '/icons/contact.png', label: 'contact', defaultPos: { x: 0.03, y: 0.70 } },
];

const DEFAULT_WINDOW: Record<WindowId, { x: number; y: number; w: number; h: number }> = {
  about: { x: 0.12, y: 0.08, w: 0.42, h: 0.72 },
  projects: { x: 0.22, y: 0.10, w: 0.52, h: 0.75 },
  art: { x: 0.18, y: 0.08, w: 0.58, h: 0.78 },
  skills: { x: 0.20, y: 0.09, w: 0.40, h: 0.68 },
  contact: { x: 0.25, y: 0.10, w: 0.36, h: 0.58 },
};

const WINDOW_CONTENT: Record<WindowId, React.ComponentType> = {
  about: About,
  projects: Projects,
  art: Art,
  skills: Skills,
  contact: Contact,
};

const WINDOW_TITLES: Record<WindowId, string> = {
  about: 'about me',
  projects: 'projects',
  art: 'art gallery',
  skills: 'skills',
  contact: 'contact',
};

// -- Make responsive to viewport ----------
function useViewport() {
  const [vp, setVp] = useState({ w: 1440, h: 900 });
  useEffect(() => {
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return vp;
}

function toPixels(
  frac: { x: number; y: number; w: number; h: number },
  vp: { w: number; h: number }
) {
  return {
    x: Math.round(frac.x * vp.w),
    y: Math.round(frac.y * vp.h),
    w: Math.round(frac.w * vp.w),
    h: Math.round(frac.h * vp.h),
  };
}

function iconSize(vp: { w: number; h: number }) {
  return Math.min(90, Math.max(48, Math.round(vp.w * 0.055)));
}

export default function Home() {
  const vp = useViewport();

  const [windows, setWindows] = useState<Record<WindowId, WindowState>>(() => {
    const initial: Partial<Record<WindowId, WindowState>> = {};
    ICONS.forEach(({ id }) => {
      const d = toPixels(DEFAULT_WINDOW[id], { w: 1440, h: 900 });
      initial[id] = { id, open: false, focused: false, pos: { x: d.x, y: d.y }, size: { w: d.w, h: d.h } };
    });
    return initial as Record<WindowId, WindowState>;
  });

  const draggedWindows = useRef<Set<WindowId>>(new Set());

  useEffect(() => {
    setWindows(prev => {
      const next = { ...prev };
      (Object.keys(next) as WindowId[]).forEach(id => {
        const d = toPixels(DEFAULT_WINDOW[id], vp);
        next[id] = {
          ...next[id],
          pos:  draggedWindows.current.has(id) ? next[id].pos : { x: d.x, y: d.y },
          size: { w: d.w, h: d.h },
        };
      });
      return next;
    });
  }, [vp]);

  const [clock, setClock] = useState('');
  const topZRef = useRef(200);
  const zMap = useRef<Record<WindowId, number>>({} as Record<WindowId, number>);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const openWindow = useCallback((id: WindowId) => {
    topZRef.current += 1;
    zMap.current[id] = topZRef.current;
    setWindows(prev => {
      const next = { ...prev };
      (Object.keys(next) as WindowId[]).forEach(k => {
        next[k] = { ...next[k], focused: k === id };
      });
      next[id] = { ...next[id], open: true, focused: true };
      return next;
    });
  }, []);

  const closeWindow = useCallback((id: WindowId) => {
    draggedWindows.current.delete(id);
    setWindows(prev => ({ ...prev, [id]: { ...prev[id], open: false, focused: false } }));
  }, []);

  const focusWindow = useCallback((id: WindowId) => {
    topZRef.current += 1;
    zMap.current[id] = topZRef.current;
    setWindows(prev => {
      const next = { ...prev };
      (Object.keys(next) as WindowId[]).forEach(k => {
        next[k] = { ...next[k], focused: k === id };
      });
      return next;
    });
  }, []);

  const dragState = useRef<{
    id: WindowId;
    startMouse: { x: number; y: number };
    startPos: { x: number; y: number };
  } | null>(null);

  const onTitleBarMouseDown = useCallback(
    (e: React.MouseEvent, id: WindowId) => {
      e.preventDefault();
      focusWindow(id);
      dragState.current = {
        id,
        startMouse: { x: e.clientX, y: e.clientY },
        startPos: { ...windows[id].pos },
      };

      const onMove = (me: MouseEvent) => {
        if (!dragState.current) return;
        const { id: wid, startMouse, startPos } = dragState.current;
        const dx = me.clientX - startMouse.x;
        const dy = me.clientY - startMouse.y;
        draggedWindows.current.add(wid);
        setWindows(prev => ({
          ...prev,
          [wid]: { ...prev[wid], pos: { x: startPos.x + dx, y: startPos.y + dy } },
        }));
      };

      const onUp = () => {
        dragState.current = null;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [windows, focusWindow]
  );

  const openCount = Object.values(windows).filter(w => w.open).length;
  const iSize = iconSize(vp);

  const STATUS_H  = Math.round(vp.h * 0.034); 
  const TASKBAR_H = Math.round(vp.h * 0.075);

  return (
    <>
      <div className="wallpaper" />

      <div className="status-bar" style={{ height: STATUS_H }}>
        <span style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', color: 'var(--accent-warm)' }}>
          Angela Yang
        </span>
        <span>{clock}</span>
      </div>

      <div className="desktop" style={{ paddingTop: STATUS_H, paddingBottom: TASKBAR_H }}>
        {/* Desktop icons */}
        <div className="desktop-icons">
          {ICONS.map(({ id, img, label, defaultPos }) => (
            <button
              key={id}
              className="desktop-icon"
              style={{
                top:   Math.round(defaultPos.y * vp.h) + STATUS_H,
                left:  Math.round(defaultPos.x * vp.w),
                width: iSize + 24,
              }}
              onClick={() => openWindow(id)}
              title={`Open ${label}`}
            >
              <img
                src={img}
                alt={label}
                style={{ width: iSize, height: iSize, borderRadius: 12, display: 'block' }}
              />
              <span style={{ fontSize: Math.max(10, Math.round(vp.w * 0.008)) }}>{label}</span>
            </button>
          ))}
        </div>

        {/* Windows */}
        {(Object.keys(windows) as WindowId[]).map(id => {
          const win = windows[id];
          if (!win.open) return null;
          const Content = WINDOW_CONTENT[id];
          const z = zMap.current[id] ?? 100;

          return (
            <div
              key={id}
              className={`os-window window-open-anim ${win.focused ? 'focused' : ''}`}
              style={{
                left:   win.pos.x,
                top:    win.pos.y + STATUS_H,
                width:  win.size.w,
                height: win.size.h,
                zIndex: z,
              }}
              onMouseDown={() => focusWindow(id)}
            >
              <div
                className="window-titlebar"
                onMouseDown={e => onTitleBarMouseDown(e, id)}
              >
                <button className="window-btn close" onClick={() => closeWindow(id)} title="Close" />
                <button className="window-btn min"   title="Minimize" />
                <button className="window-btn max"   title="Maximize" />
                <span className="window-title">{WINDOW_TITLES[id]}</span>
              </div>

              <div className="window-body">
                <Content />
              </div>
            </div>
          );
        })}
      </div>

      {/* Taskbar */}
      <div className="taskbar" style={{ height: TASKBAR_H }}>
        {openCount === 0 && (
          <span style={{ color: 'var(--text-dim)', fontSize: '1.2rem' }}>
            Click an icon to open a window!
          </span>
        )}
        {ICONS.map(({ id, img, label }) => {
          const win = windows[id];
          if (!win.open) return null;
          return (
            <button
              key={id}
              className={`taskbar-icon ${win.focused ? 'active' : ''}`}
              onClick={() => win.focused ? closeWindow(id) : openWindow(id)}
              title={label}
            >
              <img
                src={img}
                alt={label}
                style={{ width: Math.round(TASKBAR_H * 0.6), height: Math.round(TASKBAR_H * 0.6) }}
              />
            </button>
          );
        })}
      </div>
    </>
  );
}