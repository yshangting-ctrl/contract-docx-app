import { useEffect, useRef, useState } from "react";
import { Download, Loader2, Pencil, Save, X } from "lucide-react";
import yidongLogo from "./assets/yidong.png";
import unicomLogo from "./assets/ltong.png";
import telecomLogo from "./assets/dainxing.png";
import broadnetLogo from "./assets/guandian.png";
import telecomMark from "./assets/xiaotuo.png";
import "./qrAuthorization.css";

const API_BASE = "/api";
const QR_CODE_API_BASE = `${API_BASE}/qr-code`;
const TELECOM_DEFAULT_URL =
  "https://agchannel.crm.189.cn/channel-manager-web/queryStoreInfo?id=5841138777119903";
const DEFAULT_FONT_SIZES = {
  telecomCompany: 52,
  broadnetCompany: 100
};
const DEFAULT_UNICOM_AUTH_DETAILS = {
  channelName: "武汉轩乐乐网络科技有限公司1",
  channelCode: "64V8Riu",
  authCode: "No.4101156588867",
  url: "http://www.10010.com"
};
const MOBILE_EXTRA_LABELS = {
  authorizationUnit: "授权单位",
  company: "公司",
  url: ["网址", "网"]
};
const carrierIdByAuthId = {
  "qr-mobile-auth": "mobile",
  "qr-unicom-auth": "unicom",
  "qr-telecom-auth": "telecom",
  "qr-broadcast-auth": "broadnet"
};
const fallbackCarriers = [
  {
    id: "telecom",
    name: "中国电信",
    color: "#003D8F",
    enName: "CHINA TELECOM",
    type: "授权代理",
    company: "武汉轩乐乐网络科技有限公司",
    no: "No.37010036446256",
    extra: [`网址:${TELECOM_DEFAULT_URL}`]
  },
  {
    id: "unicom",
    name: "中国联通",
    color: "#E60012",
    enName: "China unicom",
    type: "授权网络营销代理商",
    company: "武陟县昌利信息技术有限公司",
    no: "NO.e4366231",
    extra: []
  },
  {
    id: "mobile",
    name: "中国移动",
    color: "#0085D0",
    enName: "China Mobile",
    type: "授权经销商",
    company: "石家庄琅泽科技有限公司",
    no: "全网渠道编码:2582678364034993487",
    extra: [
      "网址:https://yidongchenshuxia.tmall.com",
      "公司:石家庄琅泽科技有限公司",
      "授权单位:中国移动通信有限公司销售分公司"
    ]
  },
  {
    id: "broadnet",
    name: "中国广电",
    color: "#0078D4",
    enName: "China Broadnet",
    type: "授权代理商",
    company: "昆明意灼贤电子商务有限公司",
    no: "NO.20100200631",
    extra: ["授权销售范围: 广电全国统一产品"]
  }
];

function clampNumber(value, min, max) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.min(max, Math.max(min, number));
}

function getSavedFontSizes() {
  return {
    telecomCompany: clampNumber(DEFAULT_FONT_SIZES.telecomCompany, 18, 72),
    broadnetCompany: clampNumber(
      DEFAULT_FONT_SIZES.broadnetCompany,
      50,
      100
    )
  };
}

function getExtraValue(extra = [], labels) {
  const labelList = Array.isArray(labels) ? labels : [labels];

  for (const label of labelList) {
    const line = extra.find((item) =>
      String(item).startsWith(`${label}:`) || String(item).startsWith(`${label}：`)
    );

    if (line) {
      return String(line).replace(new RegExp(`^${label}[:：]\\s*`), "");
    }
  }

  return "";
}

function getMobileDetails(carrier) {
  if (!carrier) {
    return {
      authorizationUnit: "",
      channelCode: "",
      company: "",
      url: ""
    };
  }

  return {
    authorizationUnit: getExtraValue(carrier.extra, MOBILE_EXTRA_LABELS.authorizationUnit),
    channelCode: carrier.no?.replace(/^全网渠道编码[:：]\s*/, "") || "",
    company: getExtraValue(carrier.extra, MOBILE_EXTRA_LABELS.company) || carrier.company || "",
    url: getExtraValue(carrier.extra, MOBILE_EXTRA_LABELS.url)
  };
}

function buildMobilePayload(details) {
  return {
    company: details.company,
    no: `全网渠道编码:${details.channelCode}`,
    extra: [
      `网址:${details.url}`,
      `公司:${details.company}`,
      `授权单位:${details.authorizationUnit}`
    ]
  };
}

function getTelecomUrl(carrier) {
  return getExtraValue(carrier?.extra, "网址") || getExtraValue(carrier?.extra, "地址");
}

function getTelecomDetails(carrier) {
  return {
    company: carrier?.company || "",
    no: carrier?.no || "",
    url: getTelecomUrl(carrier) || TELECOM_DEFAULT_URL
  };
}

function buildTelecomPayload(details) {
  return {
    company: details.company,
    no: details.no,
    extra: [`网址:${details.url}`]
  };
}

function normalizeBroadnetNo(no = "") {
  const value = String(no || "").trim();

  if (!value) {
    return "";
  }

  return `NO.${value.replace(/^NO\.?\s*/i, "")}`;
}

function getBroadnetSalesScope(carrier) {
  return getExtraValue(carrier?.extra, "授权销售范围");
}

function getBroadnetDetails(carrier) {
  return {
    company: carrier?.company || "",
    no: normalizeBroadnetNo(carrier?.no || ""),
    salesScope: getBroadnetSalesScope(carrier)
  };
}

function buildBroadnetPayload(details) {
  return {
    company: details.company,
    no: normalizeBroadnetNo(details.no),
    extra: [`授权销售范围: ${details.salesScope}`]
  };
}

function buildQrContent(rows) {
  if (!rows.some(([, value]) => String(value || "").trim())) {
    return "";
  }

  return rows.map(([label, value]) => `${label}：${String(value || "").trim()}`).join("\n");
}

function buildMobileQrContent(details) {
  return buildQrContent([
    ["全网渠道编码", details.channelCode],
    ["网址", details.url],
    ["公司", details.company],
    ["授权单位", details.authorizationUnit]
  ]);
}

function buildTelecomQrContent(details) {
  return buildQrContent([
    ["名称", details.company],
    ["编号", details.no],
    ["地址", details.url]
  ]);
}

function buildUnicomQrContent(details) {
  return buildQrContent([
    ["渠道名称", details.channelName],
    ["渠道编码", details.channelCode],
    ["授权编码", details.authCode],
    ["地址/网址", details.url]
  ]);
}

function buildBroadnetQrContent(details) {
  const company = String(details.company || "").trim();
  const no = normalizeBroadnetNo(details.no);
  const salesScope = String(details.salesScope || "").trim();

  if (![company, no, salesScope].some(Boolean)) {
    return "";
  }

  return [
    "授权代理商：",
    company,
    no,
    salesScope ? `授权销售范围： ${salesScope}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

function buildQrImageUrl(content) {
  if (!content) {
    return "";
  }

  const params = new URLSearchParams({
    data: content,
    size: "300x300"
  });

  return `${QR_CODE_API_BASE}?${params.toString()}`;
}

function getRandomDigits(length) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

function randomizeLastDigits(value = "", length = 3) {
  const text = String(value || "");

  if (!text) {
    return getRandomDigits(length);
  }

  return text.replace(/\d{0,3}$/, (match) => {
    const digitCount = Math.min(length, match.length || length);
    return getRandomDigits(digitCount);
  });
}

function getRandomLowercaseLetters(length) {
  const source = "abcdefghijklmnopqrstuvwxyz";
  return Array.from({ length }, () => source[Math.floor(Math.random() * source.length)]).join("");
}

function randomizeLastLetters(value = "", length = 2) {
  const text = String(value || "");

  if (!text) {
    return getRandomLowercaseLetters(length);
  }

  return text.replace(/[a-zA-Z]{0,2}$/, (match) => {
    const letterCount = Math.min(length, match.length || length);
    return getRandomLowercaseLetters(letterCount);
  });
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

async function saveQrConfig(patch) {
  const response = await fetch(`${API_BASE}/qr-config`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch)
  });
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "保存二维码配置失败");
  }

  return data.data;
}

function saveQrImage(carrierId, image, setQrImages) {
  setQrImages((previous) => {
    const next = { ...previous, [carrierId]: image };
    saveQrConfig({ qrImages: { [carrierId]: image } }).catch((error) => {
      console.error(error);
    });
    return next;
  });
}

export default function QrAuthorization({ activeAuthId }) {
  const activeCarrierId = carrierIdByAuthId[activeAuthId] || "mobile";
  const authCardRef = useRef(null);
  const lastMobileCompanyUrlRequestRef = useRef("");
  const [carriers, setCarriers] = useState(fallbackCarriers);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editCompany, setEditCompany] = useState("");
  const [editNo, setEditNo] = useState("");
  const [editTelecomUrl, setEditTelecomUrl] = useState("");
  const [editMobileDetails, setEditMobileDetails] = useState(() => getMobileDetails(null));
  const [editBroadnetSalesScope, setEditBroadnetSalesScope] = useState("");
  const [qrImages, setQrImages] = useState({});
  const [unicomDetails, setUnicomDetails] = useState(DEFAULT_UNICOM_AUTH_DETAILS);
  const [editUnicomMode, setEditUnicomMode] = useState(false);
  const [editUnicomDetails, setEditUnicomDetails] = useState(DEFAULT_UNICOM_AUTH_DETAILS);
  const [fontSizes, setFontSizes] = useState(getSavedFontSizes);

  const current = carriers.find((carrier) => carrier.id === activeCarrierId) || carriers[0];
  const telecomDetails = getTelecomDetails(current);
  const mobileDetails = getMobileDetails(current);
  const broadnetDetails = getBroadnetDetails(current);
  const generatedTelecomQrImage =
    current?.id === "telecom" ? buildQrImageUrl(buildTelecomQrContent(telecomDetails)) : "";
  const generatedMobileQrImage =
    current?.id === "mobile" ? buildQrImageUrl(buildMobileQrContent(mobileDetails)) : "";
  const generatedUnicomQrImage =
    current?.id === "unicom" ? buildQrImageUrl(buildUnicomQrContent(unicomDetails)) : "";
  const generatedBroadnetQrImage =
    current?.id === "broadnet" ? buildQrImageUrl(buildBroadnetQrContent(broadnetDetails)) : "";
  const currentQrImage = current
    ? generatedTelecomQrImage ||
      generatedMobileQrImage ||
      generatedUnicomQrImage ||
      generatedBroadnetQrImage ||
      qrImages[current.id]
    : "";
  const broadnetSalesScope = broadnetDetails.salesScope
    ? `授权销售范围： ${broadnetDetails.salesScope}`
    : "";

  useEffect(() => {
    let ignore = false;

    async function loadCarriers() {
      setLoading(true);

      try {
        const [carriersResponse, configResponse] = await Promise.all([
          fetch(`${API_BASE}/carriers`),
          fetch(`${API_BASE}/qr-config`)
        ]);
        const data = await carriersResponse.json();
        const configData = await configResponse.json();

        if (!carriersResponse.ok || !data.success) {
          throw new Error(data.message || "加载失败");
        }

        if (!ignore) {
          setCarriers(data.data || fallbackCarriers);
          if (configResponse.ok && configData.success) {
            setQrImages(configData.data.qrImages || {});
            setUnicomDetails({
              ...DEFAULT_UNICOM_AUTH_DETAILS,
              ...(configData.data.unicomDetails || {})
            });
            setEditUnicomDetails({
              ...DEFAULT_UNICOM_AUTH_DETAILS,
              ...(configData.data.unicomDetails || {})
            });
            setFontSizes({
              telecomCompany: clampNumber(
                configData.data.fontSizes?.telecomCompany ?? DEFAULT_FONT_SIZES.telecomCompany,
                18,
                72
              ),
              broadnetCompany: clampNumber(
                configData.data.fontSizes?.broadnetCompany ?? DEFAULT_FONT_SIZES.broadnetCompany,
                50,
                100
              )
            });
          }
        }
      } catch (error) {
        if (!ignore) {
          setMessage(`加载失败，已使用默认数据：${error.message}`);
          setCarriers(fallbackCarriers);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadCarriers();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    setEditMode(false);
    setEditUnicomMode(false);
  }, [activeCarrierId]);

  useEffect(() => {
    if (!current) {
      return;
    }

    setEditCompany(current.company);
    setEditNo(current.id === "broadnet" ? normalizeBroadnetNo(current.no) : current.no);
    setEditTelecomUrl(getTelecomUrl(current) || TELECOM_DEFAULT_URL);
    setEditMobileDetails(getMobileDetails(current));
    setEditBroadnetSalesScope(getBroadnetSalesScope(current));
  }, [current]);

  function updateFontSize(key, value, min, max) {
    const nextValue = clampNumber(value, min, max);
    setFontSizes((previous) => {
      const next = { ...previous, [key]: nextValue };
      saveQrConfig({ fontSizes: { [key]: nextValue } }).catch((error) => {
        console.error(error);
      });
      return next;
    });
  }

  function handleQrUpload(carrierId, event) {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      saveQrImage(carrierId, String(reader.result), setQrImages);
      setMessage("二维码已上传");
      setTimeout(() => setMessage(""), 3000);
    };
    reader.readAsDataURL(file);
    event.currentTarget.value = "";
  }

  async function handleSave() {
    if (!current) {
      return;
    }

    const payload =
      current.id === "telecom"
        ? buildTelecomPayload({
            company: editCompany,
            no: editNo,
            url: editTelecomUrl
          })
        : current.id === "mobile"
          ? buildMobilePayload(editMobileDetails)
          : current.id === "broadnet"
            ? buildBroadnetPayload({
                company: editCompany,
                no: editNo,
                salesScope: editBroadnetSalesScope
              })
            : { company: editCompany, no: editNo };

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE}/carriers/${current.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "保存失败");
      }

      const nextCarrier = data.data;
      setCarriers((previous) =>
        previous.map((carrier) => (carrier.id === current.id ? nextCarrier : carrier))
      );
      setEditMode(false);
      setMessage("保存成功");
    } catch (error) {
      setMessage(`保存失败：${error.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  async function refreshMobileCompanyUrl() {
    const company = editMobileDetails.company.trim();

    if (!company) {
      return;
    }

    setEditMobileDetails((previous) => ({
      ...previous,
      channelCode: randomizeLastDigits(previous.channelCode, 3)
    }));

    if (lastMobileCompanyUrlRequestRef.current === company) {
      return;
    }

    lastMobileCompanyUrlRequestRef.current = company;

    try {
      const response = await fetch(`${API_BASE}/mobile/company-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company })
      });
      const data = await response.json();

      if (data.skipped) {
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "获取公司字号失败");
      }

      setEditMobileDetails((previous) => ({
        ...previous,
        url: data.data.url
      }));
    } catch (error) {
      lastMobileCompanyUrlRequestRef.current = "";
      setMessage(`网址生成失败：${error.message}`);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  function handleUnicomSave() {
    const next = {
      ...unicomDetails,
      channelName: editUnicomDetails.channelName,
      channelCode: editUnicomDetails.channelCode,
      authCode: editUnicomDetails.authCode,
      url: editUnicomDetails.url
    };

    setUnicomDetails(next);
    saveQrConfig({ unicomDetails: next }).catch((error) => {
      console.error(error);
    });
    saveQrImage("unicom", buildQrImageUrl(buildUnicomQrContent(next)), setQrImages);
    setEditUnicomMode(false);
    setMessage("保存成功");
    setTimeout(() => setMessage(""), 3000);
  }

  function handleUnicomChannelNameChange(channelName) {
    setEditUnicomDetails((previous) => ({
      ...previous,
      channelName,
      authCode: randomizeLastDigits(previous.authCode, 3),
      channelCode: randomizeLastLetters(previous.channelCode, 2)
    }));
  }

  function handleTelecomCompanyChange(company) {
    setEditCompany(company);
    setEditNo((previous) => randomizeLastDigits(previous, 3));
  }

  function handleBroadnetCompanyChange(company) {
    setEditCompany(company);
    setEditNo((previous) => randomizeLastDigits(previous, 3));
  }

  function handleDownload() {
    if (!current || !authCardRef.current) {
      return;
    }

    downloadElementAsPng(authCardRef.current, `${current.name}-授权信息.png`)
      .then(() => setMessage("图片已下载"))
      .catch((error) => {
        console.error(error);
        setMessage("下载失败，请重试");
      })
      .finally(() => setTimeout(() => setMessage(""), 3000));
  }

  function resetEditing() {
    setEditMode(false);
    setEditCompany(current.company);
    setEditNo(current.id === "broadnet" ? normalizeBroadnetNo(current.no) : current.no);
    setEditTelecomUrl(getTelecomUrl(current) || TELECOM_DEFAULT_URL);
    setEditMobileDetails(getMobileDetails(current));
    setEditBroadnetSalesScope(getBroadnetSalesScope(current));
  }

  if (loading) {
    return (
      <section className="qr-auth-page">
        <div className="qr-loading">
          <Loader2 className="spin" size={24} />
          正在加载二维码授权信息
        </div>
      </section>
    );
  }

  if (!current) {
    return (
      <section className="qr-auth-page">
        <div className="qr-empty">暂无二维码授权数据</div>
      </section>
    );
  }

  return (
    <section className="qr-auth-page">
      {message && <div className="qr-toast">{message}</div>}
      <header className="qr-auth-header">
        <div>
          <div className="eyebrow">QR二维码授权 / {current.name}</div>
          <h1>{current.name}二维码授权</h1>
        </div>
        <button type="button" className="qr-secondary-button" onClick={handleDownload}>
          <Download size={17} />
          下载图片
        </button>
      </header>

      {current.id === "telecom" && (
        <>
          <section className="qr-telecom-auth-card" ref={authCardRef}>
            <div className="qr-telecom-auth-top">
              <img src={telecomLogo} alt="中国电信" className="qr-telecom-auth-logo" />
            </div>
            <div className="qr-telecom-auth-body">
              <div className="qr-telecom-auth-info">
                <p className="qr-telecom-auth-type">{current.type}</p>
                <p
                  className="qr-telecom-auth-company"
                  style={{ "--qr-telecom-company-font-size": `${fontSizes.telecomCompany}px` }}
                >
                  {current.company}
                </p>
                <p className="qr-telecom-auth-no">{current.no}</p>
                {telecomDetails.url && (
                  <p className="qr-telecom-auth-url">{telecomDetails.url}</p>
                )}
              </div>
              <div className="qr-telecom-auth-qr">
                <label className="qr-telecom-qr-upload">
                  {currentQrImage ? (
                    <>
                      <img src={currentQrImage} alt="授权二维码" className="qr-image" />
                      <img src={telecomMark} alt="" className="qr-telecom-qr-mark" />
                    </>
                  ) : (
                    <span className="qr-upload-text">点击上传<br />二维码</span>
                  )}
                  <input type="file" accept="image/*" onChange={(event) => handleQrUpload(current.id, event)} />
                </label>
              </div>
            </div>
          </section>

          <div className="qr-edit-panel">
            {editMode ? (
              <>
                <div className="qr-edit-grid qr-edit-grid-four">
                  <label>名称<input value={editCompany} onChange={(event) => handleTelecomCompanyChange(event.target.value)} /></label>
                  <label>编号<input value={editNo} onChange={(event) => setEditNo(event.target.value)} /></label>
                  <label>地址<input value={editTelecomUrl} onChange={(event) => setEditTelecomUrl(event.target.value)} /></label>
                  <label>名称字号<input type="number" min="18" max="72" value={fontSizes.telecomCompany} onChange={(event) => updateFontSize("telecomCompany", event.target.value, 18, 72)} /></label>
                </div>
                <div className="qr-panel-actions">
                  <button type="button" className="qr-primary-button" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="spin" size={17} /> : <Save size={17} />}
                    保存
                  </button>
                  <button type="button" className="qr-secondary-button" onClick={resetEditing}><X size={17} />取消</button>
                </div>
              </>
            ) : (
              <div className="qr-panel-actions">
                <button type="button" className="qr-primary-button" onClick={() => setEditMode(true)}><Pencil size={17} />编辑信息</button>
                <button type="button" className="qr-secondary-button" onClick={handleDownload}><Download size={17} />下载图片</button>
              </div>
            )}
          </div>
        </>
      )}

      {current.id === "mobile" && (
        <>
          <section className="qr-mobile-auth-card" ref={authCardRef}>
            <div className="qr-mobile-auth-top">
              <img src={yidongLogo} alt="中国移动" className="qr-mobile-auth-logo" />
            </div>
            <div className="qr-mobile-auth-band">
              <div className="qr-mobile-auth-title">{current.type}</div>
              <div className="qr-mobile-auth-info">
                <p>全网渠道编码：{mobileDetails.channelCode}</p>
                {mobileDetails.url && <p>网址：{mobileDetails.url}</p>}
                <p>公司：{mobileDetails.company}</p>
                {mobileDetails.authorizationUnit && <p>授权单位：{mobileDetails.authorizationUnit}</p>}
              </div>
              <div className="qr-mobile-auth-qr">
                <label className="qr-upload">
                  {currentQrImage ? (
                    <img src={currentQrImage} alt="授权二维码" className="qr-image" />
                  ) : (
                    <span className="qr-upload-text">点击上传<br />二维码</span>
                  )}
                  <input type="file" accept="image/*" onChange={(event) => handleQrUpload(current.id, event)} />
                </label>
                <div className="qr-caption">授权二维码</div>
              </div>
            </div>
          </section>

          <div className="qr-edit-panel">
            {editMode ? (
              <>
                <div className="qr-edit-grid">
                  <label>全网渠道编码<input value={editMobileDetails.channelCode} onChange={(event) => setEditMobileDetails((previous) => ({ ...previous, channelCode: event.target.value }))} /></label>
                  <label>网址<input value={editMobileDetails.url} onChange={(event) => setEditMobileDetails((previous) => ({ ...previous, url: event.target.value }))} /></label>
                  <label>公司<input value={editMobileDetails.company} onChange={(event) => setEditMobileDetails((previous) => ({ ...previous, company: event.target.value }))} onBlur={refreshMobileCompanyUrl} /></label>
                  <label>授权单位<input value={editMobileDetails.authorizationUnit} onChange={(event) => setEditMobileDetails((previous) => ({ ...previous, authorizationUnit: event.target.value }))} /></label>
                </div>
                <div className="qr-panel-actions">
                  <button type="button" className="qr-primary-button" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="spin" size={17} /> : <Save size={17} />}
                    保存
                  </button>
                  <button type="button" className="qr-secondary-button" onClick={resetEditing}><X size={17} />取消</button>
                </div>
              </>
            ) : (
              <div className="qr-panel-actions">
                <button type="button" className="qr-primary-button" onClick={() => setEditMode(true)}><Pencil size={17} />编辑信息</button>
                <button type="button" className="qr-secondary-button" onClick={handleDownload}><Download size={17} />下载图片</button>
              </div>
            )}
          </div>
        </>
      )}

      {current.id === "unicom" && (
        <>
          <section className="qr-unicom-auth-card" ref={authCardRef}>
            <div className="qr-unicom-auth-top">
              <img src={unicomLogo} alt="中国联通" className="qr-unicom-auth-logo" />
            </div>
            <div className="qr-unicom-auth-band">
              <div className="qr-unicom-auth-title">
                <span>网络渠道</span>
                <span>授权经销商</span>
              </div>
              <div className="qr-unicom-auth-info">
                <p>渠道名称： {unicomDetails.channelName}</p>
                <p>渠道编码： {unicomDetails.channelCode}</p>
                <p>授权编码： {unicomDetails.authCode}</p>
                <p>地址/网址： {unicomDetails.url}</p>
              </div>
              <div className="qr-unicom-auth-qr">
                <label className="qr-unicom-qr-upload">
                  {currentQrImage ? (
                    <img src={currentQrImage} alt="授权二维码" className="qr-image" />
                  ) : (
                    <span className="qr-upload-text">点击上传<br />二维码</span>
                  )}
                  <input type="file" accept="image/*" onChange={(event) => handleQrUpload(current.id, event)} />
                </label>
              </div>
            </div>
          </section>

          <div className="qr-edit-panel">
            {editUnicomMode ? (
              <>
                <div className="qr-edit-grid qr-edit-grid-four">
                  <label>渠道名称<input value={editUnicomDetails.channelName} onChange={(event) => handleUnicomChannelNameChange(event.target.value)} /></label>
                  <label>渠道编码<input value={editUnicomDetails.channelCode} onChange={(event) => setEditUnicomDetails((previous) => ({ ...previous, channelCode: event.target.value }))} /></label>
                  <label>授权编码<input value={editUnicomDetails.authCode} onChange={(event) => setEditUnicomDetails((previous) => ({ ...previous, authCode: event.target.value }))} /></label>
                  <label>地址/网址<input value={editUnicomDetails.url} onChange={(event) => setEditUnicomDetails((previous) => ({ ...previous, url: event.target.value }))} /></label>
                </div>
                <div className="qr-panel-actions">
                  <button type="button" className="qr-primary-button" onClick={handleUnicomSave}><Save size={17} />保存</button>
                  <button type="button" className="qr-secondary-button" onClick={() => { setEditUnicomMode(false); setEditUnicomDetails(unicomDetails); }}><X size={17} />取消</button>
                </div>
              </>
            ) : (
              <div className="qr-panel-actions">
                <button type="button" className="qr-primary-button" onClick={() => { setEditUnicomDetails(unicomDetails); setEditUnicomMode(true); }}><Pencil size={17} />编辑信息</button>
                <button type="button" className="qr-secondary-button" onClick={handleDownload}><Download size={17} />下载图片</button>
              </div>
            )}
          </div>
        </>
      )}

      {current.id === "broadnet" && (
        <>
          <section className="qr-broadnet-auth-card" ref={authCardRef}>
            <div className="qr-broadnet-auth-layout">
              <div className="qr-broadnet-auth-qr">
                <label className="qr-broadnet-qr-upload">
                  {currentQrImage ? (
                    <img src={currentQrImage} alt="授权二维码" className="qr-image" />
                  ) : (
                    <span className="qr-upload-text">点击上传<br />二维码</span>
                  )}
                  <input type="file" accept="image/*" onChange={(event) => handleQrUpload(current.id, event)} />
                </label>
              </div>
              <div className="qr-broadnet-auth-content">
                <div className="qr-broadnet-logo-crop">
                  <img src={broadnetLogo} alt="中国广电" className="qr-broadnet-auth-logo" />
                </div>
                <div className="qr-broadnet-auth-info">
                  <p className="qr-broadnet-auth-type">授权代理商：</p>
                  <p
                    className="qr-broadnet-auth-company"
                    style={{ "--qr-broadnet-company-font-size": `${(fontSizes.broadnetCompany / 100) * 3.02}cqw` }}
                  >
                    {current.company}
                  </p>
                  <p className="qr-broadnet-auth-no">{normalizeBroadnetNo(current.no)}</p>
                  {broadnetSalesScope && <p className="qr-broadnet-auth-extra">{broadnetSalesScope}</p>}
                </div>
              </div>
            </div>
          </section>

          <div className="qr-edit-panel">
            {editMode ? (
              <>
                <div className="qr-edit-grid qr-edit-grid-four">
                  <label>授权代理商<input value={editCompany} onChange={(event) => handleBroadnetCompanyChange(event.target.value)} /></label>
                  <label>NO 编号<input value={editNo} onChange={(event) => setEditNo(event.target.value)} /></label>
                  <label>授权销售范围<input value={editBroadnetSalesScope} onChange={(event) => setEditBroadnetSalesScope(event.target.value)} /></label>
                  <label>代理商字号<input type="number" min="50" max="100" step="5" value={fontSizes.broadnetCompany} onChange={(event) => updateFontSize("broadnetCompany", event.target.value, 50, 100)} /></label>
                </div>
                <div className="qr-panel-actions">
                  <button type="button" className="qr-primary-button" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="spin" size={17} /> : <Save size={17} />}
                    保存
                  </button>
                  <button type="button" className="qr-secondary-button" onClick={resetEditing}><X size={17} />取消</button>
                </div>
              </>
            ) : (
              <div className="qr-panel-actions">
                <button type="button" className="qr-primary-button" onClick={() => setEditMode(true)}><Pencil size={17} />编辑信息</button>
                <button type="button" className="qr-secondary-button" onClick={handleDownload}><Download size={17} />下载图片</button>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
