const axios = require("axios");

/**
 * POST /api/fertilizers/recommend
 *
 * Body:
 *   {
 *     "crop":      "Rice",
 *     "actual_n":  45,
 *     "actual_p":  20,
 *     "actual_k":  30,
 *     "actual_ph": 5.2
 *   }
 *
 * Response:
 *   {
 *     "crop":       "Rice",
 *     "fertilizer": "Urea",
 *     "ideal":      { N, P, K, pH },
 *     "deficits":   { N, P, K, pH },
 *     "advice":     "Your soil is low in Nitrogen. Apply Urea..."
 *   }
 */
exports.getFertilizerRecommendation = async (req, res) => {
  try {
    const { crop, actual_n, actual_p, actual_k, actual_ph } = req.body;

    // ── Basic validation ──
    if (!crop) {
      return res.status(400).json({ message: "crop is required" });
    }
    if (actual_n === undefined || actual_p === undefined ||
        actual_k === undefined || actual_ph === undefined) {
      return res.status(400).json({
        message: "actual_n, actual_p, actual_k, actual_ph are all required",
      });
    }

    const mlInput = {
      crop:      crop.trim(),
      actual_n:  Number(actual_n),
      actual_p:  Number(actual_p),
      actual_k:  Number(actual_k),
      actual_ph: Number(actual_ph),
    };

    console.log("Sending to ML:", mlInput);

    // ── Call Python ML service ──
    const mlResponse = await axios.post(
      "http://localhost:5001/predict",
      mlInput
    );

    const { fertilizer, ideal, deficits, advice } = mlResponse.data;

    return res.json({
      crop,
      fertilizer,
      ideal,
      deficits,
      advice,
    });

  } catch (error) {
    console.error("Fertilizer controller error:", error.response?.data || error.message);
    return res.status(500).json({
      message: "Server error",
      error: error.response?.data || error.message,
    });
  }
};

/**
 * GET /api/fertilizers/crops
 * Returns the list of all supported crop names from the ML service.
 */
exports.getSupportedCrops = async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5001/crops");
    return res.json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch crop list", error: error.message });
  }
};
