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
];

const app = document.getElementById("app");

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
  const index = Math.max(0, Math.min(roll.frames.length - 1, Number(frameRaw || 1) - 1));
  return { view: "plate", roll, index };
}

function renderCover() {
  const frames = ROLLS.reduce((sum, roll) => sum + roll.frames.length, 0);
  app.innerHTML = `
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
          <p class="lede">Two rolls, kept apart. Iceland and Philippines. One frame at a time.</p>
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

function renderIndex() {
  const cards = ROLLS.map(
    (roll) => `
      <a class="roll-card" href="#/${roll.id}/1">
        <div>
          <div class="code">Roll ${roll.code}</div>
          <h3>${roll.title}</h3>
          <p>${roll.place}</p>
        </div>
        <div class="meta-row">
          <span>Open plate 01</span>
          <span>${pad(roll.frames.length)} FR</span>
        </div>
      </a>
    `,
  ).join("");

  app.innerHTML = `
    <main class="sheet">
      ${marks()}
      <div class="meta-row">
        <a class="back" href="#/">Cover</a>
        <span>Ramedium / Film archive</span>
        <span>Sheet 01</span>
      </div>
      <div class="index-head">
        <h2>Rolls</h2>
        <span class="eyebrow" style="margin:0">Two separate sets</span>
      </div>
      <div class="rolls">${cards}</div>
    </main>
  `;
}

function renderPlate(roll, index) {
  const file = roll.frames[index];
  const src = `web/${roll.id}/${file}?v=2`;
  const current = index + 1;
  const total = roll.frames.length;
  const prevHref = index > 0 ? `#/${roll.id}/${current - 1}` : "";
  const nextHref = index < total - 1 ? `#/${roll.id}/${current + 1}` : "";

  app.innerHTML = `
    <main class="sheet">
      ${marks()}
      <div class="meta-row">
        <a class="back" href="#/index">All rolls</a>
        <span>${roll.title} / ${roll.code}</span>
        <span>Plate ${pad(current)} / ${pad(total)}</span>
      </div>
      <div class="plate-layout">
        <figure class="frame">
          ${marks()}
          <img src="${src}" alt="${roll.title} frame ${current}" />
        </figure>
        <aside>
          <div class="title-block">
            <div class="eyebrow">Title block</div>
            <h2>${roll.title}</h2>
            <dl class="spec">
              <dt>Roll</dt><dd>${roll.code}</dd>
              <dt>Frame</dt><dd>${pad(current)} / ${pad(total)}</dd>
              <dt>Place</dt><dd>${roll.place}</dd>
              <dt>File</dt><dd>${file.replace(".jpg", "")}</dd>
            </dl>
            <div class="nav-row">
              <button type="button" data-go="${prevHref}" ${prevHref ? "" : "disabled"}>Prev</button>
              <button type="button" data-go="${nextHref}" ${nextHref ? "" : "disabled"}>Next</button>
            </div>
          </div>
          <p class="note">Arrow keys move frames. Esc returns to the roll index.</p>
        </aside>
      </div>
    </main>
  `;

  app.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => {
      const href = button.getAttribute("data-go");
      if (href) location.hash = href;
    });
  });

  const nextFile = roll.frames[index + 1];
  if (nextFile) {
    const preload = new Image();
    preload.src = `web/${roll.id}/${nextFile}?v=2`;
  }
}

function render() {
  const route = parseRoute();
  if (route.view === "cover") renderCover();
  else if (route.view === "plate") renderPlate(route.roll, route.index);
  else renderIndex();
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
