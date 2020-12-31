import React from "react";
import { Cascader, message } from "antd";
import areaSearchAction from "@/lib/components/Search/AreaSearch";

export default class NewAreaPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cascaderOptions: [{ value: "0000000", label: "全国", children: [] }],
    };
  }
  componentDidMount() {
    areaSearchAction.getProvince().then((res) => {
      if (res && res.code === "0") {
        // let oldState = this.state.cascaderOptions;
        let newList = [];
        res.data.forEach((item) => {
          let provinces = {
            value: item.code,
            label: item.name,
            type: "province",
            isLeaf: false,
          };
          newList.push(provinces);
        });
        this.setState({
          cascaderOptions: [...this.state.cascaderOptions, ...newList],
          // cascaderValue: [],
          // popupVisible: false,
        });
      }
    });
  }

  onChange = (value, selectedOptions) => {
    this.setState({
      cascaderValue: value
    });
  };

  loadData = (selectedOptions) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    if (targetOption) {
      let code = targetOption.value;
      let type = targetOption.type;
      let children = targetOption.children;
      if (!children || children.length === 0) {
        targetOption.loading = true;
        if (type === "province") {
          areaSearchAction
            .getCity(code)
            .then((res) => {
              targetOption.loading = false;
              if (res && res.code === "0") {
                let cityOptions = [];
                res.data.forEach((item) => {
                  let option = {
                    value: item.code,
                    label: item.name,
                    type: "city",
                    isLeaf: false,
                  };
                  cityOptions.push(option);
                });
                targetOption.children = cityOptions;
                this.setState({
                  cascaderOptions: [...this.state.cascaderOptions],
                  popupVisible: true,
                });
              }
            })
            .catch((e) => {
              message.error(e.message);
            });
        }
        if (type === "city") {
          areaSearchAction.getDistrict(code).then((res) => {
            targetOption.loading = false;
            if (res && res.code === "0") {
              let districtOptions = [];
              res.data.forEach((item) => {
                let option = {
                  value: item.code,
                  label: item.name,
                  type: "district",
                };
                districtOptions.push(option);
              });
              targetOption.children = districtOptions;
              this.setState({
                cascaderOptions: [...this.state.cascaderOptions],
                popupVisible: true,
              });
            }
          });
        }
      }
    }
  };

  displayRender = (label) => {
    return label[label.length - 1];
  };

  render() {
    return (
      <Cascader
        allowClear={false}
        // changeOnSelect={true}
        placeholder="请选择"
        expandTrigger="click"
        defaultValue={["0000000"]}
        options={this.state.cascaderOptions}
        onChange={this.onChange}
        loadData={this.loadData}
        value={this.state.cascaderValue}
        displayRender={this.displayRender}
        // popupVisible={this.state.popupVisible}
      ></Cascader>
    );
  }
}
