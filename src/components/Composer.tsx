import { useState, type FormEvent, type KeyboardEvent } from "react";
import { SAMPLES } from "../data/samples";
import type { Bucket, ConstraintDraft } from "../types";

interface ComposerProps {
  draft: ConstraintDraft;
  sampleId: string | null;
  paste: string;
  onChange: (next: ConstraintDraft) => void;
  onSample: (id: string) => void;
  onPasteChange: (raw: string) => void;
  onSplitPaste: () => void;
  onAdd: (bucket: Bucket, raw: string) => boolean;
  onRemove: (bucket: Bucket, raw: string) => void;
}

const BUCKETS: {
  id: Bucket;
  label: string;
  hint: string;
  placeholder: string;
  tone: string;
}[] = [
  {
    id: "must",
    label: "Must",
    hint: "Standing positive rules. One line each.",
    placeholder: "e.g. Must cite sources with links",
    tone: "is-must",
  },
  {
    id: "mustNot",
    label: "Must not",
    hint: "Hard prohibitions. Pair with Refuse Card if you need a stamp.",
    placeholder: "e.g. Never send mail",
    tone: "is-deny",
  },
  {
    id: "stop",
    label: "Stop conditions",
    hint: "Abort when these fire. The constitution yields to a human.",
    placeholder: "e.g. Stop if asked to publish",
    tone: "is-stop",
  },
];

export function Composer({
  draft,
  sampleId,
  paste,
  onChange,
  onSample,
  onPasteChange,
  onSplitPaste,
  onAdd,
  onRemove,
}: ComposerProps) {
  const [lines, setLines] = useState<Record<Bucket, string>>({
    must: "",
    mustNot: "",
    stop: "",
  });

  const patch = (partial: Partial<ConstraintDraft>) => {
    onChange({ ...draft, ...partial });
  };

  const submit = (bucket: Bucket, event?: FormEvent) => {
    event?.preventDefault();
    if (onAdd(bucket, lines[bucket])) {
      setLines((prev) => ({ ...prev, [bucket]: "" }));
    }
  };

  const onKey = (bucket: Bucket, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit(bucket);
    }
  };

  return (
    <section className="composer">
      <div className="composer-head">
        <h2>Write the constitution</h2>
        <p>Pick a sample, paste a rule dump, or list MUST / MUST NOT / STOP by hand.</p>
      </div>

      <div className="sample-row">
        {SAMPLES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            className={sampleId === sample.id ? "chip is-on" : "chip"}
            onClick={() => onSample(sample.id)}
          >
            <span className="chip-top">
              <i className="dot is-go" aria-hidden="true" />
              {sample.label}
            </span>
            <small>{sample.blurb}</small>
          </button>
        ))}
      </div>

      <label className="editor-label" htmlFor="title-input">
        Title
      </label>
      <input
        id="title-input"
        value={draft.title}
        onChange={(event) => patch({ title: event.target.value })}
        placeholder="Research agent constitution"
        autoComplete="off"
      />

      <div className="party-inputs">
        <div>
          <label className="editor-label" htmlFor="agent-input">
            Agent <span className="opt">(optional)</span>
          </label>
          <input
            id="agent-input"
            value={draft.agent}
            onChange={(event) => patch({ agent: event.target.value })}
            placeholder="Literature scout"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="editor-label" htmlFor="session-input">
            Session <span className="opt">(optional)</span>
          </label>
          <input
            id="session-input"
            value={draft.session}
            onChange={(event) => patch({ session: event.target.value })}
            placeholder="this session"
            autoComplete="off"
          />
        </div>
      </div>

      <label className="editor-label" htmlFor="scope-input">
        Scope <span className="opt">(optional)</span>
      </label>
      <input
        id="scope-input"
        value={draft.scope}
        onChange={(event) => patch({ scope: event.target.value })}
        placeholder="Read-only survey of this repo"
        autoComplete="off"
      />

      <label className="editor-label" htmlFor="paste-input">
        Paste rules <span className="opt">(optional · heuristic)</span>
      </label>
      <textarea
        id="paste-input"
        rows={5}
        value={paste}
        onChange={(event) => onPasteChange(event.target.value)}
        placeholder={"MUST\n- Cite sources\nMUST NOT\n- Never send email\nSTOP\n- Stop if asked to publish"}
      />
      <div className="add-row">
        <p className="field-hint">
          Splits on lines. Keywords: must, never, do not, stop if, abort when.
          Approximate — review the buckets.
        </p>
        <button type="button" className="btn btn-inline" onClick={onSplitPaste}>
          Split into buckets
        </button>
      </div>

      {BUCKETS.map((bucket) => (
        <div key={bucket.id} className={`bucket-block ${bucket.tone}`}>
          <p className="editor-label" id={`${bucket.id}-label`}>
            {bucket.label}
          </p>
          {draft[bucket.id].length ? (
            <ul className={`picked is-block ${bucket.tone}`}>
              {draft[bucket.id].map((line) => (
                <li key={line}>
                  <span>{line}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(bucket.id, line)}
                    aria-label={`Remove ${line}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="field-hint">{bucket.hint}</p>
          )}
          <form className="add-row" onSubmit={(event) => submit(bucket.id, event)}>
            <input
              value={lines[bucket.id]}
              onChange={(event) =>
                setLines((prev) => ({ ...prev, [bucket.id]: event.target.value }))
              }
              onKeyDown={(event) => onKey(bucket.id, event)}
              placeholder={bucket.placeholder}
              aria-labelledby={`${bucket.id}-label`}
              autoComplete="off"
            />
            <button type="submit" className="btn btn-inline">
              Add
            </button>
          </form>
        </div>
      ))}

      <p className="disclaimer">
        Not an enforcement runtime. A shareable card is a lab artifact for
        communication. Pair with{" "}
        <a href="https://github.com/smfworks/agent-contract" rel="noreferrer" target="_blank">
          Agent Contract
        </a>{" "}
        for the agreement and{" "}
        <a href="https://github.com/smfworks/tool-permit" rel="noreferrer" target="_blank">
          Tool Permit
        </a>{" "}
        for the GO-list. The paste splitter is approximate. Judgment stays human.
      </p>
    </section>
  );
}
