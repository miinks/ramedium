export const ROLLS = [
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

const IMAGE_VERSION = "v=2";

export function frameSrc(roll, index) {
  return `/web/${roll.id}/${roll.frames[index]}?${IMAGE_VERSION}`;
}

export function pad(n, size = 2) {
  return String(n).padStart(size, "0");
}
