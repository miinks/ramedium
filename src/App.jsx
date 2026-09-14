import { useEffect, useLayoutEffect, useState } from "react";
import Cover from "./components/Cover";
import Plate from "./components/Plate";
import RollIndex from "./components/RollIndex";
import { useArrowKeys, useHashRoute } from "./hooks/useHashRoute";

const VIEW_MS = 560;

// Identifies the mounted component. Frame changes inside one roll keep the same
// key so the Plate survives and can run its own slide instead of remounting.
function viewKey(route) {
  return route.view === "plate" ? `plate:${route.roll.id}` : route.view;
}

function routeKey(route) {
  return route.view === "plate" ? `plate:${route.roll.id}:${route.index}` : route.view;
}

function viewMotion(from, to) {
  if (from === "cover" && to === "index") return { exit: "up", enter: "from-down" };
  if (from === "index" && to === "cover") return { exit: "down", enter: "from-up" };
  if (from === "index" && to === "plate") return { exit: "left", enter: "from-right" };
  if (from === "plate" && to === "index") return { exit: "right", enter: "from-left" };
  if (from === "plate" && to === "plate") return { exit: "left", enter: "from-right" };
  return { exit: "left", enter: "from-right" };
}

function View({ route, ghost, motion }) {
  if (route.view === "cover") return <Cover ghost={ghost} motion={motion} />;
  if (route.view === "plate") {
    return <Plate roll={route.roll} index={route.index} ghost={ghost} motion={motion} />;
  }
  return <RollIndex ghost={ghost} motion={motion} />;
}

export default function App() {
  const route = useHashRoute();
  useArrowKeys();

  const [displayed, setDisplayed] = useState(route);
  const [ghost, setGhost] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const [enter, setEnter] = useState(null);

  const busy = ghost !== null;

  useEffect(() => {
    // While a view transition runs, later hash changes wait their turn and are
    // picked up when this effect re-runs on the way out.
    if (busy) return;
    if (routeKey(route) === routeKey(displayed)) return;

    if (viewKey(route) === viewKey(displayed)) {
      setDisplayed(route);
      return;
    }

    const motion = viewMotion(displayed.view, route.view);
    setGhost({ route: displayed, exit: motion.exit });
    setLeaving(false);
    setEnter(motion.enter);
    setDisplayed(route);
  }, [route, displayed, busy]);

  useLayoutEffect(() => {
    if (!ghost) return undefined;
    // Flush the entry styles so the browser has a value to transition away from.
    void document.body.offsetWidth;

    const raf = requestAnimationFrame(() => {
      setLeaving(true);
      setEnter(null);
    });
    // Runs whether or not the frame callback fired, so a throttled tab can
    // never strand the outgoing sheet on screen.
    const timer = setTimeout(() => {
      setGhost(null);
      setLeaving(false);
      setEnter(null);
    }, VIEW_MS);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [ghost]);

  const sheets = [];
  if (ghost) {
    sheets.push(
      <View
        key={viewKey(ghost.route)}
        route={ghost.route}
        ghost
        motion={leaving ? `leave-${ghost.exit}` : ""}
      />,
    );
  }
  sheets.push(
    <View key={viewKey(displayed)} route={displayed} motion={enter ? `enter-${enter}` : ""} />,
  );

  return (
    <>
      <div className="paper-grid pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
      <div className="relative z-[1] min-h-screen overflow-hidden">{sheets}</div>
    </>
  );
}
