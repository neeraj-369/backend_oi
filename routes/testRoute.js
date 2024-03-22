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
    certificate-authority-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUU2RENDQXRDZ0F3SUJBZ0lRTncvOHJwRmdBQ0RPMU1xN2t3SU9QVEFOQmdrcWhraUc5dzBCQVFzRkFEQU4KTVFzd0NRWURWUVFERXdKallUQWdGdzB5TkRBek1Ea3lNRFF5TlRSYUdBOHlNRFUwTURNd09USXdOVEkxTkZvdwpEVEVMTUFrR0ExVUVBeE1DWTJFd2dnSWlNQTBHQ1NxR1NJYjNEUUVCQVFVQUE0SUNEd0F3Z2dJS0FvSUNBUUMwCjVKRXJ2UjhGL1gvd21PQTVKVW1ZUGE5aEZ5L1F4YThiRGp6MVk1K1lob3RBQ3ZOWjZYZ2ZBcjR3KzYrb3EyTGwKWkptVEdUb3k1WFlnZk83RlFoVkZ4TjNTTUd3OU1OaGdJWWc4cVdVQmhYRENYZHZqUGFwZys4NzA1a1FvTHhOQwpDeUMxYThiWGswYzBOZSsrV1l6WUFEZUlVQmtrQVJpaTNra1d0NEtyMEFDOExJVWhjbzQ3WG9EdCtSVzNreGRLCm55aWk5T213R0hnU2pRWklGcjFTd3hyYlRIalFxeDlJRktvRXlyRUVpTmdRaDhDdU8wcVpkanc0SjBuUWl1WUoKcTVDelMrMnl6SEtUS0JmSUNzdkE5Ulk1aGFpY2pKQktZTEhKVE13SmwzbFFJY3ZUaG9yWm5LWHRrbTdZQytaOAp0TjFrcEJuVy8xWUdUMGZaOWlWNnVlMnVLcExxanU3MHRMc3RXQmNRZ01NRkNaTXAzcWM0OFRNYVJjVVJSYjZiCjdGRGtTZmhxb2IweVB2Z0IzVldOdFI0cDM0Z1VJeVoxaWRrWWh5UVk1bFVQdEJaZkJTZnZEMFpEdEFONWpNWWYKTndmekY1cWlzUjBTTkMydk5GNDVuc285WUV5ZUcxK2pncnk1c3NOTUdCVjc0RXcwNzhYbjliUUM2cWZzY1cvSApUdDFXb2sxREJYekNzeUpnZitRdit0NWtmRFVldEZXZWNPakF4dzJYM1c3cDlZcG1GUXJacG9FaHB5Mkw4TnJWCkdScjlJL05abkZ6SWZLek1vcVBMNTUySFFmNjBZOFdoaS9YM0c0cThIeEcxNVF5SHMrNTZuNjB4aFI2V2NxQ1QKQjd4TklDTUhYV3ZBeld1QWZXRzFmZVNLQnIwVjFLMzN6Q3dEc3JzbkRRSURBUUFCbzBJd1FEQU9CZ05WSFE4QgpBZjhFQkFNQ0FxUXdEd1lEVlIwVEFRSC9CQVV3QXdFQi96QWRCZ05WSFE0RUZnUVVoaEZycnBML1RmTWFmNjVMClptaFZqcVZLL2FJd0RRWUpLb1pJaHZjTkFRRUxCUUFEZ2dJQkFBWXIyeC8xVU85TUxsVG92SXRFWmRLMmpFclkKQURZUEtPMHo1aGdPWkRoVkVoTGp4aVk1c1pZMWFRWGt5TG4vSlJQUDREUDdHYnp4cVZCejQ5UGdvcTZUbUFTVwpobDNnRFlnRlh6dUYxWGFnTnBNemcvTnpjN0JiMkFDUVBMVmtSN3BJNVEralg2cjlPdlpjWFMvQlptNUdwS2xCCkJNRW14aHdpZksrYStCVXBjbFhPRmE5clVSSEVWRVJtdVZqKzBDVC9yK0toaXI3ZDY1Nlhha1VHUjNJOVRrQWkKUVZmdVpaUTh2cExDZDQwdEtMZ3Y1d0lIWldZeFRRN2o4RGhsN3h5WnVoVzRiaHh4VEsyUG1qUTA1cFlUOFBnOQpTbG11bFhmQnN0dkRzUHd1eEtOQ3Z4amlNR1I1eHltT0orVlBPcFVLOXVQOGR3cGgwL2U5YlIrQ29KMFBybndUCnBBemRXcnhxS2dselh5Y1Q0QmQ0Y3BpTjRZMVJVTUh0WTNMVDQrNnA3OHlBZzQ3YWppTTVadW40SGlGOEMxbGYKZWsyQ3FhOVMvRGhTVEVrajRCTXJZQTI2REkyeUNQdjV5UGYyZ242bDFxNDVWbGZqa1BQUVA2MTF5aW9QSkkxSQo2TXdQakRsdDV3VGEyNHlBOXdqN2wzeTNSTDFESTZBa0x0TlFVNHFxbWpCcUJkdlVlVXV0UjExTTRVMjRtdGFDCkdCWVdrYmdRMW5YQjI1d1FlMjR6YXAxRGFEWlhIcVpIK2d5RHdZNmduOGYzZWFRd3NTS3R2TG5MU293ZWVmSjMKdzhBdXVXNC83VENaejRMam83NmJLWVlkQ3lycXJhRFREb0dqcVNhOE5RMGRWZWVyMUNCM0I2VUpuQmtFSTZORQpVOUxFYXhTcU8xK2Z3TWhyCi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K
    server: https://oistream-dns-vrj8z2f2.hcp.centralindia.azmk8s.io:443
  name: oistream_new
contexts:
- context:
    cluster: oistream_new
    user: clusterUser_oistream_oistream_new
  name: oistream_new
current-context: oistream_new
kind: Config
preferences: {}
users:
- name: clusterUser_oistream_oistream_new
  user:
    client-certificate-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUZIakNDQXdhZ0F3SUJBZ0lSQVAxVm14RC9pdGl6dysrWGE2bUxGNmt3RFFZSktvWklodmNOQVFFTEJRQXcKRFRFTE1Ba0dBMVVFQXhNQ1kyRXdIaGNOTWpRd016QTVNakEwTWpVMFdoY05Nall3TXpBNU1qQTFNalUwV2pBdwpNUmN3RlFZRFZRUUtFdzV6ZVhOMFpXMDZiV0Z6ZEdWeWN6RVZNQk1HQTFVRUF4TU1iV0Z6ZEdWeVkyeHBaVzUwCk1JSUNJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBZzhBTUlJQ0NnS0NBZ0VBblcxM0dTMUVLd04zQTZUVjJINm8KZVQ0SmhZeHBhQ3BmdDArR3E5SjF2TzZZNnpBRFJhMklsZ3RPdUNLR28zRGtKUGllQ3ZHYTZFMlM1NjZoYkpGcwpuRFRHQWFwbjlEMkNTZkQ3TVFmRUdKUVc4ekx6WEtFSnZCSkdsbitqNVQzZDU0Qngxb2pzQ3ZaMVJOeTY4Wk02ClJJVUYzdVY0Zkg4cDNyaEpwOFpHbHBtcmttRDFRSXg4QW9ETGg1TVozckNudEtNRys0cTJvODZKOE55VzFERHgKc1FGck9kVmVkOG9HZGkzT1c5NkYyZHhTT1lCZFM1SUZzY2k3TWdaTzd4b29RZTE5QmZkdjcrYjlad0p1QTNCUApPWVlMSTNmY0NvSzlUSjZTbEhTQXlxcVMyNENNZUhsWE53aHIyYXdSNHZkUkhEeVBNWnFteWxwVWttQ0xnQlBWCjVoUXFUcmJWbHFSSitXMmJER1BwRExJK0tWYWFGQXR3M2VVbHJuejNVV201NmVVRWFIeEdIdE41c1pRYTFHWVYKSjRSSk9hU2pNQS90SzBteEJWM2MxbDJMc0NpRmI3b3dLK3haSFhCSXNUVHFkOTJqVExGREttcGhwcWsrV21ESQpSK0R2WTl6bWVaSmNiOVUwd1lKamdkeXcwbVQyOGsvTVhzSG1jRFBrRGtNRnllano1YXZUNnQ0Nlh6L2htcHZECkU4RWlBZWw3NUhzeittV1NuN25SNktWektnSDVYM01BMHdTOXNkVUNRUXE5dnFIamh0V3VLaXNJeitvUGJHK04KWmxRY2FaNkV3VFlzWjZZZTA4ejRlakRNU2ptdHVWT1EydytxaGEwei9TUjR2ZUxMd3F1eG9UdnlodVY0UkFvNQpWWmZFWlhBMjhpNmoyWFM2Qyt0Wk1lY0NBd0VBQWFOV01GUXdEZ1lEVlIwUEFRSC9CQVFEQWdXZ01CTUdBMVVkCkpRUU1NQW9HQ0NzR0FRVUZCd01DTUF3R0ExVWRFd0VCL3dRQ01BQXdId1lEVlIwakJCZ3dGb0FVaGhGcnJwTC8KVGZNYWY2NUxabWhWanFWSy9hSXdEUVlKS29aSWh2Y05BUUVMQlFBRGdnSUJBRnIyTDdqTEVYUDVNRDlGaHN3SQpNalE5S0VpK0g5RWJjK3VlRC8vUEp2N1k3QnVDcnFIT1kzdlVXK3Fzc1BFMnNTRFMyeGlNVEpwNk9JMGJHVUJUCngyUmR4R3BjK0dqZmVlaFFDRVpDb3JETEVqVWxYditDa0JVa1BTa20vMTVUUnVtK0M4a0hreGl5TW5MS2dCQmwKajJ6dUNnOWEyNU9MMGs4STllNmo1MzdVejdkcU1saXUvem1jNWpJZVVDVzcwSFRxbGRBMUlHMGRKd0ZUM1BwNQo3VG05aGI4T3FYTEF2VDBBUHVFTDlOdzJ2cGlJa2JCbGxYOWYyMktwRlFrNUt5T3duaHovQjJ2ZHI1Yzlha2EvCmthWlc4MkNEdWQ1dW52K2lmQ2N6RzdmSE9zQ3VpdFhTMStIWGh6K2FFOW1RUDgzUXVNMm1uR29MWi94NS9FY2kKSXhLNktRMy9QcGc3c2o1NC9KS1NBRUFsR2pES1BHK2xhSWZlMXlhUEZBT0lSNjVuNXlqaXZybXArbVRtY2JEdwoycktsai93TzQxKzRaUGllMXk3WVdmRUtrS3hXRXg5OGd3VWswbU5OT1prVkFWMGR2NjBBZ1o0V0Jyb0tZUWU3CnVhalplVWkrdUQvaUZWanFXaWIrRHRSSWNWSE95UnNKaitPMDVUeGtpZ0RIMWtvempFb05vWmY4YnFJZ0lmVloKeVZFdzJvcDZiUkl2NERxc1FpeWFjYitRZ0luM1NDZFZIMUVyUjA1dXVRdUpTQmRjUTNSVklxZllNK3ZCQ0QrVApDeGVPb1FVR2xGNHc1WGoyTXVrU2tqTkNIRk9udjBidXVUenFSZTIzZmlmbitWNkFLNHFCTkVPNDNHcFZZaEk4Ck12ZlBDa25IZG4wVXlJZGtqcGxvbWVuSgotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==
    client-key-data: LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlKS1FJQkFBS0NBZ0VBblcxM0dTMUVLd04zQTZUVjJINm9lVDRKaFl4cGFDcGZ0MCtHcTlKMXZPNlk2ekFEClJhMklsZ3RPdUNLR28zRGtKUGllQ3ZHYTZFMlM1NjZoYkpGc25EVEdBYXBuOUQyQ1NmRDdNUWZFR0pRVzh6THoKWEtFSnZCSkdsbitqNVQzZDU0Qngxb2pzQ3ZaMVJOeTY4Wk02UklVRjN1VjRmSDhwM3JoSnA4WkdscG1ya21EMQpRSXg4QW9ETGg1TVozckNudEtNRys0cTJvODZKOE55VzFERHhzUUZyT2RWZWQ4b0dkaTNPVzk2RjJkeFNPWUJkClM1SUZzY2k3TWdaTzd4b29RZTE5QmZkdjcrYjlad0p1QTNCUE9ZWUxJM2ZjQ29LOVRKNlNsSFNBeXFxUzI0Q00KZUhsWE53aHIyYXdSNHZkUkhEeVBNWnFteWxwVWttQ0xnQlBWNWhRcVRyYlZscVJKK1cyYkRHUHBETEkrS1ZhYQpGQXR3M2VVbHJuejNVV201NmVVRWFIeEdIdE41c1pRYTFHWVZKNFJKT2FTak1BL3RLMG14QlYzYzFsMkxzQ2lGCmI3b3dLK3haSFhCSXNUVHFkOTJqVExGREttcGhwcWsrV21ESVIrRHZZOXptZVpKY2I5VTB3WUpqZ2R5dzBtVDIKOGsvTVhzSG1jRFBrRGtNRnllano1YXZUNnQ0Nlh6L2htcHZERThFaUFlbDc1SHN6K21XU243blI2S1Z6S2dINQpYM01BMHdTOXNkVUNRUXE5dnFIamh0V3VLaXNJeitvUGJHK05abFFjYVo2RXdUWXNaNlllMDh6NGVqRE1Tam10CnVWT1EydytxaGEwei9TUjR2ZUxMd3F1eG9UdnlodVY0UkFvNVZaZkVaWEEyOGk2ajJYUzZDK3RaTWVjQ0F3RUEKQVFLQ0FnRUFuV0psY2Q4bVNsWlJjbXdsZWlYTjZrQVNKdGhrUE1ZNElMdzVwNmRsRzdmeFd4Y0ovbXZwcEErego2RFJrSkJ2bGlleWZtOU5GQ2I4Y0FkRTlBcHcwVjhvT3RuV1ZMY0VjY3kyZkFycC8yZzZiRHhHOTZMbjZVSEo0CjdWYTRGS09RS0RQcUd3K1I0N2ZYTHp2NURUQWlUWVFyaFZZbDZWajhFL1JyZG5hcjlUMjJJRVljaWlhb2g1d1oKWGZXN0pEMjV1OFpNWWNlZ3BnMERMTEJyZmNGY3I1ZjZpYnY5a0lhQmhUNXdFcnBaV0orQitJaVRQTXpFTXFPNgpPZDNDcGhtaGE1K3dvUGxwaUE2SEFhZVZNb3ppTjJFQjI3aWxYRUN1WFY0ZXJwbjJkQ2FwWVJhWDJJMSttcjhwCmkxa1NITFVoK3JlMGRHUG5JVi9ETXYrZ0Z6QTlZeERwMitlRklwcHRzbTRyL205QWRmK3QvQU9USVVXQjB0TlQKQWZVU1kxVkR3WmNlcy9TaC9wZlY1aTlKLzFkMDVqVjN6RU5mRTNhMXFnZ3AvbUNabVp6VGF5V2lYUnAvWU1ZMAo5MW9JdnR3Y2xvb21uWFdJV0xNeHRRNHphNE5zY09sT0FpMkprR20zMTRhbGNwSk9TN2tQOXJUckkrWitPckpFCml4SzIwSjJVVTVrYldhQThWU3hwMVEwZktWWU0zV3NZdm53QVY2dUorN05na2lvZTZZcEZiM0dNY015VWd6Q0kKbmdUTm1KbWZDd0tyLzhqRUtHRzQzWGVreE1HWEJzcjhZcmRBUFNHUmlmZXBnNVRRVCt2N0dwN0Q5OWxUWGtndgpHYVQraFQ1eFkreEc4THQ4MkN1M3RMOC9acktSVUZPT1dmSVNKUjdwYW1ra1RNeUpSc2tDZ2dFQkFNSzhxVTJsCkF5WWY3VkNyczFJNm5ueXpZdFczL1JrN20rMHRlQUpodGppblJ2TUNrTWgyL3NwTGJYMzBUNS85ZkV0VzJDQnMKVXhxdVhIS0VzZHJhK2dLZ2xwZVhRVkIvSEhZRGxPeEgxRno3V0ZOQlJNMU91dG1COWlhdS9oUGw2NDFLMzVsTwpUSndaNDFaaFdWYitiTE9KV1RCSFhGOVprK2tCZFd0THVBd2VtSmZQRXBIVmp1QUlPK3U3MndiRS92Rmx2V0h0CjQrZTBDTlJwSmZEbFZJVHpmd2FuQUxpUXBxZzRIYldORVMvSXJTYWlBbkplSkwyUHVyQ1lHU3BvbUZONDJMNkQKc1ZJSHRxMUtLdEhRWXkvUzZ4Si9IZUx0Vkl1ZGJnSjBLWWh6UFZXM0ZaRmtDSTU5WHBwb3l1RTJHWjZRb042WgppQU9rVDB4emZxNGJBbk1DZ2dFQkFNNzBEb1RLWHBVV1JQRFcvdGh4dSsyUUF5aGFFUkV1T0Nzcng1OGtzRW5TCk1NK05RdUtYU0JvQzVDK1lCcTVEMkgyVjdxVnF1cEV0Q09zem9YU1c3UXFadkRDdFIxMTh4TGZKSTZKTnh3NmgKVHJqRzlQdU5NbnBHeUJzNEJjbExxdndleU9hYlFqZGpubktIbmVzMTlBQ1lGK3BYelVwOXBHRFh4SkM4dlUxYQp2ZEFLVFp1TEFPeG04MThDUWNSdEI3WG5ZOC9pK293M3pvbDVzWkh2MmE3dkpxdU5NRWxWV2M5K2FCZ2RGWm4vCkhJUkdHenlRZ1kvV0hqYU41VjU4dEhUdUhCK2RWT0xxOEpuYTN5WnRFZGxXdHNBaExPOEJzeWwyc2Rua3l0TjUKak9RN21hMlZ6TkJibVNHWmttSzREaFpKQlhxQXloTlBiaVBiakRGV1ViMENnZ0VCQUlVYzdTWFVEQWo5ZmZ6TQp3WEVOL05RRTB5Ui85aFJQZU5CeGFqMUdpWWJFWVcwdmJjUjZBc1JKTnZrSURYMnhpa3I5ZkJMOXVQamVBdmVNCjJQNWUvTkxhN3RXRVlQTWpVRk1qTTZNbm5uUklveUdWMWUvNVJ5UHpBRTJGQk15Wk42Q0hjN3labHlpRlVhNzAKTUZ1VTRyeit2K2FPZ1FmMGRYU3F1SmExVllPRFRvOUd6c3k5REVMN25lb1BxVEpCYW51Y0xnNUl6S2JQbTlHRwpacGI2VEFIdGFBRW1Hd29PWnIxS1RwU1JieFFZdXJOVHZ4UnFZZmJwenBWMEFvL0ltNGREYmZVY2xCTWNqclI1CnBEZHptTGxTRmJtNUJyYmR3Qk1IYy9GZGNoNkJsNFdGOXNwQmRNL2h4czhKbnRTL1pGZk5TUW1nTFNkQUk2eUEKcmpGWTZSMENnZ0VBUWZOcXNReWdxWmdvTGl3Rm1NcGQzaTMzbzZOWUx3WndwZWxVdXpXQTdIV01Vb2dzMlhMbQpha3VqbGpzM1hjK0hMVFpiaitGOFJRbDUveUk4QUtDY043V1lVRmJZR0VYTGx0b0ZmaEtWTGVkZjQraWJaNUt1CmxHTDhJQmh4VjUzQ2hvZjA4L0JrWUt4aGNSUWcwalVtWmc0U0NQOGtEK29NT1VScGdzcHk5VFRHcW9hdUJyUjgKZmRtdEV3andGbjI4YUU2dDh6RGRNVlFUZ0tJRVlZSnk5NW1FMUVTeEw1MkFlbXhKRmU0bTFTV0VXKzdQZlRSNwo1VytSdjBibTRuNlJMM1kyQmlrb1JRd2owcFA2YXc5MUViTGRtRXE2UEF4cG9Qd1BYMlhXOFIrYU01MStzdCs3CkhtY2lYSi9KRTZhZDdxSWttYzV6RjBaSHppdUgrSzBPYlFLQ0FRQm5hK25lbklyR0hORGxMa2o2d0NHYWdlK2sKUjdXNmdrenZ5NmdqTUs0R3VjSzBiTXhHQkNNazVheUV6dzVJdnFIUmhVU3htRGNiNWFYaWFGQ2ZsNUJMeERjKwovWGl3V2hRaXN2SWNTTzFXK3kvMDRFZ21ScGdYMDZYQ1FiaXFSa1ZQRGsyOWY1aDduRDMxdWFRd0c1YnZKZHA1ClFPZmFnODdJVTNJOU5hZXBHZ0tIRnZXNHhiNXArR3JDYXp6WUZFa3hEQUw0TWhNUFJWcGZOMC91MFNsT0xhbFgKQjQvQXRyRmNCM3dKaEh3T0xVeUYrQWcrQk8rTXlrTmhMZGtLY0hVOFdLZllqdHgvcWkrK25QUzNObngxRmU2QQpPOWR2aEc3L2h0Rms5bEtpODVwdmxKZm1mNzR5eEx4TXBoeWViZ01WQXk0NlIxZS96TVB1VDBnVWVIWXMKLS0tLS1FTkQgUlNBIFBSSVZBVEUgS0VZLS0tLS0K
    token: nbdx8z9henftao24g6to8vrena9z36fhjzwn69kuy19hba6ch78yib6jla8kbcrypxp0nuxgqql78bjhlaueyfi023f1fmgp1mqyi3g2pervmiglqnq5xkgnd0qvybsm
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
              "coturn.oiplay.in:3478",
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
            // resources: {
            //   limits: {
            //     cpu: '4',
            //     memory: '20Gi',
            //     'nvidia.com/gpu': 3
            //   }
            // }
          },
        ],
      },
    },
  },
};

var mmHpa = {
  apiVersion: "autoscaling/v1",
  kind: "HorizontalPodAutoscaler",
  metadata: {
    name: "mm-hpa",
  },
  spec: {
    scaleTargetRef: {
      apiVersion: "apps/v1",
      kind: "Deployment",
      name: "mm-deployment",
    },
    minReplicas: 1,
    maxReplicas: 20,
    metrics: [
      {
        type: "Resource",
        resource: {
          name: "cpu",
          target: {
            type: "Utilization",
            averageUtilization: 75,
          },
        },
      },
    ],
  },
};

var mmIngress = {
  apiVersion: "networking.k8s.io/v1",
  kind: "Ingress",
  metadata: {
    name: "mm-ingress",
    annotations: {
      'kubernetes.io/ingress.class': 'nginx',
      'nginx.ingress.kubernetes.io/rewrite-target': '/',
      'cert-manager.io/cluster-issuer': 'letsencrypt'
      },
  },
  spec: {
    tls: [
      {
        hosts: ['*.matchmaking.oiplay.in'],
        secretName: 'ssl-certificate-matchmaking',
      },
    ],
    rules: [
      {
        host: "matchmaking.oiplay.in",
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


const namespace = "default";
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
            link: req.body.name + ".matchmaking.oiplay.in",
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
                  res.status(201).json({ message: newApplication.name });
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
          mmHpa.metadata.name = "mm-hpa" + "-" + deployname;
          mmHpa.spec.scaleTargetRef.name = "mm-deployment" + "-" + deployname;
          mmIngress.metadata.name = "mm-ingress" + "-" + deployname;
          // mmIngress.spec.tls[0].hosts[0] = "matchmaking" + "-" + deployname + ".oiplay.in";
          // mmIngress.spec.tls[0].secretName = "redirect-secure-ssl" + "-" + deployname;
          mmIngress.spec.tls[0].hosts[0] = deployname + ".matchmaking.oiplay.in";
          mmIngress.spec.tls[0].secretName = deployname + "ssl-certificate-matchmaking";
          mmIngress.spec.rules[0].host = deployname + ".matchmaking.oiplay.in";
          mmIngress.spec.rules[0].http.paths[0].backend.service.name = "mm-service" + "-" + deployname;
          mmService.metadata.name = "mm-service" + "-" + deployname;
          mmService.spec.selector.app = "mm" + "-" + deployname;
          const k8sApia = kc.makeApiClient(k8s.AppsV1Api);
          k8sApia.createNamespacedDeployment(namespace, mmDeployment);
          const k8sApib = kc.makeApiClient(k8s.CoreV1Api);
          k8sApib.createNamespacedService(namespace, mmService);
          const k8sApic = kc.makeApiClient(k8s.NetworkingV1Api);
          k8sApic.createNamespacedIngress(namespace, mmIngress);
          const k8sApihpa = kc.makeApiClient(k8s.AutoscalingV1Api);
          k8sApihpa.createNamespacedHorizontalPodAutoscaler(namespace, mmHpa)
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
          link: req.body.name + ".matchmaking.oiplay.in",
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
                console.log("Application created successfully   1032");
                res.status(201).json({ message: newApplication.name });
              })
              .catch((err) => {
                console.log("Failed to create application   1032"+ err);
                res.status(500).json({ error: "Failed to create application" });
              });
          })
          .catch((err) => {
            console.log("Failed to create version  1 here neeraj");
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
        mmHpa.metadata.name = "mm-hpa" + "-" + deployname;
        mmHpa.spec.scaleTargetRef.name = "mm-deployment" + "-" + deployname;
        mmIngress.metadata.name = "mm-ingress" + "-" + deployname;
        // mmIngress.spec.tls[0].hosts[0] = "matchmaking" + "-" + deployname + ".oiplay.in";
        // mmIngress.spec.tls[0].secretName = "redirect-secure-ssl" + "-" + deployname;
        mmIngress.spec.tls[0].hosts[0] = deployname + ".matchmaking.oiplay.in";
        mmIngress.spec.tls[0].secretName = deployname + "ssl-certificate-matchmaking";
        mmIngress.spec.rules[0].host = deployname + ".matchmaking.oiplay.in";
        mmIngress.spec.rules[0].http.paths[0].backend.service.name = "mm-service" + "-" + deployname;
        mmService.metadata.name = "mm-service" + "-" + deployname;
        mmService.spec.selector.app = "mm" + "-" + deployname;
        const k8sApia = kc.makeApiClient(k8s.AppsV1Api);
        k8sApia.createNamespacedDeployment(namespace, mmDeployment);
        const k8sApib = kc.makeApiClient(k8s.CoreV1Api);
        k8sApib.createNamespacedService(namespace, mmService);
        const k8sApic = kc.makeApiClient(k8s.NetworkingV1Api);
        k8sApic.createNamespacedIngress(namespace, mmIngress);
        const k8sApihpa = kc.makeApiClient(k8s.AutoscalingV1Api);
        k8sApihpa.createNamespacedHorizontalPodAutoscaler(namespace, mmHpa)
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


const tenantNamespace = 'default'; // Set your tenant namespace

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
    const tenantname = "default";
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




