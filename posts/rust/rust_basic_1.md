---
title: "Rust 입문하기(1)"
date: "2025-12-18"
category: "Rust"
tags: ["rust"]
---

앱 개발 스택만 가지고는 살아남을 수 없을 것이라고 판단해서, 시스템 프로그래밍 쪽을 건드려보려고 하던 중 Rust가 눈에 들어왔다. 

천천히 공부해보자. 해보면서 내가 알고있는 개념과 비슷한 건 엮어서 기술해보겠다.

학습 자료는 https://doc.rust-kr.org/title-page.html 를 사용했다.

## 환경 구성

그냥 편하게 wsl로 진행했다. linux 기반이라 macos도 편하게 쓸 수 있다.

`curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh` 로 설치하고, 새 터미널을 열어서 `rustc --version`으로 체크해준다. 

rustup 패키지로 `rustup update` rust 업데이트도 진행할 수 있다.

Hello World를 찍어보려고 한 순간! 컴파일 에러가 발생한다. macos는 모르겠으나, wsl의 경우 rustc를 빌드할 대 c linker를 쓰는데, wsl에 빌드 도구가 설치되어있지 않으면 발생하는 이슈다.

```bash
rustc ./main.rs
error: linker `cc` not found
  |
  = note: No such file or directory (os error 2)

error: aborting due to 1 previous error
```

빌드도구를 설치하자.

```bash
sudo apt update
sudo apt install build-essential
```

설치하고 나서 `cc --version`로 c컴파일러가 제대로 설치됐는 지 확인해보자.

러스트 파일의 컴파일은 rustc로 하고, 생성된 실행파일을 실행하면 된다.

```bash
rustc main.rs
./ main.rs
```

러스트는 AOT(Ahead Of Time coplied)언어로, 컴파일과 실행이 별개인 언어다. 컴파일을 미리해두면 환경이 설정되지않아도 실행파일만 갖고 써볼 수 있는 형태다.

여기서는 rustc를 사용했는데, cargo를 쓰면 여러모로 편하다고 한다.

## Hello World

```rust
fn main() {
    println!("Hello, world!");
}
```

뭔가 익숙하면서 다른 맛이 난다. main이라는 이름으로 정의된 함수가 진입점이라는 건 동일하고, 중괄호 사용 방식은 c스타일 보다는 java 쪽 느낌이다.

`println!`는 매크로 호출 코드라고 하는데 함수 호출의 경우 `println`이다. 매크로 호출과 함수 호출이 무엇인지는 나중에 나온다.

## Cargo

이건 아주 나중에라도 꼭 읽어보도록 하자. gradle 같은 친구. https://doc.rust-lang.org/cargo/

카고는 러스트 빌드 시스템 & 패키지 매니저다. 프로젝트 생성을 `cargo new [프로젝트 이름]`으로 할 수 있다.

```rust
cargo new hello_cargo
    Creating binary (application) `hello_cargo` package
note: see more `Cargo.toml` keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html
```

이러면 디렉토리와, 의존성관리를 위한 메타데이터가 담긴 toml과, hello world가 적힌 main.rs까지 만들어서 준다. 심지어 git 환경까지 만들어주는데, 이미 git 저장소라면 이건 무시된다.

toml문법 자체는 안드로이드랑 비슷해서 다행인 것 같다.

```toml
[package]
name = "hello_cargo"
version = "0.1.0"
edition = "2024"

[dependencies]
```

[package]라고 적힌 첫 번째 라인은 섹션 헤더, [dependencies]는 프로젝트에서 사용하는 의존성 목록이다. rust는 code 패키지(code files 모음)를 crate라고 부른다.

카고환경의 rust 프로젝트는 빌드,실행이 간편하다.

프로젝트 디렉토리에서 터미널을 열고, `cargo build` 하나면 컴파일해서 `/hello_cargo/target/debug/hello_cargo` 위치에 실행파일을 만들어준다.(기본 빌드가 debug)

컴파일과 실행을 한 번에 묶어서 하려면 `cargo run`으로 하면 된다!

```rust
cargo build
   Compiling hello_cargo v0.1.0 (/home/mgkim/rust-study/hello_cargo)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.46s
cargo run
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.00s
     Running `target/debug/hello_cargo`
Hello, world!
```
이미 cargo build 때 바이너리가 생겼고, 변경사항이 없기 때문에 cargo run때 compile이 일어나지 않았다.

실행파일 생성 없이 컴파일 체크만 원할 경우 `cargo check`를 사용하면 된다.

릴리즈 빌드는 `cargo build --release`로 수행한다. 릴리즈 빌드는 디버그 빌드와 다르게 컴파일 최적화 작업이 있어서 빌드시간이 오래걸리지만, 실행파일 속도는 더 빠르다.

마지막으로 dependency를 하나 추가해보자.

```toml
[dependencies]
rand = "0.8.5"
```

랜덤 함수를 갖는 rand crate를 추가했다. `0.8.5`라고 적었으나 실제로는 최소버전을 의미하는 `^0.8.5`로 cargo가 인식한다.

build하면 아래처럼 막 생기는 걸 볼 수 있다.

```bash
cargo build
    Updating crates.io index
     Locking 14 packages to latest Rust 1.92.0 compatible versions
      Adding cfg-if v1.0.4
      Adding getrandom v0.2.16
      Adding libc v0.2.178
      Adding ppv-lite86 v0.2.21
      Adding proc-macro2 v1.0.103
      Adding quote v1.0.42
      Adding rand v0.8.5 (available: v0.9.2)
      Adding rand_chacha v0.3.1
      Adding rand_core v0.6.4
      Adding syn v2.0.111
      Adding unicode-ident v1.0.22
      Adding wasi v0.11.1+wasi-snapshot-preview1
      Adding zerocopy v0.8.31
      Adding zerocopy-derive v0.8.31
  Downloaded cfg-if v1.0.4
```

rand가 동작하기 위해 의존하고 있는 다른 크레이트들도 가져와서 빌드하는 과정이다. 이렇게 의존성을 추가하면, 이 코드를 나중에 받게 될 다른 누군가와 어떻게 멱등성을 보장할까? 

`Cargo.lock`이 그 역할을 해준다.

처음 프로젝트를 빌드할 때 카고는 toml을 읽어서 모든 의존성의 버전을 확인하고 `Cargo.lock` 에 이를 기록한다. 나중에 프로젝트를 빌드하게 되면 카고는 toml 버전을 다시 확인하지 않고 `Cargo.lock` 파일이 존재하는지 확인하여 그 안에 명시된 버전들을 사용한다.

명시되어있는 crate를 사용하지않고, 최신 버전을 사용하고 싶으면 `cargo update`를 수행하면 된다.