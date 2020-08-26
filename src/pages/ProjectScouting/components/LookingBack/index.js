import React,{Fragment} from 'react';
import styles from './index.less';
import { MyIcon } from '../../../../components/utils';
import { Select, Row, Col, message } from 'antd';
import DetailAction from '../../../../lib/components/ProjectScouting/ScoutingDetail';
import TimeSelection from './TimeSelection';
import { connect } from 'dva';
import Event from '../../../../lib/utils/event';
import AllCollection from '../AllCollectionList';
import { CSSTransition } from 'react-transition-group';
import CollectionPreview from '../CollectionPreview';

@connect(({collectionDetail:{selectData, showCollectionsModal}})=>({selectData, showCollectionsModal}))
export default class LookingBack extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      options: [],
      selectActive: "",
      activeSelectObj: {},
      activeTime: {
        y: new Date().getFullYear()
      },
      selectData: [],
      previewFull: false,
      timeData: (()=>{
        let obj = {};
        for(let i = 0; i < 23; i++){
          obj[i] = [];
        }
        return obj;
      })()
    }
    this.timer = null;
  }
  componentDidMount(){
    let d = DetailAction.oldData.filter(item => !item.area_type_id);
    let obj = {
      collection: d,
      id: 'other',
      name: '未整理'
    }
    this.setSelectionData(DetailAction.CollectionGroup.concat([obj]));
    Event.Evt.on('collectionListUpdate1', this.setSelectionData);
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
      }else{
        arr.push({...item, disabled: true})
      }
    })
    return arr ;
  }

  activeGroup = ()=>{
    let { selectActive } = this.state;
    if(selectActive !== 'other'){
      DetailAction.setActiveGoupPointer(selectActive)
    }else {
      DetailAction.setActiveGoupPointer(null)
    }
  }

  setSelectionData = (data)=>{
    if(!data) return ;
    clearTimeout(this.timer);
    this.timer = setTimeout(()=>{
      let arr = this.filterNotImg(data);
      // console.log(arr)
      // DetailAction.renderGroupPointer(arr);
      this.setState({
        options: arr,
        selectActive: arr[0] ? arr[0].id : 'other',
        activeSelectObj: arr[0]
      },()=>{
        // this.activeGroup();
      })
    }, 500)

  }
  componentWillReceiveProps(nextProps){
    if(!nextProps.selectData){
      DetailAction.setGroupCollectionActive(null);
    }
    if( this.props.active !== nextProps.active && nextProps.active){
      setTimeout(()=>{
        DetailAction.renderGoupCollectionForLookingBack(this.state.selectData || []);
      },50)
    }
  }
  InitOptionGroup = ()=>{
    let { options } = this.state;
    const { Option } = Select;
    return options.map(item => {
      return (
        <Option key={item.id} disabled={item.disabled}>{item.name}</Option>
      )
    })
  }

  SelectChangeToRender = (val)=>{
    this.setState({
      selectActive: val,
      activeSelectObj: this.state.options.find(item => item.id === val),
      activeTime:{
        y: new Date().getFullYear()
      }
    },()=>{
      // this.activeGroup();
    })
  }

  setActiveChange = (data)=>{
    this.setState({
      activeTime: data.active
    })
    // console.log(data.data,'active')
  }
  setActiveData = (data) => {
    let timeData = Array.from(this.state.timeData);
    let obj = {};
    data.forEach(item => {
      let time = new Date(item.time);
      let year = time.getFullYear();
      let m = time.getMonth() + 1;
      let date = time.getDate();
      let hours = time.getHours();
      let minut = time.getMinutes();
      let key = hours;
      if(!this.state.activeTime.m && !this.state.activeTime.d){
        key = `${year}/${m}/${date}`
      }else if(this.state.activeTime.m && !this.state.activeTime.d){
        key = `${date}日 ${hours} 时`;
      }
      !obj[key] && (obj[key] = []);
      obj[key].push({...item, y: year, m: m, d: date, minutes: minut});
    })
    // 重组展示
    timeData = {...timeData, ...obj};
    DetailAction.renderGoupCollectionForLookingBack(data || []);
    this.setState({
      selectData: data || [],
      timeData
    })
  }

  pictureView = (val)=>{
    const { dispatch } = this.props;
    if(DetailAction.checkCollectionType(val.target) === 'pic')
    dispatch({
      type:"collectionDetail/updateDatas",
      payload:{
        selectData: val,
        type:'view'
      }
    });
    DetailAction.setGroupCollectionActive(val);
  }
  Full = ()=>{
    const { dispatch } = this.props;
    dispatch({
      type:"collectionDetail/updateDatas",
      payload:{
        showCollectionsModal: true,
        zIndex: 5,
        type:'view'
      }
    })
  }
  mapUpdate = ()=>{
    // console.log('要更新了')
    let { onUpdate } = this.props;
    onUpdate && onUpdate(this.state.selectActive);
  }
  // 检查选中的文件属于哪个分组
  checkSelectDataInGroup = ()=>{
    return new Promise((resolve)=>{
      const { selectData } = this.props;
      let { options } = this.state;
      if(selectData){
        let obj = {};
        options.forEach(item => {
          if(item.id === selectData.area_type_id){
            obj = item;
          }
        })
        if(!selectData.area_type_id){
          obj = options.find(item => item.id === 'other');
        }
        this.setState({
          activeSelectObj: {...obj}
        },()=>{
          resolve()
        })
      }
    })
  }
  // 切换下一个
  onNext = async ()=>{
    await this.checkSelectDataInGroup();
    const { selectData, dispatch} = this.props;
    let { activeSelectObj,options } = this.state;
    // 去除没有媒体信息的分组
    options = options.filter(item => !item.disabled);
    let index = activeSelectObj?.collection && activeSelectObj.collection.findIndex(item => item.id === selectData?.id);
    if(index!== false && index !== -1){
      if(index === activeSelectObj?.collection?.length -1){
        // 已经是最后一个了，要切换下一组
        let groupIndex = options.findIndex(item => item.id === activeSelectObj.id);
        if(groupIndex === options.length -1){
          // 分组也到了最后一个，没有后面的了
          message.warn('已经是最后一个了');
        }else{
          this.setState({
            activeSelectObj: options[groupIndex + 1],
          },()=>{
            dispatch({
              type:"collectionDetail/updateDatas",
              payload:{
                selectData: this.state.activeSelectObj.collection[0],
                type:'view'
              }
            })
          })

        }

      }else {
        // 切换下一个
        dispatch({
          type:"collectionDetail/updateDatas",
          payload:{
            selectData: activeSelectObj.collection[index + 1],
            type:'view'
          }
        })
      }
    }
  }
  onPrev = async ()=>{
    await this.checkSelectDataInGroup();
    const { selectData, dispatch} = this.props;
    let { activeSelectObj,options } = this.state;
    // 去除没有媒体信息的分组
    options = options.filter(item => !item.disabled);
    let index = activeSelectObj?.collection && activeSelectObj.collection.findIndex(item => item.id === selectData?.id);
    if(index!== false && index !== -1){
      if(index === 0){
        // 已经是第一个了，要切换上一组
        let groupIndex = options.findIndex(item => item.id === activeSelectObj.id);
        if(groupIndex === 0){
          // 分组也到了最后一个，没有后面的了
          message.warn('已经是第一个了');
        }else{
          this.setState({
            activeSelectObj: options[groupIndex - 1],
          },()=>{
            dispatch({
              type:"collectionDetail/updateDatas",
              payload:{
                selectData: this.state.activeSelectObj.collection[this.state.activeSelectObj.collection.length - 1],
                type:'view'
              }
            })
          })
        }
      }else {
        // 切换上一个
        dispatch({
          type:"collectionDetail/updateDatas",
          payload:{
            selectData: activeSelectObj.collection[index - 1],
            type:'view'
          }
        })
      }
    }

  }

  render(){
    let { selectActive, activeSelectObj = {}, activeTime, timeData } = this.state;
    const { dispatch, showCollectionsModal, board} = this.props;
    return (
      <div className={styles.lookingback}>
        <div className={styles.lookGroupTitle}>
          <div className={styles.chooseGroup}>
            <Select bordered={false} value={selectActive} size='small'
            suffixIcon={<MyIcon type='icon-xialaxuanze'/>}
            onChange={this.SelectChangeToRender}
            style={{width: 100}}>
                { this.InitOptionGroup() }
            </Select>
            <span className={styles.tofull} onClick={this.Full}>
              <MyIcon type='icon-bianzu17beifen'/>
            </span>
          </div>
          <div className={styles.remarks}>
            { activeSelectObj.remark && <Fragment>
              <div className={styles.remark_content}>
                我是备注xxxxx，我是备注xxxxxxx，我是备注xxxxx，我是备注xxxxxxx，我是备注xxxxx，我是备注xxxxxxx
              </div>
              <div className={styles.remark_create_msg}>
                <Row gutter={8}>
                  <Col span={6}>2020/06/28</Col>
                  <Col span={6}>11:50</Col>
                  <Col span={12} style={{textAlign:'right'}}>罗xx</Col>
                </Row>
              </div>
            </Fragment>
            }

          </div>
          <div className={styles.time_selection}>
            {(activeSelectObj.collection && activeSelectObj.collection.length) ?
            <TimeSelection data={activeSelectObj.collection} active={activeTime}
            onChangeActive={this.setActiveChange}
            onChange={this.setActiveData}
            /> :
            <div style={{textAlign:"center"}}>暂无可回看的采集资料（图片、视频、音频）</div>}
          </div>
        </div>
        <div className={styles.lookingback_collection}>
          {Object.keys(timeData).map(item => {
            if(timeData[item].length){
              return (
                <div key={item}>
                  <span className={styles.timeTitle}>{!isNaN(+item) ? item+' 时' : item}</span>
                  <div className={styles.lookingback_item}>
                    { timeData[item].map((data) => {
                      return (
                        <div className={styles.looking_item} key={data.time} onClick={()=> this.pictureView(data.data)}>
                          <div>
                            <span>{data.data.title}</span>
                            {DetailAction.checkCollectionType(data.data.target) === 'pic' &&
                            <img src={data.data.resource_url} alt="" width='100%'/>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            }else return <span key={item}></span>
          })}
          {/* <div className={styles.lookingback_item}>
            {selectData.map((item, index) => {
              return (
                <div className={styles.looking_item} key={index} onClick={()=> this.pictureView(item.data)}>
                  <div>
                    <span>{item.data.title}</span>
                    {DetailAction.checkCollectionType(item.data.target) === 'pic' &&
                    <img src={item.data.resource_url} alt="" width='100%'/>}
                  </div>
                </div>
              )
            })}
          </div> */}
        </div>
        {/* 左侧的所有列表 */}
        <CSSTransition
        in={showCollectionsModal}
        classNames="slideUp"
        timeout={300}
        unmountOnExit>
          <AllCollection board={board}
          onClose={()=>{
            dispatch({
              type:"collectionDetail/updateDatas",
              payload:{
                showCollectionsModal: false,
                selectData: null,
                zIndex: 10,
                type:'view'
              }
            })
          }}/>
        </CSSTransition>
      </div>
    )
  }
}
