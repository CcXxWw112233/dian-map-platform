import React ,{useState}from 'react'
import matrix from '../../utils/matrix'
import styles from './index.less'
import globalStyle from '../../globalSet/styles/globalStyles.less'
import { Popover ,Slider,message } from 'antd'
import Event from '../../lib/utils/event'

const { Evt } = Event;

export default function(props){
    const { url , width, height ,position} = props;
    let ctx = null ,canvas = null;
    let count = 4;
    var dots = [];
    var dotscopy, idots;
    let hasPic = true;
    let img = null;
    let imgRatio = 1;
    let opacity = 1;

    // var left = (canvas.width - img_w) / 2;
    var left = position.x;
    // var top = (canvas.height - img_h) / 2;
    var top = position.y;
    let maxHeight = 460,maxWidth = 460;
    var img_w = 0,
      img_h = 0;

    var rotate = 0.5 * Math.PI / 180;
    let historyDots = [];
    let translateX = 0;
    let translateY = 0;

    // var getPixelRatio = function(context) {
    //     var backingStore = context.backingStorePixelRatio ||
    //         context.webkitBackingStorePixelRatio ||
    //         context.mozBackingStorePixelRatio ||
    //         context.msBackingStorePixelRatio ||
    //         context.oBackingStorePixelRatio ||
    //         context.backingStorePixelRatio || 1;
    
    //     return (window.devicePixelRatio || 1) / backingStore;
    // };

    var ratio = 1;
    const loadImage = ()=>{
        return new Promise((resolve,reject)=>{
            let img = new Image();
            img.crossorigin = "anonymous";
            img.src = url;
            img.onload = ()=>{
                resolve(img);
            }
            img.onerror = ()=>{
                reject(img);
            }
        })
    }

    const Init = async ()=>{
        img = await loadImage();
        canvas = document.querySelector("#canvas_edit");
        ctx = canvas.getContext('2d');
        maxHeight = height;
        maxWidth = width;
        img_h = img.height;
        img_w = img.width;
        imgRatio = maxHeight / img.height;

        if (img_h > maxHeight) {
            imgRatio = maxHeight / img_h;
            img_h = maxHeight  ;
            img_w = img_w * imgRatio ;
        }
        canvas.width = document.body.clientWidth ;
        canvas.height = document.body.clientHeight;

        translateX = (canvas.width - img_w) *0.5 + img_w/2;
        translateY = (canvas.height - img_h)*0.5 + img_h/2;

        ctx.translate(translateX,translateY);

        left -= translateX;
        top -= translateY;

        dots = [
            { x: left, y: top },
            { x: left + img_w - 2, y: top },
            { x: left + img_w -2 , y: top + img_h -5 },
            { x: left, y: top + img_h - 5 },
        ];
        dotscopy = [
            { x: left, y: top },
            { x: left + img_w - 2, y: top },
            { x: left + img_w -2 , y: top + img_h -5 },
            { x: left, y: top + img_h - 5 },
        ];
        historyDots = [dotscopy]
        //???????????????????????????
        idots = rectsplit(count, dotscopy[0], dotscopy[1], dotscopy[2], dotscopy[3]);
        render();
        /**
       * ????????????????????????
       * @param e
       */
    
        // canvas.onmousedown = eventStart.bind(this,'click');
        // canvas.ontouchstart = eventStart.bind(this,'touch');
        canvas.onpointerdown = eventStart;
    }

    const render = (flag)=>{
        ctx.clearRect(-10000 *4, -10000 *4 , 10000 * 8, 10000 *8);

        var ndots = rectsplit(count, dots[0], dots[1], dots[2], dots[3]);
        
        ndots.forEach(function(d, i) {
            //?????????????????????????????????
            var dot1 = ndots[i];
            var dot2 = ndots[i + 1];
            var dot3 = ndots[i + count + 2];
            var dot4 = ndots[i + count + 1];

            //???????????????????????????????????????
            var idot1 = idots[i];
            var idot2 = idots[i + 1];
            var idot3 = idots[i + count + 2];
            var idot4 = idots[i + count + 1];

            // console.log(idots[i + count + 2])
            if (dot2 && dot3 && i % (count + 1) < count) {
                //??????????????????????????????
                renderImage2(idot3, dot3, idot2, dot2, idot4, dot4, idot1 ,i);

                //??????????????????????????????
                renderImage(idot1, dot1, idot2, dot2, idot4, dot4, idot1 ,i);
            }
        });
        if(!flag)
        // ???????????????
        ArcFeature();
    }

    
    /**
     * ?????????????????????????????????
     * @param arg_1
     * @param _arg_1
     * @param arg_2
     * @param _arg_2
     * @param arg_3
     * @param _arg_3
     */
    function renderImage(arg_1, _arg_1, arg_2, _arg_2, arg_3, _arg_3, vertex, i) {
        ctx.save();
        
        //??????????????????????????????????????????
        ctx.beginPath();
        ctx.moveTo(_arg_1.x , _arg_1.y);
        ctx.lineTo(_arg_2.x +2, _arg_2.y);
        ctx.lineTo(_arg_3.x, _arg_3.y +2);
        ctx.closePath();
        ctx.clip();

        if (hasPic) {
        //???????????????????????????????????????????????????
        var result = matrix.getMatrix.apply(this, arguments);

        //??????
        ctx.transform(result.a, result.b, result.c, result.d, result.e, result.f);

        var w = img.width / count;
        var h = img.height / count;
        //????????????
        ctx.drawImage(
            img,
            (vertex.x - idots[0].x) / imgRatio - 1,
            (vertex.y - idots[0].y) / imgRatio - 1,
            w / imgRatio + 2,
            h / imgRatio + 2,
            vertex.x - 1,
            vertex.y - 1,
            w + 2,
            h + 2
        );
        }

        ctx.restore();
    }

    function renderImage2(arg_1, _arg_1, arg_2, _arg_2, arg_3, _arg_3, vertex ,i) {
        ctx.save();
        
        //??????????????????????????????????????????
        ctx.beginPath();
        ctx.moveTo(_arg_1.x +1, _arg_1.y +1);
        ctx.lineTo(_arg_2.x +1 , _arg_2.y);
        ctx.lineTo(_arg_3.x, _arg_3.y +1);
        ctx.closePath();
        ctx.clip();

        if (hasPic) {
        //???????????????????????????????????????????????????
        var result = matrix.getMatrix.apply(this, arguments);

        //??????
        ctx.transform(result.a, result.b, result.c, result.d, result.e, result.f);

        var w = img.width / count;
        var h = img.height / count;
        //????????????
        ctx.drawImage(
            img,
            (vertex.x - idots[0].x) / imgRatio - 1,
            (vertex.y - idots[0].y) / imgRatio - 1,
            w / imgRatio + 2 ,
            h / imgRatio + 2 ,
            vertex.x - 1,
            vertex.y - 1,
            w + 2 ,
            h + 2 
        );
        }

        ctx.restore();
    }

    /**
     * ??? abcd ?????????????????? n ??? n ?????????????????? n ???????????????????????????
     * @param n     ????????????
     * @param a     a ?????????
     * @param b     b ?????????
     * @param c     c ?????????
     * @param d     d ?????????
     * @returns {Array}
     */
    function rectsplit(n, a, b, c, d) {
        // ad ???????????? n ??????
        var ad_x = (d.x - a.x) / n;
        var ad_y = (d.y - a.y) / n;
        // bc ???????????? n ??????
        var bc_x = (c.x - b.x) / n;
        var bc_y = (c.y - b.y) / n;

        var ndots = [];
        var x1, y1, x2, y2, ab_x, ab_y;

        //???????????????????????????????????????????????????????????????????????????????????? n ????????????????????????????????????
        for (var i = 0; i <= n; i++) {
        //?????? ad ?????? n ??????????????????
        x1 = a.x + ad_x * i;
        y1 = a.y + ad_y * i;
        //?????? bc ?????? n ??????????????????
        x2 = b.x + bc_x * i;
        y2 = b.y + bc_y * i;

        for (var j = 0; j <= n; j++) {
            // ab ????????????[x2 - x1 , y2 - y1]????????? n ??????????????????????????? n
            ab_x = (x2 - x1) / n;
            ab_y = (y2 - y1) / n;

            ndots.push({
            x: x1 + ab_x * j,
            y: y1 + ab_y * j,
            });
        }
        }

        return ndots;
    }

    // ???????????????
    let ArcFeature = ()=>{
        for (let i = 0; i < dots.length; i++) {
            let dot = dots[i];
            ctx.save();
            //???????????????
            ctx.beginPath();
            //??????????????????
          //   ctx.lineWidth=1;
          //   ctx.fillStyle="green";
            let x = dot.x ,y = dot.y;

            if(i === 0){x += 8;}
            if(i === 1){x -=8;}
            if(i === 2){x -= 8; y-= 8;}
            if(i === 3){x += 8;y-=8;}
            ctx.arc(x,y + 8,8,0,360,false);
            ctx.fill();
            //???????????????
            ctx.closePath();
            ctx.restore();
        }
    }

    let eventStart = function(e) {
        // ???????????????????????????
        const move = function(e) {
          var narea = getArea(e);
          var nx = (narea.l - area.l) ;
          var ny = (narea.t - area.t)  ;
          if(ratio > 0.5){
              nx /= ratio;
              ny /= ratio;
          }else {
              nx /= 0.7;
              ny /= 0.7;
          }
          // console.log(dot.x ,dot.y,canvas.width,canvas.height)
          // ????????????
          // ???????????????????????????????????????
          if(dot.x >= (0 - translateX) && dot.x <= (canvas.width - translateX))
          dot.x += nx;
          else if( dot.x <=(0 - translateX) && nx > 0) dot.x += nx;// ?????????????????????
          else if(dot.x >= (canvas.width - translateX) && nx < 0) dot.x += nx; // ?????????????????????
    
          if(dot.y > (0 - translateY) && dot.y < (canvas.height - translateY))
          dot.y += ny;
          else if( dot.y <= (0 - translateY) && ny > 0) dot.y += ny;
          else if(dot.y >= (canvas.height - translateY) && ny < 0) dot.y += ny;
    
          area = narea;
    
          render();
        };
        // ????????????
        const clear = function() {
          canvas.onmousemove = null;
          canvas.onmouseup = null;
          canvas.ontouchmove = null;
          canvas.ontouchend = null;
          canvas.onpointerup = null;
          canvas.onpointermove = null;
        };
        // console.log(e,'start')
        
        if (!dots.length) return;
    
        let area = getArea(e);
        let dot, i;
        //????????????????????????
        let n = null;
        for (i = 0; i < dots.length; i++) {
          dot = dots[i];
          //???????????????
          ctx.beginPath();
          //??????????????????
        //   ctx.lineWidth=1;
        //   ctx.fillStyle="green";
          let x = dot.x ,y = dot.y;

          if(i === 0){x += 8;}
          if(i === 1){x -=8;}
          if(i === 2){x -= 8; y-= 8;}
          if(i === 3){x += 8;y-=8;}
          ctx.arc(x,y + 8,8,0,360,false);
          ctx.fill();
          let layerX = e.clientX;
          let layerY = e.clientY;
          
          //???????????????
          ctx.closePath();
          if(ctx.isPointInPath(layerX,layerY)){
              n = true;
              break;
          }
        //   if (area.t >= dot.y - qy && area.t <= dot.y + qy && area.l >= dot.x - qy && area.l <= dot.x + qy) {
        //     break;
        //   } else {
        //     dot = null;
        //   }
        }

        let po = {
            x:e.layerX,
            y:e.layerY
        }
        let rgb = ctx.getImageData(e.clientX,e.clientY,1,1);
        if(rgb.data[3] === 0){
            return ;
        }

        if (!n) {
            canvas.onpointermove = (evt) => {
                let darea = getArea(evt);
                var dx = (darea.l - area.l) ;
                var dy = (darea.t - area.t)  ;
                area = darea;
                let xs = dots.map(item => item.x);
                let ys = dots.map(item => item.y);
                dots = dots.map((item,index) => {
                    let minX = Math.min(...xs);
                    let minY = Math.min(...ys);
                    let maxY = Math.max(...ys);
                    let maxX = Math.max(...xs);
                    if(dx<=0 && Math.abs(minX) >= Math.abs(translateX / ratio)){
                        dx = 0;
                    }else if(dx >= 0 && Math.abs(maxX) >= translateX / ratio){
                        dx = 0;
                    }
                    if(dy <= 0 & Math.abs(minY) >= translateY / ratio){
                        dy = 0;
                    }else if(dy >= 0 && Math.abs(maxY) >= translateY / ratio){
                        dy = 0;
                    }
                    item.x += dx;
                    item.y += dy;
                    return item;
                })
                render();
            }
            canvas.onpointerup = ()=>{
                canvas.onpointermove = null;
            }
            return ;
        };

        canvas.onpointerup = ()=>{
            clear();
            historyDots.push(JSON.parse(JSON.stringify(dots)));
        }
        canvas.onpointermove = move;
        // if(type === 'click'){
        //   canvas.onmouseup = ()=>{
        //       clear();
        //       historyDots.push(JSON.parse(JSON.stringify(dots)));
        //   };
        //   // canvas.onmouseout = clear;
        //   canvas.onmousemove = move;
        // }
        // if(type === 'touch'){
        //   canvas.onmousedown = null;
        //   canvas.ontouchmove = move
        //   canvas.ontouchend = ()=>{
        //       clear();
        //       historyDots.push(JSON.parse(JSON.stringify(dots)));
        //   }
        // }
      };


    function getRotateDeg (narea){
        let x = (narea.l - translateX) * Math.cos(rotate) - (narea.t - translateY) * Math.sin(rotate) + translateX;
        let y = (narea.l - translateX) * Math.sin(rotate) + (narea.t - translateY) * Math.cos(rotate) + translateY;
        return {l:x,t:y}
    }
    /**
     * ??????????????????/???????????????
     * @param e
     * @returns {{t: number, l: number}}
     */
    function getArea(e,type) {
    e = e || window.event;
    // if(type === 'touch'){
    //     e = e.touches[0];
    // }
    // let obj = getRotateDeg({t:e.clientY,l:e.clientX});
    // return obj;
    return {
        // t: e.clientY - canvas.offsetTop + document.body.scrollTop + document.documentElement.scrollTop,
        t: e.clientY,
        l: e.clientX 
        // l: e.clientX - canvas.offsetLeft + document.body.scrollLeft + document.documentElement.scrollLeft,
    };
    }
    

    Init();

    // ????????????
    const TurnRight = ()=>{
        // ctx.rotate(rotate);
        dots = dots.map(item => {
            item.x = Math.round(item.x * Math.cos(rotate) - item.y * Math.sin(rotate)) ;
            item.y = Math.round(item.x * Math.sin(rotate) + item.y * Math.cos(rotate)) ;
            return item;
        })
        render();
    }
    let repeatTimer = null,intervalTimer = null;
    const longpressTurnRight = ()=>{
        clearTimeout(repeatTimer);
        repeatTimer = setTimeout(()=>{
            intervalTimer = setInterval(()=>{
                TurnRight();
            },50)
        },800);
    }
    const cancelLongpress = ()=>{
        clearTimeout(repeatTimer);
        clearInterval(intervalTimer);
    }
    const longpressTurnLeft = ()=>{
        clearTimeout(repeatTimer);
        repeatTimer = setTimeout(()=>{
            intervalTimer = setInterval(()=>{
                TurnLeft();
            },50)
        },800);
    }
    // ????????????
    const TurnLeft = ()=>{
        dots = dots.map(item => {
            item.x = Math.round(item.x * Math.cos(-rotate) - item.y * Math.sin(-rotate)) ;
            item.y = Math.round(item.x * Math.sin(-rotate) + item.y * Math.cos(-rotate)) ;
            return item;
        })
        render();
    }
    // ??????
    // const Flip = ()=>{

    // }
    // ??????
    const ZoomIn = ()=>{
        if(ratio >= 1.5) return message.warn('?????????????????????');
        ratio += 0.05;
        ctx.scale(1.05,1.05);
        render();
    }
    // ??????
    const ZoomOut = ()=>{
        if(ratio <= 0.4) return message.warn('?????????????????????');
        ratio -= 0.05;
        ctx.scale(0.95,0.95);
        render();
    }
    // ??????
    const Save = ()=>{
        // ???????????????????????????,????????????????????????,?????????????????????????????????
        ctx.globalAlpha = 1;
        // ???????????????????????????
        render(true);
        setTimeout(()=>{
            let xs = dots.map(item => (item.x * ratio + translateX ));
            let ys = dots.map(item => (item.y * ratio + translateY ));
            let x0 = Math.min(...xs);
            let y0 = Math.min(...ys);
            let x1 = Math.max(...xs);
            let y1 = Math.max(...ys);
            let cn = document.createElement('canvas');
            let cntx = cn.getContext('2d');
            cn.width = x1 - x0;
            cn.height = y1 - y0;
            let imgdata = ctx.getImageData(x0,y0,x1,y1);
            cntx.putImageData(imgdata,0,0,0,0,cn.width,cn.height);
            cn.toBlob((blob)=>{
                let ur = window.URL.createObjectURL(blob);
                Evt.firEvent('ImgEditComplete',{extent:[x0,y1,x1,y0], opacity ,url: ur ,blob});
            })
            cn = null;
        },1)
        
    }
    // ??????
    const Exit = ()=>{
        Evt.firEvent('ImgEditCancel',{});
    }
    // ??????
    const Reset = ()=>{
        // console.log(historyDots)
        let obj = historyDots.pop();
        if(obj){
            dots = obj;
            render();
        }else{
            historyDots = [JSON.parse(JSON.stringify(dotscopy))]
        }
    }
    // ???????????????
    const SetOpacity = (val)=>{
        opacity = val;
        ctx.globalAlpha = val;
        render();
    }
    

    return {
        cvs: <canvas id="canvas_edit"></canvas>,
        tools:<div className={styles.tools}>
            <span className={globalStyle.global_icon}
            dangerouslySetInnerHTML={{__html:"&#xe61e;"}}
            title="????????????"
            onClick={()=> {TurnLeft();cancelLongpress()}}
            onPointerDown={longpressTurnLeft}
            onPointerUp={cancelLongpress}
            onPointerOut={cancelLongpress}
            >

            </span>
            <span className={globalStyle.global_icon}
            dangerouslySetInnerHTML={{__html:"&#xe61d;"}}
            title="????????????"
            onClick={()=> {TurnRight();cancelLongpress()}}
            onPointerDown={longpressTurnRight}
            onPointerUp={cancelLongpress}
            onPointerOut={cancelLongpress}
            >

            </span>
            {/* <span className={globalStyle.global_icon}
            dangerouslySetInnerHTML={{__html:"&#xe82d;"}}
            title="??????"
            onClick={Flip}>

            </span> */}
            <span className={globalStyle.global_icon}
            dangerouslySetInnerHTML={{__html:"&#xe898;"}}
            title="??????"
            onClick={ZoomIn}>

            </span>
            <span className={globalStyle.global_icon}
            dangerouslySetInnerHTML={{__html:"&#xe897;"}}
            title="??????"
            onClick={ZoomOut}>

            </span>
            <Popover 
            trigger="click"
            title="???????????????"
            content={
                <Slider defaultValue={1} min={0.1} step={0.05} max={1} onChange={SetOpacity}/>
            }
            >
                <span className={globalStyle.global_icon}
                dangerouslySetInnerHTML={{__html:"&#xe6c9;"}}
                title="?????????">

                </span>
            </Popover>
            
            <span className={globalStyle.global_icon}
            dangerouslySetInnerHTML={{__html:"&#xe61b;"}}
            title="??????"
            onClick={Reset}>

            </span>
            <span className={`${globalStyle.global_icon} ${styles.saveBtn}`}
            dangerouslySetInnerHTML={{__html:"&#xe639;"}}
            title="??????"
            onClick={Save}>

            </span>
            <span className={`${globalStyle.global_icon} ${styles.cancelBtn}`}
            dangerouslySetInnerHTML={{__html:"&#xe607;"}}
            title="??????"
            onClick={Exit}>

            </span>

        </div>
    }
}

