import React from 'react';
import styles from './index.less';
import ReactDOM from 'react-dom';
// import animateCss from '../../../../assets/css/animate.min.css';
import { connect } from 'dva';
import { MyIcon } from '../../../../components/utils';


@connect(({openswitch:{openPanel}})=>({openPanel}))
export default class CollectionPreview extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      updateStyle:{},
      datas: [],
      active: null,
      isFull: false
    }
    this.imgContent = React.createRef();
    this.touchStart = false;
    this.startEvent = {};
    this.windowHeight = document.body.clientHeight;
    this.minImgHeight = 400;
  }
  static getDerivedStateFromProps (nextProps, preState){
    let { openPanel, Full} = nextProps;
    let obj = {
      datas: nextProps.currentGroup,
      active: nextProps.currentData || nextProps.currentGroup.collection[0]
    }
    if(openPanel){
      let width = 0;
      let dom1 = document.querySelector('#leftToolBar');
      let dom2 = document.querySelector('#leftPanel');
      if(dom1){
        width += dom1.clientWidth;
      }
      if(dom2){
        width += dom2.clientWidth;
      }
      return {
        updateStyle: {
          width: document.body.clientWidth - width
        },
        ...obj,
        isFull: Full
      }
    }else{
      let dom1 = document.querySelector('#leftToolBar');
      return {
        updateStyle:{
          width: document.body.clientWidth - (dom1 ? dom1.clientWidth : 0),
        },
        ...obj,
        isFull: Full
      }
    }
    return null;
  }

  componentDidMount(){
    // console.log(this.state)
  }
  // 简化坐标
  getPointer = (e)=>{
    return {x:e.pageX, y: e.pageY}
  }

  pointerdown = (e)=>{
    this.touchStart = true;
    this.startEvent = this.getPointer(e);
  }

  pointermove = (e)=>{
    if(!this.touchStart) return ;
    let { current } = this.imgContent;
    // console.log(current.clientHeight)
    console.log(this.startEvent)
  }

  pointerout = ()=>{
    this.touchStart = false;
    this.startEvent = {};
  }


  render(){
    let { updateStyle, active} = this.state;
    const { dispatch } = this.props;
    return (
      ReactDOM.createPortal(
        <div className={`${styles.viewBoxContainer} ${styles.imgContentNotFull}`}
        ref={this.imgContent}
        style={updateStyle}>
          <span className={styles.closeModal} onClick={()=>{
            dispatch({
              type:"collectionDetail/updateDatas",
              payload:{
                showCollectionsModal: false,
                selectData: null,
                zIndex: 10
              }
            })
          }}>
            <MyIcon type="icon-guanbi2"/>
          </span>
          <span className={styles.slidebar}
          onPointerDown={this.pointerdown}
          onPointerMove={this.pointermove}
          onPointerOut={this.pointerout}
          onPointerUp={this.pointerout}
          ></span>
          <div className={`${styles.CollectionPreviewContainer}`}>
            <div className={styles.activeMedia}>
              <img src={active.resource_url} alt=""/>
            </div>
          </div>
        </div>,
        document.body.querySelector('#IndexPage')
      )
    )
  }
}
