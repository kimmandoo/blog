# Rust A to Z Content Workspace

이 디렉토리는 `/rust` 전용 페이지에서 읽는 튜토리얼 원고를 관리합니다.

## Directory

```text
rust/
  posts/
    00-roadmap.md
    01-installation-and-hello-cargo.md
    02-guessing-game.md
    03-common-programming-concepts.md
    04-understanding-ownership.md
    05-using-structs.md
    06-enums-and-pattern-matching.md
    07-managing-projects-with-packages-crates-modules.md
    08-common-collections.md
    09-error-handling.md
    10-generics-traits-lifetimes.md
    11-testing.md
    12-minigrep-project.md
    13-closures-and-iterators.md
    14-cargo-and-crates-io.md
    15-smart-pointers.md
    16-fearless-concurrency.md
    17-object-oriented-features.md
    18-patterns-and-matching.md
    19-advanced-features.md
    20-multithreaded-web-server-project.md
    21-appendix-a-b-c.md
    22-appendix-d-e-f.md
    _template.md
```

## Source of Truth

- Primary reference: https://doc.rust-lang.org/book/
- Chapters 01~20 map to Rust Book ch1~ch20
- Chapters 21~22 summarize appendices for practical reference

## Writing Rules

1. 한 챕터당 하나의 핵심 주제만 다룹니다.
2. 모든 파일은 frontmatter를 포함합니다.
3. `order`는 정수로 유지합니다. (`00`, `01`처럼 파일명과 동일한 흐름)
4. `level`은 `beginner`, `intermediate`, `advanced`, `project` 중 하나를 사용합니다.
5. 코드 블록은 반드시 언어를 명시합니다. 예: `rust`, `toml`, `bash`

## Frontmatter Schema

```yaml
---
title: "챕터 제목"
date: "2026-02-15"
excerpt: "챕터 요약"
category: "Rust"
tags: ["rust", "ownership"]
order: 2
level: "beginner"
draft: false
---
```

## Add a New Chapter

1. `rust/posts/_template.md`를 복사합니다.
2. 파일명을 `NN-...md` 형식(두 자리 번호)으로 작성합니다.
3. `order`를 다음 숫자로 설정합니다.
4. `/rust` 페이지에서 정렬 및 노출 여부를 확인합니다.
