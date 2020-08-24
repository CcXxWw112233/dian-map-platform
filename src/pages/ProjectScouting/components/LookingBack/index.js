import React,{Fragment} from 'react';
import styles from './index.less';
import { MyIcon } from '../../../../components/utils';
import { Select, Row, Col } from 'antd';
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
    Event.Evt.on('collectionListUpdate', this.setSelectionData)
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

  setSelectionData = (data)=>{
    if(!data) return ;
    clearTimeout(this.timer);
    this.timer = setTimeout(()=>{
      let arr = this.filterNotImg(data);
      this.setState({
        options: arr,
        selectActive: arr[0] ? arr[0].id : 'other',
        activeSelectObj: arr[0]
      })
    }, 500)

  }
  InitOptionGroup = ()=>{
    let { options } = this.state;
    const { Option } = Select;
    return options.map(item => {
      return (
        <Option key={item.id}>{item.name}</Option>
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
    })
  }

  setActiveChange = (data)=>{
    this.setState({
      activeTime: data.active
    })
    // console.log(data.data,'active')
  }
  setActiveData = (data) => {
    // console.log(data);
    // data = data.filter(item => DetailAction.checkCollectionType(item.target) === 'pic');
    this.setState({
      selectData: data
    })
  }

  pictureView = (val)=>{
    const { dispatch } = this.props;
    if(DetailAction.checkCollectionType(val.target) === 'pic')
    dispatch({
      type:"collectionDetail/updateDatas",
      payload:{
        selectData: val
      }
    });
  }
  Full = ()=>{
    const { dispatch } = this.props;
    dispatch({
      type:"collectionDetail/updateDatas",
      payload:{
        showCollectionsModal: true,
        zIndex: 5
      }
    })
  }

  render(){
    let { selectActive, activeSelectObj = {}, activeTime, selectData } = this.state;
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
            {(activeSelectObj.collection && activeSelectObj.collection.length) &&
            <TimeSelection data={activeSelectObj.collection} active={activeTime}
            onChangeActive={this.setActiveChange}
            onChange={this.setActiveData}
            />}
          </div>
        </div>
        <div className={styles.lookingback_collection}>
          <div className={styles.lookingback_item}>
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
          </div>
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
                zIndex: 10
              }
            })
          }}/>
        </CSSTransition>
        {/* 全屏的图片查看 */}
        <CSSTransition
        in={showCollectionsModal}
        classNames="slide"
        timeout={300}
        unmountOnExit>
          <CollectionPreview currentGroup={ activeSelectObj } currentData={this.props.selectData}/>
        </CSSTransition>
      </div>
    )
  }
}