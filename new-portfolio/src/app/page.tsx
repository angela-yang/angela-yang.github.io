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

const ICONS: { id: WindowId; img: string; label: string; defaultPos: { x: number; y: number } }[] = [
  { id: 'about', img: '/icons/about.png', label: 'about me', defaultPos: { x: 60,  y: 80  } },
  { id: 'projects', img: '/icons/projects.png', label: 'projects', defaultPos: { x: 60,  y: 220 } },
  { id: 'art', img: '/icons/art.png', label: 'art', defaultPos: { x: 60,  y: 360 } },
  { id: 'skills', img: '/icons/skills.png', label: 'skills', defaultPos: { x: 60,  y: 500 } },
  { id: 'contact', img: '/icons/contact.png', label: 'contact', defaultPos: { x: 60,  y: 640 } },
];

const DEFAULT_WINDOW: Record<WindowId, { x: number; y: number; w: number; h: number }> = {
  about: { x: 160, y: 60, w: 580, h: 550 },
  projects: { x: 320, y: 90, w: 700, h: 580 },
  art: { x: 550, y: 80, w: 650, h: 500 },
  skills: { x: 450, y: 100, w: 500, h: 450 },
  contact: { x: 240, y: 100, w: 440, h: 360 },
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

export default function Home() {
  const [windows, setWindows] = useState<Record<WindowId, WindowState>>(() => {
    const initial: Partial<Record<WindowId, WindowState>> = {};
    ICONS.forEach(({ id }) => {
      const d = DEFAULT_WINDOW[id];
      initial[id] = { id, open: false, focused: false, pos: { x: d.x, y: d.y }, size: { w: d.w, h: d.h } };
    });
    return initial as Record<WindowId, WindowState>;
  });

  const [clock, setClock] = useState('');
  const topZRef = useRef(200);
  const zMap = useRef<Record<WindowId, number>>({} as Record<WindowId, number>);

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Open a window
  const openWindow = useCallback((id: WindowId) => {
    topZRef.current += 1;
    zMap.current[id] = topZRef.current;
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], open: true, focused: true },
    }));
    setWindows(prev => {
      const next = { ...prev };
      (Object.keys(next) as WindowId[]).forEach(k => {
        if (k !== id) next[k] = { ...next[k], focused: false };
      });
      return next;
    });
  }, []);

  // Close a window
  const closeWindow = useCallback((id: WindowId) => {
    setWindows(prev => ({ ...prev, [id]: { ...prev[id], open: false, focused: false } }));
  }, []);

  // Bring to front on click
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

  // Drag logic
  const dragState = useRef<{ id: WindowId; startMouse: { x: number; y: number }; startPos: { x: number; y: number } } | null>(null);

  const onTitleBarMouseDown = useCallback((e: React.MouseEvent, id: WindowId) => {
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
  }, [windows, focusWindow]);

  const openCount = Object.values(windows).filter(w => w.open).length;

  return (
    <>
      <div className="wallpaper" />

      <div className="status-bar">
        <span style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', color: 'var(--accent-warm)' }}>
          Angela Yang
        </span>
        <span>{clock}</span>
      </div>

      <div className="desktop" style={{ paddingTop: 28, paddingBottom: 56 }}>
        {/* Desktop icons */}
        <div className="desktop-icons">
          {ICONS.map(({ id, img, label, defaultPos }) => (
            <button
              key={id}
              className="desktop-icon"
              style={{ top: defaultPos.y + 28, left: defaultPos.x }}
              onDoubleClick={() => openWindow(id)}
              onClick={() => openWindow(id)}
              title={`Open ${label}`}
            >
              <img
                src={img}
                alt="icon"
                style={{
                  width: '100%',
                  maxWidth: 80,
                  borderRadius: 12,
                  display: 'block',
                }}
              />
              <span>{label}</span>
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
                left: win.pos.x,
                top: win.pos.y + 28,
                width: win.size.w,
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
      <div className="taskbar">
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
                alt="icon"
                style={{
                  width: '100%',
                  maxWidth: 50,
                }}
              />
            </button>
          );
        })}
      </div>
    </>
  );
}