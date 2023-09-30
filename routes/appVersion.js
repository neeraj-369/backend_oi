const express = require("express");
const router = express.Router();
const User = require("../model/User");
const Application = require("../model/Application");
const Version = require("../model/Version");
const { default: mongoose } = require("mongoose");
const fetcher = require('./fetcher');
const k8s = require("@kubernetes/client-node");
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

var mmDeployment = {
  apiVersion: "apps/v1",
  kind: "Deployment",
  metadata: {
    name: "mm-deployment",
    labels: {
      app: "mm",
    },
  },
  spec: {
    replicas: 1,
    selector: {
      matchLabels: {
        app: "mm",
      },
    },
    template: {
      metadata: {
        labels: {
          app: "mm",
        },
      },
      spec: {
        containers: [
          {
            name: "mm-containers",
            image: "neerajpolavarapu/match:mo",
            imagePullPolicy: "Always",
            args: [
              "coturn.tenant-74334f-oidev.lga1.ingress.coreweave.cloud:3478",
              "PixelStreamingUser",
              "AnotherTURNintheroad",
              "neeraj",
              "gaddamvinay/repo:finalgame",
            ],
            ports: [
              {
                containerPort: 9999,
                protocol: "TCP",
              },
              {
                containerPort: 90,
                protocol: "TCP",
              },
              {
                containerPort: 9999,
                protocol: "UDP",
              },
              {
                containerPort: 90,
                protocol: "UDP",
              },
            ],
          },
        ],
      },
    },
  },
};
const kc = new k8s.KubeConfig();
kc.loadFromString(kubeconfigText);


router.get("/:applicationId", async (req, res) => {
    try {
      const applicationID = req.params.applicationId;
      const application = await Application.findById(applicationID).populate('versions', 'versionname registry createdAt link');
      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }
      const activeVersionID = application.activeversion;
      const responseArray = application.versions.map(version => {
        const formattedCreatedAt = new Date(version.createdAt).toLocaleString('en-IN', {
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            timeZoneName: 'short',
          });
        return {
          ApplicationName: application.name,
          versionname: version.versionname,
          registry: version.registry,
          createdAt: formattedCreatedAt,
          bool: version._id.equals(activeVersionID),
        };
      });
      return res.json(responseArray);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
router.post("/createversion", async (req, res) => {
    Bname = req.body.name;
    Bregistry = req.body.registry;
    console.log("Have to create Version with name appname: " + Bname + " and registry: " + Bregistry);
    Application.findOne({ name: Bname})
    .populate('versions')
    .then((existingModel) => {
        if (!existingModel) {
            return res.status(404).json({ error: "Application not found" });
        }
        const latestVersion = existingModel.versions.length > 0
        ? existingModel.versions[existingModel.versions.length - 1].versionname
        : 0;
        const newVersionNumber = parseInt(latestVersion) + 1;
        const newVersionName = `${newVersionNumber}`;
        const newVersion = new Version({
            versionname: newVersionName,
            registry: Bregistry,
            link: "matchmaking" +
            "-" +
            req.body.name +
            ".tenant-74334f-oidev.lga1.ingress.coreweave.cloud",
            createdAt: Date.now(),
          });
          console.log("trying to create version with"+newVersion);
          newVersion.save()
          .then((createdVersion) => {
            console.log("Version created successfully   4"+ createdVersion);
            existingModel.versions.push(createdVersion._id);
            existingModel.activeversion = createdVersion._id;
            existingModel.save()
            .then(() => {
                console.log("Application model updated with new version");
                res.json({ message: "Version created and Application model updated successfully" });
              })
              .catch((error) => {
                console.error("Error updating Application model: ", error);
                res.status(500).json({ error: "Error updating Application model" });
              });
          })
          .catch((error) => {
            console.error("Error creating version: ", error);
            res.status(500).json({ error: "Error creating version" });
          });
    })
    .catch((error) => {
        console.error("Error finding application: ", error);
        res.status(500).json({ error: "Error finding application" });
      });
});


router.delete("/deleteversion", async (req, res) => {
    const { applicationName, versionName } = req.body;
    try {
      console.log("Here" + applicationName + " " + typeof versionName);
      const application = await Application.findOne({ name: applicationName });
      if (!application) {
        console.log("Here Application not found");
        return res.status(404).json({ message: 'Application not found.' });
      }
        let versionToDelete;
        for (const version of application.versions) {
            console.log(version + "    given here is       ---------")
            const versionObj = await Version.findById(version);
        if (versionObj.versionname === versionName) {
            versionToDelete = version;
            break;
        }
        }
      console.log("Here version is" + versionToDelete);
      if (!versionToDelete) {
        console.log("Version not found");
        return res.status(404).json({ message: 'Version not found.' });
      }
      if (application.activeversion && application.activeversion.equals(versionToDelete._id)) {
        console.log("Active version cannot be deleted");
        return res.status(400).json({ message: 'Active version cannot be deleted.' });
      }
      await Version.findByIdAndDelete(versionToDelete._id);
      application.versions.pull(versionToDelete._id);
      await application.save();
      res.json({ message: 'Version deleted successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });


  router.post('/activate', async (req, res) => {
    try {
      const { applicationName, versionName } = req.body;
  
      // Find the application with the provided name
      const application = await Application.findOne({ name: applicationName });
  
      if (!application) {
        return res.status(404).json({ error: 'Application not found.' });
      }
  
      // Find the version with the provided versionName
      const version = await Version.findOne({ versionname: versionName });
  
      if (!version) {
        return res.status(404).json({ error: 'Version not found.' });
      }
      const registrylink = version.registry;
      var name = applicationName;
      const tenantname = "tenant-74334f-oidev";
      var deploymentNamei = "mm-deployment" + "-" + name;
      var serviceNamei = "mm-service" + "-" + name;
      var ingressNameis = "mm-ingress" + + "-" + name;
      var filteredDeploymentNamesList = null;

    console.log("arrived at instances of application deletion in  backend : " + name);
    fetcher.fetchDeployments(name, (error, filteredDeploymentNames) => {
    if (error) {
      console.error('Error:', error);
    } else {
    console.log("application sending deployment names - middleware")
    filteredDeploymentNamesList = filteredDeploymentNames;
    filteredDeploymentNamesList.forEach(deploymentName => {
            var hash = deploymentName;

            var deploymentNamei = name + "-app-" + hash;
            var serviceNamei = "app-service-" + hash;
            var ingressNamei  = "app-ingress-" + hash;
            var podNamei = "pixel-streaming-pod-" + hash;

            console.log("while deleting application : " + hash)
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
    }
  });


    mmDeployment.metadata.name = "mm-deployment" + "-" + name;
    mmDeployment.metadata.labels.app = "mm" + "-" + name;
    mmDeployment.spec.selector.matchLabels.app = "mm" + "-" + name;
    mmDeployment.spec.template.metadata.labels.app =
      "mm" + "-" + name;
    mmDeployment.spec.template.spec.containers[0].name =
      "mm-containers" + "-" + name;
    mmDeployment.spec.template.spec.containers[0].args[3] = name;
    if (registrylink!= undefined)
      mmDeployment.spec.template.spec.containers[0].args[4] = registrylink;


    var shit = "mm-deployment" + "-" + name;
    const k8sApi2 = kc.makeApiClient(k8s.AppsV1Api);
    k8sApi2
      .deleteNamespacedDeployment(shit, tenantname)
      .then(() => {
        console.log(`Deleted deployment: ${shit}`);
      })
      .catch((error) => {
        console.error(`Error deleting deployment: ${error}`);
      });

      const k8sApia = kc.makeApiClient(k8s.AppsV1Api);
      k8sApia.createNamespacedDeployment(tenantname, mmDeployment);
    // const k8sApi3 = kc.makeApiClient(k8s.CoreV1Api);
    // k8sApi3
    //   .deleteNamespacedService(serviceNamei, tenantname)
    //   .then(() => {
    //     console.log(`Deleted service: ${serviceNamei}`);
    //   })
    //   .catch((error) => {
    //     console.error(`Error deleting service: ${error}`);
    //   });
    // const k8sApi4 = kc.makeApiClient(k8s.NetworkingV1Api);
    // k8sApi4
    //   .deleteNamespacedIngress(ingressNameis, tenantname)
    //   .then(() => {
    //       console.log(`Deleted ingress: ${ingressNamei}`);
    //   })
    //   .catch((error) => {
    //       console.error(`Error deleting ingress: ${error}`);
    //   });
    





      

      // Update the active version with the provided versionId
      application.activeversion = version._id;
      await application.save();
  
      res.json({ message: 'Version activated successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  


module.exports = router;