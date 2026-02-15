---
title: "05. 구조체와 메서드 설계"
date: "2026-02-16"
excerpt: "struct/impl을 통해 도메인 모델과 책임을 명확히 분리합니다."
category: "Rust"
tags: ["rust", "rust-complete", "chapter-05"]
order: 5
level: "beginner"
draft: false
---

# 05. 구조체와 메서드 설계

Chapter 5의 핵심은 "struct 문법"이 아닙니다.
도메인 데이터를 어떤 타입으로 묶고, 그 타입의 불변식을 어디서 보장할지를 설계하는 훈련입니다.
이 장을 잘 익히면 함수 파라미터 지옥에서 빠르게 탈출할 수 있습니다.

## 핵심 개념과 원리

### 1) 구조체는 관련 상태를 한 덩어리로 묶는 도구

예를 들어 사용자 정보를 함수마다 `(name, email, active, sign_in_count)`로 전달하면,
필드 순서 오류나 누락이 아주 쉽게 발생합니다.
`struct User`로 묶으면 의미 단위가 명확해지고 시그니처가 안정됩니다.

```rust
struct User {
    username: String,
    email: String,
    active: bool,
    sign_in_count: u64,
}
```

### 2) `impl`은 "행동의 집"이다

Rust에서는 데이터(`struct`)와 행동(`impl`)을 붙여서 설계합니다.
이때 메서드는 단순 편의 함수가 아니라 타입 불변식을 지키는 경계입니다.

예: `Rectangle`의 넓이 계산은 `width * height` 규칙을 언제나 동일하게 적용해야 하므로,
메서드로 두는 편이 안전합니다.

### 3) 연관 함수(associated function)로 생성 정책 통일

`new` 같은 연관 함수에서 검증을 강제하면
잘못된 상태의 인스턴스 생성을 막을 수 있습니다.

## 기술적인 심화 설명

### 필드 공개(`pub`)를 최소화해야 하는 이유

필드를 전부 `pub`로 열면 어디서든 상태를 바꿀 수 있어 불변식이 깨집니다.
Rust Book의 초반 예제는 학습 목적이지만, 실무에서는 보통 필드를 감추고 메서드/생성자로 통제합니다.

### 구조체 업데이트 문법의 move 특성

```rust
let user2 = User {
    email: String::from("new@example.com"),
    ..user1
};
```

`..user1`은 copy 가능한 필드는 복사하고, `String` 같은 소유 타입은 move합니다.
그래서 업데이트 이후 `user1`을 그대로 쓰려면 clone 여부를 의식해야 합니다.

### Kotlin `data class`와의 차이

Kotlin `data class`는 자동 `copy`, `equals`, `hashCode`가 강력합니다.
Rust는 자동 생성 범위를 trait(`Debug`, `Clone`, `PartialEq`) derive로 명시합니다.
즉, "무엇을 자동화할지"를 개발자가 더 의식적으로 선택합니다.

## 대표 코드

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }

    fn square(size: u32) -> Rectangle {
        Rectangle {
            width: size,
            height: size,
        }
    }
}
```

## 실습 문제 (3단계)

### 1) 기본: 도메인 구조체 만들기

`struct Product { name, price, stock }`를 만들고,
`impl`에 `is_sold_out(&self) -> bool`를 추가하세요.

### 2) 응용: 생성 정책 통일

`Product::new(name: &str, price: u32, stock: u32) -> Product`를 만들고,
빈 이름이면 `"unknown"`으로 보정하세요.

### 3) 도전: 불변식 강화

가격 0원 제품을 생성하지 못하게 하고 싶다면
반환 타입을 `Result<Product, String>`로 바꿔 생성 오류를 표현하세요.

## 장 특화 실습 정답

### 기본 정답 예시

```rust
struct Product {
    name: String,
    price: u32,
    stock: u32,
}

impl Product {
    fn is_sold_out(&self) -> bool {
        self.stock == 0
    }
}
```

### 응용 정답 예시

```rust
impl Product {
    fn new(name: &str, price: u32, stock: u32) -> Product {
        let normalized = if name.trim().is_empty() { "unknown" } else { name.trim() };
        Product {
            name: normalized.to_string(),
            price,
            stock,
        }
    }
}
```

해설:

- 생성 시점에 정규화하면 이후 코드가 단순해집니다.
- "모든 인스턴스가 최소 품질을 만족"하도록 만들 수 있습니다.

### 도전 정답 예시

```rust
impl Product {
    fn try_new(name: &str, price: u32, stock: u32) -> Result<Product, String> {
        if price == 0 {
            return Err("price must be greater than 0".to_string());
        }
        let normalized = if name.trim().is_empty() { "unknown" } else { name.trim() };
        Ok(Product {
            name: normalized.to_string(),
            price,
            stock,
        })
    }
}
```

## 오답 예시 3종 + 해설

### 오답 1) 필드 나열 파라미터 폭증

```rust
fn print_user(name: String, email: String, active: bool, sign_in_count: u64) {}
```

문제점: 파라미터 순서 실수와 호출부 가독성 저하가 발생합니다.
개선: 관련 데이터는 구조체 하나로 묶어 전달하세요.

### 오답 2) 필드를 전부 `pub`로 공개

문제점: 외부 코드가 임의 상태를 만들 수 있어 불변식 관리가 무너집니다.
개선: 내부 필드는 숨기고 필요한 행동만 메서드로 공개하세요.

### 오답 3) 생성 검증 없이 인스턴스 무분별 생성

문제점: 빈 이름, 0원 가격 같은 잘못된 상태가 시스템에 퍼집니다.
개선: `new/try_new`를 단일 진입점으로 삼아 생성 정책을 고정하세요.

## 이 장에서 꼭 가져갈 습관

1. 데이터 묶음은 즉시 구조체로 승격한다.
2. 불변식은 생성 시점에서 강제한다.
3. `impl`을 통해 타입 중심 설계를 유지한다.

## 미니 퀴즈 (정답 포함)

1) 구조체를 도입하면 함수 시그니처가 왜 안정되나요?
- 정답: 관련 필드를 의미 단위로 묶어 인자 순서/누락 실수를 줄이고 의도를 명확히 만들기 때문입니다.

2) `new/try_new` 같은 연관 함수를 두는 이유는?
- 정답: 생성 정책과 검증 규칙을 단일 진입점에 고정해 잘못된 상태 생성을 차단하기 위해서입니다.

3) 필드를 무조건 `pub`로 열지 않는 이유는?
- 정답: 외부 임의 변경으로 불변식이 깨지는 것을 막고 내부 리팩터링 자유도를 유지하기 위해서입니다.

## 학습 완료 기준

1. 도메인 데이터를 구조체로 모델링한다.
2. `new/try_new`로 생성 불변식을 강제한다.
3. 필드 공개 범위를 최소화한다.

## 실전 확장 미션

1. 주문/결제 도메인 구조체 3개 설계
2. `Debug/Clone/PartialEq` derive 선택 근거 작성

## 부가 설명: 구조체 설계 품질을 올리는 체크포인트

좋은 구조체는 필드를 많이 담는 타입이 아니라 **도메인 규칙을 지키는 타입**입니다.
필드 의미가 애매하면 이름을 바꾸고, 잘못된 상태가 가능하면 생성자에서 차단하는 방식으로 모델을 다듬으세요.

`impl` 메서드는 편의 함수 모음이 아니라 정책 계층입니다.
"이 타입이 어떤 상태를 허용하는가"를 코드로 고정한다고 생각하면 설계 품질이 크게 올라갑니다.

## 아주 사소한 것까지: 용어 미니 사전

1. struct: 관련 데이터를 하나의 타입으로 묶는 도구입니다.
2. impl: 타입에 메서드/연관 함수를 붙이는 블록입니다.
3. associated function: `Type::new()`처럼 타입에 귀속된 함수입니다.
4. invariant: 항상 지켜야 하는 상태 규칙입니다.
5. derive: 트레잇 구현을 자동 생성하는 속성입니다.

## 10분 완독 보강: 심화 확장 본문

### 1) 실무 시나리오로 다시 보는 도메인 모델링

이 장을 실무에 가져가면 가장 먼저 부딪히는 문제는 "예제에서는 단순했는데 실제 요구사항에서는 경우의 수가 훨씬 많다"는 점입니다.
그래서 개념을 외우는 방식보다, 입력 경계와 상태 전이를 먼저 표로 정리한 뒤 코드를 작성하는 방식이 훨씬 효과적입니다.
특히 변경 요청이 들어왔을 때 어떤 부분이 안전하게 확장 가능한지 확인하려면, 지금 장에서 다룬 핵심 개념을 모듈 경계와 함수 시그니처에 명시적으로 남겨 두어야 합니다.

### 2) 설계 트레이드오프: 불변식 유지를 어디까지 강하게 가져갈 것인가

초보 단계에서는 "정답 패턴"을 그대로 쓰는 것이 좋지만, 중급 이후에는 항상 트레이드오프를 함께 봐야 합니다.
검증을 강하게 할수록 안전성은 올라가지만 코드량과 초기 진입 비용이 늘 수 있고, 반대로 빠른 구현을 택하면 단기 속도는 올라가지만 나중 수정 비용이 커집니다.
이 장에서는 안전성/가독성/성능 중 무엇이 현재 맥락에서 우선인지 먼저 정하고, 그 기준에 맞게 구현 강도를 선택하는 훈련이 중요합니다.

### 3) 디버깅 관점: 생성자 설계에서 자주 생기는 실패 패턴

실패는 보통 "핵심 로직"이 아니라 경계에서 발생합니다. 입력 정규화 누락, 상태 전이 누락, 예외 경로 미처리, 로그 문맥 부족이 대표적입니다.
디버깅 속도를 높이려면 함수 단위로 사전조건/사후조건을 짧게라도 적어 두고, 실패 시 어떤 신호를 남길지(에러 타입/로그 키)를 미리 정해 두는 것이 좋습니다.
또한 동일한 문제를 반복하지 않기 위해, 이번 장에서 나온 오답 패턴을 개인 체크리스트로 변환해 다음 구현 전에 빠르게 점검하는 습관을 추천합니다.

### 4) 고급 숙련자 관점: 메서드 책임 분리를 팀 규칙으로 고정하기

개인 실력은 반복으로 올라가지만, 팀 생산성은 규칙으로 올라갑니다.
이 장의 핵심 개념을 팀 규칙으로 만들려면 "코드 리뷰에서 무엇을 반드시 확인할지"를 명문화해야 합니다.
예를 들어 경계 입력 검증, 실패 모델 분리, 모듈 의존 방향, 테스트 최소 세트 같은 항목을 PR 체크리스트에 넣으면 품질 편차가 크게 줄어듭니다.
결국 고급 숙련자는 혼자 잘 짜는 사람을 넘어, 팀 전체가 같은 품질 기준으로 개발하도록 구조를 만드는 사람입니다.

