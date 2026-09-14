import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { frameSrc, pad } from "../data/rolls";
import { Marks, MetaRow, Sheet, SHEET_PAD } from "./Sheet";

const SLIDE_FALLBACK_MS = 620;

const PLATE_LAYOUT =
  "grid h-[100dvh] grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden " +
  "wide:grid-cols-[minmax(0,1fr)_240px] wide:grid-rows-[auto_minmax(0,1fr)]";

const BACK_LINK =
  "border border-line px-2.5 py-2 text-[10px] tracking-[0.08em] uppercase hover:border-ink";

function EmptyPlate({ roll, ghost, motion }) {
  return (
    <Sheet ghost={ghost} motion={motion} className={SHEET_PAD}>
      <Marks />
      <MetaRow>
        <a className={BACK_LINK} href="#/index">
          All rolls
        </a>
        <span>
          {roll.title} / {roll.code}
        </span>
        <span>Plate 00 / 00</span>
      </MetaRow>

      <div className="mt-7 mb-9 flex items-baseline justify-between">
        <h2 className="font-display text-[42px] font-normal">{roll.title}</h2>
        <span className="text-[11px] tracking-[0.14em] text-mute uppercase">No frames yet</span>
      </div>

      <p className="max-w-[36ch] text-[15px] text-mute">
        Drop JPEGs in images/rolls/{roll.title} and this set will fill in.
      </p>
    </Sheet>
  );
}

function FramePlate({ roll, index, ghost, motion }) {
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const slideEls = useRef(new Map());

  const [slides, setSlides] = useState(() => [{ key: 0, i: index }]);
  const [pending, setPending] = useState(null);

  const shownRef = useRef(index);
  const swappingRef = useRef(false);
  const queuedRef = useRef(null);
  const keyRef = useRef(1);

  const total = roll.frames.length;
  const current = index + 1;

  const startSwap = useCallback(
    (target) => {
      const stage = stageRef.current;
      const track = trackRef.current;
      if (!stage || !track) return;

      const direction = target > shownRef.current ? 1 : -1;
      swappingRef.current = true;
      shownRef.current = target;

      const width = stage.clientWidth;
      const raw = getComputedStyle(track).transform;
      const startX = raw && raw !== "none" ? new DOMMatrix(raw).m41 : 0;
      const key = keyRef.current++;

      const begin = () => {
        setSlides((prev) =>
          direction > 0 ? [...prev, { key, i: target }] : [{ key, i: target }, ...prev],
        );
        setPending({ key, target, direction, width, startX });
      };

      const image = new Image();
      image.src = frameSrc(roll, target);
      image.decode().then(begin).catch(begin);
    },
    [roll],
  );

  useEffect(() => {
    if (index === shownRef.current) return;
    if (swappingRef.current) {
      queuedRef.current = index;
      return;
    }
    startSwap(index);
  }, [index, startSwap]);

  // Drive the slide and crossfade imperatively, so the class flips land on the
  // exact frames they need to. The JSX class names never change, which is what
  // keeps React from clobbering them on re-render.
  useLayoutEffect(() => {
    if (!pending) return undefined;

    const track = trackRef.current;
    const { key, target, direction, width, startX } = pending;
    const incoming = slideEls.current.get(key);
    if (!track || !incoming) return undefined;

    const outgoing = [...slideEls.current.entries()]
      .filter(([slideKey]) => slideKey !== key)
      .map(([, el]) => el);

    incoming.classList.add("is-entering");
    track.classList.remove("is-animating");
    track.style.transform = `translateX(${direction > 0 ? startX : startX - width}px)`;
    void track.offsetWidth;

    const endX = direction > 0 ? -width : 0;
    let done = false;
    let timer;

    const raf = requestAnimationFrame(() => {
      if (done) return;
      track.classList.add("is-animating");
      track.style.transform = `translateX(${endX}px)`;
      incoming.classList.remove("is-entering");
      outgoing.forEach((el) => el.classList.add("is-leaving"));
    });

    const finish = (event) => {
      if (done) return;
      if (event && event.propertyName && event.propertyName !== "transform") return;
      done = true;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      track.removeEventListener("transitionend", finish);

      track.classList.remove("is-animating");
      track.style.transform = "translateX(0)";
      incoming.classList.remove("is-entering", "is-leaving");

      swappingRef.current = false;
      setSlides([{ key, i: target }]);
      setPending(null);

      const queued = queuedRef.current;
      queuedRef.current = null;
      if (queued !== null && queued !== shownRef.current) startSwap(queued);
    };

    timer = setTimeout(finish, SLIDE_FALLBACK_MS);
    track.addEventListener("transitionend", finish);

    return () => {
      done = true;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      track.removeEventListener("transitionend", finish);
    };
  }, [pending, startSwap]);

  useEffect(() => {
    [index - 1, index + 1].forEach((neighbor) => {
      if (neighbor < 0 || neighbor >= total) return;
      const image = new Image();
      image.src = frameSrc(roll, neighbor);
    });
  }, [roll, index, total]);

  const drag = useRef({ pointerId: null, startX: 0, startY: 0, dx: 0, locked: null });

  const onPointerDown = (event) => {
    if (swappingRef.current || event.button) return;
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dx: 0,
      locked: null,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    const state = drag.current;
    if (state.pointerId !== event.pointerId) return;

    const moveX = event.clientX - state.startX;
    const moveY = event.clientY - state.startY;
    if (state.locked === null && Math.hypot(moveX, moveY) < 8) return;
    if (state.locked === null) {
      state.locked = Math.abs(moveX) >= Math.abs(moveY) ? "x" : "y";
    }
    if (state.locked !== "x") return;

    state.dx = moveX;
    const atStart = shownRef.current === 0 && state.dx > 0;
    const atEnd = shownRef.current === total - 1 && state.dx < 0;
    const resisted = atStart || atEnd ? state.dx * 0.22 : state.dx;

    trackRef.current.classList.remove("is-animating");
    stageRef.current.classList.add("is-dragging");
    trackRef.current.style.transform = `translateX(${resisted}px)`;
  };

  const onPointerEnd = (event) => {
    const state = drag.current;
    if (state.pointerId !== event.pointerId) return;
    state.pointerId = null;
    stageRef.current?.classList.remove("is-dragging");

    if (state.locked !== "x") {
      state.dx = 0;
      return;
    }

    const threshold = Math.min(72, stageRef.current.clientWidth * 0.16);
    const goNext = state.dx < -threshold && shownRef.current < total - 1;
    const goPrev = state.dx > threshold && shownRef.current > 0;

    if (goNext || goPrev) {
      window.location.hash = `#/${roll.id}/${shownRef.current + (goNext ? 2 : 0)}`;
    } else {
      trackRef.current.classList.add("is-animating");
      trackRef.current.style.transform = "translateX(0)";
    }

    state.dx = 0;
    state.locked = null;
  };

  const go = (target) => {
    window.location.hash = `#/${roll.id}/${target}`;
  };

  return (
    <Sheet ghost={ghost} motion={motion} className={PLATE_LAYOUT}>
      <div className="col-span-full row-start-1 flex justify-between gap-4 border-b border-line px-6 py-4 text-[11px] tracking-[0.08em] uppercase">
        <a className={BACK_LINK} href="#/index">
          All rolls
        </a>
        <span>
          {roll.title} / {roll.code}
        </span>
        <span>
          Plate {pad(current)} / {pad(total)}
        </span>
      </div>

      <figure className="relative col-start-1 row-start-2 m-0 min-h-0 min-w-0 self-stretch p-0">
        <div
          ref={stageRef}
          className="frame-stage absolute inset-0 h-full w-full cursor-grab touch-pan-y overflow-hidden select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        >
          <div ref={trackRef} className="frame-track flex h-full items-stretch">
            {slides.map((slide) => (
              <div
                key={slide.key}
                ref={(el) => {
                  if (el) slideEls.current.set(slide.key, el);
                  else slideEls.current.delete(slide.key);
                }}
                className="frame-slide flex h-full w-full shrink-0 grow-0 basis-full items-center justify-center"
              >
                <img
                  src={frameSrc(roll, slide.i)}
                  alt={`${roll.title} frame ${slide.i + 1}`}
                  className="pointer-events-none block h-auto max-h-full w-auto max-w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </figure>

      <aside className="col-start-1 row-start-3 overflow-auto border-t border-line p-4 wide:col-start-2 wide:row-start-2 wide:border-t-0 wide:border-l wide:px-6 wide:pt-5 wide:pb-6">
        <div>
          <div className="text-[11px] tracking-[0.14em] text-mute uppercase">Title block</div>
          <h2 className="mt-2 mb-4 font-display text-[28px] font-normal">{roll.title}</h2>

          <dl className="grid grid-cols-[72px_1fr] gap-x-2.5 gap-y-2 border-t border-line pt-3">
            <dt className="text-[10px] tracking-[0.1em] text-mute uppercase">Roll</dt>
            <dd className="m-0">{roll.code}</dd>
            <dt className="text-[10px] tracking-[0.1em] text-mute uppercase">Frame</dt>
            <dd className="m-0">
              {pad(current)} / {pad(total)}
            </dd>
            <dt className="text-[10px] tracking-[0.1em] text-mute uppercase">Place</dt>
            <dd className="m-0">{roll.place}</dd>
            <dt className="text-[10px] tracking-[0.1em] text-mute uppercase">File</dt>
            <dd className="m-0">{roll.frames[index].replace(".jpg", "")}</dd>
          </dl>

          <div className="mt-4 flex justify-between gap-3">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => go(current - 1)}
              className="border border-line px-2.5 py-2 text-[10px] tracking-[0.08em] uppercase not-disabled:hover:border-ink"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={index >= total - 1}
              onClick={() => go(current + 1)}
              className="border border-line px-2.5 py-2 text-[10px] tracking-[0.08em] uppercase not-disabled:hover:border-ink"
            >
              Next
            </button>
          </div>
        </div>
      </aside>
    </Sheet>
  );
}

export default function Plate({ roll, index, ghost, motion }) {
  if (!roll.frames.length) return <EmptyPlate roll={roll} ghost={ghost} motion={motion} />;
  return <FramePlate roll={roll} index={index} ghost={ghost} motion={motion} />;
}
