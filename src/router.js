import React from "react";
import { Router, Route, Switch } from "dva/router";
import dynamic from "dva/dynamic";
// import Index from "./routes/Index";

const RedirectComp = () => import("./routes/RedirectComp");
const Login = () => import("./routes/Login");
const Index = () => import("./routes/Index");

function RouterConfig({ history, app }) {
  const routes = [
    {
      path: "/home",
      component: Index
    },
    {
      path: "/login",
      component: Login
    },
    {
      path: "*",
      component: RedirectComp
    }
  ];
  return (
    <Router history={history}>
      <Switch>
        {routes.map(({ path, ...dynamics }, key) => {
          return (
            <Route
              key={key}
              // exact={path === "/"}
              path={path}
              component={dynamic({
                app,
                ...dynamics
              })}
            />
          );
        })}
        {/*  <Route path="/" exact component={IndexPage} /> */}
      </Switch>
    </Router>
  );
}

export default RouterConfig;
