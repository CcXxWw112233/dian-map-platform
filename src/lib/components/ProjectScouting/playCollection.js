import DetailAction from './ScoutingDetail'
import { animate, Fit ,TransformCoordinate} from '../../utils/index'
import Event from '../../utils/event'
const { Evt } = Event;

function action(){
    
    // 是否在播放状态
    this.isPlay = false;
    // 设定播放间隔，默认6秒
    this.autoPlayTime = 6;
    // 播放模式 默认手动 hand  auto 为自动
    this.playMode = 'hand';
    // 单前播放的下标 默认从第一个开始
    this.currentPlayIndex = 0;
    // 当前播放的collection
    this.currentPlay = null;
    // 上一个播放的collection
    this.prevCurrent = null;
    // 下一个要播放的collection
    this.nextCurrent = null;
    // 当前播放的分组
    this.currentGroup = null;
    // 下一个要播放的分组
    this.nextCurrentGroup = null;
    // 上一个播放的分组
    this.prevCurrentGroup = null;
    // 播放的数据
    this.playData = [];
    // 已经渲染的数据
    this.renderedFeatures = [];
    this.features = [];
    this.timer = null;
    this.status = 'stop';

    this.setData = (mode,data)=>{
        if(!data.length) {
            console.warn('This play function need data');
            return false;
        };
        let InitMap = require('../../../utils/INITMAP').default;
        // 赋值图层
        this.map = InitMap.map;
        // 赋值视图
        this.view = InitMap.view;
        this.playMode = mode || this.playMode;
        this.playData = data;

        // 调用详情的删除功能，但不删除图层
        DetailAction.removeLayer(true);
        this.isPlay = true;
        this.getCurrent();
        this.status = 'play';
        if(mode === 'auto'){
            // 自动播放
            replay();
        }
        return true;
    }

    this.renderFeatures = async (detail = false)=>{
        this.features = await DetailAction.renderCollection(this.renderedFeatures,{animation:detail});
        return this.features;
    }
    // 更新当前播放数据
    this.getCurrent = ()=>{
        // 播放进度超出了数据长度
        if(this.currentPlayIndex === this.playData.length -1){
            this.nextCurrent = null ;
        }
        if(this.currentPlayIndex === this.playData.length){
            return undefined;
        }
        if(this.currentPlayIndex < 0){
            console.log(this.currentPlayIndex);
            this.prevCurrent = null ;
            return undefined;
        }
        // 获取当前播放的数据
        this.currentPlay = this.playData[this.currentPlayIndex];
        this.renderedFeatures.push(this.currentPlay);
        // 如果不是在播放第一个，就获取上一个和下一个播放的元素
        if(this.currentPlayIndex > 0){
            this.nextCurrent = this.playData[this.currentPlayIndex + 1];
            this.prevCurrent = this.playData[this.currentPlayIndex - 1];
        }else if(this.currentPlayIndex === 0){
            this.nextCurrent = this.playData[this.currentPlayIndex + 1];
            this.prevCurrent = null;
        }

        return this.currentPlay;
    }

    // 下一个
    this.playNext = ()=>{
        this.currentPlayIndex = this.playData.findIndex(item => item.id === this.currentPlay.id) + 1;
        // console.log(this.currentPlayIndex)
        let canPlay = this.getCurrent();
        if(canPlay){
            this.play();
        }else{
            this.pause('end');
        }
    }
    // 上一个
    this.playPrev = ()=>{
        if(this.currentPlayIndex > 0){
            this.currentPlayIndex = this.playData.findIndex(item => item.id === this.currentPlay.id) - 1;
            let canPlay = this.getCurrent();
            if(canPlay){
                this.play();
                this.status = 'play';

                this.timer && (this.isPlay = true);
            }
        }
    }

    // 暂停
    this.pause = (status)=>{
        if(status === 'end'){
            this.renderFeatures(true);
            this.status = 'end';
        }else{
            this.status = 'pause';
        }

        if(this.playMode === 'auto'){
            clearTimeout(this.timer);
            this.isPlay = false;
            Evt.firEvent('autoPlayChange',this);
        }
    }
    // 继续
    this.playR = ()=>{
        replay();
        Evt.firEvent('autoPlayChange',this);
    }
    // 退出
    this.stop = ()=>{
        this.pause();
        // 当前播放的collection
        this.currentPlay = null;
        // 上一个播放的collection
        this.prevCurrent = null;
        // 下一个要播放的collection
        this.nextCurrent = null;
        // 当前播放的分组
        this.currentGroup = null;
        // 下一个要播放的分组
        this.nextCurrentGroup = null;
        // 上一个播放的分组
        this.prevCurrentGroup = null;
        // 播放的数据
        this.playData = [];
        // 已经渲染的数据
        this.renderedFeatures = [];
        this.currentPlayIndex = 0;
        this.features = [];
        this.isPlay = false;
        this.status = "stop";
    }
    // 开启自动播放
    let replay = ()=>{
        clearTimeout(this.timer);
        this.timer = null;
        if(this.status === 'end'){
            return ;
        }
        this.status = 'play';
        this.isPlay = true;
        this.timer = setTimeout(()=>{
            this.playNext();
            this.play();
            Evt.firEvent('autoPlayChange',this); 
            replay(); 
        },this.autoPlayTime * 1000)
    }

    // 播放
    this.play = async ()=>{
        if(this.currentPlay){
            await this.renderFeatures();
            if(this.currentPlay.collect_type !== '4' && this.currentPlay.collect_type !== '5'){
                playPoint(this.currentPlay);
            }
            // 标绘
            if(this.currentPlay.collect_type === '4'){
                let feaure = this.features.find(item => item.get('id') === this.currentPlay.id);
                if(feaure){
                    let type = feaure.getGeometry().getType();
                    if(type === 'Point'){
                        let coor = feaure.getGeometry().getCoordinates();
                        animate({
                            zoom:this.view.getMaxZoom(),
                            center: coor
                        })
                    }
                    if(type === 'LineString' || type === 'Polygon'){
                        let ext = feaure.getGeometry().getExtent();
                        Fit(this.view, ext, {size:this.map.getSize(),padding: [100,100,100,100]})
                    }
                }
            }
            // 规划图
            if(this.currentPlay.collect_type === '5'){

            }
        }
    }

    // 播放点的数据类型
    let playPoint = async (data)=>{
        // 存在坐标点
        if(data.location && data.location.hasOwnProperty('longitude')){
            let coor = TransformCoordinate([+data.location.longitude, +data.location.latitude]);
            animate({
                zoom: this.view && this.view.getMaxZoom(),
                center: coor
            })
            // 将overlay的层级调高--使气泡不被遮挡
            let element = DetailAction.editZIndexOverlay(data.id);
            let type = DetailAction.checkCollectionType(data.target);
            // 如果是自动播放，需要自动打开
            if(type === 'pic' && this.playMode === 'auto'){
                setTimeout(()=>{
                    element && element.querySelector('.defineCollectionOverlay').click();
                },100)
            }
        }
    }
}

const Action = new action();


export default Action;