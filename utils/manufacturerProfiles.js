// utils/manufacturerProfiles.js

// Comprehensive manufacturer profiles database
// This file centralizes all manufacturer information for easy maintenance and updates

export const manufacturerProfiles = {
  // Major medical device manufacturers
  medtronic: {
    name: "Medtronic",
    aliases: ["medtronic", "covidien", "puritan bennett"],
    website: "https://www.medtronic.com/",
    description:
      "Medtronic is a global leader in medical technology, offering innovative devices and therapies that transform healthcare. With over 70 years of experience, they provide solutions for cardiovascular, diabetes, neurological, and surgical conditions.",
    certifications: ["ISO 13485", "FDA Registered", "CE Mark", "ISO 9001"],
    supportEmail: "support@medtronic.com",
    specialties: ["Cardiovascular", "Diabetes", "Neurological", "Surgical"],
    foundedYear: 1949,
  },

  "intuitive surgical": {
    name: "Intuitive Surgical",
    aliases: ["intuitive", "intuitive surgical", "da vinci"],
    website: "https://www.intuitive.com/",
    description:
      "Intuitive Surgical pioneers minimally invasive robotic surgery with the da Vinci Surgical System, enabling surgeons to operate with enhanced precision and control.",
    certifications: ["ISO 13485", "FDA Registered", "CE Mark"],
    supportEmail: "support@intuitive.com",
    specialties: [
      "Robotic Surgery",
      "Minimally Invasive Surgery",
      "Surgical Robotics",
    ],
    foundedYear: 1995,
  },

  stryker: {
    name: "Stryker Corporation",
    aliases: ["stryker", "stryker corp", "stryker corporation"],
    website: "https://www.stryker.com/",
    description:
      "Stryker is a leading medical technology company offering innovative products and services in orthopedics, medical and surgical, and neurotechnology and spine.",
    certifications: ["ISO 13485", "FDA Registered", "CE Mark", "ISO 9001"],
    supportEmail: "customersupport@stryker.com",
    specialties: [
      "Orthopedics",
      "Medical & Surgical",
      "Neurotechnology",
      "Spine",
    ],
    foundedYear: 1941,
  },

  ethicon: {
    name: "Ethicon (Johnson & Johnson)",
    aliases: ["ethicon", "j&j", "johnson & johnson", "johnson and johnson"],
    website: "https://www.ethicon.com/",
    description:
      "Ethicon, part of Johnson & Johnson, develops surgical solutions including sutures, surgical meshes, energy devices, and surgical staplers for healthcare professionals worldwide.",
    certifications: ["ISO 13485", "FDA Registered", "CE Mark", "ISO 9001"],
    supportEmail: "customersupport@ethicon.com",
    specialties: [
      "Surgical Sutures",
      "Wound Closure",
      "Energy Devices",
      "Surgical Staplers",
    ],
    foundedYear: 1886,
  },

  bard: {
    name: "BD Bard (Becton Dickinson)",
    aliases: [
      "bard",
      "bd bard",
      "c.r. bard",
      "cr bard",
      "becton dickinson bard",
    ],
    website: "https://www.bd.com/en-us",
    description:
      "BD Bard specializes in vascular, urology, oncology, and surgical specialty products. Part of BD (Becton, Dickinson and Company), they provide innovative medical technologies.",
    certifications: ["ISO 13485", "FDA Registered", "CE Mark", "ISO 9001"],
    supportEmail: "customer_support@bd.com",
    specialties: [
      "Vascular Access",
      "Urology",
      "Oncology",
      "Surgical Specialties",
    ],
    foundedYear: 1907,
  },

  bd: {
    name: "BD (Becton, Dickinson and Company)",
    aliases: ["bd", "becton dickinson", "becton, dickinson and company"],
    website: "https://www.bd.com/",
    description:
      "BD is a global medical technology company that manufactures and sells medical devices, instrument systems and reagents used by healthcare institutions, physicians, and researchers.",
    certifications: ["ISO 13485", "FDA Registered", "CE Mark", "ISO 9001"],
    supportEmail: "customersupport@bd.com",
    specialties: [
      "Medical Devices",
      "Laboratory Equipment",
      "Diagnostics",
      "Pharmaceutical",
    ],
    foundedYear: 1897,
  },

  // Additional major manufacturers
  "boston scientific": {
    name: "Boston Scientific",
    aliases: ["boston scientific", "bsc"],
    website: "https://www.bostonscientific.com/",
    description:
      "Boston Scientific develops medical devices used in interventional medical specialties, including interventional cardiology, peripheral interventions, neuromodulation, and more.",
    certifications: ["ISO 13485", "FDA Registered", "CE Mark"],
    supportEmail: "customerservice@bsci.com",
    specialties: [
      "Interventional Cardiology",
      "Peripheral Interventions",
      "Neuromodulation",
      "Endoscopy",
    ],
    foundedYear: 1979,
  },

  "abbott laboratories": {
    name: "Abbott Laboratories",
    aliases: ["abbott", "abbott laboratories", "abbott labs"],
    website: "https://www.abbott.com/",
    description:
      "Abbott is a global healthcare leader that helps people live more fully at all stages of life through life-changing products that span the breadth of healthcare.",
    certifications: ["ISO 13485", "FDA Registered", "CE Mark", "ISO 9001"],
    supportEmail: "support@abbott.com",
    specialties: [
      "Diagnostics",
      "Medical Devices",
      "Nutritionals",
      "Pharmaceuticals",
    ],
    foundedYear: 1888,
  },

  "3m health care": {
    name: "3M Health Care",
    aliases: ["3m", "3m health care", "3m healthcare", "3m medical"],
    website: "https://www.3m.com/3M/en_US/health-care-us/",
    description:
      "3M Health Care applies science to improve lives through innovative medical solutions including surgical supplies, infection prevention, and skin & wound care products.",
    certifications: ["ISO 13485", "FDA Registered", "CE Mark", "ISO 9001"],
    supportEmail: "healthcare@3m.com",
    specialties: [
      "Surgical Supplies",
      "Infection Prevention",
      "Wound Care",
      "Dental",
    ],
    foundedYear: 1902,
  },

  "cardinal health": {
    name: "Cardinal Health",
    aliases: ["cardinal", "cardinal health"],
    website: "https://www.cardinalhealth.com/",
    description:
      "Cardinal Health is a distributor of pharmaceuticals and medical products, and a manufacturer of medical and surgical products including gloves, surgical apparel, and fluid management products.",
    certifications: ["ISO 13485", "FDA Registered", "CE Mark"],
    supportEmail: "customerservice@cardinalhealth.com",
    specialties: [
      "Medical Distribution",
      "Surgical Products",
      "Pharmaceutical Services",
      "Fluid Management",
    ],
    foundedYear: 1971,
  },

  "zimmer biomet": {
    name: "Zimmer Biomet",
    aliases: ["zimmer", "biomet", "zimmer biomet"],
    website: "https://www.zimmerbiomet.com/",
    description:
      "Zimmer Biomet is a global leader in musculoskeletal healthcare, designing, manufacturing and marketing orthopedic reconstructive products, sports medicine, biologics, and more.",
    certifications: ["ISO 13485", "FDA Registered", "CE Mark", "ISO 9001"],
    supportEmail: "customersupport@zimmerbiomet.com",
    specialties: [
      "Orthopedic Reconstruction",
      "Sports Medicine",
      "Biologics",
      "Spine",
    ],
    foundedYear: 1927,
  },

  "smith & nephew": {
    name: "Smith & Nephew",
    aliases: ["smith & nephew", "smith and nephew", "s&n"],
    website: "https://www.smith-nephew.com/",
    description:
      "Smith & Nephew is a global medical technology company specializing in orthopedics, sports medicine, and wound management solutions.",
    certifications: ["ISO 13485", "FDA Registered", "CE Mark", "ISO 9001"],
    supportEmail: "customer.service@smith-nephew.com",
    specialties: [
      "Orthopedics",
      "Sports Medicine",
      "Wound Management",
      "Advanced Surgical Devices",
    ],
    foundedYear: 1856,
  },

  // Generic/smaller manufacturers fallback
  generic: {
    name: "Medical Device Manufacturer",
    aliases: ["medical", "surgical", "healthcare", "devices", "instruments"],
    website: null,
    description:
      "Trusted medical supply manufacturer providing high-quality healthcare products and medical devices to healthcare facilities worldwide.",
    certifications: ["ISO 13485", "FDA Registered"],
    supportEmail: null,
    specialties: [
      "Medical Devices",
      "Surgical Instruments",
      "Healthcare Products",
    ],
    foundedYear: null,
  },
};

// Smart manufacturer matching function
export const findManufacturerProfile = (manufacturerName) => {
  if (!manufacturerName) return null;

  const searchTerm = manufacturerName.toLowerCase().trim();

  // First try exact match
  if (manufacturerProfiles[searchTerm]) {
    return manufacturerProfiles[searchTerm];
  }

  // Then try alias matching
  for (const profile of Object.values(manufacturerProfiles)) {
    if (profile.aliases) {
      for (const alias of profile.aliases) {
        if (
          searchTerm.includes(alias.toLowerCase()) ||
          alias.toLowerCase().includes(searchTerm)
        ) {
          return profile;
        }
      }
    }
  }

  // Finally try partial matching on profile names
  for (const profile of Object.values(manufacturerProfiles)) {
    const profileName = profile.name.toLowerCase();
    if (searchTerm.includes(profileName) || profileName.includes(searchTerm)) {
      return profile;
    }
  }

  return null; // No match found, will use fallback
};

// Helper function to get all manufacturer names for autocomplete/search
export const getAllManufacturerNames = () => {
  return Object.values(manufacturerProfiles)
    .filter((profile) => profile !== manufacturerProfiles.generic)
    .map((profile) => profile.name)
    .sort();
};

// Helper function to get manufacturers by specialty
export const getManufacturersBySpecialty = (specialty) => {
  return Object.values(manufacturerProfiles)
    .filter(
      (profile) =>
        profile.specialties &&
        profile.specialties.some((s) =>
          s.toLowerCase().includes(specialty.toLowerCase())
        )
    )
    .map((profile) => profile.name);
};
