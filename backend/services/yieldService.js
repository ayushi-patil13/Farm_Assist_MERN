const cropYieldData = {
  Wheat: 12,
  Rice: 18,
  Sugarcane: 25,
  Maize: 10,
  Cotton: 8,
  Mustard: 10
};

const calculateYield = (cropName, area) => {

  const avgYield = cropYieldData[cropName] || 10;

  return area * avgYield;
};

module.exports = { calculateYield };