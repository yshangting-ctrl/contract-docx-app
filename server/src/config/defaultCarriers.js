export const defaultCarriers = [
  {
    id: "telecom",
    name: "中国电信",
    color: "#003D8F",
    enName: "CHINA TELECOM",
    type: "授权代理",
    company: "武汉轩乐乐网络科技有限公司",
    no: "No.37010036446256",
    extra: ["网址:https://agchannel.crm.189.cn/channel-manager-web/queryStoreInfo?id=5841138777119903"]
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

export const carrierOrder = defaultCarriers.map((carrier) => carrier.id);
