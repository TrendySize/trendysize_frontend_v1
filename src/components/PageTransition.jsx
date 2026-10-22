import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";

/*
|--------------------------------------------------------------------------
| ROUTE TRANSITION
|--------------------------------------------------------------------------
| Applies a short opacity handoff after the next route is ready. It avoids
| transform so fixed app navigation remains fixed, and stays out of the way
| for users who prefer reduced motion.
|
*/

export default function PageTransition({ children, routeKey }) {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const controls = useAnimationControls();
  const currentRoute = routeKey ?? location.pathname;
  const previousRoute = useRef(currentRoute);

  useEffect(() => {
    if (shouldReduceMotion) {
      controls.set({ opacity: 1 });
      previousRoute.current = currentRoute;
      return;
    }

    if (previousRoute.current === currentRoute) return;
    previousRoute.current = currentRoute;
    controls.set({ opacity: 0.98 });
    controls.start({
      opacity: 1,
      transition: { duration: 0.16, ease: [0.2, 0.75, 0.25, 1] },
    });
  }, [currentRoute, shouldReduceMotion, controls]);

  if (shouldReduceMotion) return <div>{children}</div>;

  return (
    <motion.div initial={false} animate={controls}>
      {children}
    </motion.div>
  );
}
