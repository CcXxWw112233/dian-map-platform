import React ,{ useState, useRef }from 'react';
import styles from './index.less';
import { keepLastIndex } from '../../../../utils/utils';
import { MyIcon } from '../../../../components/utils';

export default function EditDescription (props){
  const [ isEdit, setIsEdit ] = useState(false);
  let data = props.data;
  let content = useRef();

  // 粘贴文本格式化
  const textFormat = (e) => {
    e.preventDefault();
    var text;
    var clp = (e.originalEvent || e).clipboardData;
    if (clp === undefined || clp === null) {
        text = window.clipboardData.getData('text') || ''
        if (text !== '') {
        if (window.getSelection) {
            var newNode = document.createElement('span')
            newNode.innerHTML = text
            window.getSelection().getRangeAt(0).insertNode(newNode)
        } else {
            document.selection.createRange().pasteHTML(text)
        }
        }
    } else {
        text = clp.getData('text/plain') || ''
        if(clp.files.length){
            let file = clp.files[0];
            let { type } = file;
            let url = URL.createObjectURL(file);
            let img = new Image();
            img.src = url;
            img.crossorigin = "anonymous";
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            img.onload = ()=>{
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img ,0 , 0,img.width,img.height);
                let baseUrl = canvas.toDataURL('image/jpeg',1);
                document.execCommand('insertimage',false, baseUrl)
                img = null ;
                canvas = null ;
                ctx = null;
            }
        }
        if (text !== '') {
            document.execCommand('insertText', false, text)
        }
    }
  }

  const toEdit = ()=>{
    if(props.disabled) return ;
    setIsEdit(true);
    setTimeout(()=>{
      keepLastIndex(content.current);
    },50)

  }

  const editEnd = ()=>{
    setIsEdit(false);
    props.onEdit && props.onEdit(content.current.textContent.trim(), data);
  }

  return (
    <div style={{position:'relative'}}>
      { !props.disabled ?
      (<span className={styles.editBtn}>
        { isEdit ? <MyIcon type="icon-bianzu7beifen"/> : <MyIcon type="icon-huabi" onClick={()=> toEdit()}/>}
      </span>)
      :"" }
      <div className={`${styles.data_remark} ${isEdit ? styles.activeEdit :""}`}
      suppressContentEditableWarning
      onPaste={textFormat}
      ref={content}
      placeholder="未添加备注哦"
      onBlur={() => setTimeout(()=> {editEnd()},100)}
      onDoubleClick={toEdit}
      contentEditable={isEdit}>
        {data?.description?.trim()}
      </div>
    </div>
  )
}
