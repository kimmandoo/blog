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

![image-20251130195431568](/images/image-20251130195431568.png)

여기에 맞춰서 인스턴스를 생성해보자.

![스크린샷 2025-11-30 191940](/images/2511301.png)

![스크린샷 2025-11-30 191945](/images/2511302.png)

![스크린샷 2025-11-30 191952](/images/2511303.png)

이렇게 세팅해서 월 별 예상가격이 저렇게 나왔는데, 무료 사용량을 넘지 않으면 과금되지않는다고 했으니까 일단 진행한다. (과금되면 수정하러 오겠다.)

http, https도 열어준 다음 인스턴스를 생성하면 이제 반은 끝났다.

시작 전, ingress 방화벽을 열어줘야한다. aws로 치면 inbound 보안규칙을 수정하는 것이다.

GCP에서 VPC 네트워크 -> VPC 네트워크 로 들어가 방화벽 규칙을 만들어준다.

![image-20251130200118298](/images/image-20251130200118298.png)

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

![image-20251130204139457](/images/image-20251130204139457.png)

나는 이미 회원가입을 해서, 이런 화면이 보인다.

http라서 불안할 수도 있지만, https를 쓰려면 도메인을 하나 갖고있어야해서 좀 불편하다. self-signed 방식을 써도 되는데, 그러면 사용하려는 pc마다 해당 인증서를 브라우저에 넣어놔야되서 귀찮아진다.

n8n 초기 설치는 이걸로 끝난다. 아래 docker 명령어들로 간단하게 관리할 수 있다. 

```bash
docker ps # 돌고있는 컨테이너 확인하기
docker logs n8n -f # 로그 보기
cd ~/n8n-data && docker-compose restart # n8n 컨테이너 재시작
docker-compose pull && docker-compose up -d # n8n 업데이트
```

![image-20251130204614497](/images/image-20251130204614497.png)

n8n으로 만드는 모든 워크플로우는 처음에 세팅한 곳에 저장되는데, 백업이 필요하면 스크립트를 짜서 다른 데 옮겨 둘 수 있다.

메모리를 얼마나 쓰는 지 몰라서 스왑은 따로 안해뒀는데, 필요하면 할 예정이다.

## 그럼 어디다 쓰지?

이게 문제다.

뭘 할지는 이제부터 생각해봐야된다...

http로만 달아놔서 웹훅 제한이 걸리는 곳이 많을 거고, ai agent 써서 뭔가를 하려면 api credit 결제해서 걸어둬야하는데 아직은 살짝 부담이다. 뭘 어떻게 할 지 조금만 더 생각해보겠다.

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
    command: start --tunnel
    volumes:
      - ./n8n_data:/home/node/.n8n
```

이렇게 하고, 다시 컨테이너를 올리고 로그를 잘 봐야된다.

`docker compose up -d && docker compose logs -f n8n`.

그러면 `https://XXXXXXX.hooks.n8n.cloud/` 형식의 주소를 던져주는 데, 이걸 써서 웹훅을 걸면 된다. 완벽하다.