import { Fragment } from "react";
import { ABOUT } from "../data/about";
import { Marks, MetaRow, Sheet, SHEET_PAD } from "./Sheet";

const LINK_BUTTON =
  "border border-line px-2.5 py-2 text-[10px] tracking-[0.08em] uppercase hover:border-ink";

function Block({ title, children }) {
  return (
    <section className="border-t border-line pt-3">
      <div className="mb-3 text-[10px] tracking-[0.1em] text-mute uppercase">{title}</div>
      {children}
    </section>
  );
}

function Spec({ rows }) {
  return (
    <dl className="grid grid-cols-[88px_1fr] gap-x-2.5 gap-y-2">
      {rows.map((row) => (
        <Fragment key={row.term}>
          <dt className="text-[10px] tracking-[0.1em] text-mute uppercase">{row.term}</dt>
          <dd className="m-0">{row.detail}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

export default function About({ ghost, motion }) {
  const { name, role, bio, email, links, gear, resume, colophon } = ABOUT;

  return (
    <Sheet ghost={ghost} motion={motion} className={SHEET_PAD}>
      <Marks />
      <MetaRow>
        <span className="flex gap-2">
          <a className={LINK_BUTTON} href="#/">
            Cover
          </a>
          <a className={LINK_BUTTON} href="#/index">
            All rolls
          </a>
        </span>
        <span>Ramedium / Film archive</span>
        <span>Sheet 02</span>
      </MetaRow>

      <div className="mt-7 mb-9 flex items-baseline justify-between">
        <h2 className="font-display text-[42px] font-normal">About</h2>
        <span className="text-[11px] tracking-[0.14em] text-mute uppercase">{role}</span>
      </div>

      <div className="grid gap-10 wide:grid-cols-[minmax(0,1fr)_300px] wide:gap-14">
        <div>
          <h3 className="mb-6 font-display text-[clamp(36px,6vw,64px)] leading-[0.95] font-normal">
            {name}
          </h3>
          {bio.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className="mb-4 max-w-[52ch] text-[15px] text-mute">
              {paragraph}
            </p>
          ))}
        </div>

        <aside className="flex flex-col gap-7">
          {(email || links.length > 0) && (
            <Block title="Contact">
              {email && (
                <p className="mb-3">
                  <a className="underline underline-offset-4 hover:text-accent" href={`mailto:${email}`}>
                    {email}
                  </a>
                </p>
              )}
              {links.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {links.map((link) => (
                    <a
                      key={link.href}
                      className={LINK_BUTTON}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </Block>
          )}

          <Block title="Resume">
            {resume.href ? (
              <a className={LINK_BUTTON} href={resume.href} target="_blank" rel="noreferrer">
                {resume.label}
              </a>
            ) : (
              <p className="text-mute">{resume.fallback}</p>
            )}
          </Block>

          <Block title="Gear &amp; process">
            <Spec rows={gear} />
          </Block>

          <Block title="Colophon">
            <Spec rows={colophon} />
          </Block>
        </aside>
      </div>
    </Sheet>
  );
}
