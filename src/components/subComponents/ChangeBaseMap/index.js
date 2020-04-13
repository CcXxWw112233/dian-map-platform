import React from 'react'
import { connect } from 'dva'
import styles from './index.css'
import mapSource from '../../../utils/mapSource'

class ChangeBaseMap extends React.Component {
  constructor(props){
    super(props);
    this.hideKeys = ['roadLabel','label','title']
  }
  // 切换地图
  checkChange = (sourcekey, mapkey) => {
    let { onChange } = this.props;
    if(sourcekey === 'google'){
      onChange && onChange(sourcekey,['_img_tile'])
    }else if(sourcekey === 'tianditu'){
      onChange && onChange(sourcekey,[`_${mapkey}_tile`,'_roadLabel_tile'])
    }else{
      if(mapkey !=='vec'){
        onChange && onChange(sourcekey,[`_${mapkey}_tile`,'_roadLabel_tile'])
      }else{
        onChange && onChange(sourcekey,[`_${mapkey}_tile`])
      }
    }
    return ;
  }
  getMapList = ()=>{
    let source = mapSource.baseMaps;
    // console.log(source)
    return source || [];
  }
  componentDidMount(){
    this.getMapList();
  }
  render(){
    let source = this.getMapList();
    let keys = Object.keys(source);
    return (
      <div className={styles.changeBaseMap}>
        {keys.map((key,index) => {
          return (
            <div className={styles.mapitem_box} key={key+index}>
              {source[key].title}
              {[...Object.keys(source[key])].map((item,index) => {
                if(this.hideKeys.indexOf(item) === -1){
                  return (
                    <div className={styles.mapitem} key={item} onClick={this.checkChange.bind(this,key,item)}>
                      {source[key][item].title}
                    </div>
                  )
                }

              })}
            </div>
          )
        })}
      </div>
    )
  }
}

export default connect()(ChangeBaseMap)
