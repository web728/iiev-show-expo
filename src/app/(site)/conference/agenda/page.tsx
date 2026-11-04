import type { Metadata } from "next";
import { PageHero, Section, EmptyState, CtaBand } from "@/components/ui/layout-blocks";
import { LinkButton } from "@/components/ui/button";
import { Agenda } from "@/components/sections/agenda";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCurrentEdition } from "@/lib/data/edition";
import { getSessions, getSpeakers } from "@/lib/data/public";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Conference Agenda",
  description: "Conference agenda for the India International EV Show 2027 — sessions by day and track, in India Standard Time.",
  path: "/conference/agenda/",
});

export default async function AgendaPage() {
  const [e, sessions, speakers] = await Promise.all([getCurrentEdition(), getSessions(), getSpeakers()]);
  return (
    <>
      <PageHero image={{ src: "/media/2026/conf-auditorium.webp" }} eyebrow="Conference" title={`Agenda ${e.year}`} crumbs={[{ label: "Conference", href: "/conference/" }, { label: "Agenda", href: "/conference/agenda/" }]} />
      <Section>
        {sessions.length ? (
          <Agenda sessions={sessions} speakers={speakers} />
        ) : (
          <EmptyState icon="Calendar" title={`The ${e.year} agenda hasn't been announced yet`} action={<LinkButton href="/conference/register/" arrow>Get notified</LinkButton>}>
            Sessions will appear here by day and track as they are confirmed. Earlier programmes are kept with each past edition.
          </EmptyState>
        )}
      </Section>
      <CtaBand title="Want to be on the programme?" primary={{ label: "Apply to speak", href: "/conference/apply-to-speak/" }} />
    </>
  );
}
