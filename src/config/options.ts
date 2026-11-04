// Shared option lists for forms & filters.

export const SECTOR_OPTIONS = [
  { value: "electric-vehicles", label: "Electric vehicles (2W, 3W, 4W, commercial, buses)" },
  { value: "ev-components", label: "EV components & auto parts" },
  { value: "motors-drivetrain", label: "Electric motors, controllers & drivetrain" },
  { value: "charging-infrastructure", label: "Charging infrastructure & connectors" },
  { value: "batteries-cells", label: "Batteries, cells & BMS" },
  { value: "energy-storage", label: "Energy storage & battery swapping" },
  { value: "manufacturing-equipment", label: "Manufacturing, assembly & test equipment" },
  { value: "fleet-software", label: "Fleet, telematics & mobility software" },
  { value: "testing-recycling", label: "Testing, certification & recycling" },
  { value: "clean-mobility", label: "Solar-EV integration & adjacent clean mobility" },
] as const;

export const VISITOR_INDUSTRY_OPTIONS = [
  "EV / automotive OEM",
  "Component or parts manufacturer",
  "Dealer / distributor / franchise",
  "Fleet operator / logistics",
  "Charging point operator",
  "Battery / energy storage",
  "Investor / financial institution",
  "Government / public sector",
  "Research / academia",
  "Consultant / service provider",
  "Media",
  "Student",
  "Other",
] as const;

export const VISIT_REASON_OPTIONS = [
  "Source products or suppliers",
  "Explore dealership / distribution opportunities",
  "Evaluate technology for my business",
  "Meet existing partners",
  "Attend the conference",
  "Market research",
  "Other",
] as const;

export const STALL_AREA_OPTIONS = [
  "Up to 9 sq m",
  "10–18 sq m",
  "19–36 sq m",
  "37–72 sq m",
  "73 sq m or more",
  "Not sure yet",
] as const;

export const STALL_TYPE_OPTIONS = ["Shell scheme (built-up)", "Raw space", "Not sure yet"] as const;

export const SPONSORSHIP_INTEREST_OPTIONS = [
  "Title / presenting partnership",
  "Conference session partnership",
  "Registration & badge branding",
  "Venue branding",
  "Networking / hospitality",
  "Digital & email promotion",
  "Open to recommendations",
] as const;

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
] as const;

export const COUNTRIES = [
  "India", "Afghanistan", "Australia", "Austria", "Bangladesh", "Belgium", "Bhutan", "Brazil", "Canada", "China", "Czechia",
  "Denmark", "Egypt", "Finland", "France", "Germany", "Hong Kong", "Indonesia", "Iran", "Israel", "Italy", "Japan", "Kenya",
  "Malaysia", "Maldives", "Mauritius", "Mexico", "Myanmar", "Nepal", "Netherlands", "New Zealand", "Nigeria", "Norway",
  "Oman", "Philippines", "Poland", "Portugal", "Qatar", "Saudi Arabia", "Singapore", "South Africa", "South Korea", "Spain",
  "Sri Lanka", "Sweden", "Switzerland", "Taiwan", "Tanzania", "Thailand", "Turkey", "Uganda", "United Arab Emirates",
  "United Kingdom", "United States", "Vietnam", "Other",
] as const;
