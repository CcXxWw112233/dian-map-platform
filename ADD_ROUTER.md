路由变化 1.新增/home, /login 路由，/home 为主界面
2.browserhistory 模式变为 hashhistory

数据存取 
1.新增 model/user，用于存储用户，组织等信息
2.token 存在 cookie 中
3.orgId 存在 sessionStorage(兼容以前方法过多转换写法)。
4.model 的 user 中也保存 orgId，期望以后方法中可以从 model/user中取 orgId

业务逻辑变化 
1. ENTRANCE_MODE_IFRAME（全局定义）代表入口是内嵌还是独立进去，做兼容处理。
2.上方头像没有权限不显示，改为有无权限都显示 。
3.点击用户界面，增加组织切换和退出登录。
4.组织切换在相应要更新数据的组件中调用componentWillReceiveProps， 判断currentOrganizeId变化调用数据更新

antd ui兼容
1.去掉Space组件, Icon的引入方式
