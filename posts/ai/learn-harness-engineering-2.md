---
title: 하네스 엔지니어링 알아보기(2)
date: 2026-07-12
category: AI
tags: [AI, harness]
---

https://walkinglabs.github.io/learn-harness-engineering/ko/

위 링크 4~6장을 정리한 내용이다.

좋은 하네스는 현재 작업에 필요한 정보만 빠르게 찾게 하고, 작업 상태를 세션 밖에 남기며, 새로운 세션이 구현에 들어가기 전에 프로젝트 상태를 복구하도록 만드는 시스템이다.

이 관점에서 하네스는 세 가지 문제를 해결해야 한다.

1. 너무 많은 지시로 인해 중요한 규칙이 묻히는 문제

2. 작업이 여러 세션으로 나뉘면서 이전 결정과 진행 상태가 사라지는 문제

3. 프로젝트 상태를 제대로 파악하지 않은 에이전트가 곧바로 구현부터 시작하는 문제

이 세 문제는 서로 연결되어 있다.

명령 파일이 너무 크면 에이전트가 필요한 정보를 찾는 데 context를 낭비하고, 작업 상태를 기록하지 않으면 다음 세션이 같은 정보를 다시 찾는다. 세션 초기화 과정이 없다면 불완전한 정보만 읽은 채 곧바로 코드를 건드릴 거다.

요즘 앤트로픽이나 OAI에서 하네스 필요없다 라고 말하고 있는 것 같은데, 그건 비싼 모델 사용할 때나 그렇지 경비 절감을 위해서 저렴한 모델+하네스 구조가 여전히 유효하다고 생각한다.

## 거대한 단일 명령 파일은 실패한다

에이전트가 데이터베이스 규칙을 어겼다면 데이터베이스 규칙을 추가, 테스트를 실행하지 않았다면 테스트 명령을 추가, 잘못된 라이브러리를 사용했다면 허용된 라이브러리 목록을 추가하다보면 AGENTS.md가 개뚱뚱해질거다.

1~3강에서 AGENTS.md 파일을 단순 가이드로 삼으라고 했는데 이걸 어기게 되는 것이다. 처음에는 50줄이었던 파일이 200줄이 되고, 500줄이 된다. 프로젝트 실행 방법과 코딩 스타일, 배포 절차, 과거 장애 기록, 특정 모듈의 예외 규칙이 모두 한 파일에 섞이게 된다.

다 때려박으면 오히려 중요한 규칙이 제대로 동작하지않을 거다.

에이전트가 읽은 소스 코드, 명령 실행 결과, 테스트 로그, 대화 기록과 작업 중에 만든 판단들이 모두 context를 사용한다. 근데 거대한 명령 파일을 세션 시작과 동시에 읽게 하면 실제 코드를 이해하기 전에 상당한 context를 사용하게 된다. 그래서 현재 작업과 관련된 명령의 비율이 context에서 높게 차지하고 있어야하는데, 이를 Instruction Signal-to-Noise Ratio라고 부르는 것 같다.

`Instruction SNR = 현재 작업과 관련된 명령 수 / 에이전트가 읽은 전체 명령 수`

버그 수정에 필요한 규칙이 10개인데 100개의 규칙을 읽어야 한다면 SNR이 낮은 거다. 그러니까 노이즈가 높은 것.

예를 들어 600줄짜리 `AGENTS.md`의 320번째 줄에 아래 규칙이 있다고 해보자.

`사용자 input이 포함된 SQL은 반드시 parameter binding을 사용한다.`

보안상 매우 중요한 제약이지만 다른 수백 개 규칙과 동일한 형식으로 적혀 있다면 에이전트는 이걸 꼭 지켜야하는 지 판단하기 어렵다.

## 다시 한번 기억해야하는 사실 - AGENTS.md는 백과사전이 아니라 라우터다

루트의 `AGENTS.md`는 모든 프로젝트 지식을 담는 문서가 아니라 에이전트가 현재 작업에 필요한 문서를 찾도록 안내하는 entry point다.

따라서 다음과 같은 정보만 남기는 편이 좋다.

```markdown
# AGENTS.md

## 프로젝트 개요

사용자 로그를 수집하고 분석하는 Java 기반 백엔드 서비스다.

## 빠른 시작

- 환경 구성: `make setup`
- 서버 실행: `make dev`
- 테스트: `make test`
- 전체 검증: `make check`

## Hard constraints

- 사용자 입력이 포함된 SQL은 반드시 parameter binding을 사용한다.
- API 응답 형식을 임의로 변경하지 않는다.
- 새 기능은 관련 테스트와 함께 작성한다.
- 검증이 실패한 상태를 완료로 처리하지 않는다.

## 작업별 문서

- API 작업: `docs/api/README.md`
- 데이터베이스 작업: `docs/database/README.md`
- 테스트 작성: `docs/testing.md`
- 배포 작업: `docs/deployment.md`
- 현재 진행 상태: `PROGRESS.md`
- 설계 결정: `DECISIONS.md`
```

루트 파일에는 자주 필요한 정보와 전역 제약만 두고 특정 작업에서만 필요한 정보는 주제별 문서로 라우팅 시켜버리는 거다.

이를 `Progressive Disclosure`라고 하는데 먼저 프로젝트를 탐색하는 데 필요한 최소한의 정보를 제공하고, 세부 정보는 실제로 필요해졌을 때 읽게 하는 방식이다.

```text
AGENTS.md
    ├── API 수정 시       → docs/api/README.md
    ├── DB 수정 시        → docs/database/README.md
    ├── 테스트 작성 시    → docs/testing.md
    └── 배포 작업 시      → docs/deployment.md
```

모듈에 강하게 종속되는 규칙은 그 코드 가까이에 두는 것이 좋다.

```text
project/
├── AGENTS.md
├── docs/
│   ├── testing.md
│   └── deployment.md
├── src/
│   ├── api/
│   │   ├── README.md
│   │   └── ...
│   └── database/
│       ├── CONSTRAINTS.md
│       └── ...
└── ...
```

API 인증 규칙은 API 코드 근처에 두고, 데이터베이스 migration 규칙은 migration 코드 근처에 둔다.

## Rule을 제대로 추가하는 법

명령을 추가할 때는 최소한 세 가지 정보를 생각해야 한다.

```text
출처: 이 규칙은 왜 생겼는가?
적용 조건: 어떤 작업에서 이 규칙을 읽어야 하는가?
만료 조건: 언제 이 규칙을 제거할 수 있는가?
```

예를 들어 아래 규칙은 너무 모호하다.

```text
WebSocket 메모리 누수에 주의한다.
```

어떤 패턴을 피해야 하는지, 어느 코드에 적용되는지 안나와 있는데 이걸 아래처럼 구체화 시켜보는 것이다.

```markdown
## WebSocket listener 정리

적용 대상:
- `src/websocket/` 하위 코드 수정 시

규칙:
- 등록한 listener는 연결 종료 시 반드시 제거한다.
- reconnect 전에 기존 scheduler를 취소한다.

검증:
- `WebSocketConnectionTest`
- `ReconnectLeakTest`

추가 이유:
- 2026-06 reconnect 과정에서 listener가 중복 등록되는 문제 발생

만료 조건:
- listener lifecycle이 공통 connection manager 내부로 완전히 이동하면 제거
```

더 좋은 방법은 문서에 “이 패턴에 주의하라”고 적는 것보다 해당 문제가 다시 발생하면 실패하는 테스트를 작성하는 것이다.

## 세션의 기억력

하나의 세션에서 끝나는 작업도 있지만 규모가 큰 기능은 여러 세션에 걸쳐 진행되는데 이때 가장 큰 문제는 새로운 세션이 이전 세션의 작업 기억을 그대로 이어받지 못한다는 것이다.

상태 기록이 없는 새 세션은 다음 작업을 반복한다.

- 프로젝트 구조 다시 탐색
- 현재 변경 파일 확인
- 완료된 기능 추정
- 실패 중인 테스트 재실행
- 이전 설계 의도 추측
- 다음 작업 다시 선정

이 과정을 Rebuild Cost가 발생한다고 볼 수 있다. rebuild 과정에서 에이전트가 이해한 게 실제 repo랑 다르다면.. 이미 완료된 기능을 다시 만들거나, 이전 세션이 의도적으로 선택한 구조를 되돌리거나, 실패한 테스트를 정상 상태로 오해할 수 있다.

Context compaction도 모든 문제를 해결하지는 못하기 때문에 긴 작업의 연속성을 모델의 작업 기억에 맡기면 안 된다.

세션을 넘어 유지되어야 하는 정보는 repo 안에 기록해야 한다.

```text
PROGRESS.md       현재 어디까지 진행됐는가
DECISIONS.md      어떤 결정을 왜 내렸는가
TASKS.md          앞으로 무엇을 해야 하는가
검증 결과         현재 무엇이 통과하고 실패하는가
Git commit        어느 시점의 상태가 보존됐는가
```

좀 가볍게 가면 커밋만 보고 처리하게도 할 수 있는데, 커밋된 작업이 매우 큰 범위라면? 이건 또 context를 잡아먹는 뚱땡이가 될 수 있다.

`PROGRESS.md`는 현재 상태를 복구하기 위한 문서다.

```markdown
# Progress

## 현재 상태

- 기준 커밋: `abc1234`
- 현재 브랜치: `feature/search`
- 빌드: 통과
- 테스트: 42/43 통과
- 린트: 통과

## 완료

- [x] 검색 API request model 추가
- [x] 검색 repository 구현
- [x] 기본 검색 endpoint 구현

## 진행 중

- [ ] pagination edge case 처리

## 알려진 문제

- 검색 결과가 없을 때 `pageCount`가 1로 반환됨
- `SearchPaginationTest.emptyResult` 실패 중

## 다음 작업

1. 빈 결과의 `pageCount`를 0으로 수정
2. 전체 검색 테스트 실행
3. API 문서 업데이트
```

`DECISIONS.md`에는 다음 세션 때 변경할 가능성이 있고 변경하면 기존 설계와 충돌할 수 있는 결정만 기록한다.

```markdown
# Decisions

## 2026-07-12: 검색 결과 pagination을 cursor가 아닌 offset으로 구현

### 결정

초기 검색 API는 `page`와 `size` 기반 offset pagination을 사용한다.

### 이유

- 관리자용 API라 데이터 변경 빈도가 낮음
- 기존 목록 API가 같은 규칙을 사용함
- 클라이언트 공통 pagination component와 호환됨

### 제외한 대안

Cursor pagination

### 제외 이유

현재 요구사항에 비해 구현과 테스트 복잡도가 큼

### 다시 검토할 조건

검색 데이터가 100만 건 이상이거나 실시간 삽입으로 중복 결과가 문제가 될 때
```

### Git commit을 체크포인트로 사용하기

긴 작업을 하나의 거대한 uncommitted change로 유지하면 상태 복구가 어렵다.

작업은 의미 있는 단위로 나누고 검증을 통과한 시점마다 커밋하는 편이 좋다.

```text
feat: add search request model
feat: implement search repository
feat: expose search endpoint
test: cover empty search result
```

각 커밋은 상태 스냅샷이다. 새로운 세션이 이전 커밋에서 읽고 작업을 더 잘 할 수도 있고, 잘못된 방향으로 진행하더라도 마지막 정상 체크포인트로 돌아가기 쉽다.

## 초기화와 구현을 분리해야 한다

새 프로젝트를 시작하거나 기존 프로젝트에 에이전트 하네스를 도입할 때 환경 구성과 기능 구현을 한 번에 맡긴다면, 환경 구성 중에 기능 구현이 섞일 가능성이 있다. 요즘엔 전부 plan을 세우고 시작하는 게 보편적이라 이런 문제가 거의 보이진 않는데.. 모델에 기본적인 하네스가 껴진 덕분인 것 같다.

초기화가 완료됐다고 판단할 기준을 Bootstrap Contract라고 볼 수 있다.

네 가지 질문을 답할 수 있어야 한다.

```text
프로젝트를 시작할 수 있는가?
프로젝트를 검증할 수 있는가? - 이건 테스트 코드
현재 진행 상태를 볼 수 있는가? - task파일이나 progress 같은거로 관리
다음 작업을 파악할 수 있는가?
```

초기화 단계에서 task와 acceptance criteria를 만들면 구현 세션은 “무엇을 만들어야 하는지”를 다시 추론하지 않고 바로 작업할 수 있다.

구현을 할 때는 에이전트가 작은 단위로 가져갈 수 있게 해줘야 한다. commit을 작업단위로 해야된다는 이전 개발 방법론이 AI시대에 더 잘 먹힌다고 보면된다. 하나의 작업은 하나의 세션이나 하나의 명확한 checkpoint 안에서 끝낼 수 있을 정도로 작아야 한다.

## Cold Start보다 Warm Start가 낫다

초기화에서 이어지는 주제다.

빈 디렉터리에서 에이전트에게 프로젝트 전체 구조를 만들게 하면 결정해야 할 것이 너무 많다.

```text
빌드 도구
디렉터리 구조
테스트 framework
lint 설정
dependency 관리
Docker 구성
CI 구성
문서 구조
```

이 선택을 매번 새로 추론하게 만들 필요는 없지않나? 조직이나 개인이 반복적으로 사용하는 구조가 있다면 template으로 만들어두는 편이 좋다.

```text
backend-template/
├── AGENTS.md
├── Makefile
├── Dockerfile
├── compose.yml
├── docs/
│   ├── bootstrap.md
│   └── testing.md
├── src/
├── tests/
└── .github/
    └── workflows/
        └── check.yml
```

이렇게 템플릿을 주고 일을 시키면 에이전트는 모든 기반 구조를 처음부터 결정하는 Cold Start 대신, 이미 실행과 검증이 가능한 Warm Start 상태에서 시작한다.

## 자동화할 수 있는 것은 자동화한다

세션 시작 절차를 문서로만 적어두면 에이전트가 일부 단계를 빠뜨릴 수 있다.

가능하면 script로 만든다.

```bash
#!/usr/bin/env bash

set -euo pipefail

echo "== Repository status =="
git status --short
git log -5 --oneline

echo
echo "== Project state =="
sed -n '1,200p' PROGRESS.md

echo
echo "== Verification =="
make check
```

```bash
./scripts/init-session.sh
```

이 명령 하나로 현재 Git 상태와 진행 문서를 확인하고 baseline 검증까지 수행할 수 있다.

세션 종료도 비슷하게 자동화할 수 있다.

```bash
#!/usr/bin/env bash

set -euo pipefail

make check

if ! git diff --quiet; then
    echo "Uncommitted changes remain."
    git status --short
fi

echo "Update PROGRESS.md and DECISIONS.md before ending the session."
```

이걸 만들어두고, skill로 등록하거나 hook걸어서 작업 마무리할 때 돌아가게 하는 식으로 사용할 수 있겠다. 에이전트가 직접 검증 단계를 만드는데 context를 쓰기보다 이렇게 해주면 모든 세션이 같은 순서로 상태를 확인하고 같은 검증을 수행하게 된다!