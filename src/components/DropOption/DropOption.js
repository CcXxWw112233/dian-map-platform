import React from 'react'
import PropTypes from 'prop-types'
import { DownOutlined } from '@ant-design/icons'
import { Dropdown, Button, Menu } from 'antd'
import { MyIcon } from 'components/utils'

const DropOption = ({
  options
}) => {
  const name = options.name
  const optionKey = options.key
  const children = options.children
  const menu = children.map(item => (
    <Menu.Item key={item.key}
    onClick={item.cb}>
    <MyIcon type={ item.icon }/>
    {item.name}
    </Menu.Item>
  ))
  const icon = options.icon
  let downOutlined,myOvelay
  if (children.length > 0) {
    downOutlined = (<DownOutlined />)
    myOvelay = (<Menu>{menu}</Menu>)
  }
  else {
    return (
    <Button style={{ border: 'none', padding: '4px 10px', cursor: 'pointer' }}  onClick={options.cb}>
      <MyIcon type={ icon }/>
      {name}
      </Button>
    )
  }
  return (
    <Dropdown
      overlay={ myOvelay }
    >
      <Button style={{ border: 'none', padding: '4px 10px', cursor: 'pointer' }} key={optionKey}>
        <MyIcon type={ icon }/>
        { name }
        { downOutlined }
      </Button>
    </Dropdown>
  )
}

DropOption.propTypes = {
  options: PropTypes.object
}

export default DropOption