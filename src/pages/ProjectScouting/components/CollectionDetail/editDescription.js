import React ,{ useState, useRef, useMemo}from 'react';
import styles from './index.less';
import { keepLastIndex } from '../../../../utils/utils';
import { MyIcon } from '../../../../components/utils';
import ReactMarkdown from 'react-markdown';

export default function EditDescription (props){
  const [ isEdit, setIsEdit ] = useState(false);
  let data = props.data;
  let [ text, setText ] = useState(data?.description || "");
  let content = useRef();
  useMemo(() => {
    setText(props.data?.description)
  }, [props.data])
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
    if(text !== undefined){
      props.onEdit && props.onEdit(text, data);
    }

  }

  return (
    <div style={{position:'relative'}}>
      { !props.disabled ?
      (<span className={styles.editBtn}>
        { isEdit ? <MyIcon type="icon-bianzu7beifen"/> : <MyIcon type="icon-huabi" onClick={()=> toEdit()}/>}
      </span>)
      :"" }
        {
          !isEdit ? (
            <ReactMarkdown source={text || '未添加备注哦'}
            className={`${styles.data_remark} ${ props.isMaxHeight ? styles.maxHeight :""}`}
            />
          ):
          (
            <textarea className={`${styles.data_remark}
            ${ props.isMaxHeight ? styles.maxHeight :""}
            ${isEdit ? styles.activeEdit :""}`}
            suppressContentEditableWarning
            // onPaste={textFormat}
            ref={content}
            // defaultValue={text}
            value={text}
            placeholder="未添加备注哦"
            onBlur={() => setTimeout(()=> {editEnd()},100)}
            onDoubleClick={toEdit}
            readOnly={!isEdit}
            onInput={(e)=>{setText(e.target.value.trim())}}
            contentEditable={isEdit}>
              {data?.description?.trim()}
            </textarea>
          )
        }


    </div>
  )
}
