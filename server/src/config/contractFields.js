function createDouyinAuthorizationTemplate({
  id,
  name,
  fileName,
  authorizationCompany,
  brandName,
  brandFind,
  trademarkNo,
  authorizedCompany,
  validityTerm,
  signDate
}) {
  return {
    id,
    name,
    title: "授权书",
    outputName: name,
    fileName,
    keepBracketsDefault: false,
    groups: [
      {
        id: "brand",
        title: "授权品牌信息",
        fields: [
          {
            key: "authorizationCompany",
            label: "授权方",
            defaultValue: authorizationCompany,
            targets: [{ find: authorizationCompany, kind: "plain" }]
          },
          {
            key: "brandName",
            label: "授权品牌",
            defaultValue: brandName,
            targets: [{ find: brandFind, kind: "plain", prefix: " ", suffix: " " }]
          },
          {
            key: "trademarkNo",
            label: "商标注册证号/申请号",
            defaultValue: trademarkNo,
            targets: [{ find: trademarkNo, kind: "plain" }]
          }
        ]
      },
      {
        id: "merchant",
        title: "被授权公司",
        fields: [
          {
            key: "partyBName",
            label: "被授权公司名称",
            defaultValue: authorizedCompany,
            targets: [{ find: ` ${authorizedCompany} `, kind: "plain", prefix: " ", suffix: " " }]
          }
        ]
      },
      {
        id: "authorization",
        title: "授权期限",
        fields: [
          {
            key: "validityTerm",
            label: "授权期间",
            defaultValue: validityTerm,
            targets: [{ find: validityTerm, kind: "plain" }]
          },
          {
            key: "signDate",
            label: "授权日期",
            defaultValue: signDate,
            targets: [{ find: `授权日期：${signDate}`, kind: "plain", prefix: "授权日期：" }]
          }
        ]
      }
    ]
  };
}

function createJdAuthorizationTemplate({
  id,
  name,
  fileName,
  authorizedCompany,
  authorizationCompany,
  authorizedProducts,
  validityTerm,
  signDate
}) {
  return {
    id,
    name,
    title: "网上销售授权书",
    outputName: name,
    fileName,
    keepBracketsDefault: false,
    groups: [
      {
        id: "merchant",
        title: "授权信息",
        fields: [
          {
            key: "partyBName",
            label: "被授权公司名称",
            defaultValue: authorizedCompany,
            targets: [{ find: authorizedCompany, kind: "plain" }]
          },
          {
            key: "authorizationCompany",
            label: "授权方",
            defaultValue: authorizationCompany,
            targets: [{ find: authorizationCompany, kind: "plain" }]
          },
          {
            key: "authorizedProducts",
            label: "授权产品",
            defaultValue: authorizedProducts,
            multiline: true,
            targets: [{ find: `“${authorizedProducts}”`, kind: "plain", prefix: "“", suffix: "”" }]
          }
        ]
      },
      {
        id: "authorization",
        title: "授权期限",
        fields: [
          {
            key: "validityTerm",
            label: "授权期限",
            defaultValue: validityTerm,
            targets: [{ find: validityTerm, kind: "plain" }]
          },
          {
            key: "signDate",
            label: "盖章时间",
            defaultValue: signDate,
            targets: [{ find: signDate, kind: "plain" }]
          }
        ]
      }
    ]
  };
}

export const contractTemplates = [
  {
    id: "telecom",
    name: "电信合同",
    title: "电信渠道代理合同",
    outputName: "电信渠道代理合同",
    fileName: "telecom-contract.docx",
    keepBracketsDefault: true,
    groups: [
      {
        id: "parties",
        title: "合同主体",
        fields: [
          {
            key: "partyBName",
            label: "乙方名称",
            defaultValue: "上海仁视网络科技有限公司",
            targets: [
              { find: "[上海仁视网络科技有限公司]", kind: "bracketed" },
              { find: "上海仁视网络科技有限公司", kind: "plain" }
            ]
          },
          {
            key: "partyAName",
            label: "甲方名称",
            defaultValue: "中国电信股份有限公司山东分公司",
            targets: [
              { find: "[中国电信股份有限公司山东分公司]", kind: "bracketed" },
              { find: "中国电信股份有限公司山东分公司", kind: "plain" }
            ]
          },
          {
            key: "partyAAddress",
            label: "甲方地址",
            defaultValue: "济南高新区舜华路 1999 号",
            targets: [{ find: "[济南高新区舜华路 1999 号]", kind: "bracketed" }]
          },
          {
            key: "partyALegalRep",
            label: "甲方负责人",
            defaultValue: "文勇",
            targets: [{ find: "[文勇]", kind: "bracketed" }]
          },
          {
            key: "partyBAddress",
            label: "乙方地址",
            defaultValue: "上海市闵行区宜山路1718号、1728号3幢402室",
            targets: [{ find: "[上海市闵行区宜山路1718号、1728号3幢402室]", kind: "bracketed" }]
          },
          {
            key: "partyBLegalRep",
            label: "乙方负责人",
            defaultValue: "胡彬",
            targets: [{ find: "[胡彬]", kind: "bracketed" }]
          }
        ]
      },
      {
        id: "term",
        title: "期限与签署日期",
        fields: [
          {
            key: "contractTerm",
            label: "代理期限",
            defaultValue: "本协议期限自 2026 年 6 月 30 日起至 2027年 6 月 29 日止",
            multiline: true,
            targets: [
              {
                find: " 2026 年 6 月 30 日起至 2027年 6 月 29 日止",
                kind: "plain",
                valueTransform: "telecomContractTermRange"
              }
            ]
          },
          {
            key: "signYear",
            label: "签署年份",
            defaultValue: "2026",
            inputMode: "numeric",
            targets: [{ find: "[2026]", kind: "bracketed" }]
          },
          {
            key: "signMonth",
            label: "签署月份",
            defaultValue: "6",
            inputMode: "numeric",
            targets: [{ find: "[6]", kind: "bracketed" }]
          },
          {
            key: "signDay",
            label: "签署日期",
            defaultValue: "30",
            inputMode: "numeric",
            targets: [{ find: "[30]", kind: "bracketed" }]
          }
        ]
      },
      {
        id: "noticeA",
        title: "甲方通知信息",
        fields: [
          {
            key: "noticeAAddress",
            label: "通知地址",
            defaultValue: "济南市高新区舜泰北路 933 号",
            targets: [{ find: "[济南市高新区舜泰北路 933 号]", kind: "bracketed" }]
          },
          {
            key: "noticeAContact",
            label: "联系人",
            defaultValue: "孙晓霞",
            targets: [{ find: "[孙晓霞]", kind: "bracketed" }]
          },
          {
            key: "noticeAPhone",
            label: "电话",
            defaultValue: "18905459347",
            inputMode: "tel",
            targets: [{ find: "[18905459347]", kind: "bracketed" }]
          },
          {
            key: "noticeAPostalCode",
            label: "邮编",
            defaultValue: "250000",
            inputMode: "numeric",
            targets: [{ find: "[250000]", kind: "bracketed" }]
          },
          {
            key: "noticeAEmail",
            label: "电子邮件",
            defaultValue: "sunxiaoxia.sd@chinatelecom.cn",
            inputMode: "email",
            targets: [{ find: "[sunxiaoxia.sd@chinatelecom.cn]", kind: "bracketed" }]
          }
        ]
      },
      {
        id: "noticeB",
        title: "乙方通知信息",
        fields: [
          {
            key: "noticeBPhone",
            label: "电话",
            defaultValue: "13755664019",
            inputMode: "tel",
            targets: [{ find: "[13755664019]", kind: "bracketed" }]
          },
          {
            key: "noticeBPostalCode",
            label: "邮编",
            defaultValue: "201103",
            inputMode: "numeric",
            targets: [{ find: "[201103]", kind: "bracketed" }]
          },
          {
            key: "noticeBEmail",
            label: "电子邮件",
            defaultValue: "xialu@zensvision.com",
            inputMode: "email",
            targets: [{ find: "[xialu@zensvision.com]", kind: "bracketed" }]
          }
        ]
      }
    ]
  },
  {
    id: "mobile",
    name: "移动合同",
    title: "山东移动业务代理协议",
    outputName: "移动业务代理协议",
    fileName: "mobile-contract.docx",
    keepBracketsDefault: false,
    groups: [
      {
        id: "basic",
        title: "协议基础信息",
        fields: [
          {
            key: "contractCode",
            label: "合同编号",
            defaultValue: "CMHA-202602209",
            targets: [{ find: "CMHA-202602209", kind: "plain" }]
          },
          {
            key: "titleDate",
            label: "标题年月",
            defaultValue: "2026 年 5 月",
            targets: [
              {
                find: "2026年5月",
                kind: "plain",
                occurrence: 1
              }
            ]
          },
          {
            key: "contractTerm",
            label: "协议有效期",
            defaultValue: "本协议有效期从2026 年 5 月 24 日起至 2027 年 5 月 23 日止。",
            multiline: true,
            targets: [
              {
                find: "2026 年 5 月 24 日起至 2027 年 5 月 23 日止",
                kind: "plain",
                valueTransform: "mobileContractTermRange"
              }
            ]
          },
          {
            key: "signDate",
            label: "签署日期",
            defaultValue: "2026年5月24日",
            inputMode: "text",
            targets: [{ find: "日期：2026年5月24日", kind: "plain", prefix: "日期：" }]
          }
        ]
      },
      {
        id: "parties",
        title: "合同主体",
        fields: [
          {
            key: "partyAName",
            label: "甲方名称",
            defaultValue: "中国移动通信集团山东有限公司",
            targets: [{ find: "中国移动通信集团山东有限公司", kind: "plain" }]
          },
          {
            key: "partyAAddress",
            label: "甲方地址",
            defaultValue: "山东省济南市市中区经十路20569号",
            targets: [{ find: "山东省济南市市中区经十路20569号", kind: "plain" }]
          },
          {
            key: "partyALegalRep",
            label: "甲方负责人",
            defaultValue: "朱汉武",
            targets: [{ find: "朱汉武", kind: "plain" }]
          },
          {
            key: "partyBName",
            label: "乙方名称",
            defaultValue: "河南烨岩信息技术有限公司",
            targets: [{ find: "河南烨岩信息技术有限公司", kind: "plain" }]
          },
          {
            key: "partyBAddress",
            label: "乙方地址",
            defaultValue: "河南省郑州市郑东新区十里铺街道白庄社区12号楼1单元8楼802号",
            targets: [{ find: "河南省郑州市郑东新区十里铺街道白庄社区12号楼1单元8楼802号", kind: "plain" }]
          },
          {
            key: "partyBLegalRep",
            label: "乙方负责人",
            defaultValue: "宗礼鹏",
            targets: [{ find: "宗礼鹏", kind: "plain" }]
          },
          {
            key: "partyBPhone",
            label: "乙方电话",
            defaultValue: "19254308960",
            inputMode: "tel",
            targets: [{ find: "19254308960", kind: "plain" }]
          }
        ]
      },
      {
        id: "bank",
        title: "银行与税务信息",
        fields: [
          {
            key: "partyABank",
            label: "甲方开户行",
            defaultValue: "济南市工行经二路支行",
            targets: [{ find: "济南市工行经二路支行", kind: "plain" }]
          },
          {
            key: "partyAAccount",
            label: "甲方账号",
            defaultValue: "1602001009005409271",
            inputMode: "numeric",
            targets: [{ find: "1602001009005409271", kind: "plain" }]
          },
          {
            key: "partyATaxNo",
            label: "甲方纳税人识别号",
            defaultValue: "9137000072495538X6",
            targets: [{ find: "9137000072495538X6", kind: "plain" }]
          },
          {
            key: "partyABankPhone",
            label: "甲方银行电话",
            defaultValue: "13655441888",
            inputMode: "tel",
            targets: [{ find: "13655441888", kind: "plain" }]
          },
          {
            key: "partyBBank",
            label: "乙方开户行",
            defaultValue: "中国银行股份有限公司郑州汇城支行",
            targets: [{ find: "中国银行股份有限公司郑州汇城支行", kind: "plain" }]
          },
          {
            key: "partyBAccount",
            label: "乙方账号",
            defaultValue: "259886266387",
            inputMode: "numeric",
            targets: [{ find: "259886266387", kind: "plain" }]
          },
          {
            key: "partyBTaxNo",
            label: "乙方纳税人识别号",
            defaultValue: "91410105MA9MYELG1K",
            targets: [{ find: "91410105MA9MYELG1K", kind: "plain" }]
          }
        ]
      }
    ]
  },
  {
    id: "unicom",
    name: "联通合同",
    title: "中国联通通信业务代理协议",
    outputName: "联通通信业务代理协议",
    fileName: "unicom-contract.docx",
    keepBracketsDefault: true,
    groups: [
      {
        id: "basic",
        title: "协议基础信息",
        fields: [
          {
            key: "contractCode",
            label: "合同编号",
            defaultValue: "CU12- 1101-2026-029750",
            targets: [{ find: "CU12- 1101-2026-029750", kind: "plain" }]
          },
          {
            key: "contractTerm",
            label: "协议期限",
            defaultValue: "本协议履行期限从2026年5月24日至2027年5月23日止",
            multiline: true,
            targets: [
              {
                find: "[本协议履行期限从2026年5月24日至2027年5月23日止]",
                kind: "bracketed"
              }
            ]
          },
          {
            key: "signDate",
            label: "签署日期",
            defaultValue: "2026年5月24日",
            inputMode: "text",
            targets: [{ find: "签署日期：2026年5月24日", kind: "plain", prefix: "签署日期：" }]
          }
        ]
      },
      {
        id: "parties",
        title: "合同主体",
        fields: [
          {
            key: "partyAName",
            label: "甲方名称",
            defaultValue: "中国联合网络通信有限公司广东省分公司",
            targets: [{ find: "中国联合网络通信有限公司广东省分公司", kind: "plain" }]
          },
          {
            key: "partyBName",
            label: "乙方名称",
            defaultValue: "石禾影视传媒（苏州）有限公司",
            targets: [{ find: "石禾影视传媒（苏州）有限公司", kind: "plain" }]
          }
        ]
      },
      {
        id: "partyA",
        title: "甲方签署信息",
        fields: [
          {
            key: "partyABank",
            label: "开户银行",
            defaultValue: "中国建设银行广州天河支行",
            targets: [{ find: "中国建设银行广州天河支行", kind: "plain" }]
          },
          {
            key: "partyAAccount",
            label: "银行账号",
            defaultValue: "44001581301050304536",
            inputMode: "numeric",
            targets: [{ find: "44001581301050304536", kind: "plain" }]
          },
          {
            key: "partyAAddress",
            label: "通讯地址",
            defaultValue: "广州市天河区黄埔大道西666号联通新时空广场",
            targets: [{ find: "广州市天河区黄埔大道西666号联通新时空广场", kind: "plain" }]
          },
          {
            key: "partyAContact",
            label: "联系人",
            defaultValue: "李达升",
            targets: [{ find: "李达升", kind: "plain" }]
          },
          {
            key: "partyAPhone",
            label: "联系电话",
            defaultValue: "13415006581",
            inputMode: "tel",
            targets: [{ find: "13415006581", kind: "plain" }]
          }
        ]
      },
      {
        id: "partyB",
        title: "乙方签署信息",
        fields: [
          {
            key: "partyBBank",
            label: "开户银行",
            defaultValue: "招商银行股份有限公司苏州干将路支行",
            targets: [{ find: "招商银行股份有限公司苏州干将路支行", kind: "plain" }]
          },
          {
            key: "partyBAccount",
            label: "银行账号",
            defaultValue: "5129 1757 1910 000",
            targets: [{ find: "5129 1757 1910 000", kind: "plain" }]
          },
          {
            key: "partyBAddress",
            label: "通讯地址",
            defaultValue: "江苏省苏州市姑苏区清塘路333号虎阜花园西区79幢118室-30号",
            targets: [{ find: "江苏省苏州市姑苏区清塘路333号虎阜花园西区79幢118室-30号", kind: "plain" }]
          },
          {
            key: "partyBContact",
            label: "联系人",
            defaultValue: "张乐",
            targets: [{ find: "张乐", kind: "plain" }]
          },
          {
            key: "partyBPhone",
            label: "联系电话",
            defaultValue: "13295117989",
            inputMode: "tel",
            targets: [{ find: "13295117989", kind: "plain" }]
          }
        ]
      }
    ]
  },
  {
    id: "broadcast",
    name: "广电合同",
    title: "中国广电甘肃互联网渠道代理合作协议",
    outputName: "广电互联网渠道代理合作协议",
    fileName: "broadcast-contract.docx",
    keepBracketsDefault: false,
    groups: [
      {
        id: "term",
        title: "合同期限与签署日期",
        fields: [
          {
            key: "contractTerm",
            label: "合同有效期",
            defaultValue: "有效期 2026 年 4 月 9日至 2027 年 4 月 8日",
            multiline: true,
            targets: [{ find: "有效期 2026 年 4 月 9日至 2027 年 4 月 8日", kind: "plain" }]
          },
          {
            key: "signDate",
            label: "签署日期",
            defaultValue: "2026 年 4 月 9 日",
            inputMode: "text",
            targets: [{ find: "日 期：2026 年 4 月 9 日", kind: "plain", prefix: "日 期：" }]
          }
        ]
      },
      {
        id: "parties",
        title: "乙方主体信息",
        fields: [
          {
            key: "partyBName",
            label: "乙方名称",
            defaultValue: "义乌市立川网络科技有限责任公司",
            targets: [{ find: "义乌市立川网络科技有限责任公司", kind: "plain" }]
          },
          {
            key: "partyBAddress",
            label: "乙方地址",
            defaultValue: "浙江省金华市义乌市江东街道清溪东路31号4层805",
            targets: [{ find: "浙江省金华市义乌市江东街道清溪东路31号4层805", kind: "plain" }]
          },
          {
            key: "partyBLegalRep",
            label: "乙方负责人",
            defaultValue: "王少良",
            targets: [{ find: "王少良", kind: "plain" }]
          },
          {
            key: "partyBTaxNo",
            label: "统一社会信用代码",
            defaultValue: "91330782MAEPNU2C3L",
            targets: [{ find: "91330782MAEPNU2C3L", kind: "plain" }]
          },
          {
            key: "partyBBank",
            label: "开户行",
            defaultValue: "中国建设银行股份有限公司义乌分行营业部",
            targets: [{ find: "中国建设银行股份有限公司义乌分行营业部", kind: "plain" }]
          },
          {
            key: "partyBAccount",
            label: "账号",
            defaultValue: "33050167623500005229",
            inputMode: "numeric",
            targets: [{ find: "33050167623500005229", kind: "plain" }]
          },
          {
            key: "partyBPhone",
            label: "电话",
            defaultValue: "18867178989",
            inputMode: "tel",
            targets: [{ find: "18867178989", kind: "plain" }]
          }
        ]
      }
    ]
  },
  {
    id: "tmall-traffic-oa-email",
    name: "流量充值OA邮箱",
    title: "流量充值OA邮箱",
    outputName: "流量充值OA邮箱",
    fileName: "tmall-traffic-oa-email.docx",
    keepBracketsDefault: false,
    groups: [
      {
        id: "merchant",
        title: "天猫店铺信息",
        fields: [
          {
            key: "partyBName",
            label: "公司名称",
            defaultValue: "烟台据鼎商贸有限公司",
            targets: [
              {
                find: "【烟台据鼎商贸有限公司】",
                kind: "plain",
                prefix: "【",
                suffix: "】"
              }
            ]
          },
          {
            key: "shopName",
            label: "天猫店铺名称",
            defaultValue: "卓美通信专营店",
            targets: [
              {
                find: "【卓美通信专营店】",
                kind: "plain",
                prefix: "【",
                suffix: "】"
              },
              {
                find: "天猫店铺名称：卓美通信专营店",
                kind: "plain",
                prefix: "天猫店铺名称："
              }
            ]
          },
          {
            key: "sealCompanyName",
            label: "盖章公司名称",
            defaultValue: "",
            targets: [
              {
                find: "公司名称(加盖公章)：",
                kind: "plain",
                prefix: "公司名称(加盖公章)："
              }
            ]
          },
          {
            key: "signDate",
            label: "盖章日期",
            defaultValue: "",
            targets: [{ find: "日期：", kind: "plain", prefix: "日期：" }]
          }
        ]
      },
      {
        id: "telecomContact",
        title: "电信合作联系人",
        fields: [
          {
            key: "telecomContractName",
            label: "运营商合同文件名称",
            defaultValue: "中国电信股份有限公司吉林分公司与烟台据鼎商贸有限公司渠道代理合同",
            multiline: true,
            targets: [
              {
                find: "中国电信股份有限公司吉林分公司与烟台据鼎商贸有限公司渠道代理合同",
                kind: "plain"
              }
            ]
          },
          {
            key: "telecomOperatorName",
            label: "运营商名称",
            defaultValue: "吉林电信",
            targets: [{ find: "吉林电信", kind: "plain" }]
          },
          {
            key: "telecomContactName",
            label: "运营商联系人",
            defaultValue: "宋哲宇",
            targets: [{ find: "宋哲宇", kind: "plain" }]
          },
          {
            key: "telecomContactPhone",
            label: "联系人手机号码",
            defaultValue: "18904300470",
            inputMode: "tel",
            targets: [{ find: "18904300470", kind: "plain" }]
          },
          {
            key: "telecomContactEmail",
            label: "联系人官方OA邮箱",
            defaultValue: "songzheyu.jl@chinatelecom.cn",
            targets: [{ find: "songzheyu.jl@chinatelecom.cn", kind: "plain" }]
          }
        ]
      },
      {
        id: "unicomContact",
        title: "联通合作联系人",
        fields: [
          {
            key: "unicomContractName",
            label: "运营商合同文件名称",
            defaultValue: "中国联通业务代理协议",
            multiline: true,
            targets: [{ find: "中国联通业务代理协议", kind: "plain" }]
          },
          {
            key: "unicomOperatorName",
            label: "运营商名称",
            defaultValue: "河南联通",
            targets: [{ find: "河南联通", kind: "plain" }]
          },
          {
            key: "unicomContactName",
            label: "运营商联系人",
            defaultValue: "位可可",
            targets: [{ find: "位可可", kind: "plain" }]
          },
          {
            key: "unicomContactPhone",
            label: "联系人手机号码",
            defaultValue: "13037410040",
            inputMode: "tel",
            targets: [{ find: "13037410040", kind: "plain" }]
          },
          {
            key: "unicomContactEmail",
            label: "联系人官方OA邮箱",
            defaultValue: "weikk3@chinaunicom.cn",
            targets: [{ find: "weikk3@chinaunicom.cn", kind: "plain" }]
          }
        ]
      },
      {
        id: "mobileContact",
        title: "移动合作联系人",
        fields: [
          {
            key: "mobileContractName",
            label: "运营商合同文件名称",
            defaultValue: "河南移动外部互联网渠道业务代办合作协议",
            multiline: true,
            targets: [{ find: "河南移动外部互联网渠道业务代办合作协议", kind: "plain" }]
          },
          {
            key: "mobileOperatorName",
            label: "运营商名称",
            defaultValue: "河南移动",
            targets: [{ find: "河南移动", kind: "plain" }]
          },
          {
            key: "mobileContactName",
            label: "运营商联系人",
            defaultValue: "陈慧妍",
            targets: [{ find: "陈慧妍", kind: "plain" }]
          },
          {
            key: "mobileContactPhone",
            label: "联系人手机号码",
            defaultValue: "13804510052",
            inputMode: "tel",
            targets: [{ find: "13804510052", kind: "plain" }]
          },
          {
            key: "mobileContactEmail",
            label: "联系人官方OA邮箱",
            defaultValue: "chenhuiyan@hl.chinamobile.com",
            targets: [{ find: "chenhuiyan@hl.chinamobile.com", kind: "plain" }]
          }
        ]
      }
    ]
  },
  {
    id: "tmall-brand-authorization",
    name: "品牌授权书",
    title: "品牌授权书",
    outputName: "品牌授权书",
    fileName: "tmall-brand-authorization.docx",
    keepBracketsDefault: false,
    groups: [
      {
        id: "merchant",
        title: "商家与品牌信息",
        fields: [
          {
            key: "partyBName",
            label: "商家主体公司名称",
            defaultValue: "烟台据鼎商贸有限公司",
            targets: [{ find: "烟台据鼎商贸有限公司", kind: "plain" }]
          },
          {
            key: "shopName",
            label: "天猫商家店铺名称",
            defaultValue: "卓美通信专营店",
            targets: [{ find: "卓美通信专营店", kind: "plain" }]
          },
          {
            key: "trademarkNo",
            label: "商标号",
            defaultValue: "13137361",
            targets: [{ find: "13137361", kind: "plain" }]
          },
          {
            key: "brandName",
            label: "品牌名称",
            defaultValue: "中国移动",
            targets: [{ find: "中国移动", kind: "plain" }]
          },
          {
            key: "authorizedProducts",
            label: "授权产品",
            defaultValue: "号卡 流量包 充值宽带系列产品",
            multiline: true,
            targets: [{ find: "号卡 流量包 充值宽带系列产品", kind: "plain" }]
          }
        ]
      },
      {
        id: "validity",
        title: "授权期限与日期",
        fields: [
          {
            key: "validityTerm",
            label: "授权有效期",
            defaultValue: "2025年6月20日至2026年6月19日",
            targets: [{ find: "2025年6月20日至2026年6月19日", kind: "plain" }]
          },
          {
            key: "authorizationSignDate",
            label: "授权公司日期",
            defaultValue: "",
            targets: [{ find: "日期：", kind: "plain", prefix: "日期：", occurrence: 1 }]
          },
          {
            key: "authorizedSignDate",
            label: "被授权公司日期",
            defaultValue: "",
            targets: [{ find: "日期：", kind: "plain", prefix: "日期：", occurrence: 2 }]
          }
        ]
      }
    ]
  },
  {
    id: "tmall-business-development-proof",
    name: "业务发展证明函",
    title: "业务发展证明函",
    outputName: "业务发展证明函",
    fileName: "tmall-business-development-proof.docx",
    keepBracketsDefault: false,
    groups: [
      {
        id: "business",
        title: "业务发展信息",
        fields: [
          {
            key: "partyBName",
            label: "商家主体公司名称",
            defaultValue: "烟台据鼎商贸有限公司",
            targets: [{ find: "烟台据鼎商贸有限公司", kind: "plain" }]
          },
          {
            key: "authorizationCompany",
            label: "运营商公司名称",
            defaultValue: "中国移动通信集团河南有限公司",
            targets: [{ find: "中国移动通信集团河南有限公司", kind: "plain" }]
          },
          {
            key: "shopName",
            label: "天猫商家店铺名称",
            defaultValue: "卓美通信专营店",
            targets: [{ find: "卓美通信专营店", kind: "plain" }]
          },
          {
            key: "operatingMonths",
            label: "连续经营月数",
            defaultValue: "6",
            inputMode: "numeric",
            targets: [{ find: "最近最近6个月", kind: "plain", prefix: "最近最近", suffix: "个月" }]
          },
          {
            key: "monthlyTurnover",
            label: "单月成交额（万元）",
            defaultValue: "50",
            inputMode: "decimal",
            targets: [{ find: "单月成交额均超50万", kind: "plain", prefix: "单月成交额均超", suffix: "万" }]
          }
        ]
      },
      {
        id: "signing",
        title: "盖章日期",
        fields: [
          {
            key: "authorizationSignDate",
            label: "授权公司日期",
            defaultValue: "",
            targets: [{ find: "日期：", kind: "plain", prefix: "日期：", occurrence: 1 }]
          },
          {
            key: "authorizedSignDate",
            label: "被授权公司日期",
            defaultValue: "",
            targets: [{ find: "日期：", kind: "plain", prefix: "日期：", occurrence: 2 }]
          }
        ]
      }
    ]
  },
  {
    id: "tmall-employee-work-proof",
    name: "员工工作证明",
    title: "员工工作证明",
    outputName: "员工工作证明",
    fileName: "tmall-employee-work-proof.docx",
    keepBracketsDefault: false,
    groups: [
      {
        id: "employment",
        title: "员工信息",
        fields: [
          {
            key: "partyBName",
            label: "公司名称",
            defaultValue: "烟台据鼎商贸有限公司",
            targets: [{ find: "烟台据鼎商贸有限公司", kind: "plain" }]
          },
          {
            key: "employmentYear",
            label: "证明年份",
            defaultValue: "2025",
            inputMode: "numeric",
            targets: [{ find: "在2025年期间", kind: "plain", prefix: "在", suffix: "年期间" }]
          },
          {
            key: "totalEmployees",
            label: "固定员工总人数",
            defaultValue: "70",
            inputMode: "numeric",
            targets: [{ find: "固定员工70人", kind: "plain", prefix: "固定员工", suffix: "人" }]
          },
          {
            key: "customerServiceEmployees",
            label: "客服人数",
            defaultValue: "45",
            inputMode: "numeric",
            targets: [{ find: "其中客服45人", kind: "plain", prefix: "其中客服", suffix: "人" }]
          },
          {
            key: "operationsEmployees",
            label: "运营团队人数",
            defaultValue: "25",
            inputMode: "numeric",
            targets: [{ find: "运营团队25人", kind: "plain", prefix: "运营团队", suffix: "人" }]
          },
          {
            key: "signDate",
            label: "证明日期",
            defaultValue: "2025年6月19日",
            targets: [{ find: "2025年6月19日", kind: "plain" }]
          }
        ]
      }
    ]
  },
  {
    id: "pdd-auth",
    name: "拼多多授权书",
    title: "网络销售与实名制授权书",
    outputName: "拼多多授权书",
    fileName: "pdd-authorization.docx",
    keepBracketsDefault: false,
    groups: [
      {
        id: "merchant",
        title: "商家信息",
        fields: [
          {
            key: "partyBName",
            label: "商家主体公司名称",
            defaultValue: "衢州伟丽科技有限公司",
            targets: [{ find: "衢州伟丽科技有限公司", kind: "plain" }]
          },
          {
            key: "shopName",
            label: "拼多多店铺名称",
            defaultValue: "伟丽通信专营店",
            targets: [{ find: "伟丽通信专营店", kind: "plain" }]
          }
        ]
      },
      {
        id: "authorization",
        title: "授权内容",
        fields: [
          {
            key: "authorizedProducts",
            label: "授权产品",
            defaultValue: "新入网手机号码、4/3G上网资费卡、流量充值、话费充值、宽带",
            multiline: true,
            targets: [
              {
                find: "新入网手机号码、4/3G上网资费卡、流量充值、话费充值、宽带",
                kind: "plain"
              }
            ]
          },
          {
            key: "validityTerm",
            label: "声明函有效期",
            defaultValue: "2026年5月22日至2027年5月21日",
            targets: [{ find: "2026年5月22日至2027年5月21日", kind: "plain" }]
          },
          {
            key: "signDate",
            label: "盖章日期",
            defaultValue: "2026年5月22日",
            targets: [{ find: "日期:2026年5月22日", kind: "plain", prefix: "日期:" }]
          }
        ]
      }
    ]
  },
  {
    id: "tmall-auth",
    name: "天猫授权书",
    title: "网络销售与实名制授权书",
    outputName: "天猫授权书",
    fileName: "tmall-authorization.docx",
    keepBracketsDefault: false,
    groups: [
      {
        id: "merchant",
        title: "商家信息",
        fields: [
          {
            key: "partyBName",
            label: "商家主体公司名称",
            defaultValue: "烟台正裕电子科技有限公司",
            targets: [{ find: "烟台正裕电子科技有限公司", kind: "plain" }]
          },
          {
            key: "shopName",
            label: "天猫商家店铺名称",
            defaultValue: "正裕通信专营店",
            targets: [{ find: "正裕通信专营店", kind: "plain" }]
          }
        ]
      },
      {
        id: "authorization",
        title: "授权内容",
        fields: [
          {
            key: "authorizedProducts",
            label: "授权产品",
            defaultValue: "新入网的手机号卡、流量充值、宽带业务、融合业务",
            multiline: true,
            targets: [
              {
                find: "包括新入网的手机号卡、流量充值、宽带业务、融合业务等，",
                kind: "plain",
                prefix: "包括",
                suffix: "等，"
              }
            ]
          },
          {
            key: "validityTerm",
            label: "声明函有效期",
            defaultValue: "2026年5月27日至2027年5月26日",
            targets: [{ find: "2026年5月27日至2027年5月26日", kind: "plain" }]
          },
          {
            key: "signDate",
            label: "盖章日期",
            defaultValue: "2026年5月27日",
            targets: [{ find: "日  期：2026年5月27日", kind: "plain", prefix: "日  期：" }]
          }
        ]
      }
    ]
  },
  {
    id: "alipay-auth",
    name: "支付宝授权书",
    title: "网络销售与实名制授权书",
    outputName: "支付宝授权书",
    fileName: "alipay-authorization.docx",
    keepBracketsDefault: false,
    groups: [
      {
        id: "merchant",
        title: "商家信息",
        fields: [
          {
            key: "partyBName",
            label: "商家主体公司名称",
            defaultValue: "杭州云销卡科技有限公司",
            targets: [{ find: "杭州云销卡科技有限公司", kind: "plain" }]
          }
        ]
      },
      {
        id: "authorization",
        title: "授权内容",
        fields: [
          {
            key: "authorizedProducts",
            label: "授权产品",
            defaultValue: "话费充值、流量充值",
            multiline: true,
            targets: [{ find: "话费充值、流量充值", kind: "plain" }]
          },
          {
            key: "validityTerm",
            label: "声明函有效期",
            defaultValue: "2026年5月22日至2027年5月21日",
            targets: [{ find: "2026年5月22日至2027年5月21日", kind: "plain" }]
          },
          {
            key: "signDate",
            label: "盖章日期",
            defaultValue: "2026年5月22日",
            targets: [{ find: "日期:2026年5月22日", kind: "plain", prefix: "日期:" }]
          }
        ]
      }
    ]
  },
  createDouyinAuthorizationTemplate({
    id: "douyin-telecom-auth",
    name: "抖音电信授权书",
    fileName: "douyin-telecom-authorization.docx",
    authorizationCompany: "中国电信股份有限公司山东分公司",
    brandName: "中国电信",
    brandFind: " 中国电信 ",
    trademarkNo: "3111947",
    authorizedCompany: "上海早至科技有限公司",
    validityTerm: "2026年05月15日-2027年05月14日",
    signDate: "2026年05月15日"
  }),
  createDouyinAuthorizationTemplate({
    id: "douyin-mobile-auth",
    name: "抖音移动授权书",
    fileName: "douyin-mobile-authorization.docx",
    authorizationCompany: "中国移动通信集团山东有限公司",
    brandName: "中国移动China Mobile",
    brandFind: " 中国移动China Mobile ",
    trademarkNo: "13137361",
    authorizedCompany: "上海早至科技有限公司",
    validityTerm: "2026年05月16日-2027年05月15日",
    signDate: "2026年05月16日"
  }),
  createDouyinAuthorizationTemplate({
    id: "douyin-unicom-auth",
    name: "抖音联通授权书",
    fileName: "douyin-unicom-authorization.docx",
    authorizationCompany: "中国联合网络通信有限公司广东省分公司",
    brandName: "中国联通",
    brandFind: " 中国联通 ",
    trademarkNo: "8163294",
    authorizedCompany: "上海早至科技有限公司",
    validityTerm: "2026年05月13日-2027年05月12日",
    signDate: "2026年05月13日"
  }),
  createJdAuthorizationTemplate({
    id: "jd-telecom-auth",
    name: "京东电信授权书",
    fileName: "jd-telecom-authorization.docx",
    authorizedCompany: "四川金福多多科技有限公司",
    authorizationCompany: "中国电信股份有限公司山东分公司",
    authorizedProducts: "号卡、流量卡、上网卡、流量包、宽带、合约机等",
    validityTerm: "2026年05月13日至2027年05月12日",
    signDate: "2026.05.13"
  }),
  createJdAuthorizationTemplate({
    id: "jd-mobile-auth",
    name: "京东移动授权书",
    fileName: "jd-mobile-authorization.docx",
    authorizedCompany: "四川金福多多科技有限公司",
    authorizationCompany: "中国移动通信集团山东有限公司",
    authorizedProducts: "号卡、流量卡、上网卡、流量包、宽带、合约机等",
    validityTerm: "2026年05月13日至2027年05月12日",
    signDate: "2026.05.13"
  }),
  createJdAuthorizationTemplate({
    id: "jd-unicom-auth",
    name: "京东联通授权书",
    fileName: "jd-unicom-authorization.docx",
    authorizedCompany: "四川金福多多科技有限公司",
    authorizationCompany: "中国联合网络通信有限公司广东省公司",
    authorizedProducts: "号卡、流量卡、上网卡、流量包、宽带、合约机等",
    validityTerm: "2026年05月13日至2027年05月12日",
    signDate: "2026.05.13"
  })
];

export function getTemplateSummaries() {
  return contractTemplates.map(({ id, name, title, outputName }) => ({
    id,
    name,
    title,
    outputName
  }));
}

export function getTemplate(templateId = "telecom") {
  return contractTemplates.find((template) => template.id === templateId) || contractTemplates[0];
}

function isPartyAEditableField(field) {
  return (
    field.key.startsWith("partyA") ||
    field.key.startsWith("noticeA") ||
    field.label.includes("甲方")
  );
}

export function getFieldGroups(templateId = "telecom") {
  return getTemplate(templateId).groups
    .map((group) => ({
      ...group,
      fields: group.fields.filter((field) => !isPartyAEditableField(field))
    }))
    .filter((group) => group.fields.length > 0 && !group.title.includes("甲方"));
}

export function getFlattenedFields(templateId = "telecom") {
  return getFieldGroups(templateId).flatMap((group) => group.fields);
}

export function getDefaultValues(templateId = "telecom") {
  return Object.fromEntries(
    getFlattenedFields(templateId).map((field) => [field.key, field.defaultValue])
  );
}
