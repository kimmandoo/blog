---
title: "08. 컬렉션 실전 사용법"
date: "2026-02-16"
excerpt: "Vec/String/HashMap 선택 기준과 처리 패턴을 익힙니다."
category: "Rust"
tags: ["rust", "rust-complete", "chapter-08"]
order: 8
level: "intermediate"
draft: false
---

# 08. 컬렉션 실전 사용법

Chapter 8은 Rust에서 "데이터를 실제로 다루는 방식"을 배우는 구간입니다.
여기서 중요한 질문은 문법이 아니라 "이 상황에서 Vec/String/HashMap 중 무엇을 선택할까"입니다.
자료구조 선택이 성능, 가독성, 버그 가능성을 한 번에 바꿉니다.

## 핵심 개념과 원리

### 1) `Vec<T>`: 순차 데이터의 기본 컨테이너

`Vec`는 힙에 연속 메모리로 저장되어 순회가 빠르고 사용성이 좋습니다.

- 추가: `push`
- 읽기: 인덱스(`v[i]`) 또는 안전 조회(`v.get(i)`)
- 변환: iterator(`iter`, `iter_mut`, `into_iter`)

인덱스 접근은 범위 밖에서 panic할 수 있으므로,
외부 입력 기반 인덱스는 `get`을 우선 고려하세요.

### 2) `String`: UTF-8 문자열은 바이트 배열이다

Rust `String`은 UTF-8 바이트 시퀀스입니다.
그래서 `s[0]` 같은 문자 인덱싱이 허용되지 않습니다.
"몇 번째 문자"는 고정 오프셋이 아니기 때문입니다.

문자 단위 처리는 `chars()`, 바이트 단위 처리는 `bytes()`를 사용하세요.

### 3) `HashMap<K, V>`: 키 기반 집계/조회

카운팅, 그룹핑, 캐싱처럼 "키로 값 찾기"가 핵심일 때 사용합니다.
특히 `entry` API를 쓰면 존재 여부 분기를 한 번에 처리할 수 있습니다.

## 기술적인 심화 설명

### 소유권과 컬렉션

컬렉션에 값을 넣는 순간 소유권이 이동할 수 있습니다.

```rust
let mut v = Vec::new();
let s = String::from("hi");
v.push(s);
// println!("{s}"); // move로 인해 사용 불가
```

참조를 넣을지, 소유 값을 넣을지 설계를 먼저 결정해야 합니다.

### `entry` 패턴은 실수 방지 장치

```rust
*map.entry(word).or_insert(0) += 1;
```

키가 없으면 초기화, 있으면 갱신을 원자적으로 표현합니다.
중복 `if contains_key` 분기를 줄여 실수를 줄입니다.

### Kotlin 컬렉션과 비교

Kotlin도 `MutableList`, `MutableMap`이 있지만,
Rust는 소유권과 가변성 규칙이 컬렉션 API 사용 방식에 더 강하게 반영됩니다.
즉, "변경 가능한 참조를 언제 열고 닫을지"를 더 명시적으로 다루게 됩니다.

## 대표 코드

```rust
use std::collections::HashMap;

fn word_count(sentence: &str) -> HashMap<String, usize> {
    let mut counts = HashMap::new();

    for word in sentence.split_whitespace() {
        let normalized = word.to_lowercase();
        *counts.entry(normalized).or_insert(0) += 1;
    }

    counts
}
```

## 실습 문제 (3단계)

### 1) 기본: Vec 안전 조회

정수 `Vec`를 만들고,
인덱스 0, 2, 99를 조회해 `get` 기반으로 결과를 출력하세요.

### 2) 응용: 문자열 통계

문장에서 모음(a,e,i,o,u) 개수를 세는 함수를 작성하세요.
대소문자 구분 없이 처리하고, UTF-8 문자 순회를 명시적으로 사용하세요.

### 3) 도전: 부서별 인원 집계기

`"alice engineering"` 같은 입력 목록을 받아
`HashMap<String, Vec<String>>` 형태로 부서별 이름을 모으세요.
이름은 사전순 정렬해 출력하세요.

## 장 특화 실습 정답

### 기본 정답 예시

```rust
let nums = vec![10, 20, 30];

for idx in [0usize, 2, 99] {
    match nums.get(idx) {
        Some(v) => println!("idx {idx}: {v}"),
        None => println!("idx {idx}: out of range"),
    }
}
```

### 응용 정답 예시

```rust
fn vowel_count(input: &str) -> usize {
    input
        .chars()
        .filter(|c| matches!(c.to_ascii_lowercase(), 'a' | 'e' | 'i' | 'o' | 'u'))
        .count()
}
```

해설:

- `chars()`를 통해 문자 단위로 순회했습니다.
- ASCII 모음 집계 목적이라 `to_ascii_lowercase`를 사용했습니다.

### 도전 정답 예시

```rust
use std::collections::HashMap;

fn group_by_dept(lines: &[&str]) -> HashMap<String, Vec<String>> {
    let mut map: HashMap<String, Vec<String>> = HashMap::new();

    for line in lines {
        let mut parts = line.split_whitespace();
        let name = match parts.next() {
            Some(v) => v,
            None => continue,
        };
        let dept = match parts.next() {
            Some(v) => v,
            None => continue,
        };

        map.entry(dept.to_string())
            .or_default()
            .push(name.to_string());
    }

    for names in map.values_mut() {
        names.sort();
    }

    map
}
```

## 오답 예시 3종 + 해설

### 오답 1) Vec 인덱싱 남용

```rust
let value = nums[99];
```

문제점: 범위를 벗어나면 panic이 발생합니다.
개선: 외부 입력 기반 조회는 `get`으로 안전하게 처리하세요.

### 오답 2) 문자열 바이트를 문자처럼 취급

문제점: UTF-8 다바이트 문자를 잘못 자르거나 깨뜨릴 수 있습니다.
개선: 문자 처리 목적이면 `chars()`/`char_indices()`를 사용하세요.

### 오답 3) HashMap 집계 시 contains_key + get_mut 이중 분기

문제점: 코드가 길어지고 분기 누락 가능성이 커집니다.
개선: `entry(...).or_insert(...)` 또는 `or_default()` 패턴으로 단순화하세요.

## 이 장에서 꼭 가져갈 습관

1. 컬렉션 선택 기준을 먼저 세운다.
2. 문자열은 UTF-8 경계를 의식한다.
3. 집계 코드는 entry API로 일관화한다.

## 미니 퀴즈 (정답 포함)

1) 외부 입력 인덱스 조회에서 `v[i]`보다 `get(i)`를 우선하는 이유는?
- 정답: 범위를 벗어난 접근에서 panic 대신 `Option`으로 안전하게 처리할 수 있기 때문입니다.

2) Rust `String`이 문자 인덱싱을 허용하지 않는 핵심 이유는?
- 정답: UTF-8은 문자 길이가 가변이어서 고정 인덱스로 안전한 문자 접근을 보장할 수 없기 때문입니다.

3) HashMap 집계에서 `entry` API가 유리한 이유는?
- 정답: 키 존재 여부 분기를 한 번에 처리해 코드 중복과 누락 가능성을 줄이기 때문입니다.

## 학습 완료 기준

1. Vec/String/HashMap 선택 기준을 말할 수 있다.
2. UTF-8 문자열 처리에서 안전 API를 사용한다.
3. `entry` 기반 집계를 구현한다.

## 실전 확장 미션

1. 단어 빈도 분석기 + 정렬 출력
2. HashMap 값 타입을 구조체로 확장

## 부가 설명: 컬렉션 선택은 성능보다 먼저 의미를 본다

초반에는 미세한 성능보다 데이터 의미에 맞는 자료구조 선택이 더 중요합니다.
순서가 중요한지, 키 조회가 중요한지, 문자열 경계를 어떻게 다뤄야 하는지를 먼저 결정하세요.

특히 `String`은 문자 배열이 아니라 UTF-8 바이트 시퀀스라는 점을 계속 의식해야 합니다.
이 감각이 잡히면 슬라이싱/검색/정규화 로직의 버그를 크게 줄일 수 있습니다.

## 아주 사소한 것까지: 용어 미니 사전

1. Vec<T>: 가변 길이 순차 컬렉션입니다.
2. String: UTF-8 가변 문자열 타입입니다.
3. &str: 문자열 슬라이스(참조) 타입입니다.
4. HashMap<K, V>: 키-값 기반 컬렉션입니다.
5. entry API: 키 존재 여부 분기를 한 번에 처리하는 API입니다.

## 10분 완독 보강: 심화 확장 본문

### 1) 실무 시나리오로 다시 보는 자료구조 선택

이 장을 실무에 가져가면 가장 먼저 부딪히는 문제는 "예제에서는 단순했는데 실제 요구사항에서는 경우의 수가 훨씬 많다"는 점입니다.
그래서 개념을 외우는 방식보다, 입력 경계와 상태 전이를 먼저 표로 정리한 뒤 코드를 작성하는 방식이 훨씬 효과적입니다.
특히 변경 요청이 들어왔을 때 어떤 부분이 안전하게 확장 가능한지 확인하려면, 지금 장에서 다룬 핵심 개념을 모듈 경계와 함수 시그니처에 명시적으로 남겨 두어야 합니다.

### 2) 설계 트레이드오프: UTF-8 문자열 처리를 어디까지 강하게 가져갈 것인가

초보 단계에서는 "정답 패턴"을 그대로 쓰는 것이 좋지만, 중급 이후에는 항상 트레이드오프를 함께 봐야 합니다.
검증을 강하게 할수록 안전성은 올라가지만 코드량과 초기 진입 비용이 늘 수 있고, 반대로 빠른 구현을 택하면 단기 속도는 올라가지만 나중 수정 비용이 커집니다.
이 장에서는 안전성/가독성/성능 중 무엇이 현재 맥락에서 우선인지 먼저 정하고, 그 기준에 맞게 구현 강도를 선택하는 훈련이 중요합니다.

### 3) 디버깅 관점: 집계 패턴에서 자주 생기는 실패 패턴

실패는 보통 "핵심 로직"이 아니라 경계에서 발생합니다. 입력 정규화 누락, 상태 전이 누락, 예외 경로 미처리, 로그 문맥 부족이 대표적입니다.
디버깅 속도를 높이려면 함수 단위로 사전조건/사후조건을 짧게라도 적어 두고, 실패 시 어떤 신호를 남길지(에러 타입/로그 키)를 미리 정해 두는 것이 좋습니다.
또한 동일한 문제를 반복하지 않기 위해, 이번 장에서 나온 오답 패턴을 개인 체크리스트로 변환해 다음 구현 전에 빠르게 점검하는 습관을 추천합니다.

### 4) 고급 숙련자 관점: 메모리/성능 균형를 팀 규칙으로 고정하기

개인 실력은 반복으로 올라가지만, 팀 생산성은 규칙으로 올라갑니다.
이 장의 핵심 개념을 팀 규칙으로 만들려면 "코드 리뷰에서 무엇을 반드시 확인할지"를 명문화해야 합니다.
예를 들어 경계 입력 검증, 실패 모델 분리, 모듈 의존 방향, 테스트 최소 세트 같은 항목을 PR 체크리스트에 넣으면 품질 편차가 크게 줄어듭니다.
결국 고급 숙련자는 혼자 잘 짜는 사람을 넘어, 팀 전체가 같은 품질 기준으로 개발하도록 구조를 만드는 사람입니다.

