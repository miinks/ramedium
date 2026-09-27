/*
 * Everything on the About sheet lives here so the copy can be edited without
 * touching the component. Any field left empty is simply not rendered.
 */

export const ABOUT = {
  name: "Regie Agustin",
  role: "Photography & computer science",

  bio: [
    "I study computer science and shoot film. Both are about systems: what you keep, what you throw away, and how a sequence of small decisions becomes something someone else can read. A roll of 35mm is a dataset I cannot shuffle later. Building the archive that holds it is the other half of the work.",
    "Ramedium is that archive. I scan the negatives, keep each place on its own roll, and sequence frames in shooting order. The site is a React app I wrote so the pictures would stay as quiet as the contact sheet, with the same care I try to bring to interfaces and data.",
    "I am also building a real-time airplane tracker: live flight positions on a map, updated as the planes move. It is the same instinct as photography, pointed at a different stream. One medium freezes a moment. The other has to keep up with it.",
  ],

  email: "agustinreyregie@gmail.com",

  links: [
    { label: "GitHub", href: "https://github.com/miinks" },
    { label: "Flight tracker", href: "https://github.com/miinks/Meridian" },
    // TODO: add your own, e.g.
    // { label: "Instagram", href: "https://instagram.com/…" },
    // { label: "LinkedIn", href: "https://linkedin.com/in/…" },
  ],

  gear: [
    { term: "Film", detail: "Canon AE-1, 35mm" },
    { term: "Digital", detail: "Fujifilm X100VI" },
    { term: "Approach", detail: "Available light, no staging" },
  ],

  // Drop a PDF in public/ and point href at it, e.g. "/jr-agustin-resume.pdf".
  resume: {
    href: "",
    label: "Download PDF",
    fallback: "Available on request",
  },

  colophon: [
    { term: "Build", detail: "React 19, Vite" },
    { term: "Styles", detail: "Tailwind CSS 4" },
    { term: "Motion", detail: "Hand-written, no animation library" },
  ],
};
