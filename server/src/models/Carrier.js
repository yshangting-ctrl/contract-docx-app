import mongoose from "mongoose";

const carrierSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    enName: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    company: {
      type: String,
      required: true
    },
    no: {
      type: String,
      required: true
    },
    extra: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

export const Carrier = mongoose.model("Carrier", carrierSchema);
