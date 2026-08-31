import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { contractTemplates } from "../config/contractFields.js";
import { generateContractDocx } from "../services/docxService.js";

const outputDir = path.resolve("tmp");
await fs.mkdir(outputDir, { recursive: true });

for (const template of contractTemplates) {
  const generated = await generateContractDocx({
    templateId: template.id,
    values: {
      partyBName: "测试科技有限公司",
      signingPlace: "山东青岛",
      partyBLegalRep: "测试负责人"
    },
    options: {
      keepBrackets: template.keepBracketsDefault
    },
    customReplacements: []
  });

  const outputPath = path.join(outputDir, `generated-${template.id}-test.docx`);
  await fs.writeFile(outputPath, generated.buffer);

  console.log(`Generated ${outputPath}`);
  console.log(`Replacement count: ${generated.replacementCount}`);
}
