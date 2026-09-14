import { ROLLS, pad } from "../data/rolls";
import { Marks, MetaRow, Sheet, SHEET_PAD } from "./Sheet";

function RollCard({ roll }) {
  return (
    <a
      className="flex min-h-[360px] flex-col justify-between border border-ink p-[22px] text-left hover:outline-1 hover:outline-offset-[3px] hover:outline-ink"
      href={`#/${roll.id}/1`}
    >
      <div>
        <div className="tracking-[0.14em] text-mute">Roll {roll.code}</div>
        <h3 className="mt-8 mb-2 font-display text-[clamp(40px,7vw,72px)] leading-[0.9] font-normal">
          {roll.title}
        </h3>
        <p className="text-mute">{roll.place}</p>
      </div>
      <MetaRow>
        <span>{roll.frames.length ? "Open plate 01" : "No frames yet"}</span>
        <span>{pad(roll.frames.length)} FR</span>
      </MetaRow>
    </a>
  );
}

export default function RollIndex({ ghost, motion }) {
  return (
    <Sheet ghost={ghost} motion={motion} className={SHEET_PAD}>
      <Marks />
      <MetaRow>
        <a
          className="border border-line px-2.5 py-2 text-[10px] tracking-[0.08em] uppercase hover:border-ink"
          href="#/"
        >
          Cover
        </a>
        <span>Ramedium / Film archive</span>
        <span>Sheet 01</span>
      </MetaRow>

      <div className="mt-7 mb-9 flex items-baseline justify-between">
        <h2 className="font-display text-[42px] font-normal">Rolls</h2>
        <span className="text-[11px] tracking-[0.14em] text-mute uppercase">
          Four separate sets
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {ROLLS.map((roll) => (
          <RollCard key={roll.id} roll={roll} />
        ))}
      </div>
    </Sheet>
  );
}
