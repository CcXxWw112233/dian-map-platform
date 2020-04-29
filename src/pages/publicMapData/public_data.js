const jsons =
{
    "data":[
        {
            "name":"人口用地","icon":"icon-icon-renkou","key":"1",
            "child":[
                {
                    "name":"人口分布","icon":"","key":"map:population:number",
                    loadFeatureKeys:[
                        {
                            typeName:'lingxi:model_statistics_polygon',
                            showName:true,
                            style:{
                                strokeWidth:3,
                                strokeColor:"#ffffff",
                                textStrokeColor:"",
                                textFillColor:"rgba(0,0,0,0.8)",
                                font:"14px sans-serif"
                            }
                        }
                    ]
                },
                // {"name":"人口密度","icon":"","key":"map:population:density"},
                // {"name":"就业岗位","icon":"","key":"map:population:employment"},
                // {"name":"居民用地","icon":"","key":"map:population:resident"}
            ]
        },
        {
            "name":"交通设施","icon":"icon-icon-jiaotong","key":"2",
            "child":[
                {"name":"道路交通","icon":"","key":"map:transport:road"},
                {"name":"轨道交通","icon":"","key":"map:transport:rail"},
                {"name":"城市交通","icon":"","key":"map:transport:city"}
            ]
        },
        {
            "name":"基础设施","icon":"icon-icon-sheshi","key":"3",
            "child":[
                {"name":"商业设施","icon":"","key":"map:infrastructure:business"},
                {"name":"医疗设施","icon":"","key":"map:infrastructure:medical"},
                {"name":"教育设施","icon":"","key":"map:infrastructure:education"},
                {"name":"文体设施","icon":"","key":"map:infrastructure:sport"},
                {"name":"市政设施","icon":"","key":"map:infrastructure:municipal"}
            ]
        },
        {
            "name":"景观设施","icon":"icon-icon-shangye","key":"4",
            "child":[
                {"name":"人文景观","icon":"","key":"map:landscape:humanity"},
                {"name":"自然景观","icon":"","key":"map:landscape:natural"}
            ]
        },
        {
            "name":"产业设施","icon":"icon-icon-people","key":"5",
            "child":[
                {"name":"第一产业","icon":"","key":"map:industry:primary"},
                {"name":"第二产业","icon":"","key":"map:industry:second"},
                {"name":"第三产业","icon":"","key":"map:industry:third"}
            ]
        },
        {
            "name":"地籍地貌","icon":"icon-icon-yongdi","key":"6",
            "child":[
                {
                    "name":"地籍概况","icon":"","key":"map:landforms:basic",
                    "loadFeatureKeys":[
                        // 水路路线图
                        {
                            typeName:"lingxi:diji_sxss_polyline", 
                            style:{
                             strokeColor:"#00B0F0",
                             strokeWidth:4
                            }
                        },
                        // 水系设施图
                        {
                            typeName:"lingxi:diji_sxss_polygon", 
                            style:{
                             fillColor:"#00B0F0",
                             strokeWidth:1
                            }
                         },
                        // 居民点计划图
                        {
                           typeName:"lingxi:plan_polygon",
                           style:{
                               fillColor:"#7030A0",
                               strokeWidth:2
                           } 
                        },
                    ]
                },
                {
                    "name":"农林耕地","icon":"","key":"map:landforms:forestry",
                    loadFeatureKeys:[
                        // 农林耕种图
                        {
                            typeName:"lingxi:diji_zbtz_polyline",
                            style:{
                                strokeColor:"#92D050",
                                strokeWidth: 2,
                                fillColor:"#92D050"
                            }
                        }
                        
                    ]
                }
            ]
        },
        {
            "name":"政策红线","icon":"icon-icon-xianzai","key":"7",
            "child":[]
        }
    ]
}

export default jsons;