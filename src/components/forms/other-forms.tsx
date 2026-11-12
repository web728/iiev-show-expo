"use client";

import { SmartForm } from "./smart-form";
import {
  stallFields,
  sponsorshipFields,
  partnerFields,
  speakerFields,
  delegateFields,
  contactFields,
} from "./configs";

export function StallEnquiryForm() {
  return <SmartForm endpoint="/api/forms/stall/" formName="stall_enquiry" fields={stallFields} submitLabel="Submit Stall Enquiry" />;
}

export function SponsorshipEnquiryForm() {
  return <SmartForm endpoint="/api/forms/sponsorship/" formName="sponsorship_enquiry" fields={sponsorshipFields} submitLabel="Enquire About Sponsorship" />;
}

export function PartnerEnquiryForm() {
  return <SmartForm endpoint="/api/forms/partner/" formName="partner_enquiry" fields={partnerFields} submitLabel="Submit Partnership Enquiry" />;
}

export function SpeakerApplicationForm() {
  return <SmartForm endpoint="/api/forms/speaker/" formName="speaker_application" fields={speakerFields} submitLabel="Apply as Speaker" />;
}

export function DelegateRegistrationForm() {
  return <SmartForm endpoint="/api/forms/delegate/" formName="delegate_registration" fields={delegateFields} submitLabel="Register Interest as Delegate" />;
}

export function ContactForm() {
  return <SmartForm endpoint="/api/forms/contact/" formName="contact" fields={contactFields} submitLabel="Send Message" />;
}
