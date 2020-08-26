import React, { useState, useEffect } from 'react';
import styles from './RenameModal.less';
import { Popover, Input, Button, message } from 'antd';
import ReactDOM from 'react-dom';

let __isMounted = false;
export default function RenameModal (props){
  let {
    title = '确认名称修改' ,
    visible,
    appendTo ,
    dataSource = {},
    onChangeName = ()=>{},
    onOk = ()=>{},
    onCancel = () => {}
  } = props;
  let isOk = false;
  let [ name, setName ] = useState(dataSource.name);
  let node = appendTo;
  if(!(appendTo instanceof React.Component)){
    node = document.body;
  }else
  node = ReactDOM.findDOMNode(node);
  // 更新上传的文件名称
  useEffect(()=>{
    if(visible){
      if(!__isMounted)
      setName(dataSource.name);

      __isMounted = true;
    }else{
      __isMounted = false;
    }
  })

  const enterName = ()=>{
    if(name){
      onOk(name);
    }else
    message.warn('文件名称不能为空');
  }
  const visibleChange = (val) => {
    if(!isOk && !val){
      onCancel();
    }
    isOk = false;
  }
  return (
    <Popover
    visible={visible}
    title={<span className={styles.poptitle}>{title}</span>}
    trigger="click"
    placement="bottom"
    getPopupContainer={()=> node }
    overlayStyle={{width:'100%'}}
    onVisibleChange={visibleChange}
    destroyTooltipOnHide={true}
    content={
      <div className={styles.renameContainer}>
        <div className={styles.edit_msg}>
          <div className={styles.edit_img}>
            <img src={dataSource.src} alt=""/>
          </div>
          <div className={styles.edit_name}>
            <Input size='small' value={name}
            className={styles.inputName}
            autoFocus
            allowClear
            style={{width:'60%'}}
            placeholder="请输入您定义的图标名称"
            defaultValue={name}
            onChange={(e)=> {setName(e.target.value.trim()); onChangeName(e.target.value)}}/>
          </div>
        </div>
        <div className={styles.footerBtn}>
          <Button type='default' onClick={()=> onCancel()} size='small'>取消</Button>
          <Button type='primary' onClick={()=> { isOk = true; enterName()}} size='small'>确定</Button>
        </div>
      </div>
    }
    >
      <div></div>
    </Popover>
  )
}
