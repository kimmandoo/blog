---
title: 하네스 엔지니어링 알아보기(1)
date: 2026-07-04
category: AI
tags: [AI, harness]
---

하네스 엔지니어링은 에이전트가 덜 추론하고 검증을 더 자주 하도록 repo와 실행환경을 설계하는 일이다.

물론 프롬프트도 중요하다. 하지만 작업 범위가 커질수록 프롬프트만으로는 부족하고 구체적인 가이드가 정해져 있어야 한다. 프로젝트 상태를 어디서 읽고 어떤 검증을 돌릴지, 실패했을 때 고칠 지점까지 명확해야한다.

그 에이전트가 안정적으로 일하도록 붙여주는 scaffolding을 하네스라고 볼 수 있다.

## 왜 하네스가 필요한가

하네스 없이 에이전트에게 일을 맡기면 범위가 넓을수록 에이전트가 요구사항을 더 많이 추론해야 한다.

예를 들어 "검색 기능 만들어줘"라고만 하면 에이전트는 여러 가지를 스스로 결정해야 한다. API endpoint 이름부터 pagination 방식, 인증 정책과 test scope도 비어 있다. 기존 code style과 성능 요구사항도 마찬가지다.

지시 프롬프트가 길고 친절해도 프로젝트 안에 숨어 있는 문맥까지 전부 전달되지는 않는다. 특히 팀 안에서만 공유되던 암묵지는 에이전트 모델이 알 방법이 없다.

최근 모델들은 환경 문제를 스스로 해결하는 능력도 좋아졌다. 그래도 그 과정에서 context, 토큰과 시간이 낭비된다. 검증도 마찬가지다. test command가 없으면 에이전트는 어떤 검증을 해야 할지 추측한다. context가 부족하면 검증 없이 완료를 선언하거나 문제를 좁게 해석한 채 작업을 끝낼 수도 있다.

그래서 실패했을 때 "모델이 별로다"로 바로 결론 내리기보다 먼저 하네스를 봐야 한다.

모델을 바꿨더니 같은 작업이 성공했다면 모델 성능 차이만 보고 끝내기 어렵다. harness가 약했던 지점도 같이 봐야 한다. 더 강한 모델이 부족한 harness를 추론으로 메웠을 수 있기 때문이다. 그럴 때는 모델을 바꾸는 것보다 spec과 context를 보강하는 편이 낫다. runtime environment와 feedback loop, state management도 같이 봐주면 더 좋다.

기본적인 접근은 다음과 같다.

1. 실패를 특정 레이어에 묶어둔다. spec, context, runtime environment, feedback loop, state management 중 어디에서 실패했는지 분류한다.
2. 모든 작업에 명시적인 acceptance criteria를 둔다. "해줘"로 끝내지 않고 어떤 형식으로 어떤 기능을 만들지, 어떤 검증을 통과해야 하는지 적는다.
3. repo 안에 에이전트용 entry document를 둔다. `AGENTS.md`, `CLAUDE.md`, Cursor Rules 같은 파일이 여기에 해당한다.
4. 실패가 반복될 때마다 실패한 레이어만 고친다. 한 번에 전부 바꾸기보다 진단 루프를 작게 유지한다.
5. 개선 전후를 비교한다. 작업 단위로 성공률과 재작업 횟수, 검증 실패 원인 같은 기준을 남긴다.

Acceptance criteria는 아래처럼 구체적일수록 좋다.

```text
Acceptance criteria:
- 새 엔드포인트 GET /api/search?q=xxx
- 페이지네이션 지원, 기본 20개 항목
- 결과에 하이라이트된 스니펫 포함
- 모든 새 코드가 pytest 통과
- 타입 검사 통과 (mypy --strict)
```

이 정도만 있어도 에이전트가 추론해야 하는 영역이 크게 줄어든다.

## 하네스는 무엇으로 구성되는가

하네스를 이해할 때는 모델과 agent tool, harness를 구분하는 편이 좋다.

모델은 Claude Opus나 GPT 계열처럼 추론을 수행하는 엔진이고  Claude Code, Cursor, Codex같은 agent tool은 그 모델에 파일 읽기나 코드 편집 같은 기능을 붙인 제품에 가깝다. 셸 실행과 세션관리도 tool 쪽에 속한다. 

harness는 이 tool이 제공하는 기본 기능에 repo 안의 rule과 doc, 검증 체계까지 합친 제어 시스템이다.

주방 비유가 기가 막혔다.

| Harness element | 주방 비유 | 실제 예시 |
| --- | --- | --- |
| Instruction file | 레시피 선반 | `AGENTS.md`, `CLAUDE.md`, Cursor Rules |
| Tool access | 칼 랙 | 셸, 파일 편집, 검색, 패키지 설치 |
| Runtime environment | 가스레인지 | 로컬 환경, Docker, devcontainer |
| State management | 준비 스테이션 | `PROGRESS.md`, 세션 기록, 작업 로그 |
| Verification feedback | 품질 확인 창 | 테스트, 타입 체크, 린트, CI |

Claude Code가 `CLAUDE.md`를 읽을 수 있어도 그 파일에 프로젝트 실행 방법이 없으면 레시피 선반이 비어 있는 것과 같다. Cursor가 터미널과 파일 편집 기능을 제공해도 프로젝트별 rule이 없으면 tool만 있고 조리 순서가 없는 셈이다. Codex가 `AGENTS.md`를 읽고 작업할 수 있어도 검증 command가 명확하지 않으면 품질 확인 단계가 의미가 없을 수 있다.

여기서 중요한 건 특정 tool의 우열보다 instruction과 검증의 구체성이다. 어떤 tool을 쓰더라도 이 부분이 결과 품질을 크게 좌우한다.

## AGENTS.md는 간결하게

에이전트용 entry file은 큰 지도 역할을 한다. 다만 모든 rule을 한 파일에 길게 적는다고 좋아지지는 않는다. 길게 적어버리면 그만큼 context를 먼저 올려두고 써버리기 때문에 좋지않다. 캐싱이 있다고 해도 우리는 더 적은 토큰과 context비용으로 더 좋은 결과를 내길 원한다.

그래서 `AGENTS.md`는 100~200 줄 내외로 짧고 실용적으로 유지하는 편이 좋다. 프로젝트 개요와 실행 명령, 검증 command와 절대 지켜야 할 constraint도 여기 들어간다. 

세부 문서는 별도 docs로 빼는 편이 낫다. 에이전트가 처음 읽어야 하는 랜딩 페이지와 필요할 때 찾아갈 상세 문서를 나누는 방식이다. 상세 문서들을 나누고, 그걸 상위 문서에 링크를 걸던가 해서 md파일 몇개로 에이전트가 프로젝트를 적은비용으로 빠르게 파악하도록 돕는 과정이다.

예를 들면 이런 식이다.

1. Instruction subsystem: `AGENTS.md` 또는 `CLAUDE.md`에 프로젝트 목적과 tech stack을 적는다. 첫 실행 명령어, 절대 지켜야 할 constraint, 상세 문서 링크도 여기에 둔다.
2. Tool subsystem: 에이전트가 필요한 파일을 읽고 검색하고 테스트를 실행할 수 있게 한다. 다만 least privilege 원칙은 지킨다.
3. Environment subsystem: `pyproject.toml`, `package.json`, `.nvmrc`, `.python-version`, Docker, devcontainer처럼 runtime environment를 재현 가능하게 만든다.
4. State subsystem: 장시간 작업에는 `PROGRESS.md` 같은 진행 기록을 둔다. 완료된 것과 진행 중인 것, 차단된 것을 구분한다.
5. Feedback subsystem: 테스트와 타입 검사, 린트, 전체 검증 command를 명시한다.

검증 command가 일관성을 높이는 데 특히 효과가 좋다.

```text
# 예시임
Verification commands:
- 테스트: pytest tests/ -x
- 타입 검사: mypy src/ --strict
- 린트: ruff check src/
- 전체 검증: make check
```

모델을 바꿔가며 어떤 component가 가장 큰 영향을 주는지 비교할 수도 있다. 하지만 개인이 하나의 모델이나 tool을 주로 쓴다면 모델 간 비교보다 지금 쓰는 tool의 harness를 개선하는 쪽이 더 실용적이다.

## repo를 System of Record로 만들기

OpenAI는 repo를 System of Record(SoR)로 취급한다. 작업에 필요한 context를 구조화된 파일과 디렉터리 형태로 repo 안에 두라는 뜻이다.

이 관점을 repo가 곧 에이전트가 따라갈 spec이 된다는 의미인 `repo as spec`으로 이해할 수 있다.

요즘 에이전트는 웹 검색이나 외부 tool 호출도 꽤 잘한다. 그래도 기준 정보는 repo 안에 있는 편이 훨씬 안정적이다. 외부 문서나 팀원의 기억은 보조 자료가 될 수 있다. 채팅 기록도 마찬가지다. 하지만 실제로 작업을 통과시킬 기준은 repo에 있어야 한다.

여기서 몇 가지 개념이 중요하다.

Knowledge Visibility Gap(지식 가시성)은 전체 project knowledge 중 repo에 없는 지식의 비율이다. 격차가 클수록 에이전트는 더 많이 추론해야 하고 실패율도 높아진다. 팀 안에서는 당연한 규칙이어도 repo에 없으면 에이전트에게는 없는 정보다.

Discovery Cost(발견 비용)는 에이전트가 repo에서 핵심 정보를 찾는 데 쓰는 context 예산이다. 정보가 몇 depth 밑 디렉터리 아래 README에 숨어 있으면 존재하더라도 필요할 때 찾기 어렵다. 에이전트가 정보를 찾느라 context를 쓰면 실제 구현에 쓸 예산은 줄어든다. 이런 경로도 따로 docs로 제공하는 게 좋다. 네비게이션이라고 생각하면 이해가 빠르다.

Knowledge Decay Rate(지식 부패율)는 작업 진척에 따라 낡아지는 지식 항목의 비율이다. 문서가 코드와 동기화되지 않으면 오히려 문서가 없는 것보다 나쁠 수 있다. 에이전트는 repo 안의 문서를 권위 있는 정보로 읽기 때문이다.

Cold-Start Test는 새로 들어온 개발자나 에이전트가 repo만 보고 핵심 질문에 답할 수 있는지 확인하는 방법이다.

예를 들어 이런 질문에 답할 수 있어야 한다.

1. 이 프로젝트는 무엇을 하는가?
2. 어떻게 실행하는가?
3. 어떻게 검증하는가?
4. 절대 어기면 안 되는 constraint는 무엇인가?
5. 현재 진행 중인 작업은 무엇인가?

이 질문에 답할 수 없다면 에이전트가 이 질문에 답하기 위해 토큰을 마구 써버릴 것이다.

## repo as spec 설계

repo를 spec으로 만들려면 작업에 필요한 정보가 코드 근처에 있어야 한다.

```text
project/
├── AGENTS.md               # entry point: 프로젝트 개요, 실행 명령어, HARD constraint
├── src/
│   ├── api/
│   │   ├── ARCHITECTURE.md # API 레이어 아키텍처 결정
│   │   └── ...
│   ├── db/
│   │   ├── CONSTRAINTS.md  # 데이터베이스 작업 HARD constraint
│   │   └── ...
│   └── ...
├── PROGRESS.md             # 현재 진행 상황
└── Makefile                # 표준화된 명령어: setup, test, lint, check
```

루트의 `AGENTS.md`는 entry point다. 프로젝트가 무엇인지, 어떻게 실행하고 검증하는지 에이전트한테 알려준다. 절대 어기면 안 되는 constraint도 여기서 정의한다.

모듈별 문서는 도서관 선반 라벨이다. API 인증 rule은 API 코드 근처에 두고 DB constraint는 DB 코드 근처에 둔다. 에이전트가 해당 디렉터리에서 작업할 때 바로 볼 수 있어야 한다.

모든 지식에는 대응하는 use case가 있어야 한다. 문서에만 있고 어떤 작업에서도 쓰이지 않는 rule은 금방 낡아서 의미가 없어진다. 반대로 테스트와 린트에 연결된 rule은 매번 피드백 루프를 돌 때마다 접근하게 돼서 매우 의미있다. 

CI나 code review checklist에 연결된 rule도 마찬가지다. 이 지점에서 TDD가 AI 코딩과 궁합이 잘 맞는다고 불 수 있다.

문서와 코드는 최신 상태로 동기화되어야 한다. 아키텍처 문서를 해당 모듈 디렉터리에 두면 코드를 수정할 때 자연스럽게 문서를 보게 된다. 구조 변경 후 문서 업데이트가 필요한지 CI나 리뷰 체크리스트에서 확인하도록 만들 수도 있다.

이 설계 원칙들을 실제로 체감하게 된 계기가 있다. 새로운 세션을 열어서 작업을 시켰더니 오래된 README와 테스트 코드를 기준으로 잘못된 구현이 만들어진 적이 있었다. 이후 CHANGELOG를 따로 관리하고 `AGENTS.md`에 "구조 변경 시 문서에 반드시 기록하고, 커밋을 남긴다. 커밋 컨벤션을 아래와 같이~"라는 규칙을 추가했다. 

그 뒤로 에이전트가 낡은 문서를 기준으로 판단하는 일이 없어졌다.

## ACID로 agent state 관리하기

데이터베이스 트랜잭션의 ACID 원칙은 agent state에도 어느 정도 적용할 수 있다.

Atomicity(원자성)는 각 작업을 하나의 의미 있는 단위로 묶는 원칙이다. 한 작업이 중간에 실패했다면 성공한 것처럼 섞어두지 말고 어디까지 되었는지 명확히 남겨야 한다.

Consistency(일관성)는 작업 후 검증 조건을 통과한 상태만 완료로 보는 원칙이다. 테스트와 타입 검사, 린트와 빌드가 이 역할을 한다. 에이전트가 변경을 만들었더라도 검증을 통과하지 못했다면 아직 중간 상태에 머문다.

Isolation(격리성)은 여러 에이전트나 여러 작업이 서로의 state를 덮어쓰지 않게 하는 원칙이다. 브랜치나 worktree를 나누고 진행 파일도 작업별로 분리하면 충돌을 줄일 수 있다.

Durability(내구성)는 세션을 넘어 이어져야 하는 지식을 git으로 추적되는 파일에 남기는 원칙이다. 채팅창에만 남은 결정은 다음 세션에서 사라진다. repo에 기록된 결정만 다음 작업의 기준이 된다.

결국 harness engineering은 에이전트에게 자유를 더 주는 방향과는 거리가 있다. 오히려 좋은 constraint를 제공하는 일에 가깝다. 에이전트가 덜 추론하고 더 빨리 기준 정보를 찾고 변경 후 반드시 검증하게 만드는 구조를 repo 안에 심는 일이다.

AI 코딩의 결과가 맘에 들지 않을 때는 프롬프트나 모델만 보지 말고 repo를 봐야 한다. 에이전트가 보는 지도에 길이 빠져 있으면 아무리 좋은 모델도 돌아가거나 잘못 들어갈 수밖에 없다.