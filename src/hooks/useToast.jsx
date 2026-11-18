import { useCallback, useEffect, useRef, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  // Clear the pending dismiss timer when the hook's owner unmounts.
  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  const showToast = useCallback((message, icon = "fa-circle-check") => {
    window.clearTimeout(timeoutRef.current);
    setToast({ message, icon });
    timeoutRef.current = window.setTimeout(() => setToast(null), 3000);
  }, []);

  return { toast, showToast };
}
