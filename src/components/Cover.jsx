import { ROLLS, pad } from "../data/rolls";
import { Marks, MetaRow, Sheet, SHEET_PAD } from "./Sheet";

function Stat({ value, label }) {
  return (
    <div>
      <b className="block text-[18px] font-medium">{value}</b>
      <span className="text-[10px] tracking-[0.1em] text-mute uppercase">{label}</span>
    </div>
  );
}

export default function Cover({ ghost, motion }) {
  const frames = ROLLS.reduce((sum, roll) => sum + roll.frames.length, 0);

  return (
    <Sheet ghost={ghost} motion={motion} className={SHEET_PAD}>
      <Marks />
      <div className="flex min-h-[calc(100vh-68px)] flex-col justify-between">
        <MetaRow>
          <span>Project 001</span>
          <span>Ramedium / Film archive</span>
          <span>Sheet 00</span>
        </MetaRow>

        <div className="max-w-[720px] pt-[12vh] pb-[8vh]">
          <p className="mb-[18px] text-[11px] tracking-[0.14em] text-mute uppercase">
            Film photography
          </p>
          <h1 className="mb-5 font-display text-[clamp(56px,12vw,104px)] leading-[0.9] font-normal">
            Ramedium
          </h1>
          <p className="max-w-[36ch] text-[15px] text-mute">
            Four rolls, kept apart. Iceland, Philippines, Italy, and New York. One frame at a
            time.
          </p>
        </div>

        <div className="flex items-end justify-between gap-6 border-t border-line pt-4">
          <div className="flex gap-7">
            <Stat value={pad(ROLLS.length)} label="Rolls" />
            <Stat value={pad(frames)} label="Frames" />
          </div>
          <a
            className="border border-ink px-4 py-2.5 text-[11px] tracking-[0.12em] uppercase hover:bg-ink hover:text-paper"
            href="#/index"
          >
            Enter rolls
          </a>
        </div>
      </div>
    </Sheet>
  );
}
