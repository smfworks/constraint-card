import type { ConstraintCardDoc } from "../types";
import { formatStampTime } from "../lib/share";

interface ConstraintCardProps {
  card: ConstraintCardDoc | null;
}

function barcodeBars(id: string): number[] {
  const bars: number[] = [];
  for (let i = 0; i < 36; i += 1) {
    const code = id.charCodeAt(i % id.length) + i * 17;
    bars.push(1 + (code % 4));
  }
  return bars;
}

function RuleList({
  items,
  empty,
  tone,
}: {
  items: string[];
  empty: string;
  tone: string;
}) {
  if (!items.length) {
    return <p className="r-placeholder">{empty}</p>;
  }
  return (
    <ol className={`clauses ${tone}`}>
      {items.map((line, index) => (
        <li key={line}>
          <span className="n">{index + 1}</span>
          <span>{line}</span>
        </li>
      ))}
    </ol>
  );
}

export function ConstraintCard({ card }: ConstraintCardProps) {
  const ready = Boolean(
    card?.title && card.must.length && card.mustNot.length && card.stop.length,
  );
  const tone = ready ? "is-go" : "is-empty";

  return (
    <article className={`ticket ${tone}`}>
      <div className="ticket-rail" aria-hidden="true" />
      <header className="ticket-head">
        <div>
          <p className="r-kicker">Standing constitution</p>
          <h2>Constraint</h2>
        </div>
        <p className="ticket-seq">{card?.id ?? "CC-————"}</p>
      </header>

      <div className="perf" aria-hidden="true">
        <span />
      </div>

      <div className="ticket-body">
        <div className="stamp-row">
          <div className={`wax ${tone}`}>
            <div className="wax-ring" />
            <div className="wax-core">
              <span className="wax-kicker">SMF WORKS</span>
              <strong>{ready ? "BOUND" : "DRAFT"}</strong>
              <span className="wax-sub">{ready ? "CONSTITUTION" : "FILL RULES"}</span>
            </div>
          </div>
          <dl className="codes">
            <div>
              <dt>Stamp</dt>
              <dd>{ready ? "CONSTRAINT" : "—"}</dd>
            </div>
            <div>
              <dt>Session</dt>
              <dd>{card?.session || "STANDING"}</dd>
            </div>
            <div>
              <dt>Class</dt>
              <dd>HARD RULES</dd>
            </div>
          </dl>
        </div>

        <section className="r-hero">
          <p className="r-label">Title</p>
          <h3>{card?.title || "Name the constitution."}</h3>
        </section>

        {card?.agent || card?.scope ? (
          <dl className="parties">
            {card?.agent ? (
              <div className="party">
                <dt>Agent</dt>
                <dd>{card.agent}</dd>
              </div>
            ) : null}
            {card?.scope ? (
              <div className="party">
                <dt>Scope</dt>
                <dd>{card.scope}</dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <p className="r-placeholder">Optional agent and scope go here.</p>
        )}

        <div className="rule-grid">
          <section className="rule-col is-must">
            <p className="r-label">Must</p>
            <RuleList
              items={card?.must ?? []}
              empty="Positive standing rules."
              tone="is-must"
            />
          </section>
          <section className="rule-col is-deny">
            <p className="r-label is-deny">Must not</p>
            <RuleList
              items={card?.mustNot ?? []}
              empty="Hard prohibitions."
              tone="is-deny"
            />
          </section>
          <section className="rule-col is-stop">
            <p className="r-label is-stop">Stop</p>
            <RuleList
              items={card?.stop ?? []}
              empty="Abort conditions."
              tone="is-stop"
            />
          </section>
        </div>
      </div>

      <div className="perf" aria-hidden="true">
        <span />
      </div>

      <div className="barcode" aria-hidden="true">
        {barcodeBars(card?.id ?? "CC-0000").map((width, index) => (
          <i key={index} style={{ width }} />
        ))}
      </div>

      <footer className="r-foot">
        <p>SMF Works · Constraint Card</p>
        <p className="r-link">smfworks.com</p>
        <p className="r-motto">
          {card ? formatStampTime(card.issuedAt) : "Lab artifact · not a policy engine"}
        </p>
        <p className="r-motto">Not enforcement — share the bound.</p>
      </footer>
    </article>
  );
}
