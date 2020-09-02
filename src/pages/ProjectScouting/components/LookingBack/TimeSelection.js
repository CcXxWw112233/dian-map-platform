import React, { useState, useMemo} from 'react';
import styles from './TimeSelection.less';
import { MyIcon } from '../../../../components/utils';

// export default class TimeSelection extends React.Component{
//   constructor()
// }
export default function TimeSelection(props){
  let { data, active = {y: new Date().getFullYear()}, onChange ,onChangeActive} = props;
  let num = props.idKey;
  let Time = {};
  let [ timeTree, setTimeTree ] = useState({})
  // let [ selection, setSelection ] = useState([]);
  let [transfromStyle ,setTransfromStyle] = useState({})
  let timer = null ;

  // 格式化时间为树形数据
  const formatData = () => {
    let obj = {};
    // console.log(data)
    data.forEach(item => {
      let createTime = +item.create_time;
      let time = new Date(createTime);
      let y = time.getFullYear();
      let month = time.getMonth() + 1;
      let date = time.getDate();
      if(!obj[y]){
        obj[y] = {};
      }
      if(!obj[y][month]){
        obj[y][month] = [];
      }
      obj[y][month].push({date: date, time: createTime, data: item, month, year: y});
      obj[y][month] = obj[y][month].sort((a,b) => {
        return a.date - b.date;
      })
    })
    return obj;
  }
  // 根据传入的日期，渲染数据
  const getDataForDate = (date = {})=>{
    let { y, m, d } = date;
    let select = [];
    if(date.m && !date.d){
      select = Time[y][+m];
    }else if(date.m && date.d){
      select = Time[y][+m].filter(item => item.date === +d);
    }else {
      select = data.map(item => {
        return {data: item, time: +item.create_time}
      })
    }
    // console.log(select);
    onChange && onChange(select);
    // setSelection(select);
  }

  const FilterDateFormat = ()=>{
    const { m, d } = active;
    if(m && !d){
      return 'm_'+ m +"_" + num
    }else if(m && d){
      return `d_${m}_${d}_${num}`
    }else return "_all"+num;
  }

  // 获取月份中所有的数据并且去重日期
  const getDates = (month)=>{
    let obj = {}
    month.forEach(item => {
      if(!obj[item.date]){
        obj[item.date] = [];
      }
      obj[item.date].push(item);
    })
    // console.log(obj)
    return obj;
  }

  // 更新选中日期的样式，位移
  const setActiveStyle = (id)=>{
    let dom = document.querySelector('#'+id);
    if(dom){
      setTransfromStyle({left: -dom.offsetLeft+'px'})
    }
  }

  const toChange = ({y, m, d, data})=>{
    onChangeActive && onChangeActive({data, active: {y,m,d}})
  }

  const setActiveDay = (evt,val, type)=>{
    // let left = evt.target.offsetLeft;
    toChange(val);
  }

  const setActiveClass = (m,d)=>{
    if(+active.m === +m && +active.d === +d){
      return styles.activeDay
    }
    return '';
  }

  const renderDay = (month)=>{
    let obj = getDates(timeTree[active['y']][month]);
    let keys = Object.keys(obj);
    return keys.map((item,index) => {
      let date = obj[item];
      let id = `d_${month}_${item}_${num}`
      return <span className={`${styles.date} ${setActiveClass(month, item)}`} key={index} title={`${month}.${item}`}
      id={id}
      onClick={(e)=> setActiveDay(e,{y: active['y'], m: month, d: item , data: date}, 'day')}
      ></span>
    })
  }

  const setActiveMonth = (type)=>{
    let { m } = active;
    let keys = Object.keys(timeTree[active['y']])
    let index = keys.indexOf(m);
    switch (type){
      case "prev" :
        if(index !== -1 && index !== 0){
          m = keys[index - 1];
        }
      ;
      break;
      case "next":
      if(index !== -1 && index !== (keys.length - 1)){
        m = keys[index + 1];
      }else if(index === -1){
        m = keys[0];
      }
      ;break;
      default:
      ;
    }
    toChange({y: active['y'], m, d: undefined});
  }

  // 监听数据更改
  useMemo(() => {
    clearTimeout(timer);
    timer = setTimeout(()=>{
      let d = formatData();
      Time = d;
      setTimeTree(d);
      getDataForDate(active);

      let filteractive = FilterDateFormat(active);
      setActiveStyle(filteractive);
    }, 500)
    return () => ({data, active});
  }, [data, active])

  const getSeleceName = ()=>{
    let {m ,d} = active;
    if(m && !d){
      return `${m}月`;
    }else if(m && d){
      return `${m}月${d}日`;
    }else
    return '全部'
  }

  return (
    <div className={styles.container}>
      <span className={`${styles.prevMonth} ${styles.changeMonth}`} onClick={()=> setActiveMonth('prev')}>
        <MyIcon type="icon-bianzu681"/>
      </span>
      <span className={`${styles.nextMonth} ${styles.changeMonth}`} onClick={()=> setActiveMonth('next')}>
        <MyIcon type="icon-bianzu671"/>
      </span>
      <div className={styles.timeselectionContainer}>
        <span className={styles.selectTimeTip}>{getSeleceName()}</span>
        <div className={styles.timeselection} style={transfromStyle}>
          { timeTree[active['y']] && Object.keys(timeTree[active['y']]).map((month, mindex) => {
            return (
              <div className={styles.timeOfMonth} key={month}>
                {
                  mindex === 0 &&
                  <span className={`${styles.allMonth} ${(!active["m"] && !active["d"])? styles.activeAll :""}`} id={'_all'+num}
                  onClick={(e)=>setActiveDay(e,{y: active['y'],m: undefined ,data: timeTree[active['y']]},'month')}>
                    {(active["m"] || active['d']) && <span className={styles.selectTime}>全部</span>}
                  </span>
                }
                <span className={`${styles.month} ${+month === +active['m'] ? styles.activeMonth: ''}`}
                id={`m_${month}_${num}`}
                onClick={(e)=>setActiveDay(e,{y: active['y'],m: month ,data: timeTree[active['y']]},'month')}
                >
                  { month !== active["m"] && <span className={styles.selectTime}>{month}月</span> }
                </span>
                <div className={styles.dates}>
                  {renderDay(month)}
                </div>
              </div>
            )
          }) }
        </div>
      </div>
    </div>

  )
}
