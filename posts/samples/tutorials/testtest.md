---
title: "Testing MD"
date: "2025-11-27"
excerpt: "This post tests nested folder support and table of contents feature"
category: "Tutorial"
tags: ["test", "md", "mandoo"]
draft: true
---

```shell
grep -rin "검색어" . --include="*.java"
grep -rn "검색어" . --include="*.{java,xml,c,h}"
grep -rn "검색어" . --include="*.java" --include="*.xml"
```

- **`n`**: 단어가 발견된 **줄 번호**를 함께 출력.
- **`i`**: **대소문자를 구분하지 않고** 검색
- **`l`**: 코드는 보여주지 않고, 해당 단어가 포함된 **파일 이름만** 출력
- include로 확장자를 제한하면 검색이 더 빠름

```shell
git config user.email "github이메일"
git config user.name "github닉네임"
```

- 글로벌로 지정안하면 해당 폴더의 .git 설정에만 적용됨
- 우선순위는 폴더가 global보다 더 높다

```shell
./gradlew htv_dlna_service:assemble
```

HtvService 내부의 모듈 apk 빌드하는 법