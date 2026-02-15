from pathlib import Path


BASE = Path("C:/Users/mingy/Desktop/blog/blog/rust/posts")


CHS = {
    0: {
        "file": "00-roadmap.md",
        "title": "00. Rust 완전학습 로드맵",
        "excerpt": "기초부터 실전 프로젝트까지 Rust를 한 흐름으로 학습하기 위한 전체 지도입니다.",
        "level": "beginner",
    },
    1: {
        "file": "01-installation-and-hello-cargo.md",
        "title": "01. 설치와 개발환경 세팅",
        "excerpt": "rustup/cargo를 중심으로 재현 가능한 Rust 개발환경을 구성합니다.",
        "level": "beginner",
        "source": "Chapter 1",
        "k1": "toolchain 관리",
        "k2": "cargo 명령 루프",
        "k3": "재현 가능한 빌드",
        "code": """```bash
rustup update
rustup show
cargo new hello_rust
cd hello_rust
cargo check
cargo run
```""",
        "exercise": "디버그/릴리즈 빌드 차이를 확인하고 `cargo check`를 포함한 본인 개발 루틴을 작성하세요.",
        "answer": """```text
루틴 예시:
1) 구현 중: cargo check 반복
2) 기능 확인: cargo run
3) 커밋 전: cargo test && cargo build --release
```""",
        "wrong": """```bash
cargo run
cargo run
cargo run
```""",
        "why": "매 수정마다 run만 실행하면 빌드/실행 비용이 커져 피드백 속도가 느려집니다.",
        "fix": """```bash
cargo check
# 기능 확인 시점에만
cargo run
```""",
    },
    2: {
        "file": "02-guessing-game.md",
        "title": "02. 첫 프로그램: 추리 게임 만들기",
        "excerpt": "입력/파싱/분기/반복을 실제 프로그램 흐름으로 학습합니다.",
        "level": "beginner",
        "source": "Chapter 2",
        "k1": "입력 경계 처리",
        "k2": "파싱 실패 처리",
        "k3": "상태 기반 반복",
        "code": """```rust
let mut guess = String::new();
std::io::stdin().read_line(&mut guess).expect("read");
let n: u32 = guess.trim().parse().expect("number");
println!("{n}");
```""",
        "exercise": "1~100 범위가 아닌 입력을 거부하고 재입력받도록 확장하세요.",
        "answer": """```rust
loop {
    let mut guess = String::new();
    std::io::stdin().read_line(&mut guess).expect("read error");
    match guess.trim().parse::<u32>() {
        Ok(n) if (1..=100).contains(&n) => { println!("ok: {n}"); break; }
        _ => println!("1~100 숫자를 입력하세요."),
    }
}
```""",
        "wrong": """```rust
let n: u32 = guess.parse().unwrap();
```""",
        "why": "개행/공백 제거 없이 파싱하면 실패가 잦고, unwrap은 사용자 오류를 패닉으로 바꿉니다.",
        "fix": """```rust
let n: u32 = guess.trim().parse().expect("valid number required");
```""",
    },
    3: {
        "file": "03-common-programming-concepts.md",
        "title": "03. 공통 프로그래밍 개념",
        "excerpt": "변수, 함수, 제어흐름을 Rust의 표현식 중심 문법으로 이해합니다.",
        "level": "beginner",
        "source": "Chapter 3",
        "k1": "표현식 중심 문법",
        "k2": "타입 추론과 명시",
        "k3": "if/loop/for 선택 기준",
        "code": """```rust
fn square(x: i32) -> i32 { x * x }
let y = if square(3) > 5 { 1 } else { 0 };
```""",
        "exercise": "if 표현식으로 점수 등급 함수를 구현하고 세미콜론 위치 차이를 실험하세요.",
        "answer": """```rust
fn grade(score: i32) -> &'static str {
    if score >= 90 { "A" }
    else if score >= 80 { "B" }
    else { "C" }
}
```""",
        "wrong": """```rust
if score >= 90 { "A"; } else { "B"; }
```""",
        "why": "세미콜론으로 표현식 값이 사라져 반환 타입 불일치가 생깁니다.",
        "fix": """```rust
if score >= 90 { "A" } else { "B" }
```""",
    },
}


REST_META = [
    (4, "04-understanding-ownership.md", "04. 소유권과 빌림의 원리", "ownership/borrow/slice를 통해 메모리 안전성 원리를 이해합니다.", "beginner", "Chapter 4", "소유권 이동", "참조와 가변 참조", "슬라이스와 수명"),
    (5, "05-using-structs.md", "05. 구조체와 메서드 설계", "struct/impl로 도메인 모델을 명확하게 표현합니다.", "beginner", "Chapter 5", "구조체 설계", "impl 책임", "연관 함수"),
    (6, "06-enums-and-pattern-matching.md", "06. 열거형과 패턴 매칭", "enum/match로 상태 공간을 타입으로 제한합니다.", "beginner", "Chapter 6", "enum 모델링", "exhaustive match", "Option/Result 처리"),
    (7, "07-managing-projects-with-packages-crates-modules.md", "07. 패키지, 크레이트, 모듈", "모듈 경계와 공개 API를 설계합니다.", "intermediate", "Chapter 7", "모듈 트리", "use 경로", "pub 최소화"),
    (8, "08-common-collections.md", "08. 컬렉션 실전 사용법", "Vec/String/HashMap의 선택 기준과 처리 패턴을 익힙니다.", "intermediate", "Chapter 8", "Vec 활용", "UTF-8 문자열", "HashMap entry"),
    (9, "09-error-handling.md", "09. 에러 처리 전략", "panic과 Result를 구분해 실패를 모델링합니다.", "intermediate", "Chapter 9", "panic 기준", "Result 전파", "에러 메시지 품질"),
    (10, "10-generics-traits-lifetimes.md", "10. 제네릭, 트레잇, 라이프타임", "추상화와 안전성을 함께 달성하는 핵심 문법을 다룹니다.", "intermediate", "Chapter 10", "제네릭 바운드", "트레잇 계약", "라이프타임 관계"),
    (11, "11-testing.md", "11. 테스트 작성과 품질 확보", "단위/통합 테스트 전략으로 변경 안정성을 확보합니다.", "intermediate", "Chapter 11", "테스트 분리", "실패 해석", "회귀 방지"),
    (12, "12-minigrep-project.md", "12. 미니그렙 프로젝트 완성", "요구사항 분해부터 실행 흐름까지 실전 CLI를 완성합니다.", "project", "Chapter 12", "요구사항 분해", "Config 모델", "run 함수 구조"),
    (13, "13-closures-and-iterators.md", "13. 클로저와 이터레이터", "함수형 스타일과 지연 평가를 실전 코드에 적용합니다.", "intermediate", "Chapter 13", "클로저 캡처", "이터레이터 체인", "가독성/성능 균형"),
    (14, "14-cargo-and-crates-io.md", "14. Cargo 고급 기능과 crates.io", "워크스페이스/프로필/배포를 운영 관점에서 학습합니다.", "intermediate", "Chapter 14", "프로필 튜닝", "워크스페이스", "배포 루틴"),
    (15, "15-smart-pointers.md", "15. 스마트 포인터 심화", "Box/Rc/RefCell/Drop/Deref를 정확히 구분해 사용합니다.", "advanced", "Chapter 15", "소유 모델", "내부 가변성", "drop 시점"),
    (16, "16-fearless-concurrency.md", "16. 겁 없는 동시성", "thread/channel/Mutex/Arc 조합으로 안전한 병행처리를 설계합니다.", "advanced", "Chapter 16", "메시지 전달", "공유 상태", "Send/Sync"),
    (17, "17-object-oriented-features.md", "17. Rust에서 객체지향 설계하기", "트레잇 객체와 상태 패턴으로 확장 가능한 구조를 만듭니다.", "advanced", "Chapter 17", "트레잇 객체", "상태 패턴", "합성 중심 설계"),
    (18, "18-patterns-and-matching.md", "18. 패턴 매칭 고급 문법", "패턴 가드/분해 바인딩으로 복잡한 분기를 정리합니다.", "advanced", "Chapter 18", "복합 패턴", "가드", "바인딩 전략"),
    (19, "19-advanced-features.md", "19. 고급 기능: unsafe, 매크로, 고급 타입", "고급 기능의 도입 기준과 안전 경계를 학습합니다.", "advanced", "Chapter 19", "unsafe 경계", "고급 타입", "매크로 사용 기준"),
    (20, "20-multithreaded-web-server-project.md", "20. 멀티스레드 웹 서버 프로젝트", "최종 프로젝트로 구조화/동시성/운영 관점을 통합합니다.", "project", "Chapter 20", "TcpListener", "스레드풀", "graceful shutdown"),
    (21, "21-appendix-a-b-c.md", "21. 부록 A-C 핵심 정리", "키워드/연산자/파생 트레잇을 레퍼런스로 정리합니다.", "intermediate", "Appendix A-C", "키워드", "연산자", "derive 트레잇"),
    (22, "22-appendix-d-e-f.md", "22. 부록 D-F와 다음 학습 경로", "도구/에디션/학습 확장 경로를 실천 계획으로 연결합니다.", "intermediate", "Appendix D-F", "개발 도구", "에디션", "장기 학습 전략"),
]


for row in REST_META:
    order, file, title, excerpt, level, source, k1, k2, k3 = row
    CHS[order] = {
        "file": file,
        "title": title,
        "excerpt": excerpt,
        "level": level,
        "source": source,
        "k1": k1,
        "k2": k2,
        "k3": k3,
        "code": """```rust
fn run(input: i32) -> Result<i32, &'static str> {
    if input < 0 { return Err("input must be non-negative"); }
    Ok(input + 1)
}
```""",
        "exercise": f"{k1}, {k2}, {k3}를 모두 반영하도록 대표 코드를 확장하세요.",
        "answer": """```rust
fn run(input: i32) -> Result<i32, &'static str> {
    if input < 0 { return Err("input must be non-negative"); }
    if input > 1_000_000 { return Err("input too large"); }
    Ok(input + 1)
}
```""",
        "wrong": """```rust
fn run(input: i32) -> i32 {
    if input < 0 { panic!("bad"); }
    input + 1
}
```""",
        "why": "복구 가능한 실패를 panic으로 처리하면 호출자 제어권이 사라지고 시스템 복원력이 낮아집니다.",
        "fix": """```rust
fn run(input: i32) -> Result<i32, &'static str> {
    if input < 0 { return Err("bad input"); }
    Ok(input + 1)
}
```""",
    }


def chapter_body(c):
    if c["title"].startswith("00."):
        return ""

    return f'''# {c['title']}

이 글은 Rust Book의 **{c['source']}**를 기준으로, 주제 설명 자체를 교재처럼 풀어 쓴 장입니다.
핵심은 규칙을 외우는 것이 아니라, 규칙이 왜 필요한지와 실전 코드에서 어떤 이점을 만드는지 이해하는 것입니다.

## 학습 목표

- {c['k1']}, {c['k2']}, {c['k3']}의 관계를 설명할 수 있다.
- 실습 문제를 통해 기능/안전성/유지보수 관점으로 코드를 개선할 수 있다.

## 핵심 개념

### 1) {c['k1']}

{c['k1']}은(는) 이 장에서 가장 먼저 고정해야 할 개념입니다.
이 개념이 흔들리면 뒤에서 나오는 코드 선택(함수 시그니처, 분기 구조, 에러 처리)이 모두 임시방편으로 흐르기 쉽습니다.
따라서 정의를 짧게 외우기보다, 어떤 상황에서 이 규칙이 필요한지 실제 사례를 연결해서 이해해야 합니다.

### 2) {c['k2']}

{c['k2']}는 첫 개념을 코드 구조로 번역하는 단계입니다.
Rust에서는 코드가 돌아가기만 하면 끝이 아니라, 실패 경로와 상태 경계가 명확해야 유지보수성이 확보됩니다.
즉, 이 개념은 가독성과 안정성을 동시에 만드는 설계 포인트라고 보면 됩니다.

### 3) {c['k3']}

{c['k3']}는 실전에서 품질 차이를 만드는 요소입니다.
성능, 안전성, 확장성 사이에서 어떤 선택을 할지 판단할 때 기준점이 됩니다.
실습에서는 바로 이 지점을 의도적으로 바꿔보면서 트레이드오프를 체감하는 것이 중요합니다.

## 기술 심화 설명

Rust의 기술적 강점은 "문제를 빨리 발견"하는 데 있습니다.
컴파일러가 타입, 소유권, 수명, 동시성 제약을 강하게 검사해 런타임 버그를 앞단에서 차단합니다.
그래서 이 장을 읽을 때는 문법 결과만 보지 말고 "컴파일러가 왜 이 코드를 허용/거부하는가"를 함께 추적해야 진짜 실력이 됩니다.

또한 실무에서는 코드가 계속 변경되므로, 초기 설계가 불명확하면 기능 추가 시 오류가 급격히 늘어납니다.
함수 경계, 모듈 분리, 실패 모델(Result/Option), 데이터 모델(enum/struct)을 명확히 만드는 습관이 중요합니다.
이 습관이 쌓이면 프로젝트 규모가 커져도 안정적으로 확장할 수 있습니다.

## 대표 코드

{c['code']}

## 실습 문제

{c['exercise']}

## 장 특화 실습 정답

### 예시 정답

{c['answer']}

### 해설

정답의 핵심은 실패 경로를 숨기지 않고 타입으로 드러낸 점입니다.
이 방식은 테스트 작성을 쉽게 만들고, 호출자가 실패를 강제로 처리하게 하여 안정성을 높입니다.
또한 로직이 작게 분리되어 있어 요구사항 변경 시 영향 범위를 좁힐 수 있습니다.

## 오답 예시와 리팩터링

### 오답 예시

{c['wrong']}

### 왜 문제인가

{c['why']}

### 개선 코드

{c['fix']}
'''


for path in BASE.glob("*.md"):
    if path.name != "_template.md":
        path.unlink()

for i in range(0, 23):
    c = CHS[i]
    if i == 0:
        content = f'''---
title: "{c['title']}"
date: "2026-02-16"
excerpt: "{c['excerpt']}"
category: "Rust"
tags: ["rust", "rust-complete", "chapter-00"]
order: 0
level: "beginner"
draft: false
---

# {c['title']}

Rust 학습을 "가이드라인"이 아니라 "완결형 본문"으로 만들기 위해 전체 커리큘럼을 다시 설계했습니다.
각 장은 개념 설명, 기술 심화, 실습, 정답/해설, 오답 리팩터링까지 포함하여 장 자체만으로도 학습이 가능하도록 구성했습니다.

## 5단계 학습 흐름

1. 기초(01~03): 환경/문법/입력 처리
2. 핵심(04~10): 소유권, 모델링, 모듈, 에러, 추상화
3. 응용(11~14): 테스트, 프로젝트 구조화, 함수형 패턴, Cargo 운영
4. 심화(15~19): 포인터, 동시성, 패턴, unsafe/매크로
5. 실전(20~22): 서버 프로젝트와 레퍼런스 확장

## 학습 완료 기준

- 장별 핵심 개념 3개를 원리 중심으로 설명 가능
- 실습 문제를 스스로 확장하고 정답 해설과 비교 가능
- 오답 예시를 보고 어떤 위험이 발생하는지 논리적으로 설명 가능
'''
    else:
        content = f'''---
title: "{c['title']}"
date: "2026-02-16"
excerpt: "{c['excerpt']}"
category: "Rust"
tags: ["rust", "rust-complete", "chapter-{i:02d}"]
order: {i}
level: "{c['level']}"
draft: false
---

{chapter_body(c)}
'''

    (BASE / c['file']).write_text(content, encoding='utf-8')
