const commonStyleOption = {
  textFillColor: "#3F48CC",
  textStrokeColor: "#fff",
  textStrokeWidth: 3,
  font: "13px sans-serif",
  placement: "point",
  iconScale: 0.6,
  pointColor: "#fff",
}
const commonFeatureKeys =  {
  typeName: "lingxi:model_statistics_polygon",
  cql_filter: "areaCode in ('440117','*')",
  showName: true,
  style: {
    strokeWidth: 3,
    strokeColor: "#ffffff",
    textStrokeColor: "",
    textFillColor: "rgba(0,0,0,0.8)",
    font: "14px sans-serif",
  },
}
const jsons = {
  data: [
    {
      name: "人口用地",
      icon: "icon-icon-renkou",
      key: "1",
      child: [
        {
          name: "人口分布",
          icon: "",
          key: "map:population:number",
          loadFeatureKeys: [
            {...commonFeatureKeys}
          ],
        },
        {
          name: "人口密度",
          icon: "",
          key: "map:population:density",
          loadFeatureKeys: [
            {...commonFeatureKeys}
          ],
        },
        {
          name: "就业岗位",
          icon: "",
          key: "map:population:employment",
          loadFeatureKeys: [
            {...commonFeatureKeys}
          ],
        },
        {
          name: "居民用地",
          icon: "",
          key: "map:population:resident",
          loadFeatureKeys: [
            {...commonFeatureKeys}
          ],
        },
      ],
    },
    {
      name: "交通设施",
      icon: "icon-icon-jiaotong",
      key: "2",
      child: [
        {
          name: "道路交通",
          icon: "",
          key: "map:transport:road",
          loadFeatureKeys: [
            {
              typeName: "lingxi:ggss_point",
              cql_filter: "adcode in ('440117','*') and type='13'",
              showName: true,
              style: {
                iconUrl: require("./img/qiche.png"),
                ...commonStyleOption
              },
            },
          ],
        },
        {
          name: "轨道交通",
          icon: "",
          key: "map:transport:rail",
          loadFeatureKeys: [
            {
              typeName: "lingxi:ggss_point",
              cql_filter: "adcode in ('440117','*') and type='2'",
              showName: true,
              style: {
                iconUrl: require("./img/huochezhan.png"),
                ...commonStyleOption
              },
            },
          ],
        },
        {
          name: "城市交通",
          icon: "",
          key: "map:transport:city",
          loadFeatureKeys: [
            {
              typeName: "lingxi:ggss_point",
              cql_filter: "adcode in ('440117','*') and type='1'",
              showName: true,
              style: {
                iconUrl: require("./img/chengshi.png"),
                ...commonStyleOption
              },
            },
          ],
        },
      ],
    },
    {
      name: "基础设施",
      icon: "icon-icon-sheshi",
      key: "3",
      child: [
        {
          name: "商业设施",
          icon: "",
          key: "map:infrastructure:business",
          loadFeatureKeys: [
            {
              typeName: "lingxi:ggss_point",
              cql_filter: "adcode in ('440117','*') and type='3'",
              showName: true,
              style: {
                iconUrl: require("./img/icon-drop-shangye.png"),
                ...commonStyleOption
              },
            },
          ],
        },
        {
          name: "医疗设施",
          icon: "",
          key: "map:infrastructure:medical",
          loadFeatureKeys: [
            {
              typeName: "lingxi:ggss_point",
              cql_filter: "adcode in ('440117','*') and type='4'",
              showName: true,
              style: {
                iconUrl: require("./img/icon-drop-shangye.png"),
                ...commonStyleOption
              },
            },
          ],
        },
        {
          name: "教育设施",
          icon: "",
          key: "map:infrastructure:education",
          loadFeatureKeys: [
            {
              typeName: "lingxi:ggss_point",
              cql_filter: "adcode in ('440117','*') and type='5'",
              showName: true,
              style: {
                iconUrl: require("./img/icon-drop-jiaoyu.png"),
                ...commonStyleOption
              },
            },
          ],
        },
        {
          name: "文体设施",
          icon: "",
          key: "map:infrastructure:sport",
          loadFeatureKeys: [
            {
              typeName: "lingxi:ggss_point",
              cql_filter: "adcode in ('440117','*') and type='6'",
              showName: true,
              style: {
                iconUrl: require("./img/icon-drop-wenti.png"),
                ...commonStyleOption
              },
            },
          ],
        },
        {
          name: "市政设施",
          icon: "",
          key: "map:infrastructure:municipal",
          loadFeatureKeys: [
            {
              typeName: "lingxi:ggss_point",
              cql_filter: "adcode in ('440117','*') and type='7'",
              showName: true,
              style: {
                iconUrl: require("./img/icon-drop-shizhensesi.png"),
                ...commonStyleOption
              },
            },
          ],
        },
      ],
    },
    {
      name: "景观设施",
      icon: "icon-icon-shangye",
      key: "4",
      child: [
        {
          name: "人文景观",
          icon: "",
          key: "map:landscape:humanity",
          loadFeatureKeys: [
            {
              typeName: "lingxi:ggss_point",
              cql_filter: "adcode in ('440117','*') and type='9'",
              showName: true,
              style: {
                iconUrl: require("./img/renwenjingguan.png"),
                ...commonStyleOption
              },
            },
          ],
        },
        {
          name: "自然景观",
          icon: "",
          key: "map:landscape:natural",
          loadFeatureKeys: [
            {
              typeName: "lingxi:ggss_point",
              cql_filter: "adcode in ('440117','*') and type='8'",
              showName: true,
              style: {
                iconUrl: require("./img/ziranjingguan.png"),
                ...commonStyleOption
              },
            },
          ],
        },
      ],
    },
    {
      name: "产业设施",
      icon: "icon-icon-people",
      key: "5",
      child: [
        {
          name: "第一产业",
          icon: "",
          key: "map:industry:primary",
          loadFeatureKeys: [
            {
              typeName: "lingxi:ggss_point",
              cql_filter: "adcode in ('440117','*') and type='10'",
              showName: true,
              style: {
                iconUrl: require("./img/diyichanye.png"),
                ...commonStyleOption
              },
            },
          ],
        },
        {
          name: "第二产业",
          icon: "",
          key: "map:industry:second",
          loadFeatureKeys: [
            {
              typeName: "lingxi:ggss_point",
              cql_filter: "adcode in ('440117','*') and type='11'",
              showName: true,
              style: {
                iconUrl: require("./img/dierchanye.png"),
                ...commonStyleOption
              },
            },
          ],
        },
        {
          name: "第三产业",
          icon: "",
          key: "map:industry:third",
          loadFeatureKeys: [
            {
              typeName: "lingxi:ggss_point",
              cql_filter: "adcode in ('440117','*') and type='12'",
              showName: true,
              style: {
                iconUrl: require("./img/disanchanye.png"),
                ...commonStyleOption
              },
            },
          ],
        },
      ],
    },
    {
      name: "地籍地貌",
      icon: "icon-icon-yongdi",
      key: "6",
      child: [
        {
          name: "地籍概况",
          icon: "",
          key: "map:landforms:basic",
          loadFeatureKeys: [
            // 水路路线图
            {
              typeName: "lingxi:diji_sxss_polyline",
              cql_filter: "adcode in ('440117','*')",
              style: {
                strokeColor: "#00B0F0",
                strokeWidth: 4,
              },
            },
            // 水系设施图
            {
              typeName: "lingxi:diji_sxss_polygon",
              cql_filter: "adcode in ('440117','*')",
              style: {
                fillColor: "#00B0F0",
                strokeWidth: 1,
              },
            },
            // 居民点计划图
            {
              typeName: "lingxi:plan_polygon",
              cql_filter: "adcode in ('440117','*')",
              style: {
                fillColor: "#7030A0",
                strokeWidth: 2,
              },
            },
          ],
        },
        {
          name: "农林耕地",
          icon: "",
          key: "map:landforms:forestry",
          loadFeatureKeys: [
            // 农林耕种图
            {
              typeName: "lingxi:diji_zbtz_polyline",
              cql_filter: "adcode in ('440117','*')",
              style: {
                strokeColor: "#92D050",
                strokeWidth: 2,
                fillColor: "#92D050",
              },
            },
          ],
        },
      ],
    },
    {
      name: "政策红线",
      icon: "icon-icon-xianzai",
      key: "7",
      child: [],
    },
  ],
};

export default jsons;
