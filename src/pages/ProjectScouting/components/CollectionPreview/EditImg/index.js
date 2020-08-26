import React from 'react';
import styles from './index.less';
import { MyIcon } from '../../../../../components/utils';
// import fabric from 'fabric';

export default class EditImage extends React.Component{
  constructor(props){
    super(props);
    this.state = {}
  }
  componentDidMount(){
    this.initCanvas();
  }
  initCanvas = ()=>{

  }
  render(){
    const { onExit } = this.props;
    return (
      <div className={styles.editBox}>
        <span className={styles.closeModal} onClick={()=> {onExit && onExit()}}>
          <MyIcon type="icon-guanbi2"/>
        </span>
        <canvas id="edit_canvas">
          您的浏览器不支持canvas，请更换浏览器
        </canvas>
      </div>
    )
  }
}
