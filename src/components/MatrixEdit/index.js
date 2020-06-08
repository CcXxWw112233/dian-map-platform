import React from 'react'
import styles from './index.less'

export default class MatrixEdit extends React.PureComponent {
    constructor(){
        super(...arguments);
        this.state = {}
    }
    render(){
        return (
            <div className={styles.MatrixEditModal}>
                <div className={styles.editContent}>
                    编辑中
                </div>
            </div>
        )
    }
}