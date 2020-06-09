import React from 'react'
import ReactDOM from 'react-dom'
import styles from './index.less'
import { connect } from 'dva'
import MCanvas from './mCanvas'

@connect((
    {editPicture:{ position ,pictureUrl,pictureWidth,pictureHeight}})=>
    ({ position , pictureUrl,pictureWidth,pictureHeight}))
export default class MatrixEdit extends React.PureComponent {
    constructor(){
        super(...arguments);
        this.state = {
            disabled:true
        }
    }
    render(){
        let { disabled } = this.state;
        let { position ,pictureWidth ,pictureHeight ,pictureUrl} = this.props;
        // cvs 是图像编辑器
        let { cvs, tools } = new MCanvas({url:pictureUrl,width:pictureWidth ,height:pictureHeight ,position})
        return (
            ReactDOM.createPortal(
              <div className={styles.MatrixEditModal} style={{pointerEvents:disabled ? 'auto' :"none"}}>
                <div>
                    { tools }
                </div>
                <div className={styles.editContent}
                // style={{left:position.x,top:position.y,width:pictureWidth ,height:pictureHeight }}
                >
                    {cvs}
                </div>
            </div>,
            document.body
            )
        )
    }
}