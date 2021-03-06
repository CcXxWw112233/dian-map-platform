import React, { PureComponent } from 'react'
import styles from './CityPanel.less'
import globalStyle from '@/globalSet/styles/globalStyles.less'
export default class CityPanel extends PureComponent {
  render(){
    return (
      <div className={styles.wrap}>
        <header className={styles.cityHeader}>
          <span className={styles.cityCurrent}>当前城市：天津</span>
          <span className={styles.cityPanelClose}>
            <i className={globalStyle.global_icon}>&#xe601;</i>
          </span>
        </header>
        <ul className={styles.cityList}>
          <li>全部</li>
          <li>北京</li>
          <li>北京</li>
          <li>北京</li>
          <li>北京</li>
          <li>北京</li>
          <li>北京</li>
          <li>北京</li>
          <li>北京</li>
          <li>北京</li>
          <li>北京</li>
          <li>北京</li>
          <li>北京</li>
          <li>北京</li>
          <li>北京</li>
          <li>北京</li>
          <li>北京</li>
        </ul>
        <div className={styles.cityPCTitle}>
          <span className={`${styles.cityPCTitle} ${styles.citySelet}`}>按省份</span>
          <span className={styles.cityPCTitle}>按城市</span>
        </div>
        <div className={styles.citySearch}>
          <i className={`${styles.citySearchLogo} ${globalStyle.global_icon}`}>&#xe6d4;</i>
          <input type="text" placeholder="请输入城市" />
        </div>
        <div className={styles.cityList}>
          <ul className={styles.cityProvinceLetter}>
            <li>A</li>
            <li>A</li>
            <li>A</li>
            <li>A</li>
            <li>A</li>
            <li>A</li>
            <li>A</li>
            <li>A</li>
            <li>A</li>
          </ul> 
          <div class={styles.slimScrollDiv}>
            <dl className={styles.cityList}>
              <dt>安徽：</dt>
              <dd>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
              </dd>
              <dt>安徽：</dt>
              <dd>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
              </dd>
              <dt>安徽：</dt>
              <dd>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
              </dd>
              <dt>安徽：</dt>
              <dd>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
              </dd>
              <dt>安徽：</dt>
              <dd>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
              </dd>
              <dt>安徽：</dt>
              <dd>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
              </dd>
              <dt>安徽：</dt>
              <dd>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
              </dd>
              <dt>安徽：</dt>
              <dd>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
                <li>合肥</li>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    )
  }
}