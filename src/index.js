import dva from 'dva';
import './index.less';
import './utils/publicFuncForFlutter'

// 1. Initialize
const app = dva();

// 2. Plugins
// app.use({});

// 3. Model
// app.model(require('./models/example').default);
app.model(require('./models/maps').default)
app.model(require('./models/overlay').default)
app.model(require('./models/controller').default)
app.model(require('./models/lengedList').default)
app.model(require('./models/openSwitch').default)
// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');
