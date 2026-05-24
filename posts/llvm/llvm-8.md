---
title: llvm 입문하기(8)
date: 2026-05-25
category: LLVM
tags: [cpp, llvm]
---

이제 Kaleidoscope를 object 파일로 컴파일한다.

컴파일해서 C++ 코드랑 링크해서 쓸 수 있도록 만드는 것이다.

# 타깃 선택하기

컴파일 타겟은 target triple이라는 문자열 그룹을 사용하게 된다.

LLVM에서는 이 문자열로 플랫폼을 표현한다.

```text
<arch><sub>-<vendor>-<sys>-<abi>
```

예를 들어 내 환경에서는 `clang --version`에 이런 식으로 나온다.

```bash
mgkim@DESKTOP-94NFG02:~/toy-llvm$ clang --version
Ubuntu clang version 18.1.8 (++20240731025043+3b5b5c1ec4a3-1~exp1~20240731145144.92)
Target: x86_64-pc-linux-gnu
Thread model: posix
InstalledDir: /usr/bin
```

여기서 `x86_64-pc-linux-gnu`가 target triple이다.

근데 target triple을 직접 칠 필요는 없고, LLVM이 `sys::getDefaultTargetTriple()`을 제공하니까 가져다 쓰면 된다.

```cpp
auto TargetTriple = sys::getDefaultTargetTriple();
TheModule->setTargetTriple(TargetTriple);
```

LLVM은 필요한 타깃만 링크해서 쓸 수 있다.

오브젝트 코드 생성 시 타깃 초기화를 해놔야하는데, 이때 초기화의 의미는 LLVM 내부에 어떤 타깃들이 존재하는지 정보를 등록하는 과정이다.

```cpp
InitializeAllTargetInfos();
InitializeAllTargets();
InitializeAllTargetMCs();
InitializeAllAsmParsers();
InitializeAllAsmPrinters();
```

대충 보면 이런 역할이다.

- `InitializeAllTargetInfos()`: LLVM이 지원하는 타깃 정보 등록
- `InitializeAllTargets()`: 실제 target backend 등록
- `InitializeAllTargetMCs()`: MC, 그러니까 machine code나 object file 쪽 구성요소 등록
- `InitializeAllAsmParsers()`: assembly parser 등록
- `InitializeAllAsmPrinters()`: assembly printer 등록

이 초기화를 안 하면 target triple 문자열을 알고 있어도 LLVM이 그 타깃 backend를 찾지 못할 수 있다.

```cpp
std::string Error;
auto Target = TargetRegistry::lookupTarget(TargetTriple, Error);

// 요청한 target을 찾을 수 없다면 에러를 출력하고 종료한다.
// 보통 TargetRegistry 초기화를 잊었거나,
// 잘못된 target triple을 사용했을 때 발생한다.
if (!Target) {
  errs() << Error;
  return 1;
}
```

`TargetRegistry::lookupTarget()`은 target triple 문자열을 보고 LLVM 내부에 등록된 타깃 백엔드를 찾는다.

타겟 초기화에 내가 찾아야하는 타겟이 없으면 `lookupTarget`이 실패하고 `Target`이 `nullptr`가 될 수 있다.

# TargetMachine

target triple이 `x86_64-pc-linux-gnu` 같은 아키텍처와 OS 조합을 의미하면, TargetMachine은 좀 더 구체적인 코드 생성 설정에 가깝다.

CPU 종류, feature, relocation model, data layout 같은 정보가 여기에 들어간다.

LLVM이 어떤 CPU와 feature를 알고 있는지 보고 싶으면 `llc`를 사용할 수 있다.

```bash
llvm-as < /dev/null | llc -march=x86 -mattr=help
```

그러면 대략 이런 정보가 나온다.

```text
Available CPUs for this target:

  alderlake               - Select the alderlake processor.
  amdfam10                - Select the amdfam10 processor.
  arrowlake               - Select the arrowlake processor.
  arrowlake-s             - Select the arrowlake-s processor.
```

특정 CPU 이름을 넣으면 그 CPU에 맞는 최적화를 더 할 수 있지만, 그냥 `generic`으로 넣어도 된다.

```cpp
auto CPU = "generic";
auto Features = "";

TargetOptions opt;
auto TargetMachine =
    Target->createTargetMachine(TargetTriple, CPU, Features, opt, Reloc::PIC_);
```

`generic`은 특정 CPU 최적화를 하지 않고 일반적인 CPU를 대상으로 한다는 의미다.

`Reloc::PIC_`는 position independent code를 만들겠다는 뜻이다. 코드가 메모리 어디에 로드되더라도 동작할 수 있게 만드는 방식이다. 공유 라이브러리나 동적 링크 환경에서 중요하다.

# Module 설정하기

TargetMachine을 만들었으면 Module에도 타깃 정보를 지정해준다.

```cpp
TheModule->setDataLayout(TargetMachine->createDataLayout());
TheModule->setTargetTriple(TargetTriple);
```

`Module`은 LLVM IR의 최상위 컨테이너다. 하나의 번역 단위처럼 보면 된다.

여기에 "이 모듈은 어떤 target triple을 기준으로 만들어졌는지", "그 타깃의 data layout은 어떤지"를 설정한다.

data layout에는 이런 정보가 들어간다.

- 포인터 크기
- 타입별 정렬 방식
- 엔디언
- 구조체 필드 배치
- ABI 규칙

예를 들어 32비트와 64비트 환경에서는 포인터 크기가 다르다. LLVM이 이 정보를 모르면 최적화나 코드 생성에서 잘못된 가정을 할 수 있다.

타겟과 데이터레이아웃을 지정해주는 게 문법적으로 항상 필수는 아닌데 가이드 권장사항이다. 최적화와 코드 생성이 타겟 정보를 알고 움직이게 해주는 쪽에 가깝다.

# 오브젝트 코드 생성

출력 파일부터 연다.

```cpp
auto Filename = "output.o";
std::error_code EC;
raw_fd_ostream dest(Filename, EC, sys::fs::OF_None);

if (EC) {
  errs() << "Could not open file: " << EC.message();
  return 1;
}
```

`raw_fd_ostream`은 LLVM에서 제공하는 파일 출력 스트림이다. 파일을 열다가 실패하면 `EC`에 에러가 들어간다.

그 다음 오브젝트 코드를 생성하는 pass를 준비한다.

```cpp
legacy::PassManager pass;
auto FileType = CodeGenFileType::ObjectFile;

if (TargetMachine->addPassesToEmitFile(pass, dest, nullptr, FileType)) {
  errs() << "TargetMachine can't emit a file of this type";
  return 1;
}

pass.run(*TheModule);
dest.flush();
```

여기서도 pass manager가 나온다. 앞에서 보던 최적화 pass처럼 IR을 정리하는 pass도 있지만, 여기서는 target machine이 object file을 만들기 위한 backend pass들을 pass manager에 추가한다.

`CodeGenFileType::ObjectFile`로 출력 파일 설정해주고, target machine한테 object 파일 생성하는 pass들을 pass manager에 추가해달라는 코드다.

이후 pass를 실행하고, 파일출력 버퍼를 비워서 디스크에 기록한다.

LLVM 18 기준으로는 `Module::setTargetTriple()`과 `Target::createTargetMachine()`에 `Triple` 객체를 직접 넘기지 않고 target triple 문자열을 넘기는 형태로 쓰면 된다. 그래서 `Triple(TargetTriple)`로 감싸 넘기면 버전에 따라 컴파일 에러가 날 수 있다.

# 빌드하고 실행하기

이제 코드를 실행할건데 오브젝트를 생성하기 때문에 `llvm-config`에 전달하는 인자가 다르다.

target backend, object emission, asm printer 같은 게 필요해서 여기서는 편하게 `--libs all` 옵션을 사용한다.

```bash
clang++ -g -O3 my_llvm.cpp `llvm-config --cxxflags --ldflags --system-libs --libs all` -o toy
```

이거로 `toy`를 만들어서 Kaleidoscope 언어로 함수를 정의한다.

```bash
mgkim@DESKTOP-94NFG02:~/toy-llvm$ ./toy
ready> def average(x y) (x + y) * 0.5;
Read function definition:define double @average(double %x, double %y) {
entry:
  %y2 = alloca double, align 8
  %x1 = alloca double, align 8
  store double %x, ptr %x1, align 8
  store double %y, ptr %y2, align 8
  %x3 = load double, ptr %x1, align 8
  %y4 = load double, ptr %y2, align 8
  %addtmp = fadd double %x3, %y4
  %multmp = fmul double %addtmp, 5.000000e-01
  ret double %multmp
}

Wrote output.o
```

정의하고 `Ctrl+D`로 인터프리터를 나오면 module을 object file로 내리면서 `output.o`가 생성된다.

출력 IR에 `alloca/load/store`가 남아 있는 건 7장에서 본 mutable variable 방식 때문이다. 최적화 pass를 얼마나 붙였는지에 따라 이 부분은 사라질 수도 있고 남을 수도 있다.

# C++ 코드와 링크하기

이걸 외부 C++ 코드로 링크해서 써볼 것이다.

```cpp
#include <iostream>

extern "C" {
    double average(double, double);
}

int main() {
    std::cout << "average of 3.0 and 4.0: " << average(3.0, 4.0) << std::endl;
}
```

함수 스타일이 C 스타일이라 `extern "C"`로 name mangling을 피해줬다.

Kaleidoscope가 만든 함수 이름은 IR에서 그냥 `@average`다. 그런데 C++에서 그냥 `double average(double, double);`라고 선언하면 컴파일러가 C++ ABI에 맞게 이름을 mangling할 수 있다.

컴파일은 이렇게 하면 된다.

```bash
clang++ main.cpp output.o -o main
```

이제 `./main`을 실행하면 Kaleidoscope에서 만든 `average` 함수가 C++ 프로그램 안에서 호출된다.

# CMake로 묶기

근데 CMakeLists 만드는 거 공부했으니까 작업해봤다.

처음에는 단순하게 `main.cpp`와 이미 만들어진 `output.o`를 같이 링크할 수 있다.

```cmake
cmake_minimum_required(VERSION 3.16)

project(toy_llvm LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(main
    main.cpp
    ${CMAKE_CURRENT_SOURCE_DIR}/output.o
)
```

main 실행 파일을 만들면서 `main.cpp`랑 `output.o`파일을 묶어버림.

`output.o`까지 CMake가 직접 만들게 하려면, `toy`를 먼저 빌드하고 그 실행 결과로 `build/output.o`를 생성한 다음 `main`에 링크하면 된다. 그러면 사람이 `./toy`를 따로 실행하지 않아도 `cmake --build build` 한 번으로 끝난다.

```cmake
cmake_minimum_required(VERSION 3.16)

project(toy_llvm LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_program(LLVM_CONFIG llvm-config REQUIRED)

execute_process(
  COMMAND ${LLVM_CONFIG} --cxxflags
  OUTPUT_VARIABLE LLVM_CXXFLAGS
  OUTPUT_STRIP_TRAILING_WHITESPACE
)
separate_arguments(LLVM_CXXFLAGS NATIVE_COMMAND ${LLVM_CXXFLAGS})

execute_process(
  COMMAND ${LLVM_CONFIG} --ldflags --system-libs --libs all
  OUTPUT_VARIABLE LLVM_LDFLAGS
  OUTPUT_STRIP_TRAILING_WHITESPACE
)
separate_arguments(LLVM_LDFLAGS NATIVE_COMMAND ${LLVM_LDFLAGS})

add_executable(toy my_llvm.cpp)
target_compile_options(toy PRIVATE ${LLVM_CXXFLAGS})
target_link_libraries(toy PRIVATE ${LLVM_LDFLAGS})

set(GENERATED_OBJECT ${CMAKE_BINARY_DIR}/output.o)
set(KALEIDOSCOPE_INPUT ${CMAKE_CURRENT_SOURCE_DIR}/kaleidoscope_input.txt)

add_custom_command(
  OUTPUT ${GENERATED_OBJECT}
  COMMAND /bin/bash -c "$<TARGET_FILE:toy> < ${KALEIDOSCOPE_INPUT}"
  DEPENDS toy ${KALEIDOSCOPE_INPUT}
  WORKING_DIRECTORY ${CMAKE_BINARY_DIR}
  COMMENT "Generating output.o from Kaleidoscope source"
  VERBATIM
)

add_custom_target(generate_output DEPENDS ${GENERATED_OBJECT})

add_executable(main main.cpp ${GENERATED_OBJECT})
add_dependencies(main generate_output)
```

`kaleidoscope_input.txt`에는 object file로 만들 Kaleidoscope 코드를 넣어둔다.

```llvm
def average(x y) (x + y) * 0.5;
```

이제 `cmake --build build`를 실행하면 CMake가 `toy`를 만들고, 그 `toy`로 `output.o`를 생성한 다음, `main`을 링크한다.

이 버전은 `output.o`를 build 디렉터리에 만들고, 그 파일을 `main`과 링크한다. `kaleidoscope_input.txt`에 들어 있는 함수 정의를 기준으로 `toy`가 오브젝트를 생성한다.
