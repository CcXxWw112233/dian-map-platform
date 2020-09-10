import React, { useState, useMemo } from 'react';
import styles from './index.less';
import { MyIcon } from '../../../../components/utils';
import Event from '../../../../lib/utils/event';
import { Empty, Pagination } from 'antd';
import DetailAction from '../../../../lib/components/ProjectScouting/ScoutingDetail';

export default function TrafficDetail(props){
  const [ poiData, setPoiData ] = useState([]);
  const [ pageMsg, setPageMsg ] = useState({});
  const back = ()=>{
    props.onBack && props.onBack();
  }

  Event.Evt.on('SearchPOI', (val)=>{
    if(val){
      let { pois } = val;
      setPoiData(pois);
      setPageMsg(val);
      // console.log(val)
    }else{
      setPageMsg({});
      setPoiData([])
    }
  })

  const changePage = (val)=>{
    DetailAction.updateSearch(props.data.id, props.type, val);
  }

  const setActiveItem = (val)=>{
    // console.log(val);
    let coor = [+val.location.lng, +val.location.lat];
    let param = {
      center: coor,
    }
    DetailAction.toCenter(param);
  }

  return (
    <div className={styles.search_detail_container}>
      <div className={styles.search_detail_title}>
        <span onClick={back} className={styles.back}>
          <MyIcon type="icon-fanhuijiantou"/>
          <span>返回</span>
        </span>
        <span className={styles.closeBtn} onClick={props.onClose}>
          <MyIcon type="icon-guanbi2"/>
        </span>
      </div>
      <div className={styles.search_detail_content}>
        {poiData.length ? (
          <div className={styles.detail_content_list}>
            {poiData.map(item => {
              return (
                <div key={item.id} className={styles.content_item} onClick={()=> setActiveItem(item)}>
                <span className={`${styles.item_icon}`}></span>
                {item.name}
                </div>
              )
            })}
          </div>) : <Empty/>}
      </div>
      <div className={styles.search_detail_footer}>
        <Pagination defaultCurrent={1}
        total={pageMsg.count || 1}
        showSizeChanger={false}
        pageSize={pageMsg.pageSize || 10} onChange={changePage} size="small"/>
      </div>
    </div>
  )
}
