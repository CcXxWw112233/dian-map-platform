import React from 'react'
import styles from '../index.less'
import Action from './Action'
import { Checkbox, Button, Input ,Tag ,message} from 'antd'
import Event from '../../../lib/utils/event'
const { Evt } = Event;

export default class FormatAddress extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            indeterminate:false,
            checkAll:false,
            searchValue:"",
            address:"",
            defaultSelect:[],
            currentObj:{},
            notIsLocation:[]
        };
        // this.currentObj = {};
        this.activePosition = [];
        this.config = null;

    }
    componentDidMount(){
        // 构建底层地图逻辑
        this.config = new Action('getAddressMap');
        // 添加底图，根据外层底图来展示
        this.config.baseLayer();
        this.config.Init();
        Evt.on('moveEndToSearch',this.setAddressName)
        this.getNotLocaionDatas();
    }
    checkAll = ()=>{

    }

    setAddressName = (data)=>{
        // console.log(data);
        this.activePosition = data.position;
        this.setState({
            address:data.address
        })
    }
    onChange = (e)=>{
        let value = e.target.value.trim();
        this.setState({
            searchValue:value
        })
    }

    getNotLocaionDatas = ()=>{
        let { dataSource } = this.props;
        let arr = [];
        dataSource.forEach(item => {
            if(!item.isLocation){
                arr.push(item)
            }
        })

        return arr;
    }

    handleClickProject = (val)=>{
        // console.log(val);
        // this.currentObj = val;
        this.setState({
            searchValue:val.address,
            currentObj: val
        },()=>{
            this.searchAddress(this.state.searchValue);
        })
    }

    searchAddress = (val)=>{
        // console.log(val)
        if(val){
            let offset = 10;
            window.CallWebMapFunction('getAddressForName',{address:val,offset}).then(res => {
                // console.log(res)
                if(res.length){
                    this.config.renderPoint(res);
                }
                else Action.Source.clear();
            })
        }
    }

    enterPosition = ()=>{
        let { onEnterPosition ,dataSource} = this.props;
        let obj = {
            position: this.activePosition,
            current: this.state.currentObj,
            address:this.state.address,
        }
        onEnterPosition && onEnterPosition(obj);
        let defaultSelect = Array.from(this.state.defaultSelect);
        defaultSelect.push(this.state.currentObj.uid);
        this.setState({
            defaultSelect
        });

        let index = dataSource.findIndex(item => item.uid === this.state.currentObj.uid);
        if(index > -1){
            let current = dataSource[index + 1];
            if(current){
             this.handleClickProject(current);
            }
        }


    }

    groupChange = (val)=>{
        console.log(val)
    }

    render(){
        let {  searchValue,address ,defaultSelect } = this.state;
        let { dataSource = [] } = this.props;
        let notLocations = this.getNotLocaionDatas();
        return (
            <div className={styles.FormatAddressModal}>
                <div className={styles.projectList}>
                    <div className={styles.checkedAll}>
                        <Tag color="warning">
                            共有{notLocations.length}条数据未确认
                        </Tag>
                        {/* <Checkbox onChange={this.checkAll} checked={checkAll}>全选</Checkbox> */}
                        <span className={styles.removeBtn}>
                            <Button type="text" danger size='small' disabled>
                                删除
                            </Button>
                        </span>
                    </div>
                    <div className={styles.listCheck}>
                        <Checkbox.Group onChange={this.groupChange} value={defaultSelect}>
                            {
                                dataSource.map(item => {
                                    return (
                                        <div className={`${styles.project_item} ${item.uid === this.state.currentObj.uid ? styles.active: ''}`} key={item.uid}>
                                            <Checkbox value={item.uid} onClick={()=> message.warn('暂不能选择')}></Checkbox>
                                            <div className={styles.project_item_detail}
                                            onClick={this.handleClickProject.bind(this,item)}>
                                                <div className={styles.project_detail_title}>
                                                    {item.name}
                                                    <span className={styles.tips}>
                                                        {item.isLocation ?
                                                        <Tag color="success">已确认</Tag>
                                                        :<Tag color="warning">点击预览</Tag>}
                                                    </span>
                                                </div>
                                                <div className={styles.address}>
                                                    {item.address}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </Checkbox.Group>
                    </div>
                </div>
                <div className={styles.chooseMaps}>
                    <div className={styles.searchAddress}>
                        <Input.Search
                        allowClear
                        placeholder="请输入地名"
                        value={searchValue}
                        onChange={this.onChange}
                        onSearch={this.searchAddress}/>
                    </div>
                    <div className={styles.addressName}>
                        <img crossOrigin="anonymous" src={require('../../../assets/location.png')} width='20px' alt=""/>
                        <span>{address}</span>
                        {this.state.currentObj.uid
                         && <Button size='small'
                         type='link'
                         onClick={this.enterPosition}>确定</Button>
                        }

                    </div>
                    <div className={styles.pointCenter}>
                        <img crossOrigin="anonymous" src={require('../../../assets/addPointLocation.png')} alt=""/>
                    </div>
                    <div id="getAddressMap"></div>
                </div>
            </div>
        )
    }
}
