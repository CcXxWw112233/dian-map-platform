let queryStr = "districtcode='440117'";
const commonStyleOption = {
  textFillColor: "#3F48CC",
  textStrokeColor: "#fff",
  textStrokeWidth: 3,
  font: "13px sans-serif",
  placement: "point",
  iconScale: 0.6,
  pointColor: "#fff",
};
const commonFeatureKeys = {
  typeName: "lingxi:model_statistics_polygon",
  cql_filter: `${queryStr}`,
  showName: true,
  style: {
    strokeWidth: 3,
    strokeColor: "#ffffff",
    textStrokeColor: "",
    textFillColor: "rgba(0,0,0,0.8)",
    font: "14px sans-serif",
  },
};
const data = [
  {
    title: "人口用地",
    icon: "icon-icon-renkou",
    key: "1",
    disabled: true,
    children: [
      {
        title: "人口分布",
        icon: "",
        key: "map:population:number",
        loadFeatureKeys: [{ ...commonFeatureKeys }],
        fillColorKeyVals: [
          {
            scope: "0-5",
            fillColor: "rgba(231,185,192,0.8)",
            property: "population",
          },
          {
            scope: "5-10",
            fillColor: "rgba(184,74,91,0.8)",
            property: "population",
          },
          {
            scope: "10-15",
            fillColor: "rgba(68,0,10,0.8)",
            property: "population",
          },
          {
            scope: ">15",
            fillColor: "rgba(68,0,10,0.8)",
            property: "population",
          },
        ],
      },
      {
        title: "人口密度",
        icon: "",
        key: "map:population:density",
        loadFeatureKeys: [{ ...commonFeatureKeys }],
        fillColorKeyVals: [
          {
            scope: "0-200",
            fillColor: "rgba(251,207,208,0.8)",
            property: "density",
          },
          {
            scope: "200-400",
            fillColor: "rgba(248,161,164,0.8)",
            property: "density",
          },
          {
            scope: "200-400",
            fillColor: "rgba(248,161,164,0.8)",
            property: "density",
          },
          {
            scope: "600-800",
            fillColor: "rgba(178,16,22,0.8)",
            property: "density",
          },
          {
            scope: "-800",
            fillColor: "rgba(119,7,11,0.8)",
            property: "density",
          },
        ],
      },
      {
        title: "就业岗位",
        icon: "",
        key: "map:population:employment",
        loadFeatureKeys: [{ ...commonFeatureKeys }],
        fillColorKeyVals: [
          {
            scope: "0-1",
            fillColor: "rgba(211,213,245,0.8)",
            property: "empolyment",
          },
          {
            scope: "1-2",
            fillColor: "rgba(131,137,224,0.8)",
            property: "empolyment",
          },
          {
            scope: "2-3",
            fillColor: "rgba(16,21,102,0.8)",
            property: "empolyment",
          },
        ],
      },
      {
        title: "居民用地",
        icon: "",
        key: "map:population:resident",
        loadFeatureKeys: [{ ...commonFeatureKeys }],
        fillColorKeyVals: [
          {
            scope: "0-100",
            fillColor: "rgba(237,211,237,0.8)",
            property: "landuse",
          },
          {
            scope: "100-200",
            fillColor: "rgba(218,170,219,0.8)",
            property: "landuse",
          },
          {
            scope: "200-300",
            fillColor: "rgba(199,133,200,0.8)",
            property: "landuse",
          },
          {
            scope: "300-400",
            fillColor: "rgba(122,41,123,0.8)",
            property: "landuse",
          },
          {
            scope: "-400",
            fillColor: "rgba(81,18,82,0.8)",
            property: "landuse",
          },
        ],
      },
    ],
  },
  {
    title: "交通设施",
    icon: "icon-icon-jiaotong",
    key: "2",
    children: [
      {
        title: "道路交通",
        icon: "",
        key: "map:transport:road",
        loadFeatureKeys: [
          {
            typeName: "lingxi:ggss_point",
            cql_filter: `${queryStr} AND type='13'`,
            showName: true,
            style: {
              iconUrl: require("../../assets/img/qiche.png"),
              ...commonStyleOption,
            },
          },
        ],
      },
      {
        title: "轨道交通",
        icon: "",
        key: "map:transport:rail",
        loadFeatureKeys: [
          {
            typeName: "lingxi:ggss_point",
            cql_filter: `${queryStr} AND type='2'`,
            showName: true,
            style: {
              iconUrl: require("../../assets/img/huochezhan.png"),
              ...commonStyleOption,
            },
          },
        ],
      },
      {
        title: "城市交通",
        icon: "",
        key: "map:transport:city",
        loadFeatureKeys: [
          {
            typeName: "lingxi:ggss_point",
            cql_filter: `${queryStr} AND type='1'`,
            showName: true,
            style: {
              iconUrl: require("../../assets/img/chengshi.png"),
              ...commonStyleOption,
            },
          },
        ],
      },
      {
        title: "停车场",
        icon: "",
        key: "map:transport:parking",
        loadFeatureKeys: [
          {
            typeName: "lingxi:ggss_point",
            cql_filter: `${queryStr} AND type2='停车场'`,
            showName: true,
            style: {
              iconUrl: require("../../assets/img/tingchechang.svg"),
              ...commonStyleOption,
            },
          },
        ],
      },
      {
        title: "公交车站",
        icon: "",
        key: "map:transport:busstop",
        loadFeatureKeys: [
          {
            typeName: "lingxi:ggss_point",
            cql_filter: `${queryStr} AND type2='公交车站'`,
            showName: true,
            style: {
              iconUrl: require("../../assets/img/gongjiaozhan.svg"),
              ...commonStyleOption,
            },
          },
        ],
      },
      {
        title: "地铁站",
        icon: "",
        key: "map:transport:metroStation",
        loadFeatureKeys: [
          {
            typeName: "lingxi:ggss_point",
            cql_filter: `${queryStr} AND type2='地铁站'`,
            showName: true,
            style: {
              iconUrl: require("../../assets/img/ditiezhan.svg"),
              ...commonStyleOption,
            },
          },
        ],
      },
    ],
  },
  {
    title: "基础设施",
    icon: "icon-icon-sheshi",
    key: "3",
    children: [
      {
        title: "商业设施",
        icon: "",
        key: "map:infrastructure:business",
        loadFeatureKeys: [
          {
            typeName: "lingxi:ggss_point",
            cql_filter: `${queryStr} AND type='3'`,
            showName: true,
            style: {
              iconUrl: require("../../assets/img/icon-drop-shangye.png"),
              ...commonStyleOption,
            },
          },
        ],
      },
      {
        title: "医疗设施",
        icon: "",
        key: "map:infrastructure:medical",
        loadFeatureKeys: [
          {
            typeName: "lingxi:ggss_point",
            cql_filter: `${queryStr} AND type='4'`,
            showName: true,
            style: {
              iconUrl: require("../../assets/img/icon-drop-yiliao.png"),
              ...commonStyleOption,
            },
          },
        ],
      },
      {
        title: "教育设施",
        icon: "",
        key: "map:infrastructure:education",
        loadFeatureKeys: [
          {
            typeName: "lingxi:ggss_point",
            cql_filter: `${queryStr} AND type='5'`,
            showName: true,
            style: {
              iconUrl: require("../../assets/img/icon-drop-jiaoyu.png"),
              ...commonStyleOption,
            },
          },
        ],
      },
      {
        title: "文体设施",
        icon: "",
        key: "map:infrastructure:sport",
        loadFeatureKeys: [
          {
            typeName: "lingxi:ggss_point",
            cql_filter: `${queryStr} AND type='6'`,
            showName: true,
            style: {
              iconUrl: require("../../assets/img/icon-drop-wenti.png"),
              ...commonStyleOption,
            },
          },
        ],
      },
      {
        title: "市政设施",
        icon: "",
        key: "map:infrastructure:municipal",
        loadFeatureKeys: [
          {
            typeName: "lingxi:ggss_point",
            cql_filter: `${queryStr} AND type='7'`,
            showName: true,
            style: {
              iconUrl: require("../../assets/img/icon-drop-shizhensesi.png"),
              ...commonStyleOption,
            },
          },
        ],
      },
    ],
  },
  {
    title: "景观设施",
    icon: "icon-icon-shangye",
    key: "4",
    children: [
      {
        title: "人文景观",
        icon: "",
        key: "map:landscape:humanity",
        loadFeatureKeys: [
          {
            typeName: "lingxi:ggss_point",
            cql_filter: `${queryStr} AND type='9'`,
            showName: true,
            style: {
              iconUrl: require("../../assets/img/renwenjingguan.png"),
              ...commonStyleOption,
            },
          },
        ],
      },
      {
        title: "自然景观",
        icon: "",
        key: "map:landscape:natural",
        loadFeatureKeys: [
          {
            typeName: "lingxi:ggss_point",
            cql_filter: `${queryStr} AND type='8'`,
            showName: true,
            style: {
              iconUrl: require("../../assets/img/ziranjingguan.png"),
              ...commonStyleOption,
            },
          },
        ],
      },
    ],
  },
  {
    title: "产业设施",
    icon: "icon-icon-people",
    key: "5",
    children: [
      {
        title: "第一产业",
        icon: "",
        key: "map:industry:primary",
        loadFeatureKeys: [
          {
            typeName: "lingxi:ggss_point",
            cql_filter: `${queryStr} AND type='10'`,
            showName: true,
            style: {
              iconUrl: require("../../assets/img/diyichanye.png"),
              ...commonStyleOption,
            },
          },
        ],
      },
      {
        title: "第二产业",
        icon: "",
        key: "map:industry:second",
        loadFeatureKeys: [
          {
            typeName: "lingxi:ggss_point",
            cql_filter: `${queryStr} AND type='11'`,
            showName: true,
            style: {
              iconUrl: require("../../assets/img/dierchanye.png"),
              ...commonStyleOption,
            },
          },
        ],
      },
      {
        title: "第三产业",
        icon: "",
        key: "map:industry:third",
        loadFeatureKeys: [
          {
            typeName: "lingxi:ggss_point",
            cql_filter: `${queryStr} AND type='12'`,
            showName: true,
            style: {
              iconUrl: require("../../assets/img/disanchanye.png"),
              ...commonStyleOption,
            },
          },
        ],
      },
    ],
  },
  {
    title: "地产楼盘",
    icon: "icon-loufang2",
    key: "8",
    children: [
      {
        title: "新房",
        icon: "",
        key: "map:loupan:newHouse",
        loadFeatureKeys: [
          {
            typeName: "lingxi:dichan_loupan_point",
            cql_filter: `${queryStr} AND type=0`,
            showName: false,
            style: {
              iconUrl: require("../../assets/img/loupan.svg"),
              ...commonStyleOption,
            },
          },
        ],
      },
    ],
  },
];

export default data;
