import express from "express";
import mongoose from "mongoose";
import { getDefaultValues, getFieldGroups, getTemplate, getTemplateSummaries } from "../config/contractFields.js";
import { isMongoConnected } from "../config/database.js";
import { AppSetting } from "../models/AppSetting.js";
import { ContractGeneration } from "../models/ContractGeneration.js";
import { generateContractDocx, makeDownloadName } from "../services/docxService.js";
import { fetchExternal, isExternalServiceError } from "../services/externalApiService.js";

export const contractRouter = express.Router();
const SILICONFLOW_API_URL = "https://api.siliconflow.cn/v1/chat/completions";
const SILICONFLOW_MODEL = process.env.SILICONFLOW_MODEL || "Pro/zai-org/GLM-5.1";
const RISKBIRD_API_BASE_URL = process.env.RISKBIRD_API_BASE_URL || "https://m.riskbird.com/prod-qbb-api";
const RISKBIRD_CHANNEL = process.env.RISKBIRD_CHANNEL || "github";
const defaultActiveMenuState = {
  activeAuthId: "pdd-auth",
  activeContractGroup: "phone",
  activeEmailScreenshotId: "mobile-email-screenshot",
  activeSection: "contract",
  templateId: "mobile"
};
const defaultAuthorizationNoticeContent = [
  "1. 二维码是p的只能包拼多多授权通过",
  "2. 如需真实工信部可查二维码，需自己提前自备二维码，可自行购买（比较贵，基本都是万元起步），或自己联系对应运营商办理（比较便宜得跟运营商熟悉）。",
  "3. 如没有自备工信部可查二维码，可先用p的二维码先上传审核，后期自己再补可查工信部二维码。",
  "4. 如平台要求补充资料，请以平台最新审核规则为准，并自行准备相关证明材料。"
].join("\n");
const contractGroupIds = new Set(["standard", "phone", "traffic"]);
const contractTemplateIds = new Set(["mobile", "unicom", "telecom", "broadcast"]);
const tmallTrafficTemplateIds = new Set([
  "tmall-traffic-oa-email",
  "tmall-brand-authorization",
  "tmall-business-development-proof",
  "tmall-employee-work-proof"
]);
const editableAuthorizationTemplateIds = new Set([
  "pdd-auth",
  "tmall-auth",
  "alipay-auth",
  "douyin-telecom-auth",
  "douyin-mobile-auth",
  "douyin-unicom-auth",
  "jd-telecom-auth",
  "jd-mobile-auth",
  "jd-unicom-auth"
]);
const allAuthorizationTemplateIds = new Set([
  ...editableAuthorizationTemplateIds,
  "kuaishou-auth",
  "qr-mobile-auth",
  "qr-unicom-auth",
  "qr-telecom-auth",
  "qr-broadcast-auth"
]);
const emailScreenshotIds = new Set([
  "mobile-email-screenshot",
  "telecom-email-screenshot",
  "unicom-email-screenshot"
]);
const contractRecordTemplateIds = [...contractTemplateIds];
const authorizationRecordTemplateIds = [...allAuthorizationTemplateIds, ...tmallTrafficTemplateIds];

function normalizeActiveMenuState(value = {}) {
  const activeSection =
    value.activeSection === "companyLookup" ||
    value.activeSection === "authorizationNotice" ||
    value.activeSection === "authorization" ||
    value.activeSection === "tmallTraffic" ||
    value.activeSection === "email" ||
    value.activeSection === "emailScreenshot" ||
    value.activeSection === "signatureAssets" ||
    value.activeSection === "trademarks" ||
    value.activeSection === "records"
      ? value.activeSection
      : "contract";

  if (activeSection === "tmallTraffic") {
    return {
      ...defaultActiveMenuState,
      activeSection,
      templateId: tmallTrafficTemplateIds.has(value.templateId)
        ? value.templateId
        : "tmall-traffic-oa-email"
    };
  }

  if (activeSection === "authorization") {
    const activeAuthId = allAuthorizationTemplateIds.has(value.activeAuthId)
      ? value.activeAuthId
      : defaultActiveMenuState.activeAuthId;
    const templateId = editableAuthorizationTemplateIds.has(activeAuthId)
      ? activeAuthId
      : contractTemplateIds.has(value.templateId)
        ? value.templateId
        : defaultActiveMenuState.templateId;

    return {
      ...defaultActiveMenuState,
      activeAuthId,
      activeSection,
      templateId
    };
  }

  if (
    activeSection === "companyLookup" ||
    activeSection === "authorizationNotice" ||
    activeSection === "email" ||
    activeSection === "emailScreenshot" ||
    activeSection === "signatureAssets" ||
    activeSection === "trademarks" ||
    activeSection === "records"
  ) {
    return {
      ...defaultActiveMenuState,
      activeEmailScreenshotId: emailScreenshotIds.has(value.activeEmailScreenshotId)
        ? value.activeEmailScreenshotId
        : defaultActiveMenuState.activeEmailScreenshotId,
      activeSection
    };
  }

  return {
    ...defaultActiveMenuState,
    activeContractGroup: contractGroupIds.has(value.activeContractGroup)
      ? value.activeContractGroup
      : defaultActiveMenuState.activeContractGroup,
    activeSection,
    templateId: contractTemplateIds.has(value.templateId)
      ? value.templateId
      : defaultActiveMenuState.templateId
  };
}

function normalizeAuthorizationNoticeContent(value = {}) {
  const content =
    typeof value?.content === "string"
      ? value.content
      : typeof value === "string"
        ? value
        : defaultAuthorizationNoticeContent;

  return content.slice(0, 10000);
}

function compactText(value) {
  return String(value || "").trim();
}

function getSiliconFlowApiKey() {
  return process.env.SILICONFLOW_API_KEY || "";
}

function getRiskBirdApiKey() {
  return process.env.RISKBIRD_API_KEY || process.env.FN_API_KEY || "";
}

function riskBirdUrl(endpoint, params = {}) {
  const base = RISKBIRD_API_BASE_URL.replace(/\/+$/, "");
  const endpointPath = String(endpoint || "").replace(/^\/+/, "");
  const url = new URL(`${base}/${endpointPath}`);
  const apiKey = getRiskBirdApiKey();

  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("channel", RISKBIRD_CHANNEL);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

async function requestRiskBird(endpoint, params = {}) {
  const response = await fetchExternal(riskBirdUrl(endpoint, params), {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  });
  const text = await response.text();
  let result = null;

  try {
    result = text ? JSON.parse(text) : null;
    if (typeof result === "string") {
      result = JSON.parse(result);
    }
  } catch {
    const error = new Error("风鸟 API 未返回有效 JSON");
    error.status = 502;
    throw error;
  }

  if (!response.ok || result?.code !== 20000 || result?.success === false) {
    const error = new Error(result?.msg || result?.message || `风鸟 API 请求失败：${response.status}`);
    error.status = response.ok ? 502 : response.status;
    throw error;
  }

  return result.data;
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

function normalizeCompanyProfile(value = {}) {
  return {
    companyName: compactText(value.companyName || value.name || value.entName || value.ENTNAME || value["公司名称"]),
    legalPerson: compactText(
      value.legalPerson ||
        value.legalRepresentative ||
        value.personName ||
        value.faren ||
        value["法人"] ||
        value["法定代表人"]
    ),
    taxNo: compactText(value.taxNo || value.creditCode || value.uscc || value.uniscid || value.UNISCID || value["统一社会信用代码"]),
    phone: compactText(value.phone || value.tel || value["电话"]),
    email: compactText(value.email || value["邮箱"]),
    address: compactText(value.address || value.registeredAddress || value.dom || value.dom2 || value.yrAddress || value["地址"]),
    bank: compactText(value.bank || value.bankName || value.openingBank || value.accountBank || value["开户银行"]),
    bankAccount: compactText(value.bankAccount || value.accountNo || value.bankNo || value.account || value["银行账号"] || value["账号"]),
    confidence: compactText(value.confidence || value["可信度"]),
    sourceNote: compactText(value.sourceNote || value.reason || value["说明"])
  };
}

function buildCompanyHeader(profile) {
  return [
    ["公司名称", profile.companyName],
    ["法人", profile.legalPerson],
    ["统一社会信用代码", profile.taxNo],
    ["电话", profile.phone],
    ["邮箱", profile.email],
    ["地址", profile.address],
    ["开户银行", profile.bank],
    ["银行账号", profile.bankAccount]
  ]
    .map(([label, value]) => `${label}：${value || ""}`)
    .join("\n");
}

function bestRiskBirdSearchItem(items = [], keyword = "") {
  const normalizedKeyword = compactText(keyword).replace(/[()（）\s]/g, "");

  return (
    items.find((item) => compactText(item?.ENTNAME || item?.entName).replace(/[()（）\s]/g, "") === normalizedKeyword) ||
    items.find((item) => item?.dataType === "company_basic") ||
    items[0]
  );
}

function normalizeRiskBirdCompanyProfile(apiData = {}) {
  const profile = normalizeCompanyProfile({
    companyName: apiData.entName,
    legalPerson: apiData.personName,
    taxNo: apiData.uniscid || apiData.taxId,
    phone: apiData.tel,
    email: apiData.email,
    address: apiData.dom,
    bank: apiData.bank || apiData.bankName || apiData.openingBank,
    bankAccount: apiData.bankAccount || apiData.accountNo || apiData.bankNo,
    confidence: "high",
    sourceNote: "风鸟企业查询"
  });

  return {
    ...profile,
    headerText: buildCompanyHeader(profile)
  };
}

async function lookupCompanyProfileByRiskBird(keyword) {
  if (!getRiskBirdApiKey()) {
    const error = new Error("未配置 RISKBIRD_API_KEY 或 FN_API_KEY");
    error.status = 500;
    throw error;
  }

  const searchData = await requestRiskBird("/skills/searchHint", { key: keyword });
  const searchItems = Array.isArray(searchData) ? searchData : [];
  const matched = bestRiskBirdSearchItem(searchItems, keyword);

  if (!matched?.entid) {
    const error = new Error("风鸟未匹配到公司");
    error.status = 404;
    throw error;
  }

  const detailData = await requestRiskBird("/skills/dataDimension", {
    version: "B1",
    entid: matched.entid
  });
  const apiData = detailData?.apiData || {};

  if (!apiData.entName && !apiData.uniscid) {
    const error = new Error("风鸟未返回公司详情");
    error.status = 404;
    throw error;
  }

  return normalizeRiskBirdCompanyProfile(apiData);
}

async function lookupCompanyProfileBySiliconFlow(keyword) {
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
            "你是企业公开资料查询和结构化助手。",
            "用户会给出中国大陆公司名称或统一社会信用代码。",
            "请尽量基于你能确认的公开企业资料返回信息；无法确认的字段必须返回空字符串，严禁编造电话、邮箱、地址、法人或信用代码。",
            "如果只能确定公司名称，也可以只返回公司名称，其余字段留空。",
            "只输出 JSON，不要解释。字段必须是 companyName、legalPerson、taxNo、phone、email、address、bank、bankAccount、confidence、sourceNote。"
          ].join("\n")
        },
        {
          role: "user",
          content: JSON.stringify({ keyword })
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: 420,
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
  const profile = normalizeCompanyProfile(parseJsonContent(content));

  return {
    ...profile,
    headerText: buildCompanyHeader(profile)
  };
}

async function lookupCompanyProfileByRecords(keyword) {
  if (!isMongoConnected()) {
    return null;
  }

  const record = await ContractGeneration.findOne({
    $or: [
      { "values.partyBName": keyword },
      { "values.authorizedCompany": keyword },
      { "values.partyBTaxNo": keyword }
    ]
  })
    .sort({ createdAt: -1 })
    .lean();

  if (!record) {
    return null;
  }

  const values = record.values || {};
  const profile = normalizeCompanyProfile({
    companyName: values.partyBName || values.authorizedCompany,
    legalPerson: values.partyBLegalRep,
    taxNo: values.partyBTaxNo,
    phone: values.partyBPhone || values.noticeBPhone,
    email: values.partyBEmail || values.noticeBEmail,
    address: values.partyBAddress || values.noticeBAddress,
    bank: values.partyBBank,
    bankAccount: values.partyBAccount,
    confidence: "本地记录",
    sourceNote: "系统生成记录"
  });

  return {
    ...profile,
    headerText: buildCompanyHeader(profile)
  };
}

async function lookupCompanyProfile(keyword) {
  const riskBirdApiKey = getRiskBirdApiKey();
  const siliconFlowApiKey = getSiliconFlowApiKey();
  let externalError = null;

  if (riskBirdApiKey) {
    try {
      return await lookupCompanyProfileByRiskBird(keyword);
    } catch (error) {
      console.warn(`RiskBird company profile lookup failed: ${error.message}`);
      externalError = error;
    }
  }

  if (siliconFlowApiKey) {
    try {
      return await lookupCompanyProfileBySiliconFlow(keyword);
    } catch (error) {
      console.warn(`SiliconFlow company profile lookup failed: ${error.message}`);
      externalError = error;
    }
  }

  const localProfile = await lookupCompanyProfileByRecords(keyword);

  if (localProfile) {
    return localProfile;
  }

  if (externalError) {
    throw externalError;
  }

  const error = new Error("未配置公司资料接口，且本地生成记录中未找到该公司。");
  error.status = 503;
  throw error;
}

function compactKey(value) {
  return compactText(value).replace(/\s+/g, "").toLowerCase();
}

function isMongoAccessError(error) {
  return (
    error?.code === 13 ||
    error?.codeName === "Unauthorized" ||
    /requires authentication|not authorized|authentication failed/i.test(error?.message || "")
  );
}

function warnMongoSkipped(action, error) {
  console.warn(`MongoDB ${action} skipped: ${error.message}`);
}

function firstValue(values, keys) {
  for (const key of keys) {
    const value = compactText(values?.[key]);

    if (value) {
      return value;
    }
  }

  return "";
}

function getContractCompanyName(values) {
  return firstValue(values, ["partyBName"]);
}

function getAuthorizationCompanyName(values) {
  return firstValue(values, ["partyBName", "authorizedCompany"]);
}

function buildShopNamesByCompany(items) {
  const shopNamesByCompany = new Map();

  for (const item of items) {
    const values = item.values || {};
    const companyKey = compactKey(getAuthorizationCompanyName(values));
    const shopName = firstValue(values, ["shopName"]);

    if (!companyKey || !shopName || shopNamesByCompany.has(companyKey)) {
      continue;
    }

    shopNamesByCompany.set(companyKey, shopName);
  }

  return shopNamesByCompany;
}

function recordMatchesCompany(item, companyKey) {
  const values = item.values || {};

  if (contractTemplateIds.has(item.templateId)) {
    return compactKey(getContractCompanyName(values)) === companyKey;
  }

  if (allAuthorizationTemplateIds.has(item.templateId) || tmallTrafficTemplateIds.has(item.templateId)) {
    return compactKey(getAuthorizationCompanyName(values)) === companyKey;
  }

  return false;
}

export function buildGenerationRecordCopyText(fields) {
  return [
    ["公司名称", fields.companyName],
    ["店铺名称", fields.shopName],
    ["联系人", fields.contact],
    ["统一社会信用代码", fields.taxNo],
    ["电话", fields.phone],
    ["邮箱", fields.email],
    ["地址", fields.address],
    ["开户银行", fields.bank],
    ["银行账号", fields.bankAccount]
  ]
    .map(([label, value]) => `${label}：${value || ""}`)
    .join("\n");
}

export function mergeMissingGenerationRecordFields(target, source) {
  const mergedFields = { ...target.fields };

  for (const [key, value] of Object.entries(source.fields || {})) {
    if (!compactText(mergedFields[key]) && compactText(value)) {
      mergedFields[key] = value;
    }
  }

  target.fields = mergedFields;
  target.copyText = buildGenerationRecordCopyText(mergedFields);
  return target;
}

function buildGenerationRecord(item, shopName = "") {
  const values = item.values || {};
  const companyName = getContractCompanyName(values);

  if (!companyName) {
    return null;
  }

  const fields = {
    companyName,
    shopName: compactText(shopName),
    contact: firstValue(values, ["partyBContact", "noticeBContact", "partyBLegalRep"]),
    phone: firstValue(values, ["partyBPhone", "noticeBPhone"]),
    email: firstValue(values, ["partyBEmail", "noticeBEmail"]),
    address: firstValue(values, ["partyBAddress", "noticeBAddress"]),
    taxNo: firstValue(values, ["partyBTaxNo"]),
    bank: firstValue(values, ["partyBBank"]),
    bankAccount: firstValue(values, ["partyBAccount"]),
    templateName: item.templateName || item.title || "",
    createdAt: item.createdAt
  };

  return {
    id: item._id,
    templateId: item.templateId || "",
    templateName: fields.templateName,
    createdAt: fields.createdAt,
    fields,
    copyText: buildGenerationRecordCopyText(fields)
  };
}

function downloadResponse(res, fileName, buffer) {
  const encodedName = encodeURIComponent(fileName);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodedName}`);
  res.setHeader("Content-Length", buffer.length);
  res.send(buffer);
}

function buildGeneratedContractDownload(templateId, values, generated) {
  return {
    buffer: generated.buffer,
    fileName: makeDownloadName(templateId, values, "docx")
  };
}

function sendGeneratedContract(res, download) {
  downloadResponse(res, download.fileName, download.buffer);
}

function normalizeBody(body) {
  const template = getTemplate(body?.templateId);

  return {
    templateId: template.id,
    values: body?.values || {},
    customReplacements: Array.isArray(body?.customReplacements) ? body.customReplacements : [],
    options: {
      keepBrackets: body?.options?.keepBrackets ?? template.keepBracketsDefault
    }
  };
}

contractRouter.get("/contract/fields", (req, res) => {
  const template = getTemplate(req.query.templateId);

  res.json({
    templates: getTemplateSummaries(),
    selectedTemplate: {
      id: template.id,
      name: template.name,
      title: template.title,
      outputName: template.outputName
    },
    groups: getFieldGroups(template.id),
    defaults: getDefaultValues(template.id),
    options: {
      keepBrackets: template.keepBracketsDefault
    }
  });
});

contractRouter.post("/company-profile", async (req, res, next) => {
  try {
    const keyword = compactText(req.body?.keyword);

    if (!keyword) {
      res.status(400).json({ success: false, message: "请输入公司名称或统一社会信用代码。" });
      return;
    }

    if (keyword.length > 200) {
      res.status(400).json({ success: false, message: "查询内容不能超过 200 个字符。" });
      return;
    }

    const data = await lookupCompanyProfile(keyword);
    res.json({ success: true, data });
  } catch (error) {
    if (isExternalServiceError(error)) {
      res.status(503).json({
        success: false,
        skipped: true,
        message: error.message || "公司资料接口暂不可用，请稍后重试。"
      });
      return;
    }

    next(error);
  }
});

contractRouter.get("/settings/active-menu", async (req, res, next) => {
  try {
    if (!isMongoConnected()) {
      res.json({ connected: false, data: defaultActiveMenuState });
      return;
    }

    const setting = await AppSetting.findOne({ key: "activeMenu" }).lean();
    res.json({ connected: true, data: normalizeActiveMenuState(setting?.value || {}) });
  } catch (error) {
    if (isMongoAccessError(error)) {
      warnMongoSkipped("active menu read", error);
      res.json({ connected: false, data: defaultActiveMenuState });
      return;
    }

    next(error);
  }
});

contractRouter.put("/settings/active-menu", async (req, res, next) => {
  try {
    const value = normalizeActiveMenuState(req.body || {});

    if (!isMongoConnected()) {
      res.json({ connected: false, data: value });
      return;
    }

    const setting = await AppSetting.findOneAndUpdate(
      { key: "activeMenu" },
      { key: "activeMenu", value },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    res.json({ connected: true, data: setting.value });
  } catch (error) {
    if (isMongoAccessError(error)) {
      warnMongoSkipped("active menu write", error);
      res.json({ connected: false, data: normalizeActiveMenuState(req.body || {}) });
      return;
    }

    next(error);
  }
});

contractRouter.get("/settings/authorization-notice", async (req, res, next) => {
  try {
    if (!isMongoConnected()) {
      res.json({ connected: false, data: { content: defaultAuthorizationNoticeContent } });
      return;
    }

    const setting = await AppSetting.findOne({ key: "authorizationNotice" }).lean();
    res.json({
      connected: true,
      data: { content: normalizeAuthorizationNoticeContent(setting?.value) }
    });
  } catch (error) {
    if (isMongoAccessError(error)) {
      warnMongoSkipped("authorization notice read", error);
      res.json({ connected: false, data: { content: defaultAuthorizationNoticeContent } });
      return;
    }

    next(error);
  }
});

contractRouter.put("/settings/authorization-notice", async (req, res, next) => {
  try {
    const content = normalizeAuthorizationNoticeContent(req.body || {});
    const value = { content };

    if (!isMongoConnected()) {
      res.json({ connected: false, data: value });
      return;
    }

    const setting = await AppSetting.findOneAndUpdate(
      { key: "authorizationNotice" },
      { key: "authorizationNotice", value },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    res.json({ connected: true, data: setting.value });
  } catch (error) {
    if (isMongoAccessError(error)) {
      warnMongoSkipped("authorization notice write", error);
      res.json({
        connected: false,
        data: { content: normalizeAuthorizationNoticeContent(req.body || {}) }
      });
      return;
    }

    next(error);
  }
});

contractRouter.get("/contracts", async (req, res, next) => {
  try {
    if (!isMongoConnected()) {
      res.json({ connected: false, items: [] });
      return;
    }

    const items = await ContractGeneration.find()
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    res.json({
      connected: true,
      items: items.map((item) => ({
        id: item._id,
        templateId: item.templateId || "telecom",
        templateName: item.templateName || item.title,
        title: item.title,
        values: item.values,
        options: item.options,
        replacementCount: item.replacementCount,
        createdAt: item.createdAt
      }))
    });
  } catch (error) {
    if (isMongoAccessError(error)) {
      warnMongoSkipped("history read", error);
      res.json({ connected: false, items: [] });
      return;
    }

    next(error);
  }
});

contractRouter.get("/generation-records", async (req, res, next) => {
  try {
    if (!isMongoConnected()) {
      res.json({ connected: false, items: [] });
      return;
    }

    const [contractItems, authorizationItems] = await Promise.all([
      ContractGeneration.find({ templateId: { $in: contractRecordTemplateIds } })
        .sort({ createdAt: -1 })
        .limit(500)
        .lean(),
      ContractGeneration.find({ templateId: { $in: authorizationRecordTemplateIds } })
        .sort({ createdAt: -1 })
        .limit(500)
        .lean()
    ]);
    const shopNamesByCompany = buildShopNamesByCompany(authorizationItems);
    const recordsByCompany = new Map();
    const records = [];

    for (const item of contractItems) {
      const companyKey = compactKey(getContractCompanyName(item.values || {}));
      const record = buildGenerationRecord(item, shopNamesByCompany.get(companyKey));

      if (!record || !companyKey) {
        continue;
      }

      const existingRecord = recordsByCompany.get(companyKey);

      if (existingRecord) {
        mergeMissingGenerationRecordFields(existingRecord, record);
        continue;
      }

      recordsByCompany.set(companyKey, record);
      records.push(record);
    }

    res.json({ connected: true, items: records });
  } catch (error) {
    if (isMongoAccessError(error)) {
      warnMongoSkipped("generation records read", error);
      res.json({ connected: false, items: [] });
      return;
    }

    next(error);
  }
});

contractRouter.delete("/generation-records/:id", async (req, res, next) => {
  try {
    if (!isMongoConnected()) {
      res.status(503).json({ message: "MongoDB 未连接，无法删除生成记录。" });
      return;
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "生成记录编号无效。" });
      return;
    }

    const sourceRecord = await ContractGeneration.findById(req.params.id).lean();

    if (!sourceRecord) {
      res.status(404).json({ message: "未找到生成记录。" });
      return;
    }

    const values = sourceRecord.values || {};
    const companyName = contractTemplateIds.has(sourceRecord.templateId)
      ? getContractCompanyName(values)
      : getAuthorizationCompanyName(values);
    const companyKey = compactKey(companyName);

    if (!companyKey) {
      res.status(400).json({ message: "生成记录缺少公司名称，无法删除。" });
      return;
    }

    const items = await ContractGeneration.find({
      templateId: { $in: [...contractRecordTemplateIds, ...authorizationRecordTemplateIds] }
    })
      .select("_id templateId values")
      .lean();
    const ids = items
      .filter((item) => recordMatchesCompany(item, companyKey))
      .map((item) => item._id);

    if (ids.length === 0) {
      res.json({ success: true, deletedCount: 0 });
      return;
    }

    const result = await ContractGeneration.deleteMany({ _id: { $in: ids } });

    res.json({ success: true, deletedCount: result.deletedCount || 0 });
  } catch (error) {
    if (isMongoAccessError(error)) {
      warnMongoSkipped("generation record delete", error);
      res.status(503).json({ message: "MongoDB 未授权，无法删除生成记录。" });
      return;
    }

    next(error);
  }
});

contractRouter.post("/contracts/generate", async (req, res, next) => {
  try {
    const payload = normalizeBody(req.body);
    const template = getTemplate(payload.templateId);
    const generated = await generateContractDocx(payload);
    const download = buildGeneratedContractDownload(payload.templateId, payload.values, generated);

    if (isMongoConnected()) {
      try {
        await ContractGeneration.create({
          templateId: template.id,
          templateName: template.name,
          title: template.title,
          values: payload.values,
          customReplacements: payload.customReplacements,
          options: payload.options,
          replacementCount: generated.replacementCount,
          replacements: generated.summary
        });
      } catch (error) {
        if (!isMongoAccessError(error)) {
          throw error;
        }

        warnMongoSkipped("history write", error);
      }
    }

    sendGeneratedContract(res, download);
  } catch (error) {
    next(error);
  }
});

contractRouter.get("/contracts/:id/download", async (req, res, next) => {
  try {
    if (!isMongoConnected()) {
      res.status(503).json({ message: "MongoDB 未连接，无法读取历史记录。" });
      return;
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "合同记录编号无效。" });
      return;
    }

    const record = await ContractGeneration.findById(req.params.id).lean();

    if (!record) {
      res.status(404).json({ message: "未找到合同记录。" });
      return;
    }

    const generated = await generateContractDocx({
      templateId: record.templateId || "telecom",
      values: record.values || {},
      options: record.options,
      customReplacements: record.customReplacements
    });

    const download = buildGeneratedContractDownload(record.templateId || "telecom", record.values || {}, generated);
    sendGeneratedContract(res, download);
  } catch (error) {
    if (isMongoAccessError(error)) {
      warnMongoSkipped("history download", error);
      res.status(503).json({ message: "MongoDB 未授权，无法读取历史记录。" });
      return;
    }

    next(error);
  }
});
