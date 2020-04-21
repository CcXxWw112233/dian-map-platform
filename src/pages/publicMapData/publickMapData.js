import React from 'react'
import styles from './publickMapData.less'
import DataItem from './DataItem'

export default class PublicData extends React.Component{
    constructor(props){
        super(props)
        this.state = {

        }
        this.Permission = [
            
        ]
    }

    render(){
        return (
        <div className={styles.publicBox}>
            我是公有数据
        </div>
        )
    }
}