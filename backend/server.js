require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

mongoose
  .connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log("Database Connected Successfully"))
  .catch((error) => console.log("Database Connection Error: ", error));

const authRoutes = require("./routes/auth.routes");
const orgRoutes = require("./routes/org.routes");
const departmentRoutes = require("./routes/department.route");
const eventRoutes = require("./routes/event.routes");
const userRoutes = require("./routes/user.routes");
const typeRoutes = require("./routes/type.routes");
const categoryRoutes = require("./routes/category.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const taxonomyRoutes = require("./routes/taxonomy.routes");
const suggestedCategoryRoutes = require("./routes/suggestedCategory.routes");

app.use("/auth", authRoutes);
app.use("/org", orgRoutes);
app.use("/department", departmentRoutes);
app.use("/event", eventRoutes);
app.use("/user", userRoutes);
app.use("/type", typeRoutes);
app.use("/type", typeRoutes);
app.use("/category", categoryRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/taxonomy", taxonomyRoutes);
app.use("/scategory", suggestedCategoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
