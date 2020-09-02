import React from 'react';
import styles from './index.less';
import { MyIcon } from '../../../../../components/utils';
import { fabric } from 'fabric';
import ColorPicker from 'react-color';
import { Popover, Popconfirm, Input, message, Spin } from 'antd';
import { DefaultUpload } from '../../../../../utils/XhrUploadFile';

export default class EditImage extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      active: "",
      activeColor: "#ff0000",
      doing:[],
      saveAsInput: "",
      loading: true
    };
    this.fabric = null ;
    this.fabricStyle = {
      color: '#ff0000',
      width: 3
    }
    this.textNode = null;
  }
  componentDidMount(){
    setTimeout(()=>{
      this.initCanvas();
    }, 500)

  }

  createUrl = async () => {
    let { data } = this.props;
    let img = new Image();
    img.crossOrigin = "anonymous";
    img.src = data.resource_url;
    await (()=>{
      return new Promise((resolve)=> {
        img.onload = ()=>{
          resolve(img.src);
        }
      })
    })();
    let container = document.querySelector('.'+styles.container);
    let canvas = document.querySelector('#edit_canvas');
    let ctx = canvas.getContext('2d');
    let w,h;
    if(img.height > img.width){
      // 竖着的
      let pixo = 1;
      if(img.height > container.clientHeight){
        pixo = container.clientHeight / img.height ;
      }
      // console.log();
      w = img.width * pixo;
      h = img.height * pixo;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0,0, w,h);
    }else {
      // 横着的
      let pixo = 1;
      if(img.width > container.clientWidth){
        pixo = container.clientWidth / img.width;
      }
      // console.log();
      w = img.width * pixo;
      h = img.height * pixo;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0,0, w,h);
    }
    let url = canvas.toDataURL();
    return {url, w, h};
  }

  initCanvas = async ()=>{
    let { url } = await this.createUrl();
    this.fabric = new fabric.Canvas('edit_canvas', {
      isDrawingMode: false
    })

    this.fabric.setBackgroundImage(url, this.fabric.renderAll.bind(this.fabric) ,{});
    this.fabric.on('object:added',(val)=>{
      let { doing } = this.state;
      doing.push(val);
      this.setState({
        doing: doing
      })
    })
    this.fabric.on('mouse:down', (evt)=>{
      if(this.state.active === 'text'){
        if(this.textNode){
          this.textNode = false;
          return ;
        }
        if(evt.target) return ;
        let pointer = evt.pointer;
        let text = new fabric.Textbox('',{
          left: pointer.x,
          top: pointer.y,
          width: 50,
          fill: this.fabricStyle.color,
          fontSize: 16,
          borderColor: this.fabricStyle.color
        });
        this.fabric.add(text).setActiveObject(text);
        text.enterEditing();
        text.hiddenTextarea.focus();
        this.textNode = text.isEditing;
      }
    })
    this.setState({
      loading: false
    })
  }

  reDo = ()=>{
    if(!this.state.doing.length) return ;
    let arr = Array.from(this.state.doing);
    let obj = arr.pop();
    if(obj){
      this.setState({
        doing: arr
      })
      this.fabric.remove(obj.target);
      this.fabric.renderAll();
    }
    this.textNode = false;
  }

  setActive = (key)=>{
    if(key === this.state.active){
      if(key === 'pen'){
        this.fabric.isDrawingMode = false;
      }
      key = "";
    }
    this.setState({
      active: key
    })
    if(key === 'pen'){
      this.textNode = false;
      this.fabric.isDrawingMode = true;
      this.fabric.freeDrawingBrush.color = this.fabricStyle.color;
      this.fabric.freeDrawingBrush.width = this.fabricStyle.width;
    }
    if(key === 'text'){
      this.fabric.isDrawingMode = false;
    }
  }

  setColor = (val)=>{
    // console.log(val)
    let { rgb } = val;
    let {r,g,b,a} = rgb;
    let color = `rgba(${r},${g},${b},${a})`;
    this.setState({
      activeColor: color
    })
    this.fabricStyle.color = color;
    this.fabric.freeDrawingBrush.color = color;
  }

  removeFeature = () => {
    let arr = Array.from(this.state.doing);
    this.fabric.getActiveObjects().forEach(item => {
      this.fabric.remove(item);
      arr = arr.filter(a => a.target !== item);
    })
    this.setState({
      doing: arr
    })
    this.fabric.renderAll();
  }

  // 把文件转换出来
  getFile = (file_name)=>{
    let base64 = this.fabric.toDataURL({format:"png"});
    const base64ToBlob = function(base64Data) {
      let arr = base64Data.split(','),
          fileType = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]),
          l = bstr.length,
          u8Arr = new Uint8Array(l);

      while (l--) {
          u8Arr[l] = bstr.charCodeAt(l);
      }
      return new Blob([u8Arr], {
          type: fileType
      });
    };
    // blob转file
    const blobToFile = function(newBlob) {
      let file = new File([newBlob],file_name,{type: newBlob.type,lastModified: Date.now()});
      return file;
    };
    // 调用
    const blob = base64ToBlob(base64);
    const file = blobToFile(blob);
    return file;
  }

  disabledDraw = ()=>{
    this.fabric.isDrawingMode = false;
    this.fabric.selectable = false;
    // 是否显示选中
    this.fabric.selection = false;
    // 元素是否不可以选中
    this.fabric.skipTargetFind = true
  }

  save = async () => {
    const { data, onSave} = this.props;
    // console.log(data);
    this.disabledDraw();
    let file = this.getFile(data.title + data.resource_suffix);
    let res = await DefaultUpload(file, {}).catch(err => console.log(err));
    if(res){
      let respose = res.data;
      const { preview_url, file_resource_id ,suffix} = respose;
      onSave && onSave(data, preview_url, file_resource_id, suffix);
    }
  }

  saveAs = async ()=>{
    const { data, onSaveAs} = this.props;
    if(!this.state.saveAsInput){
      return message.warn('文件名不能为空');
    }
    this.disabledDraw();
    let file = this.getFile(this.state.saveAsInput + data.resource_suffix);
    let res = await DefaultUpload(file, {}).catch(err => console.log(err));
    if(res) {
      // console.log(res);
      let respose = res.data;
      const { file_resource_id ,suffix } = respose;
      onSaveAs && onSaveAs(data, file_resource_id, suffix, this.state.saveAsInput);
    }
  }

  render(){
    const { onExit, data } = this.props;
    const { active, loading} = this.state;
    return (
      <Spin spinning={loading} wrapperClassName={styles.loading}>
      <div className={styles.editBox}>
        <span className={styles.closeModal} onClick={()=> {onExit && onExit()}}>
          <MyIcon type="icon-guanbi2"/>
        </span>
        <div className={styles.container}>
          <canvas id="edit_canvas">
            您的浏览器不支持canvas，请更换浏览器
          </canvas>
          <div className={styles.tools}>
            <span className={active === 'pen' ? styles.active :""} onClick={() => this.setActive('pen')}>
              <MyIcon type="icon-huabi"/>
            </span>
            <span className={active === 'text' ? styles.active :""} onClick={() => this.setActive('text')}>
              <MyIcon type="icon-wenzi1"/>
            </span>
            <span onClick={this.removeFeature}>
              <MyIcon type="icon-xiangpica"/>
            </span>
            <Popover
            trigger="click"
            content={<ColorPicker color={this.state.activeColor} type="sketch" onChange={this.setColor}/>}>
              <span className={styles.colorPicker}>
                <span className={styles.activeColor}
                style={{backgroundColor: this.state.activeColor}}>

                </span>
              </span>
            </Popover>
            <span onClick={this.reDo}>
              <MyIcon type="icon-chexiao"/>
            </span>
            <Popconfirm
            title="保存功能将会替换原来的图片，确定吗？"
            onConfirm={this.save}
            okText="确定"
            cancelText="取消">
              <span className={styles.save}>
                保存
              </span>
            </Popconfirm>
            <Popconfirm
            icon={<MyIcon type="icon-wenjian" style={{fontSize:'1.2em'}}/>}
            title={<div>
              <div>请填写文件名称:</div>
              <Input defaultValue={this.props.data.title}
                onChange={(val) => this.setState({saveAsInput: val.target.value})}
                size="small"
                placeholder="另存为..."
                value={this.state.saveAsInput}
              />
            </div>}
            onConfirm={this.saveAs}
            okText="保存"
            cancelText="取消">
              <span className={styles.saveAs} onClick={()=> this.setState({saveAsInput: data.title })}>
                另存为
              </span>
            </Popconfirm>

          </div>
        </div>
      </div>
      </Spin>
    )
  }
}
