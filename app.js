const ROLLS = [
  {
    id: "iceland",
    code: "01",
    title: "Iceland",
    place: "Iceland",
    frames: [
      "000011890019.jpg",
      "000011890025.jpg",
      "000011890033.jpg",
      "000011920018.jpg",
      "000011920027.jpg",
      "000011920035.jpg",
      "000011930031.jpg",
      "000011930037.jpg",
      "000011940021.jpg",
      "000011940036.jpg",
      "000011960024.jpg",
      "000011960037.jpg",
    ],
  },
  {
    id: "ph",
    code: "02",
    title: "Philippines",
    place: "Philippines",
    frames: [
      "000039050007.jpg",
      "000039050014.jpg",
      "000039050015.jpg",
      "000039050026.jpg",
      "000039050027.jpg",
      "000039050028.jpg",
      "000039060006.jpg",
      "000039060020.jpg",
      "000039060038.jpg",
    ],
  },
  {
    id: "italy",
    code: "03",
    title: "Italy",
    place: "Italy",
    frames: [],
  },
  {
    id: "new-york",
    code: "04",
    title: "New York",
    place: "New York",
    frames: [],
  },
];

const app = document.getElementById("app");
const IMAGE_VERSION = "v=2";

let plateState = { rollId: null, index: null, swapping: false };
let queuedPlate = null;
let viewBusy = false;
let queuedRoute = null;

function marks() {
  return `<div class="marks" aria-hidden="true"><i class="nw"></i><i class="ne"></i><i class="sw"></i><i class="se"></i></div>`;
}

function pad(n, size = 2) {
  return String(n).padStart(size, "0");
}

function parseRoute() {
  const hash = location.hash.replace(/^#\/?/, "");
  if (!hash) return { view: "cover" };
  if (hash === "index") return { view: "index" };
  const [rollId, frameRaw] = hash.split("/");
  const roll = ROLLS.find((item) => item.id === rollId);
  if (!roll) return { view: "index" };
  const index = roll.frames.length
    ? Math.max(0, Math.min(roll.frames.length - 1, Number(frameRaw || 1) - 1))
    : 0;
  return { view: "plate", roll, index };
}

function renderCover(root = app) {
  const frames = ROLLS.reduce((sum, roll) => sum + roll.frames.length, 0);
  root.innerHTML = `
    <main class="sheet">
      ${marks()}
      <div class="cover">
        <div class="meta-row">
          <span>Project 001</span>
          <span>Ramedium / Film archive</span>
          <span>Sheet 00</span>
        </div>
        <div class="cover-center">
          <p class="eyebrow">Film photography</p>
          <h1>Ramedium</h1>
          <p class="lede">Four rolls, kept apart. Iceland, Philippines, Italy, and New York. One frame at a time.</p>
        </div>
        <div class="cover-foot">
          <div class="stats">
            <div class="stat"><b>${pad(ROLLS.length)}</b><span>Rolls</span></div>
            <div class="stat"><b>${pad(frames)}</b><span>Frames</span></div>
          </div>
          <a class="enter" href="#/index">Enter rolls</a>
        </div>
      </div>
    </main>
  `;
}

function renderIndex(root = app) {
  const cards = ROLLS.map(
    (roll) => `
      <a class="roll-card" href="#/${roll.id}/1">
        <div>
          <div class="code">Roll ${roll.code}</div>
          <h3>${roll.title}</h3>
          <p>${roll.place}</p>
        </div>
        <div class="meta-row">
          <span>${roll.frames.length ? "Open plate 01" : "No frames yet"}</span>
          <span>${pad(roll.frames.length)} FR</span>
        </div>
      </a>
    `,
  ).join("");

  root.innerHTML = `
    <main class="sheet">
      ${marks()}
      <div class="meta-row">
        <a class="back" href="#/">Cover</a>
        <span>Ramedium / Film archive</span>
        <span>Sheet 01</span>
      </div>
      <div class="index-head">
        <h2>Rolls</h2>
        <span class="eyebrow" style="margin:0">Four separate sets</span>
      </div>
      <div class="rolls">${cards}</div>
    </main>
  `;
}

function frameSrc(roll, index) {
  return `web/${roll.id}/${roll.frames[index]}?${IMAGE_VERSION}`;
}

function bindPlateNav(root = app) {
  root.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => {
      const href = button.getAttribute("data-go");
      if (href) location.hash = href;
    });
  });
}

function setPlateMeta(roll, index) {
  const file = roll.frames[index];
  const current = index + 1;
  const total = roll.frames.length;
  const prevHref = index > 0 ? `#/${roll.id}/${current - 1}` : "";
  const nextHref = index < total - 1 ? `#/${roll.id}/${current + 1}` : "";

  const plateLabel = app.querySelector("[data-plate-label]");
  const frameValue = app.querySelector("[data-frame-value]");
  const fileValue = app.querySelector("[data-file-value]");
  const prevButton = app.querySelector("[data-nav='prev']");
  const nextButton = app.querySelector("[data-nav='next']");

  if (plateLabel) plateLabel.textContent = `Plate ${pad(current)} / ${pad(total)}`;
  if (frameValue) frameValue.textContent = `${pad(current)} / ${pad(total)}`;
  if (fileValue) fileValue.textContent = file.replace(".jpg", "");
  if (prevButton) {
    prevButton.dataset.go = prevHref;
    prevButton.disabled = !prevHref;
  }
  if (nextButton) {
    nextButton.dataset.go = nextHref;
    nextButton.disabled = !nextHref;
  }
}

function preloadNeighbors(roll, index) {
  [index - 1, index + 1].forEach((neighbor) => {
    if (neighbor < 0 || neighbor >= roll.frames.length) return;
    const image = new Image();
    image.src = frameSrc(roll, neighbor);
  });
}

function finishQueuedPlate() {
  plateState.swapping = false;
  if (!queuedPlate) return;
  const next = queuedPlate;
  queuedPlate = null;
  updatePlate(next.roll, next.index);
}

function slidePlate(roll, index, direction) {
  const stage = app.querySelector(".frame-stage");
  const track = app.querySelector(".frame-track");
  if (!stage || !track) {
    plateState.swapping = false;
    return;
  }

  const incoming = document.createElement("div");
  incoming.className = "frame-slide";
  const incomingImg = document.createElement("img");
  incomingImg.src = frameSrc(roll, index);
  incomingImg.alt = `${roll.title} frame ${index + 1}`;
  incoming.appendChild(incomingImg);

  const width = stage.clientWidth;
  const startX = new DOMMatrix(getComputedStyle(track).transform).m41;

  const show = () => {
    track.classList.remove("is-animating");

    if (direction > 0) {
      track.appendChild(incoming);
      track.style.transform = `translateX(${startX}px)`;
    } else {
      track.insertBefore(incoming, track.firstChild);
      track.style.transform = `translateX(${startX - width}px)`;
    }

    const endX = direction > 0 ? -width : 0;
    void track.offsetWidth;

    requestAnimationFrame(() => {
      track.classList.add("is-animating");
      track.style.transform = `translateX(${endX}px)`;
    });

    let done = false;
    const finish = (event) => {
      if (done) return;
      if (event && event.propertyName && event.propertyName !== "transform") return;
      done = true;
      [...track.querySelectorAll(".frame-slide")].forEach((slide) => {
        if (slide !== incoming) slide.remove();
      });
      track.classList.remove("is-animating");
      track.style.transform = "translateX(0)";
      finishQueuedPlate();
    };

    track.addEventListener("transitionend", finish);
    window.setTimeout(finish, 620);
  };

  incomingImg.decode().then(show).catch(show);
}

function bindSwipe(roll, root = app) {
  const stage = root.querySelector(".frame-stage");
  const track = root.querySelector(".frame-track");
  if (!stage || !track) return;

  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let dx = 0;
  let locked = null;

  stage.addEventListener("pointerdown", (event) => {
    if (plateState.swapping || event.button) return;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    dx = 0;
    locked = null;
    stage.setPointerCapture(pointerId);
  });

  stage.addEventListener("pointermove", (event) => {
    if (pointerId !== event.pointerId) return;
    const moveX = event.clientX - startX;
    const moveY = event.clientY - startY;
    if (locked === null && Math.hypot(moveX, moveY) < 8) return;
    if (locked === null) locked = Math.abs(moveX) >= Math.abs(moveY) ? "x" : "y";
    if (locked !== "x") return;

    dx = moveX;
    const atStart = plateState.index === 0 && dx > 0;
    const atEnd = plateState.index === roll.frames.length - 1 && dx < 0;
    const resisted = atStart || atEnd ? dx * 0.22 : dx;
    track.classList.remove("is-animating");
    stage.classList.add("is-dragging");
    track.style.transform = `translateX(${resisted}px)`;
  });

  const endDrag = (event) => {
    if (pointerId !== event.pointerId) return;
    pointerId = null;
    stage.classList.remove("is-dragging");

    if (locked !== "x") {
      dx = 0;
      return;
    }

    const threshold = Math.min(72, stage.clientWidth * 0.16);
    const goNext = dx < -threshold && plateState.index < roll.frames.length - 1;
    const goPrev = dx > threshold && plateState.index > 0;

    if (goNext || goPrev) {
      location.hash = `#/${roll.id}/${plateState.index + (goNext ? 2 : 0)}`;
    } else {
      track.classList.add("is-animating");
      track.style.transform = "translateX(0)";
    }
    dx = 0;
    locked = null;
  };

  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
}

function renderPlate(roll, index, root = app) {
  if (!roll.frames.length) {
    root.innerHTML = `
      <main class="sheet">
        ${marks()}
        <div class="meta-row">
          <a class="back" href="#/index">All rolls</a>
          <span>${roll.title} / ${roll.code}</span>
          <span>Plate 00 / 00</span>
        </div>
        <div class="index-head">
          <h2>${roll.title}</h2>
          <span class="eyebrow" style="margin:0">No frames yet</span>
        </div>
        <p class="lede">Drop JPEGs in images/rolls/${roll.title} and this set will fill in.</p>
      </main>
    `;
    plateState = { rollId: roll.id, index: 0, swapping: false };
    return;
  }

  const file = roll.frames[index];
  const src = frameSrc(roll, index);
  const current = index + 1;
  const total = roll.frames.length;
  const prevHref = index > 0 ? `#/${roll.id}/${current - 1}` : "";
  const nextHref = index < total - 1 ? `#/${roll.id}/${current + 1}` : "";

  root.innerHTML = `
    <main class="sheet sheet-plate">
      <div class="plate-chrome plate-top">
        <a class="back" href="#/index">All rolls</a>
        <span>${roll.title} / ${roll.code}</span>
        <span data-plate-label>Plate ${pad(current)} / ${pad(total)}</span>
      </div>
      <figure class="frame">
        <div class="frame-stage">
            <div class="frame-track">
              <div class="frame-slide">
                <img src="${src}" alt="${roll.title} frame ${current}" />
              </div>
            </div>
        </div>
      </figure>
      <aside class="plate-chrome plate-side">
        <div class="title-block">
          <div class="eyebrow">Title block</div>
          <h2>${roll.title}</h2>
          <dl class="spec">
            <dt>Roll</dt><dd>${roll.code}</dd>
            <dt>Frame</dt><dd data-frame-value>${pad(current)} / ${pad(total)}</dd>
            <dt>Place</dt><dd>${roll.place}</dd>
            <dt>File</dt><dd data-file-value>${file.replace(".jpg", "")}</dd>
          </dl>
          <div class="nav-row">
            <button type="button" data-nav="prev" data-go="${prevHref}" ${prevHref ? "" : "disabled"}>Prev</button>
            <button type="button" data-nav="next" data-go="${nextHref}" ${nextHref ? "" : "disabled"}>Next</button>
          </div>
        </div>
      </aside>
    </main>
  `;

  bindPlateNav(root);
  bindSwipe(roll, root);
  preloadNeighbors(roll, index);
  plateState = { rollId: roll.id, index, swapping: false };
}

function updatePlate(roll, index) {
  if (plateState.index === index) return;
  if (plateState.swapping) {
    queuedPlate = { roll, index };
    return;
  }
  const direction = index > plateState.index ? 1 : -1;
  plateState.index = index;
  plateState.swapping = true;
  setPlateMeta(roll, index);
  slidePlate(roll, index, direction);
  preloadNeighbors(roll, index);
}

function currentViewName() {
  const live = [...app.querySelectorAll(".sheet")].find(
    (sheet) => !sheet.classList.contains("sheet-ghost"),
  );
  if (!live) return null;
  if (live.querySelector(".cover")) return "cover";
  if (live.querySelector(".frame-stage")) return "plate";
  if (live.querySelector(".rolls")) return "index";
  return null;
}

function paint(route, root = app) {
  if (route.view === "cover") {
    plateState = { rollId: null, index: null, swapping: false };
    renderCover(root);
    return;
  }
  if (route.view === "plate") {
    renderPlate(route.roll, route.index, root);
    return;
  }
  plateState = { rollId: null, index: null, swapping: false };
  renderIndex(root);
}

function viewMotion(from, to) {
  if (from === "cover" && to === "index") return { exit: "up", enter: "from-down" };
  if (from === "index" && to === "cover") return { exit: "down", enter: "from-up" };
  if (from === "index" && to === "plate") return { exit: "left", enter: "from-right" };
  if (from === "plate" && to === "index") return { exit: "right", enter: "from-left" };
  if (from === "plate" && to === "plate") return { exit: "left", enter: "from-right" };
  return { exit: "left", enter: "from-right" };
}

function finishViewTransition() {
  viewBusy = false;
  if (!queuedRoute) return;
  queuedRoute = null;
  render();
}

function transitionViews(from, route) {
  const outgoing = [...app.querySelectorAll(".sheet")].find(
    (sheet) => !sheet.classList.contains("sheet-ghost"),
  );
  if (!outgoing) {
    paint(route);
    return;
  }

  viewBusy = true;
  const motion = viewMotion(from, route.view);
  const layer = document.createElement("div");
  paint(route, layer);
  const incoming = layer.firstElementChild;
  if (!incoming) {
    viewBusy = false;
    return;
  }

  outgoing.classList.add("sheet-ghost");
  incoming.classList.add(`enter-${motion.enter}`);
  app.appendChild(incoming);
  void incoming.offsetWidth;

  requestAnimationFrame(() => {
    outgoing.classList.add(`leave-${motion.exit}`);
    incoming.classList.remove(`enter-${motion.enter}`);
  });

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    outgoing.remove();
    finishViewTransition();
  };

  outgoing.addEventListener("transitionend", finish);
  window.setTimeout(finish, 560);
}

function render() {
  const route = parseRoute();
  const livePlate =
    plateState.rollId === route.roll?.id &&
    app.querySelector(".frame-stage") &&
    !app.querySelector(".sheet-ghost");

  if (route.view === "plate" && livePlate) {
    updatePlate(route.roll, route.index);
    return;
  }

  if (viewBusy) {
    queuedRoute = route;
    return;
  }

  const from = currentViewName();
  if (!from) {
    paint(route);
    return;
  }

  if (from === route.view && route.view !== "plate") return;
  transitionViews(from, route);
}

window.addEventListener("hashchange", render);
window.addEventListener("keydown", (event) => {
  const route = parseRoute();
  if (event.key === "Escape") {
    location.hash = "#/index";
    return;
  }
  if (route.view !== "plate") return;
  if (event.key === "ArrowRight" && route.index < route.roll.frames.length - 1) {
    location.hash = `#/${route.roll.id}/${route.index + 2}`;
  }
  if (event.key === "ArrowLeft" && route.index > 0) {
    location.hash = `#/${route.roll.id}/${route.index}`;
  }
});

render();
