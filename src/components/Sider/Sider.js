import React, { PureComponent } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import styles from "./Sider.less";
import { connect } from 'dva'
import { Icon } from 'antd'

@connect(({openswitch:{ slideSwitch ,showSlideButton}})=>({ slideSwitch ,showSlideButton}))
export default class Sider extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  showDrawer = () => {
    let { dispatch ,slideSwitch } = this.props;
    // 开关slide
    dispatch({
      type:"openswitch/updateDatas",
      payload:{
        slideSwitch: !slideSwitch
      }
    })
  }

  toOld = ()=>{
    let search = window.location.search || window.location.hash;
    let origin = window.location.origin;
    let href = origin + '/oldpage/'+search.replace('#/','');
    setTimeout(()=>{
      window.open(href,'_self');
    },500)
    
  }

  render() {
    const { width, children , slideSwitch ,showSlideButton } = this.props;
    let style = {
      width: width,
    };
    if (!slideSwitch) {
      style = { ...style, ...{ transform: "translateX(-100%)" } };
    }
    return (
      <div className={styles.wrap} style={style}>
        {
          showSlideButton && 
          <a className={styles.changePackage} onClick={this.toOld} target='_self'>
            切换旧版
          </a>
        }
        
        <div className={styles.main}>{children && children}</div>
        {
          showSlideButton ?
            <div className={styles.conttroller} onClick={this.showDrawer}>
            {slideSwitch ? (
              <Icon type="left" LeftOutlined className={styles.myDirection} />
            ) : (
              <Icon type="right" RightOutlined className={styles.myDirection} />
            )}
            <span className={styles.txt}>{slideSwitch ? '收起':'展开'}</span> 
          </div>
          : ""
        }
        
      </div>
    );
  }
}
