import React from 'react'
import styles from './publicMapData.less'
import DataItem from './DataItem'
import  PublicDataActions  from '../../lib/components/PublicData'
import globalStyle from '../../globalSet/styles/globalStyles.less'
const MenuData = require('./public_data.json')

export default class PublicData extends React.Component{
    constructor(props){
        super(props)
        this.state = {

        }
        this.AllCheckData = MenuData.data;
    }
    toggleViewPulicData = ()=>{
        PublicDataActions.getPublicData()
    }
    render(){
        return (
        <div className={styles.publicBox + ` ${globalStyle.autoScrollY}`}>
            {
                this.AllCheckData.map((item ,index)=>{
                    return (
                        <DataItem data={item} key={item.key} onChange={this.toggleViewPulicData}/>
                    )
                })
            }
        </div>
        )
    }
}