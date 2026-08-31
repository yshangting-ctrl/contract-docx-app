import "dotenv/config";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { connectMongo, isMongoConnected } from "./config/database.js";
import { carrierRouter } from "./routes/carrierRoutes.js";
import { contractRouter } from "./routes/contractRoutes.js";
import { externalApiTimeoutMs } from "./services/externalApiService.js";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    mongodb: isMongoConnected(),
    services: {
      companyProfile: {
        riskBirdConfigured: Boolean(process.env.RISKBIRD_API_KEY || process.env.FN_API_KEY),
        siliconFlowConfigured: Boolean(process.env.SILICONFLOW_API_KEY)
      },
      externalApiTimeoutMs
    }
  });
});

app.use("/api", contractRouter);
app.use("/api", carrierRouter);

app.use((req, res) => {
  res.status(404).json({ message: "接口不存在。" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || "服务器错误。"
  });
});

await connectMongo();

app.listen(port, () => {
  console.log(`Contract API is running at http://localhost:${port}`);
});
