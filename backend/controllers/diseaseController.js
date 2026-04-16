const fetch = require("node-fetch");
const fs = require("fs");
const FormData = require("form-data");

const ML_SERVICE_URL = process.env.DISEASE_ML_URL || "http://127.0.0.1:8000";

exports.detectDisease = async (req, res) => {
  try {
    // ── Validate upload ──────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded. Send image as multipart/form-data with key 'image'" });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: "Invalid file type. Only JPEG, PNG and WebP images are accepted." });
    }

    const maxSize = 15 * 1024 * 1024; // 15MB
    if (req.file.size > maxSize) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: "Image too large. Maximum size is 15MB." });
    }

    // ── Forward to Python ML service ─────────────────────────────
    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path), {
      filename: req.file.originalname || "image.jpg",
      contentType: req.file.mimetype,
    });

    const mlResponse = await fetch(`${ML_SERVICE_URL}/api/disease/detect`, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
      timeout: 15000,
    });

    // ── Cleanup uploaded file ─────────────────────────────────────
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Failed to delete temp file:", err);
    });

    if (!mlResponse.ok) {
      const errText = await mlResponse.text();
      console.error("ML service error:", errText);
      return res.status(500).json({ error: "Disease detection service returned an error", detail: errText });
    }

    const result = await mlResponse.json();

    return res.json(result);

  } catch (error) {
    // Cleanup on error
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }

    if (error.code === "ECONNREFUSED") {
      console.error("ML service not running on port 8000");
      return res.status(503).json({
        error: "Disease detection service is unavailable. Please ensure the Python ML service is running.",
        hint: "Run: cd backend/ml/diseaseDetection && python app.py"
      });
    }

    console.error("Disease detection error:", error);
    return res.status(500).json({ error: "Detection failed", detail: error.message });
  }
};
