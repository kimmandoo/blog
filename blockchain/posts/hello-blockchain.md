---
title: "블록체인이란 무엇인가"
date: "2026-02-08"
excerpt: "블록체인의 기본 개념과 동작 원리를 알아봅니다."
category: "기초"
tags: ["blockchain", "distributed-ledger", "consensus"]
---

# 블록체인이란 무엇인가

블록체인은 분산 원장 기술(Distributed Ledger Technology)의 한 형태로, 데이터를 블록 단위로 저장하고 이를 체인처럼 연결하는 구조입니다.

## 핵심 개념

- **분산 원장**: 중앙 서버 없이 네트워크 참여자 모두가 동일한 데이터를 공유
- **합의 알고리즘**: 네트워크 참여자 간의 데이터 동기화를 위한 메커니즘
- **불변성**: 한번 기록된 데이터는 변경이 불가능

## 블록의 구조

각 블록은 다음과 같은 정보를 포함합니다:

1. 이전 블록의 해시값
2. 현재 블록의 트랜잭션 데이터
3. 타임스탬프
4. 논스(Nonce)

```
Block N-1          Block N            Block N+1
+-----------+      +-----------+      +-----------+
| Prev Hash |<-----| Prev Hash |<-----| Prev Hash |
| Data      |      | Data      |      | Data      |
| Timestamp |      | Timestamp |      | Timestamp |
| Nonce     |      | Nonce     |      | Nonce     |
+-----------+      +-----------+      +-----------+
```

## 합의 알고리즘

대표적인 합의 알고리즘으로는 다음이 있습니다:

- **PoW (Proof of Work)**: 비트코인에서 사용, 연산력 기반
- **PoS (Proof of Stake)**: 이더리움 2.0에서 사용, 지분 기반
- **DPoS (Delegated Proof of Stake)**: EOS에서 사용, 위임 지분 기반

블록체인 기술은 암호화폐뿐만 아니라 공급망 관리, 디지털 신원 확인, 스마트 계약 등 다양한 분야에서 활용되고 있습니다.
