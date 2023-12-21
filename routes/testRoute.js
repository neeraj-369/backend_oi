const express = require("express");
const router = express.Router();
const User = require("../model/User");
const Application = require("../model/Application");
const Version = require("../model/Version");
const fetcher = require('./fetcher');
const { default: mongoose } = require("mongoose");
const k8s = require("@kubernetes/client-node");
const fs = require('fs');
const crypto = require('crypto');
const AWS = require('aws-sdk');
const randomFloat = Math.random().toString();

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
            image: "streamoi/match:mo",
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

var mmIngress = {
  apiVersion: "networking.k8s.io/v1",
  kind: "Ingress",
  metadata: {
    name: "mm-ingress",
    annotations: {
      'kubernetes.io/ingress.class': 'traefik',
      'nginx.ingress.kubernetes.io/rewrite-target': '/',
      'traefik.ingress.kubernetes.io/router.middlewares': 'tenant-74334f-oidev-redirect-secure@kubernetescrd',
      'cert-manager.io/cluster-issuer': 'letsencrypt-prod'
      },
  },
  spec: {
	  tls: [
      {
        hosts: ['matchmaking.tenant-74334f-oidev.lga1.ingress.coreweave.cloud'],
        secretName: 'redirect-secure-ssl',
      },
    ],
    rules: [
      {
        host: "matchmaking.tenant-74334f-oidev.lga1.ingress.coreweave.cloud",
        http: {
          paths: [
            {
              path: "/",
              pathType: "Prefix",
              backend: {
                service: {
                  name: "mm-service",
                  port: {
                    number: 90,
                  },
                },
              },
            },
          ],
        },
      },
    ],
  },
};

var jsonMiddleware = {
	apiVersion: 'traefik.containo.us/v1alpha1',
	kind: 'Middleware',
	metadata: {
	  name: 'redirect-secure',
	  namespace: 'tenant-74334f-oidev',
	},
	spec: {
	  redirectScheme: {
		regex: '^http://(.*)',
		replacement: 'https://${1}',
	  },
	},
  };

var mmService = {
  apiVersion: "v1",
  kind: "Service",
  metadata: {
    name: "mm-service",
  },
  spec: {
    selector: {
      app: "mm",
    },
    ports: [
      {
        name: "backend-port-tcp",
        protocol: "TCP",
        port: 9999,
        targetPort: 9999,
      },
      {
        name: "backend-port-udp",
        protocol: "UDP",
        port: 9999,
        targetPort: 9999,
      },
      {
        name: "frontend-port-tcp",
        protocol: "TCP",
        port: 90,
        targetPort: 90,
      },
      {
        name: "frontend-port-udp",
        protocol: "UDP",
        port: 90,
        targetPort: 90,
      },
    ],
    type: "ClusterIP",
  },
};

// var kanikoPod = {
//   apiVersion: "batch/v1",
//   kind: "Job",
//   metadata: {
//     name: "kaniko",
//   },
//   spec: {
//     template: {
//       spec: {
//         containers: [
//           {
//             name: "kaniko",
//             image: "gcr.io/kaniko-project/executor:latest",
//             args: [
//               "--dockerfile=tpp/Dockerfile",
//               "--context=s3://letsfindsolutions-fileupload2/tpp.tar.gz",
//               "--destination=gaddamvinay/repo:",
//             ],
//             env: [
//               {
//                 name: "AWS_SHARED_CREDENTIALS_FILE",
//                 value: "/kaniko/.docker/aws/credentials",
//               },
//               {
//                 name: "AWS_DEFAULT_REGION",
//                 value: "ap-south-1",
//               },
//               {
//                 name: "AWS_ACCESS_KEY_ID",
//                 value: "AKIAVDWPRTUWE2NE25UQ",
//               },
//               {
//                 name: "AWS_SECRET_ACCESS_KEY",
//                 value: "zvUzf+hq0b9/gX2fEsYmHT6A9UEWYh+/k7M7Dq9w",
//               },
//             ],
//             volumeMounts: [
//               {
//                 name: "docker-registry-secret",
//                 mountPath: "/kaniko/.docker",
//               },
//               {
//                 name: "aws-credentials",
//                 mountPath: "/kaniko/.docker/aws",
//               },
//             ],
//           },
//         ],
//         volumes: [
//           {
//             name: "docker-registry-secret",
//             secret: {
//               secretName: "dockerhub-g",
//             },
//           },
//           {
//             name: "aws-credentials",
//             secret: {
//               secretName: "aws-credentials",
//             },
//           },
//         ],
//         restartPolicy: "Never", // Job Pods should not restart
//       },
//     },
//     backoffLimit: 0, // Number of retries, set to 0 for no retries
//   },
// };

var kanikoPod = {
  apiVersion: "v1",
  kind: "Pod",
  metadata: {
    name: "kaniko",
  },
  spec: {
    containers: [
      {
        name: "kaniko",
        image: "gcr.io/kaniko-project/executor:latest",
        args: [
          "--dockerfile=tpp/Dockerfile",
          "--context=s3://letsfindsolutions-fileupload2/tpp.tar.gz",
          "--destination=gaddamvinay/repo:simple"
        ],
        env: [
          {
            name: "AWS_SHARED_CREDENTIALS_FILE",
            value: "/kaniko/.docker/aws/credentials",
          },
          {
            name: "AWS_DEFAULT_REGION",
            value: "ap-south-1",
          },
          {
            name: "AWS_ACCESS_KEY_ID",
            value: "AKIAVDWPRTUWE2NE25UQ",
          },
          {
            name: "AWS_SECRET_ACCESS_KEY",
            value: "zvUzf+hq0b9/gX2fEsYmHT6A9UEWYh+/k7M7Dq9w",
          },
        ],
        volumeMounts: [
          {
            name: "docker-registry-secret",
            mountPath: "/kaniko/.docker",
          },
          {
            name: "aws-credentials",
            mountPath: "/kaniko/.docker/aws",
          },
        ],
      },
    ],
    restartPolicy: "Never",
    volumes: [
      {
        name: "docker-registry-secret",
        secret: {
          secretName: "dockerhub-g",
        },
      },
      {
        name: "aws-credentials",
        secret: {
          secretName: "aws-credentials",
        },
      },
    ],
  },
};

function generateUniqueHash(data) {
  const hash = crypto.createHash('sha256'); // You can choose a different algorithm if needed
  hash.update(data);
  return hash.digest('hex'); // 'hex' output format will give you a hexadecimal string
}

function getRandomIntAsString(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  const randomInt = Math.floor(Math.random() * (max - min)) + min;
  return randomInt.toString();
}


const namespace = "tenant-74334f-oidev";
const k8sApiff = kc.makeApiClient(k8s.CoreV1Api);
async function checkPodStatus(podNamess) {
  let completed = false;
  
  while (!completed) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      // fs.appendFile("logs.txt", `Reached here after status first\n`, () => {});
      const response = await k8sApiff.readNamespacedPodStatus(podNamess, namespace);
      // fs.appendFile("logs.txt", `Reached here after status second\n`, () => {});
      const phase = response.body.status.phase;
      fs.appendFile("logs.txt", `${phase}\n`, () => {});
      if (phase === 'Succeeded') {
        // console.log("reached here");
        completed = true;
      } else if (phase === 'Failed' || phase === 'Unknown') {
        fs.appendFile("logs.txt", `Pod ${podNamess} has failed or is in an unknown state.\n`, () => {});
        break; // Exit the loop if the Pod is in a failed or unknown state
      }
    } catch (error) {
      fs.appendFile("logs.txt", `Error: ${error}\n`, () => {});
      break; // Exit the loop in case of an error
    }

    // Wait for a few seconds before checking again (adjust the interval as needed)
  }
}


// Now you have the Kaniko Deployment configuration as a JSON variable.

router.post("/checkename", (req, res) => {
  Bname = req.body.name;
  if(Bname === "")
  {
    res.status(403).json({ message: "Enter Proper Application Name"});
  }
  Application.findOne({ name: Bname})
  .then((existingModel) => {
    if (existingModel) {
      console.log("Application with that already exists");
      return res.status(400).json({ error: "Name already exists" });
    } else {
      res.status(200).json({ message: "You can proceed with the Application Name"});
    }
})
});

router.post("/create", (req, res) => {
  Bname = req.body.name;
  Bregistry = req.body.registry;
  filename = req.body.filename;
  console.log("Here at top , Error has ",Bregistry);
  const min = 1; // Minimum value (inclusive)
  const max = 100; // Maximum value (exclusive)
  const randomInt = getRandomIntAsString(min, max);
  if(req.body.registry == "kanikonoregistry"){ 
    fs.writeFile("logs.txt", "", () => {});
    kanikoPod.metadata.name = "kaniko" + randomInt;
    kanikoPod.spec.containers[0].args[0] = "--dockerfile=" + req.body.filename + "/Dockerfile";
    kanikoPod.spec.containers[0].args[1] = "--context=s3://letsfindsolutions-fileupload2/" + req.body.filename + ".tar.gz";
    kanikoPod.spec.containers[0].args[2] = "--destination=gaddamvinay/repo:" + req.body.name;
    Bregistry = "gaddamvinay/repo:" + req.body.name;
    k8sApiff.createNamespacedPod(namespace, kanikoPod);
    // res.status(201).json({ message: "hello"});
    checkPodStatus(kanikoPod.metadata.name).then(() => {
      fs.appendFile("logs.txt", "Reached here finally\n", (err) => {});
      k8sApiff.deleteNamespacedPod(kanikoPod.metadata.name, namespace);
      const awsConfig = {
        accessKeyId: "AKIAVDWPRTUWE2NE25UQ",
        secretAccessKey: "zvUzf+hq0b9/gX2fEsYmHT6A9UEWYh+/k7M7Dq9w",
        region: 'ap-south-1', // Change to your desired AWS region
      };
      
      // Create an S3 client
      const s3 = new AWS.S3(awsConfig);
      
      // Specify the bucket name and the key (file path) of the file you want to delete
      const bucketName = "letsfindsolutions-fileupload2";
      const key = req.body.filename + ".tar.gz";
      
      // Define the parameters for the delete operation
      const params = {
        Bucket: bucketName,
        Key: key,
      };
      
      // Call the deleteObject method to delete the file
      s3.deleteObject(params, (err, data) => {
        if (err) {
          console.error(`Error deleting file: ${err}`);
        } else {
          console.log(`File deleted successfully`);
        }``
      });
      Application.findOne({ name: Bname})
      .then((existingModel) => {
        if (existingModel) {
          console.log("Application with that already exists");
          return res.status(400).json({ error: "Name already exists" });
        } else {
          const newVersion = new Version({
            versionname: "0",
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
              const newApplication = new Application({
                name: Bname, 
                versions: [createdVersion._id],
                activeversion: createdVersion._id,
              });
              console.log("trying to create application with"+newApplication);
              newApplication.save()
                .then(() => {
                  console.log("Application created successfully   3");
                  res.status(201).json({ message: Bname });
                })
                .catch((err) => {
                  console.log("Failed to create application   2"+ err);
                  res.status(500).json({ error: "Failed to create application" });
                });
            })
            .catch((err) => {
              console.log("Failed to create version  100");
              res.status(500).json({ error: "Failed to create version" });
            });
          const deployname = Bname;
          const registryname = Bregistry;
          mmDeployment.metadata.name = "mm-deployment" + "-" + deployname;
          mmDeployment.metadata.labels.app = "mm" + "-" + deployname;
          mmDeployment.spec.selector.matchLabels.app = "mm" + "-" + deployname;
          mmDeployment.spec.template.metadata.labels.app =
            "mm" + "-" + deployname;
          mmDeployment.spec.template.spec.containers[0].name =
            "mm-containers" + "-" + deployname;
          mmDeployment.spec.template.spec.containers[0].args[3] = deployname;
          if (registryname!= undefined)
            mmDeployment.spec.template.spec.containers[0].args[4] = registryname;
          mmIngress.metadata.name = "mm-ingress" + "-" + deployname;
          mmIngress.spec.tls[0].hosts[0] = "matchmaking" + "-" + deployname + ".tenant-74334f-oidev.lga1.ingress.coreweave.cloud";
          mmIngress.spec.rules[0].host = "matchmaking" + "-" + deployname + ".tenant-74334f-oidev.lga1.ingress.coreweave.cloud";
          mmIngress.spec.rules[0].http.paths[0].backend.service.name = "mm-service" + "-" + deployname;
          mmService.metadata.name = "mm-service" + "-" + deployname;
          mmService.spec.selector.app = "mm" + "-" + deployname;
          const k8sApia = kc.makeApiClient(k8s.AppsV1Api);
          k8sApia.createNamespacedDeployment(namespace, mmDeployment);
          const k8sApib = kc.makeApiClient(k8s.CoreV1Api);
          k8sApib.createNamespacedService(namespace, mmService);
          const k8sApic = kc.makeApiClient(k8s.NetworkingV1Api);
          k8sApic.createNamespacedIngress(namespace, mmIngress);
          const middlewareApi = kc.makeApiClient(k8s.TraefikV1alpha1Api);
          middlewareApi.createNamespacedMiddleware(namespace, jsonMiddleware);
        }
      })
      .catch((err) => {
        console.error(err);
        console.log("Came here 0");
        res.status(500).json({ error: "Database ,Server error" });
      });
    });
    // fs.appendFile("logs.txt", "Reached here\n", (err) => {});
  }
  else{
  console.log("Have to create Application with name: " + Bname + " and registry: " + Bregistry);
  // res.status(201).json({ message: "hello"});
  Application.findOne({ name: Bname})
    .then((existingModel) => {
      if (existingModel) {
        console.log("Application with that already exists");
        return res.status(400).json({ error: "Name already exists" });
      } else {
        const newVersion = new Version({
          versionname: "0",
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
            const newApplication = new Application({
              name: Bname, 
              versions: [createdVersion._id],
              activeversion: createdVersion._id,
            });
            console.log(Bname)
            console.log("trying to create application with"+newApplication);
            newApplication.save()
              .then(() => {
                console.log("Application created successfully   1032");
                res.status(201).json({ message: Bname });
              })
              .catch((err) => {
                console.log("Failed to create application   1032"+ err);
                return res.status(500).json({ error: "Failed to create application" });
              });
          })
          .catch((err) => {
            console.log("Failed to create version  1 here neeraj");
            return res.status(500).json({ error: "Failed to create version" });
          });
        const deployname = Bname;
        const registryname = Bregistry;
        mmDeployment.metadata.name = "mm-deployment" + "-" + deployname;
        mmDeployment.metadata.labels.app = "mm" + "-" + deployname;
        mmDeployment.spec.selector.matchLabels.app = "mm" + "-" + deployname;
        mmDeployment.spec.template.metadata.labels.app =
          "mm" + "-" + deployname;
        mmDeployment.spec.template.spec.containers[0].name =
          "mm-containers" + "-" + deployname;
        mmDeployment.spec.template.spec.containers[0].args[3] = deployname;
        if (registryname!= undefined)
          mmDeployment.spec.template.spec.containers[0].args[4] = registryname;
        mmIngress.metadata.name = "mm-ingress" + "-" + deployname;
        mmIngress.spec.tls[0].hosts[0] = "matchmaking" + "-" + deployname + ".tenant-74334f-oidev.lga1.ingress.coreweave.cloud";
        mmIngress.spec.rules[0].host = "matchmaking" + "-" + deployname + ".tenant-74334f-oidev.lga1.ingress.coreweave.cloud";
        mmIngress.spec.rules[0].http.paths[0].backend.service.name = "mm-service" + "-" + deployname;
        mmService.metadata.name = "mm-service" + "-" + deployname;
        mmService.spec.selector.app = "mm" + "-" + deployname;
        const k8sApia = kc.makeApiClient(k8s.AppsV1Api);
        k8sApia.createNamespacedDeployment(namespace, mmDeployment);
        const k8sApib = kc.makeApiClient(k8s.CoreV1Api);
        k8sApib.createNamespacedService(namespace, mmService);
        const k8sApic = kc.makeApiClient(k8s.NetworkingV1Api);
        k8sApic.createNamespacedIngress(namespace, mmIngress);
				const middlewareApi = kc.makeApiClient(k8s.TraefikV1alpha1Api);
				middlewareApi.createNamespacedMiddleware(namespace, jsonMiddleware);
      }
      
    })
    .catch((err) => {
      console.error(err);
      console.log("Came here 0");
      res.status(500).json({ error: "Database ,Server error" });
    });
  }

});


router.get("/", async (req, res) => {
  try {
    const applications = await Application.find({}).populate('activeversion', 'versionname registry createdAt link');

    // Transform the data to the desired response format
    const responseData = applications.map((app) => {
      const { _id, name, activeversion } = app;
      const { versionname, registry, createdAt, link } = activeversion;

      // Format the "createdAt" date to the desired format
      const formattedCreatedAt = new Date(createdAt).toLocaleString('en-IN', {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short',
      });

      return {
        _id,
        name,
        versionname,
        registry,
        createdAt: formattedCreatedAt,
        link,
      };
    });

    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching Applications." });
    console.error(err);
  }
});

router.post("/reset",async (req,res) => {
console.log("Came to reset");
res.status(200).json({message: "came to reset"});


const tenantNamespace = 'tenant-74334f-oidev'; // Set your tenant namespace

// Create Kubernetes API clients
const coreV1Api = kc.makeApiClient(k8s.CoreV1Api);
const appsV1Api = kc.makeApiClient(k8s.AppsV1Api);
const networkingV1Api = kc.makeApiClient(k8s.NetworkingV1Api);

// Delete Pods
coreV1Api.listNamespacedPod(tenantNamespace)
  .then((response) => {
    const podNames = response.body.items.map(pod => pod.metadata.name);
    podNames.forEach((podName) => {
      if (!podName.startsWith('sps')) {
        coreV1Api.deleteNamespacedPod(podName, tenantNamespace);
        console.log(`Deleted Pod: ${podName}`);
      } else {
        console.log(`Skipped deletion for Pod: ${podName}`);
      }
    });
  })
  .catch((error) => {
    console.error('Error deleting Pods: ', error);
  });

// Delete Deployments
appsV1Api.listNamespacedDeployment(tenantNamespace)
  .then((response) => {
    const deploymentNames = response.body.items.map(deploy => deploy.metadata.name);
    deploymentNames.forEach((deploymentName) => {
      if (!deploymentName.startsWith('sps')) {
        appsV1Api.deleteNamespacedDeployment(deploymentName, tenantNamespace);
        console.log(`Deleted Deployment: ${deploymentName}`);
      } else {
        console.log(`Skipped deletion for Deployment: ${deploymentName}`);
      }
    });
  })
  .catch((error) => {
    console.error('Error deleting Deployments: ', error);
  });

// Delete Services
coreV1Api.listNamespacedService(tenantNamespace)
  .then((response) => {
    const serviceNames = response.body.items.map(service => service.metadata.name);
    serviceNames.forEach((serviceName) => {
      if (!serviceName.startsWith('sps')) {
        coreV1Api.deleteNamespacedService(serviceName, tenantNamespace);
        console.log(`Deleted Service: ${serviceName}`);
      } else {
        console.log(`Skipped deletion for Service: ${serviceName}`);
      }
    });
  })
  .catch((error) => {
    console.error('Error deleting Services: ', error);
  });

// Delete Ingresses
networkingV1Api.listNamespacedIngress(tenantNamespace)
  .then((response) => {
    const ingressNames = response.body.items.map(ingress => ingress.metadata.name);
    ingressNames.forEach((ingressName) => {
      if (!ingressName.startsWith('sps')) {
        networkingV1Api.deleteNamespacedIngress(ingressName, tenantNamespace);
        console.log(`Deleted Ingress: ${ingressName}`);
      } else {
        console.log(`Skipped deletion for Ingress: ${ingressName}`);
      }
    });
  })
  .catch((error) => {
    console.error('Error deleting Ingresses: ', error);
  });

// Similarly, you can add more code to delete other resource types like ConfigMaps, Secrets, etc.

console.log('Deletion process completed - for coreweave reset - and coreweave data.');


try {
  await Application.deleteMany({});
  console.log('All data deleted from Application collection');
} catch (error) {
  console.error('Error deleting data from Application collection: ', error);
}

// Delete all data from Version collection
try {
  await Version.deleteMany({});
  console.log('All data deleted from Version collection');
} catch (error) {
  console.error('Error deleting data from Version collection: ', error);
}

console.log("Deleted mongodb all data");



})

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.query.name;

    console.log("this is in app deletion,"+ id + " and hte name is "+ name);
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
      .deleteNamespacedIngress(ingressNameis, tenantname)
      .then(() => {
          console.log(`Deleted ingress: ${ingressNamei}`);
      })
      .catch((error) => {
          console.error(`Error deleting ingress: ${error}`);
      });
    
    const appId = req.params.id;
    const application = await Application.findById(id);
    console.log("in deletion, application is "+ application);
    if (!application) {
      console.log("in deletion, application not found");
      return res.status(404).json({ message: 'Application not found.' });
    }
    const versionsToDelete = application.versions;
    console.log("in deletion, versions to delete are "+ versionsToDelete);
    await Version.deleteMany({ _id: { $in: versionsToDelete } });
    await application.deleteOne();
    console.log("in deletion, application and versions deleted");
    res.json({ message: 'Application and associated versions have been deleted successfully.' });
  } catch (err) {
    console.log("in deletion, error occured"+ err);
    res.status(500).json({ message: 'An error occurred while deleting the application and its versions.' });
    console.error(err);
  }

});



// Exporting
module.exports = router;




