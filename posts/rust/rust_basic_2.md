---
title: "Rust 입문하기(2)"
date: "2025-12-23"
category: "Rust"
tags: ["rust"]
---

환경 설정을 끝내고 코드를 치기 시작했다. hello world를 넘어 변수를 선언하고 제어문을 써보는데, 기존에 쓰던 코틀린과 비슷한 부분이 좀 있다.

### 변수와 가변성 (Variables and Mutability)

러스트의 가장 큰 특징은 기본이 불변(Immutable)이라는 것이다.

```rust
fn var1() {
    let x = 5;
    println!("The value of x is: {}", x);
    // x = 6; // 컴파일 에러: cannot assign twice to immutable variable `x`
}
```

let으로 선언한 변수는 값을 바꿀 수 없다. 값을 바꾸려면 반드시 mut 키워드를 붙여야 한다.

```rust
fn var2() {
    let mut x = 5; // 가변 변수 선언
    println!("value of x is: {x}");
    x = 6;
    println!("value of x is: {x}");
}
```

보통 다른 언어들은 기본이 가변(mutable)이고, 불변이 필요하면 final이나 const를 붙인다. 러스트는 왜 반대일까?

- 안전성 (Safety): 데이터가 의도치 않게 변경되는 사이드 이펙트(Side Effect)를 방지한다. 코드가 길어질수록 어디서 값이 바뀌었는지 추적하기 힘든데, 러스트는 mut이 없는 변수는 "절대 안 바뀜"을 보장하므로 디버깅이 쉬워진다.
- 동시성 (Concurrency): 멀티스레드 환경에서 불변 데이터는 락(Lock) 없이도 안전하게 공유할 수 있다. 러스트는 태생부터 병렬 처리에 강하도록 설계되었다.

### 섀도잉 (Shadowing)

러스트에는 mut과는 다른, 섀도잉(Shadowing)이라는 독특한 개념이 있다. 이미 선언된 변수 이름을 다시 let으로 선언해서 덮어쓰는 것이다.

Rust

```rust
fn shadowing() {
    let x = 5;
    let x = x + 1; // 기존 x를 가리고 새로운 x를 생성

    {
        let x = x * 2; // 내부 스코프에서 또 섀도잉
        println!("Inner x: {x}"); // 12
    }
    // 스코프가 끝나면 내부 x는 사라지고, 바깥 x가 다시 보임
    println!("Outer x: {x}"); // 6
}
```

mut 쓰면 되는데 왜 굳이 섀도잉을 쓰냐는 물음에는 타입 변경을 답으로 할 수 있겠다.

```rust
let spaces = "   ";       // String 타입
let spaces = spaces.len(); // usize (정수) 타입으로 재선언
```

만약 섀도잉이 없다면 우리는 spaces_str, spaces_num 처럼 이름을 억지로 다르게 지어야 한다. 

섀도잉을 쓰면 변수의 논리적인 의미는 유지하면서 데이터의 형태만 변환할 때, 변수명을 재활용할 수 있어 코드가 깔끔해진다. (물론 mut 변수는 타입 변경이 불가능하다.)

러스트는 정적 타입 언어이기 때문에 컴파일 시점에 모든 변수의 타입이 확정되어야 한다.

u8 (0~255) 타입에 256을 넣으면 어떻게 될까?

- Debug 모드: 컴파일러가 패닉(Panic)을 일으키며 프로그램을 종료시킨다.
- Release 모드: 2의 보수 감싸기(Two's Complement Wrapping)를 수행하여 0이 된다.

러스트는 개발 단계(Debug)에서는 오버플로우를 "버그"로 간주하고 엄격하게 잡지만, 배포 단계(Release)에서는 성능을 위해 추가 검사를 건너뛰는 유연함을 보여준다.

C/C++에서 char는 1바이트지만, 러스트의 char는 4바이트다.

`let heart_eyed_cat = '😻';`

더 이상 ASCII만으로는 세상의 문자를 표현할 수 없음을 rust도 알기 때문에 char부터 유니코드를 지원해 이모지나 한글 처리에 있어 별도의 라이브러리 없이도 안전하다.

```rust
let a = [1, 2, 3, 4, 5];
// let index = 10;
// let element = a[index]; // 런타임 에러(Panic) 발생!
```

유효하지 않은 인덱스에 접근하면 러스트는 즉시 프로그램을 종료(Panic)시킨다. 

C언어 같은 경우 허용되지 않은 메모리 영역을 읽어서 쓰레기 값을 뱉거나 최악의 경우 버퍼 오버플로우 보안 취약점으로 이어질 수 있지만 러스트는 "잘못된 메모리를 건드리느니 차라리 죽겠다"는 철학을 가지고 있다.

### 구문(Statement)과 표현식(Expression)

- 구문 (Statement): 명령을 수행하고 값을 반환하지 않음. (예: `let y = 6;`)
- 표현식 (Expression): 결과 값을 평가해서 반환함. (예: `5 + 6`, `x + 1`)

가장 중요한 차이는 세미콜론(;)의 유무다.

```rust
fn five() -> i32 {
    5  // 세미콜론 없음 -> 표현식 -> 5를 반환 (return 5와 동일)
}

fn error_func() -> i32 {
    // 5; // 세미콜론 있음 -> 구문 -> 반환값이 없음(Unit) -> 컴파일 에러!
}
```

함수형 프로그래밍의 영향을 받은 것으로 보이는데, 불필요한 return 키워드 입력을 줄여주고 코드를 "값의 흐름"으로 보게 만든다.

```rust
let y = {
    let x = 3;
    x + 1 // 이 블록 자체가 4라는 값으로 평가됨
}; // 그래서 y에 4가 들어감
```

이런 식으로 블록 {} 자체가 하나의 값이 되는 구조는 코드를 매우 간결하게 만들어준다.

### 제어문과 안전한 반복

if는 표현식이므로 값을 반환한다.

`let number = if condition { 5 } else { 6 };`

자바나 C의 삼항 연산자(condition ? 5 : 6)가 러스트엔 없다. 대신 if 자체가 값을 뱉으므로 굳이 삼항 연산자가 필요 없다.

러스트는 while이나 loop보다 for 사용을 강력하게 권장한다.

```rust
// 권장하지 않음 (while)
let a = [10, 20, 30];
let mut index = 0;
while index < 3 {
    println!("{}", a[index]); // 컴파일러가 매번 경계 검사를 수행함 (성능 저하)
    index += 1;
}

// 권장함 (for)
for element in a {
    println!("{element}"); // 안전하고 빠름
}
```

왜 for가 더 좋을까? for는 인덱스를 직접 다루지 않으므로 Index Out of Bounds 에러가 날 가능성이 0%다.

또한 while문 내에서 a[index]에 접근할 때는 런타임에 매번 "이 인덱스가 배열 길이보다 작은가?"를 검사해야 한다.

하지만 for element in a는 이터레이터가 내부적으로 범위를 알고 있기 때문에 경계 검사를 생략할 수 있어 실행 속도가 더 빠르다.