import {
  Layer,
  Source,
  TransformCoordinate,
  // Fit,
  // getPoint,
  addFeature,
  createStyle,
  // createOverlay,
  // fitPadding
} from '../../utils/index';
import { Cluster } from 'ol/source';
// import { message } from 'antd';
import InitMap from '../../../utils/INITMAP';
// import { DragCircleRadius } from '../../../components/PublicOverlays/index';
import DetailAction from './ScoutingDetail';
import MoveLine from '../../../utils/moveLine';
import Event from '../../utils/event';


function action(){
  this.layerId = 'around_about_layer';
  this.Layer = Layer({id: this.layerId,zIndex: 39, style: (feature)=>{
    let data = feature.get('features');
    let size = data.length;
    let style = createStyle('Point',{
      fillColor:"#ff0000",
      showName: true,
      radius: 10,
      offsetY: 1,
      font: 11,
      text: size > 1 ? size.toString() : data[0].get('name'),
      textFillColor: size > 1 ?"#ffffff": "#ff0000",
      textStrokeColor: '#ffffff',
      strokeColor:"#ffff",
      icon: {
        anchor: [0.5, 0.8]
      }
    })

    return style;
  }});
  this.Source = Source();
  this.distance = 30;
  this.points = [];
  this.center = null;
  this.moveLine = null ;
  this.mounted = false;
  this.init = ()=>{
    const layers = InitMap.map.getLayers().getArray();
    const layer = layers.find((layer) => {
      return layer.get("id") === this.Layer.get("id");
    });
    this.features = DetailAction.features;
    if(!layer){
      let source = new Cluster({
        distance: this.distance,
        source: this.Source
      })
      InitMap.map.on('moveend', ()=>{
        let list = this.Layer.getSource().getFeatures();
        if(this.moveLine && this.mounted){
          this.moveLine.update({data: this.createRenderList(list)})
        }
      })
      this.mounted = true;
      this.Layer.setSource(source);
      InitMap.map.addLayer(this.Layer);
    }
  }

  this.createRenderList = (data)=>{
    let list = [];
    data.forEach(item => {
      let obj = {
        from: {
          city: '',
          lnglat: this.center
        },
        to:{
          city: "",
          lnglat: item.getGeometry().getCoordinates()
        }
      };
      list.push(obj);
    })
    return list;
  }

  this.renderLine = ()=>{
    if(this.mounted){
      let list = this.Layer.getSource().getFeatures();
      // if(list.length)
      this.createMoveLine(list, this.center);
    }
  }

  this.transform = (coordinates)=>{
    return TransformCoordinate(coordinates, "EPSG:3857", "EPSG:4326");
  }
  this.searchByPosition = async ({ position, radius, type, pageIndex,a}) => {
    // type 高速路入口 火车站 城际交通
    this.center = position;
    let param = {
      position: this.transform(position),
      radius: Math.round(radius),
      type: type,
      pageSize: 10,
      pageIndex: pageIndex
    }
    let searchMsg = await window.CallWebMapFunction('SearchForPoint', param);
    Event.Evt.firEvent('SearchPOI', searchMsg);
    this.clearSearchPoint();
    this.renderSearchPoint(searchMsg, position);
  }

  this.clearSearchPoint = ()=>{
    if(this.points.length){
      this.points.forEach(item => {
        if(this.Source.getFeatureByUid(item.ol_uid)){
          this.Source.removeFeature(item);
        }
      })
      this.points = []
    }
  }

  this.renderSearchPoint = (data, center)=>{
    if(data){
      let { pois } = data;
      pois.forEach(item => {
        let coor = TransformCoordinate([+item.location.lng, +item.location.lat])
        let feature = addFeature('Point',{coordinates: coor, name: item.name});
        this.points.push(feature);
      })
      this.Source.addFeatures(this.points);
      this.renderLine();
    }
  }

  //
  this.createMoveLine = (data)=>{
    // this.clearCanvas('create');
    if(data){
      let list = this.createRenderList(data);
      if(this.moveLine){
        this.moveLine.canvas.destory = false;
        this.moveLine.animateCanvas.destory = false;
        this.moveLine.update({data: list});
        this.moveLine.canvas._draw();
        this.moveLine.canvas.showLayer();
        this.moveLine.animateCanvas._draw();
        this.moveLine.animateCanvas.showLayer();
        return ;
      }
      else {
        let m = new MoveLine(InitMap.map, {
          //marker点半径
          markerRadius: 2,
          //marker点颜色,为空或null则默认取线条颜色
          markerColor: null,
          //线条类型 solid、dashed、dotted
          lineType: 'solid',
          //线条宽度
          lineWidth: 2,
          //线条颜色
          colors: ['#F9815C', '#F8AB60', '#EDCC72', '#E2F194', '#94E08A', '#4ECDA5'],
          // 统一设置线条颜色
          strokeColor: "#6DCEFF",
          //移动点半径
          moveRadius: 3,
          //移动点颜色
          fillColor: '#613FFF',
          //移动点阴影颜色
          shadowColor: '#3EA3FF',
          //移动点阴影大小
          shadowBlur: 6,
          data: list
        });

        // console.log(m)
        this.moveLine = m;
      }
    }
  }
  this.clearCanvas = (a)=>{
    // console.log('我删除了图层',a)
    if(this.moveLine){
      this.moveLine.canvas.hide();
      this.moveLine.canvas.destory = true;
      this.moveLine.animateCanvas.hide();
      this.moveLine.animateCanvas.destory = true;
    }
  }
  this.clearLine = (a)=>{
    // console.log(a)
    this.clearSearchPoint();
    this.clearCanvas(a);
  }
}

export default new action();
