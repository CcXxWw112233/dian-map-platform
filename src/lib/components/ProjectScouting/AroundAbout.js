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
  this.distance = 20;
  this.points = [];
  this.center = null;
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

      this.Layer.setSource(source);
      InitMap.map.addLayer(this.Layer);
      this.Layer.on('postrender',()=>{
        // console.log(this.Layer)
      })
      // console.log('加载好了')
    }
  }
  this.transform = (coordinates)=>{
    return TransformCoordinate(coordinates, "EPSG:3857", "EPSG:4326");
  }
  this.searchByPosition = async ({ position, radius, size }) => {
    // console.log(radius)
    let param = {
      position: this.transform(position),
      radius,
      type: "高速路入口",
    }
    let searchMsg = await window.CallWebMapFunction('SearchForPoint', param);
    // console.log(searchMsg)
    this.renderSearchPoint(searchMsg);
    if(searchMsg)
    this.createMoveLine(searchMsg, position);
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

  this.renderSearchPoint = (data)=>{
    // console.log(data);
    this.clearSearchPoint();
    if(data){
      let { pois } = data;
      pois.forEach(item => {
        let coor = TransformCoordinate([+item.location.lng, +item.location.lat])
        let feature = addFeature('Point',{coordinates: coor, name: item.name});
        // let style = createStyle("Point",{
        //   fillColor:"#ff0000",
        //   text: item.name,
        //   showName: true
        // })
        // feature.setStyle(style);
        this.points.push(feature);
      })
      // console.log(this.points);
      this.Source.addFeatures(this.points);
      // this.createMoveLine(data);
    }
  }

  this.createMoveLine = (data, from)=>{
    if(data){
      let pois = data.pois;
      // new MoveLine()
      let list = [];
      pois.forEach(item => {
        let obj = {
          from: {
            city: '',
            lnglat: from
          },
          to:{
            city: "",
            lnglat: TransformCoordinate([+item.location.lng, +item.location.lat])
          }
        };
        list.push(obj);
      })
      // console.log(list)
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
        //移动点半径
        moveRadius: 3,
        //移动点颜色
        fillColor: '#fff',
        //移动点阴影颜色
        shadowColor: '#fff',
        //移动点阴影大小
        shadowBlur: 6,
        data: list
      });
      // console.log(m)
      this.moveLine = m;
    }
  }
  this.clearLine = ()=>{
    this.clearSearchPoint();
    this.moveLine.canvas.hidden();
    this.moveLine.canvas.destory = true;
    this.moveLine.animateCanvas.hidden();
    this.moveLine.animateCanvas.destory = true;
  }
}

export default new action();
