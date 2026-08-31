import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import JSZip from "jszip";
import sanitize from "sanitize-filename";
import { getDefaultValues, getFlattenedFields, getTemplate } from "../config/contractFields.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..", "..");

function templatePath(templateId) {
  const template = getTemplate(templateId);
  const configuredPath = template.fileName
    ? path.join("templates", template.fileName)
    : process.env.TEMPLATE_PATH || "templates/telecom-contract.docx";
  return path.isAbsolute(configuredPath) ? configuredPath : path.join(serverRoot, configuredPath);
}

function xmlTextNodes(document) {
  return Array.from(document.getElementsByTagName("w:t"));
}

function setNodeText(node, text) {
  node.textContent = text;

  if (/^\s|\s$/.test(text)) {
    node.setAttribute("xml:space", "preserve");
  }
}

function currentPositions(segments) {
  let cursor = 0;
  return segments.map((segment) => {
    const start = cursor;
    cursor += segment.text.length;
    return { start, end: cursor };
  });
}

function replaceOneRange(segments, start, end, replacement) {
  const positions = currentPositions(segments);
  const overlaps = segments
    .map((segment, index) => {
      const position = positions[index];
      const overlapStart = Math.max(start, position.start);
      const overlapEnd = Math.min(end, position.end);

      if (overlapStart >= overlapEnd) {
        return null;
      }

      return {
        segment,
        localStart: overlapStart - position.start,
        localEnd: overlapEnd - position.start
      };
    })
    .filter(Boolean);
  let replacementCursor = 0;

  overlaps.forEach((item, index) => {
    const isLast = index === overlaps.length - 1;
    const slotLength = item.localEnd - item.localStart;
    const chunkLength = isLast
      ? replacement.length - replacementCursor
      : Math.min(slotLength, replacement.length - replacementCursor);
    const chunk = replacement.slice(replacementCursor, replacementCursor + Math.max(0, chunkLength));
    const before = item.segment.text.slice(0, item.localStart);
    const after = item.segment.text.slice(item.localEnd);

    item.segment.text = `${before}${chunk}${after}`;
    replacementCursor += chunk.length;
  });
}

function replaceAcrossTextNodes(segments, find, replacement, occurrence) {
  if (!find) {
    return 0;
  }

  const fullText = segments.map((segment) => segment.text).join("");
  const matches = [];
  let cursor = fullText.indexOf(find);

  while (cursor !== -1) {
    matches.push({ start: cursor, end: cursor + find.length });
    cursor = fullText.indexOf(find, cursor + find.length);
  }

  if (Number.isInteger(occurrence) && occurrence > 0) {
    const match = matches[occurrence - 1];

    if (!match) {
      return 0;
    }

    replaceOneRange(segments, match.start, match.end, replacement);
    return 1;
  }

  for (let index = matches.length - 1; index >= 0; index -= 1) {
    replaceOneRange(segments, matches[index].start, matches[index].end, replacement);
  }

  return matches.length;
}

function applyReplacementPlan(xml, replacements) {
  const parser = new DOMParser({
    errorHandler: {
      warning: () => undefined,
      error: () => undefined,
      fatalError: (error) => {
        throw new Error(error);
      }
    }
  });
  const document = parser.parseFromString(xml, "application/xml");
  const textNodes = xmlTextNodes(document);
  const segments = textNodes.map((node) => ({ node, text: node.textContent || "" }));
  const summary = [];

  replacements.forEach((replacement) => {
    const count = replaceAcrossTextNodes(
      segments,
      replacement.find,
      replacement.replacement,
      replacement.occurrence
    );
    if (count > 0) {
      summary.push({ ...replacement, count });
    }
  });

  segments.forEach((segment) => setNodeText(segment.node, segment.text));

  return {
    xml: new XMLSerializer().serializeToString(document),
    summary
  };
}

function normalizeValue(value) {
  return String(value ?? "").replace(/\r\n/g, "\n");
}

function transformValueForTarget(value, target) {
  if (target.valueTransform === "mobileContractTermRange") {
    return value
      .replace(/^本协议有效期从/, "")
      .replace(/。$/, "")
      .trim();
  }

  if (target.valueTransform === "telecomContractTermRange") {
    return value
      .replace(/^本协议期限自/, "")
      .replace(/\s+$/, "");
  }

  return value;
}

export function buildReplacementPlan(templateId = "telecom", values = {}, options = {}, customReplacements = []) {
  const defaults = getDefaultValues(templateId);
  const mergedValues = { ...defaults, ...values };
  const keepBrackets = options.keepBrackets !== false;
  const replacements = [];

  getFlattenedFields(templateId).forEach((field) => {
    const value = normalizeValue(mergedValues[field.key]);

    field.targets.forEach((target) => {
      const targetValue = transformValueForTarget(value, target);
      const resolvedValue = `${target.prefix || ""}${targetValue}${target.suffix || ""}`;
      const replacement = target.kind === "bracketed" && keepBrackets ? `[${resolvedValue}]` : resolvedValue;
      replacements.push({
        find: target.find,
        replacement,
        key: field.key,
        occurrence: target.occurrence
      });
    });
  });

  customReplacements
    .filter((item) => item?.find)
    .forEach((item) => {
      replacements.push({
        find: String(item.find),
        replacement: normalizeValue(item.replacement),
        key: "custom"
      });
    });

  return replacements;
}

export async function generateContractDocx({ templateId = "telecom", values, options, customReplacements }) {
  const source = await fs.readFile(templatePath(templateId));
  const zip = await JSZip.loadAsync(source);
  const replacements = buildReplacementPlan(templateId, values, options, customReplacements);
  const summaries = [];

  const xmlFiles = Object.keys(zip.files).filter(
    (name) => name.startsWith("word/") && name.endsWith(".xml") && !zip.files[name].dir
  );

  for (const fileName of xmlFiles) {
    const xml = await zip.file(fileName).async("string");
    const result = applyReplacementPlan(xml, replacements);

    if (result.summary.length > 0) {
      zip.file(fileName, result.xml);
      summaries.push(...result.summary.map((item) => ({ ...item, part: fileName })));
    }
  }

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE"
  });

  return {
    buffer,
    summary: summaries,
    replacementCount: summaries.reduce((total, item) => total + item.count, 0)
  };
}

export function makeDownloadName(templateId = "telecom", values = {}, extension = "docx") {
  const template = getTemplate(templateId);
  const defaults = getDefaultValues(templateId);
  const partyName = sanitize(values.partyBName || defaults.partyBName || "合同");
  const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
  return `${partyName}-${template.outputName}-${timestamp}.${extension}`;
}
