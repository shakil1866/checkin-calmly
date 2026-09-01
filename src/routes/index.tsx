import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quiet Check-In — Private Wellbeing Check-In" },
      {
        name: "description",
        content:
          "A private, non-diagnostic wellbeing check-in: seven gentle questions about mood, sleep, and support, with optional follow-up.",
      },
      { property: "og:title", content: "Quiet Check-In — Private Wellbeing Check-In" },
      {
        property: "og:description",
        content:
          "Seven gentle questions about how you have been feeling. Private, non-diagnostic, and never a label.",
      },
    ],
  }),
  component: Index,
});

const OPTIONS = [
  { label: "Never", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
];

const QUESTIONS = [
  "How often have you felt low, sad, or without hope?",
  "How often have you had little interest or pleasure in things?",
  "How often have you felt nervous, anxious, or on edge?",
  "How often have you found it difficult to relax?",
  "How often has poor sleep affected your day?",
  "How often have you felt tired or low in energy?",
  "How often have you felt isolated or without support?",
];

const WEBHOOK_URL =
  "https://shakil1866.app.n8n.cloud/webhook/77b480e4-87db-4d49-8492-be50b917e738";

type Stage = "intro" | "questions" | "details" | "done";
type Status = "idle" | "loading" | "error";

function Index() {
  const [stage, setStage] = useState<Stage>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => QUESTIONS.map(() => null));
  const [showRequired, setShowRequired] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const questionHeading = useRef<HTMLHeadingElement>(null);

  const progress = stage === "intro" ? 0 : ((step + (stage === "questions" ? 0 : 1)) / QUESTIONS.length) * 100;

  const select = (value: number) => {
    setAnswers((prev) => prev.map((a, i) => (i === step ? value : a)));
    setShowRequired(false);
  };

  const next = () => {
    if (answers[step] === null) {
      setShowRequired(true);
      return;
    }
    if (step === QUESTIONS.length - 1) {
      setStage("details");
      return;
    }
    setStep(step + 1);
    requestAnimationFrame(() => questionHeading.current?.focus());
  };

  const back = () => {
    setShowRequired(false);
    if (stage === "details") {
      setStage("questions");
      setStep(QUESTIONS.length - 1);
      return;
    }
    if (step === 0) {
      setStage("intro");
      return;
    }
    setStep(step - 1);
    requestAnimationFrame(() => questionHeading.current?.focus());
  };

  const submit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setFormError("Please enter your full name (2–100 characters).");
      return;
    }
    if (!/^[+()\d\s-]{7,20}$/.test(trimmedPhone)) {
      setFormError("Please enter a valid phone number so we can follow up.");
      return;
    }
    if (!consent) {
      setFormError("Please tick the consent box before sending your check-in.");
      return;
    }
    setFormError(null);
    setStatus("loading");
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone,
          answers: QUESTIONS.map((question, i) => ({
            question,
            response: OPTIONS[answers[i] ?? 0].label,
            value: answers[i],
          })),
          submittedAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus("idle");
      setStage("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-5 py-14 sm:px-8 sm:py-20">
        <header className="space-y-5">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Quiet Check-In
          </p>
          <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            A private, non-diagnostic wellbeing check-in.
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Seven gentle questions about how the last couple of weeks have felt. Nothing here is a
            diagnosis, a score, or a label — just a quiet moment to notice how you are doing.
          </p>
          <aside
            role="note"
            className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm leading-relaxed text-foreground"
          >
            <strong className="font-semibold">If you may be in immediate danger</strong>, please stop
            here and contact your local emergency services or a crisis helpline right away. You
            deserve support now, not later.
          </aside>
        </header>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {stage === "intro" && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl">Whenever you feel ready</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                You can move back and forth between questions, and nothing is sent until you choose
                to share it at the end.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStage("questions");
                  setStep(0);
                }}
                className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto"
              >
                Begin the check-in
              </button>
            </div>
          )}

          {stage === "questions" && (
            <div className="space-y-7">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  Question {step + 1} of {QUESTIONS.length}
                </p>
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress)}
                  aria-label="Check-in progress"
                  className="h-2 w-full overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <fieldset className="space-y-4">
                <legend className="w-full">
                  <h2
                    ref={questionHeading}
                    tabIndex={-1}
                    className="font-serif text-2xl leading-snug outline-none"
                  >
                    {QUESTIONS[step]}
                  </h2>
                </legend>
                <div className="space-y-2.5">
                  {OPTIONS.map((option) => {
                    const id = `q${step}-${option.value}`;
                    const checked = answers[step] === option.value;
                    return (
                      <div key={id}>
                        <input
                          type="radio"
                          id={id}
                          name={`question-${step}`}
                          className="peer sr-only"
                          checked={checked}
                          onChange={() => select(option.value)}
                        />
                        <label
                          htmlFor={id}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 text-sm transition-colors hover:border-primary/50 hover:bg-accent peer-checked:border-primary peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring"
                        >
                          <span
                            aria-hidden="true"
                            className={`h-4 w-4 shrink-0 rounded-full border transition-colors ${
                              checked ? "border-primary bg-primary" : "border-muted-foreground/50"
                            }`}
                          />
                          {option.label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </fieldset>

              {showRequired && (
                <p role="alert" className="text-sm text-destructive">
                  Please choose a response to continue — there is no wrong answer.
                </p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={next}
                  className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {step === QUESTIONS.length - 1 ? "Finish" : "Next"}
                </button>
                <button
                  type="button"
                  onClick={back}
                  className="rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {stage === "details" && (
            <form onSubmit={submit} className="space-y-7" noValidate>
              <div className="space-y-3">
                <h2 className="font-serif text-2xl">Thank you for taking that time</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Answering honestly takes courage. There is no score and no label here. If you would
                  like someone to follow up gently, share your details below.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium">
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  maxLength={20}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                />
                <label htmlFor="consent" className="text-sm leading-relaxed text-muted-foreground">
                  I agree to share my responses so someone can follow up with me.
                </label>
              </div>

              {formError && (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              )}

              {status === "error" && (
                <div role="alert" className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
                  <p>
                    We couldn&apos;t send your check-in just now — it may be a connection issue.
                    Your answers are still here.
                  </p>
                  <button
                    type="button"
                    onClick={() => submit()}
                    className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    Try again
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  aria-busy={status === "loading"}
                  className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {status === "loading" ? "Sending…" : "Share my check-in"}
                </button>
                <button
                  type="button"
                  onClick={back}
                  className="rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {stage === "done" && (
            <div className="space-y-4" role="status">
              <h2 className="font-serif text-2xl">Your check-in has been shared</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Thank you for trusting us with this. Someone will reach out to you using the phone
                number you provided. In the meantime, be gentle with yourself — rest, water, and a
                little daylight all count.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                If things feel urgent before then, please contact your local emergency services or a
                crisis helpline.
              </p>
            </div>
          )}
        </section>

        <footer className="mt-auto text-xs leading-relaxed text-muted-foreground">
          This check-in is not a medical assessment and does not diagnose any condition. For clinical
          advice, please speak with a qualified health professional.
        </footer>
      </div>
    </main>
  );
}
