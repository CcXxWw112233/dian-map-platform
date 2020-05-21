import styles from './index.less'
import baseOverlay from '../baseOverlay'
import iconCss from '../../../globalSet/styles/globalStyles.less'

export default function overlay (data = {}){
    let div = document.createElement('div');
    this.data = data;
    div.className = styles.overlay;
    this.imgDiv = "";
    this.videoDiv = "";
    this.more = "";
    let type = data.pointType;
    this.show = false;

    div.onclick = (e)=>{
        e.stopPropagation();
        this.on['click'] && this.on['click'].call(this,data);
        if(this.show){
            this.more && (this.more.innerHTML = "&#xe7ed;")
            remove(type)
        }else{
            remove(type);
            append(type);
            this.more && (this.more.innerHTML = "&#xe7ee;")
        }
    }
    let title = document.createElement('span');
    title.innerHTML = data.title;
    div.appendChild(title);

    // 添加箭头
    if(type === 'pic'){
        this.more = document.createElement('span');
        this.more.className = `${styles.pictureDivMore} ${iconCss.global_icon}`;
        this.more.innerHTML = "&#xe7ed;"
        div.appendChild(this.more);
    }

    // 添加媒体信息
    let append = (t)=>{
        this.show = true;
        if(t === 'pic'){
            this.imgDiv = document.createElement('div');
            this.imgDiv.className = styles.pictureDiv;
            let img = new Image();
            img.src = data.resource_url;
            this.imgDiv.appendChild(img);
            // 添加图片div
            div.insertBefore(this.imgDiv, title);    
            img.onclick = (e)=>{
                e.stopPropagation();
            }
        }
    }
    // 删除媒体信息
    let remove = (t) => {
        this.show = false;
        if(t === 'pic' && this.imgDiv){
            div.removeChild(this.imgDiv);
            this.imgDiv = "";
        }
        
    }

    

    

    this.element = new baseOverlay(div,{});
    
    document.body.appendChild(this.element);
    this.remove = ()=>{
        document.body.removeChild(this.element);
    }
    this.on = {};
}