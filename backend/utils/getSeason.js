function getCurrentSeason() {

//   // ✅ TEMPORARY OVERRIDE (for testing)
//   const overrideSeason = "Rabi"; // change to "Rabi" / "Zaid"

//   if (overrideSeason) return overrideSeason;

  // ORIGINAL LOGIC
  const month = new Date().getMonth() + 1;

  if (month >= 6 && month <= 10) return "Kharif";
  if (month >= 11 || month <= 3) return "Rabi";
  return "Zaid";
}

module.exports = getCurrentSeason;