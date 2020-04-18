import React, { PureComponent } from 'react'
import { Button, Tooltip } from 'antd'
import style from './LayerControl.less'
import globalStyle from '@/globalSet/styles/globalStyles.less'

export default class LayerControl extends PureComponent {
  constructor(props){
    super(props)
    this.state = {
      display: 'none'
    }
  }
  handleShowPanelClick = () => {
    const { display } = this.state 
    let myDisplay = display
    if (myDisplay === 'none') {
      myDisplay = 'flex'
    } else {
      myDisplay = 'none'
    }
    this.setState({display: myDisplay})

  }
  changeBaseMap = () => {

  }

  render(){
    const { display } = this.state

    return (
      <Tooltip title="图层管理" className={style.wrapper}>
        <div style={{display: display}} className={style.panel}>
          <div className={style.layerTitle}></div>
          <div className={style.layerItems}>
            <div className={style.layerItem} key="google">
              <p className={style.layerName}>谷歌卫星</p>
            </div>
            <div className={style.layerItem} key="google">
              <p className={style.layerName}>高德地图</p>
            </div>
            <div className={style.layerItem}>
              <p className={style.layerName}>百度地图</p>
            </div>
            <div className={style.layerItem}>
              <p className={style.layerName}>天地图</p>
            </div>
          </div>
        </div>
      <Button shape="circle" onClick={() => this.handleShowPanelClick()}>
        <i className={globalStyle.global_icon} >&#xe6ac;</i>
      </Button>
    </Tooltip>
    )
  }
}