import React, { Fragment } from 'react';
import styles from './index.less';
import { connect } from 'dva'
import ReactDOM from 'react-dom';
import { MyIcon } from '../../../../components/utils';
import animateCss from '../../../../assets/css/animate.min.css';
import PhotoSwipe from '../../../../components/PhotoSwipe/action'
import { keepLastIndex } from '../../../../utils/utils';
import DetailAction from '../../../../lib/components/ProjectScouting/ScoutingDetail'
import { message, Row, Col, Carousel } from 'antd';
import Event from '../../../../lib/utils/event';
import EditDescription from './editDescription';
import Slider from "react-slick";

@connect(({collectionDetail: { selectData ,zIndex, type} })=>({ selectData ,zIndex ,type}))
export default class CollectionDetail extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      isEdit: false,
      activeImg: {},
      disabled: false,
      sliderPages:{
        total: 1,
        current: 1
      }
    }
    this.content = React.createRef();
    this.slider = React.createRef();
  }
  componentDidMount(){
    this.InitActiveImg(this.props);
  }
  // 预览图片
  previewImg = (e)=>{
    let { selectData = {} } = this.props;
    let url = e.target.src;
    let img = new Image();
    img.src = url;
    img.onload = ()=>{
      let w = img.width;
      let h = img.height;
      PhotoSwipe.show([{ w, h, src: img.src, title:selectData.title }]);
    }
  }
  // 粘贴文本格式化
  textFormat (e) {
    e.preventDefault();
    var text;
    var clp = (e.originalEvent || e).clipboardData;
    if (clp === undefined || clp === null) {
        text = window.clipboardData.getData('text') || ''
        if (text !== '') {
        if (window.getSelection) {
            var newNode = document.createElement('span')
            newNode.innerHTML = text
            window.getSelection().getRangeAt(0).insertNode(newNode)
        } else {
            document.selection.createRange().pasteHTML(text)
        }
        }
    } else {
        text = clp.getData('text/plain') || ''
        if(clp.files.length){
            let file = clp.files[0];
            let { type } = file;
            let url = URL.createObjectURL(file);
            let img = new Image();
            img.src = url;
            img.crossorigin = "anonymous";
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            img.onload = ()=>{
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img ,0 , 0,img.width,img.height);
                let baseUrl = canvas.toDataURL('image/jpeg',1);
                document.execCommand('insertimage',false, baseUrl)
                img = null ;
                canvas = null ;
                ctx = null;
            }
        }
        if (text !== '') {
            document.execCommand('insertText', false, text)
        }
    }
  }
  toEdit = ()=>{
    let { isEdit } = this.state;
    if(!isEdit){
      this.editEnd(true);
    }
  }
  // 编辑
  editEnd = (flag)=>{
    // console.log(flag)
    this.setState({
      isEdit: flag
    },()=>{
      if(flag){
        setTimeout(()=>{
          let { current } = this.content;
          current.focus();
          keepLastIndex(current);
        }, 50)
      }else{
        this.saveEdit();
      }
    })
  }
  // 设置
  setActiveImg = (type)=>{
    let { selectData } = this.props;
    let { activeImg } = this.state;
    if(selectData && selectData.length){
      let index = selectData.find(item => activeImg.id === item.id);
      if(index !== -1){
        switch(type){
          case "next":;break;
          case "prev":;break;
          default:;
        }
      }
    }
  }

  InitActiveImg = (props)=>{
    const { selectData, type} = props;
    let { sliderPages } = this.state;
    if(selectData){
      let isArr = Array.isArray(selectData);
      if(isArr){
        let data = selectData[0];
        this.setState({
          activeImg: data,
          disabled: type === 'view',
          sliderPages: {...sliderPages, total: selectData.length, current:1}
        })
      }else {
        this.setState({
          activeImg: selectData,
          disabled: type === 'view',
          sliderPages: {...sliderPages, total: 1, current:1}
        })
      }
    }
  }

  componentWillReceiveProps(nextProps){
    const { selectData } = nextProps;
    if(selectData){
      this.InitActiveImg(nextProps);
    }
  }

  saveEdit = (text , val)=>{
    let { selectData,dispatch} = this.props;
    selectData = Array.isArray(selectData) ? selectData : selectData ? [selectData] : [];
    if(val.description === text) return ;
    let param = {
      id: val.id,
      description:text,
    }
    DetailAction.editCollection(param).then(res => {
      message.success('保存成功');
      dispatch({
        type:"collectionDetail/updateDatas",
        payload:{
          selectData:
          selectData.map(item => {
            if(item.id === val.id){
              item.description = text;
            }
            return item;
          }),
          type:'edit'
        }
      })
      let datas = DetailAction.oldData;
      let data = datas.map(item => {
        if(item.id === val.id){
          item.description = text;
        }
        return item;
      })
      Event.Evt.firEvent("CollectionUpdate:reload", data);
    })
  }

  slideChange = (current)=>{
    let { sliderPages } = this.state;
    // console.log(current)
    this.setState({
      sliderPages: {...sliderPages, current: current + 1}
    })
  }

  render(){
    const { sliderPages } = this.state;
    let { dispatch ,zIndex, selectData} = this.props;
    // let selectData = activeImg || {};
    selectData = Array.isArray(selectData) ? selectData: selectData ? [selectData] : null;
    // let oldRemark = selectData && selectData.description;
    // if (oldRemark?.trim() === "") {
    //   oldRemark = null
    // }
    // let { create_by, create_time } = selectData;
    // let time = DetailAction.dateFormat(create_time, "yyyy/MM/dd");
    // let hours = DetailAction.dateFormat(create_time, "HH:mm");
    return (
      ReactDOM.createPortal(
        <div className={`${styles.collection_detail}`}
        style={{zIndex: zIndex}}>
          <div className={styles.detail_title}>
            <span className={styles.pages}>
              {sliderPages.current}/{sliderPages.total}
            </span>
            {/* <span className={styles.edit}>
              {isEdit ? <MyIcon type='icon-bianzu7beifen' onClick={(e)=> this.editEnd(false)}/> :
              <MyIcon type="icon-bianzu7beifen4" onClick={()=> this.editEnd(true)}/>}
            </span> */}
            <span className={styles.close}>
              <MyIcon type="icon-guanbi2" onClick={()=> dispatch({
                type:'collectionDetail/updateDatas',payload:{selectData:null}
              })}/>
            </span>
          </div>
          <div className={styles.container}>
            { (selectData && selectData.length > 1) && (
              <Fragment>
                <span className={styles.prev}
                onClick={()=> {this.slider.current?.prev()}}>
                  <MyIcon type="icon-bianzu681"/>
                </span>
                <span className={styles.next}
                onClick={()=> {this.slider.current?.next()}}>
                  <MyIcon type="icon-bianzu671"/>
                </span>
              </Fragment>
            ) }
            <Carousel ref={this.slider} loop={false} afterChange={this.slideChange}>
              { selectData && selectData.map(item => {
                return (<div key={item.id}>
                  <div className={styles.container_img}>
                    <img src={item.resource_url} alt="" onClick={this.previewImg}/>
                  </div>
                  <div className={styles.data_msg}>
                    <div className={styles.data_title}>
                      {item.title ? <span>{item.title}</span> : <span>&nbsp;</span>}
                    </div>
                    <EditDescription disabled={this.state.disabled} data={item} onEdit={this.saveEdit}/>
                    <div className={styles.creator}>
                      <Row gutter={10}>
                        <Col span={12}>
                          {item.create_by && item.create_by.name}
                        </Col>
                        <Col span={6} style={{textAlign:"center"}}>
                          {DetailAction.dateFormat(item.create_time, "yyyy/MM/dd")}
                        </Col>
                        <Col span={6} style={{textAlign:"center"}}>
                          { DetailAction.dateFormat(item.create_time, "HH:mm")}
                        </Col>
                      </Row>
                    </div>
                  </div>
                </div>)
              })}
            </Carousel>
          </div>
        </div>,
        document.body
      )
    )
  }
}
