import React from 'react'
import styles from './index.less'
import { Modal, Table,Button ,Select ,message ,Row,Col} from 'antd';
import FormatAddress from './component/formatAddress'
import XLSX from 'xlsx'
import config from "../../services/scouting";
import { MyIcon } from '../../components/utils'

const { ADD_COLLECTION } = config;
export default class ExcelRead extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            visible:false,
            importDataVisible:false,
            columns:[],
            data:[] ,
            tableDefaultKeys : [
                {value:"none",label:"不绑定"},
                {value:"name",label:"名称"},
                {value:"type",label:"类型"},
                {value:"address",label:"地址"},
                {value:"create_date",label:"创建时间"},
                {value:"start_date",label:"开始时间"},
                {value:"end_date",label:"结束时间"},
                {value:"province",label:"省份"},
                {value:"city",label:"城市"},
                {value:"stage",label:"阶段"},
                {value:"remark",label:"备注"}
            ],
            selectedRows:[],
            selectedKey:{},
            hasSelected:false,
            hasLocation:[],
        }
        this.requiredKey = ['name','address']
        this.workBook = null ;
    }

    createUid = () => {
        return Math.floor(Math.random() * 10000000 + 1); 
    }
    // 转换表格需要用的数据
    transformJson = (data)=>{
        if(data && data.length){
            data = data.map((item,index) => {item.id = index + 1 ; item.uid = this.createUid(); return item});
            let otherkey = this.state.tableDefaultKeys.map(item => item.value);
            let keys = Object.keys(data[0]);
            let k = [];
            let notShow = ['id','__EMPTY','uid',...otherkey];
            keys.forEach(item => {
                if(!notShow.includes(item)){
                    k.push(item)
                }
            })
            let arr = k.map((item,index) => {
                let obj = {
                    dataIndex:item,
                    title: this.tableHeader.bind(this,item),
                    key:index,
                    // width:80
                }
                return obj
            })

            this.setState({
                columns:arr,
                data: data,
                visible:true
            })
        }
        
    }
    readFile = (val)=>{
        let {target} = val;
        let file = target.files[0];
        if(file){
            let read = new FileReader();
            read.onload = (e)=>{
                let result = e.target.result;
                var data = new Uint8Array(result);
                this.workBook = XLSX.read(data,{type :"array"});
                // 转出来的数据
                let json = XLSX.utils.sheet_to_json(this.workBook.Sheets[this.workBook.SheetNames[0]])
                this.transformJson(json);
            }
            read.readAsArrayBuffer(file);
        }
        // console.log(target.files)
    }
    addFile = ()=>{
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls'
        input.onchange = this.readFile;
        input.click();
        input = null ;
    }

    // 设置选择后的数组
    selectText = (text,e)=>{
        let obj = {...this.state.selectedKey};
        let data = Array.from(this.state.data);
        if(e && e!=='none'){
            obj[text] = e;
        }else{
            obj[text] = "";
        }
        // 只保存自定义字段的数据
        data = data.map(d => {
            d[e] = d[text];
            let key = Object.values(obj);
            let dkey = this.state.tableDefaultKeys.map(item => item.value);
            dkey.forEach(item => {
                if(!key.includes(item)){
                    delete d[item]
                }
            })
            return d
        });
        this.setState({
            data,
            selectedKey:obj
        },()=>{
            this.toFilterDefaultKey();
        })
    }

    toFilterDefaultKey = ()=>{
        let arr = Array.from(this.state.tableDefaultKeys);
        let vals = Object.values(this.state.selectedKey);
        arr = arr.map(item => {
            if(vals.includes(item.value)){
                item.selected = true;
            }
            else{
                item.selected = false;
            }
            return item;
        })
        this.setState({
            tableDefaultKeys: arr
        })
    }

    // 确定之后,将数据带到另一个页面中
    setDataForDetail = ()=>{
        let vals = Object.values(this.state.selectedKey);
        let flag = true;
        this.requiredKey.forEach(item => {
            if(!vals.includes(item)){
                flag = false;
            }
        })
        if(!flag){
            message.warn('字段地址和名称为必选项');
            return;
        }
        this.setState({
            visible:false,
            importDataVisible:true,
        })
    }

    // 选择行的回调
    onSelectRow = (record, selected, selectedRows)=>{
        let arr = Array.from(this.state.selectedRows);

        if(selected){
            arr.push(record);
        }else{
            arr = arr.filter(item => item.uid !== record.uid);
        }
        this.setState({
            selectedRows:arr,
            hasSelected: !!selectedRows.length
        })
    }

    // 删除选择的数据
    removeSelectValue = ()=>{
        let arr = Array.from(this.state.selectedRows);
        let datas = Array.from(this.state.data);
        let ids = arr.map(item => item.uid);
        let data = datas.filter(item => !ids.includes(item.uid));

        // console.log(data);
        this.setState({ data ,selectedRows:[]});
    }


    tableHeader = (text, data)=>{
        let head = (
        <>
            <span>{text}</span>
            <br/>
            <Select
            size='small'
            placeholder="字段绑定"
            style={{width:100}}
            onChange={this.selectText.bind(this,text)}
            >   
                {
                    this.state.tableDefaultKeys.map(item => {
                        return (
                            <Select.Option
                            key={item.value}
                            value={item.value}
                            disabled={item.selected}>
                                {item.label}
                            </Select.Option>
                        )
                    })
                }
            </Select>
        </>
        )
        return head;
    }

    closeAll = ()=>{
        let tableDefaultKeys = Array.from(this.state.tableDefaultKeys);
        tableDefaultKeys = tableDefaultKeys.map(item => {
            item.selected = false;
            return item;
        })
        this.setState({
            tableDefaultKeys,
            selectedRows:[],
            selectedKey:{},
            visible:false,
            importDataVisible:false
        })
    }

    setDataPosition = ({current, position,address})=>{
        // console.log(current,position)
        let arr = Array.from(this.state.data);
        arr = arr.map(item => {
            if(item.uid === current.uid){
                item.location = position;
                item.isLocation = true;
            }
            return item;
        })
        let haslocation = arr.filter(item => item.isLocation);
        this.setState({
            data: arr,
            hasLocation: haslocation
        })
    }

    saveDatas = async ()=>{
        let { id ,board ,onExcelSuccess} = this.props;
        let { hasLocation ,data} = this.state;
        let arr = Array.from(data);
        let promise = hasLocation.map(item => {
            let obj = {
                area_type_id: id,
                board_id: board.board_id,
                collect_type: 6,
                description:"",
                is_display:"1",
                location:{
                    site_name:item.name,
                    longitude: item.location[0],
                    latitude: item.location[1]
                },
                target:"board_xlsx",
                title: item.name
            }
            return ADD_COLLECTION(obj);
        })

        let list = await Promise.all(promise);

        let hasUid = hasLocation.map(item => item.uid);
        arr = data.filter(item => !hasUid.includes(item.uid));
        message.success('导入完成');
        this.setState({
            hasLocation: [],
            data: arr
        },()=>{
            onExcelSuccess && onExcelSuccess(hasLocation);
        })

    }

    render(){
        let { visible ,columns , data ,importDataVisible ,hasSelected ,hasLocation} = this.state;
        let { group } = this.props;
        return (
            <div className={styles.excelContainer}>
                <Button onClick={this.addFile} 
                shape="circle"
                size="large"
                title="导入表格数据"
                type='primary'
                ghost>
                    <MyIcon type='icon-daorubiaoge'/>
                </Button>

                <Modal 
                width="80%"
                visible={visible}
                title="编辑数据"
                onCancel={()=>this.closeAll()}
                onOk={()=> this.setDataForDetail()}
                okText="确定"
                cancelText="取消"
                maskClosable={false}
                keyboard={false}
                destroyOnClose={true}
                >
                    <Row style={{margin:"10px 0"}}>
                        <Col>
                        <Button type="danger" disabled={!hasSelected} onClick={this.removeSelectValue}>删除</Button>
                        </Col>
                    </Row>
                    
                    <Table dataSource={data} columns={columns} bordered rowKey="id"
                    rowSelection={{
                        hideSelectAll:true,
                        onSelect:this.onSelectRow
                    }}>

                    </Table>
                </Modal>
                <Modal 
                wrapClassName="getAddressModal"
                width="80%"
                visible={importDataVisible}
                title="导入数据"
                maskClosable={false}
                keyboard={false}
                destroyOnClose={true}
                onCancel={this.closeAll}
                // cancelText='取消'
                // okText="导入到分组"
                // onOk={this.saveDatas}
                footer={
                    <div style={{textAlign:"right"}}>
                        <span style={{float:"left",marginLeft:"10px"}} >当前选定的分组：<a>{group.name}</a></span>
                        <Button type='default' onClick={() =>this.closeAll()}>取消</Button>
                        <Button type='primary' disabled={!hasLocation.length} onClick={this.saveDatas}>导入到分组</Button>
                    </div>
                }>
                    <FormatAddress dataSource={this.state.data} onEnterPosition={this.setDataPosition}/>
                </Modal>
            </div>
        )
    }
}