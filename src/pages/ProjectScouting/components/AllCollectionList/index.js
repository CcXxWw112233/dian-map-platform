import React from 'react';
import styles from './index.less';
import { MyIcon } from '../../../../components/utils';
import DetailAction from '../../../../lib/components/ProjectScouting/ScoutingDetail';
import Event from '../../../../lib/utils/event';
import ReactDOM from 'react-dom';
import { connect } from 'dva';
import { CSSTransition } from 'react-transition-group';
import CollectionPreview from '../CollectionPreview';
import { message } from 'antd';
import TimeSelection from '../LookingBack/TimeSelection';

@connect(({collectionDetail:{selectData, showCollectionsModal},scoutingDetail:{collections}})=>({selectData, showCollectionsModal,collections}))
export default class AllCollection extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      data: [],
      priviewData:[],
      previewFull: false,
      timeTree:{},
      collectionlist: [],
      active: {},
      hasFilter: false,
      collections:[],
      activeTime: {
        y: new Date().getFullYear()
      },
    }
    this.keys = {
      pic:"图片",
      video: "视频",
      interview:"音频"
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
    Event.Evt.on('collectionListUpdate2', this.setUpdateData)
    Event.Evt.addEventListener('handleGroupCollectionFeature', this.handleCollectionFeature)
  }
  componentWillUnmount(){
    Event.Evt.un('collectionListUpdate2');
    Event.Evt.removeEventListener('handleGroupCollectionFeature', this.handleCollectionFeature);
    Event.Evt.firEvent('previewDeatilClose',{});
  }

  handleCollectionFeature = (collections ,from = 'feature')=>{
    let priviewData = JSON.parse(JSON.stringify(this.state.data))
    let ids = collections.map(item => item.id);
    let arr = []
    priviewData.forEach(item => {
      let collection = item.collection;
      collection = collection.filter(col => ids.includes(col.id));
      item.collection = collection;
      if(collection.length){
        arr.push(item);
      }
    })
    // console.log(arr);
    let group = this.setGroupForArray(arr);
    let list = [];
    arr.forEach(item => {
      list = list.concat(item.collection);
    })
    let active = list[0];
    this.setState({
      timeTree: group,
      // data: arr,
      collectionlist: list,
      active,
      hasFilter: from === 'feature' ? true : (this.state.activeTime.y && !this.state.activeTime.m && !this.state.activeTime.d) ? false: true
    })
    if(from === 'time'){
      DetailAction.renderGoupCollectionForLookingBack(list);
    }
    DetailAction.setGroupCollectionActive(active)
  }

  getAllCollection = (data)=>{
    let arr = [];
    data.forEach(item => {
      arr = arr.concat(item.collection);
    })
    this.setState({
      collections: arr
    })
  }

  filterNotImg = (data)=>{
    let arr = [];
    data.forEach(item => {
      let collection = item.collection || [];
      let s = [];
      collection.forEach(col => {
        if(col.child){
          s = s.concat(col.child);
        }else
        s.push(col);
      })
      let fArr = s.filter(col => ['pic','video','interview'].includes(DetailAction.checkCollectionType(col.target)));
      if(fArr.length){
        let obj = {
          ...item,
          collection: fArr
        }
        arr.push(obj);
      }
    })
    this.getAllCollection(arr);
    return arr ;
  }

  // 设置分组的树形数据
  setGroupForArray = (data)=>{
    let groups = {}
    data.forEach(item => {
      let collection = item.collection;
      let obj = {};
      !groups[item.id] && (groups[item.id] = {});
      collection.forEach(coll => {
        let time = new Date(+coll.create_time);
        let y = time.getFullYear();
        let m = time.getMonth() +1 ;
        let d = time.getDate();
        let h = time.getHours();
        let minutes = time.getMinutes();
        !obj[y] && (obj[y] = {});
        !obj[y][m] && (obj[y][m] = {});
        !obj[y][m][d] && (obj[y][m][d] = [])
        obj[y][m][d].push({data: coll, date: time, y,m,d,h,minutes});
      })
      groups[item.id] = obj;
    })
    return groups;
  }

  // 更新列表
  setUpdateData = (data)=> {
    let arr = this.filterNotImg(data);
    let list = [];
    arr.forEach(item => {
      list = list.concat(item.collection);
    })
    DetailAction.renderGoupCollectionForLookingBack(list);

    let groups = this.setGroupForArray(arr);
    // console.log(groups)
    this.setState({
      data: arr,
      priviewData: arr,
      timeTree: groups,
      collectionlist: list,
    })
    this.setActive(list[0])
  }

  setActive = (val)=>{
    this.setState({
      active: val
    })
    DetailAction.setGroupCollectionActive(val);
  }

  renderHoursForDays = (month,val,index)=>{
    let keys = Object.keys(month);
    // keys.forEach()
    return keys.map(m => {
      return (
      <div key={m} className={styles.month_item}>
        <span className={styles.timeMonth}>{val.year}/{val.month}/{m}</span>
        <div className={styles.collectionRender}>
          { Object.keys(month[m]).map(day => {
            let data = month[m][day].data;
            let k = DetailAction.checkCollectionType(data.target)
            return <div key={data.id}
              className={`${styles.collectionItem} ${this.state.active.id === data.id ? styles.activity : ""}`}
              >
              <div
              onClick={()=>{this.setActive(data)}}
              style={{width:'100%',height:'100%'}}>
                {
                  k === 'pic' ?
                <img src={data.resource_url} alt=""/>
                :
                <div style={{height:"100%",backgroundColor:"rgba(71, 74, 91, 1)",display:"flex",justifyContent:"center",alignItems:"center",color:"#fff"}}>
                  {this.keys[k]}
                </div>
                }
              </div>
            </div>
          }) }
        </div>
      </div>)
    })
  }

  onPrev = ()=>{
    let { active, collectionlist } = this.state;
    let index = collectionlist.findIndex(item => item.id === active.id);
    if(index !== -1 && index > 0){
      this.setActive(collectionlist[index - 1])
    }else {
      message.warn('已经是第一个了')
    }
  }
  onNext = ()=>{
    let { active, collectionlist } = this.state;
    let index = collectionlist.findIndex(item => item.id === active.id);
    if(index !== -1 && index < collectionlist.length - 1){
      this.setActive(collectionlist[index + 1])
    }else {
      message.warn('已经是最后一个了')
    }
  }

  // 重置搜索
  reset = ()=>{
    this.setUpdateData(this.state.data);
    this.setState({
      hasFilter: false,
      activeTime: {y: new Date().getFullYear()}
    })
  }

  setActiveChange = (data)=>{
    this.setState({
      activeTime: data.active
    })
    // console.log(data.data,'active')
  }

  setActiveData = (data)=>{
    // console.log(data);
    let arr = data.map(item => item.data);
    if(arr.length)
    this.handleCollectionFeature(arr, 'time');
  }
  render(){
    const { data , timeTree, hasFilter} = this.state;
    const { board, onClose, showCollectionsModal} = this.props;
    return (
      ReactDOM.createPortal(
        <div className={styles.collectionBox}>
          <div className={styles.containerHeader}>
            <div className={styles.filterAction}>
              <span className={styles.board_name}>
                {board.board_name}
              </span>
              {hasFilter && <span className={styles.clearFilter} onClick={this.reset}>
                <MyIcon type="icon-zhongzhi"/>重置
              </span>}
              <span className={styles.exitFull} onClick={()=> {onClose && onClose()}}>
                <MyIcon type='icon-bianzu17beifen2'/>
              </span>
              <TimeSelection data={this.state.collections} active={this.state.activeTime}
              idKey="allLook"
              onChangeActive={this.setActiveChange}
              onChange={this.setActiveData}
              />
            </div>

          </div>
          <div className={styles.content}>
            <div className={styles.collectionContent}>
              { Object.keys(timeTree).map((group) => {
                return (
                  <div key={group} className={styles.collectionGroup}>
                  <span className={styles.collectionGroupName}>{data.find(d => d.id === group)?.name}</span>
                    { Object.keys(timeTree[group]).map(year => {
                      return Object.keys(timeTree[group][year]).map((month,index) => {
                        return this.renderHoursForDays(timeTree[group][year][month],{group,year,month},index)
                      })
                    }) }
                  </div>
                )
              }) }
            </div>
          </div>
          {/* 全屏的图片查看 */}
          <CSSTransition
          in={showCollectionsModal}
          classNames="slide"
          timeout={300}
          unmountOnExit>
            <CollectionPreview
            // currentGroup={ activeSelectObj }
            // currentData={this.props.selectData}
            currentData={this.state.active}
            Full={this.state.previewFull}
            // onUpdate={this.mapUpdate}
            onNext={this.onNext}
            onPrev={this.onPrev}
            onFull={()=>{
              this.setState({
                previewFull: true
              })
            }}
            onExitFull={()=>{
              this.setState({
                previewFull: false
              })
            }}
            />
          </CSSTransition>
        </div>,
        document.body.querySelector('#detailContent')
      )
    )
  }
}
