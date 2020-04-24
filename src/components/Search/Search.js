import React, { PureComponent } from 'react'
import styles from './Search'
import { Input } from 'antd'
export default class Search extends PureComponent {
  render() {
    return (
      <Input.Group compact style={{ width: 328, margin:'24px 16px 16px 16px',flex:"none"}}>
        <Input style={{ width: '20%',cursor:'pointer',readonly:'readonly', height:32 }} defaultValue="深圳" />
        <Input.Search style={{ width: '80%', height:32 }} defaultValue="搜索资料或目的地" />
      </Input.Group>
    )
  }
}