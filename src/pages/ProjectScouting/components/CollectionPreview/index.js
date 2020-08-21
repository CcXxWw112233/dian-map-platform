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
      active: null
    }
  }
  static getDerivedStateFromProps (nextProps, preState){
    let { openPanel } = nextProps;
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
        ...obj
      }
    }else{
      let dom1 = document.querySelector('#leftToolBar');
      return {
        updateStyle:{
          width: document.body.clientWidth - (dom1 ? dom1.clientWidth : 0),
        },
        ...obj
      }
    }
    return null;
  }

  componentDidMount(){
    // console.log(this.state)
  }


  render(){
    let { updateStyle, active} = this.state;
    const { dispatch } = this.props;
    return (
      ReactDOM.createPortal(
        <div className={`${styles.viewBoxContainer}`}
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
          <div className={styles.CollectionPreviewContainer}>
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
