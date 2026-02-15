---
title: "06. 열거형과 패턴 매칭"
date: "2026-02-16"
excerpt: "enum/match로 상태 공간을 타입으로 제한하고 누락 없는 분기를 구현합니다."
category: "Rust"
tags: ["rust", "rust-complete", "chapter-06"]
order: 6
level: "beginner"
draft: false
---

# 06. 열거형과 패턴 매칭

이 장에서 배우는 `enum`과 `match`는 Rust의 "설계 언어"에 가깝습니다.
가능한 상태를 타입으로 제한하고, 모든 상태를 빠짐없이 처리하게 만들면
버그를 런타임이 아니라 컴파일 타임에 잡을 수 있습니다.

## 핵심 개념과 원리

### 1) enum은 "값 + 상태"를 함께 담는 타입

```rust
enum IpAddr {
    V4(u8, u8, u8, u8),
    V6(String),
}
```

같은 이름의 타입 안에서 서로 다른 형태의 데이터를 다룰 수 있습니다.
핵심은 "가능한 케이스를 타입 차원에서 닫아 둔다"는 점입니다.

### 2) `match`는 완전성(exhaustiveness)을 강제한다

```rust
fn route(ip: IpAddr) {
    match ip {
        IpAddr::V4(a, b, c, d) => println!("v4: {a}.{b}.{c}.{d}"),
        IpAddr::V6(addr) => println!("v6: {addr}"),
    }
}
```

새 variant를 추가하면 기존 `match` 코드가 컴파일 오류를 내면서
수정 포인트를 정확히 알려 줍니다.

### 3) Option은 null을 대체한다

Rust에는 `null`이 없습니다.
대신 값이 있을 수도/없을 수도 있는 상태를 `Option<T>`로 표현합니다.

- `Some(T)`: 값 있음
- `None`: 값 없음

이 패턴 덕분에 null 체크 누락이 줄어듭니다.

## 기술적인 심화 설명

### `if let`과 `match`를 언제 쓰나?

- 케이스가 1개만 중요하면 `if let`
- 여러 케이스를 모두 다뤄야 하면 `match`

짧다고 무조건 `if let`이 좋은 건 아닙니다.
핵심 분기 로직은 `match`로 명시성을 확보하는 편이 유지보수에 유리합니다.

### Kotlin `sealed class`와 유사하지만 차이점이 있다

개념적으로는 Kotlin `sealed class` + `when`과 비슷합니다.
하지만 Rust `enum`은 언어 핵심 타입으로 매우 가볍고,
패턴 매칭이 메모리 표현과 밀접하게 최적화됩니다.

### Option/Result 조합 사고법

`Option<T>`는 "없을 수 있음", `Result<T, E>`는 "실패 이유가 있음"입니다.
없음 자체가 정상일 수 있으면 Option,
오류 메시지/복구 전략이 필요하면 Result를 쓰는 식으로 분리하세요.

## 대표 코드

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(String),
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) => {
            println!("State quarter from {state}");
            25
        }
    }
}
```

## 실습 문제 (3단계)

### 1) 기본: 상태 타입 닫기

`enum TrafficLight { Red, Yellow, Green }`를 만들고,
`fn action(light: TrafficLight) -> &'static str`를 구현하세요.

### 2) 응용: Option 기반 파서

`fn parse_port(input: &str) -> Option<u16>`를 구현하세요.

- 숫자 파싱 실패 -> `None`
- 1~65535 범위만 허용

### 3) 도전: Result로 오류 이유 전달

위 함수를 `Result<u16, String>` 버전으로 바꿔
실패 원인을 구체 메시지로 반환하세요.

## 장 특화 실습 정답

### 기본 정답 예시

```rust
enum TrafficLight {
    Red,
    Yellow,
    Green,
}

fn action(light: TrafficLight) -> &'static str {
    match light {
        TrafficLight::Red => "stop",
        TrafficLight::Yellow => "ready",
        TrafficLight::Green => "go",
    }
}
```

### 응용 정답 예시

```rust
fn parse_port(input: &str) -> Option<u16> {
    let port: u16 = input.trim().parse().ok()?;
    if port == 0 {
        None
    } else {
        Some(port)
    }
}
```

해설:

- `ok()?`로 `Result`를 `Option` 흐름에 자연스럽게 연결했습니다.
- 0번 포트 금지 같은 도메인 규칙을 추가했습니다.

### 도전 정답 예시

```rust
fn parse_port_result(input: &str) -> Result<u16, String> {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return Err("empty input".to_string());
    }

    let port: u16 = trimmed
        .parse()
        .map_err(|_| "not a valid integer".to_string())?;

    if port == 0 {
        return Err("port must be between 1 and 65535".to_string());
    }

    Ok(port)
}
```

## 오답 예시 3종 + 해설

### 오답 1) enum 대신 매직 문자열 사용

```rust
fn action(light: &str) -> &str {
    if light == "red" { "stop" } else { "go" }
}
```

문제점: 오타(`"reed"`)를 컴파일러가 못 잡습니다.
개선: 가능한 상태를 enum variant로 고정하세요.

### 오답 2) `match`에서 `_` 남용

문제점: 신규 variant가 추가돼도 `_`가 다 먹어버려 리팩터링 누락이 숨어버립니다.
개선: 핵심 도메인 분기에서는 명시 variant 매칭을 선호하세요.

### 오답 3) Option을 `unwrap`으로 강제 해제

```rust
let port = parse_port(input).unwrap();
```

문제점: `None`에서 패닉이 나고 복구 경로가 사라집니다.
개선: `match`/`if let`로 분기하거나 `Result`로 에러 이유를 반환하세요.

## 이 장에서 꼭 가져갈 습관

1. 상태 공간은 enum으로 닫아라.
2. 핵심 분기는 match 완전성을 활용해라.
3. 값 없음과 실패 이유를 Option/Result로 구분해라.

## 미니 퀴즈 (정답 포함)

1) enum + match 조합이 리팩터링에 강한 이유는?
- 정답: 신규 variant 추가 시 미처리 분기를 컴파일 오류로 즉시 알려 주기 때문입니다.

2) `Option<T>`와 `Result<T, E>`의 가장 중요한 차이는?
- 정답: `Option`은 값의 유무, `Result`는 실패 이유까지 표현한다는 점입니다.

3) `match`에서 `_`를 남용하면 어떤 문제가 생기나요?
- 정답: 신규 케이스 누락이 숨어버려 도메인 분기 버그를 늦게 발견하게 됩니다.

## 학습 완료 기준

1. 상태 공간을 enum으로 닫아 설계한다.
2. `match` 완전성을 이용해 분기 누락을 방지한다.
3. `Option`/`Result` 사용 기준을 설명한다.

## 실전 확장 미션

1. 작은 상태 머신(enum) 구현
2. `if let`/`match` 리팩터링 전후 비교

## 부가 설명: enum은 분기를 줄이는 도구다

enum을 쓰는 이유는 단순히 타입을 예쁘게 만들기 위해서가 아닙니다.
가능한 상태를 닫아 두면 if-else 체인을 계속 늘리지 않고도 안정적으로 기능을 확장할 수 있습니다.

`match` 완전성은 초반엔 번거로워 보여도, 중장기적으로 리팩터링 비용을 크게 줄여 줍니다.
새 상태를 추가할 때 수정해야 할 지점을 컴파일러가 직접 알려 주기 때문입니다.

## 아주 사소한 것까지: 용어 미니 사전

1. enum: 가능한 상태 집합을 타입으로 닫아 둡니다.
2. variant: enum의 개별 상태 항목입니다.
3. Option<T>: 값이 있거나 없음을 표현합니다.
4. Some/None: Option의 두 상태입니다.
5. exhaustive match: 모든 케이스를 다루는 매칭입니다.

## 10분 완독 보강: 심화 확장 본문

### 1) 실무 시나리오로 다시 보는 상태 공간 모델링

이 장을 실무에 가져가면 가장 먼저 부딪히는 문제는 "예제에서는 단순했는데 실제 요구사항에서는 경우의 수가 훨씬 많다"는 점입니다.
그래서 개념을 외우는 방식보다, 입력 경계와 상태 전이를 먼저 표로 정리한 뒤 코드를 작성하는 방식이 훨씬 효과적입니다.
특히 변경 요청이 들어왔을 때 어떤 부분이 안전하게 확장 가능한지 확인하려면, 지금 장에서 다룬 핵심 개념을 모듈 경계와 함수 시그니처에 명시적으로 남겨 두어야 합니다.

### 2) 설계 트레이드오프: 완전 매칭를 어디까지 강하게 가져갈 것인가

초보 단계에서는 "정답 패턴"을 그대로 쓰는 것이 좋지만, 중급 이후에는 항상 트레이드오프를 함께 봐야 합니다.
검증을 강하게 할수록 안전성은 올라가지만 코드량과 초기 진입 비용이 늘 수 있고, 반대로 빠른 구현을 택하면 단기 속도는 올라가지만 나중 수정 비용이 커집니다.
이 장에서는 안전성/가독성/성능 중 무엇이 현재 맥락에서 우선인지 먼저 정하고, 그 기준에 맞게 구현 강도를 선택하는 훈련이 중요합니다.

### 3) 디버깅 관점: 실패 모델 타입화에서 자주 생기는 실패 패턴

실패는 보통 "핵심 로직"이 아니라 경계에서 발생합니다. 입력 정규화 누락, 상태 전이 누락, 예외 경로 미처리, 로그 문맥 부족이 대표적입니다.
디버깅 속도를 높이려면 함수 단위로 사전조건/사후조건을 짧게라도 적어 두고, 실패 시 어떤 신호를 남길지(에러 타입/로그 키)를 미리 정해 두는 것이 좋습니다.
또한 동일한 문제를 반복하지 않기 위해, 이번 장에서 나온 오답 패턴을 개인 체크리스트로 변환해 다음 구현 전에 빠르게 점검하는 습관을 추천합니다.

### 4) 고급 숙련자 관점: 분기 리팩터링를 팀 규칙으로 고정하기

개인 실력은 반복으로 올라가지만, 팀 생산성은 규칙으로 올라갑니다.
이 장의 핵심 개념을 팀 규칙으로 만들려면 "코드 리뷰에서 무엇을 반드시 확인할지"를 명문화해야 합니다.
예를 들어 경계 입력 검증, 실패 모델 분리, 모듈 의존 방향, 테스트 최소 세트 같은 항목을 PR 체크리스트에 넣으면 품질 편차가 크게 줄어듭니다.
결국 고급 숙련자는 혼자 잘 짜는 사람을 넘어, 팀 전체가 같은 품질 기준으로 개발하도록 구조를 만드는 사람입니다.

