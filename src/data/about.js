/*
 * Everything on the About sheet lives here so the copy can be edited without
 * touching the component. Any field left empty is simply not rendered.
 */

export const ABOUT = {
  name: "Regie Agustin",
  role: "Film photography",

  bio: [
    "I shoot 35mm and carry a digital body for the frames that will not wait. Ramedium is where those rolls end up: kept apart, one set per place, so each trip reads the way it was shot rather than blending into a single feed.",
    "The archive covers Iceland, the Philippines, Italy, and New York. I scan the negatives, sequence each roll by frame number, and leave them in shooting order.",
  ],

  // TODO: swap in the address you want employers to use.
  email: "",

  links: [
    { label: "GitHub", href: "https://github.com/miinks" },
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
