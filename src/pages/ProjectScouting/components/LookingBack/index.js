import React, { Fragment } from 'react'
import styles from './index.less'
import animateCss from '../../../../assets/css/animate.min.css'
import { MyIcon } from '../../../../components/utils'
import { Select, Row, Col, message, Button, Tooltip } from 'antd'
import DetailAction from '../../../../lib/components/ProjectScouting/ScoutingDetail'
import ViewAction from '../../../../lib/components/ProjectScouting/viewFeatures'
import TimeSelection from './TimeSelection'
import { connect } from 'dva'
import Event, {
  CLICKVIEWFEATURE,
  CLICKVIEWGROUPFEATURE
} from '../../../../lib/utils/event'
import AllCollection from '../AllCollectionList'
import { CSSTransition } from 'react-transition-group'
import globalStyle from '@/globalSet/styles/globalStyles.less'
import { CollectionInfoModel } from '../../../../models/collectionInfo'
import { OTHERGROUPKEY } from '../../../../globalSet/constans'
// import CollectionPreview from '../CollectionPreview';

const times = (() => {
  let obj = {}
  for (let i = 0; i < 23; i++) {
    obj[i] = []
  }
  return obj
})()
@connect(
  ({
    collectionDetail: { selectData, showCollectionsModal },
    [CollectionInfoModel.namespace]: { collectionGroups }
  }) => ({
    selectData,
    showCollectionsModal,
    collectionGroups
  })
)
export default class LookingBack extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      options: [],
      selectActive: '',
      activeSelectObj: {},
      activeTime: {
        y: new Date().getFullYear()
      },
      selectData: [],
      previewFull: false,
      timeData: times,
      /** 选中的分组 */
      selectedGroup: null
    }
    this.timer = null
    Event.Evt.on(CLICKVIEWFEATURE, this.pictureView)
    Event.Evt.on(CLICKVIEWGROUPFEATURE, this.handleClickGroup)
  }
  componentDidMount() {
    let d = DetailAction.oldData.filter(item => !item.area_type_id)
    let obj = {
      collection: d,
      id: 'other',
      name: '未整理'
    }
    this.setSelectionData(DetailAction.CollectionGroup.concat([obj]))
    Event.Evt.on('collectionListUpdate1', this.setSelectionData)
    Event.Evt.on('previewDeatilClose', () => {
      ViewAction.renderGroupCollections(this.state.selectedGroup?.collection || [])
      // DetailAction.renderGoupCollectionForLookingBack(
      //   this.state.activeSelectObj?.collection || []
      // )
    })
  }
  componentWillUnmount() {
    Event.Evt.un('collectionListUpdate1')
    Event.Evt.un('previewDeatilClose')
    Event.Evt.un(CLICKVIEWFEATURE)
    Event.Evt.un(CLICKVIEWGROUPFEATURE)
  }

  filterNotImg = data => {
    let arr = []
    data.forEach(item => {
      let collection = item.collection || []
      let s = []
      collection.forEach(col => {
        if (col.child) {
          s = s.concat(col.child)
        } else s.push(col)
      })
      let fArr = s.filter(col =>
        ['pic', 'video', 'interview', 'plotting'].includes(
          DetailAction.checkCollectionType(col.target)
        )
      )
      if (fArr.length) {
        let obj = {
          ...item,
          collection: fArr
        }
        arr.push(obj)
      }
      //  else {
      //   arr.push({ ...item, disabled: true, collection: [] });
      // }
    })

    return arr
  }

  activeGroup = () => {
    let { selectActive } = this.state
    if (selectActive !== 'other') {
      // DetailAction.setActiveGoupPointer(selectActive)
    } else {
      // DetailAction.setActiveGoupPointer(null)
    }
  }

  componentWillUnmount() {
    ViewAction.clearCollections()
    Event.Evt.un(CLICKVIEWFEATURE)
    Event.Evt.un(CLICKVIEWGROUPFEATURE)
    const { dispatch } = this.props
    dispatch({
      type: 'collectionDetail/updateDatas',
      payload: {
        showCollectionsModal: false,
        selectData: null,
        zIndex: 10,
        type: 'view',
        isImg: true
      }
    })
  }

  setSelectionData = data => {
    if (!data) return
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      let arr = this.filterNotImg(data)
      // DetailAction.renderGroupPointer(arr);
      this.setState(
        {
          options: arr,
          selectActive: arr[0] ? arr[0].id : 'other',
          activeSelectObj: arr[0],
          activeTime: {
            y: this.state.activeTime.y
          },
          timeData: times
        },
        () => {
          // this.activeGroup();
          ViewAction.renderGroupCoordinates(arr)
        }
      )
    }, 500)
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.selectData) {
      // DetailAction.setGroupCollectionActive(null)
    }
    if (this.props.active !== nextProps.active && nextProps.active) {
      setTimeout(() => {
        // DetailAction.renderGoupCollectionForLookingBack(
        //   this.state.selectData || []
        // )
      }, 50)
    }
  }
  InitOptionGroup = () => {
    let { options } = this.state
    const { Option } = Select
    let disabledOptions = options.filter(item => item.disabled === true)
    let nonDisableOptions = options.filter(item => !item.disabled)
    options = [...nonDisableOptions, ...disabledOptions]
    return options.map(item => {
      return (
        <Option key={item.id} disabled={item.disabled}>
          {item.name}
        </Option>
      )
    })
  }

  /** 更新分组分类选择 */
  SelectChangeToRender = val => {
    this.setState(
      {
        selectActive: val,
        activeSelectObj: this.state.options.find(item => item.id === val),
        activeTime: {
          y: new Date().getFullYear()
        }
      },
      () => {
        // this.activeGroup();
      }
    )
  }

  setActiveChange = data => {
    this.setState({
      activeTime: data.active
    })
    // console.log(data.data,'active')
  }
  setActiveData = data => {
    let timeData = Array.from(this.state.timeData)
    let obj = {}
    data.forEach(item => {
      let time = new Date(item.time)
      let year = time.getFullYear()
      let m = time.getMonth() + 1
      let date = time.getDate()
      let hours = time.getHours()
      let minut = time.getMinutes()
      let key = hours
      if (!this.state.activeTime.m && !this.state.activeTime.d) {
        key = `${year}/${m}/${date}`
      } else if (this.state.activeTime.m && !this.state.activeTime.d) {
        key = `${date}日 ${hours} 时`
      }
      !obj[key] && (obj[key] = [])
      obj[key].push({ ...item, y: year, m: m, d: date, minutes: minut })
    })
    // 重组展示
    timeData = { ...timeData, ...obj }
    // DetailAction.renderGoupCollectionForLookingBack(data || [])
    this.renderGroupCollection(data)
    this.setState({
      selectData: data || [],
      timeData
    })
  }

  /** 渲染分组内的所有特征数据合集 */
  renderGroupCollection = data => {
    /** 合集 */
    const collection = (data || []).map(item => item.data)
    ViewAction.renderGroupCollections(collection || [])
  }

  /** 打开预览 */
  pictureView = val => {
    const { dispatch, showCollectionsModal } = this.props
    if (showCollectionsModal) return
    // if(DetailAction.checkCollectionType(val.target) === 'pic')
    /** 数据类型 */
    const type = DetailAction.checkCollectionType(val.target)
    dispatch({
      type: 'collectionDetail/updateDatas',
      payload: {
        selectData: val,
        type: 'view',
        isImg: type !== 'plotting'
      }
    })
    this.setState({
      activeItem: val.id
    })
    if (val._from !== 'layer')
      ViewAction.setMediaOrFeatureCollectActiveStyle(val.id, true)
  }

  /** 根据元素的范围来缩放地图
   * @param {{content: string, collect_type: string}} val 标绘数据
   */
  FitForFeature = val => {
    /** 标绘的所有数据 */
    // const content = JSON.parse(val.content)
  }

  Full = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'collectionDetail/updateDatas',
      payload: {
        showCollectionsModal: true,
        zIndex: 5,
        type: 'view',
        isImg: true
      }
    })
  }

  toViewCenter = val => {
    // console.log(val)
    if (val.location && val.location.longitude && val.location.latitude) {
      let coordinate = [+val.location.longitude, +val.location.latitude]
      DetailAction.toCenter({ center: coordinate })
    } else message.warn('采集资料暂未关联地图坐标')
  }

  /** 分组点击
   * @param {{id: string, name: string, latitude: string, longitude: string, collection: []}} group 选中的分组
   */
  handleClickGroup = group => {
    /** 进去分组详情里面 */
    this.SelectChangeToRender(group.id)
    this.setState({
      selectedGroup: group
    })
    /** 清除分组坐标点 */
    ViewAction.clearGroupPointer()
    ViewAction.renderGroupCollections(group.collection)
  }

  /** 返回分组列表 */
  handleClickBackGroupList = () => {
    this.setState({
      selectedGroup: null
    })
    ViewAction.clearCollections()
    ViewAction.renderGroupCoordinates(this.state.options)
  }

  render() {
    const {
      selectActive,
      activeSelectObj = {},
      activeTime,
      timeData,
      activeItem,
      options = []
    } = this.state

    const { dispatch, showCollectionsModal, board, miniTitle } = this.props
    return (
      <div className={styles.lookingback}>
        {this.state.selectedGroup ? (
          <Fragment>
            <div className={styles.lookGroupTitle}>
              <div className={styles.chooseGroup}>
                <Tooltip title="返回列表">
                  <span
                    className={styles.backGroupList}
                    onClick={this.handleClickBackGroupList}
                  >
                    &#xe7d4; {this.state.selectedGroup?.name}
                  </span>
                </Tooltip>
                {/* <Select
              bordered={false}
              value={selectActive}
              size="small"
              suffixIcon={<MyIcon type="icon-xialaxuanze" />}
              onChange={this.SelectChangeToRender}
              style={{ width: 100 }}
            >
              {this.InitOptionGroup()}
            </Select> */}
                <Tooltip title="全屏查看">
                  <span className={styles.tofull} onClick={this.Full}>
                    <MyIcon type="icon-bianzu17beifen" />
                    {/* fullScreen */}
                  </span>
                </Tooltip>
              </div>
              <div className={styles.remarks}>
                {activeSelectObj.remark && (
                  <Fragment>
                    <div className={styles.remark_content}>{/* 备注 */}</div>
                    <div className={styles.remark_create_msg}>
                      <Row gutter={8}>
                        <Col span={6}>2020/06/28</Col>
                        <Col span={6}>11:50</Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                          罗xx
                        </Col>
                      </Row>
                    </div>
                  </Fragment>
                )}
              </div>
              <div className={styles.time_selection}>
                {activeSelectObj.collection &&
                activeSelectObj.collection.length ? (
                  <TimeSelection
                    data={activeSelectObj.collection}
                    active={activeTime}
                    idKey="look"
                    onChangeActive={this.setActiveChange}
                    onChange={this.setActiveData}
                  />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    暂无可回看的采集资料（图片、视频、音频）
                  </div>
                )}
              </div>
            </div>
            <div className={styles.lookingback_collection}>
              <div
                style={{
                  display: 'flex',
                  flexFlow: 'row wrap',
                  width: '100%',
                  height: miniTitle ? 'calc(100% - 65px)' : 'calc(100% - 30px)'
                }}
                className={globalStyle.autoScrollY}
              >
                {Object.keys(timeData).map(item => {
                  if (timeData[item].length) {
                    return (
                      <div key={item} style={{ width: '100%' }}>
                        <span className={styles.timeTitle}>
                          {!isNaN(+item) ? item + ' 时' : item}
                        </span>
                        <div className={styles.lookingback_item}>
                          {timeData[item].map(data => {
                            /** 单个数据 */
                            const itemFeature = data.data
                            /** 数据类型 */
                            const type = DetailAction.checkCollectionType(
                              itemFeature.target
                            )
                            return (
                              <div
                                className={`
                                  ${styles.looking_item}
                                  ${animateCss.animated}
                                  ${
                                    activeItem === data.data.id
                                      ? styles.active
                                      : ''
                                  }`}
                                key={data.data.id}
                                onClick={() => this.pictureView(data.data)}
                                onDoubleClick={() =>
                                  this.toViewCenter(data.data)
                                }
                                style={{ flexDirection: 'column' }}
                              >
                                {/* <div
                              style={{
                                backgroundColor: "rgba(71, 74, 91, 1)",
                                display: "table",
                              }}
                              className={
                                activeItem === data.data.id ? styles.active : ""
                              }
                            > */}
                                {(t => {
                                  switch (t) {
                                    case 'pic':
                                      return (
                                        <div
                                          style={{
                                            backgroundColor:
                                              'rgba(71, 74, 91, 1)'
                                          }}
                                        >
                                          <img
                                            crossOrigin="anonymous"
                                            src={data.data.resource_url}
                                            alt=""
                                            width="100%"
                                          />
                                        </div>
                                      )
                                    case 'video':
                                      return (
                                        <div
                                          style={{
                                            backgroundColor:
                                              'rgba(71, 74, 91, 1)',
                                            padding: 14
                                          }}
                                        >
                                          <i
                                            className={globalStyle.global_icon}
                                            style={{ fontSize: 28 }}
                                          >
                                            &#xe68b;
                                          </i>
                                        </div>
                                      )
                                    case 'plotting':
                                      return (
                                        <div
                                          style={{
                                            backgroundColor:
                                              'rgba(71, 74, 91, 1)',
                                            padding: 14
                                          }}
                                        >
                                          <i
                                            className={globalStyle.global_icon}
                                            style={{ fontSize: 28 }}
                                          >
                                            &#xe68e;
                                          </i>
                                        </div>
                                      )
                                    default:
                                      return null
                                  }
                                })(type)}
                                <p>
                                  <span>{data.data.title}</span>
                                </p>
                              </div>
                              // </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  } else return <span key={item}></span>
                })}
              </div>
              {/* <div className={styles.lookingback_item}>
            {selectData.map((item, index) => {
              return (
                <div className={styles.looking_item} key={index} onClick={()=> this.pictureView(item.data)}>
                  <div>
                    <span>{item.data.title}</span>
                    {DetailAction.checkCollectionType(item.data.target) === 'pic' &&
                    <img crossOrigin="anonymous" src={item.data.resource_url} alt="" width='100%'/>}
                  </div>
                </div>
              )
            })}
          </div> */}
              {/* <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Button onClick={this.Full}>全屏预览</Button>
            <Button style={{ marginLeft: 10 }}>播放</Button>
          </div> */}
            </div>
          </Fragment>
        ) : (
          <div className={styles.grouplist}>
            {options
              .filter(item => item.id !== OTHERGROUPKEY)
              .map(item => {
                return (
                  <div
                    className={styles.group_item}
                    key={item.id}
                    onClick={() => this.handleClickGroup(item)}
                  >
                    <div className={styles.group_name} title={item.name}>
                      {item.name}
                    </div>
                    <span className={styles.detail_icon}>&#xe7d3;</span>
                  </div>
                )
              })}
          </div>
        )}
        {/* 左侧的所有列表 */}
        <CSSTransition
          in={showCollectionsModal}
          classNames="slideUp"
          timeout={300}
          unmountOnExit
        >
          <AllCollection
            board={board}
            timeData={this.state.timeData}
            onClose={() => {
              dispatch({
                type: 'collectionDetail/updateDatas',
                payload: {
                  showCollectionsModal: false,
                  selectData: null,
                  zIndex: 10,
                  type: 'view',
                  isImg: true
                }
              })
            }}
          />
        </CSSTransition>
      </div>
    )
  }
}
