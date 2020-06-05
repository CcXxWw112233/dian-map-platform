import styles from './index.less'
import baseOverlay from '../baseOverlay'

export default function initOverlay(data = {}){
    
    let div = document.createElement('div');
    div.className = styles.addProjectOverlay;
    div.style.zIndex = data.zIndex || 10;
    
    let cancelBtn = document.createElement('button');
    cancelBtn.className = styles.cancelBtn;
    let okBtn = document.createElement('button');
    okBtn.className = styles.okBtn;
    okBtn.innerHTML = data.okText || "确定";
    cancelBtn.innerHTML = data.cancelText || '取消';
    let footer = document.createElement('div');
    footer.className = styles.footer;
    footer.appendChild(cancelBtn);
    footer.appendChild(okBtn);
    

    let header = document.createElement('div');
    header.className = styles.header ;
    header.innerHTML = data.title || 'title'

    let content = document.createElement('div');
    content.className = styles.content;
    content.innerHTML = `
        <input placeholder="请输入名称(必填)" class="${styles.inputName}" id="addProjectInput"/>
        <textarea placeholder="备注信息(非必填)" class="${styles.remark}" id="addProjectRemark"></textarea>
    `

    okBtn.onclick = ()=>{
        let inputval = div.querySelector('#addProjectInput').value;
        let remark = div.querySelector('#addProjectRemark').value;
        if(!inputval) return ;
        this.on['sure'] && this.on['sure'].call(this, {name: inputval,remark})
    }
    cancelBtn.onclick = ()=>{
        this.on['cancel'] && this.on['cancel'].call(this);
    }
    


    div.appendChild(header);
    div.appendChild(content);
    div.appendChild(footer);
    this.element = new baseOverlay(div,data);
    this.on = {

    }
    document.body.appendChild(this.element);
    
}