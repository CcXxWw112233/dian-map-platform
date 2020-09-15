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

const datas = [
  {
    title: "人口分布",
    icon: "",
    key: "map:population:number",
    pKey: "1",
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
    pKey: "1",
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
    pKey: "1",
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
    pKey: "1",
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
  {
    title: "新房",
    icon: "",
    key: "map:loupan:newHouse",
    pKey: "6",
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
];

export default datas;
