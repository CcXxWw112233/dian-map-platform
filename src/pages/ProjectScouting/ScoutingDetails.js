import React, { PureComponent, Fragment } from 'react'
import globalStyle from '../../globalSet/styles/globalStyles.less'
import animateCss from '../../assets/css/animate.min.css'
import styles from './ScoutingDetails.less'
import Action from '../../lib/components/ProjectScouting/ScoutingDetail'
import ViewAction from '../../lib/components/ProjectScouting/viewFeatures'
import ScouListAction from '../../lib/components/ProjectScouting/ScoutingList'
import PlayCollectionAction from '../../lib/components/ProjectScouting/playCollection'
import { connect } from 'dva'
import { formatLength, formatArea } from 'utils/mapUtils'
import {
  Collapse,
  Tabs,
  Button,
  message,
  // Space,
  // Popover,
  // Empty,
  Popconfirm,
  Checkbox,
  Dropdown,
  Menu,
  Popover,
  BackTop,
  notification
  // Radio,
  // Form,
  // Input,
  // InputNumber,
} from 'antd'
import Space from '../../components/Space'
import Empty from '../../components/Empty'
import { PlusCircleOutlined, CaretRightOutlined } from '@ant-design/icons'
import Event from '../../lib/utils/event'
import AudioControl from './components/audioPlayControl'
import { MyIcon } from '../../components/utils'
import {
  Title,
  ScoutingHeader,
  ScoutingItem,
  UploadItem,
  areaScouting
} from './components/ScoutingDetailsSubComponents'

import PlayCollectionControl from './components/playCollectionControl'
// import { getOffsetTop } from "utils/utils";
// import CollectionDetail from "./components/CollectionDetail";
import CollectionDetail from './components/CollectionDetail/index-new'
import LookingBack from './components/LookingBack'
import mapApp from '../../utils/INITMAP'

import { CSSTransition } from 'react-transition-group'
import { Icon } from 'antd'
import Axios from 'axios'
import { BASIC, MAP_REQUEST_URL } from '../../services/config'
import AboutAction from '../../lib/components/ProjectScouting/AroundAbout'
import Meettings from './components/Meeting'
import PublicDataTreeComponent from './components/PublicDataTreeComponent'
import Plan from './components/Plan'
import { TransformCoordinate } from '../../lib/utils'
import geojsonResource from '../../services/geojsonResource'
import Cookies from 'js-cookie'
import { CollectionInfoModel } from '../../models/collectionInfo'

const { Evt } = Event
const { TabPane } = Tabs

@connect(
  ({
    controller: { mainVisible, lastPageState },
    openswitch: { showFeatureName },
    lengedList: { config },
    collectionDetail: { selectData, showCollectionsModal },
    meetingSubscribe: { hotelNames },
    permission: { projectId },
    user: { currentOrganizeId }
  }) => ({
    mainVisible,
    lastPageState,
    config,
    showFeatureName,
    selectData,
    showCollectionsModal,
    hotelNames,
    projectId,
    currentOrganizeId
  })
)
export default class ScoutingDetails extends PureComponent {
  constructor(props) {
    super(props)
    this.newTabIndex = 0
    this.publicDataLinkArr = []
    this.lastSelectedDom = null
    this.isClickInPanel = false
    const panes = [
      {
        title: '??????',
        content: areaScouting(),
        key: '1',
        closable: false,
        className: styles.tab_tab1,
        code: [
          'map:collect:add:app',
          'map:collect:add:web',
          'map:collect:push',
          'map:collect:type:add',
          'map:collect:type:update',
          'map:collect:type:remove'
        ]
      },
      {
        title: '??????',
        content: <div>?????????????????????...</div>,
        key: '2',
        closable: 0,
        className: styles.tab_tab2,
        code: 'map:collect:lookback:view'
      },
      {
        title: '??????',
        content: <div>?????????????????????...</div>,
        key: '3',
        closable: 0,
        className: styles.tab_tab3,
        code: 'map:board:team'
      },
      {
        title: '??????',
        content: <div>?????????????????????...</div>,
        key: '4',
        closable: 0,
        className: styles.tab_tab4,
        code: 'map:board:plan'
      }
    ]
    this.state = {
      current_board: {},
      area_list: [],
      all_collection: [],
      not_area_id_collection: [],
      area_active_key: null,
      multipleGroup: false,
      area_selected: [],
      isPlay: false,
      playing: false,
      currentGroup: null,
      notNextGroup: false,
      notPrevGroup: false,
      playCollectionVisible: false,

      visible: true,
      activeKey: '1',
      panes,
      activeId: -1,
      audioData: {},
      miniTitle: false,
      isEdit: false,
      selections: [],
      notAreaIdSelections: [],
      showMoreAction: false,

      setCopyVisible: false,
      setMoveVisible: false,
      notRenderCollection: false,
      addGroupDisabled: true
    }
    this.scrollView = React.createRef()
    this.saveSortTimer = null
    this.saveSortTime = 2 * 1000 // ???
    this.isAddAreaBtn = false //???????????????????????????????????????
    this.isGoBack = false
    this.collectionScrollTop = 0
    this.touchStartClient = {}
    this.isTouch = false
    this.scrolltoDom = null
    this.scoutingDetailInstance = null
    this.is360Pic = false
    this.allFeatureList = []
    this.props.onRef && this.props.onRef(this)
    this.notAreaIdCollection = []
    this.areaList = []

    // codeType???????????????
    this.codeType = null
    // code???????????????
    this.code = null
    this.needSingleDisplayGroup = ['??????']
    this.needDisplayAll = [
      '??????',
      '????????????',
      '????????????',
      '????????????',
      '????????????',
      '????????????'
    ]
    this.tempProjectId = ['1340591617840648192', '1348802078218260480']
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.currentOrganizeId !== this.props.currentOrganizeId) {
      this.handleGoBackClick()
    }
  }
  componentDidMount() {
    this.isGoBack = false
    this.planRef = null
    const { Evt } = Event
    const { mainVisible } = this.props
    if (mainVisible) this.getDetails()
    // ?????????????????????????????????????????????
    Action.removeListPoint()
    // ??????????????????
    Action.init(this.props.dispatch)
    Action.CollectionGroup = []
    // ??????????????????????????????????????????
    // console.log(Event.Evt)
    Event.Evt.on('addCollectionForFeature', data => {
      this.setState({
        area_active_key: 'other'
      })
      this.fetchCollection()
    })
    Event.Evt.on('updateProjectCollection', data => {
      let { area_list: areaList, area_active_key: areaActiveKey } = this.state
      let currentGroup = []
      if (areaActiveKey !== 'other') {
        currentGroup = areaList.filter(item => {
          return item.id === areaActiveKey
        })
      }
      if (currentGroup.length) {
        currentGroup[0].collection = data
      }
      const { config: lenged, dispatch, showFeatureName } = this.props
      Action.renderCollection(data || [], {
        lenged,
        dispatch,
        showFeatureName
      })
      this.setState({
        area_list: areaList
      })
    })
    Event.Evt.on('searchProjectData', val => {
      if (this.state.activeKey !== '1') return
      let tmpArr = []
      if (val) {
        let area_active_key = this.state.area_active_key
        let areaList = this.areaList.filter(item => {
          return item.id === area_active_key
        })

        if (this.state.area_active_key !== 'other') {
          if (areaList.length > 0) {
            this.allFeatureList = areaList[0].collection
          }
        } else {
          this.allFeatureList = this.notAreaIdCollection
        }
        if (val['selectedAreas']) {
          let {
            selectedAreas,
            selectedBrands,
            selectedStars,
            keywordState
          } = val
          if (keywordState) {
            let allFeatureList = this.allFeatureList
            allFeatureList = allFeatureList.filter(item => {
              return item.title.indexOf(keywordState) > -1
            })
            this.allFeatureList = allFeatureList
          }
          selectedAreas.forEach(item => {
            let tmpArr2 = this.allFeatureList.filter(item2 => {
              return item2[item.type] === item.code
            })
            tmpArr = [...tmpArr, ...tmpArr2]
          })
          let tmpAreaList = [],
            tmpNotAreaIdCollection = []
          this.areaList.forEach(item => {
            let data = JSON.parse(JSON.stringify(item))
            if (data.collection) {
              let collection = data.collection
              if (keywordState) {
                collection = collection.filter(
                  item => item.title.indexOf(keywordState) > -1
                )
                data.collection = collection
              }
              if (selectedAreas.length > 0) {
                let tmpList = []
                selectedAreas.forEach(item2 => {
                  let tmp = collection.filter(item3 => {
                    return item3[item2.type] === item2.code
                  })
                  tmpList = [...tmpList, ...tmp]
                })
                data.collection = tmpList
              }
              if (selectedStars.length) {
                let collection = data.collection
                let tmpList = []
                for (let i = 0; i < collection.length; i++) {
                  // let n = Math.floor(Math.random() * collection.length);
                  let selectedStar = selectedStars.filter(itemx => {
                    return itemx.name === collection[i].star
                  })
                  if (selectedStar && selectedStar.length > 0) {
                    tmpList.push(collection[i])
                  }
                }
                data.collection = tmpList
                tmpArr = tmpList
              }
              if (selectedBrands.length > 0) {
                let collection = data.collection
                let tmpList = []
                for (let i = 0; i < collection.length; i++) {
                  // let n = Math.floor(Math.random() * collection.length);
                  let selectedBrand = selectedBrands.filter(itemx => {
                    return itemx.name === collection[i].brand
                  })
                  if (selectedBrand && selectedBrand.length > 0) {
                    tmpList.push(collection[i])
                  }
                }
                data.collection = tmpList
                tmpArr = tmpList
              }
            }
            tmpAreaList.push(data)
          })
          selectedAreas.forEach(item => {
            let tmp = this.notAreaIdCollection.filter(item2 => {
              return item2[item.type] === item.code
            })
            tmpNotAreaIdCollection = [...tmpNotAreaIdCollection, ...tmp]
          })
          this.setState({
            area_list: tmpAreaList,
            not_area_id_collection: tmpNotAreaIdCollection
          })
          tmpArr = tmpAreaList.filter(item => item.id === area_active_key)[0]
            .collection
        } else {
          this.codeType = val.type
          this.code = val.code
          tmpArr = this.allFeatureList.filter(item => {
            return item[val.type] === val.code
          })
          let tmpAreaList = [],
            tmpNotAreaIdCollection = []
          this.areaList.forEach(item => {
            let data = JSON.parse(JSON.stringify(item))
            if (data.collection) {
              data.collection = data.collection.filter(item2 => {
                return item2[val.type] === val.code
              })
            }
            tmpAreaList.push(data)
          })
          tmpNotAreaIdCollection = this.notAreaIdCollection.filter(item => {
            return item[val.type] === val.code
          })
          this.setState({
            area_list: tmpAreaList,
            not_area_id_collection: tmpNotAreaIdCollection
          })
        }
      } else {
        tmpArr = this.allFeatureList
        this.setState({
          area_list: this.areaList,
          not_area_id_collection: this.notAreaIdCollection
        })
      }
      const { config: lenged, dispatch, showFeatureName } = this.props
      // if (tmpArr.length === 0) {
      //   this.areaList.forEach(item => {
      //     tmpArr= [...tmpArr, ...item.collection]
      //   })
      // }
      Action.renderCollection(tmpArr || [], {
        lenged,
        dispatch,
        showFeatureName
      })
    })
    // ?????????????????????
    Event.Evt.on('hasAudioStart', data => {
      this.setAudio(data)
    })

    Event.Evt.on('updatePlotFeature', data => {
      this.fetchCollection()
    })
    Evt.on(
      'CollectionUpdate:remove',
      this.onCollectionUpdate.bind(this, 'remove')
    )
    Evt.on('CollectionUpdate:add', this.onCollectionUpdate.bind(this, 'add'))
    Evt.on(
      'CollectionUpdate:reload',
      this.onCollectionUpdate.bind(this, 'reload')
    )
    Evt.on('FeatureOnAddBtn', () => {
      this.isAddAreaBtn = true
      this.pushAreaItem()
    })

    Evt.on('handleGroupFeature', id => {
      if (this.state.activeKey === '1') this.setActiveCollapse(id)
    })
    Evt.on('handleCollectionFeature', val => {
      this.handleCollectionFeature(val, 'edit', 'collection')
    })

    Evt.addEventListener(
      'handleGroupCollectionFeature',
      this.handleCollectionFeature
    )
    Evt.on('handleFeatureToLeftMenu', id => {
      this.scrollForFeature(id)
    })
    Evt.on('handlePlotFeature', this.handlePlotFeature)

    const me = this
    Evt.on('openSelectGroup', val => {
      let area_active_key = val.area_type_id || 'other'
      if (this.state.area_active_key === area_active_key) {
        this.scrollForFeature(val.id)
      } else {
        this.setActiveCollapse(area_active_key)
        setTimeout(function() {
          me.scrollForFeature(val.id)
        }, 1)
      }
    })
    // Evt.on("updateSelectedMeetingRooms", this.updateSelectedMeetingRooms);
  }

  updateSelectedMeetingRooms = (hotelName, multiple = true) => {
    let { hotelNames, projectId, dispatch } = this.props
    if (this.tempProjectId.includes(projectId)) {
      if (multiple) {
        let index = hotelNames.findIndex(item => item === hotelName)
        if (index > -1) {
          hotelNames.splice(index, 1)
        } else {
          hotelNames.push(hotelName)
        }
      } else {
        hotelNames = [hotelName]
      }
      dispatch({
        type: 'meetingSubscribe/updateData',
        payload: {
          panelVisible: hotelNames.length > 0 ? true : false,
          hotelNames: hotelNames
        }
      })
      Event.Evt.firEvent('updateMeetingRoom', hotelNames)
    }
  }

  setItemClickState = val => {
    this.isClickInPanel = val
  }

  // ???????????????
  scrollForFeature = id => {
    let text = '#menu_collection_' + id
    let dom = document.querySelector(text)
    if (this.lastSelectedDom) {
      this.lastSelectedDom.classList.remove(styles.hoverActive)
    }
    if (dom) {
      dom.classList.add(styles.hoverActive)
      if (!this.isClickInPanel) {
        dom.scrollIntoView({ behavior: 'smooth' })
      }
      this.isClickInPanel = false
      // this.scrolltoDom = setTimeout(() => {
      //   dom.classList.remove(styles.hoverActive);
      // }, 3 * 1000);
      this.lastSelectedDom = dom
    }
  }

  getProperties = (type, geometry) => {
    switch (type) {
      case 'Point':
        let coor = Action.transform(geometry.getCoordinates())
        return {
          ??????: `??????: ${coor[0].toFixed(4)} ??????:${coor[1].toFixed(4)}`
        }
      case 'Polygon':
        return { ??????: formatArea(geometry) }
      case 'LineString':
        return { ??????: formatLength(geometry) }
      default:
    }
  }

  // ??????????????????
  handlePlotFeature = ({ feature, pixel }) => {
    if (!feature) return
    // console.log(feature, pixel)
    const { dispatch } = this.props
    let collection = this.state.all_collection.find(
      item => item.id === feature.get('id')
    )
    // let isGeojson = feature.get("isGeojson");
    if (collection) {
      let ftype = feature.getGeometry().getType()
      let properties = this.getProperties(ftype, feature.getGeometry())
      let tempProjectId = this.tempProjectId
      const { projectId } = this.props
      if (ftype === 'Point') {
        let coords = feature.getGeometry().getCoordinates()
        coords = TransformCoordinate(coords, 'EPSG:3857', 'EPSG:4326')
        Evt.firEvent('HouseDetailGetPoi', coords.join(','))
        if (!tempProjectId.includes(projectId) && !feature.get('meetingRoom')) {
          dispatch({
            type: 'collectionDetail/updateDatas',
            payload: { selectPoi: coords.join(',') }
          })
        }
        if (tempProjectId.includes(projectId)) {
          this.updateSelectedMeetingRooms(feature.get('title'), false)
        }
      }
      collection.properties_map = properties
      if (!tempProjectId.includes(projectId) && !feature.get('meetingRoom')) {
        dispatch({
          type: 'collectionDetail/updateDatas',
          payload: {
            selectData: collection,
            type: 'edit',
            isImg: feature.get('pointType') === 'pic' ? true : false,
            selectedFeature: feature
          }
        })
      }
    }
  }
  // ??????????????????
  handleCollectionFeature = (data, type = 'view', from = 'group') => {
    const { dispatch } = this.props
    // let coordinates = [];
    let feature = null,
      geo
    for (let i = 0; i < data.length; i++) {
      let item = data[i]
      let f = Action.getFeatureById(item.id)
      if (f) feature = f
      break
    }
    if (feature) {
      geo = feature.getGeometry()
      // coordinates = geo.getCoordinates();
    }
    data = data.map(item => {
      let properties = this.getProperties(geo?.getType(), geo)
      item.properties_map = properties
      return item
    })

    dispatch({
      type: 'collectionDetail/updateDatas',
      payload: {
        selectData: [...data],
        type,
        isImg: true
      }
    })
    if (from === 'group')
      Action.setGroupCollectionActive(Array.isArray(data) ? data[0] : data)
  }
  componentWillUnmount() {
    const { dispatch, config: lengedList } = this.props
    AboutAction.clearLine('detail')
    Action.mounted = false
    clearTimeout(this.scrolltoDom)
    Event.Evt.removeEventListener(
      'handleGroupCollectionFeature',
      this.handleCollectionFeature
    )
    if (this.isGoBack) {
      let newLengedList = [...lengedList]
      if (!Array.isArray(lengedList)) {
        newLengedList = [lengedList]
      }
      const key = Action.lenged?.key
      const index = newLengedList.findIndex(item => {
        return item.key === key
      })
      newLengedList.splice(index, 1)
      dispatch({
        type: 'lengedList/updateLengedList',
        payload: {
          config: newLengedList
        }
      })
      Action.removeLayer(true)
      Action.clearListen()
      this.clearGroupPointer()
    }
    dispatch({
      type: 'collectionDetail/updateDatas',
      payload: {
        selectData: null,
        type: 'view',
        isImg: true
      }
    })
  }

  // ???????????????????????????
  setAudio = data => {
    // console.log(data)
    this.setState({
      audioData: data
    })
  }

  // ????????????????????????
  onCollectionUpdate = (type, collections) => {
    let arr = Array.from(this.state.all_collection)
    if (type === 'add') {
      arr = arr.concat(collections)
    }
    if (type === 'remove') {
      let key = collections.map(item => item.id)
      arr = arr.filter(item => !key.includes(item.id))
    }
    if (type === 'reload') {
      arr = collections || this.state.all_collection
    }
    this.updateAllCollectionReset(arr)
  }

  // ??????????????????????????????
  getDetails = flag => {
    ScouListAction.checkItem().then(res => {
      // console.log(res)
      let { data } = res || {}
      Event.Evt.firEvent('changeAreaInSearch', data)
      this.setState(
        {
          current_board: data
        },
        () => {
          Action.setToCenter(data)
          if (!flag) this.renderAreaList()
          let param = { board_id: this.state.current_board.board_id }
          Action.addToListen(param)
        }
      )
    })
  }

  // ????????????????????????
  renderAreaList = () => {
    const { dispatch } = this.props
    let param = { board_id: this.state.current_board.board_id }
    Action.fetchAreaList(param)
      .then(resp => {
        // console.log(resp)
        let respData = resp.data
        // ?????????????????????
        let active =
          this.state.area_active_key || (respData[0] && respData[0].id)
        if (!active) {
          active = 'other'
        }
        this.areaList = JSON.parse(
          JSON.stringify(
            respData.map(item =>
              Object.assign(item, { _edit: false, _remarkEdit: false })
            )
          )
        )
        this.setState({
          area_list: this.areaList,
          area_active_key: active,
          area_selected: [active]
        })
        // ?????????????????????????????????
        window.ProjectGroupId = active
        let obj = this.areaList.filter(item => {
          return item.id === active
        })[0]
        window.ProjectGroupName = obj.name
        this.fetchCollection()
        /** ?????????????????? */
        dispatch({
          type: [
            CollectionInfoModel.namespace,
            CollectionInfoModel.reducers.updateDatas
          ].join('/'),
          payload: {
            collectionGroups: this.areaList
          }
        })
      })
      .catch(err => {
        console.log(err)
      })
  }

  handleGoBackClick = () => {
    const { dispatch } = this.props
    Action.onBack()
    ViewAction.clearCollections()
    this.isGoBack = true
    dispatch({
      type: 'controller/updateMainVisible',
      payload: {
        mainVisible: 'list'
      }
    })
    dispatch({
      type: 'meetingSubscribe/updateData',
      payload: {
        panelVisible: false
      }
    })
  }

  onChange = activeKey => {
    const { dispatch } = this.props
    this.setState({ activeKey })
    Action.tabActivekey = activeKey
    if (this.state.activeKey === activeKey) return
    this.clearGroupPointer()
    Action.clearGroupCollectionPoint()
    if (activeKey !== '1') {
      // ????????????????????????
      Action.removeLayer()
      // ????????????
      Action.clearListen()
      Action.needRenderFetureStyle = false

      // ????????????????????????
      Action.selectedFeature = null
      Action.lastSelectedFeature = null
      Action.removeFeatureOverlay()
      this.setState({
        isEdit: false
      })
      if (activeKey === '2') {
        // this.renderGroupPointer();
      }
    } else if (activeKey === '1') {
      // ??????????????????
      this.setActiveCollapse(this.state.area_active_key)
      let params = {
        board_id: this.state.current_board.board_id
      }
      Action.needRenderFetureStyle = true
      // ????????????
      Action.addToListen(params)
    }
    // ????????????????????????
    dispatch({
      type: 'collectionDetail/updateDatas',
      payload: {
        selectData: null,
        type: 'view',
        isImg: true
      }
    })
    Event.Evt.firEvent('openLengedListPanel', false)
  }

  onEdit = (targetKey, action) => {
    this[action](targetKey)
  }

  add = () => {
    const { panes } = this.state
    const activeKey = `newTab${this.newTabIndex++}`
    panes.push({ title: '??????Tab', content: '', key: activeKey })
  }

  remove = targetKey => {
    let { activeKey } = this.state
    let lastIndex
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1
      }
    })
    const panes = this.state.panes.filter(pane => pane.key !== targetKey)
    if (panes.length && activeKey === targetKey) {
      if (panes.length >= 0) {
        activeKey = panes[lastIndex].key
      } else {
        activeKey = panes[0].key
      }
    }
    this.setState({ panes, activeKey })
  }

  // ??????????????????
  pushAreaItem = () => {
    let obj = {
      id: Math.random() * 100000 + 1,
      _edit: true,
      name: ''
    }
    this.setState(
      {
        area_list: this.state.area_list.concat([obj]),
        area_active_key: ''
      },
      () => {
        // ?????????????????????
        this.scrollView.current &&
          (this.scrollView.current.scrollTop =
            this.scrollView.current.scrollHeight + 10000)
      }
    )
  }

  // ??????????????????
  addCancel = item => {
    if (item.board_id) {
      // ??????????????????
      this.onAreaEdit(false, item)
      return
    }
    this.setState({
      area_list: this.state.area_list.filter(val => val.id !== item.id)
    })
    if (this.isAddAreaBtn) {
      Evt.firEvent('FeatureOnAddCancel', false)
      this.isAddAreaBtn = false
    }
  }

  // ?????????????????????
  saveArea = (data, name) => {
    const { dispatch } = this.props
    if (!name) return message.warn('????????????????????????')
    // ????????????
    if (data.board_id) {
      Action.editAreaName(data.id, { name }, data.board_id).then(res => {
        this.onAreaEdit(false, data)
        this.setState(
          {
            area_list: this.state.area_list.map(item => {
              if (item.id === data.id) {
                item.name = name
              }
              return item
            })
          },
          () => {
            Action.CollectionGroup = this.state.area_list
            Event.Evt.firEvent('collectionListUpdate1', this.state.area_list)

            dispatch({
              type: [
                CollectionInfoModel.namespace,
                CollectionInfoModel.reducers.updateDatas
              ].join('/'),
              payload: {
                collectionGroups: this.state.area_list
              }
            })
            // console.log(Action.CollectionGroup, this.state.area_list)
          }
        )
      })
      message.success('????????????')
      return
    }
    let { current_board } = this.state
    Action.addArea({ board_id: current_board.board_id, name: name }).then(
      res => {
        message.success('??????????????????')
        this.setState(
          {
            area_active_key: res.data || ''
          },
          () => {
            // console.log(res);
            this.renderAreaList()
          }
        )
      }
    )
  }

  // ????????????????????????
  renderCollection = (data = [], obj, isPanelStateChange) => {
    const { config: lenged, dispatch, showFeatureName } = this.props
    if (isPanelStateChange) {
      if (obj) {
        if (this.needDisplayAll.includes(obj.name)) {
          if (data.length > 0) {
            const nonGeojsonIndex = data.findIndex(item => {
              return item.target !== 'geojson'
            })
            const isDisplayIndex = data.findIndex(item => {
              return item.is_display === '1'
            })
            if (nonGeojsonIndex === -1) {
              if (isDisplayIndex === -1) {
                data.forEach(item => {
                  item.is_display = '1'
                })
              }
            }
          }
        }
        if (this.needSingleDisplayGroup.includes(obj.name)) {
          if (data.length > 0) {
            const nonGeojsonIndex = data.findIndex(item => {
              return item.target !== 'geojson'
            })
            const isDisplayData = data.filter(item => {
              return item.is_display === '1'
            })
            if (nonGeojsonIndex === -1) {
              if (isDisplayData.length > 1) {
                isDisplayData.forEach((item, index) => {
                  if (index > 0) {
                    const index = data.findIndex(item2 => item2.id === item.id)
                    data[index].is_display = '0'
                  }
                })
              }
            }
          }
        }
      }
    }
    this.allFeatureList = data
    Action.renderCollection(data || [], { lenged, dispatch, showFeatureName })
  }

  // ?????????????????????????????????
  fetchCollection = () => {
    if (this.state.notRenderCollection) return
    let params = {
      board_id: this.state.current_board.board_id
    }
    let stars = ['?????????', '?????????', '?????????', '?????????', '?????????', '?????????']
    let brands = ['?????????']
    // ??????????????????????????????
    Action.clearListen()
    // ???????????????--??????????????????
    Action.getCollectionList(params).then(res => {
      let data = res.data.sort((a, b) => a.sort - b.sort)
      data = data.map(item => {
        item.star = stars[Math.round(Math.random() * stars.length)]
        if (item.title.includes(brands[0])) {
          item.brand = brands[0]
        }
        return item
      })
      // ????????????????????????????????????
      Action.oldData = data
      // ???????????????????????????,?????????????????????????????????
      let array = this.reSetCollection(data)
      this.updateCollection(data, array)
      Action.addToListen(params)
    })
  }

  // ??????geojson??????
  updateGeojsonCollection = data => {
    let array = this.reSetCollection(data)
    this.updateCollection(data, array)
  }

  filterAreaListByCode = area_list => {
    let tmpAreaList = []
    area_list.forEach(item => {
      let data = JSON.parse(JSON.stringify(item))
      if (data.collection) {
        data.collection = data.collection.filter(
          item2 => item2[this.codeType] === this.code
        )
      }
      tmpAreaList.push(data)
    })
    return tmpAreaList
  }
  filterNotAreaIdCollectionByCode = data => {
    return data.filter(item => item[this.codeType] === this.code)
  }

  // ??????????????????????????????????????????????????????,???????????????all_collection??????
  updateAllCollectionReset = data => {
    let array = this.reSetCollection(data)
    this.updateCollection(data, array)
  }
  // ????????????
  updateCollection = (data, area_list) => {
    this.areaList = area_list
    this.notAreaIdCollection = data
      .filter(i => !i.area_type_id)
      .sort((a, b) => a.create_time - b.create_time)
    let tmpAreaList = this.areaList
    let tmpNotAreaIdCollection = this.notAreaIdCollection
    const { dispatch } = this.props
    if (this.code) {
      tmpAreaList = this.filterAreaListByCode(area_list)
      tmpNotAreaIdCollection = this.filterNotAreaIdCollectionByCode(
        tmpNotAreaIdCollection
      )
    }
    dispatch({
      type: 'lengedList/updateLengedList',
      payload: {
        config: []
      }
    })
    this.setState(
      {
        all_collection: data,
        area_list: tmpAreaList,
        not_area_id_collection: tmpNotAreaIdCollection
      },
      () => {
        dispatch({
          type: 'scoutingDetail/updateDatas',
          payload: {
            collections: this.state.all_collection
          }
        })
        let arr = [],
          obj
        if (this.state.multipleGroup) {
          let selectArr = this.state.area_list.filter(item =>
            this.state.area_selected.includes(item.id)
          )
          selectArr.forEach(item => {
            arr = arr.concat(item.collection || [])
          })
        } else {
          obj =
            this.state.area_list.find(
              item => item.id === this.state.area_active_key
            ) || {}
          arr = obj.collection
          this.state.area_active_key === 'other' &&
            (arr = this.state.not_area_id_collection)
        }
        // ??????????????????????????????

        // ????????????????????????????????????
        if (this.state.activeKey === '1') {
          this.renderCollection(arr || [], obj)
        }
        // ?????????????????????
        let a = area_list.concat([
          {
            id: 'other',
            name: '?????????',
            collection: this.state.not_area_id_collection
          }
        ])
        Evt.firEvent('collectionListUpdate1', a)
        Evt.firEvent('collectionListUpdate2', a)
        /** ?????????????????? */
        dispatch({
          type: [
            CollectionInfoModel.namespace,
            CollectionInfoModel.reducers.updateDatas
          ].join('/'),
          payload: {
            collectionGroups: a
          }
        })
      }
    )
  }
  // ???????????????????????????????????????
  reSetCollection = val => {
    const { dispatch } = this.props
    let data = val || []
    data = this.getSameGroupIdData(data)
    let list = this.state.area_list.map(item => {
      let f_list = data.filter(v => v.area_type_id === item.id)
      item.collection = f_list.sort(
        (a, b) => (a.__index || a.sort || 0) - (b.__index || b.sort || 0)
      )
      return item
    })
    Action.CollectionGroup = list

    dispatch({
      type: [
        CollectionInfoModel.namespace,
        CollectionInfoModel.reducers.updateDatas
      ].join('/'),
      payload: {
        collectionGroups: list
      }
    })
    if (this.isAddAreaBtn) {
      Evt.firEvent('FeatureOnAddSure', true)
      this.isAddAreaBtn = false
    }
    return list
  }

  // ?????????
  filesChange = (val, file, fileList, event) => {
    let { dispatch } = this.props
    dispatch({
      type: 'uploadNormal/updateFileList',
      payload: {
        show_upload_notification: true,
        data: fileList
      }
    })
  }
  removeUploadItem = file => {
    let { dispatch } = this.props
    // ???????????????????????????
    setTimeout(() => {
      dispatch({
        type: 'uploadNormal/uploadSuccess',
        payload: {
          uid: file.uid
        }
      })
      Event.Evt.firEvent('uploadFileSuccess', file)
    }, 3000)
  }

  uploadPanorama = file => {
    Action.uploadPanorama(file).then(res => {
      this.fileUpload({ id: this.state.area_active_key }, res.data, file)
    })
  }
  // ????????????
  fileUpload = (val, resp, file, event) => {
    if (resp) {
      // ???????????????????????????
      this.removeUploadItem(file)
      message.success('????????????')
      let { file_resource_id, suffix, original_file_name } = resp
      let params = {
        board_id: this.state.current_board.board_id,
        area_type_id: val.id,
        collect_type: suffix === '.geojson' ? 8 : 3,
        resource_id: file_resource_id,
        target: suffix && suffix.replace('.', ''),
        title: original_file_name
      }
      if (this.is360Pic) {
        params.collect_type = '10'
        this.is360Pic = false
      }
      Action.addCollection(params)
        .then(res => {
          // console.log(res);
          // ?????????????????????
          this.fetchCollection()
        })
        .catch(err => {
          // ????????????
          console.log(err.message)
          message.error(err.message)
        })
    }
  }

  onAddError = (resp, file) => {
    // console.dir(resp)
    message.error(file.name + '??????????????????????????????')
    this.removeUploadItem(file)
  }

  // ?????????????????????
  onCollectionRemove = (item, collection) => {
    let { id } = collection

    Action.removeCollection(id)
      .then(res => {
        message.success('????????????')
        this.setState(
          {
            all_collection: this.state.all_collection.filter(i => i.id !== id)
          },
          () => {
            // ????????????
            let arr = this.reSetCollection(this.state.all_collection)
            // this.renderCollection();
            this.updateCollection(Array.from(this.state.all_collection), arr)
            Action.oldData = this.state.all_collection
            this.hiddenDetail()
          }
        )
      })
      .catch(err => {
        message.err('????????????,???????????????')
        console.log(err)
      })
  }
  // ???????????????????????????
  hiddenDetail = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'collectionDetail/updateDatas',
      payload: {
        selectData: null,
        isImg: true
      }
    })
  }
  // ????????????
  cancelEditCollection = () => {
    message.destroy()
    // Action.removeDraw();
    Action.abortPointAddDraw()
    this.showOtherSlide()
  }

  // ????????????????????????
  hideOtherSlide = () => {
    let { dispatch } = this.props
    // ??????????????????????????????
    dispatch({
      type: 'openswitch/updateDatas',
      payload: {
        isShowBasemapGallery: false,
        isShowRightTools: false,
        isShowLeftToolBar: false,
        isShowPhotoSwipe: false
      }
    })
  }

  // ????????????????????????
  showOtherSlide = () => {
    let { dispatch } = this.props
    // ??????????????????????????????
    dispatch({
      type: 'openswitch/updateDatas',
      payload: {
        isShowBasemapGallery: true,
        isShowRightTools: true,
        isShowLeftToolBar: true,
        isShowPhotoSwipe: true
      }
    })
  }

  onEditCollection = async (editType, val, name) => {
    let { dispatch, selectData } = this.props
    let params = {}
    let { id } = val
    if (editType === 'editCoordinate') {
      message.success('??????????????????????????????????????????????????????????????????', 0)
      // ??????
      this.hideOtherSlide()
      setTimeout(() => {
        this.hiddenDetail()
      }, 50)
      // ????????????????????????
      val.title = val.name || val.title
      let coor = await Action.addCollectionCoordinates(false, val).catch(err =>
        console.log(err)
      )
      if (coor) {
        coor.longitude = coor.longitude.toString()
        coor.latitude = coor.latitude.toString()
        params = {
          id,
          title: val.name,
          location: {
            ...coor,
            site_name: val.title
          }
        }
        let resData = await window.CallWebMapFunction('getCityByLonLat', {
          lon: params.location.longitude,
          lat: params.location.latitude
        })
        params.districtcode = resData.addressComponent?.adcode
        this.setState({
          all_collection: this.state.all_collection.map(item => {
            if (item.id === id) {
              item.location = params.location
            }
            return item
          })
        })
      } else {
        this.cancelEditCollection()
        return Promise.reject('?????????')
      }
    } else if (editType === 'editName') {
      if (!name || name === val.name) {
        return
      }
      params = {
        title: name,
        id
      }
    }
    // ????????????
    Action.editCollection(params)
      .then(resp => {
        // console.log(res);
        this.cancelEditCollection()
        // this.fetchCollection();
        let arr = Array.from(this.state.all_collection)
        arr = arr.map(item => {
          if (item.id === id) {
            item.title = name || val.title
          }
          return item
        })
        // ????????????????????????????????????????????????
        this.updateAllCollectionReset(arr)
        let f = editType === 'editCoordinate' ? '??????????????????' : '??????????????????'
        message.success(f)
        if (selectData && editType === 'editName') {
          selectData.id === id &&
            dispatch({
              type: 'collectionDetail/updateDatas',
              payload: {
                selectData: { ...selectData, title: name }
              }
            })
        }
      })
      .catch(err => {
        this.cancelEditCollection()
      })
  }
  // ???????????????
  onSelectGroup = async (group, data, isMultiple) => {
    let { all_collection } = this.state
    // console.log(group,data)
    let params = {
      id: data.id,
      area_type_id: group.id,
      board_id: this.state.current_board.board_id
    }
    if (data.group_id) {
      await this.CollectionReMerge(data)
    }
    Action.editCollection(params).then(res => {
      // console.log(res)
      if (!isMultiple) {
        message.success(
          <span>
            ??????<a>{data.title}</a>
            ?????????<a>{group.name}</a>
            ??????
          </span>
        )
        // this.fetchCollection();
        let arr = Array.from(all_collection)
        arr = arr.map(item => {
          if (item.id === data.id) {
            item.area_type_id = group.id
          }
          return item
        })
        this.updateAllCollectionReset(arr)
      }
    })
  }

  // ????????????????????????
  onMultipleSelectGroup = (val, id) => {
    let arr = Array.from(this.state.area_selected)
    if (val.target.checked) {
      arr.push(id)
    } else {
      arr = arr.filter(item => item !== id)
    }
    this.setState(
      {
        area_selected: arr
      },
      () => {
        let data = [...this.state.area_list]
        let selectData = []
        arr.forEach(item => {
          let obj = data.find(d => d.id === item)
          if (obj) {
            selectData = selectData.concat(obj.collection || [])
          }
        })
        this.renderCollection(selectData)
      }
    )
  }

  onAreaDelete = val => {
    if (val.collection && val.collection.length) {
      return message.error('????????????????????????????????????')
    }
    Action.RemoveArea(val.id, val.board_id)
      .then(res => {
        if (res && res.code === '0') {
          message.success('????????????')
          let arr = this.state.area_list.filter(item => item.id !== val.id)
          this.setState({
            area_list: arr,
            multipleGroup: this.state.multipleGroup ? arr.length > 1 : false
          })
        }
      })
      .catch(err => {
        console.log(err)
        message.error(`${err.message},??????????????????`)
      })
  }
  // ????????????
  onAreaEdit = (flag, val) => {
    let data = { ...val, _edit: flag }
    let list = [...this.state.area_list]

    let arr = list.map(item => {
      if (item.id === val.id) {
        item = data
      }
      return item
    })
    this.setState({
      area_list: arr
    })
  }

  renderGroupPointer = () => {
    Action.renderGroupPointer(this.state.area_list)
  }
  clearGroupPointer = () => {
    Action.clearGroupPointer()
  }

  // ??????panel????????????
  setActiveCollapse = key => {
    window.ProjectGroupId = key
    this.setState({ area_active_key: key })
    if (this.state.multipleGroup) return
    // ??????????????????????????????
    if (!key) {
      this.renderCollection([])
      this.renderGroupPointer()
      Action.clearGroupCollectionPoint()
    } else {
      this.clearGroupPointer()
    }
    this.hiddenDetail()
    this.setState({ area_selected: key ? [key] : '' })
    if (key) {
      let obj = this.state.area_list.find(item => item.id === key)
      if (obj) {
        window.ProjectGroupName = obj.name
        this.renderCollection(obj.collection || [], obj, true)
      } else {
        this.renderCollection(this.state.not_area_id_collection || [])
      }
    }
  }

  // ?????????????????????
  onUploadPlanStart = () => {
    this.hideOtherSlide()
  }

  // ?????????????????????
  onUploadPlanCancel = () => {
    this.showOtherSlide()
  }

  // ???????????????
  onUploadPlan = (val, resp, filelist, setData, firstSave) => {
    this.showOtherSlide()
    // console.log(resp);
    if (resp) {
      message.success('????????????')
      let content =
        setData && firstSave
          ? {
              content: firstSave.data.id
            }
          : {
              content: resp.id
            }
      let { id, name } = resp

      let params = {
        board_id: this.state.current_board.board_id,
        area_type_id: val.id,
        collect_type: 5,
        ...content,
        resource_id: id,
        target: 'plan',
        title: name
      }
      Action.addCollection(params)
        .then(res => {
          // console.log(res);
          // ?????????????????????
          this.fetchCollection()
        })
        .catch(err => {
          // ????????????
          console.log(err.message)
          message.error(err.message)
        })
    }
  }

  // ??????????????????
  onChangeDisplay = (val, collection) => {
    // ?????????????????????????????????
    if (this.needSingleDisplayGroup.includes(val.name)) {
      if (val.collection.length > 0) {
        let is_display = collection.is_display
        let param = {
          id: collection.id,
          is_display: is_display === '1' ? '0' : '1'
        }
        let tmpAllCollection = this.state.all_collection
        let index = tmpAllCollection.findIndex(item => {
          return item.id === param.id
        })
        if (index > -1) {
          tmpAllCollection[index].is_display = param.is_display
        }
        Action.editCollection(param)
        if (param.is_display === '1') {
          let currentCollection = val.collection
          for (let i = 0; i < currentCollection.length; i++) {
            if (currentCollection[i].target === 'geojson') {
              if (currentCollection[i].id === collection.id) {
                continue
              }
              if (currentCollection[i].is_display === '1') {
                Action.editCollection({
                  id: currentCollection[i].id,
                  is_display: 0
                })
                let index = tmpAllCollection.findIndex(item => {
                  return item.id === currentCollection[i].id
                })
                if (index > -1) {
                  tmpAllCollection[index].is_display = '0'
                }
              }
            }
          }
        }
        this.updateAllCollectionReset(tmpAllCollection)
      }
    } else {
      // console.log(val, collection)
      let is_display = collection.is_display
      let param = {
        id: collection.id,
        is_display: is_display === '1' ? '0' : '1'
      }
      let arr = this.state.all_collection.map(item => {
        if (item.id === collection.id) {
          collection.is_display = param.is_display
          item = collection
        }
        return item
      })
      this.updateAllCollectionReset(arr)
      Action.editCollection(param)
    }
  }
  // ???????????????
  onEditPlanPic = (val, collection) => {
    const { dispatch } = this.props
    const baseMapKeys = mapApp.baseMapKeys
    const baseMapKey = mapApp.baseMapKey
    // console.log(val,collection)
    this.hideOtherSlide()
    this.hiddenDetail()
    let img = Action.findImgLayer(collection.resource_id)
    Action.setEditPlanPicLayer(val, img, dispatch, collection)
      .then(async resp => {
        let param = {
          extent: resp.extent.join(','),
          transparency: resp.opacity,
          coord_sys_type: baseMapKeys[0].indexOf(baseMapKey) > -1 ? 0 : 1
        }
        this.showOtherSlide()
        let imgid = collection.resource_id
        if (resp.blobFile) {
          imgid = collection.content
          let formdata = new FormData()
          formdata.append('file', resp.blobFile)
          formdata.append('extent', param.extent)
          formdata.append('transparency', param.transparency)
          formdata.append('coord_sys_type', param.coord_sys_type)
          let saved = await Axios.post(
            `${MAP_REQUEST_URL}/map/ght/${val.id}`,
            formdata,
            {
              headers: { Authorization: Cookies.get('Authorization') }
            }
          )

          await Action.editCollection({
            id: collection.id,
            resource_id: saved.data.data.id
          })
        }

        Action.saveEditPlanPic(imgid, param).then(res => {
          message.success(`??????${collection.title}??????`)
          this.fetchCollection()
        })
      })
      .catch(err => {
        if (err.code === -1) {
          /**message.warn(err.message)*/
        } else message.error(err.message)
        this.showOtherSlide()
      })
  }
  //
  audioDistory = () => {
    // ???????????????
  }

  onRemarkSave = data => {
    Action.modifyRemark(data).then(res => {
      this.fetchCollection()
    })
  }

  //????????????????????????
  onModifyFeatureInDetails = data => {
    const { displayPlotPanel } = this.props
    Action.modifyFeature(data, displayPlotPanel)
  }

  //????????????????????????
  onStopMofifyFeatureInDetails = () => {
    Action.stopModifyFeature()
  }

  onToggleChangeStyle = val => {
    this.setState({
      activeId: val.id
    })
  }
  // ??????collection
  onCopyCollection = (val, collection, isMultiple = false) => {
    let obj = {
      collect_type: collection.collect_type,
      title: collection.title,
      target: collection.target,
      area_type_id: val.id,
      board_id: val.board_id,
      content: collection.content
    }
    // console.log(obj)
    return Action.addCollection(obj).then(res => {
      if (!isMultiple) {
        message.success(
          <span>
            ??????<a>{collection.title}</a>
            ?????????<a>{val.name}</a>
            ??????
          </span>
        )
        // this.fetchCollection();
        this.updateAllCollectionReset([
          ...this.state.all_collection,
          res.data[0]
        ])
      }
      return res.data[0]
    })
  }

  //
  onBeforeUploadPlan = () => {}
  onExcelSuccess = arr => {
    this.fetchCollection()
  }

  // ????????????
  setMultipleCheck = () => {
    this.setState({ multipleGroup: !this.state.multipleGroup })
  }

  // ????????????
  onCollectionDragEnd = (data, result) => {
    let ondragId = data.id
    // return message.warn('????????????????????????');
    if (
      !result.destination ||
      result.source.index === (result.destination && result.destination.index)
    ) {
      return
    }
    // ????????????????????????
    const reorder = (list, startIndex, endIndex) => {
      let result = Array.from(list)
      //??????????????? ????????????
      const [removed] = result.splice(startIndex, 1)
      //?????????????????????????????????
      result.splice(endIndex, 0, removed)
      result = result.map((item, index) => {
        item.__index = index + 1
        return item
      })
      return result
    }

    let area_list = Array.from(this.state.area_list)

    // ???????????????????????????
    let obj = area_list.find(item => item.id === ondragId)
    const items = reorder(
      obj ? obj.collection : [],
      result.source.index,
      result.destination.index
    )
    // ??????
    area_list = area_list.map(item => {
      if (item.id === ondragId) {
        item.collection = items.sort((a, b) => a.__index - b.__index)
      }
      return item
    })
    // ???????????????
    clearTimeout(this.saveSortTimer)
    this.setState(
      {
        area_list
      },
      () => {
        this.saveSortTimer = setTimeout(() => {
          this.saveSort(items)
        }, this.saveSortTime)
      }
    )
  }
  // ??????????????????
  saveSort = data => {
    let ids = []
    // ???????????????id
    data.forEach(item => {
      if (item.type === 'groupCollection') {
        ids = ids.concat(item.childIds)
      } else {
        ids.push(item.id)
      }
    })
    let param = {
      board_id: this.state.current_board.board_id,
      sort: ids
    }
    // ????????????
    Action.saveSortCollection(param)
  }
  // ????????????????????????????????????????????????,???????????????????????????????????????
  getFirstAreaCollection = index => {
    for (let i = index; i < this.state.area_list.length; i++) {
      let item = this.state.area_list[i]
      if (this.state.area_active_key) {
        if (this.state.area_active_key === item.id) {
          return item
        }
      } else if (item.collection && item.collection.length) {
        return item
      }
    }
  }

  // ????????????
  StopPlay = () => {
    this.setState({
      isPlay: false,
      playing: false,
      currentGroup: {}
    })
    this.showOtherSlide()
    this.fetchCollection()
    PlayCollectionAction.stop()
    Action.addToListen({ board_id: this.state.current_board.board_id })
  }

  // ???????????????
  playNextGroup = () => {
    PlayCollectionAction.stop()
    // ??????????????????
    let next = this.checkHasNextGroup()
    if (next) {
      this.startPlayCollection('', next)
      Evt.firEvent('autoPlayChange')
    }
  }

  // ???????????????
  playPrevGroup = () => {
    PlayCollectionAction.stop()
    let prev = this.checkHasPrevGroup()
    if (prev) {
      this.startPlayCollection('', prev)
      Evt.firEvent('autoPlayChange')
    }
  }
  // ???????????????goupId?????????????????????
  getSameGroupIdData = data => {
    if (!data.length) return []
    let arr = []
    data.forEach(item => {
      if (item.group_id) {
        // ????????????????????????????????????group_id??????????????????????????????????????????
        let hasGroup = arr.find(a => a.gid === item.group_id)
        // ??????????????????groupid????????????
        if (hasGroup && hasGroup.child) {
          hasGroup.child.push(item)
          // ?????????????????????id
          hasGroup.childIds.push(item.id)
        } else if (hasGroup) {
          hasGroup.child = [item]
          hasGroup.childIds = [item.id]
        } else {
          // ???????????????????????????
          let obj = {
            gid: item.group_id,
            title: '',
            id: item.id,
            area_type_id: item.area_type_id,
            collect_type: 'group',
            target: 'none',
            type: 'groupCollection',
            childIds: [item.id],
            child: [item],
            create_by: {},
            sort: item.sort,
            __index: item.__index
          }
          arr.push(obj)
        }
      } else arr.push(item)
    })

    // ?????????????????????????????????
    arr = arr.map(item => {
      if (item.gid && item.child.length === 1) {
        return item.child[0]
      } else return item
    })
    return arr
  }

  // ????????????????????????
  checkHasNextGroup = () => {
    let current = this.state.currentGroup ? { ...this.state.currentGroup } : {}
    let index = this.state.area_list.findIndex(item => item.id === current.id)
    if (index !== -1) {
      let next = this.state.area_list[index + 1]
      if (next) {
        if (next.collection && next.collection.length) return next
        else {
          for (let i = index + 1; i < this.state.area_list.length; i++) {
            let item = this.state.area_list[i]
            if (item.collection && item.collection.length) {
              return item
            }
          }
        }
      } else return undefined
    } else return undefined
  }
  // ????????????????????????
  checkHasPrevGroup = () => {
    let current = this.state.currentGroup ? { ...this.state.currentGroup } : {}
    let index = this.state.area_list.findIndex(item => item.id === current.id)
    if (index !== -1) {
      if (index === 0) {
        return undefined
      }
      let prev = this.state.area_list[index - 1]
      if (prev) {
        if (prev.collection.length) return prev
        else {
          for (let i = index - 1; i >= 0; i--) {
            let item = this.state.area_list[i]
            if (item.collection && item.collection.length) {
              return item
            }
          }
        }
      } else return undefined
    } else return undefined
  }
  // ????????????
  startPlayCollection = (mode, areaData, index = 0) => {
    // ???????????????????????????????????????????????????
    let data = []
    if (areaData && areaData.collection.length) {
      data = areaData
    } else {
      data = this.getFirstAreaCollection(index)
      !data && (data = {})
    }
    // ?????????????????????
    let collection =
      data.collection &&
      data.collection.filter(
        item => item.is_display === '1' || item.type === 'groupCollection'
      )
    if (!collection || (collection && !collection.length))
      return message.warn('??????????????????????????????????????????')
    let arr = []
    collection.forEach(item => {
      if (
        item.collect_type !== '4' &&
        item.collect_type !== '5' &&
        item.collect_type !== 'group'
      ) {
        if (item.location && item.location.hasOwnProperty('latitude')) {
          arr.push(item)
        }
      } else arr.push(item)
    })
    let flag = PlayCollectionAction.setData(
      mode,
      arr.sort((a, b) => (a.__index || 0) - (b.__index || 0))
    )
    if (flag) {
      // ??????????????????????????????
      Action.clearListen()
      PlayCollectionAction.play()
      this.hideOtherSlide()
      this.setState(
        {
          isPlay: true,
          playing: true,
          currentGroup: data
        },
        () => {
          // ???????????????????????????????????????????????????????????????????????????
          let next = this.checkHasNextGroup()
          let prev = this.checkHasPrevGroup()
          this.setState({
            notNextGroup: !next,
            notPrevGroup: !prev
          })
        }
      )
    }
  }
  // ????????????
  CollectionReMerge = collection => {
    return new Promise((resolve, reject) => {
      let param = {
        data_id: collection.id
      }
      Action.cancelMergeCollection(param)
        .then(res => {
          resolve(res)
        })
        .catch(err => {
          message.warn(err.message)
          reject(err)
        })
    })
  }

  // ????????????,????????????
  CollectionMerge = async (type, data, collection, index) => {
    let current = data.collection
    let other = null
    let ids = []
    if (type === 'up') {
      other = current[index - 1]
      ids = [other.id, collection.id]
    }
    if (type === 'down') {
      other = current[index + 1]
      ids = [collection.id, other.id]
    }
    let array = Array.from(this.state.all_collection)
    // ??????
    if (ids.length)
      Action.saveMergeCollection({ data_ids: ids }).then(res => {
        message.success('????????????')
        // this.fetchCollection();
        let g_id = [],
          list = []
        let arr = array.filter(item => ids.includes(item.id))
        g_id = arr.map(item => item.group_id).filter(v => v)
        if (g_id.length) {
          // ????????????groupId???????????????????????????????????????
          if (g_id.length > 1) {
            let oldId = g_id[1]
            let newId = g_id[0]
            list = array.map(item => {
              if (ids.includes(item.id)) {
                item.group_id = newId
              }
              if (item.group_id === oldId) {
                item.group_id = newId
              }
              return item
            })
          } else if (g_id.length === 1) {
            list = array.map(item => {
              if (ids.includes(item.id)) {
                item.group_id = g_id[0]
              }
              return item
            })
          }
        } else {
          let mgId = Math.round(Math.random() * 1000000 + 1)
          list = array.map(item => {
            if (ids.includes(item.id)) {
              item.group_id = mgId
            }
            return item
          })
        }
        this.updateAllCollectionReset(list)
      })
    // ??????????????????
    if (type === 'cancel') {
      await this.CollectionReMerge(collection)
      message.success('????????????')
      array = array.map(item => {
        if (item.id === collection.id) {
          item.group_id = ''
        }
        return item
      })
      this.updateAllCollectionReset(array)
      // this.fetchCollection();
    }
  }

  toPlayCollection = data => {
    // console.log(data)
    let { mode, time, showone } = data
    PlayCollectionAction.playMode = mode
    PlayCollectionAction.autoPlayTime = time
    PlayCollectionAction.justShowOne = showone

    // ????????????
    this.startPlayCollection(mode)
    this.setState({ playCollectionVisible: false })
  }
  // ???????????????????????????????????????????????????
  checkItem = val => {
    const { dispatch } = this.props
    let type = Action.checkCollectionType(val.target)
    // if(val.collect_type === '4'){
    let feature = Action.getFeatureById(val.id)
    if (feature) {
      let geo = feature.getGeometry()
      let properties = this.getProperties(geo.getType(), geo)
      val = Object.assign({}, { properties_map: properties }, val)
    }
    // }
    if (!this.tempProjectId.includes(this.props.projectId)) {
      dispatch({
        type: 'collectionDetail/updateDatas',
        payload: {
          selectData: val,
          selectedFeature: feature,
          type: 'edit',
          isImg: type === 'pic' || type === 'video' || type === 'interview'
        }
      })
    }
    Action.handleCollectionPoint(val)
  }

  CollectionViewScroll = e => {
    // console.log(e)
    let target = e.target
    this.collectionScrollTop = target.scrollTop
  }

  // ??????????????????
  collectionWhell = e => {
    let whellY = e.deltaY
    if (this.collectionScrollTop === 0 && whellY < 0) {
      // console.log('?????????????????????');
      this.setState({
        miniTitle: false
      })
    } else if (this.collectionScrollTop > 0 && whellY > 0) {
      // console.log('???????????????')
      this.setState({
        miniTitle: true
      })
    }
  }
  // ????????????
  move = evt => {
    if (!this.isTouch) return
    let touchM = this.getTouch(evt)
    let y = touchM.y - this.touchStartClient.y
    if (y > 0 && this.collectionScrollTop === 0) {
      // console.log('???????????????');
      this.setState({
        miniTitle: false
      })
    } else if (y < 0 && this.collectionScrollTop > 0) {
      // console.log('????????????')
      this.setState({
        miniTitle: true
      })
    }

    this.touchStartClient = touchM
  }
  collectionTouchStart = e => {
    if (e.pointerType === 'mouse') return
    this.isTouch = true
    this.touchStartClient = this.getTouch(e)
  }

  getTouch = e => {
    return { x: e.layerX || e.pageX, y: e.layerY || e.pageY }
  }
  onPlanRef = ref => {
    this.planRef = ref
  }

  PublicView = ({ children, height }) => {
    let { miniTitle } = this.state
    let h = height
      ? height
      : miniTitle
      ? 'calc(100vh - 150px)'
      : 'calc(100vh - 415px)'
    return (
      <div
        className={styles.publicview}
        style={{ display: 'flex', flexDirection: 'column', height: h }}
        ref={this.scrollView}
        onScroll={this.CollectionViewScroll}
        onWheel={this.collectionWhell}
        onPointerDown={this.collectionTouchStart}
        onPointerMove={this.move}
        onPointerOut={() => {
          this.isTouch = false
        }}
      >
        {children}
      </div>
    )
  }

  /** ????????????????????? */
  onSetCoordinates = async val => {
    message.success(
      <span>
        ??????????????????????????????????????????
        {/* ???{" "}
        <a
          onClick={e => {
            e.stopPropagation();
            this.cancelEditCollection();
          }}
        >
          ????????????
        </a> */}
      </span>,
      0
    )
    val.title = val.name
    // let res = await Action.addCollectionPosition(val);
    const res = await Action.addCollectionCoordinates(false, val).catch(
      err => false
    )
    if (!res) {
      this.cancelEditCollection()
      return
    }
    let coor = res
    let resp = await Action.setGropCoordinates(val.id, {
      coordinate: [coor.longitude, coor.latitude]
    }).catch(err => message.warn(err.message))
    if (resp) {
      notification.success({
        message: '????????????',
        description: '????????????????????????????????????????????????????????????????????????????????????'
      })
      this.cancelEditCollection()
      let list = this.state.area_list.map(item => {
        if (item.id === val.id) {
          item.longitude = coor.longitude
          item.latitude = coor.latitude
        }
        return item
      })

      if (!this.state.area_active_key || !this.state.area_active_key?.length)
        // ?????????????????????????????????????????????
        this.updateCollection(Array.from(this.state.all_collection), list)

      // ????????????
      // this.setActiveCollapse("");
      // ??????????????????
      // this.renderGroupPointer();
      Action.clearGroupCollectionPoint()
    }
  }

  selectionCollection = val => {
    this.setState({
      selections: val
    })
  }
  onNotAreaIdSelection = val => {
    this.setState({
      notAreaIdSelections: val
    })
  }
  // ????????????
  onMultipleRemove = () => {
    let arr = [...this.state.selections, ...this.state.notAreaIdSelections]
    let list = Array.from(this.state.all_collection)
    if (!arr.length) return
    ;(async () => {
      for (let i = 0; i < arr.length; i++) {
        Action.removeCollection(arr[i]).catch(err => console.log(err))
      }
    })()
    list = list.filter(item => !arr.includes(item.id))
    this.setState(
      {
        all_collection: list,
        notAreaIdSelections: [],
        selections: []
      },
      () => {
        message.success('????????????')
        this.hiddenDetail()
        this.updateAllCollectionReset(list)
        Action.oldData = list
      }
    )
  }

  // ??????????????????
  GroupSelection = ({ onSelect }) => {
    const { area_list, selections, notAreaIdSelections } = this.state
    let arr = Array.from([...selections, ...notAreaIdSelections])
    const selectGroup = val => {
      onSelect && onSelect(val)
    }
    // ?????????????????????????????????????????????????????????
    let selectAreaId = this.state.all_collection.filter(item =>
      arr.includes(item.id)
    )
    selectAreaId = selectAreaId.map(item => item.area_type_id)
    return (
      <div className={styles.selectActionGroup}>
        {area_list.map(item => {
          if (selectAreaId.includes(item.id)) {
            return ''
          } else
            return (
              <div
                key={item.id}
                onClick={() => selectGroup(item)}
                style={{ cursor: 'pointer' }}
              >
                {item.name}
              </div>
            )
        })}
      </div>
    )
  }

  onRecoverGeojsonIcon = data => {
    geojsonResource
      .delete(data.id)
      .then(res => {
        if (res && res.code === '0') {
          message.success('?????????????????????')
          Action.reRenderGeojson()
        }
      })
      .catch(e => {
        message.error(e.message)
      })
  }

  onModifyGeojsonIcon = data => {
    let geojsonResources = Action.getGeojsonIcon()
    let icon = geojsonResources[data.id]
    if (!icon) {
      message.info('?????????????????????????????????')
    } else {
      Event.Evt.firEvent('openModifyPointPanel', icon)
      Event.Evt.un('modifyGeojsonIcon')
      Event.Evt.on('modifyGeojsonIcon', icon => {
        geojsonResource
          .add({
            geojson_id: data.id,
            image_base64: icon
          })
          .then(res => {
            if (res && res.code === '0') {
              message.success('?????????????????????')
              Action.reRenderGeojson()
            }
          })
          .catch(e => {
            message.error(e.message)
          })
      })
    }
  }

  MultipleMenus = () => {
    const onHandle = ({ key }) => {
      if (key === 'coordinates') {
        let arr = [...this.state.selections, ...this.state.notAreaIdSelections]
        if (!arr.length) return message.warn('??????????????????????????????')
        let selection = this.state.all_collection.filter(item =>
          arr.includes(item.id)
        )
        let m = selection.filter(
          item => item.target === 'feature' || item.target === 'plan'
        )
        if (m.length)
          return message.warn(
            '???????????????????????????????????????????????????????????????????????????????????????'
          )

        setHide()
        this.hideOtherSlide()
        message.success(`??????????????????????????????????????????????????????????????????`, 0)
        this.hiddenDetail()
        Action.addCollectionCoordinates(true, {})
          .then(val => {
            val.longitude = val.longitude.toString()
            val.latitude = val.latitude.toString()
            let p = selection.map(item => {
              return Action.editCollection({
                id: item.id,
                title: item.name,
                location: {
                  ...val,
                  site_name: val.title
                }
              })
            })
            Promise.all(p)
              .then(() => {
                message.success('????????????')
                let array = Array.from(this.state.all_collection)
                array = array.map(item => {
                  if (arr.includes(item.id)) {
                    item.location = val
                  }
                  return item
                })
                this.updateAllCollectionReset(array)
              })
              .catch(err => {
                console.log(err)
              })
            message.destroy()
            this.showOtherSlide()
          })
          .catch(err => {
            console.log(err)
            this.showOtherSlide()
            message.destroy()
          })
      }
    }
    const setHide = () => {
      this.setState({
        showMoreAction: false
      })
    }
    const onSelect = (type, val) => {
      let { selections, notAreaIdSelections } = this.state
      let arr = [...selections, ...notAreaIdSelections]
      let selectArr = this.state.all_collection.filter(item =>
        arr.includes(item.id)
      )
      if (!arr.length) return message.warn('?????????????????????')
      if (type === 'copy') {
        let notA = selectArr.filter(item => item.collect_type !== '4')
        if (notA.length) {
          return message.warn('???????????????????????????????????????????????????')
        }
      }
      let promise = selectArr.map(item => {
        if (type === 'copy') {
          return this.onCopyCollection(val, item, true)
        } else {
          return this.onSelectGroup(val, item, true)
        }
      })
      Promise.all(promise).then(res => {
        if (type === 'copy') {
          this.updateAllCollectionReset([...this.state.all_collection, ...res])
          message.success(
            <span>
              ????????? <a>{val.name}</a> ????????????
            </span>
          )
        } else {
          let array = Array.from(this.state.all_collection)
          array.map(item => {
            if (arr.includes(item.id)) {
              item.area_type_id = val.id
            }
            return item
          })
          this.updateAllCollectionReset(array)
          message.success(
            <span>
              ????????? <a>{val.name}</a> ????????????
            </span>
          )
        }
        setTimeout(() => {
          this.setState({
            notAreaIdSelections: [],
            selections: []
          })
        })
      })
      // console.log(type,val)
      setHide()
    }
    return (
      <Menu onClick={onHandle}>
        <Menu.Item key="copy">
          <Popover
            trigger="click"
            visible={this.state.setCopyVisible}
            onVisibleChange={val => this.setState({ setCopyVisible: val })}
            title="???????????????????????????"
            overlayStyle={{ zIndex: 1050 }}
            content={() =>
              this.GroupSelection({ onSelect: onSelect.bind(this, 'copy') })
            }
          >
            <div>???????????????</div>
          </Popover>
        </Menu.Item>
        <Menu.Item key="move">
          <Popover
            trigger="click"
            visible={this.state.setMoveVisible}
            onVisibleChange={val => this.setState({ setMoveVisible: val })}
            title="???????????????????????????"
            overlayStyle={{ zIndex: 1050 }}
            content={() =>
              this.GroupSelection({ onSelect: onSelect.bind(this, 'move') })
            }
          >
            <div>???????????????</div>
          </Popover>
        </Menu.Item>
        <Menu.Item key="coordinates">????????????</Menu.Item>
        <Menu.Item key="remove">
          <Popconfirm
            title={`?????????????????????${
              [...this.state.selections, ...this.state.notAreaIdSelections]
                .length
            }?????????????????????`}
            onConfirm={() => {
              this.onMultipleRemove()
              setHide()
            }}
            okText="??????"
            cancelText="??????"
            overlayStyle={{ zIndex: 1050 }}
          >
            <div className="danger">??????</div>
          </Popconfirm>
        </Menu.Item>
      </Menu>
    )
  }

  /**
   * ????????????????????????
   */
  changeAnimate = (visible, data) => {
    let arr = this.state.all_collection.map(item => {
      if (item.id === data.id) {
        item._animate = visible
      }
      return item
    })
    this.updateAllCollectionReset(arr)
  }

  renderForActive = key => {
    const {
      area_list,
      not_area_id_collection,
      activeId,
      current_board
    } = this.state
    const defaultHeight = this.state.miniTitle
      ? 'calc(100vh - 100px)'
      : 'calc(100vh - 370px)'
    const defaultHeight2 = this.state.miniTitle
      ? 'calc(100vh - 190px)'
      : 'calc(100vh - 430px)'
    const { dispatch } = this.props
    const { PublicView } = this
    switch (key) {
      case '1':
        return (
          <Fragment>
            <PublicView>
              <Collapse
                onChange={e => {
                  this.setActiveCollapse(e)
                }}
                className={styles.scoutingItem}
                accordion={true}
                activeKey={this.state.area_active_key}
                expandIconPosition="left"
                expandIcon={({ isActive }) => (
                  <Icon
                    type="caret-right"
                    CaretRightOutlined
                    rotate={isActive ? 90 : 0}
                  />
                )}
              >
                {area_list.map((item, index) => {
                  let activeStyle = null
                  if (item.id === activeId) {
                    activeStyle = { backgroundColor: 'rgba(214,228,255,0.5)' }
                  }
                  if (item.collect_type === '9') {
                    this.publicDataLinkArr.push({ key: '', children: [] })
                  }
                  return (
                    <Collapse.Panel
                      header={
                        <ScoutingHeader
                          selected={this.state.area_selected}
                          onSelect={this.onMultipleSelectGroup}
                          onAreaEdit={this.onAreaEdit.bind(this, true)}
                          total={item.length}
                          data={item}
                          board={item}
                          activeKey={this.state.area_active_key}
                          index={index + 1}
                          edit={item._edit}
                          remarkEdit={item._remarkEdit}
                          onCancel={this.addCancel.bind(this, item)}
                          onSave={this.saveArea.bind(this, item)}
                          onRemarkSave={() => this.saveRemark(item)}
                          multiple={this.state.multipleGroup}
                          onUploadPlanStart={this.onUploadPlanStart.bind(
                            this,
                            item
                          )}
                          uploadPanorama={this.uploadPanorama}
                          onChange={this.filesChange.bind(this, item)}
                          onUpload={this.fileUpload.bind(this, item)}
                          onUploadPlan={this.onUploadPlan.bind(this, item)}
                          onUploadPlanCancel={this.onUploadPlanCancel}
                          onError={this.onAddError}
                          onAreaDelete={this.onAreaDelete}
                          onExcelSuccess={this.onExcelSuccess}
                          dispatch={dispatch}
                          onSetCoordinates={this.onSetCoordinates}
                          parentTool={this.props.parentTool}
                          boardId={this.state.current_board.board_id}
                          parent={this}
                          // onDragEnter={e => {this.setState({area_active_key: item.id})}}
                        />
                      }
                      key={item.id}
                      style={{ backgroundColor: '#fff', marginBottom: '10px' }}
                    >
                      <ScoutingItem
                        parent={this}
                        index={this.publicDataLinkArr.length - 1}
                        callback={this.renderAreaList}
                        onSelectCollection={this.selectionCollection}
                        CollectionEdit={this.state.isEdit}
                        board={this.state.current_board}
                        selected={this.state.selections}
                        // dispatch={dispatch}
                        onCheckItem={this.checkItem}
                        // onDrop={()=> console.log(item)}
                        style={activeStyle}
                        data={item}
                        onSelectGroup={this.onSelectGroup}
                        dataSource={item.collection}
                        areaList={area_list}
                        onCollectionRemove={this.onCollectionRemove.bind(
                          this,
                          item
                        )}
                        onEditCollection={this.onEditCollection}
                        onChangeDisplay={this.onChangeDisplay.bind(this, item)}
                        onEditPlanPic={this.onEditPlanPic.bind(this, item)}
                        onRemarkSave={this.onRemarkSave}
                        onModifyRemark={this.onModifyRemark}
                        onModifyFeature={this.onModifyFeatureInDetails}
                        onStopMofifyFeatureInDetails={() =>
                          this.onStopMofifyFeatureInDetails()
                        }
                        onToggleChangeStyle={this.onToggleChangeStyle}
                        onCopyCollection={this.onCopyCollection}
                        onDragEnd={this.onCollectionDragEnd}
                        onMergeDown={this.CollectionMerge.bind(
                          this,
                          'down',
                          item
                        )}
                        onMergeUp={this.CollectionMerge.bind(this, 'up', item)}
                        onMergeCancel={this.CollectionMerge.bind(
                          this,
                          'cancel',
                          item
                        )}
                        onChangeAnimate={this.changeAnimate}
                        onRecoverGeojsonIcon={this.onRecoverGeojsonIcon}
                        onModifyGeojsonIcon={this.onModifyGeojsonIcon}
                      />
                    </Collapse.Panel>
                  )
                })}
                {/* ??????????????????????????????????????????????????? */}
                {not_area_id_collection.length && (
                  <Collapse.Panel
                    key="other"
                    style={{ backgroundColor: '#fff', marginBottom: '10px' }}
                    header={
                      <ScoutingHeader
                        data={{ name: '?????????', id: 'other' }}
                        total={not_area_id_collection.length}
                        edit={false}
                        activeKey={this.state.area_active_key}
                        index={area_list.length + 1}
                        onCancel={() => {}}
                        onSave={() => {}}
                        // onDragEnter={e => {this.setState({area_active_key: item.id})}}
                      />
                    }
                  >
                    {!!not_area_id_collection.length ? (
                      <Checkbox.Group
                        onChange={this.onNotAreaIdSelection}
                        style={{ width: '100%' }}
                        value={this.state.notAreaIdSelections}
                      >
                        <div className={styles.norAreaIdsData}>
                          {not_area_id_collection.map((item, index) => {
                            let activeStyle = null
                            if (item.id === activeId) {
                              activeStyle = {
                                backgroundColor: 'rgba(214,228,255,0.5)'
                              }
                            }
                            return (
                              <div
                                key={item.id}
                                className={`${animateCss.animated} ${animateCss.slideInRight}`}
                                style={{
                                  animationDuration: '0.3s',
                                  animationDelay: index * 0.02 + 's',
                                  width: '100%'
                                }}
                              >
                                {item.collect_type !== '9' ? (
                                  <UploadItem
                                    Edit={this.state.isEdit}
                                    onCheckItem={this.checkItem}
                                    style={activeStyle}
                                    data={item}
                                    parent={this}
                                    type={Action.checkCollectionType(
                                      item.target
                                    )}
                                    areaList={area_list}
                                    onSelectGroup={this.onSelectGroup}
                                    onRemove={this.onCollectionRemove.bind(
                                      this,
                                      item
                                    )}
                                    onEditCollection={this.onEditCollection}
                                    onChangeDisplay={this.onChangeDisplay.bind(
                                      this,
                                      item
                                    )}
                                    onModifyRemark={this.onModifyRemark}
                                    onRemarkSave={this.onRemarkSave}
                                    onModifyFeature={
                                      this.onModifyFeatureInDetails
                                    }
                                    onStopMofifyFeatureInDetails={
                                      this.onStopMofifyFeatureInDetails
                                    }
                                    onToggleChangeStyle={
                                      this.onToggleChangeStyle
                                    }
                                    onCopyCollection={this.onCopyCollection}
                                  />
                                ) : (
                                  <PublicDataTreeComponent
                                    onRef={this.onPublicDataTreeComponentRef}
                                    datas={item}
                                    key={item.id}
                                    areaList={area_list}
                                    callback={this.renderAreaList}
                                    parent={this}
                                    index={this.publicDataLinkArr.length - 1}
                                    changeQueryStr={this.props.changeQueryStr}
                                  ></PublicDataTreeComponent>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </Checkbox.Group>
                    ) : (
                      <Empty
                        style={{ textAlign: 'center' }}
                        description="??????????????????"
                      />
                    )}
                  </Collapse.Panel>
                )}
              </Collapse>
            </PublicView>
            <div className={styles.addAreaBtn}>
              {!this.state.isEdit ? (
                <Space style={{ paddingBottom: 10 }}>
                  <Button
                    type="primary"
                    ghost
                    onClick={this.pushAreaItem}
                    size="small"
                    style={{
                      ...(this.props.parentTool &&
                        this.props.parentTool.getStyle(
                          'map:collect:type:add',
                          'project',
                          this.state.current_board.board_id
                        ))
                    }}
                    disabled={
                      this.props.parentTool &&
                      this.props.parentTool.getDisabled(
                        'map:collect:type:add',
                        'project',
                        this.state.current_board.board_id
                      )
                    }
                  >
                    <Icon type="plus-circle" PlusCircleOutlined />
                    <span style={{ fontSize: '0.6rem' }}>????????????</span>
                  </Button>
                  {area_list.length > 2 ? (
                    <Button
                      type="primary"
                      disabled={area_list.length < 2}
                      onClick={() => this.setMultipleCheck()}
                      ghost
                      size="small"
                    >
                      <MyIcon type="icon-duoxuan" />
                      <span style={{ fontSize: '0.6rem' }}>
                        {this.state.multipleGroup ? '?????????' : '?????????'}
                      </span>
                    </Button>
                  ) : null}
                  <Button
                    type="primary"
                    ghost
                    size="small"
                    onClick={() => {
                      this.setState({ isEdit: true })
                    }}
                  >
                    <MyIcon
                      type={
                        !this.tempProjectId.includes(this.props.projectId)
                          ? 'icon-huabi'
                          : 'icon-xuanze'
                      }
                    />
                    <span style={{ fontSize: '0.6rem' }}>
                      {this.tempProjectId.includes(this.props.projectId)
                        ? '??????'
                        : '??????'}
                    </span>
                  </Button>
                </Space>
              ) : (
                <Space>
                  <Dropdown
                    trigger="click"
                    visible={this.state.showMoreAction}
                    onVisibleChange={val =>
                      this.setState({ showMoreAction: val })
                    }
                    overlay={this.MultipleMenus()}
                  >
                    <Button type="primary" ghost size="small">
                      <MyIcon
                        type="icon-duoxuan"
                        style={{ fontSize: '1.3rem' }}
                      />
                      ??????
                    </Button>
                  </Dropdown>
                  <Button
                    type="primary"
                    ghost
                    onClick={() => {
                      this.setState({
                        isEdit: false,
                        notAreaIdSelections: [],
                        selections: []
                      })
                      // Event.Evt.firEvent("updateMeetingRoom", []);
                      dispatch({
                        type: 'meetingSubscribe/updateData',
                        payload: {
                          panelVisible: false
                        }
                      })
                    }}
                    size="small"
                  >
                    <MyIcon type="icon-chexiao" />
                    ??????
                  </Button>
                </Space>
              )}
            </div>
          </Fragment>
        )
      case '2':
        return (
          <PublicView height={defaultHeight}>
            {this.state.activeKey === '2' && (
              <LookingBack
                board={current_board}
                active={this.state.activeKey === '2'}
                miniTitle={this.state.miniTitle}
              />
            )}
          </PublicView>
        )
      case '3':
        return (
          <PublicView height={defaultHeight}>
            <Meettings
              board={current_board}
              active={this.state.activeKey === '3'}
              miniTitle={this.state.miniTitle}
            />
          </PublicView>
        )
      case '4':
        return (
          // <div
          //   style={{
          //     display: "flex",
          //     justifyContent: "center",
          //     alignItems: "center",
          //     height: 400,
          //   }}
          // >
          //   <span>?????????????????????...</span>
          // </div>
          <Fragment>
            <PublicView height={defaultHeight2}>
              <Plan
                board={current_board}
                parent={this.props.parent}
                scoutingDetail={this}
                showAddPlan={this.props.showAddPlan}
                onRef={this.onPlanRef}
              ></Plan>
            </PublicView>
            <div
              className={styles.addAreaBtn}
              style={{
                paddingTop: 0
              }}
            >
              <Button
                block
                className={styles.btn}
                onClick={() => {
                  this.setState(
                    {
                      addGroupDisabled: false
                    },
                    () => {
                      this.planRef && this.planRef.addGroup()
                    }
                  )
                }}
                style={{
                  ...(this.state.addGroupDisabled
                    ? {}
                    : {
                        pointerEvents: 'none',
                        cursor: 'not-allowed',
                        background: 'hsla(0,0%,100%,.1)'
                      })
                }}
              >
                <i
                  className={globalStyle.global_icon}
                  style={{ marginTop: 2, marginRight: 4 }}
                >
                  &#xe7dc;
                </i>
                <span>????????????</span>
              </Button>
            </div>
          </Fragment>
        )
      default: return null
    }
  }

  render() {
    const { current_board, isPlay, playing } = this.state
    const { selectData } = this.props
    const panelStyle = {
      // height: "100%",
    }
    return (
      <div
        className={`${styles.wrap} ${animateCss.animated} ${animateCss.slideInLeft}`}
        style={{ animationDuration: '0.3s' }}
        id="detailContent"
      >
        {this.state.audioData.ele && !this.state.audioData.ele.paused && (
          <AudioControl
            audioEle={this.state.audioData.ele}
            onDistory={this.audioDistory}
            data={this.state.audioData}
            onClose={() => this.setState({ audioData: {} })}
          />
        )}

        <Title
          className={this.state.miniTitle ? styles.miniTitle : styles.maxTitle}
          name={current_board.board_name}
          date={''}
          mini={this.state.miniTitle}
          id={current_board.board_id}
          data={current_board}
          groupId={this.state.area_active_key}
          collectData={this.state.all_collection}
          cb={this.handleGoBackClick.bind(this)}
          parentTool={this.props.parentTool}
          boardId={this.state.current_board.board_id}
          currentBoard={this.state.current_board}
        ></Title>
        <Tabs
          onChange={this.onChange}
          activeKey={this.state.activeKey}
          onEdit={this.onEdit}
          tabBarGutter={10}
          className={`${styles.detailContentTabs} detailTabs`}
        >
          {this.state.panes.map(pane => {
            let style = {}
            if (pane.key === '1') {
              let visible =
                this.props.parentTool &&
                this.props.parentTool.getCollectVisible(
                  pane.code,
                  this.state.current_board.board_id
                )
              style = visible
                ? {}
                : {
                    pointerEvents: 'none',
                    cursor: 'not-allowed',
                    display: 'none',
                    background: 'hsla(0,0%,100%,.1)'
                  }
              // this.setState({
              //   notRenderCollection: visible,
              // });
            } else {
              const { dispatch } = this.props
              style =
                this.props.parentTool &&
                this.props.parentTool.getStyle(
                  pane.code,
                  'project',
                  this.state.current_board.board_id
                )
            }
            let oldStyle = pane.key === '1' ? panelStyle : {}
            return (
              <TabPane
                tab={<span>{pane.title}</span>}
                key={pane.key}
                className={pane.className}
                closable={pane.closable}
                style={{ ...oldStyle, ...style }}
              >
                {this.renderForActive(pane.key)}
              </TabPane>
            )
          })}
          {/* <TabPane
            tab={<span>?????????</span>}
            key="1"
            style={panelStyle}
          >

          </TabPane> */}
        </Tabs>
        {playing && (
          <PlayCollectionControl
            isPlay={isPlay}
            onExit={this.StopPlay}
            currentGroup={this.state.currentGroup}
            onNextGroup={this.playNextGroup}
            onPrevGroup={this.playPrevGroup}
            hasNextGroup={!this.state.notNextGroup}
            hasPrevGroup={!this.state.notPrevGroup}
          />
        )}
        <CSSTransition
          in={!!selectData}
          classNames="slideRight"
          timeout={300}
          unmountOnExit
        >
          {/* {this.props.projectId !== "1340591617840648192" && (
            <CollectionDetail />
          )} */}
          <CollectionDetail />
        </CSSTransition>
        <BackTop target={() => this.scrollView.current} style={{ right: 10 }} />
      </div>
    )
  }
}
