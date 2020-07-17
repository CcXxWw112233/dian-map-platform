const config = [
  {
    title: "人口数量(单位:万人)",
    key: "map:population:number",
    content: [
      { bgColor: "rgba(231,185,192,0.8)", font: "0-5" },
      { bgColor: "rgba(184,74,91,0.8)", font: "5-10" },
      { bgColor: "rgba(68,0,10,0.8)", font: "10-15" },
    ],
  },
  {
    title: "人口密度(单位:人/k㎡)",
    key: "map:population:density",
    content: [
      { bgColor: "rgba(251,207,208,0.8)", font: "0-200" },
      { bgColor: "rgba(248,161,164,0.8)", font: "200-400" },
      { bgColor: "rgba(244,115,120,0.8)", font: "400-600" },
      { bgColor: "rgba(244,115,120,0.8)", font: "400-600" },
      { bgColor: "rgba(178,16,22,0.8)", font: "600-800" },
      { bgColor: "rgba(119,7,11,0.8)", font: ">800" },
    ],
  },
  {
    title: "就业岗位(单位:万人)",
    key: "map:population:employment",
    content: [
      { bgColor: "rgba(211,213,245,0.8)", font: "0-1" },
      { bgColor: "rgba(131,137,224,0.8)", font: "1-2" },
      { bgColor: "rgba(16,21,102,0.8)", font: "2-3" },
    ],
  },
  {
    title: "居民用地(单位:平方公里)",
    key: "map:population:resident",
    content: [
      { bgColor: "rgba(237,211,237,0.8)", font: "0-100" },
      { bgColor: "rgba(218,170,219,0.8)", font: "100-200" },
      { bgColor: "rgba(199,133,200,0.8)", font: "200-300" },
      { bgColor: "rgba(122,41,123,0.8)", font: "300-400" },
      { bgColor: "rgba(81,18,82,0.8)", font: ">400" },
    ],
  },
  {
    title: "交通设施",
    key: "map:transport:road|map:transport:rail|map:transport:city",
    content: [
      {
        imgSrc: require("../../assets/img/lenged-daolujiaotong.png"),
        font: "道路连接点",
      },
      {
        imgSrc: require("../../assets/img/lenged-guidaojiaotong.png"),
        font: "轨道枢纽站点",
      },
      {
        imgSrc: require("../../assets/img/lenged-chengshijiaotong.png"),
        font: "邻近城市",
      },
      {
        imgSrc: require("../../assets/img/parking.svg"),
        font: "停车场",
      },
      {
        imgSrc: require("../../assets/img/busStation.svg"),
        font: "公交车站",
      },
      {
        imgSrc: require("../../assets/img/metro.svg"),
        font: "地铁站",
      },
    ],
  },
  {
    title: "基础设施",
    key:
      "map:infrastructure:business|map:infrastructure:medical|map:infrastructure:education|map:infrastructure:sport|map:infrastructure:municipal",
    content: [
      {
        imgSrc: require("../../assets/img/lenged-shangye.png"),
        font: "商业设施",
      },
      {
        imgSrc: require("../../assets/img/lenged-yiliao.png"),
        font: "医疗设施",
      },
      {
        imgSrc: require("../../assets/img/lenged-jiaoyu.png"),
        font: "教育设施",
      },
      {
        imgSrc: require("../../assets/img/lenged-wenti.png"),
        font: "文体设施",
      },
      {
        imgSrc: require("../../assets/img/lenged-shizheng.png"),
        font: "市政设施",
      },
    ],
  },
  {
    title: "景观设施",
    key: "map:landscape:humanity|map:landscape:natural",
    content: [
      {
        imgSrc: require("../../assets/img/lenged-renwenjingguan.png"),
        font: "人文景观",
      },
      {
        imgSrc: require("../../assets/img/lenged-ziranjingguan.png"),
        font: "自然景观",
      },
    ],
  },
  {
    title: "产业设施",
    key: "map:industry:primary|map:industry:second|map:industry:third",
    content: [
      {
        imgSrc: require("../../assets/img/lenged-1stindustry.png"),
        font: "第一产业",
      },
      {
        imgSrc: require("../../assets/img/lenged-2rdindustry.png"),
        font: "第二产业",
      },
      {
        imgSrc: require("../../assets/img/lengend-3rdindustry.png"),
        font: "第三产业",
      },
    ],
  },
  {
    title: "地籍概况",
    key: "map:landforms:basic",
    content: [
      { borderColor: "#650a05", font: "道路设施", type: "line" },
      { borderColor: "#00b0f0", font: "水系设施(河流、水渠等)", type: "line" },
      { bgColor: "#7030A0", font: "居民点(可拆建)" },
      { bgColor: "#ffff00", font: "居民点(不可拆建)" },
      { bgColor: "#00b0f0", font: "水系设施(湖泊、水库、水塘等)" },
    ],
  },
  {
    title: "农林耕地",
    key: "map:landforms:forestry",
    content: [
      {
        bgColor: "#803a0a",
        borderColor: "#92D050",
        font: "林业用地",
        type: "point",
      },
      {
        imgSrc: require("../../assets/img/legend-farm.png"),
        font: "农田用地",
      },
    ],
  },
];
export default config;
