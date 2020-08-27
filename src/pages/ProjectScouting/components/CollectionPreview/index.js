import React from 'react';
import styles from './index.less';
import ReactDOM from 'react-dom';
import animateCss from '../../../../assets/css/animate.min.css';
import { connect } from 'dva';
import { MyIcon } from '../../../../components/utils';
import MapMain from '../../../../utils/INITMAP';
import DetailAction from '../../../../lib/components/ProjectScouting/ScoutingDetail';
import { Fit , getExtentIsEmpty} from '../../../../lib/utils';
import EditImage from './EditImg';

@connect(({openswitch:{openPanel}})=>({openPanel}))
export default class CollectionPreview extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      updateStyle:{},
      datas: [],
      active: null,
      update: 0,
      isEdit: false
    }
    this.imgContent = React.createRef();
    this.touchStart = false;
    this.startEvent = {};
    this.windowHeight = document.body.clientHeight;
    this.minImgHeight = 400;
    this.map = MapMain.map;
    this.view = MapMain.view;
  }
  static getDerivedStateFromProps (nextProps){
    let { openPanel } = nextProps;
    let obj = {
      // datas: nextProps.currentGroup,
      // active: nextProps.currentData
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
      }
    }else{
      let dom1 = document.querySelector('#leftToolBar');
      return {
        updateStyle:{
          width: document.body.clientWidth - (dom1 ? dom1.clientWidth : 0),
        },
        ...obj,
      }
    }
    return null;
  }

  componentDidMount(){
    // console.log(this.state)
    setTimeout(()=>{
      this.initPadding();
      this.props.dispatch({
        type:"collectionDetail/updateDatas",
        payload:{
          selectData: this.state.active,
          type:'view'
        }
      })
    }, 500)
    window.addEventListener('resize', ()=>{
      this.setState({
        update: this.state.update + 1
      })
    })
  }
  // 简化坐标
  getPointer = (e)=>{
    return {x:e.pageX, y: e.pageY}
  }

  initPadding = ()=>{
    let { current } = this.imgContent;
    let height = current.clientHeight;
    let padding = [height + 60, 100, 40, Math.abs(this.state.updateStyle.width - document.body.clientWidth)]
    this.fitview({padding})
  }

  fitview = ({padding, duration = 300})=>{
    let extent = DetailAction.Source.getExtent();
    if(!getExtentIsEmpty(extent))
    Fit(this.view,extent,{
      padding
    },duration).then(res => {

    })
  }

  pointerdown = (e)=>{
    if(e.target){
      console.log(e.target.id)
      if(e.target.id === 'slidebar_preview'){
        this.touchStart = true;
        this.startEvent = this.getPointer(e);
      }
    }
  }

  pointermove = (e)=>{
    let { onFull } = this.props;
    if(!this.touchStart) return ;
    let { current } = this.imgContent;
    let targetHeight = current.clientHeight;
    // console.log(current.clientHeight)
    let moveEvent = this.getPointer(e);
    let y = this.startEvent.y - moveEvent.y;
    if(targetHeight >= this.windowHeight - 100 && y < 0){
      // console.log('到底了');
      onFull && onFull();
      this.touchStart = false;
      return ;
    }
    if(targetHeight <= this.minImgHeight && y > 0){
      // console.log('到了最小高度了');
      return ;

    }

    targetHeight -= y;
    this.fitview({padding:[ targetHeight + 60, 100, 40, Math.abs(this.state.updateStyle.width - document.body.clientWidth)]})
    let percent = (targetHeight / this.windowHeight).toFixed(4);
    // current.style.height = targetHeight +'px';
    current.style.height = (percent*100)+'%';
    this.startEvent = moveEvent;
  }

  pointerout = ()=>{
    this.touchStart = false;
    this.startEvent = {};
  }

  onChageEdit = ()=>{
    let { onFull } = this.props;
    this.setState({
      isEdit: true,
    })
    onFull && onFull();
  }

  exit = ()=>{
    this.setState({
      isEdit: false,
    })
  }


  render(){
    let { updateStyle, isEdit} = this.state;
    const { dispatch, onExitFull, Full , currentData} = this.props;
    return (
      ReactDOM.createPortal(
        <div className={`${styles.viewBoxContainer} ${ Full ? styles.imgContentIsFull : styles.imgContentNotFull}`}
        ref={this.imgContent}
        onPointerDown={this.pointerdown}
        onPointerMove={this.pointermove}
        onPointerUp={this.pointerout}
        style={updateStyle}>
          <span className={styles.closeModal} onClick={()=>{
            dispatch({
              type:"collectionDetail/updateDatas",
              payload:{
                showCollectionsModal: false,
                selectData: null,
                zIndex: 10,
                type:'view'
              }
            })
          }}>
            <MyIcon type="icon-guanbi2"/>
          </span>
          <span className={styles.slidebar}
          id="slidebar_preview"
          ></span>

          <div className={styles.contentTitle}>
            <div className={styles.title_name}>{currentData?.title}</div>
            <div className={styles.title_remark}>{currentData?.description}</div>
          </div>

          <div className={styles.tools}>
            {/* <span className={styles.edit} onClick={this.onChageEdit}>
              <MyIcon type='icon-huabi'/>
            </span> */}
            <span className={styles.prevImg} onClick={()=>{
                this.props.onPrev && this.props.onPrev();
              }}>
              <MyIcon type="icon-bianzu681" />
            </span>
            <span className={styles.nextImg} onClick={()=>{
                this.props.onNext && this.props.onNext();
              }}>
              <MyIcon type="icon-bianzu671"/>
            </span>
          </div>

          {
            Full &&
            <span className={`${styles.goBackMap} ${animateCss.animated} ${animateCss.fadeInUp}`} onClick={()=> {onExitFull && onExitFull()}}>
              <img src={require('../../../../assets/backmap.png')} alt=""/>
            </span>
          }
          {
            isEdit ? (
              <div className={styles.editImg}>
                <EditImage onExit={this.exit}/>
              </div>
            )
            :(
              <div className={`${styles.CollectionPreviewContainer}`}>
                <div className={styles.activeMedia}>
                  <img src={currentData?.resource_url} alt=""/>
                </div>
              </div>
            )
          }
        </div>,
        document.body.querySelector('#IndexPage')
      )
    )
  }
}
