import React from "react";
import { Router, Route, Switch } from "dva/router";
import dynamic from "dva/dynamic";

const IndexPage = () => import("./routes/IndexPage");
const Login = () => import("./routes/Login");

function RouterConfig({ history, app }) {
  const routes = [
    {
      path: "/home",
      component: IndexPage,
    },
    {
      path: "/login",
      component: Login,
    },
  ];
  return (
    <Router history={history}>
      <Switch>
        {routes.map(({ path, ...dynamics }, key) => {
          return (
            <Route
              key={key}
              exact
              path={path}
              component={dynamic({
                app,
                ...dynamics,
              })}
            />
          );
        })}
        <Route path="*" component={IndexPage}></Route>
        {/*  <Route path="/" exact component={IndexPage} /> */}
      </Switch>
    </Router>
  );
}

export default RouterConfig;
