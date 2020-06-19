import styles from './index.less'
import baseOverlay from '../baseOverlay'
import iconCss from '../../../globalSet/styles/globalStyles.less'

export default function overlay (data = {}){
    let div = document.createElement('div');
    this.data = data;
    div.className = styles.overlay + ' defineCollectionOverlay';
    this.imgDiv = "";
    this.videoDiv = "";
    this.more = "";
    let type = data.pointType;
    this.show = false;
    this.audio = null;
    this.video = null;
    this.uid = Math.floor(Math.random() * 1000 +1);

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

    

    // 添加媒体信息
    let append = (t)=>{
        this.show = true;
        if(t === 'pic'){
            this.imgDiv = document.createElement('div');
            this.imgDiv.className = styles.pictureDiv;
            let img = new Image();
            img.crossorigin = "anonymous";
            img.src = data.resource_url;
            img.dataset.name = data.title;
            this.imgDiv.appendChild(img);
            // 添加图片div
            div.insertBefore(this.imgDiv, title);    
            img.onclick = (e)=>{
                e.stopPropagation();
                this.on['imgClick'] && this.on['imgClick'].call(this,{target:e.target,name: data.title});
            }
        }

        if(t === 'video'){
            this.video = document.createElement('video');
            this.video.className = styles.video;
            this.video.dataset.uid = this.uid;
            this.video.controls = 'controls';
            this.videoDiv = document.createElement('div');
            this.videoDiv.onclick = (e)=>{
                e.stopPropagation();
            }
            this.videoDiv.className = styles.videoDiv;
            let play = document.createElement('div');
            play.className = styles.videoPlayBtn;
            this.video.src = data.resource_url;
            this.videoDiv.appendChild(this.video)
            play.appendChild(playBtn(this.video,'video'));
            div.insertBefore(this.videoDiv, title);
            this.video.onplay = ()=>{
                // 停止所有音频，视频
                stopPlayAll();
            }
        }
    }

    let stopPlayAll = ()=>{
        let audios = document.querySelectorAll('audio');
        audios.forEach(item => {
            item.pause();
        })
        let videos = document.querySelectorAll('video');
        videos.forEach(item => {
            if(item.dataset.uid != this.uid)
            item.pause();
        })
    }
    // 视频和音频的播放按钮
    let playBtn = (element,type = 'audio')=>{
        let icons = {
            'audio':{
                play:"&#xe609;",
                pause:'&#xe60a;'
            },
            'video':{
                play:"&#xe608;",
                pause:"&#xe60b;"
            }
        }
        let btn = document.createElement('span');
        btn.className = iconCss.global_icon +' '+ styles.playButton;
        btn.innerHTML = icons[type].play;
        btn.addEventListener('click',function(){
            if(element.paused){
                stopPlayAll();
                element.play();
            }else{
                element.pause();
            }
        })
        element.addEventListener('play',()=>{
            btn.innerHTML = icons[type].pause;
        }) 
        
        element.addEventListener('pause',()=>{
            btn.innerHTML = icons[type].play;
        })
        return btn;
    }

    // 创建一个音频播放器
    let createAudioElement = ()=>{
        this.audioView = document.createElement('div');
        // 创建一个音频播放器
        this.audio = document.createElement('audio');
        // 隐藏音频播放器，用js控制
        this.audio.src = data.resource_url;
        this.audio.crossorigin = 'anonymous';
        this.audio.style.display = 'none';
        this.audio.preload = 'metadata';
        this.audio.className = 'collectionAudio'
        // this.audio.

        this.audioView.className = styles.audioView;
        let play = document.createElement('span');
        play.className = styles.collectionPlayBtn;
        play.appendChild(playBtn(this.audio))
        
        this.audioView.appendChild(play);
        let t = document.createElement('span');
        t.className = styles.audioName;
        t.innerHTML = data.title;
        this.audioView.appendChild(t);
        div.innerHTML = "";
        div.style.padding = "0";
        div.appendChild(this.audioView);
        div.appendChild(this.audio);
        
        this.audio.onloadedmetadata = (e)=>{
            let duration = e.target.duration;
            let dom = document.createElement('span');
            dom.className = styles.audioTimes;
            if(!isNaN(duration)){
               let time = duration/60;
                let minut = parseInt(time);// 分钟
                let seconds = Math.round((time - minut) * 60);
                let text = `${minut}'${seconds}"`
                dom.innerHTML = text;
            }else{
                dom.innerHTML = "0'00\"";
            }
            this.audioView.appendChild(dom);
        }
        
    }   

    

    // 删除媒体信息
    let remove = (t) => {
        this.show = false;
        if(t === 'pic' && this.imgDiv){
            div.removeChild(this.imgDiv);
            this.imgDiv = null;
        }
        if(t === 'video' && this.videoDiv){
            div.removeChild(this.videoDiv);
            this.videoDiv = null;
        }
        
    }

    

    

    this.element = new baseOverlay(div,data);
    // 添加箭头
    if(type === 'pic' || type === 'video'){
        this.more = document.createElement('span');
        this.more.className = `${styles.pictureDivMore} ${iconCss.global_icon}`;
        this.more.innerHTML = "&#xe7ed;"
        div.appendChild(this.more);
    }
    if(type === 'interview'){
        // 创建音频播放
        createAudioElement();
    }
    if(type === 'word'){
        let preview = document.createElement('span');
        preview.className = `${styles.previewBtn} ${iconCss.global_icon}`;
        preview.innerHTML = '&#xe638;';
        preview.title = data.target === 'pdf' ? '预览':"下载";
        div.appendChild(preview);
    }
    this.element.querySelector('.'+styles.previewBtn) && (this.element.querySelector('.'+styles.previewBtn).onclick = ()=>{
        this.on['preview'] && this.on['preview'](data);
    })
    document.body.appendChild(this.element);
    this.remove = ()=>{
        document.body.removeChild(this.element);
    }
    this.on = {};
}