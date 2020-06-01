import React from 'react'
import styles from './audioPlayControl.less'
import ReactDOM from 'react-dom'
import globalStyle from '../../../globalSet/styles/globalStyles.less'
import animateCss from '../../../assets/css/animate.min.css'

export default class AudioControl extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = {
            isPause:false,
            duration:0,
            currentTime:0
        }
        this.icons = {
            'audio':{
                play:"&#xe609;",
                pause:'&#xe60a;'
            },
            'video':{
                play:"&#xe608;",
                pause:"&#xe60b;"
            }
        }
    }
    componentWillReceiveProps(nextProps){
        // console.log(nextProps)
    }

    componentWillUnmount(){
        let { audioEle } = this.props;
        audioEle && audioEle.pause();
    }
    
    // 设置播放状态
    setEleStatus = (type)=>{
        let { audioEle } = this.props;
        audioEle[type] && audioEle[type]();
    }
    playButton = () => {
        let { audioEle } = this.props;
        if(audioEle){
            audioEle.onplay = ()=>{
                this.setState({
                    isPause: false
                })
            }
            audioEle.onpause = ()=>{
                this.setState({
                    isPause: true
                })
            }
            audioEle.ontimeupdate = (e)=>{
                // console.log(e.target.paused)
                let paused = e.target.paused;
                let duration = e.target.duration;
                let currentTime = e.target.currentTime;
                if(!paused){
                    this.setState({
                        isPause:false,
                        duration,
                        currentTime
                    })
                }
            }
        }

        return (
            <div className={`${styles.playBtn} ${globalStyle.global_icon}`}>
                {
                    this.state.isPause ? 
                    <span dangerouslySetInnerHTML={{__html: this.icons['video'].play}} 
                    onClick={this.setEleStatus.bind(this,'play')}></span>
                    :
                    <span dangerouslySetInnerHTML={{__html: this.icons['video'].pause}} 
                    onClick={this.setEleStatus.bind(this,'pause')}></span>
                }
            </div>
        )
    }

    transformDataPlay = (time = 0)=>{
        let zero = (n)=>{
            return n < 10 ? "0" +n : n;
        }
        if(time < 60){
            return '00:'+zero(parseInt(time));
        }else{
            let t = time/60;
            let m = parseInt(t);
            let s = parseInt((t - m) * 60);
            return `${zero(m)}:${zero(s)}`
        }
        // return 0
    }

    setCurrent = (val)=>{
        let { audioEle } = this.props;
        audioEle.currentTime = +val.value
        // this.setState({
        //     currentTime: val.value
        // })
    }
    onClose = ()=> {
        let { audioEle ,onClose} = this.props;
        audioEle && audioEle.pause();
        setTimeout(()=>{
            onClose && onClose();
        },30)
        
    }

    render(){
        let { data = {} } = this.props;
        let { duration , currentTime } = this.state;
        return ReactDOM.createPortal(
            <div className={`${styles.controlBox} ${animateCss.animated} ${animateCss.slideInTop}`}>
                <div className={styles.audioControlBtn}>
                    {this.playButton()}
                </div>
                <div className={styles.playContent}>
                    <div className={styles.playTitle}>
                        <span style={{display:"inline-block"}}>正在播放:</span>  {data.title}
                    </div>
                    <div className={styles.playTime}>
                        {/* 我是进度条 */}
                        <span>
                            {this.transformDataPlay(currentTime)}
                        </span>
                        <input max={duration} min={0} value={currentTime} type='range' onChange={(e)=>{this.setCurrent(e.target)}}/>
                        <span>
                            {this.transformDataPlay(duration)}
                        </span>
                    </div>
                </div>
                <div className={`${styles.closeAudio} ${globalStyle.global_icon}`} dangerouslySetInnerHTML={{__html:'&#xe619;'}}
                onClick={this.onClose}>

                </div>
            </div>,
            document.body
        )
    }
}