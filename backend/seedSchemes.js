const mongoose = require("mongoose");
const Scheme = require("./models/Scheme");

mongoose.connect("mongodb+srv://farmassist:farmassistpassword12345@cluster0.kldfnwi.mongodb.net/farmassist?appName=Cluster0");

const schemes = [
  {
    name: "PM-KISAN",
    fullName: "Pradhan Mantri Kisan Samman Nidhi",
    description: "Income support of ₹6,000 per year to small & marginal farmers",
    amount: "₹6,000/year",
    badge: "Eligible",
    badgeColor: "#D1FAE5",
    eligibility: [
      "Small & marginal landholding farmers",
      "Valid Aadhaar linked bank account",
      "Indian citizen"
    ],
    benefits: [
      "₹2,000 every 4 months",
      "Direct DBT transfer",
      "No intermediaries"
    ],
    timing: "Ongoing",
    applyButton: true,
    icon: "📋",
    iconColor: "#6366F1",
    category: "eligible",
    type: "income-support",
    applyLink: "https://pmkisan.gov.in/"
  },

  {
    name: "PMFBY",
    fullName: "Pradhan Mantri Fasal Bima Yojana",
    description: "Crop insurance scheme against natural calamities",
    amount: "2% premium (Kharif), 1.5% (Rabi)",
    badge: "Eligible",
    badgeColor: "#D1FAE5",
    eligibility: [
      "All farmers growing notified crops",
      "Must enroll before sowing"
    ],
    benefits: [
      "Coverage against drought, floods, pests",
      "Low premium rates",
      "Quick claim settlement"
    ],
    timing: "Before sowing season",
    applyButton: true,
    icon: "🛡️",
    iconColor: "#8B5CF6",
    category: "eligible",
    type: "insurance",
    applyLink: "https://pmfby.gov.in/"
  },

  {
    name: "KCC",
    fullName: "Kisan Credit Card Scheme",
    description: "Provides short-term credit support for farming",
    amount: "Up to ₹3 Lakhs at 4% interest",
    badge: "Eligible",
    badgeColor: "#D1FAE5",
    eligibility: [
      "Farmers with land documents",
      "Valid identity proof"
    ],
    benefits: [
      "Low interest rate",
      "Flexible repayment",
      "Insurance coverage"
    ],
    timing: "Apply anytime",
    applyButton: true,
    icon: "💳",
    iconColor: "#EC4899",
    category: "eligible",
    type: "credit",
    applyLink: "https://www.myscheme.gov.in/schemes/kcc"
  },

  {
    name: "Soil Health Card",
    fullName: "Soil Health Card Scheme",
    description: "Free soil testing & fertilizer recommendations",
    badge: "Free",
    badgeColor: "#E0E7FF",
    eligibility: [
      "All farmers",
      "Land ownership proof"
    ],
    benefits: [
      "Free soil testing",
      "Improved crop productivity"
    ],
    timing: "Every 2 years",
    applyButton: true,
    icon: "🌱",
    iconColor: "#10B981",
    category: "all",
    type: "advisory",
    applyLink: "https://soilhealth.dac.gov.in/"
  },

  {
    name: "PM-KUSUM",
    fullName: "Pradhan Mantri KUSUM Yojana",
    description: "Subsidy for solar irrigation pumps",
    amount: "60% subsidy",
    badge: "Subsidy",
    badgeColor: "#FEF3C7",
    eligibility: [
      "Individual farmers",
      "Farmer groups"
    ],
    benefits: [
      "Reduced electricity cost",
      "Income from surplus power"
    ],
    timing: "Apply before financial year end",
    applyButton: true,
    icon: "☀️",
    iconColor: "#F59E0B",
    category: "all",
    type: "subsidy",
    applyLink: "https://pmkusum.mnre.gov.in/"
  },

  {
    name: "PKVY",
    fullName: "Paramparagat Krishi Vikas Yojana",
    description: "Promotes organic farming",
    amount: "₹50,000 per hectare",
    badge: "Subsidy",
    badgeColor: "#FEF3C7",
    eligibility: [
      "Cluster of 50 farmers",
      "Minimum 50 hectare area"
    ],
    benefits: [
      "Organic input support",
      "Market linkage"
    ],
    timing: "Ongoing",
    applyButton: true,
    icon: "🌿",
    iconColor: "#059669",
    category: "all",
    type: "subsidy",
    applyLink: "https://pgsindia-ncof.gov.in/"
  },

  {
    name: "NMSA",
    fullName: "National Mission for Sustainable Agriculture",
    description: "Promotes sustainable agriculture practices",
    badge: "Eligible",
    badgeColor: "#D1FAE5",
    eligibility: [
      "All farmers",
      "State implementation basis"
    ],
    benefits: [
      "Water conservation",
      "Soil improvement"
    ],
    timing: "State-wise",
    applyButton: true,
    icon: "🌾",
    iconColor: "#84CC16",
    category: "eligible",
    type: "capacity-building",
    applyLink: "https://nmsa.dac.gov.in/"
  },

  {
    name: "Interest Subvention",
    fullName: "Modified Interest Subvention Scheme",
    description: "Interest subsidy on crop loans",
    amount: "1.5% + 3% prompt repayment",
    badge: "Subsidy",
    badgeColor: "#FEF3C7",
    eligibility: [
      "Short-term crop loan holders",
      "Timely repayment required"
    ],
    benefits: [
      "Effective 4% interest rate",
      "Extra benefit on prompt payment"
    ],
    timing: "Automatic benefit",
    applyButton: true,
    icon: "💰",
    iconColor: "#F59E0B",
    category: "all",
    type: "subsidy",
    applyLink: "https://agricoop.nic.in/"
  }
];

async function seed() {
  await Scheme.deleteMany();
  await Scheme.insertMany(schemes);
  console.log("All schemes inserted successfully");
  process.exit();
}

seed();