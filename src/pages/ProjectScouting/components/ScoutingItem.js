import React,{ Fragment} from 'react'
import { Menu, Dropdown ,Popconfirm ,Input ,Button ,Space} from 'antd';
import { SettingOutlined ,CheckCircleOutlined ,CloseCircleOutlined} from '@ant-design/icons'
import styles from '../ScoutingList.less'

export default class ScoutingItem extends React.PureComponent {
    constructor(props){
        super(props);
        this.state = {
            visible:false,
            editName: false,
            name:""
        }
        this.colors = [
            "brickRed",
            "darkGreen",
            "lightBlue",
            "lightGreen",
        ];
        this.colorStyle = styles[this.colors[Math.floor(Math.random() * 4)]];
    }

    ToEdit = ()=>{
        let name = this.props.name;
        this.setState({
            editName: true,
            visible:false,
            name:name
        })
    }
    EditEnd = ()=>{
        this.setState({
            editName: false,
        })
    }

    onHandleMenu = ({key})=>{
        if(key === 'editBoard'){
            this.ToEdit()
        }
    }
    SureName = (oldname)=>{
        let { onRename } = this.props;
        let { name } = this.state;
        if(!name){
            this.setState({
                name:oldname
            })
        }
        else onRename && onRename(name);
        this.EditEnd();
    }

    componentWillUnmount(){
        this.EditEnd();
    }
    render(){
        let { visible ,editName } = this.state;
        let { onRemove , cb , name, date } = this.props;
        const menu = (
            <Menu onClick={this.onHandleMenu}>
              <Menu.Item key="editBoard">
                修改项目名称
              </Menu.Item>
              <Menu.Item key="removeBoard">
                <Popconfirm title='确定删除这个项目吗?'
                okText='删除'
                cancelText="取消"
                overlayStyle={{zIndex:10000}}
                onConfirm={()=> {this.setState({visible: false});onRemove && onRemove();}}
                placement="topRight">
                  <div style={{width:"100%"}}>删除项目</div>
                </Popconfirm>
              </Menu.Item>
            </Menu>
        );
        return (
            <div
                className={`${styles.btn} ${styles.scoutingItem} ${this.colorStyle}`}
                onClick={cb}
            >
                <div className={styles.settings} onClick={e => e.stopPropagation()}>
                    <Dropdown overlay={menu} 
                    trigger="click"
                    onVisibleChange={(val)=> this.setState({visible:val})}
                    visible={visible}>
                        <SettingOutlined onClick={e => { e.preventDefault();this.setState({visible: !visible})}}/>
                    </Dropdown>
                </div>
                <div className={styles.name} onClick={e => e.stopPropagation()}>
                    { editName ? 
                        <Fragment>
                            <Input defaultValue={name} placeholder='请输入项目名称' 
                            onBlur={this.SureName.bind(this,name)} 
                            onPressEnter={this.SureName.bind(this,name)}
                            onChange={(val) => this.setState({name: val.target.value})} 
                            style={{width:"70%",borderRadius:'4px'}} 
                            onClick={e => e.stopPropagation()}
                            allowClear={true}
                            />
                            <div style={{width:"70%",borderRadius:'4px',margin:"0 auto",textAlign:"right"}} >
                                <Space size='middle'>
                                    <Button size='small' onClick={this.EditEnd} ghost>取消</Button>
                                    <Button type='primary' size='small' onClick={()=>{this.SureName(name)}}>确认</Button>
                                </Space>
                            </div>
                        </Fragment>
                        :
                        <span>{name}</span>
                    }
                    
                </div>
                <p className={styles.date}>
                    <span>{date}</span>
                </p>
            </div>
        )
    }
}