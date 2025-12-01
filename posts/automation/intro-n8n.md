---
title: "GCP Freetier로 n8n 구축하기"
date: "2025-11-30"
category: "Automation"
tags: ["n8n", "automation"]
---

# 나도 n8n 할거야

자동화를 안써본 사람은 도태되는 것 같은 분위기를 팍팍 풍기는 요즘이다. 얼마 전에 본 면접에서는 mcp-server나 n8n 같은 거 사용해본 경험이 있냐고 물어보더라.

늦었지만 지금이라도 한 발 걸쳐보겠다.

## GCP 세팅

왜 익숙한 AWS를 놔두고 GCP를 쓰는 지 물어본다면, GCP는 프리티어 기간을 1년으로 끊어두지 않았기 때문... 이라고 대답하겠다.

프리티어 사용 제한 & 사용량만 지킨다면 계속 쓸 수 있는 것으로 보인다.

1. 먼저 Google Cloud Platform에 프로젝트를 만들고, 결제 계정을 만들어 연결한다.
2. Compute Engine API를 활성화 시킨다음, VM인스턴스를 만들러 가자.

[무료 사용 가이드](https://docs.cloud.google.com/free/docs/free-cloud-features?hl=ko)

무료 사용 가이드를 보면, 특정 조건들을 충족해야 무료로 사용할 수 있게 된다.

![image-20251130195431568](/images/251130/image-20251130195431568.png)

여기에 맞춰서 인스턴스를 생성해보자.

![스크린샷 2025-11-30 191940](/images/251130/2511301.png)

![스크린샷 2025-11-30 191945](/images/251130/2511302.png)

![스크린샷 2025-11-30 191952](/images/251130/2511303.png)

이렇게 세팅해서 월 별 예상가격이 저렇게 나왔는데, 무료 사용량을 넘지 않으면 과금되지않는다고 했으니까 일단 진행한다. (과금되면 수정하러 오겠다.)

http, https도 열어준 다음 인스턴스를 생성하면 이제 반은 끝났다.

시작 전, ingress 방화벽을 열어줘야한다. aws로 치면 inbound 보안규칙을 수정하는 것이다.

GCP에서 VPC 네트워크 -> VPC 네트워크 로 들어가 방화벽 규칙을 만들어준다.

![image-20251130200118298](/images/251130/image-20251130200118298.png)

5678포트를 열어줬다.

이제 ssh를 열어서 n8n을 설치해보자.

## n8n

```bash
# 1. 시스템 패키지 업데이트
sudo apt-get update

# 2. 도커 자동 설치 스크립트 실행
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. sudo 없이 docker 쓸 수 있게 권한 부여
sudo usermod -aG docker $USER

# 4. 설정 적용
newgrp docker
```

newgrp으로 설정 적용 위해 재접속해야되는 불편함을 임시적용했다.

이러면 도커세팅은 끝났고, n8n 세팅을 해야된다.

```bash
mkdir ~/my-n8n
cd ~/my-n8n

mkdir n8n_data # 도커에 물려서 쓸 곳

sudo chown -R 1000:1000 n8n_data 
sudo chmod -R 755 n8n_data
```

마지막 두 줄로 권한을 미리 부여해서 EACCESS 문제를 막는다.

외부 IP에 연결을 해줘야되니까, 아래처럼 해준다.

```bash
echo "EXTERNAL_IP=PUBLIC_IP" > .env
```

IP는 GCP 콘솔에서 확인할 수 있고, 아니면 `curl -s ifconfig.me`로도 확인할 수 있다.

```yml
cat <<EOF > docker-compose.yml
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=\${EXTERNAL_IP}
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://\${EXTERNAL_IP}:5678/
      - GENERIC_TIMEZONE=Asia/Seoul
      - N8N_SECURE_COOKIE=false
    volumes:
      - ./n8n_data:/home/node/.n8n
EOF
```

이걸 입력하면 기본 설정이 된다. auth 설정이 없는 이유는 그냥 웹 페이지로 들어가서 만들기로 해서 그렇다.

다 입력했으면, 컨테이너를 실행해서 로그를 확인해준다.

```bash
docker compose up -d
docker logs -f n8n
```

웹 페이지가 잘 실행되고 있으면 이제 아래 화면을 볼 수 있다!

![image-20251130204139457](/images/251130/image-20251130204139457.png)

나는 이미 회원가입을 해서, 이런 화면이 보인다.

http라서 불안할 수도 있지만, https를 쓰려면 도메인을 하나 갖고있어야해서 좀 불편하다. self-signed 방식을 써도 되는데, 그러면 사용하려는 pc마다 해당 인증서를 브라우저에 넣어놔야되서 귀찮아진다.

n8n 초기 설치는 이걸로 끝난다. 아래 docker 명령어들로 간단하게 관리할 수 있다. 

```bash
docker ps # 돌고있는 컨테이너 확인하기
docker logs n8n -f # 로그 보기
cd ~/n8n-data && docker-compose restart # n8n 컨테이너 재시작
docker-compose pull && docker-compose up -d # n8n 업데이트
```

![image-20251130204614497](/images/251130/image-20251130204614497.png)

n8n으로 만드는 모든 워크플로우는 처음에 세팅한 곳에 저장되는데, 백업이 필요하면 스크립트를 짜서 다른 데 옮겨 둘 수 있다.

메모리를 얼마나 쓰는 지 몰라서 스왑은 따로 안해뒀는데, 필요하면 할 예정이다.

## 그럼 어디다 쓰지?

이게 문제다.

뭘 할지는 이제부터 생각해봐야된다...

ai agent 써서 뭔가를 하려면 api credit 결제해서 걸어둬야하는데 아직은 살짝 부담이다. 뭘 어떻게 할 지 조금만 더 생각해보겠다.

## https 뚫기 - n8n tunnel

n8n에서 제공하는 기본 기능 중에 tunnel이 존재했다. ssl 할 필요가 없었던 것!

docker-compose.yml 파일을 수정해주자.

```yml
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      #- N8N_HOST=${EXTERNAL_IP}
      - N8N_PORT=5678
      #- N8N_PROTOCOL=http
      #- WEBHOOK_URL=http://${EXTERNAL_IP}:5678/
      - GENERIC_TIMEZONE=Asia/Seoul
      - N8N_SECURE_COOKIE=false
      - N8N_PROXY_HOPS=1                           # trust proxy 에러 해결
      - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true # 권한 경고 해결
      - DB_SQLITE_POOL_SIZE=10                     # SQLite 성능 경고 해결
      - N8N_RUNNERS_ENABLED=true                   # 태스크 러너 경고 해결
      - N8N_GIT_NODE_DISABLE_BARE_REPOS=true       # Git 보안 경고 해결
    command: start --tunnel
    volumes:
      - ./n8n_data:/home/node/.n8n
```

이렇게 하고, 다시 컨테이너를 올리고 로그를 잘 봐야된다.

`docker compose up -d && docker compose logs -f n8n`.

그러면 `https://XXXXXXX.hooks.n8n.cloud/` 형식의 주소를 던져주는 데, 이걸 써서 웹훅을 걸면 된다. 완벽하다.

## 408 에러가 너무 자주 발생한다 - 도메인을 사자

안정성이 너무 떨어져서 https를 쓸 수 있는 다른 방법을 찾아야한다.

ngrok은 무료버전을 쓰면.. webhook이 접근 못할 수 있어서 clouldflare를 쓰기로 했다.

namecheap에서 도메인을 샀다. 저렴한 도메인은 1달러밖에 안하더라. 도메인을 cloudflare에 등록하고, free plan을 선택해준다.

![image-20251201010613889](/images/251130/image-20251201010613889.png)

 네임서버를 맞춰주고, zero trust 설정까지 해준다. (zero trust도 free plan 쓸 수 있다.)

![image-20251201011111249](/images/251130/image-20251201011111249.png)

![image-20251201011144820](/images/251130/image-20251201011144820.png)

이후 도커를 선택해서 gcp위에 설치하면 된다. `eyJh`로 시작하는 토큰값을 꼭 기억해야된다.

![image-20251201011620943](/images/251130/image-20251201011620943.png)

여기까지 했으면 이제 docker compose 파일을 수정할 차례다.

```yml
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_PORT=5678
      - WEBHOOK_URL=https://n8n.도메인
      - N8N_EDITOR_BASE_URL=https://n8n.도메인
      - GENERIC_TIMEZONE=Asia/Seoul
      - N8N_SECURE_COOKIE=false
      - N8N_PROXY_HOPS=1
      - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true # 권한 경고 해결
      - DB_SQLITE_POOL_SIZE=10                     # SQLite 성능 경고 해결
      - N8N_RUNNERS_ENABLED=true                   # 태스크 러너 경고 해결
      - N8N_GIT_NODE_DISABLE_BARE_REPOS=true       # Git 보안 경고 해결
    volumes:
      - ./n8n_data:/home/node/.n8n
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    restart: always
    command: tunnel run
    environment:
      # 아까 복사한 긴 토큰
      - TUNNEL_TOKEN=eyJhIjoiM... 
```

이제 컨테이너를 재시작해주면 아래와 같은 로그를 볼 수 있다.

![image-20251201012408252](/images/251130/image-20251201012408252.png)

그럼 아까 cloudflare에서 지정한 `n8n.도메인`으로 고정주소 접속이 가능해진 것이다! 1년 요금이 1달러 좀 넘으니 충분히 투자할만하다는 생각이 든다.

## 외부 IPv4 주소 제거하고 IPv6로 옮기기

프리티어가 무료인 것은 맞지만, 트래픽은 무료가 아니다. 정확히는 외부 IPv4 주소가 유료다. 시간 당 $0.005로 한 달 내내 켜두면 약 5천원 정도 과금되는 것이다.

IPv6에 대해서는 과금모델이 따로 없는 것으로 보이기 때문에, 옮겨보겠다.(과금되면 다시 오겠음)

우선 네트워크 인터페이스를 건드려야하기때문에 인스턴스를 정지시켜야된다.

![image-20251201012408252](/images/251130/2511304.png)

default로 생성된 VPC 네트워크는 서브넷이 IPv4로 고정되어있다. 이걸 풀어주기 위해서 서브넷 생성모드를 맞춤설정(custom)으로 바꿔준다.

![image-20251201012408252](/images/251130/2511305.png)

그 다음 VM이 있는 리전에 대한 네트워크 인터페이스 서브넷을 이중스택으로 변경해준다.

![image-20251201012408252](/images/251130/2511306.png)

이제 VM -> 수정 -> 네트워크 인터페이스 에서도 IPv6이중스택으로 변경해주면 외부IP가 IPv6로 바뀐 것을 볼 수 있다.

절반은 끝났고, 이제 docker compose 파일 수정이 필요하다.

```yml
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: always
    ports:
      - "127.0.0.1:5678:5678" # localhost에 접근하도록
    environment:
      - N8N_PORT=5678
      - WEBHOOK_URL=https://n8n.도메인
      - N8N_EDITOR_BASE_URL=https://n8n.도메인
      - GENERIC_TIMEZONE=Asia/Seoul
      - N8N_SECURE_COOKIE=true
      - N8N_PROXY_HOPS=1
      - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true # 권한 경고 해결
      - DB_SQLITE_POOL_SIZE=10                     # SQLite 성능 경고 해결
      - N8N_RUNNERS_ENABLED=true                   # 태스크 러너 경고 해결
      - N8N_GIT_NODE_DISABLE_BARE_REPOS=true       # Git 보안 경고 해결
    volumes:
      - ./n8n_data:/home/node/.n8n
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    restart: always
    network_mode: "host"
    command: tunnel run
    environment:
      - TUNNEL_TOKEN="터널 토큰"
      - TUNNEL_EDGE_IP_VERSION=6
```

cloudflared 설정이 바뀌었다.

도커에 띄운 서비스로 접근하는 게 아니라, vm 로컬호스트에 접근해서 n8n을 실행하게 하는 방법이다.

컨테이너가 인터넷(Cloudflare)으로 나가려면 호스트(VM)의 네트워크 카드를 빌려야되는데, 도커는 Bridge라는 가상 사설망 안에서 IPv4만 처리하도록 기본설정이 되어있다. `network_mode`를 host로 설정하면 컨테이너가 Docker의 가상 네트워크를 거치지 않고 VM의 랜카드(NIC)를 직접 잡아서 쓰기 때문에 외부통신이 뚫리게 된다.

cloudflare의 터널을 사용하면 기본적으로 IPv4로 접근하기 때문에 아래와 같은 에러메시지를 보게된다.

```text
cloudflared  | 2025-12-01T06:46:27Z ERR Failed to dial a quic connection error="failed to dial to edge with quic: timeout: no recent network activity" connIndex=0 event=0 ip=198.41.192.47
```

외부 IPv4를 없애고 IPv6를 열어놨는데, cloudflare tunnel 이 그걸 못찾고있어서 발생하는 에러다.

해결법은 간단하다. environment에 `TUNNEL_EDGE_IP_VERSION=6`으로 설정하면 quic 프로토콜로 connect 되면서 잘 되는 모습을 볼 수 있다.

TUNNEL_EDGE_IP_VERSION 옵션을 빼먹으면 호스트 랜카드를 잡아서 도커를 띄우더라도, 내부 IPv4가 살아있어서 외부 IPv4도 뚫려있을 거라 추론해버린다. IPv4 우선순위가 높아서 IPv6 통신으로 넘어가기전에 막히기 때문에, IPv6로 처음부터 고정해주면 이런 문제가 생기지 않는다.

이제 클라우드 플레어 zero trust콘솔로 가서 서비스 주소를 수정하자. 

원래는 도커가 띄운 n8n서비스를 잡아서 사용했지만, 이제는 로컬호스트에 떠있는 n8n을 잡아야하기 때문에 아래 주소로 바꿔줘야한다.

`http://localhost:5678`

### 이게 어떻게 가능한지?

![image-20251201012408252](/images/251130/2511307.png)

Cloudflare Tunnel이 외부 IPv4가 없는 환경에서도 외부 접속을 가능하게 만드는 원리는 아웃바운드(Outbound) 연결과 트래픽 캡슐화(Encapsulation)에 있다.

인터넷이 되기만 하면 `(Cloudflare 서버로 접속하는 터널을 뚫을 수 있는 상태)` 터널링이 이루어져 통신이 가능한 상태로 바뀌는 것이다. 밖에서 안으로 들어오는 인바운드(ingress)였다면 방화벽이 있어서 이게 안되는데, 반대로 cloudflared가 안에서 밖으로 뚫은 연결이라 방화벽이 우회가 된다.

[Cloudflare Zero Trust Docs: Tunnels](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)

외부 IP 주소 가격 책정 쪽을 보면 아래와 같은 메시지를 볼 수 있다.

[VPC 가격 책정](https://cloud.google.com/vpc/network-pricing?hl=ko&_gl=1*1ozw84m*_ga*MTAzNDAyNzI1NC4xNzY0NTUwMTc5*_ga_WH2QY8WWF5*czE3NjQ1NzQ1MjQkbzIkZzEkdDE3NjQ1NzQ3NjYkajIyJGwwJGgw#externaliptraffic)

> 서브넷에 할당된 외부 IPv6 주소 범위 또는 VM 인스턴스에 할당된 외부 IPv6 주소에는 요금이 청구되지 않습니다. 고정 리전 IPv6 주소 (프리뷰)에는 요금이 청구되지 않습니다.

이제 외부 IPv4 주소의 공포에 벗어났다고 할 수 있을 것 같다... Billing 되는 것 확인하고 다시 와보겠다.
