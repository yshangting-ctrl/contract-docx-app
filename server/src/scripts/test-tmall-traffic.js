import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { DOMParser } from "@xmldom/xmldom";
import JSZip from "jszip";
import { getDefaultValues, getFlattenedFields, getTemplate } from "../config/contractFields.js";
import { generateContractDocx } from "../services/docxService.js";

const templateIds = [
  "tmall-traffic-oa-email",
  "tmall-brand-authorization",
  "tmall-business-development-proof",
  "tmall-employee-work-proof"
];
const outputDir = path.resolve("tmp", "tmall-traffic-tests");

await fs.mkdir(outputDir, { recursive: true });

function paragraphTexts(xml) {
  const document = new DOMParser().parseFromString(xml, "application/xml");

  return Array.from(document.getElementsByTagName("w:p")).map((paragraph) =>
    Array.from(paragraph.getElementsByTagName("w:t"))
      .map((node) => node.textContent || "")
      .join("")
  );
}

function documentText(xml) {
  const document = new DOMParser().parseFromString(xml, "application/xml");

  return Array.from(document.getElementsByTagName("w:t"))
    .map((node) => node.textContent || "")
    .join("");
}

for (const templateId of templateIds) {
  const template = getTemplate(templateId);
  const fields = getFlattenedFields(templateId);
  const values = Object.fromEntries(fields.map((field) => [field.key, `测试-${field.key}`]));
  const generated = await generateContractDocx({
    templateId,
    values,
    options: { keepBrackets: template.keepBracketsDefault },
    customReplacements: []
  });

  const source = await fs.readFile(path.resolve("templates", template.fileName));
  const sourceZip = await JSZip.loadAsync(source);
  const generatedZip = await JSZip.loadAsync(generated.buffer);
  const sourceXml = await sourceZip.file("word/document.xml").async("string");
  const generatedXml = await generatedZip.file("word/document.xml").async("string");
  const generatedText = documentText(generatedXml);
  const replacedKeys = new Set(generated.summary.map((item) => item.key));

  for (const field of fields) {
    assert.ok(replacedKeys.has(field.key), `${templateId}: ${field.key} did not match the source document`);
    assert.ok(generatedText.includes(values[field.key]), `${templateId}: ${field.key} value is missing`);
  }

  for (const partName of Object.keys(sourceZip.files)) {
    if (sourceZip.files[partName].dir || partName === "word/document.xml") {
      continue;
    }

    const sourcePart = await sourceZip.file(partName).async("nodebuffer");
    const generatedPart = await generatedZip.file(partName).async("nodebuffer");
    assert.deepEqual(generatedPart, sourcePart, `${templateId}: unexpected change in ${partName}`);
  }

  const defaultGenerated = await generateContractDocx({
    templateId,
    values: getDefaultValues(templateId),
    options: { keepBrackets: template.keepBracketsDefault },
    customReplacements: []
  });
  const defaultZip = await JSZip.loadAsync(defaultGenerated.buffer);
  const defaultXml = await defaultZip.file("word/document.xml").async("string");
  assert.deepEqual(
    paragraphTexts(defaultXml),
    paragraphTexts(sourceXml),
    `${templateId}: default generation changed paragraph text distribution`
  );

  const outputPath = path.join(outputDir, `${templateId}.docx`);
  await fs.writeFile(outputPath, generated.buffer);
  console.log(`${templateId}: ${fields.length} fields, ${generated.replacementCount} replacements`);
}

console.log("Tmall traffic DOCX tests passed.");
