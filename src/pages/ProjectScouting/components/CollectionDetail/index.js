import React from 'react';
import styles from './index.less';
import { connect } from 'dva'
import ReactDOM from 'react-dom';
import { MyIcon } from '../../../../components/utils';
import animateCss from '../../../../assets/css/animate.min.css';
import PhotoSwipe from '../../../../components/PhotoSwipe/action'
import { keepLastIndex } from '../../../../utils/utils';
import DetailAction from '../../../../lib/components/ProjectScouting/ScoutingDetail'
import { message, Row, Col } from 'antd';
import Event from '../../../../lib/utils/event'

@connect(({collectionDetail: { selectData } })=>({ selectData }))
export default class CollectionDetail extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      isEdit: false
    }
    this.content = React.createRef();
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
      this.editEnd();
    }
  }
  // 编辑
  editEnd = ()=>{
    let { isEdit } = this.state;
    const { selectData, dispatch } = this.props;
    if(!isEdit){
      this.setState({
        isEdit: true
      },()=>{
        setTimeout(()=>{
          let { current } = this.content;
          current.focus();
          keepLastIndex(current);
        }, 50)
      })
    }else{
      // 保存
      this.setState({
        isEdit: false
      },()=>{
        let { current } = this.content;
        let text = current.textContent
        if(selectData.description === text) return ;
        let param = {
          id: selectData.id,
          description:text,
        }
        DetailAction.editCollection(param).then(res => {
          message.success('保存成功');
          dispatch({
            type:"collectionDetail/updateDatas",
            payload:{
              selectData: {...selectData, description: text}
            }
          })
          let datas = DetailAction.oldData;
          let data = datas.map(item => {
            if(item.id === selectData.id){
              item.description = text;
            }
            return item;
          })
          Event.Evt.firEvent("CollectionUpdate:reload", data);
        })
      })
    }
  }

  render(){
    const { isEdit } = this.state;
    const { selectData = {}, dispatch} = this.props;
    let oldRemark = selectData.description;
    if (oldRemark?.trim() === "") {
      oldRemark = null
    }
    let { create_by, create_time } = selectData;
    let time = DetailAction.dateFormat(create_time, "yyyy/MM/dd");
    let hours = DetailAction.dateFormat(create_time, "HH:mm");
    return (
      ReactDOM.createPortal(
        <div className={`${styles.collection_detail} ${animateCss.animated} ${animateCss.slideInRight} ${animateCss.fadeIn}`}>
          <div className={styles.detail_title}>
            <span className={styles.edit} onClick={this.editEnd}>
              {isEdit ? <MyIcon type='icon-bianzu7beifen'/> : <MyIcon type="icon-bianzu7beifen4"/>}
            </span>
            <span className={styles.close}>
              <MyIcon type="icon-guanbi2" onClick={()=> dispatch({type:'collectionDetail/updateDatas',payload:{selectData:null}})}/>
            </span>
          </div>
          <div className={styles.container}>
            <div className={styles.container_img}>
              <img src={selectData.resource_url} alt="" onClick={this.previewImg}/>
            </div>
            <div className={styles.data_msg}>
              <div className={styles.data_title}>
                {selectData.title}
              </div>
              <div className={`${styles.data_remark} ${isEdit ? styles.activeEdit :""}`} suppressContentEditableWarning
              onPaste={this.textFormat}
              ref={this.content}
              placeholder="未添加备注哦"
              onBlur={this.editEnd}
              onDoubleClick={this.toEdit}
              contentEditable={isEdit}>
                {oldRemark}
              </div>
              <div className={styles.creator}>
                <Row gutter={10}>
                  <Col span={12}>
                    {create_by.name}
                  </Col>
                  <Col span={6} style={{textAlign:"center"}}>
                    {time}
                  </Col>
                  <Col span={6} style={{textAlign:"center"}}>
                    {hours}
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
    )
  }
}
