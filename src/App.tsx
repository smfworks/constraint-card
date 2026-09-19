import { SAMPLES } from "./data/samples";
import {
  addBullet,
  canExport,
  cardToJson,
  cloneDraft,
  mergeBuckets,
  removeBullet,
  serializeCard,
  slugify,
} from "./lib/card";
import { cardToPngBlob, copyText, downloadBlob } from "./lib/exportImage";
import { splitHasRules, splitPaste } from "./lib/split";
import { EMPTY_DRAFT, type Bucket, type ConstraintDraft } from "./types";
import { Actions } from "./components/Actions";
import { Composer } from "./components/Composer";
import { ConstraintCard } from "./components/ConstraintCard";
import { Header } from "./components/Header";
import { SisterStrip } from "./components/SisterStrip";
import { HandoffBanner } from "./components/HandoffBanner";
import { Toast } from "./components/Toast";
import { formatCompactStats, formatShareText } from "./lib/share";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function initialFromUrl(): { draft: ConstraintDraft; sampleId: string | null } {
  const params = new URLSearchParams(window.location.search);
  const sample = params.get("sample");
  const found = SAMPLES.find((item) => item.id === sample);
  if (!found) return { draft: cloneDraft(), sampleId: null };
  return { draft: cloneDraft(found.draft), sampleId: found.id };
}

function applyShotClass(): void {
  const shot = new URLSearchParams(window.location.search).get("shot");
  if (shot === "card" || shot === "og") {
    document.body.classList.add(`shot-${shot}`);
  }
}

export default function App() {
  applyShotClass();
  const [draft, setDraft] = useState<ConstraintDraft>(() => initialFromUrl().draft);
  const [sampleId, setSampleId] = useState<string | null>(() => initialFromUrl().sampleId);
  const [paste, setPaste] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState<"png" | "share" | "json" | null>(null);
  const [now] = useState(() => new Date());
  const frameRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(id);
  }, [toast]);

  const loadSample = useCallback((id: string) => {
    const sample = SAMPLES.find((item) => item.id === id);
    if (!sample) return;
    setDraft(cloneDraft(sample.draft));
    setSampleId(id);
    setPaste("");
  }, []);

  const loadDefaultSample = useCallback(() => {
    loadSample(SAMPLES[0].id);
    showToast("Loaded research-only.");
  }, [loadSample, showToast]);

  const card = useMemo(() => serializeCard(draft, now), [draft, now]);
  const exportable = canExport(card);

  const reset = useCallback(() => {
    setDraft(cloneDraft(EMPTY_DRAFT));
    setSampleId(null);
    setPaste("");
    showToast("Cleared.");
  }, [showToast]);

  const withFrame = useCallback(async () => {
    const node = frameRef.current;
    if (!node || !exportable) throw new Error("Nothing to stamp yet.");
    node.classList.add("is-exporting");
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    try {
      return await cardToPngBlob(node);
    } finally {
      node.classList.remove("is-exporting");
    }
  }, [exportable]);

  const downloadPng = useCallback(async () => {
    if (!exportable) return;
    setBusy("png");
    try {
      const blob = await withFrame();
      downloadBlob(blob, `constraint-card-${slugify(card.title)}.png`);
      showToast("PNG downloaded.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "PNG export failed.");
    } finally {
      setBusy(null);
    }
  }, [exportable, card.title, showToast, withFrame]);

  const copyShare = useCallback(async () => {
    if (!exportable) return;
    setBusy("share");
    try {
      await copyText(formatShareText(card));
      showToast("Share text copied.");
    } catch {
      showToast("Could not copy share text.");
    } finally {
      setBusy(null);
    }
  }, [exportable, card, showToast]);

  const copyJson = useCallback(async () => {
    if (!exportable) return;
    setBusy("json");
    try {
      await copyText(cardToJson(card));
      showToast("JSON copied.");
    } catch {
      showToast("Could not copy JSON.");
    } finally {
      setBusy(null);
    }
  }, [exportable, card, showToast]);

  const onChange = useCallback((next: ConstraintDraft) => {
    setSampleId(null);
    setDraft(next);
  }, []);

  const onAdd = useCallback(
    (bucket: Bucket, raw: string) => {
      const next = addBullet(draft[bucket], raw);
      if (next.length === draft[bucket].length) return false;
      setSampleId(null);
      setDraft({ ...draft, [bucket]: next });
      return true;
    },
    [draft],
  );

  const onRemove = useCallback(
    (bucket: Bucket, raw: string) => {
      setSampleId(null);
      setDraft({ ...draft, [bucket]: removeBullet(draft[bucket], raw) });
    },
    [draft],
  );

  const onSplitPaste = useCallback(() => {
    const result = splitPaste(paste);
    if (!splitHasRules(result)) {
      showToast("Nothing to split.");
      return;
    }
    setSampleId(null);
    setDraft(mergeBuckets(draft, result));
    const guessed = result.guessed ? ` · ${result.guessed} guessed` : "";
    showToast(
      `Split ${result.must.length} must / ${result.mustNot.length} must-not / ${result.stop.length} stop${guessed}.`,
    );
  }, [paste, draft, showToast]);

  const live = useMemo(() => {
    if (!exportable) return "Waiting for a constitution";
    return `${card.title}${card.agent ? ` · ${card.agent}` : ""}`;
  }, [exportable, card.title, card.agent]);

  const preview =
    card.title ||
    card.agent ||
    card.scope ||
    card.session ||
    card.must.length ||
    card.mustNot.length ||
    card.stop.length
      ? card
      : null;

  return (
    <div className="page">
      <div className="ambient" aria-hidden="true" />
      <Header />
      <SisterStrip current="constraint-card" payload={paste || JSON.stringify(draft)} kind="json" />
      <HandoffBanner accept={["json", "plain"]} onPaste={(text) => { setPaste(text); setSampleId(null); }} />
      <main className="layout">
        <Composer
          draft={draft}
          sampleId={sampleId}
          paste={paste}
          onChange={onChange}
          onSample={loadSample}
          onPasteChange={setPaste}
          onSplitPaste={onSplitPaste}
          onAdd={onAdd}
          onRemove={onRemove}
        />
        <section className="stage" aria-label="Constraint preview">
          <p className="sr-only" aria-live="polite">
            {live}
          </p>
          <div className="stage-scroll">
            <div ref={frameRef} className="export-frame">
              <ConstraintCard card={preview} />
            </div>
          </div>
          {exportable ? <p className="stage-stats">{formatCompactStats(card)}</p> : null}
          <Actions
            disabled={!exportable}
            busy={busy}
            onDownload={() => void downloadPng()}
            onCopyShare={() => void copyShare()}
            onCopyJson={() => void copyJson()}
            onLoadSample={loadDefaultSample}
            onReset={reset}
          />
        </section>
      </main>
      <footer className="site-foot">
        <p>Constraint Card · SMF Works</p>
        <p>
          Twin:{" "}
          <a href="https://github.com/smfworks/agent-contract">Agent Contract</a>
          {" — the agreement · "}
          <a href="https://github.com/smfworks/tool-permit">Tool Permit</a>
          {" — GO-list · "}
          <a href="https://github.com/smfworks/refuse-card">Refuse Card</a>
          {" — NO / HOLD."}
        </p>
        <p>Intelligence is abundant. Judgment is the product.</p>
        <p>
          MIT · Built by{" "}
          <a href="https://smfworks.com" rel="noreferrer" target="_blank">
            SMF Works
          </a>
          {" · "}
          <a href="https://github.com/smfworks/constraint-card" rel="noreferrer" target="_blank">
            GitHub
          </a>
          {" · "}
          <a href="https://x.com/MichaelGannotti" rel="noreferrer" target="_blank">
            @MichaelGannotti
          </a>
        </p>
        <p className="fineprint">
          Lab artifact for communication. Not an enforcement runtime and not a
          legal instrument. A shareable constitution card is not a substitute
          for a sandbox, a Tool Permit, or a human.
        </p>
      </footer>
      <Toast message={toast} />
    </div>
  );
}
