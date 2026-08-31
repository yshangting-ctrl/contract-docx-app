import mongoose from "mongoose";

const replacementSchema = new mongoose.Schema(
  {
    find: String,
    replacement: String,
    count: Number
  },
  { _id: false }
);

const contractGenerationSchema = new mongoose.Schema(
  {
    templateId: {
      type: String,
      default: "telecom"
    },
    templateName: {
      type: String,
      default: "电信合同"
    },
    title: {
      type: String,
      default: "电信渠道代理合同"
    },
    values: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    customReplacements: [
      {
        find: String,
        replacement: String
      }
    ],
    options: {
      keepBrackets: {
        type: Boolean,
        default: true
      }
    },
    replacementCount: {
      type: Number,
      default: 0
    },
    replacements: [replacementSchema]
  },
  { timestamps: true }
);

export const ContractGeneration = mongoose.model("ContractGeneration", contractGenerationSchema);
