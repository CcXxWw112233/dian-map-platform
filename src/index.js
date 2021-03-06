import dva from "dva";
import "./index.less";
import "./utils/functionForFlutter/publicFuncForFlutter";
import models from './models'

require("polyfill");

// 1. Initialize
const app = dva({
  // history: createHistory(),
});

// 2. Plugins
// app.use({});

// 3. Model
models.forEach(model => {
  app.model(model)
})
// app.model(require('./models/example').default);
// app.model(require("./models/user").default);
// app.model(require("./models/maps").default);
// app.model(require("./models/overlay").default);
// app.model(require("./models/controller").default);
// app.model(require("./models/lengedList").default);
// app.model(require("./models/openSwitch").default);
// app.model(require("./models/modal").default);
// app.model(require("./models/uploadNormal").default);
// app.model(require("./models/plotting").default);
// app.model(require("./models/featureOperatorList").default);
// app.model(require("./models/tempPlotting").default);
// app.model(require("./models/publicMapData").default);
// app.model(require("./models/scoutingProject").default);
// app.model(require("./models/flutterPage").default);
// app.model(require("./models/editPicture").default);
// app.model(require("./models/areaSearch").default);
// app.model(require("./models/collectionDetail").default);
// app.model(require("./models/scoutingDetail").default);
// app.model(require("./models/publicDataLink").default);
// app.model(require("./models/permission").default);
// app.model(require("./models/meetingSubscribe").default);
// 4. Router
app.router(require("./router").default);

// 5. Start
app.start("#root");
