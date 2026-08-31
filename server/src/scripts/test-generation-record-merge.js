import assert from "node:assert/strict";
import { getDefaultValues } from "../config/contractFields.js";
import { mergeMissingGenerationRecordFields } from "../routes/contractRoutes.js";

const firstRecord = {
  fields: {
    companyName: "测试有限公司",
    shopName: "",
    contact: "张三",
    phone: "13800000000",
    email: "",
    address: "原地址",
    taxNo: "",
    bank: "",
    bankAccount: ""
  }
};

const secondRecord = {
  fields: {
    companyName: "测试有限公司",
    shopName: "测试通信专营店",
    contact: "李四",
    phone: "13900000000",
    email: "test@example.com",
    address: "新地址",
    taxNo: "913700000000000000",
    bank: "测试银行",
    bankAccount: "6222000000000000000"
  }
};

mergeMissingGenerationRecordFields(firstRecord, secondRecord);

assert.equal(firstRecord.fields.contact, "张三");
assert.equal(firstRecord.fields.phone, "13800000000");
assert.equal(firstRecord.fields.address, "原地址");
assert.equal(firstRecord.fields.shopName, "测试通信专营店");
assert.equal(firstRecord.fields.email, "test@example.com");
assert.equal(firstRecord.fields.taxNo, "913700000000000000");
assert.match(firstRecord.copyText, /联系人：张三/);
assert.match(firstRecord.copyText, /邮箱：test@example.com/);

// Keep this import exercised so the script fails if project ESM loading breaks.
assert.ok(getDefaultValues("mobile"));

console.log("Generation record merge test passed.");
