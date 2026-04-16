const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const cropRoutes = require("./routes/cropRoutes");
const schemeRoutes = require("./routes/schemeRoutes");
const cropCalendarRoutes = require("./routes/cropCalendarRoutes");
const marketRoutes = require("./routes/marketRoutes");
const diseaseRoutes = require("./routes/diseaseRoutes");
const yieldRoutes = require("./routes/yieldRoutes");
const equipmentRoutes = require("./routes/equipmentRoutes");
const communityRoutes = require("./routes/communityRoutes");
const fertilizerRoutes = require("./routes/fertilizerRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("FarmAssist API Running");
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/crops", cropRoutes);
app.use("/api/weather", require("./routes/weather"));
app.use("/api/schemes", schemeRoutes);
app.use("/api/crop-calendar", cropCalendarRoutes);
app.use("/api", marketRoutes);
app.use("/api/disease", diseaseRoutes);
app.use("/api", yieldRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/fertilizers", fertilizerRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});