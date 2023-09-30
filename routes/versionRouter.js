const express = require('express');
// const VersionModel = require('../model/verModel');
const fetcher = require('./fetcher');
const router = express.Router();
const k8s = require('@kubernetes/client-node');
const _ = require('lodash');
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
const kc = new k8s.KubeConfig();
kc.loadFromString(kubeconfigText);
const tenantname = "tenant-74334f-oidev";


router.get('/deployments/:name', (req, res) => {
    const { name } = req.params;
    console.log("arrived at instances backend : " + name);
    fetcher.fetchDeployments(name, (error, filteredDeploymentNames) => {
    if (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
    console.log("sending deployment names - middleware")
      res.json({ deployments: filteredDeploymentNames });
    }
  });
  });

router.delete('/deleted',(req,res)=>{
    const {deploymentk , appname} = req.body;
    console.log("Entered Delete of deployment with name : "+ deploymentk + " and hash " + appname);
    var hash = deploymentk;
    var name = appname;
    var deploymentNamei = name + "-app-" + hash;
    var serviceNamei = "app-service-" + hash;
    var ingressNamei  = "app-ingress-" + hash;
    var podNamei = "pixel-streaming-pod-" + hash;
    
    const k8sApi1 = kc.makeApiClient(k8s.CoreV1Api);
    k8sApi1
      .deleteNamespacedPod(podNamei, tenantname)
      .then(() => {
        console.log(`Deleted Pod: ${podNamei}`);
      })
      .catch((error) => {
        console.error(`Error deleting Pod: ${error}`);
      });
    
    const k8sApi2 = kc.makeApiClient(k8s.AppsV1Api);
    k8sApi2
      .deleteNamespacedDeployment(deploymentNamei, tenantname)
      .then(() => {
        console.log(`Deleted deployment: ${deploymentNamei}`);
      })
      .catch((error) => {
        console.error(`Error deleting deployment: ${error}`);
      });
    
    const k8sApi3 = kc.makeApiClient(k8s.CoreV1Api);
    k8sApi3
      .deleteNamespacedService(serviceNamei, tenantname)
      .then(() => {
        console.log(`Deleted service: ${serviceNamei}`);
      })
      .catch((error) => {
        console.error(`Error deleting service: ${error}`);
      });
    const k8sApi4 = kc.makeApiClient(k8s.NetworkingV1Api);
    k8sApi4
      .deleteNamespacedIngress(ingressNamei, tenantname)
      .then(() => {
        console.log(`Deleted ingress: ${ingressNamei}`);
      })
      .catch((error) => {
        console.error(`Error deleting ingress: ${error}`);
    });
    
    
});
// router.get('/', async (req, res) => {
//     const versions = await VersionModel.find();
//     res.json(versions);
// });
// router.get('/:id', async (req, res) => {
//     const version = await VersionModel.findById(req.params.id);
//     res.json(version);
// });
// router.delete('/:id', async (req, res) => {
//     await VersionModel.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Version Deleted' });
// });
// router.put('/:id', async (req, res) => {
//     const { name, active, ContainerTag, Registry, Username, Password } = req.body;
//     const newVersion = { name, active, ContainerTag, Registry, Username, Password };
//     console.log("New Version", newVersion);
//     try {
//         let updatedVersion = await VersionModel.findOneAndUpdate({
//             "_id": ObjectId(req.
//                 params.id)
//         }, { $set: newVersion }, { new: true });
//         res.json(updatedVersion);
//     }
//     catch (err) {
//         console.log(err);
//     }
// });
// router.post('/', async (req, res) => {
//     const newVersion = new VersionModel({
//         name: req.body.name,
//         active: req.body.active,
//         ContainerTag: req.body.ContainerTag,
//         Registry: req.body.Registry,
//         Username: req.body.Username,
//         Password: req.body.Password,
//     });
//     await newVersion.save()
//         .then(newVersion => res.json(newVersion))
//         .catch(err => console.error());
// });
module.exports = router;
