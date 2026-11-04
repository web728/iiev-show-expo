// FAQ seed. Answers state organiser-unknown policies honestly instead of guessing.
// Admins edit these in Admin → FAQs.

export type FaqSeed = { audience: "general" | "exhibitor" | "visitor" | "conference"; question: string; answer: string; order: number };

export const faqs: FaqSeed[] = [
  // General
  { audience: "general", order: 10, question: "When and where is the India International EV Show 2027?", answer: "The 9th edition is scheduled for 11–13 November 2027 at the Auto Cluster Exhibition Centre, Pimpri-Chinchwad, Pune, Maharashtra." },
  { audience: "general", order: 20, question: "Who organises the show?", answer: "The India International EV Show is organised by Futurex Trade Fair and Events Pvt. Ltd. Contact details are on the Contact page." },
  { audience: "general", order: 30, question: "Is the show open to the general public?", answer: "The show is designed as a business-to-business exhibition for the electric-mobility industry. The admission policy for 2027 will be published on the Visit pages; registration is required for entry." },
  { audience: "general", order: 40, question: "Will other shows run at the same time?", answer: "The 2026 edition ran alongside the India International Battery Show and the India International Solar Show. Co-located events for 2027 will be confirmed on the Concurrent Events page." },

  // Exhibitor
  { audience: "exhibitor", order: 10, question: "How do I book a stall?", answer: "Send a stall enquiry through the Book a Stall form. The exhibitor sales team will contact you with available spaces, participation terms and the next steps. Submitting an enquiry does not reserve space." },
  { audience: "exhibitor", order: 20, question: "What does a stall cost?", answer: "Participation rates for 2027 are shared by the exhibitor sales team in response to an enquiry, because they depend on stall size, type and location. We do not publish prices online until they are approved." },
  { audience: "exhibitor", order: 30, question: "Is there a floor plan?", answer: "The 2027 floor plan will be published on the Floor Plan page once halls are allocated. Until then, the sales team can share current availability on request." },
  { audience: "exhibitor", order: 40, question: "What is the difference between shell scheme and raw space?", answer: "Shell scheme is a pre-built stall with standard walls, fascia and basic fittings. Raw space is floor area only, for exhibitors who bring a custom-built stand. Exact inclusions for 2027 will be in the exhibitor manual." },
  { audience: "exhibitor", order: 50, question: "Will my company be listed in the online exhibitor directory?", answer: "Confirmed exhibitors are invited to submit a directory profile. Listings are reviewed and published only after participation is confirmed." },
  { audience: "exhibitor", order: 60, question: "Can I launch a product at the show?", answer: "Yes — tell us in your enquiry. Launch opportunities on the show floor or in the conference programme are subject to availability and organiser approval." },

  // Visitor
  { audience: "visitor", order: 10, question: "How do I register as a visitor?", answer: "Complete the online visitor registration form. Once your registration is approved you receive a personal badge with a QR code by email, which you can print or show on your phone at the registration desk." },
  { audience: "visitor", order: 20, question: "Is there an entry fee?", answer: "The admission policy for 2027 has not been announced yet. It will be published on the Visit pages and in your confirmation email." },
  { audience: "visitor", order: 30, question: "I lost my badge email. How can I get it again?", answer: "Use Retrieve my Badge and enter the email address you registered with. If a matching approved registration exists, we email you a secure link to view and download your badge." },
  { audience: "visitor", order: 40, question: "Can someone else use my badge?", answer: "No. Badges are personal and non-transferable. Each QR code is unique, and badges that appear to be shared may be revoked." },
  { audience: "visitor", order: 50, question: "How do I reach the venue?", answer: "The Auto Cluster Exhibition Centre is in Pimpri-Chinchwad, Pune. See Venue and Travel & Stay for directions from Pune airport, railway stations and the city." },
  { audience: "visitor", order: 60, question: "What are the opening hours?", answer: "Show timings for 2027 will be confirmed closer to the event and published on the Visit pages." },

  // Conference
  { audience: "conference", order: 10, question: "Has the 2027 conference programme been announced?", answer: "Not yet. The agenda and speakers will be published as sessions are confirmed. You can register your interest as a delegate now and we will update you." },
  { audience: "conference", order: 20, question: "How do I apply to speak?", answer: "Use the Apply to Speak form with a topic, abstract and short bio. The programme committee reviews all applications; submitting does not guarantee a slot." },
  { audience: "conference", order: 30, question: "Does a visitor badge include conference access?", answer: "Conference access rules for 2027 will be published with the programme." },
];
