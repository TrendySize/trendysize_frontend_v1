import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

/*
|--------------------------------------------------------------------------
| PAGE TRANSITION
|--------------------------------------------------------------------------
| Wraps the routed view and plays a single, restrained entrance on every
| route change. It animates OPACITY ONLY (not transform): the app shell
| (fixed sidebar / bottom nav) lives inside this wrapper, and a transformed
| ancestor would become the containing block for those fixed elements,
| causing a visible jump on first paint. Fully static under reduced motion.
| Keyed on pathname so React remounts the wrapper per route.
|
*/

export default function PageTransition({ children }) {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div key={location.pathname}>{children}</div>;
  }

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
