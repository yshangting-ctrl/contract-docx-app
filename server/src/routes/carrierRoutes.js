import express from "express";
import QRCode from "qrcode";
import { defaultCarriers, carrierOrder } from "../config/defaultCarriers.js";
import { isMongoConnected } from "../config/database.js";
import { AppSetting } from "../models/AppSetting.js";
import { Carrier } from "../models/Carrier.js";
import { fetchExternal, isExternalServiceError } from "../services/externalApiService.js";

export const carrierRouter = express.Router();

const SILICONFLOW_API_URL = "https://api.siliconflow.cn/v1/chat/completions";
const SILICONFLOW_MODEL = process.env.SILICONFLOW_MODEL || "Pro/zai-org/GLM-5.1";
const defaultQrConfig = {
  fontSizes: {
    telecomCompany: 52,
    broadnetCompany: 100
  },
  qrImages: {},
  unicomDetails: {
    channelName: "武汉轩乐乐网络科技有限公司1",
    channelCode: "64V8Riu",
    authCode: "No.4101156588867",
    url: "http://www.10010.com"
  }
};

function cloneCarrier(carrier) {
  return {
    ...carrier,
    extra: Array.isArray(carrier.extra) ? [...carrier.extra] : []
  };
}

function sortCarriers(items) {
  return [...items].sort((first, second) => carrierOrder.indexOf(first.id) - carrierOrder.indexOf(second.id));
}

function mergeQrConfig(value = {}) {
  return {
    ...defaultQrConfig,
    ...value,
    fontSizes: {
      ...defaultQrConfig.fontSizes,
      ...(value.fontSizes || {})
    },
    qrImages: {
      ...defaultQrConfig.qrImages,
      ...(value.qrImages || {})
    },
    unicomDetails: {
      ...defaultQrConfig.unicomDetails,
      ...(value.unicomDetails || {})
    }
  };
}

function parseQrSize(size) {
  const match = String(size || "").match(/^(\d{2,4})(?:x\d{2,4})?$/i);
  const width = match ? Number(match[1]) : 300;

  return Math.min(800, Math.max(120, Number.isFinite(width) ? width : 300));
}

async function getSettingValue(key, defaultValue) {
  if (!isMongoConnected()) {
    return defaultValue;
  }

  const setting = await AppSetting.findOne({ key }).lean();
  return setting?.value ?? defaultValue;
}

async function setSettingValue(key, value) {
  if (!isMongoConnected()) {
    return value;
  }

  const setting = await AppSetting.findOneAndUpdate(
    { key },
    { key, value },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  return setting.value;
}

async function ensureDefaultCarriers() {
  if (!isMongoConnected()) {
    return;
  }

  await Promise.all(
    defaultCarriers.map((carrier) =>
      Carrier.updateOne(
        { id: carrier.id },
        { $setOnInsert: carrier },
        { upsert: true }
      )
    )
  );
}

function normalizePinyin(value) {
  return String(value || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function hasCompanyNoise(value) {
  return /(有限责任公司|股份有限公司|集团有限公司|有限公司|公司|网络科技|信息科技|信息技术|电子商务|通信技术|通讯技术)/.test(
    String(value || "")
  );
}

function getSiliconFlowApiKey() {
  return process.env.SILICONFLOW_API_KEY || "";
}

function parseJsonContent(content) {
  let text = String(content || "").trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fenced) {
    text = fenced[1].trim();
  }

  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }

    const error = new Error("接口未返回有效 JSON");
    error.status = 502;
    throw error;
  }
}

async function extractCompanyTradeName(company) {
  const apiKey = getSiliconFlowApiKey();

  if (!apiKey) {
    const error = new Error("未配置 SILICONFLOW_API_KEY");
    error.status = 500;
    throw error;
  }

  const response = await fetchExternal(SILICONFLOW_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: SILICONFLOW_MODEL,
      messages: [
        {
          role: "system",
          content: [
            "你是企业名称字号提取工具。",
            "任务：从公司名称中只提取“字号”，并输出该字号的无声调连续小写拼音。",
            "必须删除：行政区划、行业描述、组织形式。",
            "不得把公司全称、行业词或“有限公司/公司”当作字号。",
            "示例1：南京剑宁信息科技有限公司 -> {\"tradeName\":\"剑宁\",\"pinyin\":\"jianning\"}",
            "示例2：武汉轩乐乐网络科技有限公司 -> {\"tradeName\":\"轩乐乐\",\"pinyin\":\"xuanlele\"}",
            "示例3：移动陈淑霞通信专卖店 -> {\"tradeName\":\"陈淑霞\",\"pinyin\":\"chenshuxia\"}",
            "只输出 JSON，字段必须是 tradeName 和 pinyin，不要解释。"
          ].join("\n")
        },
        {
          role: "user",
          content: JSON.stringify({ company })
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: 120,
      stream: false
    })
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(result?.error?.message || result?.message || "SiliconFlow API 请求失败");
    error.status = response.status;
    throw error;
  }

  const content = result?.choices?.[0]?.message?.content;
  const parsed = parseJsonContent(content);
  const tradeName = String(parsed.tradeName || parsed.name || parsed["字号"] || "").trim();
  const pinyin = normalizePinyin(parsed.pinyin || parsed.slug || parsed["拼音"]);

  if (!tradeName || !pinyin || hasCompanyNoise(tradeName)) {
    const error = new Error("SiliconFlow API 未返回有效字号或拼音");
    error.status = 502;
    throw error;
  }

  return {
    tradeName,
    pinyin,
    url: `https://yidong${pinyin}.tmall.com`
  };
}

async function lookupPostalCodeByAddress(address) {
  const apiKey = getSiliconFlowApiKey();

  if (!apiKey) {
    const error = new Error("未配置 SILICONFLOW_API_KEY");
    error.status = 500;
    throw error;
  }

  const response = await fetchExternal(SILICONFLOW_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: SILICONFLOW_MODEL,
      messages: [
        {
          role: "system",
          content: [
            "你是中国大陆邮政编码查询助手。",
            "任务：根据用户提供的中文地址，返回最可能的6位邮政编码。",
            "要求：只有能判断到明确投递区域时才返回邮编；无法判断时 postalCode 返回空字符串。",
            "只输出 JSON，字段必须是 postalCode 和 reason，不要解释。"
          ].join("\n")
        },
        {
          role: "user",
          content: JSON.stringify({ address })
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: 160,
      stream: false
    })
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(result?.error?.message || result?.message || "SiliconFlow API 请求失败");
    error.status = response.status;
    throw error;
  }

  const parsed = parseJsonContent(result?.choices?.[0]?.message?.content);
  const postalCode =
    String(
      parsed.postalCode ||
        parsed.postal_code ||
        parsed.zipCode ||
        parsed.zip ||
        parsed.postcode ||
        parsed.code ||
        parsed["邮编"] ||
        parsed["邮政编码"] ||
        ""
    )
      .trim()
      .match(/\d{6}/)?.[0] || "";
  const reason = String(parsed.reason || parsed["原因"] || "").trim();

  if (!postalCode) {
    const error = new Error("SiliconFlow API 未返回有效邮编");
    error.status = 404;
    throw error;
  }

  return {
    postalCode,
    reason
  };
}

carrierRouter.get("/carriers", async (req, res, next) => {
  try {
    if (!isMongoConnected()) {
      res.json({ success: true, connected: false, data: defaultCarriers.map(cloneCarrier) });
      return;
    }

    await ensureDefaultCarriers();
    const carriers = await Carrier.find().lean();
    res.json({ success: true, connected: true, data: sortCarriers(carriers) });
  } catch (error) {
    next(error);
  }
});

carrierRouter.put("/carriers/:id", async (req, res, next) => {
  try {
    const { company, no, extra } = req.body || {};

    if (!isMongoConnected()) {
      const fallback = defaultCarriers.find((carrier) => carrier.id === req.params.id);

      if (!fallback) {
        res.status(404).json({ success: false, message: "Not found" });
        return;
      }

      res.json({
        success: true,
        connected: false,
        data: {
          ...cloneCarrier(fallback),
          company: typeof company === "undefined" ? fallback.company : company,
          no: typeof no === "undefined" ? fallback.no : no,
          extra: Array.isArray(extra) ? extra : [...fallback.extra]
        }
      });
      return;
    }

    await ensureDefaultCarriers();
    const update = {};

    if (typeof company !== "undefined") update.company = company;
    if (typeof no !== "undefined") update.no = no;
    if (Array.isArray(extra)) update.extra = extra;

    const carrier = await Carrier.findOneAndUpdate(
      { id: req.params.id },
      update,
      { new: true, runValidators: true }
    ).lean();

    if (!carrier) {
      res.status(404).json({ success: false, message: "Not found" });
      return;
    }

    res.json({ success: true, connected: true, data: carrier });
  } catch (error) {
    next(error);
  }
});

carrierRouter.get("/qr-config", async (req, res, next) => {
  try {
    const config = mergeQrConfig(await getSettingValue("qrConfig", defaultQrConfig));
    res.json({ success: true, connected: isMongoConnected(), data: config });
  } catch (error) {
    next(error);
  }
});

carrierRouter.put("/qr-config", async (req, res, next) => {
  try {
    const current = mergeQrConfig(await getSettingValue("qrConfig", defaultQrConfig));
    const nextConfig = mergeQrConfig({
      ...current,
      ...(req.body || {}),
      fontSizes: {
        ...current.fontSizes,
        ...(req.body?.fontSizes || {})
      },
      qrImages: {
        ...current.qrImages,
        ...(req.body?.qrImages || {})
      },
      unicomDetails: {
        ...current.unicomDetails,
        ...(req.body?.unicomDetails || {})
      }
    });
    const saved = await setSettingValue("qrConfig", nextConfig);
    res.json({ success: true, connected: isMongoConnected(), data: mergeQrConfig(saved) });
  } catch (error) {
    next(error);
  }
});

carrierRouter.get("/qr-code", async (req, res, next) => {
  const data = String(req.query.data || "").trim();
  const size = String(req.query.size || "300x300");

  if (!data) {
    res.status(400).json({ success: false, message: "Missing data" });
    return;
  }

  if (data.length > 2048) {
    res.status(400).json({ success: false, message: "二维码内容不能超过 2048 个字符" });
    return;
  }

  try {
    const image = await QRCode.toBuffer(data, {
      type: "png",
      width: parseQrSize(size),
      margin: 1,
      errorCorrectionLevel: "M",
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    });

    res.setHeader("Cache-Control", "public, max-age=86400");
    res.type("png").send(image);
  } catch (error) {
    next(error);
  }
});

carrierRouter.post("/postal-code", async (req, res, next) => {
  try {
    const address = String(req.body?.address || "").trim();

    if (!address) {
      res.status(400).json({ success: false, message: "乙方地址不能为空" });
      return;
    }

    if (address.length > 500) {
      res.status(400).json({ success: false, message: "乙方地址不能超过 500 个字符" });
      return;
    }

    const data = await lookupPostalCodeByAddress(address);
    res.json({ success: true, data });
  } catch (error) {
    if (error.status === 404 || isExternalServiceError(error)) {
      console.warn(`Postal code lookup skipped: ${error.message}`);
      res.json({
        success: false,
        skipped: true,
        message: "硅基流动暂未匹配到邮编，请手动填写。"
      });
      return;
    }

    next(error);
  }
});

carrierRouter.post("/company-trade-name", async (req, res, next) => {
  try {
    const company = String(req.body?.company || "").trim();

    if (!company) {
      res.status(400).json({ success: false, message: "公司名称不能为空" });
      return;
    }

    if (company.length > 200) {
      res.status(400).json({ success: false, message: "公司名称不能超过 200 个字符" });
      return;
    }

    const data = await extractCompanyTradeName(company);
    res.json({ success: true, data });
  } catch (error) {
    if (isExternalServiceError(error)) {
      res.json({
        success: false,
        skipped: true,
        message: "企业字号自动获取暂不可用，请手动填写。"
      });
      return;
    }

    next(error);
  }
});

carrierRouter.post("/mobile/company-url", async (req, res, next) => {
  try {
    const company = String(req.body?.company || "").trim();

    if (!company) {
      res.status(400).json({ success: false, message: "公司名称不能为空" });
      return;
    }

    if (company.length > 200) {
      res.status(400).json({ success: false, message: "公司名称不能超过 200 个字符" });
      return;
    }

    const data = await extractCompanyTradeName(company);
    res.json({ success: true, data });
  } catch (error) {
    if (isExternalServiceError(error)) {
      res.json({
        success: false,
        skipped: true,
        message: "移动网址自动生成暂不可用，请手动填写。"
      });
      return;
    }

    next(error);
  }
});
