import { useEffect, useMemo, useRef, useState } from "react";
import { ClipboardPaste, Copy, Database, Download, FileCheck2, Loader2, RefreshCw, RotateCcw } from "lucide-react";
import unicomLogo from "./assets/ltong.png";
import "./emailScreenshot.css";

const defaultUnicomEmailForm = {
  platformName: "拼多多",
  companyName: "新乡破万法数字技术有限公司",
  shopName: "联通破万法专卖店",
  authorizationType: "联通授权",
  senderEmail: "gd-pankm@chinaunicom.cn",
  recipients: "renzheng, pikeman",
  sentAt: "2026-07-10 14:22",
  senderName: "潘奎铭",
  senderCompany: "中国联合网络通信有限公司",
  senderAddress: "广州市增城区朱村街科德大道粤和赢城智谷地一栋711室",
  senderPhone: "18520012451",
  products: "新入网手机号码、4/3G上网资费卡、流量充值、话费充值、宽带"
};

const unicomEmailAttachments = [
  { name: "营业执照.jpg", size: "486 KB" },
  { name: "身份证正面.jpg", size: "126 KB" },
  { name: "身份证反面.jpg", size: "168 KB" },
  { name: "授权书.jpg", size: "462 KB" }
];

const defaultMobileEmailForm = {
  platformName: "拼多多",
  companyName: "哈尔滨市婧烁网络科技有限公司",
  shopName: "婧烁通信57专营店",
  authorizationType: "移动授权",
  senderName: "chibingxin",
  senderEmail: "chibingxin@sd.chinamobile.com",
  recipients: "renzheng, pikeman",
  recipientName: "renzheng",
  recipientEmail: "renzheng@pinduoduo.com",
  ccName: "pikeman",
  ccEmail: "pikeman@pinduoduo.com",
  sentAt: "2026年7月6日 (周一) 18:29",
  mailSize: "934 KB",
  products: "新入网手机号码、4/3G上网资费卡、流量充值、话费充值、宽带"
};

const mobileEmailAttachments = [
  { name: "身份证正面.jpg", size: "195 KB" },
  { name: "身份证反面.jpg", size: "187 KB" },
  { name: "营业执照.jpg", size: "200 KB" },
  { name: "移动授权书.jpg", size: "352 KB" }
];

const mobileToolbarItems = [
  { icon: "↩", label: "回复" },
  { icon: "↩", label: "回复全部" },
  { icon: "➜", label: "转发" },
  { icon: "✕", label: "删除" },
  { icon: "◆", label: "邮件标签" },
  { icon: "▣", label: "打印" },
  { icon: "▣", label: "打印预览" },
  { icon: "♨", label: "垃圾邮件" }
];

const defaultTelecomEmailForm = {
  platformName: "拼多多",
  companyName: "揭阳市恩诺达科技有限公司",
  shopName: "恩诺达通信专营店",
  shopId: "979078584",
  authorizationType: "电信授权",
  accountEmail: "18905454754.sd@chinatelecom.cn",
  senderName: "曾旺玉",
  senderEmail: "18905454754.sd@chinatelecom.cn",
  recipientName: "renzheng",
  recipientEmail: "renzheng@pinduoduo.com",
  ccName: "pikeman",
  ccEmail: "pikeman@pinduoduo.com",
  sentAt: "2025/07/21 11:00:21 星期一",
  senderCompany: "中国电信股份有限公司山东分公司",
  senderPhone: "18905454754",
  products: "新入网手机号码、4/3G上网资费卡、流量充值、话费充值、宽带"
};

const telecomEmailAttachments = [
  { name: "执照.jpg", size: "272.71K" },
  { name: "法人1.jpg", size: "342.45K" },
  { name: "法人2.jpg", size: "523.86K" },
  { name: "授权书.jpg", size: "506.55K" }
];

const shortWeekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const fullWeekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

function padDatePart(value) {
  return String(value).padStart(2, "0");
}

function formatUnicomSentAt(date = new Date()) {
  return [
    `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`,
    `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`
  ].join(" ");
}

function formatMobileSentAt(date = new Date()) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 (${shortWeekdays[date.getDay()]}) ${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
}

function formatTelecomSentAt(date = new Date()) {
  return `${date.getFullYear()}/${padDatePart(date.getMonth() + 1)}/${padDatePart(date.getDate())} ${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}:${padDatePart(date.getSeconds())} ${fullWeekdays[date.getDay()]}`;
}

function createDefaultUnicomEmailForm() {
  return {
    ...defaultUnicomEmailForm,
    sentAt: formatUnicomSentAt()
  };
}

function createDefaultMobileEmailForm() {
  return {
    ...defaultMobileEmailForm,
    sentAt: formatMobileSentAt()
  };
}

function createDefaultTelecomEmailForm() {
  return {
    ...defaultTelecomEmailForm,
    sentAt: formatTelecomSentAt()
  };
}

function copyComputedStyles(source, target) {
  const styles = window.getComputedStyle(source);

  for (let index = 0; index < styles.length; index += 1) {
    const property = styles[index];
    target.style.setProperty(
      property,
      styles.getPropertyValue(property),
      styles.getPropertyPriority(property)
    );
  }

  Array.from(source.children).forEach((child, index) => {
    if (target.children[index]) {
      copyComputedStyles(child, target.children[index]);
    }
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function inlineImages(sourceNode, clonedNode) {
  const sourceImages = Array.from(sourceNode.querySelectorAll("img"));
  const clonedImages = Array.from(clonedNode.querySelectorAll("img"));

  await Promise.all(
    clonedImages.map(async (img, index) => {
      const source = sourceImages[index];
      const src = source?.currentSrc || source?.src || img.src;

      if (!src || src.startsWith("data:")) {
        img.src = src;
        return;
      }

      const response = await fetch(src);
      const blob = await response.blob();
      img.src = await blobToDataUrl(blob);
    })
  );
}

async function waitForImages(node) {
  const images = Array.from(node.querySelectorAll("img"));

  await Promise.all(
    images.map((img) => {
      if (img.complete) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );
}

async function downloadElementAsPng(node, fileName) {
  await document.fonts?.ready;
  await waitForImages(node);

  const rect = node.getBoundingClientRect();
  const width = Math.ceil(rect.width);
  const height = Math.ceil(rect.height);
  const clone = node.cloneNode(true);
  const container = document.createElement("div");

  copyComputedStyles(node, clone);
  await inlineImages(node, clone);

  container.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  clone.style.margin = "0";
  clone.style.animation = "none";
  clone.style.transform = "none";
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  container.appendChild(clone);

  const serialized = new XMLSerializer().serializeToString(container);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <foreignObject width="100%" height="100%">${serialized}</foreignObject>
    </svg>
  `;
  const image = new Image();
  const scale = 3;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas unavailable");
  }

  canvas.width = width * scale;
  canvas.height = height * scale;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });

  context.scale(scale, scale);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const link = document.createElement("a");
  link.download = fileName;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

async function copyToClipboard(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

async function loadGenerationRecords() {
  const response = await fetch("/api/generation-records");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "加载生成记录失败");
  }

  return data;
}

function sanitizeFileName(value, fallback = "邮件截图") {
  return String(value || fallback)
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "")
    .slice(0, 80);
}

function buildSubject(form) {
  return `${form.platformName}虚拟类目商家申请认证店铺资质-${form.companyName}-店铺名：${form.shopName}-${form.authorizationType}`;
}

function buildBody(form) {
  return [
    "兹证明，我司允许本公司合作商家：",
    `商家主体公司名称： ${form.companyName}`,
    `${form.platformName}店铺名称： ${form.shopName}`,
    `在${form.platformName}上销售本公司授权的产品${form.products}，本公司对该商家在${form.platformName}销售的货源真实性、正规性、合法性负责。同时，允许该商家为${form.platformName}用户办理固定电话装机、移机、过户，移动电话开户、过户等，并要求商家收集的用户身份信息仅限办理我司新入网手续，不得挪作他用或泄露。`,
    "请贵平台知悉。"
  ];
}

function buildMobileBody(form) {
  return [
    "兹证明，我司允许本公司合作商家：",
    `商家主体公司名称：${form.companyName}`,
    `${form.platformName}店铺名称：${form.shopName}`,
    `在${form.platformName}上销售本公司授权的产品${form.products}，本公司对该商家在${form.platformName}销售的货源真实性、正规性、合法性负责。同时，允许商家收集的用户身份信息仅限办理我司新入网手续，不得挪作他用或泄露。`,
    "请贵平台知悉。"
  ];
}

function buildTelecomBody(form) {
  return [
    "兹证明，我司允许本公司合作商家：",
    `商家主体公司名称：${form.companyName}`,
    `${form.platformName}店铺名称：${form.shopName}`,
    `${form.platformName}店铺 ID：${form.shopId}`,
    `在${form.platformName}平台销售本公司授权的 ${form.products}，并允许商家为${form.platformName}用户办理固定电话装机、移机、过户，移动电话开户、过户等，并要求商家收集的用户身份信息仅限办理我司新入网手续，不得挪作他用或泄露。`,
    "请贵平台知悉。"
  ];
}

function EmailScreenshotRecordPanel({ onApplyRecord }) {
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsQuery, setRecordsQuery] = useState("");
  const [recordsMessage, setRecordsMessage] = useState("");
  const [copiedTarget, setCopiedTarget] = useState("");
  const filteredEmailRecords = useMemo(() => {
    const keyword = recordsQuery.trim().toLowerCase();
    const items = records.filter((record) => record.fields?.companyName || record.fields?.shopName);

    if (!keyword) {
      return items;
    }

    return items.filter((record) =>
      [record.fields?.companyName, record.fields?.shopName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [records, recordsQuery]);
  const shouldScrollRecords = filteredEmailRecords.length > 10;

  async function copyText(target, value) {
    await copyToClipboard(value);
    setCopiedTarget(target);
    window.setTimeout(() => setCopiedTarget(""), 1600);
  }

  async function refreshEmailRecords() {
    setRecordsLoading(true);
    setRecordsMessage("");

    try {
      const data = await loadGenerationRecords();
      setRecords(data.items || []);
      setRecordsMessage(data.connected ? "" : "MongoDB 未连接");
    } catch (error) {
      setRecordsMessage(error.message || "加载记录失败");
    } finally {
      setRecordsLoading(false);
    }
  }

  useEffect(() => {
    refreshEmailRecords();
  }, []);

  function recordCopyText(record) {
    return [
      `公司名称：${record.fields?.companyName || ""}`,
      `店铺名称：${record.fields?.shopName || ""}`
    ].join("\n");
  }

  function applyRecord(record) {
    onApplyRecord(record);
    setRecordsMessage("已填入截图信息");
  }

  return (
    <section className="field-group email-record-panel email-screenshot-record-panel">
      <div className="email-output-heading">
        <h2>记录</h2>
        <button type="button" className="icon-button" onClick={refreshEmailRecords} title="刷新记录">
          {recordsLoading ? <Loader2 className="spin" size={18} /> : <RefreshCw size={18} />}
        </button>
      </div>
      <input
        value={recordsQuery}
        onChange={(event) => setRecordsQuery(event.target.value)}
        placeholder="搜索公司或店铺"
      />
      <div className={shouldScrollRecords ? "email-record-list email-record-list-scroll" : "email-record-list"}>
        {filteredEmailRecords.length === 0 ? (
          <div className="empty-state email-record-empty">
            <Database size={24} />
            <span>{recordsLoading ? "正在加载" : recordsMessage || "暂无记录"}</span>
          </div>
        ) : (
          filteredEmailRecords.map((record) => (
            <article className="email-record-item" key={record.id}>
              <div className="email-record-info">
                <span>公司名称</span>
                <strong>{record.fields?.companyName || ""}</strong>
                <span>店铺名称</span>
                <strong>{record.fields?.shopName || ""}</strong>
              </div>
              <div className="email-record-actions">
                <button type="button" className="text-button" onClick={() => applyRecord(record)}>
                  填入
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => copyText(`record-company-${record.id}`, record.fields?.companyName || "")}
                  title="复制公司名称"
                >
                  {copiedTarget === `record-company-${record.id}` ? (
                    <FileCheck2 size={17} />
                  ) : (
                    <Copy size={17} />
                  )}
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => copyText(`record-shop-${record.id}`, record.fields?.shopName || "")}
                  title="复制店铺名称"
                >
                  {copiedTarget === `record-shop-${record.id}` ? (
                    <FileCheck2 size={17} />
                  ) : (
                    <Copy size={17} />
                  )}
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => copyText(`record-both-${record.id}`, recordCopyText(record))}
                  title="复制公司和店铺"
                >
                  {copiedTarget === `record-both-${record.id}` ? (
                    <FileCheck2 size={17} />
                  ) : (
                    <ClipboardPaste size={17} />
                  )}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
      {recordsMessage && filteredEmailRecords.length > 0 && (
        <div className="message-line">{recordsMessage}</div>
      )}
    </section>
  );
}

function MobileEmailScreenshotPage() {
  const captureRef = useRef(null);
  const [form, setForm] = useState(createDefaultMobileEmailForm);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const subject = useMemo(() => buildSubject(form), [form]);
  const bodyLines = useMemo(() => buildMobileBody(form), [form]);
  const copyText = [
    subject,
    "",
    `发件人：${form.senderName}<${form.senderEmail}>`,
    `收件人：${form.recipientName}<${form.recipientEmail}>`,
    `抄送：${form.ccName}<${form.ccEmail}>`,
    `时间：${form.sentAt}`,
    "",
    ...bodyLines
  ].join("\n");

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(createDefaultMobileEmailForm());
    setMessage("已恢复默认截图内容");
  }

  function applyRecordToScreenshot(record) {
    setForm((current) => ({
      ...current,
      companyName: record.fields?.companyName || current.companyName,
      shopName: record.fields?.shopName || current.shopName
    }));
  }

  async function downloadScreenshot() {
    if (!captureRef.current || downloading) {
      return;
    }

    setDownloading(true);
    setMessage("");

    try {
      await downloadElementAsPng(
        captureRef.current,
        `${sanitizeFileName(form.shopName, "移动邮件截图")}-移动邮件截图.png`
      );
      setMessage("截图已下载");
    } catch (error) {
      setMessage(error.message || "下载截图失败");
    } finally {
      setDownloading(false);
    }
  }

  async function copyMailContent() {
    await copyToClipboard(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="email-screenshot-page">
      <header className="topbar">
        <div>
          <div className="eyebrow">邮件截图菜单</div>
          <h1>移动截图</h1>
        </div>
        <div className="email-screenshot-actions">
          <button type="button" className="text-button" onClick={resetForm}>
            <RotateCcw size={16} />
            恢复默认
          </button>
          <button type="button" className="text-button" onClick={copyMailContent}>
            {copied ? <FileCheck2 size={16} /> : <Copy size={16} />}
            {copied ? "已复制" : "复制文案"}
          </button>
          <button type="button" className="primary-button email-screenshot-download" onClick={downloadScreenshot} disabled={downloading}>
            {downloading ? <Loader2 className="spin" size={18} /> : <Download size={18} />}
            下载截图
          </button>
        </div>
      </header>

      <div className="email-screenshot-workspace mobile-email-workspace">
        <div className="email-screenshot-preview-shell">
          <article className="mobile-email-canvas" ref={captureRef}>
            <div className="mobile-mail-toolbar" aria-hidden="true">
              {mobileToolbarItems.map((item) => (
                <span className="mobile-toolbar-item" key={item.label}>
                  <i>{item.icon}</i>
                  <b>{item.label}</b>
                  {["回复", "回复全部", "转发"].includes(item.label) && <em>▼</em>}
                </span>
              ))}
            </div>

            <div className="mobile-mail-subject-row">
              <span>{subject}</span>
              <strong>★</strong>
            </div>

            <section className="mobile-mail-main">
              <header className="mobile-mail-summary">
                <strong>{form.senderName}</strong>
                <span>发给 {form.recipients}</span>
              </header>

              <div className="mobile-mail-details">
                <p><span>发件人:</span> <strong>{form.senderName}</strong>&lt;{form.senderEmail}&gt;</p>
                <p><span>收件人:</span> {form.recipientName}&lt;{form.recipientEmail}&gt;</p>
                <p><span>抄送:</span> {form.ccName}&lt;{form.ccEmail}&gt;</p>
                <p><span>时间:</span> {form.sentAt}</p>
                <p><span>大小:</span> {form.mailSize}</p>
              </div>

              <div className="mobile-mail-attachments">
                {mobileEmailAttachments.map((item) => (
                  <div className="mobile-attachment-item" key={item.name}>
                    <span className="mobile-attachment-icon">
                      <i />
                    </span>
                    <strong>{item.name}</strong>
                    <em>({item.size})</em>
                  </div>
                ))}
              </div>

              <section className="mobile-mail-body">
                <p>{bodyLines[0]}</p>
                <p>{bodyLines[1]}</p>
                <p>{bodyLines[2]}</p>
                <p>{bodyLines[3]}</p>
                <p>{bodyLines[4]}</p>
              </section>
            </section>
          </article>
        </div>

        <aside className="email-screenshot-side">
          <section className="field-group email-screenshot-config">
          <div className="group-heading">
            <h2>截图内容</h2>
          </div>
          <div className="field">
            <label>商家主体公司名称</label>
            <input value={form.companyName} onChange={(event) => updateField("companyName", event.target.value)} />
          </div>
          <div className="field">
            <label>店铺名称</label>
            <input value={form.shopName} onChange={(event) => updateField("shopName", event.target.value)} />
          </div>
          <div className="field">
            <label>平台名称</label>
            <input value={form.platformName} onChange={(event) => updateField("platformName", event.target.value)} />
          </div>
          <div className="field">
            <label>发件人显示名</label>
            <input value={form.senderName} onChange={(event) => updateField("senderName", event.target.value)} />
          </div>
          <div className="field">
            <label>发件邮箱</label>
            <input value={form.senderEmail} onChange={(event) => updateField("senderEmail", event.target.value)} />
          </div>
          <div className="field">
            <label>收件人邮箱</label>
            <input value={form.recipientEmail} onChange={(event) => updateField("recipientEmail", event.target.value)} />
          </div>
          <div className="field">
            <label>抄送邮箱</label>
            <input value={form.ccEmail} onChange={(event) => updateField("ccEmail", event.target.value)} />
          </div>
          <div className="field">
            <label>发送时间</label>
            <input value={form.sentAt} onChange={(event) => updateField("sentAt", event.target.value)} />
          </div>
          <div className="field">
            <label>邮件大小</label>
            <input value={form.mailSize} onChange={(event) => updateField("mailSize", event.target.value)} />
          </div>
          <div className="field">
            <label>授权产品</label>
            <textarea value={form.products} onChange={(event) => updateField("products", event.target.value)} />
          </div>
          {message && <div className="message-line">{message}</div>}
          </section>
          <EmailScreenshotRecordPanel onApplyRecord={applyRecordToScreenshot} />
        </aside>
      </div>
    </section>
  );
}

function TelecomEmailScreenshotPage() {
  const captureRef = useRef(null);
  const [form, setForm] = useState(createDefaultTelecomEmailForm);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const subject = useMemo(() => buildSubject(form), [form]);
  const bodyLines = useMemo(() => buildTelecomBody(form), [form]);
  const copyText = [
    subject,
    "",
    `发件人：${form.senderName}<${form.senderEmail}>`,
    `时间：${form.sentAt}`,
    `收件人：${form.recipientName}<${form.recipientEmail}>`,
    `抄送人：${form.ccName}<${form.ccEmail}>`,
    "",
    ...bodyLines,
    "",
    form.senderName,
    form.senderCompany,
    `手机：${form.senderPhone}`
  ].join("\n");

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(createDefaultTelecomEmailForm());
    setMessage("已恢复默认截图内容");
  }

  function applyRecordToScreenshot(record) {
    setForm((current) => ({
      ...current,
      companyName: record.fields?.companyName || current.companyName,
      shopName: record.fields?.shopName || current.shopName
    }));
  }

  async function downloadScreenshot() {
    if (!captureRef.current || downloading) {
      return;
    }

    setDownloading(true);
    setMessage("");

    try {
      await downloadElementAsPng(
        captureRef.current,
        `${sanitizeFileName(form.shopName, "电信邮件截图")}-电信邮件截图.png`
      );
      setMessage("截图已下载");
    } catch (error) {
      setMessage(error.message || "下载截图失败");
    } finally {
      setDownloading(false);
    }
  }

  async function copyMailContent() {
    await copyToClipboard(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="email-screenshot-page">
      <header className="topbar">
        <div>
          <div className="eyebrow">邮件截图菜单</div>
          <h1>电信截图</h1>
        </div>
        <div className="email-screenshot-actions">
          <button type="button" className="text-button" onClick={resetForm}>
            <RotateCcw size={16} />
            恢复默认
          </button>
          <button type="button" className="text-button" onClick={copyMailContent}>
            {copied ? <FileCheck2 size={16} /> : <Copy size={16} />}
            {copied ? "已复制" : "复制文案"}
          </button>
          <button type="button" className="primary-button email-screenshot-download" onClick={downloadScreenshot} disabled={downloading}>
            {downloading ? <Loader2 className="spin" size={18} /> : <Download size={18} />}
            下载截图
          </button>
        </div>
      </header>

      <div className="email-screenshot-workspace telecom-email-workspace">
        <div className="email-screenshot-preview-shell">
          <article className="telecom-email-canvas" ref={captureRef}>
            <div className="telecom-browser-tabs" aria-hidden="true">
              <span>山东电信沙盘系统</span>
              <span>中国电信山东分公司企业门户</span>
              <strong>中国电信集团邮箱</strong>
            </div>
            <div className="telecom-browser-address" aria-hidden="true">
              <span>☰</span>
              <b>mail.chinatelecom.cn/webmail/signOn.do</b>
            </div>
            <div className="telecom-bookmarks" aria-hidden="true">
              <span>中国电信山东分公司...</span>
              <span>山东电信沙盘系统</span>
              <span>山东电信新一代BSS...</span>
              <span>中国电信智慧...</span>
            </div>

            <header className="telecom-mail-top">
              <strong>{form.accountEmail}</strong>
              <div>
                <span>邮箱首页</span>
                <span>设置</span>
                <span>换肤</span>
                <span>密码管理</span>
                <span>邮箱资源管理</span>
                <span>登录管理</span>
                <button type="button">切到新版</button>
              </div>
            </header>

            <section className="telecom-mail-shell">
              <aside className="telecom-mail-sidebar" aria-hidden="true">
                <b>写信</b>
                <span>收信</span>
                <span>通讯录</span>
                <span>草稿箱</span>
                <span>已发送</span>
              </aside>

              <main className="telecom-mail-panel">
                <div className="telecom-subject-line">
                  <span>⌂</span>
                  <strong>{subject}</strong>
                </div>
                <div className="telecom-safe-tip">安全提示：如果邮件中涉及财产的操作，请与发件人电话确认，谨防受骗！</div>

                <div className="telecom-meta-list">
                  <p><span>发件人：</span> "{form.senderName}" &lt;{form.senderEmail}&gt;</p>
                  <p><span>时&nbsp;&nbsp;间：</span> {form.sentAt}</p>
                  <p><span>收件人：</span> {form.recipientName}&lt;{form.recipientEmail}&gt;</p>
                  <p><span>抄送人：</span> {form.ccName}&lt;{form.ccEmail}&gt;</p>
                  <div className="telecom-attachments-row">
                    <span>附&nbsp;&nbsp;件：</span>
                    {telecomEmailAttachments.map((item) => (
                      <div className="telecom-attachment-chip" key={item.name}>
                        <strong>{item.name}</strong>
                        <em>({item.size})</em>
                        <a>下载</a>
                        <a>预览</a>
                      </div>
                    ))}
                  </div>
                  <div className="telecom-all-attachments">
                    <b>下载所有附件(共4个)</b>
                    <span>所有附件已通过360杀毒引擎扫描</span>
                  </div>
                  <p><span>发送状态：</span> <strong className="telecom-success">投递成功</strong> <button type="button">查看详情</button></p>
                </div>

                <section className="telecom-mail-body">
                  {bodyLines.map((line, index) => (
                    <p className={index === 4 ? "telecom-body-paragraph" : undefined} key={line}>{line}</p>
                  ))}

                  <div className="telecom-signature-divider" />
                  <div className="telecom-signature">
                    <p>{form.senderName}</p>
                    <p>{form.senderCompany}</p>
                    <p>手机：{form.senderPhone}</p>
                  </div>
                </section>
              </main>
            </section>
          </article>
        </div>

        <aside className="email-screenshot-side">
          <section className="field-group email-screenshot-config">
          <div className="group-heading">
            <h2>截图内容</h2>
          </div>
          <div className="field">
            <label>商家主体公司名称</label>
            <input value={form.companyName} onChange={(event) => updateField("companyName", event.target.value)} />
          </div>
          <div className="field">
            <label>店铺名称</label>
            <input value={form.shopName} onChange={(event) => updateField("shopName", event.target.value)} />
          </div>
          <div className="field">
            <label>店铺 ID</label>
            <input value={form.shopId} onChange={(event) => updateField("shopId", event.target.value)} />
          </div>
          <div className="field">
            <label>平台名称</label>
            <input value={form.platformName} onChange={(event) => updateField("platformName", event.target.value)} />
          </div>
          <div className="field">
            <label>发件人姓名</label>
            <input value={form.senderName} onChange={(event) => updateField("senderName", event.target.value)} />
          </div>
          <div className="field">
            <label>电信邮箱</label>
            <input value={form.senderEmail} onChange={(event) => {
              updateField("senderEmail", event.target.value);
              updateField("accountEmail", event.target.value);
            }} />
          </div>
          <div className="field">
            <label>发送时间</label>
            <input value={form.sentAt} onChange={(event) => updateField("sentAt", event.target.value)} />
          </div>
          <div className="field">
            <label>签名公司</label>
            <input value={form.senderCompany} onChange={(event) => updateField("senderCompany", event.target.value)} />
          </div>
          <div className="field">
            <label>联系电话</label>
            <input value={form.senderPhone} onChange={(event) => updateField("senderPhone", event.target.value)} />
          </div>
          <div className="field">
            <label>授权产品</label>
            <textarea value={form.products} onChange={(event) => updateField("products", event.target.value)} />
          </div>
          {message && <div className="message-line">{message}</div>}
          </section>
          <EmailScreenshotRecordPanel onApplyRecord={applyRecordToScreenshot} />
        </aside>
      </div>
    </section>
  );
}

function UnicomEmailScreenshotPage() {
  const captureRef = useRef(null);
  const [form, setForm] = useState(createDefaultUnicomEmailForm);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const subject = useMemo(() => buildSubject(form), [form]);
  const bodyLines = useMemo(() => buildBody(form), [form]);
  const copyText = [
    subject,
    "",
    ...bodyLines,
    "",
    form.senderName,
    form.senderCompany,
    `联系地址: ${form.senderAddress}`,
    `手    机: ${form.senderPhone}`,
    `联系邮箱: ${form.senderEmail}`
  ].join("\n");

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(createDefaultUnicomEmailForm());
    setMessage("已恢复默认截图内容");
  }

  function applyRecordToScreenshot(record) {
    setForm((current) => ({
      ...current,
      companyName: record.fields?.companyName || current.companyName,
      shopName: record.fields?.shopName || current.shopName
    }));
  }

  async function downloadScreenshot() {
    if (!captureRef.current || downloading) {
      return;
    }

    setDownloading(true);
    setMessage("");

    try {
      await downloadElementAsPng(
        captureRef.current,
        `${sanitizeFileName(form.shopName)}-联通邮件截图.png`
      );
      setMessage("截图已下载");
    } catch (error) {
      setMessage(error.message || "下载截图失败");
    } finally {
      setDownloading(false);
    }
  }

  async function copyMailContent() {
    await copyToClipboard(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="email-screenshot-page">
      <header className="topbar">
        <div>
          <div className="eyebrow">邮件截图菜单</div>
          <h1>联通截图</h1>
        </div>
        <div className="email-screenshot-actions">
          <button type="button" className="text-button" onClick={resetForm}>
            <RotateCcw size={16} />
            恢复默认
          </button>
          <button type="button" className="text-button" onClick={copyMailContent}>
            {copied ? <FileCheck2 size={16} /> : <Copy size={16} />}
            {copied ? "已复制" : "复制文案"}
          </button>
          <button type="button" className="primary-button email-screenshot-download" onClick={downloadScreenshot} disabled={downloading}>
            {downloading ? <Loader2 className="spin" size={18} /> : <Download size={18} />}
            下载截图
          </button>
        </div>
      </header>

      <div className="email-screenshot-workspace">
        <div className="email-screenshot-preview-shell">
          <article className="unicom-email-canvas" ref={captureRef}>
            <div className="unicom-mail-subjectbar">
              <div className="unicom-mail-title">
                {subject}
                <span className="unicom-mail-star">★</span>
              </div>
            </div>

            <div className="unicom-mail-content">
              <header className="unicom-mail-head">
                <div className="unicom-mail-from">
                  <strong>{form.senderEmail}</strong>
                  <span>发给 {form.recipients}</span>
                </div>
                <div className="unicom-mail-meta">
                  <span>{form.sentAt}</span>
                  <a>详细信息</a>
                </div>
                <div className="unicom-mail-tools" aria-hidden="true">
                  <span className="unicom-reply-mark">↩</span>
                  <span className="unicom-down-mark">▼</span>
                </div>
              </header>

              <div className="unicom-attachment-grid">
                {unicomEmailAttachments.map((item) => (
                  <div className="unicom-attachment-item" key={item.name}>
                    <span className="unicom-attachment-icon">
                      <span><i /></span>
                    </span>
                    <span>{item.name}</span>
                    <em>({item.size})</em>
                  </div>
                ))}
              </div>

              <section className="unicom-mail-body">
                <p>{bodyLines[0]}</p>
                <p>{bodyLines[1]}</p>
                <p>{bodyLines[2]}</p>
                <p className="unicom-mail-paragraph">{bodyLines[3]}</p>
                <p>{bodyLines[4]}</p>

                <div className="unicom-signature-line" />
                <div className="unicom-signature-text">
                  <p>{form.senderName}</p>
                  <p>{form.senderCompany}</p>
                  <p>联系地址: {form.senderAddress}</p>
                  <p>手&nbsp;&nbsp;&nbsp;&nbsp;机: {form.senderPhone}</p>
                  <p>联系邮箱: {form.senderEmail}</p>
                </div>

                <div className="unicom-signature-brand">
                  <div className="unicom-logo-window">
                    <img src={unicomLogo} alt="中国联通" />
                  </div>
                  <div className="unicom-brand-divider" />
                  <div className="unicom-anniversary">
                    <strong>30</strong>
                    <span>百年传承<br />三十向新</span>
                  </div>
                </div>
              </section>
            </div>
          </article>
        </div>

        <aside className="email-screenshot-side">
          <section className="field-group email-screenshot-config">
          <div className="group-heading">
            <h2>截图内容</h2>
          </div>
          <div className="field">
            <label>商家主体公司名称</label>
            <input value={form.companyName} onChange={(event) => updateField("companyName", event.target.value)} />
          </div>
          <div className="field">
            <label>店铺名称</label>
            <input value={form.shopName} onChange={(event) => updateField("shopName", event.target.value)} />
          </div>
          <div className="field">
            <label>平台名称</label>
            <input value={form.platformName} onChange={(event) => updateField("platformName", event.target.value)} />
          </div>
          <div className="field">
            <label>发送时间</label>
            <input value={form.sentAt} onChange={(event) => updateField("sentAt", event.target.value)} />
          </div>
          <div className="field">
            <label>发件邮箱</label>
            <input value={form.senderEmail} onChange={(event) => updateField("senderEmail", event.target.value)} />
          </div>
          <div className="field">
            <label>联系人</label>
            <input value={form.senderName} onChange={(event) => updateField("senderName", event.target.value)} />
          </div>
          <div className="field">
            <label>联系电话</label>
            <input value={form.senderPhone} onChange={(event) => updateField("senderPhone", event.target.value)} />
          </div>
          <div className="field">
            <label>联系地址</label>
            <textarea value={form.senderAddress} onChange={(event) => updateField("senderAddress", event.target.value)} />
          </div>
          <div className="field">
            <label>授权产品</label>
            <textarea value={form.products} onChange={(event) => updateField("products", event.target.value)} />
          </div>
          {message && <div className="message-line">{message}</div>}
          </section>
          <EmailScreenshotRecordPanel onApplyRecord={applyRecordToScreenshot} />
        </aside>
      </div>
    </section>
  );
}

export default function EmailScreenshotPage({ activeScreenshotId = "mobile-email-screenshot" }) {
  if (activeScreenshotId === "telecom-email-screenshot") {
    return <TelecomEmailScreenshotPage />;
  }

  if (activeScreenshotId === "unicom-email-screenshot") {
    return <UnicomEmailScreenshotPage />;
  }

  return <MobileEmailScreenshotPage />;
}
