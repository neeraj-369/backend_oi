const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
// const AppRoutes = require('./routes/appRouter');
// const versionRoutes = require('./routes/versionRouter');
const testRoutes = require('./routes/testRoute');
const appVersion = require('./routes/appVersion');
const versionRouter = require('./routes/versionRouter');
const authorization = require('./routes/loginRegister');
const dashboard = require('./routes/dashboard');
const logRoute = require('./routes/logRoute');
const { mongoose } = require('mongoose');
dotenv.config();
const port = process.env.PORT || 5000;
const app = express();
app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
//config.EnableCors(new EnableCorsAttribute(Properties.Settings.Default.Cors, "", ""))
//app.UseCors(CorsOptions.AllowAll);
//app.use(cors({
// origin : 'http://localhost:3000',
//}));
console.log("reached begining");
//app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // or '*' for any origin
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
console.log("reached end");
// app.use('/app', AppRoutes);
// app.use('/version', versionRoutes);

app.use('/test', testRoutes);
app.use('/appversion',appVersion);
app.use('/version',versionRouter);
app.use('/authorization',authorization);
app.use('/dashb',dashboard);
app.use('/logs', logRoute);

app.get('/',(req,res) => {
    res.send('Server is ready')
})
const { MongoClient, ServerApiVersion } = require('mongodb');
MONGO_URL = "mongodb+srv://oistream:H8sVnAHkfo0k5V11@oistream.fda4hmn.mongodb.net/?retryWrites=true&w=majority"
const uri = MONGO_URL;
mongoose.connect(uri)
  .then(()=> console.log('You successfully connected to MongoDB!!!!.........'))
  .catch(err => console.log(err));
app.listen(port,() => {console.log(`Server started on Port ${port}`)})
