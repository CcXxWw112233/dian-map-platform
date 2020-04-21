import React from 'react'
import styles from './DataItem.less'
import { Collapse ,Checkbox,Row, Col } from 'antd';
import { MyIcon } from '../../components/utils'

const { Panel } = Collapse;


export default class DataItem extends React.Component{
    constructor(){
        super(...arguments)
        this.state = {
            indeterminate:false,
            checkAll:false,
            checkedList:[],
        }
    }
    // 创建折叠窗的header
    createIconHeader = (item)=>{
        let { icon, name } = item;
        return (
            <span>
                <span style={{float:"left"}}>
                    <MyIcon type={icon} style={{fontSize:'1rem'}}/>
                </span>
                {name}
            </span>
        )
    }
    // 获取当前列表中所有的key
    getAllKeys = ()=>{
        let { data } = this.props;
        let list = [];
        data.child.forEach(item => {
            list.push(item.key);
        })
        return list;
    }
    // 全选
    checkAllBox = (e)=>{
        let { onChange } = this.props;
        let checked = e.target.checked;
        let allKey = [];
        if(checked){
            allKey = this.getAllKeys()
        }else{
            allKey = [];
        }
        this.setState({
            checkAll: checked,
            checkedList: allKey,
            indeterminate: false
        })
        onChange && onChange(allKey);
    }
    // 单个复选框选择状态
    boxChange = (checkedList)=>{
        let { data = {} ,onChange } = this.props;
        this.setState({
            checkedList,
            checkAll: checkedList.length === data.child.length,
            indeterminate:!!checkedList.length && checkedList.length < data.child.length
        })
        onChange && onChange(checkedList);
    }
    // 单选框
    getCheckBox = ()=>{
        let { indeterminate, checkAll } = this.state;
        return <Checkbox onChange={this.checkAllBox} 
        indeterminate={indeterminate} checked={checkAll} onClick={event => {event.stopPropagation();}}/>
    }
    render(){
        let { data } = this.props;
        let { checkedList } = this.state;
        return (
            <div className={styles.publicMenuItem}>
                <Collapse expandIconPosition='right'>
                    <Panel header={this.createIconHeader(data)} key={data.key} extra={this.getCheckBox()}>
                        <Checkbox.Group style={{ width: '100%' }} onChange={this.boxChange} value={checkedList}>
                            <Row>
                                {data.child.length ? 
                                    data.child.map(item => {
                                        return (
                                            <Col span={8} key={item.key} style={{marginBottom:"1rem"}}>
                                                <Checkbox value={item.key} checked={checkedList.indexOf(item.key) >= 0}>{item.name}</Checkbox>
                                            </Col>
                                        )
                                    }):""
                                }
                            </Row>
                        </Checkbox.Group>
                    </Panel>
                </Collapse>
            </div>
        )
    }
}