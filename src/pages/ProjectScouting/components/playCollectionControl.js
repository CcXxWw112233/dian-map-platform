import React from 'react'
import ReactDOM from 'react-dom'
import styles from './playCollectionControl.less'
import { MyIcon } from '../../../components/utils'
import { Space ,Button ,message} from 'antd'
import Action from '../../../lib/components/ProjectScouting/playCollection'
import Event from '../../../lib/utils/event'
const { Evt } = Event;

export default class PlayCollectionControl extends React.PureComponent{
    constructor(){
        super(...arguments);
        this.state = {
            hasPrev:true,
            hasNext:true,
            isAutoPlay: false,
            playMode: ''
        }
        this.move = {
            x:0,
            y:0
        }
        this.timer = null;
    }

    // 检查是不是有待选播放
    fetchPlaying = ()=>{
        let prev = true ,next = true;
        if(!Action.prevCurrent){
            prev = false;
        }
        if(!Action.nextCurrent){
            next = false;
        }
        this.setState({
            hasPrev:prev,
            hasNext:next,
            playMode: Action.playMode,
            isAutoPlay: Action.isPlay
        })
    }

    playNext = ()=>{
        Action.playNext();
        this.fetchPlaying();
    }
    playPrev = ()=>{
        Action.playPrev();
        this.fetchPlaying();
    }

    addListen = ()=>{
        Evt.on('autoPlayChange',()=>{
            this.fetchPlaying();
            if(Action.status === 'end'){
                clearTimeout(this.timer);
                this.timer = setTimeout(()=>{
                   message.success('采集资料自动播放完成'); 
                },500)
            }
        })
    }

    playChange = ()=>{
        if(this.state.isAutoPlay){
            Action.pause();
        }else{
            Action.playR();
        }
    }

    componentDidMount(){
        this.fetchPlaying();
        this.addMoveEvent();
        this.addListen()
    }

    setParentTransform = (dom, offset)=>{
        let parent = dom.parentNode.parentNode;
        // console.log(parent);
        
        if(parent){
            if(offset.x < 0){
                if(!(this.move.x < 0 && Math.abs(this.move.x) >= parent.offsetLeft)) {
                    this.move.x = (this.move.x + offset.x); 
                }
            }else if(offset.x >= 0 && (this.move.x < (document.body.clientWidth - parent.clientWidth - 80 ))){
                this.move.x = (this.move.x + offset.x); 
            }
            if(offset.y < 0){
                if(!(this.move.y < 0 && Math.abs(this.move.y) >= parent.offsetTop)){
                    this.move.y = (this.move.y + offset.y);
                }
            }else if(offset.y > 0 && this.move.y < 0){
                this.move.y = (this.move.y + offset.y);
            }
            
            parent.style.transform = `translate3d(${this.move.x}px,${this.move.y}px,0px)`;
        }
    }

    addMoveEvent = ()=>{
        let dom = document.querySelector("#playCollectionControl");
        if(dom){
            dom.parentNode.parentNode.onpointerdown = (e)=>{
                let pClientX = e.offsetX;
                let pClientY = e.offsetY;
                dom.parentNode.parentNode.onpointermove = (m)=>{
                    // console.log(m)
                    let nClientX = m.offsetX ;
                    let nClientY = m.offsetY;

                    let step = {
                        x: nClientX - pClientX,
                        y: nClientY - pClientY
                    }
                    this.setParentTransform(dom,step);
                }
            }
            dom.parentNode.parentNode.onpointerup = () => {
                dom.parentNode.parentNode.onpointerdown = null;
                dom.parentNode.parentNode.onpointermove = null;
                dom.parentNode.parentNode.onpointerout = null;
                this.addMoveEvent();
            }
            dom.parentNode.parentNode.onpointerout = ()=>{
                dom.parentNode.parentNode.onpointerdown = null;
                dom.parentNode.parentNode.onpointermove = null;
                this.addMoveEvent();
            }
        }
    }

    render(){
        let { hasNext,hasPrev ,playMode ,isAutoPlay} = this.state;
        let { isPlay, onExit = ()=>{} ,currentGroup} = this.props;
        return ReactDOM.createPortal(
            <div className={styles.PlayCollectionControl}>
                <div className={styles.playCollectionTitle}>
                    <a>{currentGroup.name}</a>
                    <span className={styles.dragSpan} id="playCollectionControl">
                        <MyIcon type="icon-yidong"/>
                    </span>
                </div>
                <Space style={{fontSize:"1.2rem"}}>
                    <Button shape="round" size='small'
                    disabled={!hasPrev}
                    icon={<MyIcon type="icon-left"/>}
                    onClick={this.playPrev}>
                    </Button>

                    <Button shape="round" size='small'
                    disabled={!hasNext}
                    icon={<MyIcon type="icon-right"/>}
                    onClick={this.playNext}>
                    
                    </Button>

                    {
                        playMode === 'auto' &&
                        <Button shape="round" size='small'
                        onClick={this.playChange}
                        icon={<MyIcon type={isAutoPlay ? "icon-zantingtingzhi" : "icon-bofang"}/>}>
                            {/* {isPlay?'暂停':"继续"} */}
                        </Button>
                    }

                    <Button shape="round" size='small'
                    danger
                    icon={<MyIcon type="icon-huanyuan"/>}
                    onClick={onExit}>
                        {/* 退出 */}
                    </Button>
                </Space>
            </div>,
            document.body
        )
    }
}