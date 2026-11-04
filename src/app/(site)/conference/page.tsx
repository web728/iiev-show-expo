import type { Metadata } from "next";
import { PageHero, Section, FeatureCard, Notice, CtaBand } from "@/components/ui/layout-blocks";
import { LinkButton } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCurrentEdition } from "@/lib/data/edition";
import { getSessions, getSpeakers } from "@/lib/data/public";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const e = await getCurrentEdition();
  const name = e.conference.titleApproved ? e.conference.name : "Conference";
  return pageMetadata({
    title: `${name} ${e.year} — IIEV Show Conference`,
    description: `The conference programme at the India International EV Show ${e.year}: sessions on EV technology, batteries, charging, manufacturing, financing and policy. Apply to speak or register as a delegate.`,
    path: "/conference/",
  });
}

export default async function ConferencePage() {
  const [e, sessions, speakers] = await Promise.all([getCurrentEdition(), getSessions(), getSpeakers()]);
  const name = e.conference.titleApproved ? e.conference.name : "Conference";
  return (
    <>
      <PageHero image={{ src: "/media/2026/conf-panel-wide.webp" }}
        eyebrow="Conference"
        title={`${name} ${e.year}`}
        intro={<p>The conference programme at the India International EV Show — practical sessions for people building, buying and financing electric mobility.</p>}
        crumbs={[{ label: "Conference", href: "/conference/" }]}
        actions={
          <>
            <LinkButton href="/conference/register/" variant="secondary" size="lg" arrow>Register as delegate</LinkButton>
            <LinkButton href="/conference/apply-to-speak/" variant="outline-light" size="lg">Apply to speak</LinkButton>
          </>
        }
      />
      <Section>
        {!e.conference.programmeAnnounced || !sessions.length ? (
          <div className="mb-10 max-w-3xl">
            <Notice title="Programme to be announced">
              The {e.year} agenda and speakers will be published as sessions are confirmed. Register as a delegate to be notified, or apply to speak if you have expertise to share.
            </Notice>
          </div>
        ) : null}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon="Calendar" title="Agenda" href="/conference/agenda/">{sessions.length ? `${sessions.length} sessions published` : "Sessions by day and track, once announced."}</FeatureCard>
          <FeatureCard icon="Mic" title="Speakers" href="/conference/speakers/">{speakers.length ? `${speakers.length} confirmed speakers` : "Confirmed speakers, once announced."}</FeatureCard>
          <FeatureCard icon="Ticket" title="Delegate registration" href="/conference/register/">Register your interest and receive programme updates.</FeatureCard>
          <FeatureCard icon="Users" title="Apply to speak" href="/conference/apply-to-speak/">Propose a session to the programme committee.</FeatureCard>
        </div>
      </Section>
      <Section tone="mist" eyebrow="Themes" title="Topics the programme is designed around">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Vehicle technology", "Platforms, powertrains and the engineering choices behind affordable EVs."],
            ["Batteries & cells", "Chemistry, safety, localisation and end-of-life recovery."],
            ["Charging & energy", "Public and depot charging, swapping, storage and grid integration."],
            ["Manufacturing & supply chain", "Scaling production, localisation and supplier development."],
            ["Financing & business models", "Lending, leasing, insurance and residual value for EVs and batteries."],
            ["Fleets & adoption", "What fleet operators have learned from running electric vehicles."],
          ].map(([t, d]) => (
            <li key={t} className="rounded-2xl border border-line bg-white p-6">
              <h3 className="font-bold text-ink">{t}</h3>
              <p className="mt-2 text-[15px] text-ink-soft">{d}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-ink-muted">Themes are indicative; the final programme is set by the organiser and programme committee.</p>
      </Section>
      <CtaBand title="Share your expertise" text="The programme committee welcomes practical, non-promotional proposals." primary={{ label: "Apply to speak", href: "/conference/apply-to-speak/" }} secondary={{ label: "Register as delegate", href: "/conference/register/" }} />
    </>
  );
}
