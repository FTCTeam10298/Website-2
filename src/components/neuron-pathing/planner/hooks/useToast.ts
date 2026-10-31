import { useCallback, useEffect, useRef, useState } from 'react';

export function useToast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timer = useRef<number>();

  const toast = useCallback((msg: string) => {
    setMessage(msg); setVisible(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setVisible(false), 1200);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { message, visible, toast };
}
