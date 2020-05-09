import React from 'react'
import styles from './publicMapData.less'
import DataItem from './DataItem'
import  PublicDataActions  from '../../lib/components/PublicData'
import globalStyle from '../../globalSet/styles/globalStyles.less'
import publicData from '../../lib/components/PublicData'
const MenuData = require('./public_data').default

export default class PublicData extends React.Component{
    constructor(props){
        super(props)
        this.state = {

        }
        this.checkedParam = {};
        this.AllCheckData = MenuData.data;
    }
    componentDidMount(){
        // console.log(m)
        PublicDataActions.init();
    }
    // 获取多出来的那些 arr1 是原数据，arr2 是对比数据，新的数据是从arr2中获取
    getItems = (arr1 , arr2)=> {
        let arraynew = [];arr1 = new Set(arr1);
        arr2.forEach(arr => {
            if(!arr1.has(arr)){
                arraynew.push(arr);
            }
        })
        return arraynew ;
    }
    // 选项更新，获取更新的那些数据
    changeData = (oldVal = [], newVal = [])=>{
        // 新增了选项需要显示
        if(newVal.length > oldVal.length){
            let arr = this.getItems(oldVal,newVal);
            // 新增了哪些图层key
            let keys = this.getCheckBoxForDatas(arr);
            // console.log(keys, '新增了这些图层');
            // 获取数据，渲染元素
            if(keys.length){
                keys.forEach(item => {
                    // 加载所有的矢量图
                    PublicDataActions.getPublicData({url:'',data:{ ...item }});
                })
            }
        }else if(newVal.length < oldVal.length){
            // 删除了需要显示的内容
            let arr = this.getItems(newVal,oldVal);
            // 删除了哪些图层key
            let keys = this.getCheckBoxForDatas(arr);
            // console.log(keys, '删除了这些图层');
            if(keys.length){
                // 删除勾选的选项-这里只需要传key，剔除其他属性
                let a = keys.map(item => item.typeName + item.cql_filter);
                PublicDataActions.removeFeatures(a)
            }
        }
    }
    // 查找勾选和取消勾选对应的渲染key
    getCheckBoxForDatas = (val) => {
        if(val.length){
            let allChild = [],AllLoadFeatureKeys = [];
            // 取出所有的child
            this.AllCheckData.forEach(item => {
                let child = item.child;
                allChild = allChild.concat(child)
            })
            // 根据传过来的数据，进行整合，获取到数据中保存的wfs数据接口对应的key
            val.forEach(item => {
                let obj = allChild.find(chil => chil.key === item);
                if(obj && obj.loadFeatureKeys){
                    AllLoadFeatureKeys = AllLoadFeatureKeys.concat(obj.loadFeatureKeys);
                }
            })
            return AllLoadFeatureKeys;
        }

    }
    // 勾选了复选框
    toggleViewPulicData = (val ,from)=>{
        // let old = val.length ? this.checkedParam[from] : [];
        let old = this.checkedParam[from];
        // 根据切换的checkbox，进行增删操作
        this.changeData(old,val);
        // 更新保存的列表
        this.checkedParam[from] = val;
        
        // PublicDataActions.getPublicData()
    }
    render(){
        return (
        <div className={styles.publicBox + ` ${globalStyle.autoScrollY}`}>
            {
                this.AllCheckData.map((item ,index)=>{
                    return (
                        <DataItem data={item} key={item.key} onChange={this.toggleViewPulicData}/>
                    )
                })
            }
        </div>
        )
    }
}