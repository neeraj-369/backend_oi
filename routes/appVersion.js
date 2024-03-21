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
            link: req.body.name + ".matchmaking.oiplay.in",
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