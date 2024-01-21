const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const WebSocket = require('ws');
// const AppRoutes = require('./routes/appRouter');
// const versionRoutes = require('./routes/versionRouter');
const testRoutes = require('./routes/testRoute');
const appVersion = require('./routes/appVersion');
const versionRouter = require('./routes/versionRouter');
const authorization = require('./routes/loginRegister');
const dashboard = require('./routes/dashboard');
const http = require('http');
const logRoute = require('./routes/logRoute');
const { mongoose } = require('mongoose');
dotenv.config();
const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const { KubeConfig, CoreV1Api } = require('@kubernetes/client-node');
const kubeconfigText = `
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUMvVENDQWVXZ0F3SUJBZ0lSQU9aYmIxbVZkUk5pbkVZd05aR3d5TGd3RFFZSktvWklodmNOQVFFTEJRQXcKR0RFV01CUUdBMVVFQXhNTlkyOXlaWGRsWVhabExtTnZiVEFlRncweU1UQTRNall3TURNeU1qWmFGdzB6TVRBNApNall4TWpNeU1qWmFNQmd4RmpBVUJnTlZCQU1URFdOdmNtVjNaV0YyWlM1amIyMHdnZ0VpTUEwR0NTcUdTSWIzCkRRRUJBUVVBQTRJQkR3QXdnZ0VLQW9JQkFRRFkra0FTSzFOZFdwNW5XdExBN05mSS9rc3k0cU9mOWVZRGNxb00KemppODFHQUJlenNFSjBFc1NVclhpSUd6Z29TYkV3L1BKQXZDZGRURXRlTWQ0RU93NnNTVWU4SFFHV1dxcTBmVgpvdzMwanJQcWxramEzSmZhWWJMWi9Pc3A2enZXbml3eXNTVmJlQmJFTlFFL2RuVDN4UmdTTFl3TlJGcDcwZnU1CkJqbW9MZjhjYzdFMlp0TkF1cHRRVUJiMzdLSnlJYlJYOTdnV3B0QnJPOXN0ZWFTMUkwcGNTSHBvYWFBYzBIbGgKYkRNZTQyYkxFbjFkQ0tud1ZEWnBRSVAvTFc0UGM4NmEvYTJDZzZnMmJCcWhTWFFPNzBybHZ0aXVGYmwrTDZoRApxZU14ckl5MmR1MWE1VU9HcU9iTDkwczIxVE0vR3F5MTRaQU1ndVhsTFlCajVIWi9BZ01CQUFHalFqQkFNQTRHCkExVWREd0VCL3dRRUF3SUNwREFQQmdOVkhSTUJBZjhFQlRBREFRSC9NQjBHQTFVZERnUVdCQlNKTUpNUDJnOHAKeGxUelB4Ulp4cFkyZEFOMVVUQU5CZ2txaGtpRzl3MEJBUXNGQUFPQ0FRRUFEQWYxb3R2Y1FzZjZVODN2b0RvSAo3ZVhnSUdPUVZoMzh6VlgwSzh5cUV1ampjcDRZZ0o2OXJoektsQ3A3SGlMZEdzV3dmRkc3b25NeUtxYUNHSWJnCmFHc1NzVU9nOHhxelJ1UEpJU2RDa3B6VVdualNmRW03dU5vRlJJd0x6UHFmZ2IrWnJRNEdSaGFQMkxudkFKZ1oKbVNCczZMeDdGWnk0R2xYdlQ1QUhaMnNvSHdSMnNONEFqNjdkcHFzVk80QUcyZk0remg5MGZHTkRhSWxVeFVySwoxNGlUVW9IUVVlU2FhcTIrdkdWYmhlK2lOVW9DNTVmV29oL2svVm1PSVdyRnFwTW5IeFdKditHakRTZ3Q0WldWCk1qTVdCNFZsbWlCbmpEM25ib0dZVHJGVXd5M21GV2hnejNIanpRNzF2bDVlTnFaRzFtVGwycTRFUTBScE5Sd1kKRGc9PQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==
    server: https://k8s.ord1.coreweave.com
  name: coreweave
contexts:
- context:
    cluster: coreweave
    namespace: tenant-74334f-oidev
    user: token-Kkn7HYfPzuXKApoTiaMk
  name: coreweave
current-context: coreweave
kind: Config
users:
- name: token-Kkn7HYfPzuXKApoTiaMk
  user:
    token: CHtnnc6xgtrQGH9pQ2P9cngsDCdzjpdQmfV7kF9C
`;

// Replace these with your Kubernetes cluster configuration details
const kubeConfig = new KubeConfig();
kubeConfig.loadFromString(kubeconfigText);
const coreV1Api = kubeConfig.makeApiClient(CoreV1Api);
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
// app.use('/logs', logRoute);

app.get('/',(req,res) => {
    res.send('Server is ready')
})

wss.on('connection', (ws, req) => {
  // Extract the pod name from the request path
  const path = req.url.split('/');
  console.log("here");
  // if (path.length !== 4 || path[1] !== 'logs') {
  //   // If the path is not in the expected format, close the WebSocket connection
  //   ws.close(4000, 'Invalid path');
  //   return;
  // }
  const podName = path[2]; // Assuming the path is in the format /logs/pod_name

  // Fetch logs for the specified pod
  const namespace = 'tenant-74334f-oidev'; // Replace with your actual namespace

  // Function to periodically fetch logs and send to the WebSocket
  const fetchAndSendLogs = () => {
    coreV1Api.readNamespacedPodLog(podName, namespace, { tailLines: 10 })
      .then((response) => {
        ws.send(response.body);
      })
      .catch((err) => {
        if (err.statusCode) {
          if (err.statusCode === 404) {
            // Pod not found, send a creating message
            ws.send('Pod is creating...');
          } else if (err.statusCode === 400) {
            // Handle other specific status codes as needed
            ws.send('Pod is creating...');
          } else {
            console.error('Error fetching pod logs:', err);
          }
        } else {
          console.error('Error fetching pod logs:', err);
        }
      });
  };

  // Fetch logs every second and send to the WebSocket
  const timeperiod = 4000;
  const logFetchInterval = setInterval(fetchAndSendLogs, timeperiod);

  // Handle WebSocket connection closure
  ws.on('close', () => {
    console.log('WebSocket connection closed.');
    clearInterval(logFetchInterval); // Clear the interval when WebSocket connection is closed
  });
});
const { MongoClient, ServerApiVersion } = require('mongodb');
MONGO_URL = "mongodb+srv://oistream:H8sVnAHkfo0k5V11@oistream.fda4hmn.mongodb.net/?retryWrites=true&w=majority"
const uri = MONGO_URL;
mongoose.connect(uri)
  .then(()=> console.log('You successfully connected to MongoDB!!!!.........'))
  .catch(err => console.log(err));
server.listen(port,() => {console.log(`Server started on Port ${port}`)})
