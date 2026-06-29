import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { CreditStamp } from "@/components/CreditStamp";


const steps = [
  {
    title: "Post what you need",
    body: "Need a landing page coded, your English essay proofread, or your linear algebra explained before the exam? Post it as a task and set how many credits — hours — it's worth.",
  },
  {
    title: "Credits are escrowed",
    body: "The moment you create a task, your credits are frozen by the database, not just promised. The person who takes the job knows the payment is already real.",
  },
  {
    title: "Someone takes the job",
    body: "Students browse open tasks and apply with a short note. You choose who's the right fit and the task moves to in progress.",
  },
  {
    title: "Confirm, and credits move",
    body: "Once the work's done, you mark the task complete. The escrowed credits release to the person who helped you — no chasing, no IOUs.",
  },
];

const stackLayers = [
  {
    label: "01",
    title: "API & real-time layer",
    body: "FastAPI handles registration, tasks, and profiles over REST, documented automatically with Swagger. A WebSocket channel pushes balance changes and new applications to your screen the instant they happen — no refresh.",
    tags: ["Python", "FastAPI", "WebSockets"],
  },
  {
    label: "02",
    title: "Data & validation",
    body: "SQLAlchemy 2.0 talks to the database asynchronously, so one slow query never blocks another student's request. Pydantic checks every payload in and out, so a malformed request fails loudly instead of corrupting a balance.",
    tags: ["SQLAlchemy 2.0", "asyncpg", "Pydantic"],
  },
  {
    label: "03",
    title: "Storage",
    body: "PostgreSQL, not SQLite — because moving credits between two people has to be all-or-nothing. If a transfer fails partway, the database rolls the whole thing back. Nobody's balance gets invented or lost.",
    tags: ["PostgreSQL", "ACID transactions"],
  },
];

export default function HomePage() {
  return (
    <div className="bg-paper text-ink">
      <SiteHeader />

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-stamp-dark mb-5">
              A campus economy with no money in it
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.05] tracking-tight">
              You have skills.
              <br />
              <span className="italic">Spend them, don&apos;t sell them.</span>
            </h1>
            <p className="text-stone text-lg mt-6 max-w-lg leading-relaxed">
              Sukiru is a peer-to-peer exchange where students trade help — code for
              critique, tutoring for tutoring — using Time-Credits instead of tenge.
              One credit always equals one hour. No one undercuts anyone, because
              there&apos;s no price to undercut.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-9">
              <Link
                href="/login"
                className="bg-ink text-paper px-6 py-3 rounded-md font-medium hover:bg-stamp-dark transition-colors"
              >
                Get your first credit
              </Link>
              <Link
                href="#how-it-works"
                className="text-ink font-medium underline underline-offset-4 hover:text-stamp-dark transition-colors"
              >
                See how a trade works
              </Link>
            </div>
          </div>

          <div className="bg-white border border-rule rounded-xl shadow-[0_24px_60px_-30px_rgba(20,17,15,0.35)] overflow-hidden rotate-1">
            <div className="flex items-center justify-between px-5 py-3 border-b border-rule bg-paper-dim">
           
              <CreditStamp size="sm" />
            </div>
            <ul className="ruled-bg">
             
            </ul>
            <div className="px-5 py-3 border-t border-rule text-xs text-stone font-mono">
              every entry above is escrowed before either side lifts a finger
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-rule bg-paper-dim">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-medium leading-snug">
            Every student is short on two things: money, and proof they can do the
            work.
          </h2>
          <p className="text-stone mt-4 max-w-2xl mx-auto leading-relaxed">
            A designer needs a backend developer for a portfolio project. That
            developer needs someone to make it not look like a spreadsheet. Someone
            else just needs their English essay read before Friday. None of them can
            pay each other in tenge — but they can pay each other in time.
          </p>
        </div>
      </section>

      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-baseline justify-between mb-10 flex-wrap gap-3">
          <h2 className="font-display text-3xl font-medium">How a trade moves</h2>
          <p className="text-stone text-sm font-mono">four steps, one rollback-safe ledger</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-px bg-rule border border-rule rounded-lg overflow-hidden">
          {steps.map((step, i) => (
            <div key={step.title} className="bg-paper p-7">
              <span className="font-mono text-xs text-stamp-dark">{`0${i + 1}`}</span>
              <h3 className="font-display text-xl font-medium mt-2 mb-2">{step.title}</h3>
              <p className="text-stone text-sm leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="stack" className="border-t border-rule bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-baseline justify-between mb-10 flex-wrap gap-3">
            <h2 className="font-display text-3xl font-medium">
              What keeps the ledger honest
            </h2>
            <p className="text-paper/50 text-sm font-mono">three layers, independently built</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {stackLayers.map((layer) => (
              <div key={layer.label} className="border border-paper/15 rounded-lg p-7">
                <span className="font-mono text-xs text-stamp">{layer.label}</span>
                <h3 className="font-display text-xl font-medium mt-3 mb-3">
                  {layer.title}
                </h3>
                <p className="text-paper/65 text-sm leading-relaxed mb-5">{layer.body}</p>
                <div className="flex flex-wrap gap-2">
                  {layer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[0.65rem] uppercase tracking-wide border border-paper/20 rounded-full px-2.5 py-1 text-paper/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <CreditStamp size="lg" className="mb-7" />
        <h2 className="font-display text-3xl sm:text-4xl font-medium leading-tight">
          The first hour you give is the first credit you spend.
        </h2>
        <p className="text-stone mt-4 max-w-md mx-auto">
          Make an account, post what you can help with, and see who&apos;s already
          waiting on the other side of the ledger.
        </p>
        <Link
          href="/login"
          className="inline-block mt-8 bg-ink text-paper px-7 py-3 rounded-md font-medium hover:bg-stamp-dark transition-colors"
        >
          Join Sukiru
        </Link>
      </section>

      <footer className="border-t border-rule">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-xs text-stone">
          <span>Sukiru — an internal exchange, built by students, for students.</span>
          <span className="font-mono">1 credit = 1 hour, always.</span>
        </div>
      </footer>
    </div>
  );
}
