import React from 'react';
import styles from './index.less';
import { MyIcon } from '../../../../components/utils';
import DetailAction from '../../../../lib/components/ProjectScouting/ScoutingDetail';
import Event from '../../../../lib/utils/event';
import ReactDOM from 'react-dom';
import { connect } from 'dva';

@connect(({collectionDetail:{selectData}})=>({selectData}))
export default class AllCollection extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      data: []
    }
  }
  componentDidMount(){
    let d = DetailAction.oldData.filter(item => !item.area_type_id);
    let obj = {
      collection: d,
      id: 'other',
      name: '未整理'
    }
    this.setUpdateData(DetailAction.CollectionGroup.concat([obj]));
    Event.Evt.on('collectionListUpdate', this.setUpdateData)
  }
  filterNotImg = (data)=>{
    let arr = [];
    data.forEach(item => {
      let collection = item.collection || [];
      let fArr = collection.filter(col => DetailAction.checkCollectionType(col.target) === 'pic');
      if(fArr.length){
        let obj = {
          ...item,
          collection: fArr
        }
        arr.push(obj);
      }
    })
    return arr ;
  }

  setUpdateData = (data)=> {
    let arr = this.filterNotImg(data);
    this.setState({
      data: arr
    })
  }

  setActive = (val)=>{
    const { dispatch } = this.props;
    dispatch({
      type:"collectionDetail/updateDatas",
      payload:{
        selectData: val
      }
    })
  }

  render(){
    const { data } = this.state;
    const { board, onClose, selectData = {}} = this.props;
    return (
      ReactDOM.createPortal(
        <div className={styles.collectionBox}>
          <div className={styles.containerHeader}>
            <span className={styles.board_name}>
              {board.board_name}
            </span>
            <span className={styles.exitFull} onClick={()=> {onClose && onClose()}}>
              <MyIcon type='icon-bianzu17beifen2'/>
            </span>
          </div>
          <div className={styles.content}>
            <div className={styles.collectionContent}>
              {data.map((item, index) => {
                return (
                  <div key={item.id} className={styles.collectionGroup}>
                    <span className={styles.collectionGroupName}>{item.name}</span>
                    <div className={styles.collectionRender}>
                      { item.collection && item.collection.map((collec, i) => {
                        return <div key={collec.id}
                        className={`${styles.collectionItem} ${(selectData && selectData.id) === collec.id ? styles.activity :
                          (!selectData ? (index === 0 && i === 0) ? styles.activity: "" :"") }`}
                        >
                          <div
                          onClick={()=>{this.setActive(collec)}}>
                            <img src={collec.resource_url} alt=""/>
                          </div>
                        </div>
                      }) }
                    </div>

                  </div>
                )
              })}
            </div>
          </div>
        </div>,
        document.body.querySelector('#detailContent')
      )
    )
  }
}
