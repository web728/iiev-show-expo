import type { IconName } from "@/components/ui/icons";

// Sector taxonomy seed (also the fallback when the CMS is unavailable).
// Copy is written for buyers and exhibitors; it avoids market-size figures
// and regulatory claims that would need dated sourcing.

export type SectorContent = {
  slug: string;
  name: string;
  group: "Vehicles" | "Powertrain & energy" | "Charging & infrastructure" | "Manufacturing & services";
  icon: IconName;
  summary: string;
  body: string;
  exhibitorExamples: string[];
  buyerQuestions: string[];
  relevantVisitors: string[];
  order: number;
};

export type SectorVisual = { src: string; alt: string; ai: boolean; credit: string };

/**
 * One image per sector. Real IIEV 2026 photographs are used wherever the show floor had a
 * genuine example; the remaining sectors use clearly labelled AI illustrations (Magnific,
 * daylight documentary style) — never presented as event photography.
 */
const VISUALS: Record<string, Omit<SectorVisual, "credit">> = {
  "electric-vehicles": { src: "/media/2026/expo-cars-display.webp", alt: "Electric SUVs on display at IIEV Show 2026, Pune", ai: false },
  "batteries-cells": { src: "/media/2026/expo-battery-demo.webp", alt: "Exhibitor demonstrating battery equipment to visitors at IIEV Show 2026", ai: false },
  "charging-infrastructure": { src: "/media/2026/expo-charging-stall.webp", alt: "EV charging solutions stand at IIEV Show 2026", ai: false },
  "energy-storage": { src: "/media/2026/expo-stall-visitors.webp", alt: "Visitors at an energy-storage stand at IIEV Show 2026", ai: false },
  "clean-mobility": { src: "/media/2026/expo-solar-car.webp", alt: "Students presenting a solar-powered car at IIEV Show 2026", ai: false },
  "ev-components": { src: "/media/sectors/ev-components.webp", alt: "Illustration: EV wiring harness, connectors and control electronics on a workbench", ai: true },
  "motors-drivetrain": { src: "/media/sectors/motors-drivetrain.webp", alt: "Illustration: electric motor and gearbox on a test bench", ai: true },
  "manufacturing-equipment": { src: "/media/sectors/manufacturing-equipment.webp", alt: "Illustration: battery-pack assembly line in a factory", ai: true },
  "fleet-software": { src: "/media/sectors/fleet-software.webp", alt: "Illustration: electric cargo three-wheeler fleet at a charging depot", ai: true },
  "testing-recycling": { src: "/media/sectors/testing-recycling.webp", alt: "Illustration: battery cells on cycle-testing racks in a laboratory", ai: true },
};

export function sectorVisual(slug: string): SectorVisual {
  const v = VISUALS[slug] ?? { src: "/media/2026/expo-hall-overview.webp", alt: "Exhibition hall at IIEV Show 2026", ai: false };
  return { ...v, credit: v.ai ? "AI-generated illustration" : "Photo: IIEV Show 2026, Pune" };
}
export const sectors: SectorContent[] = [
  {
    slug: "electric-vehicles",
    name: "Electric Vehicles",
    group: "Vehicles",
    icon: "Scooter",
    order: 10,
    summary: "Electric two-wheelers, three-wheelers, passenger cars, light and heavy commercial vehicles and buses — for dealers, fleets and institutional buyers.",
    body: `## Who this sector is for
Vehicle makers use the show to meet the people who sell, finance and operate their products: prospective dealers and distributors, fleet and last-mile operators, aggregators and institutional buyers. Pune's automotive manufacturing base and the Pimpri-Chinchwad industrial belt make the venue a practical place to meet both channel partners and suppliers in the same three days.

## What buyers come to compare
Dealers and fleet operators typically arrive with a shortlist and use the floor to compare products side by side — ride quality, build, serviceability, battery warranty terms, spare-parts availability and the strength of the manufacturer's after-sales network. For commercial vehicles, total cost of ownership, payload, duty cycle and charging strategy usually matter more than headline range.

## Making the most of an exhibit
- Bring demonstration units that buyers can inspect closely, with clear specification sheets.
- Have a named person for dealership enquiries and a defined onboarding process.
- Be ready to discuss homologation status, warranty terms and service-network coverage for the regions you are recruiting in.`,
    exhibitorExamples: ["Electric scooter and motorcycle brands", "E-rickshaw and L5 three-wheeler makers", "Electric passenger-car and SUV brands", "Electric cargo and light commercial vehicles", "E-bus and fleet-vehicle manufacturers", "E-bicycle and micro-mobility brands"],
    buyerQuestions: ["What dealer margin, territory and onboarding support is offered?", "What does the battery warranty cover, and for how long?", "Where are service centres and spare-parts depots?", "Which variants are homologated and available now?"],
    relevantVisitors: ["Dealers, distributors and franchise seekers", "Fleet and logistics operators", "Ride-hailing and rental operators", "Corporate and institutional buyers", "Financiers and leasing companies"],
  },
  {
    slug: "ev-components",
    name: "EV Components & Auto Parts",
    group: "Vehicles",
    icon: "Layers",
    order: 20,
    summary: "Chassis, body, braking, suspension, lighting, wiring harnesses, connectors, displays and accessories engineered for electric platforms.",
    body: `## Who this sector is for
Component suppliers meet OEM purchase and engineering teams, tier-one suppliers and aftermarket distributors. For newer vehicle brands scaling production, the show is an efficient way to find second sources and localise parts.

## What buyers come to compare
Engineering buyers look for parts validated for electric duty — higher torque at low speed, different thermal behaviour, weight sensitivity and high-voltage safety. Purchase teams compare capacity, quality systems, lead times and willingness to co-develop.

## Making the most of an exhibit
- Show the parts in context: cut-aways, mounting points and test data.
- State production capacity and certifications plainly.
- Separate OEM supply conversations from aftermarket and distributor enquiries.`,
    exhibitorExamples: ["Wiring harness and high-voltage cable makers", "Connectors and junction boxes", "Lighting, instrument clusters and displays", "Braking and suspension suppliers", "Body panels, plastics and lightweight materials", "Accessories and aftermarket parts"],
    buyerQuestions: ["Is the part validated for EV duty cycles and high-voltage safety?", "What are lead times and minimum order quantities?", "Which quality certifications do you hold?", "Can you co-develop or customise for our platform?"],
    relevantVisitors: ["OEM purchase and engineering teams", "Tier-one and tier-two suppliers", "Aftermarket distributors", "Start-up vehicle makers"],
  },
  {
    slug: "motors-drivetrain",
    name: "Electric Motors, Controllers & Drivetrain",
    group: "Powertrain & energy",
    icon: "Motor",
    order: 30,
    summary: "Hub and mid-drive motors, traction motors, motor controllers, inverters, transmissions, DC-DC converters and on-board electronics.",
    body: `## Who this sector is for
Powertrain suppliers meet vehicle engineering teams who are choosing — or re-sourcing — the core of their platform, and integrators who assemble drive systems for niche vehicles.

## What buyers come to compare
Efficiency across the duty cycle, peak and continuous power, thermal management, IP rating, controller firmware flexibility, diagnostics, and the supplier's ability to support integration and calibration. Supply security for magnets and semiconductors is a recurring conversation.

## Making the most of an exhibit
- Publish efficiency maps and continuous-rating data, not only peak figures.
- Bring engineers who can discuss integration, CAN communication and calibration.
- Be clear about which vehicle segments each product line is designed for.`,
    exhibitorExamples: ["BLDC and PMSM hub and mid-drive motors", "Traction motors for cars and commercial vehicles", "Motor controllers and inverters", "Gearboxes and e-axles", "DC-DC converters and on-board chargers", "Vehicle control units and telematics hardware"],
    buyerQuestions: ["What are continuous (not just peak) power and torque ratings?", "How is the controller configured and diagnosed?", "What thermal management does the system require?", "How secure is your supply of magnets and power semiconductors?"],
    relevantVisitors: ["Vehicle engineering and R&D teams", "System integrators", "Retrofit and conversion specialists", "Research institutions"],
  },
  {
    slug: "batteries-cells",
    name: "Batteries, Cells & BMS",
    group: "Powertrain & energy",
    icon: "Battery",
    order: 40,
    summary: "Cells, modules and packs, battery management systems, thermal management, enclosures, materials and battery-pack assembly.",
    body: `## Who this sector is for
Battery makers and their supply chain meet vehicle OEMs, pack assemblers and energy-storage integrators. This sector connects directly with the concurrent India International Battery Show, where planned.

## What buyers come to compare
Cell chemistry and format, cycle life under realistic conditions, safety design and testing, BMS features and data access, thermal management, warranty terms, and traceability. Buyers increasingly ask about compliance with applicable Indian battery-safety standards and how end-of-life recovery is handled.

## Making the most of an exhibit
- Be explicit about chemistry, format and the test conditions behind cycle-life claims.
- Explain your safety approach — cell selection, BMS protection and pack design.
- Show how your BMS exposes data for fleet monitoring and warranty management.`,
    exhibitorExamples: ["Li-ion cell manufacturers and importers (LFP, NMC and others)", "Battery pack assemblers", "BMS hardware and software", "Thermal-management and cooling systems", "Pack enclosures and busbars", "Battery materials and components"],
    buyerQuestions: ["Under what conditions was cycle life measured?", "Which safety standards does the pack meet, and how was it tested?", "What data does the BMS expose, and how?", "What is the warranty and how are claims assessed?"],
    relevantVisitors: ["Vehicle OEMs and pack assemblers", "Energy-storage integrators", "Fleet operators managing battery health", "Investors in battery manufacturing"],
  },
  {
    slug: "charging-infrastructure",
    name: "Charging Infrastructure & Connectors",
    group: "Charging & infrastructure",
    icon: "Plug",
    order: 50,
    summary: "AC and DC chargers, light-EV and public charging, connectors and cables, charge-point management software, installation and grid integration.",
    body: `## Who this sector is for
Charger makers and charge-point operators meet site hosts — real-estate developers, fuel retailers, hotels, fleets, housing societies and municipal bodies — and the vehicle makers whose customers need reliable charging.

## What buyers come to compare
Compatibility with the connector standards their vehicles use, reliability and uptime, payment and roaming options, software openness, installation and maintenance support, and the commercial model — sale, lease or revenue share.

## Making the most of an exhibit
- State which connector and communication standards each product supports.
- Bring a live demonstration of your charge-point management software.
- Have a clear offer for each type of site host you want to reach.`,
    exhibitorExamples: ["AC wall-box and public AC chargers", "DC fast chargers", "Light-EV and two/three-wheeler charging", "Connectors, cables and sockets", "Charge-point management software", "Installation and electrical contractors"],
    buyerQuestions: ["Which vehicle connector standards are supported?", "What uptime and maintenance commitments come with the hardware?", "Is the software open to third-party roaming and payment?", "Which commercial models do you offer site hosts?"],
    relevantVisitors: ["Charge-point operators", "Real-estate and commercial site hosts", "Fleet depots", "Electricity distribution utilities", "Municipal and public-sector buyers"],
  },
  {
    slug: "energy-storage",
    name: "Energy Storage & Battery Swapping",
    group: "Charging & infrastructure",
    icon: "Storage",
    order: 60,
    summary: "Stationary storage for charging hubs and industry, battery-swapping stations and networks, and second-life battery applications.",
    body: `## Who this sector is for
Storage and swapping providers meet fleet operators, charging-hub developers and commercial energy users. Battery swapping is especially relevant to high-utilisation two- and three-wheeler fleets where downtime is expensive.

## What buyers come to compare
For swapping: network density, battery interoperability, pricing per swap or subscription, and how battery health is managed. For storage: usable capacity, round-trip efficiency, safety design, integration with chargers and solar, and service support.

## Making the most of an exhibit
- Explain your commercial model in plain terms — per swap, subscription or lease.
- Show the software that tracks battery health and station availability.
- Address safety and fire-protection design up front.`,
    exhibitorExamples: ["Battery-swapping station makers and networks", "Stationary storage for charging hubs", "Commercial and industrial storage systems", "Second-life battery integrators", "Energy-management software"],
    buyerQuestions: ["How is battery health tracked across a swap network?", "Which vehicles and battery formats are compatible?", "What is the pricing model and contract term?", "How does storage integrate with chargers and solar?"],
    relevantVisitors: ["Two- and three-wheeler fleet operators", "Charging-hub developers", "Commercial and industrial energy users", "Distribution utilities"],
  },
  {
    slug: "manufacturing-equipment",
    name: "Manufacturing, Assembly & Test Equipment",
    group: "Manufacturing & services",
    icon: "Factory",
    order: 70,
    summary: "Battery-pack and module assembly lines, motor manufacturing, welding, end-of-line testing, automation, tooling and factory software.",
    body: `## Who this sector is for
Equipment and automation suppliers meet manufacturers who are setting up or scaling EV, battery and component production — from start-ups building their first line to established auto-component makers diversifying into electric.

## What buyers come to compare
Throughput and yield, quality-control capability, flexibility across product variants, footprint, local service and spares, and the supplier's experience commissioning similar lines in India.

## Making the most of an exhibit
- Show real throughput and quality data from reference installations.
- Explain installation, commissioning and training support.
- Offer ways to start small and scale — semi-automatic to automatic.`,
    exhibitorExamples: ["Battery module and pack assembly lines", "Laser and ultrasonic welding", "Cell sorting and grading", "End-of-line and HIL testing", "Motor winding and assembly", "Industrial automation and MES software"],
    buyerQuestions: ["What throughput and yield do reference customers achieve?", "How long does commissioning take, and who supports it locally?", "Can the line handle multiple product variants?", "What spares and service coverage is available in India?"],
    relevantVisitors: ["Manufacturing heads and plant engineers", "Start-up vehicle and battery makers", "Auto-component makers diversifying into EV", "Industrial investors"],
  },
  {
    slug: "fleet-software",
    name: "Fleet, Telematics & Mobility Software",
    group: "Manufacturing & services",
    icon: "Software",
    order: 80,
    summary: "Telematics, fleet-management platforms, battery analytics, charging-management and routing software, connected-vehicle and financing platforms.",
    body: `## Who this sector is for
Software providers meet fleet operators, vehicle makers and financiers who need visibility into vehicle use, battery health and charging — the data that makes electric fleets economical and financeable.

## What buyers come to compare
Integration with their vehicles and chargers, data accuracy, battery-health insight, user experience for drivers and managers, data ownership and security, and pricing per vehicle.

## Making the most of an exhibit
- Demonstrate with realistic fleet data and show real dashboards.
- Be specific about integrations — which vehicles, BMS and chargers.
- Address data security, data ownership and hosting location.`,
    exhibitorExamples: ["Telematics hardware and platforms", "Fleet-management and dispatch software", "Battery-analytics platforms", "Charging and energy-management software", "Vehicle financing and leasing platforms", "Connected-vehicle and IoT solutions"],
    buyerQuestions: ["Which vehicles, BMS and chargers do you integrate with?", "Who owns the data, and where is it hosted?", "How do you estimate battery health and residual value?", "What is the per-vehicle cost at our fleet size?"],
    relevantVisitors: ["Fleet and logistics operators", "Vehicle OEMs", "Financiers and insurers", "Charge-point operators"],
  },
  {
    slug: "testing-recycling",
    name: "Testing, Certification & Recycling",
    group: "Manufacturing & services",
    icon: "Recycle",
    order: 90,
    summary: "Testing laboratories, certification and compliance services, measurement instruments, battery recycling and end-of-life recovery.",
    body: `## Who this sector is for
Testing, compliance and recycling providers meet manufacturers who must prove product safety and performance, and businesses that must manage batteries responsibly at end of life.

## What buyers come to compare
Accreditation and scope, turnaround times, consultation support during development, instrument accuracy, and — for recycling — collection logistics, recovery processes, documentation and compliance with applicable waste-management rules.

## Making the most of an exhibit
- State accreditation scope and typical turnaround clearly.
- Offer pre-compliance consultations for start-ups.
- For recycling: explain collection, documentation and what happens to recovered material.`,
    exhibitorExamples: ["Accredited testing laboratories", "Certification and homologation consultants", "Battery and power-electronics test instruments", "Battery recycling and recovery companies", "Reverse-logistics providers"],
    buyerQuestions: ["What is your accreditation scope?", "What are typical turnaround times?", "How do you document end-of-life recovery for compliance?", "Can you support us during product development?"],
    relevantVisitors: ["Quality and compliance managers", "Start-up manufacturers", "Battery and pack makers", "Fleet operators retiring batteries"],
  },
  {
    slug: "clean-mobility",
    name: "Solar-EV Integration & Adjacent Clean Mobility",
    group: "Charging & infrastructure",
    icon: "Sun",
    order: 100,
    summary: "Solar-powered charging, hybrid and solar vehicles, green hydrogen and bio-fuel mobility, and renewable energy for EV operations.",
    body: `## Who this sector is for
Renewable-energy and adjacent clean-mobility providers meet charging-hub developers, fleets and industrial users who want to lower the cost and emissions of the electricity behind electric mobility. It connects with the concurrent India International Solar Show, where planned.

## What buyers come to compare
Generation and storage sizing, integration with chargers, financing models (capex, opex, PPA), net-metering practicalities and maintenance support.

## Making the most of an exhibit
- Show integrated systems — panels, storage and chargers working together.
- Offer sizing tools or sample calculations for typical sites.
- Be clear about financing options and maintenance responsibilities.`,
    exhibitorExamples: ["Solar carports and solar-powered charging", "Rooftop solar for depots and showrooms", "Hybrid and solar vehicles", "Hydrogen and bio-fuel mobility solutions", "Renewable energy procurement services"],
    buyerQuestions: ["How do you size solar and storage for a charging site?", "Which financing models are available?", "Who maintains the system, and what is guaranteed?", "How does the system interact with the grid connection?"],
    relevantVisitors: ["Charging-hub developers", "Fleet depots and logistics parks", "Industrial energy users", "Real-estate developers"],
  },
];
