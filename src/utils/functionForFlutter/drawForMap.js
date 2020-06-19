import { createOverlay ,getExtentIsEmpty } from '../../lib/utils/index'
import ListAction from '../../lib/components/ProjectScouting/ScoutingList'
import DetailAction from '../../lib/components/ProjectScouting/ScoutingDetail'
import { CollectionOverlay } from '../../components/PublicOverlays'
import { extend } from 'ol/extent'
function renderAction (){
    this.features = [];
    this.Source = null;
    this.datas = [];
    this.view = null ;
    // 隐藏项目
    this.hideProjectPoint = ()=>{
        ListAction.clear();
    }
    // 显示项目坐标点
    this.showProjectPoint = async ()=>{
        this.hideProjectPoint();
        let data = await ListAction.getList();
        // console.log(data)
        ListAction.renderProjectPoint(data.data);
    }

    // 清除所有元素
    this.clear = ()=>{
        if(this.overlay)
        this.overlay.setPosition(null);
        
        // 删除规划图贴图
        DetailAction.removePlanPicCollection();

        if(this.Source && this.features.length){
            this.features.forEach(item => {
                if(this.Source.getFeatureByUid(item.ol_uid)){
                    this.Source.removeFeature(item)
                }
            });
            this.features = [];
        }
    }
    // 渲染带坐标点的数据
    const renderPoint = (data)=>{
        // this.clear();
        // this.features = [];
        let features = DetailAction.renderPointCollection(data,false);
        return features;
    }

    // 渲染元素
    const renderFeatures = async (data)=>{
        // this.clear();
        let feature = await DetailAction.renderFeaturesCollection(data,{addSource: false});
        return feature;
    }


    // 显示所有采集资料点
    this.renderCollection = async (data, Source) => {
        if(!Source) return new Error('required Source For Map!');
        if(!data && !data.length){
            return ;
        }
        this.clear();
        this.datas = data;
        let pointCollection = [];
        let features = [];
        let pic = [];
        data.forEach(item => {
            // 有坐标点的展示
            if(item.collect_type !== '4' && item.collect_type !== '5'){
                pointCollection.push(item);
            }
            // 元素的展示
            if(item.collect_type === '4'){
                features.push(item);
            }
            // 规划图
            if(item.collect_type === '5'){
                pic.push(item);
            }
        })
        // 普通资料点坐标
        if(pointCollection.length){
            let f = renderPoint(pointCollection);
            // console.log(f)
            if(f.length){
                this.features = this.features.concat(f);
                Source.addFeatures(f);
            }
        }

        // 标绘的列表
        if(features.length){
            let fs = renderFeatures(features);
            if(fs.length){
                // this.features = this.features.concat(fs);
                Source.addFeatures(fs);
            }
        }

        let picExt = [Infinity,Infinity,-Infinity,-Infinity];
        // 显示规划图
        if(pic.length){
            picExt = await DetailAction.renderPlanPicCollection(pic);
        }
        let SourceExtent = this.Source.getExtent();
        if(!getExtentIsEmpty(picExt)){
            if(!getExtentIsEmpty(SourceExtent))
            SourceExtent = extend(picExt,[...SourceExtent]);
            else SourceExtent = picExt;
        }

        if(!getExtentIsEmpty(SourceExtent)){
            const { view ,map} = require('../INITMAP').default;
            view.fit(SourceExtent,{size:getMapSize(map),duration:800 });
        }

    }

    const getMapSize = (map) =>{
        let size = map.getSize();
        size.map(item => item/2);
    }
    // 查找元素
    this.findFeature = (feature_id)=>{
        let flist = this.features.concat(DetailAction.features);
        if(!flist.length) return void 0;
        for(let i = 0; i< flist.length; i++){
            let item = flist[i];
            if(item.get('id') === feature_id) return item;
        }

        return void 0;
    }
    // 添加overlay
    this.addOverlay = (data = {},coordinate,map)=>{
        if(this.overlay)
        map.removeOverlay(this.overlay);

        data.pointType = "other";
        let ele = new CollectionOverlay({...data,angleColor:"#fff",placement:"bottomCenter"});
        this.overlay = createOverlay(ele.element,{
            positioning: "bottom-center",
            offset: [0, -25],
        });
        map.addOverlay(this.overlay);
        ele.on = {
            'click':()=>{
                window.previewFile && window.previewFile.postMessage(data);
            }
        }
        this.overlay.setPosition(coordinate);
    }

    // 视图位移
    this.fitCenter = (id)=>{
        let {view,map} = require('../INITMAP').default;
        let feature = this.findFeature(id);
        let d = this.datas.find(item => item.id === id);
        this.overlay && this.overlay.setPosition(null);
        if(feature && d && d.collect_type !== '4' && d.collect_type !== '5'){
            let coor = feature.getGeometry().getCoordinates();
            view.animate({
                zoom:view.getMaxZoom(),
                center: coor,
                duration: 800
            })
            // 添加overlay
            this.addOverlay(d,coor,map)
        }
        else if(d && d.collect_type === '4'){
            // 是标注信息
            let type = feature.getGeometry().getType();
            if(type === 'Polygon' || type === 'LineString'){
                let ext = feature.getGeometry().getExtent();
                DetailAction.toCenter({type:"extent",center:ext});
            }
            else if(type === 'Point'){
                let coor = feature.getGeometry().getCoordinates();
                DetailAction.toCenter({type:"coordinate",center:coor,transform:false});
            }
        }else if(d && d.collect_type === '5'){
            let imgLayer = DetailAction.findImgLayer(d.resource_id);
            if(imgLayer){
                let ext = imgLayer.getSource().getImageExtent();
                DetailAction.toCenter({type:"extent",center:ext});
            }
        }
    }

    // 隐藏气泡
    this.hideOverlay = ()=>{
        this.overlay && this.overlay.setPosition(null);
    }

    // 获取列表数据---测试功能
    this.getCollectionData = (Source)=>{
        ListAction.checkItem().then(({data}) => {
            // console.log(data)
            DetailAction.getCollectionList({board_id: data.board_id}).then(res => {
                // console.log(res.data)
                this.renderCollection(res.data,Source)
            })
        })
    }
}

const action = new renderAction();

export default action;