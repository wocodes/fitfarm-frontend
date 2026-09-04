'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function TopProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = () => {
    timerRef.current.forEach((t) => clearTimeout(t));
    timerRef.current = [];
  };

  const startProgress = () => {
    clearTimers();
    setVisible(true);
    setProgress(25);

    timerRef.current.push(
      setTimeout(() => {
        setProgress(65);
      }, 150)
    );

    timerRef.current.push(
      setTimeout(() => {
        setProgress(85);
      }, 400)
    );
  };

  const completeProgress = () => {
    clearTimers();
    setProgress(100);

    timerRef.current.push(
      setTimeout(() => {
        setVisible(false);
        timerRef.current.push(
          setTimeout(() => {
            setProgress(0);
          }, 300)
        );
      }, 200)
    );
  };

  // Complete progress whenever pathname updates (route navigation finishes)
  useEffect(() => {
    completeProgress();
  }, [pathname]);

  // Listen for link clicks to start progress bar immediately
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const targetAttr = anchor.getAttribute('target');

      // Ignore external links, new tabs, anchors, and downloads
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        targetAttr === '_blank' ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      // If already on this exact path, ignore
      if (href === pathname) return;

      startProgress();
    };

    // Custom window events for manual or API loading triggers
    const handleStartEvent = () => startProgress();
    const handleDoneEvent = () => completeProgress();

    document.addEventListener('click', handleDocumentClick, true);
    window.addEventListener('app:loading:start', handleStartEvent);
    window.addEventListener('app:loading:done', handleDoneEvent);

    return () => {
      clearTimers();
      document.removeEventListener('click', handleDocumentClick, true);
      window.removeEventListener('app:loading:start', handleStartEvent);
      window.removeEventListener('app:loading:done', handleDoneEvent);
    };
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        className="h-[2.5px] bg-gradient-to-r from-orange-600 via-orange-400 to-amber-300 shadow-[0_0_12px_rgba(250,106,46,0.9),0_0_6px_rgba(250,106,46,0.6)]"
        style={{
          width: `${progress}%`,
          transition: progress === 100 ? 'width 150ms ease-out' : 'width 250ms ease',
        }}
      />
    </div>
  );
}
