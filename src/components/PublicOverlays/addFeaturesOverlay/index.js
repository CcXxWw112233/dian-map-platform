import styles from './index.less'
import globalStyle from '../../../globalSet/styles/globalStyles.less'
import baseOverlay from '../baseOverlay'

export default function Init(data, type = 'project'){
    this.data = data;
    this.element = ""; // 作用与overlay中的元素
    this.on = {}; // 自定义事件
    this.active = {}; // 当前选中的数据
    this.menuShow = false; // 检查是否显示了菜单
    let div = document.createElement('div');
    div.className = styles.container;
    let titleText = type === 'project' ? '保存到项目' : '保存到分类';
    let header = document.createElement('div');
    header.innerHTML = titleText;
    header.className = styles.header;
    let close = document.createElement('span');
    close.className = `${globalStyle.global_icon} ${styles.close}`;
    close.innerHTML = "&#xe606;";
    header.appendChild(close);
    div.appendChild(header);
    // 添加了头部
    let content = document.createElement('content');
    content.className = styles.content;
    // 添加名称输入框
    let nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = '输入名称';
    nameInput.className = styles.nameInput;
    content.appendChild(nameInput);
    // 选中后触发的转换，会更新onChange事件
    let setActiveTextFromKey = (key)=>{
        let obj = this.data.dataSource.find(item => item.key === key);
        this.on.onChange && this.on.onChange.call(this, obj);
        return obj || {};
    }
    // 触发onAdd事件，携带着传入的type
    let optionSelect = (val)=>{
        if(val === '_add'){
            this.on.onAdd && this.on.onAdd.call(this, type);
        }else{
            let obj = setActiveTextFromKey(val);
            selectInput.value = obj.text;
            this.active = obj;
        }
    }

    let selectDiv = document.createElement('div');
    selectDiv.className = styles.selectDiv;
    let sp = document.createElement('span');
    sp.className = styles.menuMore + ' ' + globalStyle.global_icon;
    sp.innerHTML = '&#xe68a;';
    selectDiv.appendChild(sp);
    let selectInput = document.createElement('input');
    selectDiv.appendChild(selectInput);
    selectInput.className = styles.selectInput;
    let placeholder = type === 'project' ? '请选择项目' : '请选择分类';
    selectInput.placeholder = placeholder;
    let menus = document.createElement('div');
    let removeMenu = ()=>{
        this.menuShow = false;
        menus.innerHTML = '';
        menus.style.display = 'none';
    }
    let toggleShow = ()=>{
        this.menuShow = !this.menuShow;
        if(this.menuShow){
            this.updateMenus();
        }else {
            removeMenu();
        }
    }
    selectDiv.onclick = ()=>{
        toggleShow();
    }
    // 失去焦点，菜单隐藏
    selectInput.onblur = ()=>{
        setTimeout(()=>{
           removeMenu();
        },300)
    }
    menus.className = styles.menus;
    // 更新菜单
    this.updateMenus = ()=>{
        if(!this.data.dataSource && !this.data.dataSource.length)return ;
        let u = document.createElement('p');
        u.className = styles.selectionsOption;
        u.innerHTML = placeholder;
        u.onclick = ()=>{
            this.active = {};
            selectInput.value = null;
        }
        menus.appendChild(u);
        this.data.dataSource.forEach(item => {
            let p = document.createElement('p');
            p.className = styles.selectionsOption + ' ' + (this.active.key === item.key ? styles.selectActive :"");
            p.innerHTML = item.text;
            p.onclick = ()=>{
                optionSelect(item.key);
            }
            menus.appendChild(p);
        })
        menus.style.display = 'block';
        // 新增按钮
        let addSelect = document.createElement('p');
        addSelect.className = styles.selectionsOption +' '+ styles.addSelect + " " + globalStyle.global_icon;
        addSelect.innerHTML = `<span class='${styles.addSelectIcon}'>&#xe636;</span> ${type === 'project' ? '新增项目': '新增分类'}`;
        menus.appendChild(addSelect);
        selectDiv.appendChild(menus);
        addSelect.onclick = ()=>{
            optionSelect('_add')
        }
        this.menuShow = true;
    }
    // 设定默认值的选项
    if(this.data.dataSource && this.data.dataSource.length){
        if(this.data.activeKey){
            let obj = setActiveTextFromKey(this.data.activeKey);
            selectInput.value = obj && obj.text;
            this.active = obj;
        }
    }



    // 添加底部
    let footer = document.createElement('footer');
    footer.className = styles.footer;
    let cancelBtn = document.createElement('button');
    cancelBtn.innerHTML = '取消';
    cancelBtn.className = styles.cancelBtn + ' ' + styles.btn;
    let okBtn = document.createElement('button');
    okBtn.innerHTML = '确定';
    okBtn.className = styles.okBtn + ' ' + styles.btn;
    footer.appendChild(cancelBtn);
    footer.appendChild(okBtn);


    // 添加复选框
    content.appendChild(selectDiv)
    // 添加content
    div.appendChild(content);
    div.appendChild(footer);

    this.element = new baseOverlay(div,{...data, angleColor: "#fff", className: styles.addFeaturesOverlay});
    // 添加事件
    close.onclick = ()=>{
        this.on.onClose && this.on.onClose.call(this,'close');
    }
    cancelBtn.onclick = ()=>{
        this.on.onClose && this.on.onClose.call(this,'cancel');
    }
    this.change = (type,val)=>{
      if(type === 'name'){
        nameInput.value = val;
      }
    }
    okBtn.onclick = ()=>{
        let obj = {
            name: nameInput.value,
            selection: this.active
        }
        this.on.onConfirm && this.on.onConfirm.call(this, obj);
    }

    document.body.appendChild(this.element);
    this.hide = ()=>{
        if(this.element)
        this.element.display = 'none';
    }
    this.show = ()=>{
        if(this.element)
        this.element.display = 'block';
    }

    this.close = ()=>{
        this.element && this.element.parentNode.removeChild(this.element);
        this.element = "";
    }
}
