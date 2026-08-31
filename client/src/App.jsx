import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ClipboardPaste,
  Download,
  FileCheck2,
  FileClock,
  FileText,
  FolderOpen,
  Search,
  KeyRound,
  Loader2,
  LogOut,
  MapPin,
  Plus,
  RefreshCw,
  RotateCcw,
  Copy,
  Send,
  ShieldCheck,
  Database,
  Trash2
} from "lucide-react";
import QrAuthorization from "./QrAuthorization.jsx";
import EmailScreenshotPage from "./EmailScreenshot.jsx";
import authorizationNoticeText from "./content/authorizationNotice.txt?raw";

const emptyCustomReplacement = { find: "", replacement: "" };
const lockedContractCodeTemplates = new Set(["mobile", "unicom"]);
const todayFillFieldsByTemplate = {
  mobile: new Set(["titleDate", "contractTerm", "signDate"]),
  unicom: new Set(["contractTerm", "signDate"]),
  telecom: new Set(["contractTerm", "signYear", "signMonth", "signDay"]),
  broadcast: new Set(["contractTerm", "signDate"]),
  "pdd-auth": new Set(["validityTerm", "signDate"]),
  "tmall-auth": new Set(["validityTerm", "signDate"]),
  "alipay-auth": new Set(["validityTerm", "signDate"]),
  "douyin-telecom-auth": new Set(["validityTerm", "signDate"]),
  "douyin-mobile-auth": new Set(["validityTerm", "signDate"]),
  "douyin-unicom-auth": new Set(["validityTerm", "signDate"]),
  "jd-telecom-auth": new Set(["validityTerm", "signDate"]),
  "jd-mobile-auth": new Set(["validityTerm", "signDate"]),
  "jd-unicom-auth": new Set(["validityTerm", "signDate"]),
  "tmall-traffic-oa-email": new Set(["signDate"]),
  "tmall-brand-authorization": new Set([
    "validityTerm",
    "authorizationSignDate",
    "authorizedSignDate"
  ]),
  "tmall-business-development-proof": new Set(["authorizationSignDate", "authorizedSignDate"]),
  "tmall-employee-work-proof": new Set(["signDate"])
};
const telecomSigningDateFields = new Set(["signYear", "signMonth", "signDay"]);
const postalCodeRules = [
  { code: "264003", patterns: ["烟台市", "莱山区", "陈村"] },
  { code: "264003", patterns: ["山东省", "烟台市", "莱山区"] },
  { code: "264003", patterns: ["烟台市", "莱山区"] },
  { code: "274000", patterns: ["菏泽市", "鲁西新区"] },
  { code: "274000", patterns: ["菏泽市", "丹阳街道"] },
  { code: "215000", patterns: ["苏州市", "姑苏区"] },
  { code: "450018", patterns: ["郑州市", "郑东新区"] }
];
const bulkFillFieldMap = {
  partyBName: "company",
  partyBLegalRep: "contact",
  partyBContact: "contact",
  noticeBContact: "contact",
  partyBPhone: "phone",
  noticeBPhone: "phone",
  partyBEmail: "email",
  noticeBEmail: "email",
  partyBAddress: "address",
  noticeBAddress: "address",
  partyBTaxNo: "taxNo",
  partyBBank: "bank",
  partyBAccount: "bankAccount",
  partyBPostalCode: "postalCode",
  noticeBPostalCode: "postalCode"
};

const autoFillAliasesByField = {
  partyBName: ["商家主体公司名称", "被授权公司名称", "公司名称", "乙方名称", "公司"],
  partyBAddress: ["乙方地址", "通讯地址", "注册地址", "地址"],
  partyBLegalRep: ["法定代表人", "法人", "乙方负责人", "负责人", "联系人"],
  partyBContact: ["乙方联系人", "联系人"],
  partyBPhone: ["乙方电话", "联系电话", "手机号", "手机号码", "电话"],
  partyBEmail: ["乙方邮箱", "电子邮件", "邮箱"],
  partyBPostalCode: ["乙方邮编", "邮政编码", "邮编"],
  partyBBank: ["乙方开户行", "开户银行", "开户行"],
  partyBAccount: ["乙方账号", "银行账号", "账号"],
  partyBTaxNo: ["乙方纳税人识别号", "统一社会信用代码", "纳税人识别号", "税号"],
  contractCode: ["合同编号", "协议编号"],
  titleDate: ["标题年月", "合同标题年月"],
  shopName: ["天猫商家店铺名称", "天猫店铺名称", "拼多多店铺名称", "店铺名称", "商家店铺名称", "店铺"],
  authorizationCompany: ["运营商公司名称", "授权公司名称", "授权方", "运营商"],
  authorizedProducts: ["授权产品", "产品范围", "业务范围", "经营范围"],
  validityTerm: ["授权有效期", "声明函有效期", "授权期间", "授权期限", "协议有效期", "合同有效期", "协议期限", "代理期限"],
  signDate: ["盖章日期", "证明日期", "签署日期", "授权日期", "盖章时间", "签字日期", "日期"],
  sealCompanyName: ["盖章公司名称", "加盖公章公司名称"],
  authorizationSignDate: ["授权公司日期", "授权方日期"],
  authorizedSignDate: ["被授权公司日期", "被授权方日期"],
  trademarkNo: ["商标注册证号/申请号", "商标注册证号", "商标号", "申请号"],
  brandName: ["授权品牌", "品牌名称", "品牌"],
  operatingMonths: ["连续经营月数", "经营月数", "经营月份"],
  monthlyTurnover: ["单月成交额", "月成交额", "成交额"],
  employmentYear: ["证明年份", "工作年份", "年份"],
  totalEmployees: ["固定员工总人数", "员工总人数", "员工人数", "总人数"],
  customerServiceEmployees: ["客服人数", "客服人员"],
  operationsEmployees: ["运营团队人数", "运营人数", "运营团队"] ,
  telecomContractName: ["电信运营商合同文件名称", "电信合同文件名称"],
  telecomOperatorName: ["电信运营商名称", "电信运营商"],
  telecomContactName: ["电信运营商联系人", "电信联系人"],
  telecomContactPhone: ["电信联系人手机号码", "电信联系人电话", "电信手机号码"],
  telecomContactEmail: ["电信联系人官方OA邮箱", "电信联系人邮箱", "电信OA邮箱"],
  unicomContractName: ["联通运营商合同文件名称", "联通合同文件名称"],
  unicomOperatorName: ["联通运营商名称", "联通运营商"],
  unicomContactName: ["联通运营商联系人", "联通联系人"],
  unicomContactPhone: ["联通联系人手机号码", "联通联系人电话", "联通手机号码"],
  unicomContactEmail: ["联通联系人官方OA邮箱", "联通联系人邮箱", "联通OA邮箱"],
  mobileContractName: ["移动运营商合同文件名称", "移动合同文件名称"],
  mobileOperatorName: ["移动运营商名称", "移动运营商"],
  mobileContactName: ["移动运营商联系人", "移动联系人"],
  mobileContactPhone: ["移动联系人手机号码", "移动联系人电话", "移动手机号码"],
  mobileContactEmail: ["移动联系人官方OA邮箱", "移动联系人邮箱", "移动OA邮箱"]
};

const autoFillNumericFields = new Set([
  "operatingMonths",
  "monthlyTurnover",
  "employmentYear",
  "totalEmployees",
  "customerServiceEmployees",
  "operationsEmployees"
]);

const contractNavItems = [
  { id: "mobile", label: "号卡移动" },
  { id: "unicom", label: "号卡联通" },
  { id: "telecom", label: "号卡电信" },
  { id: "broadcast", label: "号卡广电" }
];

const phoneContractNavItems = [
  { id: "mobile", label: "话费移动" },
  { id: "unicom", label: "话费联通" },
  { id: "telecom", label: "话费电信" }
];

const trafficContractNavItems = [
  { id: "mobile", label: "流量移动" },
  { id: "unicom", label: "流量联通" },
  { id: "telecom", label: "流量电信" }
];

const tmallTrafficNavItems = [
  { id: "tmall-traffic-oa-email", label: "流量充值OA邮箱" },
  { id: "tmall-brand-authorization", label: "品牌授权书" },
  { id: "tmall-business-development-proof", label: "业务发展证明函" },
  { id: "tmall-employee-work-proof", label: "员工工作证明" }
];

const qrAuthorizationNavItems = [
  { id: "qr-mobile-auth", label: "移动二维码" },
  { id: "qr-unicom-auth", label: "联通二维码" },
  { id: "qr-telecom-auth", label: "电信二维码" },
  { id: "qr-broadcast-auth", label: "广电二维码" }
];

const authorizationNavItems = [
  { id: "pdd-auth", label: "拼多多授权书" },
  { id: "tmall-auth", label: "天猫授权书" },
  { id: "alipay-auth", label: "支付宝授权书" },
  { id: "douyin-telecom-auth", label: "抖音电信授权书" },
  { id: "douyin-mobile-auth", label: "抖音移动授权书" },
  { id: "douyin-unicom-auth", label: "抖音联通授权书" },
  { id: "jd-telecom-auth", label: "京东电信授权书" },
  { id: "jd-mobile-auth", label: "京东移动授权书" },
  { id: "jd-unicom-auth", label: "京东联通授权书" },
  { id: "kuaishou-auth", label: "快手授权书" }
];
const availableAuthorizationTemplateIds = new Set([
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
const contractGroupIds = new Set(["standard", "phone", "traffic"]);
const contractTemplateIds = new Set(contractNavItems.map((item) => item.id));
const tmallTrafficTemplateIds = new Set(tmallTrafficNavItems.map((item) => item.id));
const allAuthorizationTemplateIds = new Set([
  ...authorizationNavItems.map((item) => item.id),
  ...qrAuthorizationNavItems.map((item) => item.id)
]);
const defaultActiveMenuState = {
  activeAuthId: "pdd-auth",
  activeContractGroup: "phone",
  activeEmailScreenshotId: "mobile-email-screenshot",
  activeSection: "contract",
  templateId: "mobile"
};
const douyinAuthorizationTemplateIds = new Set([
  "douyin-telecom-auth",
  "douyin-mobile-auth",
  "douyin-unicom-auth"
]);
const jdAuthorizationTemplateIds = new Set([
  "jd-telecom-auth",
  "jd-mobile-auth",
  "jd-unicom-auth"
]);
const pddShopNameCategoryOptions = ["通信", "通讯", "充值", "号卡", "通信服务", "会员充值", "数娱"];
const pddShopNameStoreTypeOptions = ["专营店"];
const defaultPddShopNameParts = {
  tradeName: "",
  category: pddShopNameCategoryOptions[0],
  storeType: pddShopNameStoreTypeOptions[0]
};
const emailAuthorizationTypes = ["电信授权", "移动授权", "联通授权", "广电授权"];
const emailScreenshotNavItems = [
  { id: "mobile-email-screenshot", label: "移动截图" },
  { id: "telecom-email-screenshot", label: "电信截图" },
  { id: "unicom-email-screenshot", label: "联通截图" }
];
const emailScreenshotIds = new Set(emailScreenshotNavItems.map((item) => item.id));
const defaultEmailForm = {
  companyName: "山东汇煜智能科技有限公司",
  shopName: "汇煜通信专营店",
  authorizationType: "电信授权",
  platformName: "拼多多",
  products: "新入网手机号码、4/3G上网资费卡、流量充值、话费充值、宽带"
};
const signatureAssetsFileName = "签名和章素材.zip";
const signatureAssetsDownloadUrl = `/downloads/${signatureAssetsFileName}`;
const trademarkItems = [
  {
    id: "mobile",
    name: "移动",
    imageFileName: "移动商标.jpg",
    imageUrl: "/trademarks/mobile-trademark-clear.jpg",
    pdfFileName: "移动商标详细内容.pdf",
    pdfUrl: "/trademarks/mobile-trademark-details.pdf"
  },
  {
    id: "unicom",
    name: "联通",
    imageFileName: "联通商标.jpg",
    imageUrl: "/trademarks/unicom-trademark-clear.jpg",
    pdfFileName: "联通商标详细内容.pdf",
    pdfUrl: "/trademarks/unicom-trademark-details.pdf"
  },
  {
    id: "telecom",
    name: "电信",
    imageFileName: "电信商标.jpg",
    imageUrl: "/trademarks/telecom-trademark-clear.jpg",
    pdfFileName: "电信商标详细内容.pdf",
    pdfUrl: "/trademarks/telecom-trademark-details.pdf"
  },
  {
    id: "broadcast",
    name: "广电",
    imageFileName: "广电商标.jpg",
    imageUrl: "/trademarks/broadcast-trademark-clear.jpg",
    pdfFileName: "广电商标详细内容.pdf",
    pdfUrl: "/trademarks/broadcast-trademark-details.pdf"
  }
];

function normalizeActiveMenuState(saved = {}) {
  const activeSection =
    saved.activeSection === "companyLookup" ||
    saved.activeSection === "authorizationNotice" ||
    saved.activeSection === "authorization" ||
    saved.activeSection === "tmallTraffic" ||
    saved.activeSection === "email" ||
    saved.activeSection === "emailScreenshot" ||
    saved.activeSection === "signatureAssets" ||
    saved.activeSection === "trademarks" ||
    saved.activeSection === "records"
      ? saved.activeSection
      : "contract";

  if (activeSection === "tmallTraffic") {
    return {
      ...defaultActiveMenuState,
      activeSection,
      templateId: tmallTrafficTemplateIds.has(saved.templateId)
        ? saved.templateId
        : tmallTrafficNavItems[0].id
    };
  }

  if (activeSection === "authorization") {
    const activeAuthId = allAuthorizationTemplateIds.has(saved.activeAuthId)
      ? saved.activeAuthId
      : defaultActiveMenuState.activeAuthId;
    const templateId = availableAuthorizationTemplateIds.has(activeAuthId)
      ? activeAuthId
      : contractTemplateIds.has(saved.templateId)
        ? saved.templateId
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
      activeEmailScreenshotId: emailScreenshotIds.has(saved.activeEmailScreenshotId)
        ? saved.activeEmailScreenshotId
        : defaultActiveMenuState.activeEmailScreenshotId,
      activeSection
    };
  }

  return {
    ...defaultActiveMenuState,
    activeContractGroup: contractGroupIds.has(saved.activeContractGroup)
      ? saved.activeContractGroup
      : defaultActiveMenuState.activeContractGroup,
    activeSection,
    templateId: contractTemplateIds.has(saved.templateId)
      ? saved.templateId
      : defaultActiveMenuState.templateId
  };
}

async function loadActiveMenuState() {
  const response = await fetch("/api/settings/active-menu");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "加载菜单状态失败");
  }

  return normalizeActiveMenuState(data.data || {});
}

async function saveActiveMenuState(state) {
  const response = await fetch("/api/settings/active-menu", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(normalizeActiveMenuState(state))
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "保存菜单状态失败");
  }

  return data.data;
}

async function loadAuthorizationNoticeContent() {
  const response = await fetch("/api/settings/authorization-notice");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "加载授权须知失败");
  }

  return data;
}

async function saveAuthorizationNoticeContent(content) {
  const response = await fetch("/api/settings/authorization-notice", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content })
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "保存授权须知失败");
  }

  return data;
}

function downloadBlob(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function fileNameFromDisposition(header, fallback = "渠道代理合同.docx") {
  const match = header?.match(/filename\*=UTF-8''([^;]+)/i);
  return match ? decodeURIComponent(match[1]) : fallback;
}

function formatTime(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatChineseDate(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatChineseYearMonth(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function formatSpacedChineseYearMonth(date) {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`;
}

function formatSpacedChineseDate(date) {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

function getLocalToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getOneYearTermEndDate(startDate) {
  const endDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
  endDate.setDate(endDate.getDate() - 1);
  return endDate;
}

function formatMobileContractTerm(startDate) {
  const endDate = getOneYearTermEndDate(startDate);
  return `本协议有效期从${formatSpacedChineseDate(startDate)}起至 ${formatSpacedChineseDate(endDate)}止。`;
}

function formatUnicomContractTerm(startDate) {
  const endDate = getOneYearTermEndDate(startDate);
  return `本协议履行期限从${formatChineseDate(startDate)}至${formatChineseDate(endDate)}止`;
}

function formatTelecomContractTerm(startDate) {
  const endDate = getOneYearTermEndDate(startDate);
  return `本协议期限自 ${formatSpacedChineseDate(startDate)}起至 ${formatSpacedChineseDate(endDate)}止`;
}

function formatBroadcastContractTerm(startDate) {
  const endDate = getOneYearTermEndDate(startDate);
  return `有效期 ${formatSpacedChineseDate(startDate).replace(" 日", "日")}至 ${formatSpacedChineseDate(endDate).replace(" 日", "日")}`;
}

function formatAuthorizationValidityTerm(startDate) {
  const endDate = getOneYearTermEndDate(startDate);
  return `${formatChineseDate(startDate)}至${formatChineseDate(endDate)}`;
}

function padDatePart(value) {
  return String(value).padStart(2, "0");
}

function formatZeroPaddedChineseDate(date) {
  return `${date.getFullYear()}年${padDatePart(date.getMonth() + 1)}月${padDatePart(date.getDate())}日`;
}

function formatDouyinAuthorizationValidityTerm(startDate) {
  const endDate = getOneYearTermEndDate(startDate);
  return `${formatZeroPaddedChineseDate(startDate)}-${formatZeroPaddedChineseDate(endDate)}`;
}

function formatJdAuthorizationValidityTerm(startDate) {
  const endDate = getOneYearTermEndDate(startDate);
  return `${formatZeroPaddedChineseDate(startDate)}至${formatZeroPaddedChineseDate(endDate)}`;
}

function formatDotDate(date) {
  return `${date.getFullYear()}.${padDatePart(date.getMonth() + 1)}.${padDatePart(date.getDate())}`;
}

function parseDateValue(value) {
  const match = String(value || "").match(/(20\d{2})\s*[年./-]\s*(\d{1,2})\s*[月./-]\s*(\d{1,2})/);

  if (!match) {
    return null;
  }

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function DatePickerButton({ fieldLabel, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseDateValue(value);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const baseDate = selectedDate || getLocalToday();
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  });
  const pickerRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!pickerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function openPicker() {
    const baseDate = selectedDate || getLocalToday();
    setVisibleMonth(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));
    setOpen(true);
  }

  function selectDate(date) {
    onChange(date);
    setOpen(false);
  }

  const firstDay = visibleMonth.getDay();
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const calendarDays = Array.from({ length: firstDay + daysInMonth }, (_, index) => {
    if (index < firstDay) {
      return null;
    }

    return new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index - firstDay + 1);
  });

  return (
    <div className="date-picker" ref={pickerRef}>
      <button
        type="button"
        className="icon-button"
        onClick={openPicker}
        title={`选择${fieldLabel}`}
        aria-label={`选择${fieldLabel}`}
        aria-expanded={open}
      >
        <CalendarDays size={17} />
      </button>
      {open && (
        <div className="date-picker-popover" role="dialog" aria-label={`${fieldLabel}日期选择器`}>
          <div className="date-picker-header">
            <button
              type="button"
              className="date-picker-nav-button"
              onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
              title="上个月"
              aria-label="上个月"
            >
              <ChevronLeft size={17} />
            </button>
            <strong>{visibleMonth.getFullYear()}年{visibleMonth.getMonth() + 1}月</strong>
            <button
              type="button"
              className="date-picker-nav-button"
              onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
              title="下个月"
              aria-label="下个月"
            >
              <ChevronRight size={17} />
            </button>
          </div>
          <div className="date-picker-weekdays" aria-hidden="true">
            {"日一二三四五六".split("").map((weekday) => <span key={weekday}>{weekday}</span>)}
          </div>
          <div className="date-picker-grid">
            {calendarDays.map((date, index) =>
              date ? (
                <button
                  type="button"
                  className={`date-picker-day${selectedDate && formatDateKey(selectedDate) === formatDateKey(date) ? " selected" : ""}${formatDateKey(getLocalToday()) === formatDateKey(date) ? " today" : ""}`}
                  key={formatDateKey(date)}
                  onClick={() => selectDate(date)}
                  aria-label={`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`}
                >
                  {date.getDate()}
                </button>
              ) : (
                <span className="date-picker-empty" key={`empty-${index}`} />
              )
            )}
          </div>
          <div className="date-picker-footer">
            <button type="button" className="text-button" onClick={() => selectDate(getLocalToday())}>
              今天
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function normalizeAddress(value) {
  return value.replace(/\s+/g, "");
}

function inferPostalCode(address) {
  const normalizedAddress = normalizeAddress(address || "");
  const postalCodeInAddress = normalizedAddress.match(/\d{6}/)?.[0];

  if (postalCodeInAddress) {
    return postalCodeInAddress;
  }

  return (
    postalCodeRules.find((rule) =>
      rule.patterns.every((pattern) => normalizedAddress.includes(pattern))
    )?.code || ""
  );
}

async function lookupPostalCode(address) {
  const response = await fetch("/api/postal-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address })
  });
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "未能根据乙方地址匹配邮编，请手动填写");
  }

  return data.data?.postalCode || "";
}

async function extractTradeName(company) {
  const response = await fetch("/api/company-trade-name", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ company })
  });
  const data = await response.json();

  if (data.skipped) {
    return "";
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || "获取企业字号失败");
  }

  return data.data?.tradeName || "";
}

async function loadGenerationRecords() {
  const response = await fetch("/api/generation-records");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "加载生成记录失败");
  }

  return data;
}

async function deleteGenerationRecord(recordId) {
  const response = await fetch(`/api/generation-records/${encodeURIComponent(recordId)}`, {
    method: "DELETE"
  });
  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "删除生成记录失败");
  }

  return data;
}

async function lookupCompanyProfile(keyword) {
  const response = await fetch("/api/company-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keyword })
  });
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "查询公司资料失败");
  }

  return data.data || {};
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

function buildPddShopName(parts) {
  const tradeName = String(parts.tradeName || "").trim();

  return tradeName ? `${tradeName}${parts.category}${parts.storeType}` : "";
}

function parsePddShopNameParts(shopName = "", fallbackTradeName = "") {
  const trimmedShopName = String(shopName || "").trim();
  const storeType =
    pddShopNameStoreTypeOptions.find((option) => trimmedShopName.endsWith(option)) ||
    defaultPddShopNameParts.storeType;
  const nameWithoutStoreType = trimmedShopName.endsWith(storeType)
    ? trimmedShopName.slice(0, -storeType.length)
    : trimmedShopName;
  const category =
    pddShopNameCategoryOptions.find((option) => nameWithoutStoreType.endsWith(option)) ||
    defaultPddShopNameParts.category;
  const tradeName = nameWithoutStoreType.endsWith(category)
    ? nameWithoutStoreType.slice(0, -category.length)
    : fallbackTradeName;

  return {
    tradeName: tradeName || fallbackTradeName || "",
    category,
    storeType
  };
}

function isInfoLabelLine(line) {
  return /^(公司名称|商家主体公司名称|法人|法定代表人|联系人|负责人|统一社会信用代码|税号|纳税人识别号|联系电话|电话|手机号|手机号码|邮箱|电子邮件|地址|通讯地址|注册地址|开户银行|银行账号|账号)\s*[:：]?/.test(
    line
  );
}

function readLabeledValue(lines, labelPattern) {
  const labelIndex = lines.findIndex((line) => labelPattern.test(line));

  if (labelIndex === -1) {
    return "";
  }

  const sameLineValue = lines[labelIndex].replace(labelPattern, "").replace(/^[:：]/, "").trim();
  if (sameLineValue) {
    return sameLineValue;
  }

  return lines.slice(labelIndex + 1).find((line) => line && !isInfoLabelLine(line)) || "";
}

function parseBulkPartyInfo(value) {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const bank = readLabeledValue(lines, /^开户银行\s*[:：]?\s*/);
  const rawBankAccount = readLabeledValue(lines, /^(银行账号|账号)\s*[:：]?\s*/).replace(/\s+/g, "");
  const bankAccount = /\d/.test(rawBankAccount) ? rawBankAccount : "";
  const labeledCompany = readLabeledValue(lines, /^(公司名称|商家主体公司名称)\s*[:：]?\s*/);
  const companyIndex = lines.findIndex((line) => /公司|经营部|商行|中心|工作室/.test(line));
  const company =
    labeledCompany ||
    (companyIndex >= 0
      ? lines[companyIndex].replace(/^(公司名称|商家主体公司名称)\s*[:：]?\s*/, "").trim()
      : lines[0] || "");
  const email = lines.map((line) => line.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]).find(Boolean) || "";
  const phone = lines
    .map((line) => line.match(/(?:^|[^\d])(1[3-9]\d{9})(?:[^\d]|$)/)?.[1])
    .find(Boolean) || "";
  const taxNo =
    readLabeledValue(lines, /^(统一社会信用代码|税号|纳税人识别号)\s*[:：]?\s*/) ||
    lines
      .map((line) => line.match(/\b[0-9A-Z]{15,20}\b/i)?.[0]?.toUpperCase())
      .find((item) => item && /[A-Z]/.test(item)) || "";
  const address =
    readLabeledValue(lines, /^(地址|通讯地址|注册地址)\s*[:：]?\s*/) ||
    lines
      .filter((line) => !/银行|账号|邮箱|电话|纳税人|税号|统一社会信用代码/.test(line))
      .filter((line) => /省|市|区|县|街道|社区|路|号|房|室|镇|村/.test(line) && line.length > 10)
      .sort((first, second) => second.length - first.length)[0] || "";
  const contact =
    readLabeledValue(lines, /^(法人|法定代表人|联系人|负责人)\s*[:：]?\s*/) ||
    lines
      .slice(companyIndex >= 0 ? companyIndex + 1 : 1)
      .find(
        (line) =>
          /^[\u4e00-\u9fa5]{2,5}$/.test(line) &&
          line !== company &&
          line !== bank &&
          line !== address
      ) || "";

  return {
    address,
    bank,
    bankAccount,
    company,
    contact,
    email,
    phone,
    postalCode: inferPostalCode(address),
    taxNo
  };
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readAutoFillValue(lines, aliases) {
  const orderedAliases = [...aliases].sort((first, second) => second.length - first.length);

  for (const alias of orderedAliases) {
    const aliasPattern = escapeRegExp(alias);
    const sameLinePattern = new RegExp(`^${aliasPattern}(?:\\s*[:：=]\\s*|\\s+)(.+)$`, "i");
    const labelOnlyPattern = new RegExp(`^${aliasPattern}\\s*[:：=]?\\s*$`, "i");

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const sameLineMatch = line.match(sameLinePattern);

      if (sameLineMatch?.[1]?.trim()) {
        return sameLineMatch[1].trim().replace(/[；;，,]$/, "");
      }

      if (labelOnlyPattern.test(line)) {
        const nextLine = lines.slice(index + 1).find((candidate) => candidate && !isInfoLabelLine(candidate));

        if (nextLine) {
          return nextLine.trim().replace(/[；;，,]$/, "");
        }
      }
    }
  }

  return "";
}

function normalizeAutoFillValue(fieldKey, value) {
  const normalized = String(value || "").trim();

  if (!autoFillNumericFields.has(fieldKey)) {
    return normalized;
  }

  if (fieldKey === "monthlyTurnover") {
    return normalized.replace(/(?:万元?|元)$/, "").trim();
  }

  if (fieldKey === "operatingMonths") {
    return normalized.replace(/个月?$/, "").trim();
  }

  if (fieldKey === "employmentYear") {
    return normalized.replace(/年$/, "").trim();
  }

  return normalized.replace(/人$/, "").trim();
}

function parseAutoFillContent(value, fields) {
  const lines = String(value || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/\t+/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const labelCounts = fields.reduce((counts, field) => {
    counts[field.label] = (counts[field.label] || 0) + 1;
    return counts;
  }, {});
  const recognized = {};

  fields.forEach((field) => {
    const configuredAliases = autoFillAliasesByField[field.key] || [];
    const aliases = [
      ...configuredAliases,
      ...(labelCounts[field.label] === 1 ? [field.label] : [])
    ];
    const parsedValue = normalizeAutoFillValue(field.key, readAutoFillValue(lines, aliases));

    if (parsedValue) {
      recognized[field.key] = parsedValue;
    }
  });

  const parsedPartyInfo = parseBulkPartyInfo(value);
  Object.entries(bulkFillFieldMap).forEach(([fieldKey, infoKey]) => {
    if (!recognized[fieldKey] && fields.some((field) => field.key === fieldKey) && parsedPartyInfo[infoKey]) {
      recognized[fieldKey] = parsedPartyInfo[infoKey];
    }
  });

  const allText = lines.join(" ");
  const dateRange = allText.match(
    /(?:20\d{2}[年./-]\d{1,2}[月./-]\d{1,2}日?\s*(?:至|到|-|至)\s*20\d{2}[年./-]\d{1,2}[月./-]\d{1,2}日?)/
  )?.[0];

  if (dateRange) {
    const dateField = fields.find((field) => field.key === "validityTerm");
    if (dateField && !recognized.validityTerm) {
      recognized.validityTerm = dateRange;
    }
  }

  return recognized;
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submitLogin(event) {
    event.preventDefault();

    if (username === "admin" && password === "123456") {
      window.localStorage.setItem("contract-app-authenticated", "true");
      onLogin();
      return;
    }

    setError("账号或密码不正确");
  }

  return (
    <main className="login-shell">
      <form className="login-card" onSubmit={submitLogin}>
        <div className="login-mark">
          <ShieldCheck size={30} />
        </div>
        <div>
          <div className="eyebrow">合同下载系统</div>
          <h1>账号登录</h1>
        </div>
        <label className="field">
          <span>账号</span>
          <input value={username} onChange={(event) => setUsername(event.target.value)} autoFocus />
        </label>
        <label className="field">
          <span>密码</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && <div className="login-error">{error}</div>}
        <button className="primary-button" type="submit">
          <KeyRound size={18} />
          登录
        </button>
      </form>
    </main>
  );
}

function getActiveNavGroupId(activeSection, activeContractGroup, activeAuthId) {
  if (activeSection === "companyLookup") {
    return "companyLookup";
  }

  if (activeSection === "authorizationNotice") {
    return "authorizationNotice";
  }

  if (activeSection === "email") {
    return "email";
  }

  if (activeSection === "emailScreenshot") {
    return "emailScreenshot";
  }

  if (activeSection === "signatureAssets") {
    return "signatureAssets";
  }

  if (activeSection === "trademarks") {
    return "trademarks";
  }

  if (activeSection === "records") {
    return "records";
  }

  if (activeSection === "tmallTraffic") {
    return "tmallTraffic";
  }

  if (activeSection === "authorization") {
    return activeAuthId?.startsWith("qr-") ? "qr" : "authorization";
  }

  return activeContractGroup || "phone";
}

function Sidebar({
  activeSection,
  activeTemplateId,
  activeContractGroup,
  activeEmailScreenshotId,
  activeAuthId,
  onSelectContract,
  onSelectAuthorization,
  onSelectAuthorizationNotice,
  onSelectSignatureAssets,
  onSelectTrademarks,
  onSelectCompanyLookup,
  onSelectEmail,
  onSelectEmailScreenshot,
  onSelectTmallTraffic,
  onSelectRecords,
  onLogout
}) {
  const activeGroupId = getActiveNavGroupId(activeSection, activeContractGroup, activeAuthId);
  const [expandedGroups, setExpandedGroups] = useState(() => ({ [activeGroupId]: true }));
  const navGroups = [
    {
      icon: <Search size={17} />,
      id: "companyLookup",
      title: "查公司资料",
      type: "single"
    },
    {
      contractGroup: "standard",
      icon: <FolderOpen size={17} />,
      id: "standard",
      items: contractNavItems,
      title: "号卡合同",
      type: "contract"
    },
    {
      icon: <FileText size={17} />,
      id: "authorization",
      items: authorizationNavItems,
      title: "授权书",
      type: "authorization"
    },
    {
      contractGroup: "phone",
      icon: <FolderOpen size={17} />,
      id: "phone",
      items: phoneContractNavItems,
      title: "话费合同",
      type: "contract"
    },
    {
      contractGroup: "traffic",
      icon: <FolderOpen size={17} />,
      id: "traffic",
      items: trafficContractNavItems,
      title: "流量合同",
      type: "contract"
    },
    {
      icon: <FileText size={17} />,
      id: "tmallTraffic",
      items: tmallTrafficNavItems,
      title: "天猫流量入住",
      type: "tmallTraffic"
    },
    {
      icon: <FolderOpen size={17} />,
      id: "qr",
      items: qrAuthorizationNavItems,
      title: "QR二维码授权",
      type: "authorization"
    },
    {
      icon: <FileText size={17} />,
      id: "authorizationNotice",
      title: "授权须知",
      type: "single"
    },
    {
      icon: <Archive size={17} />,
      id: "signatureAssets",
      title: "签名和章素材",
      type: "single"
    },
    {
      icon: <FileCheck2 size={17} />,
      id: "trademarks",
      title: "商标",
      type: "single"
    },
    {
      icon: <Send size={17} />,
      id: "email",
      title: "发送邮件",
      type: "single"
    },
    {
      icon: <FileText size={17} />,
      id: "emailScreenshot",
      items: emailScreenshotNavItems,
      title: "邮件截图菜单",
      type: "emailScreenshot"
    },
    {
      icon: <Database size={17} />,
      id: "records",
      title: "生成记录",
      type: "single"
    }
  ];

  useEffect(() => {
    setExpandedGroups((current) => ({ ...current, [activeGroupId]: true }));
  }, [activeGroupId]);

  function toggleNavGroup(groupId) {
    setExpandedGroups((current) => ({ ...current, [groupId]: !current[groupId] }));
  }

  function isActiveNavChild(group, item) {
    if (group.type === "single") {
      return activeSection === group.id;
    }

    if (group.type === "authorization") {
      return activeSection === "authorization" && activeAuthId === item.id;
    }

    if (group.type === "emailScreenshot") {
      return activeSection === "emailScreenshot" && activeEmailScreenshotId === item.id;
    }

    if (group.type === "tmallTraffic") {
      return activeSection === "tmallTraffic" && activeTemplateId === item.id;
    }

    return (
      activeSection === "contract" &&
      activeContractGroup === group.contractGroup &&
      activeTemplateId === item.id
    );
  }

  function selectNavChild(group, item) {
    if (group.type === "single") {
      if (group.id === "companyLookup") {
        onSelectCompanyLookup();
        return;
      }

      if (group.id === "records") {
        onSelectRecords();
        return;
      }

      if (group.id === "authorizationNotice") {
        onSelectAuthorizationNotice();
        return;
      }

      if (group.id === "signatureAssets") {
        onSelectSignatureAssets();
        return;
      }

      if (group.id === "trademarks") {
        onSelectTrademarks();
        return;
      }

      onSelectEmail();
      return;
    }

    if (group.type === "authorization") {
      onSelectAuthorization(item.id);
      return;
    }

    if (group.type === "emailScreenshot") {
      onSelectEmailScreenshot(item.id);
      return;
    }

    if (group.type === "tmallTraffic") {
      onSelectTmallTraffic(item.id);
      return;
    }

    onSelectContract(item.id, group.contractGroup);
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <FileCheck2 size={24} />
        <div>
          <strong>授权管理系统</strong>
          <span>DOCX 下载工具</span>
        </div>
      </div>

      <nav className="side-nav">
        {navGroups.map((group) => {
          if (group.type === "single") {
            const isActive = activeSection === group.id;

            return (
              <div className="nav-group" key={group.id}>
                <button
                  type="button"
                  className={isActive ? "nav-group-title nav-single active" : "nav-group-title nav-single"}
                  onClick={() => selectNavChild(group)}
                >
                  {group.icon}
                  <span>{group.title}</span>
                </button>
              </div>
            );
          }

          const isExpanded = Boolean(expandedGroups[group.id]);
          const childrenId = `nav-children-${group.id}`;

          return (
            <div className="nav-group" key={group.id}>
              <button
                type="button"
                className={isExpanded ? "nav-group-title expanded" : "nav-group-title"}
                aria-expanded={isExpanded}
                aria-controls={childrenId}
                onClick={() => toggleNavGroup(group.id)}
              >
                {group.icon}
                <span>{group.title}</span>
                <ChevronDown className="nav-chevron" size={15} />
              </button>
              {isExpanded && (
                <div className="nav-children" id={childrenId}>
                  {group.items.map((item) => (
                    <button
                      type="button"
                      className={isActiveNavChild(group, item) ? "nav-child active" : "nav-child"}
                      onClick={() => selectNavChild(group, item)}
                      key={item.id}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

      </nav>

      <button type="button" className="logout-button" onClick={onLogout}>
        <LogOut size={17} />
        退出登录
      </button>
    </aside>
  );
}

function AuthorizationPlaceholder({ activeAuthId }) {
  const activeItem =
    authorizationNavItems.find((item) => item.id === activeAuthId) ||
    qrAuthorizationNavItems.find((item) => item.id === activeAuthId);

  return (
    <section className="placeholder-panel">
      <div className="placeholder-icon">
        <FileText size={34} />
      </div>
      <div>
        <div className="eyebrow">{activeAuthId?.startsWith("qr-") ? "QR二维码授权" : "授权书"}</div>
        <h1>{activeItem?.label || "授权书"}</h1>
      </div>
      <p>这个入口已经建好。把对应授权书 Word 模板发来后，我可以把它接成和合同一样的编辑、生成、下载流程。</p>
    </section>
  );
}

function SignatureAssetsPage() {
  return (
    <section className="signature-assets-page">
      <header className="topbar">
        <div>
          <div className="eyebrow">素材下载</div>
          <h1>签名和章素材</h1>
        </div>
      </header>

      <section className="field-group signature-assets-panel">
        <div className="signature-assets-icon">
          <Archive size={30} />
        </div>
        <div className="signature-assets-file">
          <strong>{signatureAssetsFileName}</strong>
          <span>ZIP 压缩包 · 13.2 MB</span>
        </div>
        <a
          className="primary-button signature-assets-download"
          href={signatureAssetsDownloadUrl}
          download={signatureAssetsFileName}
        >
          <Download size={18} />
          下载压缩包
        </a>
      </section>
    </section>
  );
}

function TrademarksPage() {
  return (
    <section className="trademarks-page">
      <header className="topbar">
        <div>
          <div className="eyebrow">素材下载</div>
          <h1>商标</h1>
        </div>
      </header>

      <div className="trademark-grid">
        {trademarkItems.map((item) => (
          <article className="trademark-card" key={item.id}>
            <div className="trademark-preview">
              <img src={item.imageUrl} alt={`${item.name}商标`} />
            </div>
            <div className="trademark-card-body">
              <h2>{item.name}</h2>
              <div className="trademark-actions">
                <a className="text-button" href={item.imageUrl} download={item.imageFileName}>
                  <Download size={17} />
                  下载图片
                </a>
                <a className="primary-button" href={item.pdfUrl} download={item.pdfFileName}>
                  <Download size={17} />
                  下载 PDF
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AuthorizationNoticePage() {
  const [content, setContent] = useState(authorizationNoticeText);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadNotice() {
      try {
        const data = await loadAuthorizationNoticeContent();

        if (!alive) {
          return;
        }

        setContent(typeof data.data?.content === "string" ? data.data.content : authorizationNoticeText);
        setMessage(data.connected ? "" : "MongoDB 未连接，当前显示默认内容");
      } catch (error) {
        if (!alive) {
          return;
        }

        setMessage(error.message || "加载授权须知失败");
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadNotice();

    return () => {
      alive = false;
    };
  }, []);

  function downloadNotice() {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, "授权须知.txt");
  }

  async function saveNotice() {
    setSaving(true);
    setMessage("");

    try {
      const data = await saveAuthorizationNoticeContent(content);
      setContent(typeof data.data?.content === "string" ? data.data.content : content);
      setMessage(data.connected ? "授权须知已保存" : "MongoDB 未连接，内容仅在当前页面生效");
    } catch (error) {
      setMessage(error.message || "保存授权须知失败");
    } finally {
      setSaving(false);
    }
  }

  function resetNotice() {
    setContent(authorizationNoticeText);
    setMessage("已恢复默认内容，点击保存后生效");
  }

  return (
    <section className="notice-page">
      <section className="field-group notice-panel">
        <header className="topbar notice-topbar">
          <div>
            <div className="eyebrow">二维码授权</div>
            <h1>授权须知</h1>
          </div>
          <div className="notice-actions">
            <button type="button" className="text-button" onClick={resetNotice} disabled={loading || saving}>
              <RotateCcw size={16} />
              恢复默认
            </button>
            <button type="button" className="text-button" onClick={downloadNotice} disabled={loading}>
              <Download size={16} />
              下载 TXT
            </button>
            <button type="button" className="primary-button notice-save-button" onClick={saveNotice} disabled={loading || saving}>
              {saving ? <Loader2 className="spin" size={18} /> : <FileCheck2 size={18} />}
              保存
            </button>
          </div>
        </header>

        <textarea
          className="notice-editor"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          disabled={loading}
          aria-label="授权须知内容"
        />

        {message && <div className="message-line">{message}</div>}
      </section>
    </section>
  );
}

function EmailPage() {
  const [form, setForm] = useState(defaultEmailForm);
  const [copiedTarget, setCopiedTarget] = useState("");
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsQuery, setRecordsQuery] = useState("");
  const [recordsMessage, setRecordsMessage] = useState("");
  const emailSubject = `${form.platformName}虚拟类目商家申请认证店铺资质-${form.companyName}-店铺名：${form.shopName}-${form.authorizationType}`;
  const emailBody = [
    "兹证明，我司允许本公司合作商家：",
    `商家主体公司名称：${form.companyName}`,
    `${form.platformName}店铺名称：${form.shopName}`,
    `在${form.platformName}上销售本公司授权的产品${form.products}，本公司对该商家在${form.platformName}销售的货源真实性、正规性、合法性负责。同时，允许该商家为${form.platformName}用户办理固定电话装机、移机、过户，移动电话开户、过户等，并要求商家收集的用户身份信息仅限办理我司新入网手续，不得挪作他用或泄露。`,
    "请贵平台知悉。"
  ].join("\n");
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

  function updateEmailField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

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

  function applyRecordToEmail(record) {
    setForm((current) => ({
      ...current,
      companyName: record.fields?.companyName || current.companyName,
      shopName: record.fields?.shopName || current.shopName
    }));
    setRecordsMessage("已填入邮件信息");
  }

  function recordCopyText(record) {
    return [
      `公司名称：${record.fields?.companyName || ""}`,
      `店铺名称：${record.fields?.shopName || ""}`
    ].join("\n");
  }

  return (
    <section className="email-page">
      <header className="topbar">
        <div>
          <div className="eyebrow">邮件</div>
          <h1>发送邮件</h1>
        </div>
      </header>

      <div className="email-workspace">
        <div className="email-layout">
          <section className="field-group email-form-panel">
            <div className="group-heading">
              <h2>邮件信息</h2>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>商家主体公司名称</span>
                <input
                  value={form.companyName}
                  onChange={(event) => updateEmailField("companyName", event.target.value)}
                />
              </label>
              <label className="field">
                <span>店铺名称</span>
                <input
                  value={form.shopName}
                  onChange={(event) => updateEmailField("shopName", event.target.value)}
                />
              </label>
              <label className="field">
                <span>授权类型</span>
                <select
                  value={form.authorizationType}
                  onChange={(event) => updateEmailField("authorizationType", event.target.value)}
                >
                  {emailAuthorizationTypes.map((item) => (
                    <option value={item} key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>平台名称</span>
                <input
                  value={form.platformName}
                  onChange={(event) => updateEmailField("platformName", event.target.value)}
                />
              </label>
              <label className="field field-wide">
                <span>授权产品</span>
                <textarea
                  value={form.products}
                  onChange={(event) => updateEmailField("products", event.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="field-group email-output-panel">
            <div className="email-output-heading">
              <h2>邮件主题</h2>
              <button type="button" className="text-button" onClick={() => copyText("subject", emailSubject)}>
                <Copy size={16} />
                {copiedTarget === "subject" ? "已复制" : "复制"}
              </button>
            </div>
            <textarea className="email-subject-output" value={emailSubject} readOnly />
          </section>

          <section className="field-group email-output-panel">
            <div className="email-output-heading">
              <h2>邮件正文</h2>
              <button type="button" className="text-button" onClick={() => copyText("body", emailBody)}>
                <Copy size={16} />
                {copiedTarget === "body" ? "已复制" : "复制"}
              </button>
            </div>
            <textarea className="email-body-output" value={emailBody} readOnly />
          </section>
        </div>

        <aside className="field-group email-record-panel">
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
            <div className="email-record-list">
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
                      <button type="button" className="text-button" onClick={() => applyRecordToEmail(record)}>
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
        </aside>
      </div>
    </section>
  );
}

function CompanyLookupPage() {
  const emptyProfile = {
    companyName: "",
    legalPerson: "",
    taxNo: "",
    phone: "",
    email: "",
    address: "",
    bank: "",
    bankAccount: "",
    confidence: "",
    sourceNote: "",
    headerText: ""
  };
  const [keyword, setKeyword] = useState("");
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const fieldRows = [
    ["公司名称", "companyName"],
    ["法人", "legalPerson"],
    ["统一社会信用代码", "taxNo"],
    ["电话", "phone"],
    ["邮箱", "email"],
    ["地址", "address"],
    ["开户银行", "bank"],
    ["银行账号", "bankAccount"]
  ];
  const headerText =
    profile.headerText ||
    fieldRows.map(([label, key]) => `${label}：${profile[key] || ""}`).join("\n");

  async function handleLookup(event) {
    event.preventDefault();

    if (!keyword.trim()) {
      setMessage("请输入公司名称或统一社会信用代码");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = await lookupCompanyProfile(keyword.trim());
      setProfile({ ...emptyProfile, ...data });
      setMessage("已查询公司资料");
    } catch (error) {
      setProfile(emptyProfile);
      setMessage(error.message || "查询公司资料失败");
    } finally {
      setLoading(false);
    }
  }

  async function copyCompanyValue(key, value) {
    await copyToClipboard(value || "");
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(""), 1600);
  }

  return (
    <section className="company-lookup-page">
      <header className="topbar">
        <div>
          <div className="eyebrow">资料查询</div>
          <h1>查公司资料</h1>
        </div>
      </header>

      <section className="field-group company-lookup-panel">
        <form className="company-lookup-form" onSubmit={handleLookup}>
          <label className="field">
            <span>公司名称或统一社会信用代码</span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="请输入公司名称或统一社会信用代码"
            />
          </label>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? <Loader2 className="spin" size={18} /> : <Search size={18} />}
            查询
          </button>
        </form>
      </section>

      <section className="company-lookup-layout">
        <section className="field-group company-profile-panel">
          <div className="records-detail-heading">
            <div>
              <h2>{profile.companyName || "公司资料"}</h2>
              <span>{profile.confidence || profile.sourceNote || "没有的字段会留空"}</span>
            </div>
            <button type="button" className="text-button" onClick={() => copyCompanyValue("all", headerText)}>
              <Copy size={16} />
              {copiedKey === "all" ? "已复制" : "复制抬头"}
            </button>
          </div>

          <div className="record-field-list">
            {fieldRows.map(([label, key]) => (
              <div className="record-field-row" key={key}>
                <span>{label}</span>
                <strong>{profile[key] || ""}</strong>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => copyCompanyValue(key, profile[key] || "")}
                  title={`复制${label}`}
                >
                  {copiedKey === key ? <FileCheck2 size={17} /> : <Copy size={17} />}
                </button>
              </div>
            ))}
          </div>

          <textarea className="record-copy-output" value={headerText} readOnly />
        </section>
      </section>

      {message && <div className="message-line">{message}</div>}
    </section>
  );
}

function GenerationRecordsPage() {
  const [records, setRecords] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const [deletingRecordId, setDeletingRecordId] = useState("");

  async function refreshRecords() {
    setLoading(true);
    setMessage("");

    try {
      const data = await loadGenerationRecords();
      const items = data.items || [];
      setConnected(Boolean(data.connected));
      setRecords(items);
      setSelectedRecordId((current) => (items.some((item) => item.id === current) ? current : items[0]?.id || ""));
    } catch (error) {
      setMessage(error.message || "加载生成记录失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return records;
    }

    return records.filter((record) =>
      [record.fields.companyName, record.fields.shopName, record.fields.phone, record.fields.taxNo, record.fields.address]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [query, records]);
  const selectedRecord =
    filteredRecords.find((record) => record.id === selectedRecordId) ||
    filteredRecords[0] ||
    null;
  const fieldRows = selectedRecord
    ? [
        ["公司名称", selectedRecord.fields.companyName],
        ["店铺名称", selectedRecord.fields.shopName],
        ["联系人", selectedRecord.fields.contact],
        ["统一社会信用代码", selectedRecord.fields.taxNo],
        ["电话", selectedRecord.fields.phone],
        ["邮箱", selectedRecord.fields.email],
        ["地址", selectedRecord.fields.address],
        ["开户银行", selectedRecord.fields.bank],
        ["银行账号", selectedRecord.fields.bankAccount]
      ]
    : [];

  async function copyRecordValue(key, value) {
    await copyToClipboard(value);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(""), 1600);
  }

  async function deleteSelectedRecord() {
    if (!selectedRecord || deletingRecordId) {
      return;
    }

    const confirmed = window.confirm(`确定删除“${selectedRecord.fields.companyName}”的生成记录吗？`);

    if (!confirmed) {
      return;
    }

    setDeletingRecordId(selectedRecord.id);
    setMessage("");

    try {
      await deleteGenerationRecord(selectedRecord.id);
      setSelectedRecordId("");
      await refreshRecords();
      setMessage("已删除生成记录");
    } catch (error) {
      setMessage(error.message || "删除生成记录失败");
    } finally {
      setDeletingRecordId("");
    }
  }

  return (
    <section className="records-page">
      <header className="topbar">
        <div>
          <div className="eyebrow">资料库</div>
          <h1>生成记录</h1>
        </div>
        <div className="topbar-actions">
          <button type="button" className="icon-button" onClick={refreshRecords} title="刷新记录">
            {loading ? <Loader2 className="spin" size={18} /> : <RefreshCw size={18} />}
          </button>
        </div>
      </header>

      <section className="records-layout">
        <aside className="field-group records-list-panel">
          <div className="records-list-heading">
            <h2>公司记录</h2>
            <span>{connected ? `${records.length} 条唯一公司` : "MongoDB 未连接"}</span>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索公司、店铺、电话、税号或地址"
          />
          <div className="records-list">
            {filteredRecords.length === 0 ? (
              <div className="empty-state">
                <FileText size={28} />
                <span>{loading ? "正在加载" : "暂无生成记录"}</span>
              </div>
            ) : (
              filteredRecords.map((record) => (
                <button
                  type="button"
                  className={selectedRecord?.id === record.id ? "record-list-item active" : "record-list-item"}
                  onClick={() => setSelectedRecordId(record.id)}
                  key={record.id}
                >
                  <strong>{record.fields.companyName}</strong>
                  <span>{record.fields.phone || record.fields.shopName || record.templateName || "未填写电话"}</span>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="field-group records-detail-panel">
          {selectedRecord ? (
            <>
              <div className="records-detail-heading">
                <div>
                  <h2>{selectedRecord.fields.companyName}</h2>
                  <span>{selectedRecord.templateName} · {formatTime(selectedRecord.createdAt)}</span>
                </div>
                <div className="records-detail-actions">
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => copyRecordValue("all", selectedRecord.copyText)}
                  >
                    <Copy size={16} />
                    {copiedKey === "all" ? "已复制" : "复制整条"}
                  </button>
                  <button
                    type="button"
                    className="text-button danger-button"
                    onClick={deleteSelectedRecord}
                    disabled={deletingRecordId === selectedRecord.id}
                  >
                    {deletingRecordId === selectedRecord.id ? (
                      <Loader2 className="spin" size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    {deletingRecordId === selectedRecord.id ? "删除中" : "删除记录"}
                  </button>
                </div>
              </div>
              <div className="record-field-list">
                {fieldRows.map(([label, value]) => (
                  <div className="record-field-row" key={label}>
                    <span>{label}</span>
                    <strong>{value || ""}</strong>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => copyRecordValue(label, value || "")}
                      title={`复制${label}`}
                    >
                      {copiedKey === label ? <FileCheck2 size={17} /> : <Copy size={17} />}
                    </button>
                  </div>
                ))}
              </div>
              <textarea className="record-copy-output" value={selectedRecord.copyText} readOnly />
            </>
          ) : (
            <div className="empty-state">
              <Database size={28} />
              <span>{message || "生成合同时会自动记录公司资料"}</span>
            </div>
          )}
        </section>
      </section>

      {message && <div className="message-line">{message}</div>}
    </section>
  );
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(
    () => window.localStorage.getItem("contract-app-authenticated") === "true"
  );
  const [activeSection, setActiveSection] = useState(defaultActiveMenuState.activeSection);
  const [activeContractGroup, setActiveContractGroup] = useState(defaultActiveMenuState.activeContractGroup);
  const [activeEmailScreenshotId, setActiveEmailScreenshotId] = useState(
    defaultActiveMenuState.activeEmailScreenshotId
  );
  const [activeAuthId, setActiveAuthId] = useState(defaultActiveMenuState.activeAuthId);
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState(defaultActiveMenuState.templateId);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [groups, setGroups] = useState([]);
  const [defaults, setDefaults] = useState({});
  const [values, setValues] = useState({});
  const [keepBrackets, setKeepBrackets] = useState(true);
  const [customReplacements, setCustomReplacements] = useState([{ ...emptyCustomReplacement }]);
  const [records, setRecords] = useState([]);
  const [mongoConnected, setMongoConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [switchingTemplate, setSwitchingTemplate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deletingHistoryId, setDeletingHistoryId] = useState("");
  const [downloadingHistory, setDownloadingHistory] = useState("");
  const [postalCodeLoading, setPostalCodeLoading] = useState(false);
  const [contractCodeUnlocked, setContractCodeUnlocked] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState("");
  const [message, setMessage] = useState("");
  const [menuHydrated, setMenuHydrated] = useState(false);
  const [pddShopNameParts, setPddShopNameParts] = useState(defaultPddShopNameParts);
  const [pddTradeNameLoading, setPddTradeNameLoading] = useState(false);
  const pddShopNamePartsRef = useRef(defaultPddShopNameParts);
  const lastPddTradeNameCompanyRef = useRef("");

  useEffect(() => {
    if (!menuHydrated) {
      return;
    }

    saveActiveMenuState({
      activeAuthId,
      activeContractGroup,
      activeEmailScreenshotId,
      activeSection,
      templateId
    }).catch((error) => {
      console.error(error);
    });
  }, [activeAuthId, activeContractGroup, activeEmailScreenshotId, activeSection, menuHydrated, templateId]);

  const changedCount = useMemo(
    () => Object.keys(defaults).filter((key) => values[key] !== defaults[key]).length,
    [defaults, values]
  );

  const hasBracketedFields = useMemo(
    () =>
      groups.some((group) =>
        group.fields.some((field) => field.targets?.some((target) => target.kind === "bracketed"))
      ),
    [groups]
  );
  const canEditActiveAuthorization =
    activeSection === "authorization" && availableAuthorizationTemplateIds.has(activeAuthId);
  const documentKind =
    activeSection === "authorization"
      ? "授权书"
      : activeSection === "tmallTraffic"
        ? "天猫流量入住"
        : "合同";

  async function loadFields(nextTemplateId = templateId) {
    const response = await fetch(`/api/contract/fields?templateId=${encodeURIComponent(nextTemplateId)}`);
    const data = await response.json();

    setTemplates(data.templates || []);
    setSelectedTemplate(data.selectedTemplate);
    setGroups(data.groups || []);
    setDefaults(data.defaults || {});
    setValues(data.defaults || {});
    setKeepBrackets(data.options?.keepBrackets ?? true);
    const nextSelectedTemplateId = data.selectedTemplate?.id || nextTemplateId;
    setTemplateId(nextSelectedTemplateId);
    setContractCodeUnlocked(false);
    setBulkPasteText("");
    setCustomReplacements([{ ...emptyCustomReplacement }]);
    const nextPddShopNameParts =
      nextSelectedTemplateId === "pdd-auth"
        ? parsePddShopNameParts(data.defaults?.shopName || "")
        : defaultPddShopNameParts;
    pddShopNamePartsRef.current = nextPddShopNameParts;
    setPddShopNameParts(nextPddShopNameParts);
    lastPddTradeNameCompanyRef.current = "";
  }

  async function loadRecords() {
    const response = await fetch("/api/contracts");
    const data = await response.json();
    setMongoConnected(data.connected);
    setRecords(data.items || []);
  }

  useEffect(() => {
    async function boot() {
      let activeMenuLoaded = false;

      try {
        const activeMenu = await loadActiveMenuState();
        activeMenuLoaded = true;

        setActiveSection(activeMenu.activeSection);
        setActiveContractGroup(activeMenu.activeContractGroup);
        setActiveEmailScreenshotId(activeMenu.activeEmailScreenshotId);
        setActiveAuthId(activeMenu.activeAuthId);

        if (
          activeMenu.activeSection === "companyLookup" ||
          activeMenu.activeSection === "authorizationNotice" ||
          activeMenu.activeSection === "email" ||
          activeMenu.activeSection === "emailScreenshot" ||
          activeMenu.activeSection === "signatureAssets" ||
          activeMenu.activeSection === "trademarks" ||
          activeMenu.activeSection === "records"
        ) {
          setTemplates([]);
          setSelectedTemplate(null);
          setGroups([]);
          setDefaults({});
          setValues({});
          setTemplateId(activeMenu.templateId);
        } else if (activeMenu.activeSection === "authorization") {
          if (availableAuthorizationTemplateIds.has(activeMenu.activeAuthId)) {
            await loadFields(activeMenu.activeAuthId);
          } else {
            setTemplates([]);
            setSelectedTemplate(null);
            setGroups([]);
            setDefaults({});
            setValues({});
            setTemplateId(activeMenu.templateId);
          }
        } else {
          await loadFields(activeMenu.templateId);
        }
        await loadRecords();
      } catch (error) {
        setMessage(error.message || "加载失败");
      } finally {
        setLoading(false);
        setMenuHydrated(activeMenuLoaded);
      }
    }

    boot();
  }, []);

  async function selectContract(nextTemplateId, nextContractGroup = "phone") {
    setActiveSection("contract");
    setActiveContractGroup(nextContractGroup);
    setSwitchingTemplate(true);
    setMessage("");

    try {
      await loadFields(nextTemplateId);
    } catch (error) {
      setMessage(error.message || "模板切换失败");
    } finally {
      setSwitchingTemplate(false);
    }
  }

  async function selectAuthorization(nextAuthId) {
    setActiveSection("authorization");
    setActiveAuthId(nextAuthId);
    setSwitchingTemplate(true);
    setMessage("");

    try {
      if (availableAuthorizationTemplateIds.has(nextAuthId)) {
        await loadFields(nextAuthId);
      }
    } catch (error) {
      setMessage(error.message || "授权书模板切换失败");
    } finally {
      setSwitchingTemplate(false);
    }
  }

  async function selectTmallTraffic(nextTemplateId = tmallTrafficNavItems[0].id) {
    setActiveSection("tmallTraffic");
    setSwitchingTemplate(true);
    setMessage("");

    try {
      await loadFields(nextTemplateId);
    } catch (error) {
      setMessage(error.message || "文档模板切换失败");
    } finally {
      setSwitchingTemplate(false);
    }
  }

  function selectCompanyLookup() {
    setActiveSection("companyLookup");
    setSwitchingTemplate(false);
    setMessage("");
    setTemplates([]);
    setSelectedTemplate(null);
    setGroups([]);
    setDefaults({});
    setValues({});
  }

  function selectAuthorizationNotice() {
    setActiveSection("authorizationNotice");
    setSwitchingTemplate(false);
    setMessage("");
    setTemplates([]);
    setSelectedTemplate(null);
    setGroups([]);
    setDefaults({});
    setValues({});
  }

  function selectSignatureAssets() {
    setActiveSection("signatureAssets");
    setSwitchingTemplate(false);
    setMessage("");
    setTemplates([]);
    setSelectedTemplate(null);
    setGroups([]);
    setDefaults({});
    setValues({});
  }

  function selectTrademarks() {
    setActiveSection("trademarks");
    setSwitchingTemplate(false);
    setMessage("");
    setTemplates([]);
    setSelectedTemplate(null);
    setGroups([]);
    setDefaults({});
    setValues({});
  }

  function selectEmail() {
    setActiveSection("email");
    setSwitchingTemplate(false);
    setMessage("");
    setTemplates([]);
    setSelectedTemplate(null);
    setGroups([]);
    setDefaults({});
    setValues({});
  }

  function selectEmailScreenshot(nextEmailScreenshotId = defaultActiveMenuState.activeEmailScreenshotId) {
    setActiveSection("emailScreenshot");
    setActiveEmailScreenshotId(
      emailScreenshotIds.has(nextEmailScreenshotId)
        ? nextEmailScreenshotId
        : defaultActiveMenuState.activeEmailScreenshotId
    );
    setSwitchingTemplate(false);
    setMessage("");
    setTemplates([]);
    setSelectedTemplate(null);
    setGroups([]);
    setDefaults({});
    setValues({});
  }

  function selectRecords() {
    setActiveSection("records");
    setSwitchingTemplate(false);
    setMessage("");
    setTemplates([]);
    setSelectedTemplate(null);
    setGroups([]);
    setDefaults({});
    setValues({});
  }

  function logout() {
    window.localStorage.removeItem("contract-app-authenticated");
    setAuthenticated(false);
  }

  function updateValue(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updatePddShopNameParts(patch) {
    const next = { ...pddShopNamePartsRef.current, ...patch };
    const nextShopName = buildPddShopName(next);

    pddShopNamePartsRef.current = next;
    setPddShopNameParts(next);

    if (nextShopName) {
      setValues((currentValues) => ({ ...currentValues, shopName: nextShopName }));
    }
  }

  function updatePddShopName(value) {
    updateValue("shopName", value);
    const next = parsePddShopNameParts(value, pddShopNamePartsRef.current.tradeName);
    pddShopNamePartsRef.current = next;
    setPddShopNameParts(next);
  }

  async function refreshPddTradeName(force = false) {
    const company = String(values.partyBName || "").trim();

    if (!company) {
      setMessage("请先填写商家主体公司名称");
      return;
    }

    if (!force && lastPddTradeNameCompanyRef.current === company && pddShopNamePartsRef.current.tradeName) {
      return;
    }

    lastPddTradeNameCompanyRef.current = company;
    setPddTradeNameLoading(true);

    try {
      const tradeName = await extractTradeName(company);

      if (!tradeName) {
        lastPddTradeNameCompanyRef.current = "";
        setMessage("未能自动获取企业字号，请手动填写");
        return;
      }

      updatePddShopNameParts({ tradeName });
      setMessage(`已获取企业字号：${tradeName}`);
    } catch (error) {
      lastPddTradeNameCompanyRef.current = "";
      setMessage(error.message || "获取企业字号失败，请手动填写");
    } finally {
      setPddTradeNameLoading(false);
    }
  }

  function resetValues() {
    setValues(defaults);
    setCustomReplacements([{ ...emptyCustomReplacement }]);
    setKeepBrackets(
      !(
        templateId === "mobile" ||
        availableAuthorizationTemplateIds.has(templateId) ||
        tmallTrafficTemplateIds.has(templateId)
      )
    );
    setContractCodeUnlocked(false);
    const nextPddShopNameParts =
      templateId === "pdd-auth"
        ? parsePddShopNameParts(defaults.shopName || "")
        : defaultPddShopNameParts;
    pddShopNamePartsRef.current = nextPddShopNameParts;
    setPddShopNameParts(nextPddShopNameParts);
    lastPddTradeNameCompanyRef.current = "";
    setMessage("已恢复当前模板默认内容");
  }

  function toggleContractCodeUnlocked(checked) {
    setContractCodeUnlocked(checked);

    if (!checked) {
      setValues((current) => ({
        ...current,
        contractCode: defaults.contractCode || current.contractCode || ""
      }));
    }
  }

  function isFieldLocked(field) {
    return (
      field.key === "contractCode" &&
      lockedContractCodeTemplates.has(templateId) &&
      !contractCodeUnlocked
    );
  }

  function canFillToday(field) {
    return todayFillFieldsByTemplate[templateId]?.has(field.key) || false;
  }

  function canFillPostalCode(field) {
    return templateId === "telecom" && field.key === "noticeBPostalCode";
  }

  function buildTodayFieldUpdates(fieldKey, today = getLocalToday()) {
    if (
      (availableAuthorizationTemplateIds.has(templateId) || templateId === "tmall-brand-authorization") &&
      fieldKey === "validityTerm"
    ) {
      return {
        [fieldKey]: jdAuthorizationTemplateIds.has(templateId)
          ? formatJdAuthorizationValidityTerm(today)
          : douyinAuthorizationTemplateIds.has(templateId)
          ? formatDouyinAuthorizationValidityTerm(today)
          : formatAuthorizationValidityTerm(today)
      };
    }

    if (templateId === "telecom" && telecomSigningDateFields.has(fieldKey)) {
      return {
        signYear: String(today.getFullYear()),
        signMonth: String(today.getMonth() + 1),
        signDay: String(today.getDate())
      };
    }

    if (fieldKey === "contractTerm") {
      const contractTermByTemplate = {
        mobile: formatMobileContractTerm,
        unicom: formatUnicomContractTerm,
        telecom: formatTelecomContractTerm,
        broadcast: formatBroadcastContractTerm,
        "pdd-auth": formatAuthorizationValidityTerm,
        "tmall-auth": formatAuthorizationValidityTerm,
        "douyin-telecom-auth": formatDouyinAuthorizationValidityTerm,
        "douyin-mobile-auth": formatDouyinAuthorizationValidityTerm,
        "douyin-unicom-auth": formatDouyinAuthorizationValidityTerm,
        "jd-telecom-auth": formatJdAuthorizationValidityTerm,
        "jd-mobile-auth": formatJdAuthorizationValidityTerm,
        "jd-unicom-auth": formatJdAuthorizationValidityTerm
      };
      return {
        [fieldKey]: contractTermByTemplate[templateId]?.(today) || formatChineseDate(today)
      };
    }

    if (fieldKey === "titleDate") {
      return {
        [fieldKey]: templateId === "mobile" ? formatSpacedChineseYearMonth(today) : formatChineseYearMonth(today)
      };
    }

    return {
      [fieldKey]: jdAuthorizationTemplateIds.has(templateId)
        ? formatDotDate(today)
        : douyinAuthorizationTemplateIds.has(templateId)
        ? formatZeroPaddedChineseDate(today)
        : formatChineseDate(today)
    };
  }

  function getBulkPasteTodayUpdates(availableKeys) {
    const fillableKeys = todayFillFieldsByTemplate[templateId] || new Set();
    const today = getLocalToday();

    return [...fillableKeys].reduce((updates, fieldKey) => {
      if (!availableKeys.has(fieldKey)) {
        return updates;
      }

      return {
        ...updates,
        ...buildTodayFieldUpdates(fieldKey, today)
      };
    }, {});
  }

  async function fillPostalCodeFromAddress() {
    const address = values.partyBAddress || "";
    const localPostalCode = inferPostalCode(address);

    if (localPostalCode) {
      updateValue("noticeBPostalCode", localPostalCode);
      setMessage(`已根据乙方地址填入邮编 ${localPostalCode}`);
      return;
    }

    if (!address.trim()) {
      setMessage("请先填写乙方地址");
      return;
    }

    setPostalCodeLoading(true);
    setMessage("本地规则未匹配到邮编，正在通过硅基流动查询...");

    try {
      const postalCode = await lookupPostalCode(address);

      if (!postalCode) {
        setMessage("未能根据乙方地址匹配邮编，请手动填写");
        return;
      }

      updateValue("noticeBPostalCode", postalCode);
      setMessage(`已通过硅基流动填入邮编 ${postalCode}`);
    } catch (error) {
      setMessage(error.message || "未能根据乙方地址匹配邮编，请手动填写");
    } finally {
      setPostalCodeLoading(false);
    }
  }

  function fillFieldsFromBulkInfo(text, emptyMessage = "请先粘贴要识别的内容") {
    if (!text.trim()) {
      setMessage(emptyMessage);
      return;
    }

    const fields = groups.flatMap((group) => group.fields);
    const availableKeys = new Set(fields.map((field) => field.key));
    const recognizedUpdates = parseAutoFillContent(text, fields);
    const parsedInfo = parseBulkPartyInfo(text);
    const updates = Object.fromEntries(
      Object.entries(bulkFillFieldMap)
        .filter(([fieldKey, infoKey]) => availableKeys.has(fieldKey) && parsedInfo[infoKey])
        .map(([fieldKey, infoKey]) => [fieldKey, parsedInfo[infoKey]])
    );
    const dateUpdates = getBulkPasteTodayUpdates(availableKeys);
    const automaticDateUpdates = Object.fromEntries(
      Object.entries(dateUpdates).filter(([fieldKey]) => !recognizedUpdates[fieldKey])
    );
    const nextUpdates = { ...updates, ...recognizedUpdates, ...automaticDateUpdates };

    if (Object.keys(nextUpdates).length === 0) {
      setMessage("未识别到当前合同可填充的内容");
      return;
    }

    setValues((current) => ({ ...current, ...nextUpdates }));
    setMessage(`已识别并填充 ${Object.keys(nextUpdates).length} 个字段`);
  }

  function applyBulkPaste() {
    fillFieldsFromBulkInfo(bulkPasteText);
  }

  function handleBulkPaste(event) {
    const pastedText = event.clipboardData.getData("text");

    if (!pastedText.trim()) {
      return;
    }

    setTimeout(() => fillFieldsFromBulkInfo(pastedText, "请先粘贴要识别的内容"), 0);
  }

  function updateCustomReplacement(index, key, value) {
    setCustomReplacements((items) =>
      items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item))
    );
  }

  function addCustomReplacement() {
    setCustomReplacements((items) => [...items, { ...emptyCustomReplacement }]);
  }

  function removeCustomReplacement(index) {
    setCustomReplacements((items) =>
      items.length === 1 ? [{ ...emptyCustomReplacement }] : items.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  async function generateContract(event) {
    event.preventDefault();
    setGenerating(true);
    setMessage("");

    try {
      const response = await fetch("/api/contracts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          templateId,
          values,
          options: { keepBrackets },
          customReplacements: customReplacements.filter((item) => item.find.trim())
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "生成失败");
      }

      const blob = await response.blob();
      downloadBlob(blob, fileNameFromDisposition(response.headers.get("Content-Disposition")));
      setMessage(
        mongoConnected
          ? `${documentKind}已生成 Word 并保存历史记录`
          : `${documentKind}已生成 Word，MongoDB 未连接所以未保存历史记录`
      );
      await loadRecords();
    } catch (error) {
      setMessage(error.message || "生成失败");
    } finally {
      setGenerating(false);
    }
  }

  async function deleteHistoryRecord(record) {
    if (!record || deletingHistoryId) {
      return;
    }

    const recordName = record.values?.partyBName || record.templateName || "这条历史记录";
    const confirmed = window.confirm(`确定删除“${recordName}”的下载历史吗？`);

    if (!confirmed) {
      return;
    }

    setDeletingHistoryId(record.id);
    setMessage("");

    try {
      await deleteGenerationRecord(record.id);
      await loadRecords();
      setMessage("已删除下载历史");
    } catch (error) {
      setMessage(error.message || "删除下载历史失败");
    } finally {
      setDeletingHistoryId("");
    }
  }

  function fillHistoryRecord(record) {
    if (!record?.values) {
      setMessage("这条历史记录没有可填入的字段");
      return;
    }

    const currentFieldKeys = new Set(groups.flatMap((group) => group.fields.map((field) => field.key)));
    const matchingValues = Object.fromEntries(
      Object.entries(record.values).filter(([key]) => currentFieldKeys.has(key))
    );

    if (Object.keys(matchingValues).length === 0) {
      setMessage("这条历史记录与当前页面没有匹配字段");
      return;
    }

    setValues((current) => ({ ...current, ...matchingValues }));

    if (typeof record.options?.keepBrackets === "boolean") {
      setKeepBrackets(record.options.keepBrackets);
    }

    if (templateId === "pdd-auth" && typeof matchingValues.shopName === "string") {
      const nextParts = parsePddShopNameParts(matchingValues.shopName);
      pddShopNamePartsRef.current = nextParts;
      setPddShopNameParts(nextParts);
    }

    setMessage("已将历史记录填入当前页面");
  }

  async function downloadHistoryRecord(record) {
    if (!record || downloadingHistory) {
      return;
    }

    const downloadKey = `${record.id}-docx`;
    setDownloadingHistory(downloadKey);
    setMessage("");

    try {
      const response = await fetch(`/api/contracts/${record.id}/download`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "下载失败");
      }

      const blob = await response.blob();
      downloadBlob(blob, fileNameFromDisposition(response.headers.get("Content-Disposition")));
      setMessage("已下载 Word");
    } catch (error) {
      setMessage(error.message || "下载失败");
    } finally {
      setDownloadingHistory("");
    }
  }

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />;
  }

  if (loading && !(activeSection === "authorization" && activeAuthId?.startsWith("qr-"))) {
    return (
      <main className="loading-screen">
        <Loader2 className="spin" size={28} />
        <span>正在加载文档字段</span>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <Sidebar
        activeSection={activeSection}
        activeTemplateId={templateId}
        activeContractGroup={activeContractGroup}
        activeEmailScreenshotId={activeEmailScreenshotId}
        activeAuthId={activeAuthId}
        onSelectContract={selectContract}
        onSelectAuthorization={selectAuthorization}
        onSelectAuthorizationNotice={selectAuthorizationNotice}
        onSelectSignatureAssets={selectSignatureAssets}
        onSelectTrademarks={selectTrademarks}
        onSelectCompanyLookup={selectCompanyLookup}
        onSelectEmail={selectEmail}
        onSelectEmailScreenshot={selectEmailScreenshot}
        onSelectTmallTraffic={selectTmallTraffic}
        onSelectRecords={selectRecords}
        onLogout={logout}
      />

      {activeSection === "companyLookup" ? (
        <section className="content-panel content-panel-single">
          <CompanyLookupPage />
        </section>
      ) : activeSection === "authorizationNotice" ? (
        <section className="content-panel content-panel-single">
          <AuthorizationNoticePage />
        </section>
      ) : activeSection === "signatureAssets" ? (
        <section className="content-panel content-panel-single">
          <SignatureAssetsPage />
        </section>
      ) : activeSection === "trademarks" ? (
        <section className="content-panel content-panel-single">
          <TrademarksPage />
        </section>
      ) : activeSection === "email" ? (
        <section className="content-panel content-panel-single">
          <EmailPage />
        </section>
      ) : activeSection === "emailScreenshot" ? (
        <section className="content-panel content-panel-single">
          <EmailScreenshotPage activeScreenshotId={activeEmailScreenshotId} />
        </section>
      ) : activeSection === "records" ? (
        <section className="content-panel content-panel-single">
          <GenerationRecordsPage />
        </section>
      ) : activeSection === "authorization" && activeAuthId?.startsWith("qr-") ? (
        <section className="content-panel content-panel-single">
          <QrAuthorization activeAuthId={activeAuthId} />
        </section>
      ) : activeSection === "authorization" && !canEditActiveAuthorization ? (
        <section className="content-panel">
          <AuthorizationPlaceholder activeAuthId={activeAuthId} />
        </section>
      ) : (
        <section className="content-panel">
          <section className="editor-panel">
            <header className="topbar">
              <div>
                <div className="eyebrow">{documentKind} / {selectedTemplate?.name}</div>
                <h1>{selectedTemplate?.title || "文档下载工具"}</h1>
              </div>
              <div className="topbar-actions">
                <button type="button" className="icon-button" onClick={resetValues} title="恢复默认">
                  <RotateCcw size={18} />
                </button>
                <button type="button" className="icon-button" onClick={loadRecords} title="刷新历史">
                  <RefreshCw size={18} />
                </button>
              </div>
            </header>

            <form onSubmit={generateContract} className="contract-form">
              <div className="summary-row">
                <div>
                  <strong>{changedCount}</strong>
                  <span>处字段修改</span>
                </div>
                <div className="summary-controls">
                  {hasBracketedFields && (
                    <label className="switch-row">
                      <input
                        type="checkbox"
                        checked={keepBrackets}
                        onChange={(event) => setKeepBrackets(event.target.checked)}
                      />
                      <span>保留方括号</span>
                    </label>
                  )}
                </div>
              </div>

              {groups.length > 0 && (
                <section className="field-group bulk-paste-panel">
                  <div className="group-heading">
                    <h2>内容自动识别填充</h2>
                    <div className="paste-actions">
                      <button type="button" className="text-button" onClick={applyBulkPaste}>
                        <ClipboardPaste size={16} />
                        识别并填充
                      </button>
                      <button type="button" className="icon-button" onClick={() => setBulkPasteText("")} title="清空">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                  <textarea
                    className="bulk-paste-textarea"
                    value={bulkPasteText}
                    onChange={(event) => setBulkPasteText(event.target.value)}
                    onPaste={handleBulkPaste}
                    placeholder="粘贴需要填入的公司、店铺、联系人或证明内容"
                  />
                </section>
              )}

              {groups.map((group) => (
                <section className="field-group" key={group.id}>
                  <div className="group-heading">
                    <h2>{group.title}</h2>
                    {lockedContractCodeTemplates.has(templateId) &&
                      group.fields.some((field) => field.key === "contractCode") && (
                      <label className="switch-row">
                        <input
                          type="checkbox"
                          checked={contractCodeUnlocked}
                          onChange={(event) => toggleContractCodeUnlocked(event.target.checked)}
                        />
                        <span>修改合同编号</span>
                      </label>
                    )}
                  </div>
                  <div className="field-grid">
                    {group.fields.map((field) => {
                      const fieldId = `field-${templateId}-${field.key}`;
                      const showTodayButton = canFillToday(field);
                      const showPostalCodeButton = canFillPostalCode(field);
                      const isPddPartyNameField = templateId === "pdd-auth" && field.key === "partyBName";
                      const isPddShopNameField = templateId === "pdd-auth" && field.key === "shopName";
                      const fieldControl = field.multiline ? (
                        <textarea
                          id={fieldId}
                          value={values[field.key] || ""}
                          disabled={isFieldLocked(field)}
                          onChange={(event) => updateValue(field.key, event.target.value)}
                        />
                      ) : (
                        <input
                          id={fieldId}
                          value={values[field.key] || ""}
                          inputMode={field.inputMode || "text"}
                          disabled={isFieldLocked(field)}
                          onChange={(event) =>
                            isPddShopNameField
                              ? updatePddShopName(event.target.value)
                              : updateValue(field.key, event.target.value)
                          }
                          onBlur={isPddPartyNameField ? () => refreshPddTradeName() : undefined}
                        />
                      );

                      return (
                        <div className={field.multiline ? "field field-wide" : "field"} key={field.key}>
                          {isPddShopNameField && (
                            <div className="pdd-shop-name-builder">
                              <label>
                                <span>企业字号</span>
                                <div className="field-control-row">
                                  <input
                                    value={pddShopNameParts.tradeName}
                                    onChange={(event) => updatePddShopNameParts({ tradeName: event.target.value })}
                                    placeholder="自动获取"
                                  />
                                  <button
                                    type="button"
                                    className="icon-button"
                                    onClick={() => refreshPddTradeName(true)}
                                    disabled={pddTradeNameLoading}
                                    title="获取企业字号"
                                    aria-label="获取企业字号"
                                  >
                                    {pddTradeNameLoading ? (
                                      <Loader2 className="spin" size={17} />
                                    ) : (
                                      <RefreshCw size={17} />
                                    )}
                                  </button>
                                </div>
                              </label>
                              <label>
                                <span>类目词</span>
                                <select
                                  value={pddShopNameParts.category}
                                  onChange={(event) => updatePddShopNameParts({ category: event.target.value })}
                                >
                                  {pddShopNameCategoryOptions.map((item) => (
                                    <option value={item} key={item}>{item}</option>
                                  ))}
                                </select>
                              </label>
                              <label>
                                <span>店铺类型</span>
                                <select
                                  value={pddShopNameParts.storeType}
                                  onChange={(event) => updatePddShopNameParts({ storeType: event.target.value })}
                                >
                                  {pddShopNameStoreTypeOptions.map((item) => (
                                    <option value={item} key={item}>{item}</option>
                                  ))}
                                </select>
                              </label>
                            </div>
                          )}
                          <label htmlFor={fieldId}>{field.label}</label>
                          {showTodayButton || showPostalCodeButton ? (
                            <div className="field-control-row">
                              {fieldControl}
                              {showTodayButton && (
                                <DatePickerButton
                                  fieldLabel={field.label}
                                  value={values[field.key]}
                                  onChange={(date) =>
                                    setValues((current) => ({
                                      ...current,
                                      ...buildTodayFieldUpdates(field.key, date)
                                    }))
                                  }
                                />
                              )}
                              {showPostalCodeButton && (
                                <button
                                  type="button"
                                  className="icon-button"
                                  onClick={fillPostalCodeFromAddress}
                                  disabled={postalCodeLoading}
                                  title="根据乙方地址填入邮编"
                                  aria-label="根据乙方地址填入邮编"
                                >
                                  {postalCodeLoading ? <Loader2 className="spin" size={17} /> : <MapPin size={17} />}
                                </button>
                              )}
                            </div>
                          ) : (
                            fieldControl
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}

              <section className="field-group">
                <div className="group-heading">
                  <h2>自定义查找替换</h2>
                  <button type="button" className="text-button" onClick={addCustomReplacement}>
                    <Plus size={16} />
                    新增
                  </button>
                </div>
                <div className="replacement-list">
                  {customReplacements.map((item, index) => (
                    <div className="replacement-row" key={index}>
                      <input
                        placeholder="原文"
                        value={item.find}
                        onChange={(event) => updateCustomReplacement(index, "find", event.target.value)}
                      />
                      <input
                        placeholder="替换为"
                        value={item.replacement}
                        onChange={(event) => updateCustomReplacement(index, "replacement", event.target.value)}
                      />
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => removeCustomReplacement(index)}
                        title="删除"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {message && <div className="message-line">{message}</div>}

              <button className="primary-button" type="submit" disabled={generating || switchingTemplate}>
                {generating ? <Loader2 className="spin" size={18} /> : <Download size={18} />}
                生成并下载 Word
              </button>
            </form>
          </section>

          <aside className="history-panel">
            <div className="history-title">
              <FileClock size={20} />
              <div>
                <h2>下载历史</h2>
                <span>{mongoConnected ? "MongoDB 已连接" : "MongoDB 未连接"}</span>
              </div>
            </div>

            <div className="history-list">
              {records.length === 0 ? (
                <div className="empty-state">
                  <FileText size={28} />
                  <span>暂无历史记录</span>
                </div>
              ) : (
                records.map((record) => (
                  <div className="history-item" key={record.id}>
                    <div className="history-record-main">
                      <div>
                        <strong>{record.values?.partyBName || record.templateName || "合同"}</strong>
                        <span>
                          {record.templateName || record.title} · {formatTime(record.createdAt)} ·{" "}
                          {record.replacementCount || 0} 处替换
                        </span>
                      </div>
                      <div className="history-download-actions">
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => fillHistoryRecord(record)}
                          title="填入当前页面"
                        >
                          填入
                        </button>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => downloadHistoryRecord(record)}
                          disabled={Boolean(downloadingHistory)}
                          title="下载 Word"
                        >
                          {downloadingHistory === `${record.id}-docx` ? (
                            <Loader2 className="spin" size={16} />
                          ) : (
                            <FileText size={16} />
                          )}
                          Word
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="icon-button history-delete-button"
                      onClick={() => deleteHistoryRecord(record)}
                      disabled={deletingHistoryId === record.id}
                      title="删除历史"
                      aria-label="删除历史"
                    >
                      {deletingHistoryId === record.id ? (
                        <Loader2 className="spin" size={17} />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </aside>
        </section>
      )}
    </main>
  );
}
