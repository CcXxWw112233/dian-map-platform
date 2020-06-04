import React,{ Fragment } from 'react'
import globalStyle from '../../globalSet/styles/globalStyles.less'
import styles from './index.less'
import { connect } from 'dva'

// 获取定位点
const GetPosition = ()=>{
    let sendMsg = ()=>{
        console.log('点击了定位')
        window.getPositionIcon && window.getPositionIcon.postMessage('getMyPosition');
    }
    return (
        <div className={`${styles.getPositionIcon} ${globalStyle.global_icon}`} onClick={e => {sendMsg()}}
        dangerouslySetInnerHTML={{__html:"&#xe93f;"}}>

        </div>
    )
}

@connect(({flutterPage:{ type }})=>({type}))
export default class FlutterComponents extends React.Component{
    constructor(props){
        super(props)
    }
    // 获取当前是哪个页面，需要显示什么元素
    getPageForFlutter = ()=>{
        let { type } = this.props;
        if(type === 'home'){
            return (
                <Fragment>
                    {/* 定位按钮 */}
                    <GetPosition/>
                </Fragment>
            )
        }
    }
    render(){
        return (
            <Fragment>
                {this.getPageForFlutter()}
            </Fragment>
        )
    }
}