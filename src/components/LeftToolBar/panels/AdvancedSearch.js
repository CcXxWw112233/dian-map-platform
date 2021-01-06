import React, { useState } from "react";
import styles from "./AdvancedSeach.less";
import floatPanelStyles from "./FloatPanel.less";
import globalStyle from "@/globalSet/styles/globalStyles.less";
import { Input, DatePicker, Button, Select, Tabs, Tag, message } from "antd";
import "moment/locale/zh-cn";
import locale from "antd/lib/date-picker/locale/zh_CN";
import { areas, stars, brand } from "./tmpData";
import Event from "../../../lib/utils/event";
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { CheckableTag } = Tag;
const AreaPanel = ({ x, y, parent }) => {
  let [selectedTags, setSelectedTag] = useState(parent.selectedAreaCodes);
  return (
    <div className={floatPanelStyles.wrapper} style={{ left: x, top: y }}>
      <p className={floatPanelStyles.title}>
        <div style={{ width: "calc(100% - 20px)" }}>
          <span>区域</span>
        </div>
        <i
          className={globalStyle.global_icon}
          onClick={() => {
            parent.setState({
              showAreaPanel: false,
            });
          }}
        >
          &#xe7d0;
        </i>
      </p>
      <div
        className={floatPanelStyles.body}
        style={{ height: "calc(100% - 60px)" }}
      >
        <Tabs>
          <TabPane tab="ABCDE" key="1">
            <div className={floatPanelStyles.content}>
              {areas.map((item) => {
                return (
                  <CheckableTag
                    key={item.code}
                    checked={selectedTags.indexOf(item.code) > -1}
                    style={{
                      marginBottom: 12,
                    }}
                    onChange={(checked) => {
                      const nextSelectedTags = checked
                        ? [...selectedTags, item.code]
                        : selectedTags.filter((t) => t !== item.code);
                      setSelectedTag(nextSelectedTags);
                    }}
                  >
                    {item.name}
                  </CheckableTag>
                );
              })}
            </div>
          </TabPane>
          <TabPane tab="FGHJ" key="2">
            <div className={floatPanelStyles.content}>
              {areas.map((item) => {
                return (
                  <CheckableTag
                    key={item.code}
                    checked={selectedTags.indexOf(item.code) > -1}
                    style={{
                      marginBottom: 12,
                    }}
                    onChange={(checked) => {
                      const nextSelectedTags = checked
                        ? [...selectedTags, item.code]
                        : selectedTags.filter((t) => t !== item.code);
                      setSelectedTag(nextSelectedTags);
                    }}
                  >
                    {item.name}
                  </CheckableTag>
                );
              })}
            </div>
          </TabPane>
          <TabPane tab="KLMN" key="3">
            <div className={floatPanelStyles.content}>
              {areas.map((item) => {
                return (
                  <CheckableTag
                    key={item.code}
                    checked={selectedTags.indexOf(item.code) > -1}
                    style={{
                      marginBottom: 12,
                    }}
                    onChange={(checked) => {
                      const nextSelectedTags = checked
                        ? [...selectedTags, item.code]
                        : selectedTags.filter((t) => t !== item.code);
                      setSelectedTag(nextSelectedTags);
                    }}
                  >
                    {item.name}
                  </CheckableTag>
                );
              })}
            </div>
          </TabPane>
          <TabPane tab="PQRST" key="4">
            <div className={floatPanelStyles.content}>
              {areas.map((item) => {
                return (
                  <CheckableTag
                    key={item.code}
                    checked={selectedTags.indexOf(item.code) > -1}
                    style={{
                      marginBottom: 12,
                    }}
                    onChange={(checked) => {
                      const nextSelectedTags = checked
                        ? [...selectedTags, item.code]
                        : selectedTags.filter((t) => t !== item.code);
                      setSelectedTag(nextSelectedTags);
                    }}
                  >
                    {item.name}
                  </CheckableTag>
                );
              })}
            </div>
          </TabPane>
          <TabPane tab="WXYZ" key="5">
            <div className={floatPanelStyles.content}>
              {areas.map((item) => {
                return (
                  <CheckableTag
                    key={item.code}
                    checked={selectedTags.indexOf(item.code) > -1}
                    style={{
                      marginBottom: 12,
                    }}
                    onChange={(checked) => {
                      const nextSelectedTags = checked
                        ? [...selectedTags, item.code]
                        : selectedTags.filter((t) => t !== item.code);
                      setSelectedTag(nextSelectedTags);
                    }}
                  >
                    {item.name}
                  </CheckableTag>
                );
              })}
            </div>
          </TabPane>
        </Tabs>
      </div>
      <div className={floatPanelStyles.footer}>
        <Button
          style={{ color: "#5A86F5", background: "#F5F7FB", marginRight: 16 }}
          onClick={() => {
            setSelectedTag([]);
            parent.updateSelectedArea([]);
          }}
        >
          清空
        </Button>
        <Button
          style={{ background: "#5A86F5", color: "#fff" }}
          onClick={() => {
            parent.setState(
              {
                showAreaPanel: false,
              },
              () => {
                parent.updateSelectedArea(selectedTags);
              }
            );
          }}
        >
          完成
        </Button>
      </div>
    </div>
  );
};
const BrandPanel = ({ x, y, parent }) => {
  let [selectedTags, setSelectedTag] = useState(parent.selectedBrands);
  return (
    <div className={floatPanelStyles.wrapper} style={{ left: x, top: y }}>
      <p className={floatPanelStyles.title}>
        <div style={{ width: "calc(100% - 20px)" }}>
          <span>品牌</span>
        </div>
        <i
          className={globalStyle.global_icon}
          onClick={() => {
            parent.setState({
              showBrandPanel: false,
            });
          }}
        >
          &#xe7d0;
        </i>
      </p>
      <div
        className={floatPanelStyles.body}
        style={{ height: "calc(100% - 60px)", textAlign: "left" }}
      >
        {brand.map((item) => {
          return (
            <CheckableTag
              key={item.key}
              checked={selectedTags.indexOf(item.key) > -1}
              style={{
                marginBottom: 12,
              }}
              onChange={(checked) => {
                const nextSelectedTags = checked
                  ? [...selectedTags, item.key]
                  : selectedTags.filter((t) => t !== item.key);
                setSelectedTag(nextSelectedTags);
              }}
            >
              {item.name}
            </CheckableTag>
          );
        })}
      </div>
      <div className={floatPanelStyles.footer}>
        <Button
          style={{ color: "#5A86F5", background: "#F5F7FB", marginRight: 16 }}
        >
          清空
        </Button>
        <Button
          style={{ background: "#5A86F5", color: "#fff" }}
          onClick={() => {
            parent.setState(
              {
                showBrandPanel: false,
              },
              () => {
                parent.updateSelectedBrand(selectedTags);
              }
            );
          }}
        >
          完成
        </Button>
      </div>
    </div>
  );
};
export default class AdvancedSeach extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAreaPanel: false,
      showBrandPanel: false,
      areaPanelX: null,
      areaPanelY: null,
      brandPanelX: null,
      brandPanelY: null,
      selectedAreas: [],
      keywordState: "",
      personNum: 20,
      lowerLimitPrice: 0,
      upperLimitPrice: 1000,
      selectedStarKeys: [],
      selectedBrands: [],
    };
    this.selectedAreaCodes = [];
    this.selectedBrandKeys = [];
    this.selectedBrands = [];
    this.selectStars = [];
  }
  updateSelectedArea = (selectedAreaCodes) => {
    this.selectedAreaCodes = selectedAreaCodes;
    const selectedAreas = areas.filter((item) => {
      return selectedAreaCodes.includes(item.code);
    });
    this.setState({
      selectedAreas: selectedAreas,
    });
  };
  updateSelectedBrand = (brandKeys) => {
    this.selectedBrandKeys = brandKeys;
    const selectedBrands = brand.filter((item) => {
      return brandKeys.includes(item.key);
    });
    this.setState({
      selectedBrands: selectedBrands,
    });
  };
  handleSelectClick = (e, type) => {
    if (type === 0) {
      this.setState({
        showAreaPanel: true,
        areaPanelX: e.currentTarget.getBoundingClientRect().x - 20,
        areaPanelY: e.currentTarget.getBoundingClientRect().y,
      });
    } else {
      this.setState({
        showBrandPanel: true,
        brandPanelX: e.currentTarget.getBoundingClientRect().x - 20,
        brandPanelY: e.currentTarget.getBoundingClientRect().y,
      });
    }
  };
  handleRemoveSelectedArea = (e, code) => {
    this.selectedAreaCodes = this.selectedAreaCodes.filter((t) => t !== code);
    let selectedAreas = this.state.selectedAreas.filter((t) => t.code !== code);
    this.setState({
      selectedAreas: selectedAreas,
      showAreaPanel: false,
    });
  };

  handleRemoveSelectedBrand = (e, key) => {
    this.selectedBrandKeys = this.selectedBrandKeys.filter((t) => t !== key);
    let selectedBrands = this.state.selectedBrands.filter((t) => t.key !== key);
    this.setState({
      selectedBrands: selectedBrands,
    });
  };

  testNum = (e) => {
    const { value } = e.target;
    const reg = /^-?\d*(\.\d*)?$/;
    if ((!isNaN(value) && reg.test(value)) || value === "" || value === "-") {
      return Number(value);
    }
    return -1;
  };
  onPersonNumChange = (e) => {
    let num = this.testNum(e);
    if (num !== -1) {
      this.setState({
        personNum: num,
      });
    }
  };
  onPersonNumBlur = () => {
    let { personNum } = this.state;
    let valueTemp = personNum;
    if (personNum.charAt(personNum.length - 1) === "." || personNum === "-") {
      valueTemp = personNum.slice(0, -1);
    }
    this.onPersonNumChange(valueTemp.replace(/0*(\d+)/, "$1"));
    if (this.onPersonNumBlur) {
      this.onPersonNumBlur();
    }
  };
  onLowerLimitPriceChange = (e) => {
    let num = this.testNum(e);
    if (num !== -1) {
      if (num < this.state.upperLimitPrice) {
        this.setState({
          lowerLimitPrice: num,
        });
      } else {
        message.warn("最小价格应小于最大价格。");
      }
    }
  };

  onuUpperLimitPriceChage = (e) => {
    let num = this.testNum(e);
    if (num !== -1) {
      if (num > this.state.lowerLimitPrice) {
        this.setState({
          upperLimitPrice: num,
        });
      } else {
        message.warn("最大价格应大于最小价格。");
      }
    }
  };

  clearAll = () => {
    this.setState({
      showAreaPanel: false,
      showBrandPanel: false,
      areaPanelX: null,
      areaPanelY: null,
      brandPanelX: null,
      brandPanelY: null,
      selectedAreas: [],
      personNum: 20,
      lowerLimitPrice: 0,
      upperLimitPrice: 1000,
    });
  };

  handleStarClick = (key) => {
    let { selectedStarKeys } = this.state;
    if (selectedStarKeys.includes(key)) {
      selectedStarKeys = selectedStarKeys.filter((item) => {
        return item !== key;
      });
      this.selectStars = stars.filter((item) => {
        return item.key !== key;
      });
    } else {
      let currentStar = stars.filter((item) => {
        return item.key === key;
      })[0];
      selectedStarKeys.push(key);
      this.selectStars.push(currentStar);
    }
    this.setState({
      selectedStarKeys: selectedStarKeys,
    });
  };
  onKeywordChange = (value) => {
    this.setState({
      keywordState: value,
    });
  };
  render() {
    return (
      <div className={styles.wrapper}>
        <div
          className={`${styles.body} ${globalStyle.autoScrollY}`}
          style={{ height: "calc(100% - 40px)" }}
        >
          <div className={styles.block}>
            <p className={styles.title}>
              <span>关键词</span>
            </p>
            <div className={styles.content}>
              <Input
                allowClear
                placeholder="请输入关键词"
                value={this.state.keywordState}
                onChange={(e) => this.onKeywordChange(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.block}>
            <p className={styles.title}>
              <span>日期/时间</span>
            </p>
            <div className={styles.content}>
              <RangePicker locale={locale} Fstyle={{ with: "100%" }} />
            </div>
          </div>
          <div className={styles.block}>
            <p className={styles.title}>
              <div style={{ width: "calc(100% - 32px)" }}>
                <span>区域</span>
              </div>
              {/* <div className={styles.add}>
                <i className={globalStyle.global_icon}>&#xe7dc;</i>
              </div> */}
              <Button
                shape="circle"
                icon={<i className={globalStyle.global_icon}>&#xe7dc;</i>}
                onClick={(e) => this.handleSelectClick(e, 0)}
              ></Button>
            </p>
            {this.state.showAreaPanel ? (
              <AreaPanel
                x={this.state.areaPanelX}
                y={this.state.areaPanelY}
                parent={this}
              ></AreaPanel>
            ) : null}
            <div className={`${styles.content} ${styles.inline}`}>
              {this.state.selectedAreas.map((item) => {
                return (
                  <Tag
                    key={item.code}
                    closable
                    onClose={(e) => this.handleRemoveSelectedArea(e, item.code)}
                    style={{
                      marginBottom: 12,
                    }}
                  >
                    {item.name}
                  </Tag>
                );
              })}
              {/* <div className={styles.label}>
                <span>广州</span>
                <i className={globalStyle.global_icon}>&#xe7d0;</i>
              </div>
              */}
              {this.state.selectedAreas.length === 0 ? (
                <i
                  className={globalStyle.global_icon}
                  style={{ fontSize: 40, margin: "10px auto" }}
                >
                  {" "}
                  &#xe7d1;
                </i>
              ) : null}
            </div>
          </div>
          <div className={styles.block}>
            <p className={styles.title}>
              <div style={{ width: "calc(100% - 32px)" }}>
                <span>品牌</span>
              </div>
              {/* <div className={styles.add}>
                <i className={globalStyle.global_icon}>&#xe7dc;</i>
              </div> */}
              <Button
                shape="circle"
                icon={<i className={globalStyle.global_icon}>&#xe7dc;</i>}
                onClick={(e) => this.handleSelectClick(e, 1)}
              ></Button>
            </p>
            {this.state.showBrandPanel ? (
              <BrandPanel
                x={this.state.brandPanelX}
                y={this.state.brandPanelY}
                parent={this}
              ></BrandPanel>
            ) : null}
            <div className={`${styles.content} ${styles.inline}`}>
              {this.state.selectedBrands.map((item) => {
                return (
                  <Tag
                    key={item.key}
                    closable
                    onClose={(e) => this.handleRemoveSelectedBrand(e, item.key)}
                    style={{
                      marginBottom: 12,
                    }}
                  >
                    {item.name}
                  </Tag>
                );
              })}
            </div>
            {this.state.selectedBrands.length === 0 ? (
              <i
                className={globalStyle.global_icon}
                style={{ fontSize: 40, margin: "10px auto" }}
              >
                {" "}
                &#xe7d1;
              </i>
            ) : null}
          </div>
          <div className={styles.block}>
            <p className={styles.title}>
              <span>星级</span>
            </p>
            <div className={`${styles.content} ${styles.inline}`}>
              {stars.map((item) => {
                return (
                  <div
                    className={`${styles.label2} ${
                      this.state.selectedStarKeys.includes(item.key)
                        ? styles.on
                        : ""
                    }`}
                    key={item.key}
                    onClick={() => this.handleStarClick(item.key)}
                  >
                    {item.name}
                  </div>
                );
              })}
            </div>
          </div>
          <div className={styles.block}>
            <p className={styles.title}>
              <span>人数</span>
            </p>
            <div className={`${styles.content} ${styles.inline}`}>
              <Input
                placeholder="请输入人数"
                suffix="人"
                value={this.state.personNum}
                onChange={this.onPersonNumChange}
                // onBlur={this.onPersonNumBlur}
                maxLength={25}
                style={{ width: "34%" }}
              />
            </div>
          </div>
          <div className={styles.block}>
            <p className={styles.title}>
              <span>价格</span>
            </p>
            <div className={`${styles.content} ${styles.inline}`}>
              <Input
                placeholder="请输入金额"
                prefix="￥"
                value={this.state.lowerLimitPrice}
                onChange={this.onLowerLimitPriceChange}
                maxLength={25}
                style={{ width: "46%" }}
              />
              <i
                className={globalStyle.global_icon}
                style={{ margin: "5px auto", color: "rgb(63 68 93 / 30%)" }}
              >
                &#xe635;
              </i>
              <Input
                placeholder="请输入金额"
                prefix="￥"
                value={this.state.upperLimitPrice}
                onChange={this.onuUpperLimitPriceChage}
                maxLength={25}
                style={{ width: "46%" }}
              />
            </div>
          </div>
          <Button
            style={{ marginTop: 30, float: "right" }}
            onClick={this.clearAll}
          >
            清除筛选
          </Button>
        </div>
        <div className={styles.footer}>
          <Button
            style={{ color: "#5A86F5", background: "#F5F7FB" }}
            onClick={() => {
              Event.Evt.firEvent("displayProjectPanel");
            }}
          >
            返回
          </Button>
          <Button
            style={{ background: "#5A86F5", color: "#fff" }}
            onClick={() => {
              let obj = {
                selectedAreas: this.state.selectedAreas,
                selectedBrands: this.state.selectedBrands,
                selectedStars: this.selectStars,
                keywordState: this.state.keywordState,
              };
              Event.Evt.firEvent("searchProjectData", obj);
              Event.Evt.firEvent("displayProjectPanel");
            }}
          >
            确定
          </Button>
        </div>
      </div>
    );
  }
}
