import { useEffect, useState } from "react";
import { ROLLS } from "../data/rolls";

export function parseRoute(hash = window.location.hash) {
  const path = hash.replace(/^#\/?/, "");
  if (!path) return { view: "cover" };
  if (path === "index") return { view: "index" };
  if (path === "about") return { view: "about" };

  const [rollId, frameRaw] = path.split("/");
  const roll = ROLLS.find((item) => item.id === rollId);
  if (!roll) return { view: "index" };

  const index = roll.frames.length
    ? Math.max(0, Math.min(roll.frames.length - 1, Number(frameRaw || 1) - 1))
    : 0;
  return { view: "plate", roll, index };
}

export function useHashRoute() {
  const [route, setRoute] = useState(parseRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}

export function useArrowKeys() {
  useEffect(() => {
    const onKeyDown = (event) => {
      const route = parseRoute();
      if (event.key === "Escape") {
        window.location.hash = "#/index";
        return;
      }
      if (route.view !== "plate") return;
      if (event.key === "ArrowRight" && route.index < route.roll.frames.length - 1) {
        window.location.hash = `#/${route.roll.id}/${route.index + 2}`;
      }
      if (event.key === "ArrowLeft" && route.index > 0) {
        window.location.hash = `#/${route.roll.id}/${route.index}`;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
