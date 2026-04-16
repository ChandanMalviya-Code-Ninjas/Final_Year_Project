import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes

const AutoLogout = () => {
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoggedIn = useRef(false);

  const handleLogout = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.auth.signOut();
    toast.warning("You've been logged out due to 30 minutes of inactivity.", {
      duration: 5000,
    });
    navigate("/login");
  }, [navigate]);

  const resetTimer = useCallback(() => {
    if (!isLoggedIn.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT_MS);
  }, [handleLogout]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      isLoggedIn.current = !!session;
      if (session) resetTimer();
    };

    checkSession();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      isLoggedIn.current = !!session;
      if (session) {
        resetTimer();
      } else {
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    });

    // Activity events
    const activityEvents: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];

    activityEvents.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true })
    );

    return () => {
      subscription.unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
      activityEvents.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [resetTimer]);

  return null; // This component renders nothing
};

export default AutoLogout;
