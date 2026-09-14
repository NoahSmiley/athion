import { FOOTER, NOTE_HTML, STEPS } from "@/lib/rack/content";

export function Steps() {
  return (
    <>
      <section className="rack-section">
        <div className="rack-eyebrow">cutover</div>
        <h2>Migration in one evening, zero guest changes</h2>
        <ol className="rack-steps">
          {STEPS.map((s, i) => (
            <li key={i}>
              <b>{s.title}</b>
              <span dangerouslySetInnerHTML={{ __html: s.body }} />
            </li>
          ))}
        </ol>
        <div className="rack-note" dangerouslySetInnerHTML={{ __html: NOTE_HTML }} />
      </section>
      <footer className="rack-footer">{FOOTER}</footer>
    </>
  );
}
