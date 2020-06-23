import React,{Fragment } from 'react'
import ReactDOM from 'react-dom'
import styles from './index.less'
import { connect } from 'dva'
import { Progress,Card, Badge } from 'antd'
import { MyIcon } from '../utils'


@connect(({uploadNormal:{
    uploading_file_list,
    swich_render_upload,
    show_upload_notification
}})=>({
    uploading_file_list,
    swich_render_upload,
    show_upload_notification
}))
export default class UploadNotification extends React.Component {
    constructor(){
        super(...arguments);
        this.state = {
            fileList:[]
        }
        this.interval = null;
    }
    componentWillReceiveProps(nextProps){

    }
    toggleMini = ()=>{
        let { dispatch ,swich_render_upload} = this.props;
        dispatch({
            type:"uploadNormal/updateDatas",
            // type:"uploadNormal/updateFileList",
            payload:{
                // data:[],
                swich_render_upload: !swich_render_upload
            }
        })
    }

    stopUpload = (val)=>{
        console.log(val)
    }

    renderUploadItem = ()=>{
        let { uploading_file_list } = this.props;
        let arr = uploading_file_list.map((item,index) => {
            const { name, percent, status } = item
            let progress_status = 'active'
            let progress_percent = parseInt(Number(percent))
            if (status == 'error') {
                progress_status = 'exception '
                progress_percent = 100
            } else if (status == 'done') {
                progress_percent = 100
                progress_status = 'success'
            }else if(status === 'uploading' && progress_percent === 100){
                progress_percent = 99;
            }
            return (
                <div className={styles.uploadItem} key={index}>
                    <div className={styles.uploadItem_card}>
                        <span className={styles.meta_type}>
                            {/* pic */}
                        </span>
                        <span className={styles.uploadItem_name} title={name}>
                            {name}
                        </span>
                        {/* {
                            item.status === 'uploading'&&
                            <span className={styles.stopUpload} onClick={this.stopUpload.bind(this,item)}>
                                <MyIcon type="icon-shanchu"/>
                            </span>
                        } */}
                    </div>
                    <Progress 
                    percent={progress_percent}
                    status={progress_status}/>
                </div>
            )
        })
        return arr;
    }
    // 获取进度
    getNotSuccessFile = ()=>{
        let {uploading_file_list} = this.props;
        let obj = uploading_file_list.find(item => item.status === 'uploading');
        if(obj){
            if(obj.status === 'uploading' && obj.percent === 100){
                return 99;
            }
            return obj.percent;
        }
        else return 100;
    }
    // 获取上传的总进度
    getUploadingStatus = ()=>{
        let {uploading_file_list} = this.props;
        let arr = uploading_file_list.filter(item => item.status !== 'done');
        if(arr.length){
            return <span>上传中({arr.length}/{uploading_file_list.length})</span>
        }else {
            return <span>上传完成</span>
        }
    }
    render(){
        const {
            uploading_file_list,
            swich_render_upload,
            show_upload_notification 
        } = this.props;
        return (
            ReactDOM.createPortal(
                <Fragment>
                {
                    <div className={styles.container}>
                        {
                            show_upload_notification && !swich_render_upload ?
                            <div className={styles.upload_Box}>
                                <div className={styles.uploadItem_title}>
                                    <MyIcon type="icon-Group"/>
                                    <span className={styles.uploadType}>{this.getUploadingStatus()}</span>
                                    <span className={styles.bigContainer} onClick={this.toggleMini}>
                                        <MyIcon type="icon-fullscreen-exit"/>
                                    </span>
                                </div>
                                {
                                    this.renderUploadItem()
                                }
                            </div>
                            :
                            show_upload_notification && swich_render_upload ? 
                            <div className={styles.miniUpload} onClick={this.toggleMini}>
                                <Badge count={uploading_file_list.length || 0}>
                                    <Progress type="circle" percent={this.getNotSuccessFile()} width={45} />
                                </Badge>
                            </div>
                            :""
                        }
                        
                    </div> 
                }
                </Fragment>
                ,
                document.body
            )
            
        )
    }
}