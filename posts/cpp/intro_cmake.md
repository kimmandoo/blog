---
title: CMake 입문하기
date: 2026-05-13
category: CPP
tags: [cpp, cmake]
---

# CMakeLists.txt

CMake 프로젝트의 진입점은 보통 최상위 디렉터리의 `CMakeLists.txt`다. `add_subdirectory()`로 추가한 하위 디렉터리도 자기 `CMakeLists.txt`를 가질 수 있다.

CMake 언어 파일은 `CMakeLists.txt` 또는 `.cmake` 파일이고, CMake는 이 파일들로부터 Ninja, Makefile, Visual Studio 프로젝트 같은 실제 빌드 시스템을 생성한다.

여기서 헷갈리면 안 되는 게 있다.

CMake는 컴파일러도 링커도 빌드 도구도 아니다. 빌드 시스템 생성기다. 뭘 빌드할지 읽고, 정해진 generator로 실제 빌드 파일을 만들어내는 쪽에 가깝다.

그래서 보통 흐름은 아래처럼 간다.

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build
ctest --test-dir build
cmake --install build --prefix install
```

`-S`는 source tree, `-B`는 build tree다.

source tree는 소스 코드와 `CMakeLists.txt`가 있는 곳이고, build tree는 CMake가 생성한 파일과 빌드 산출물이 들어가는 곳이다. 소스 폴더 안에 바로 빌드 파일을 뿌리는 in-source build도 가능은 한데, 보통은 별도 build 폴더를 쓰는 out-of-source build가 낫다.

한 번 `cmake -S . -B build`를 돌리면 `build` 안에 `CMakeCache.txt`가 생긴다. 이 파일은 "여기는 이미 CMake build tree다"라는 표시이기도 하고, configure 때 정한 옵션들이 저장되는 곳이기도 하다.

`cmake --build build`는 이미 생성된 build tree를 빌드한다. 이때 CMake가 직접 컴파일하는 게 아니라, 해당 generator가 만든 Ninja나 MSBuild 같은 실제 빌드 도구를 호출한다.

`ctest --test-dir build`는 `enable_testing()`과 `add_test()`로 등록된 테스트를 실행한다.

`cmake --install build --prefix install`은 `install()`로 적어둔 설치 규칙을 실행한다. 파이썬의 requirements 같은 걸 설치한다는 뜻은 아니고, 내가 빌드한 실행 파일, 라이브러리, 헤더 등을 어떤 폴더 구조로 복사할지 실행하는 단계다.

하나 더 조심할 점은 `CMAKE_BUILD_TYPE`이다.

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build
```

이건 Ninja, Unix Makefiles 같은 single-config generator에서 주로 쓰는 방식이다. Visual Studio, Xcode, Ninja Multi-Config처럼 한 build tree 안에 Debug/Release가 같이 들어가는 multi-config generator에서는 configure 때 `CMAKE_BUILD_TYPE`을 고르는 게 아니라 build 때 config를 고른다.

```bash
cmake -S . -B build -G "Ninja Multi-Config"
cmake --build build --config Debug
ctest --test-dir build -C Debug
cmake --install build --config Debug --prefix install
```

## CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.25)

project(hello
  VERSION 1.0.0
  DESCRIPTION "CMake example"
  LANGUAGES CXX
)

add_executable(hello
  src/main.cpp
)

target_compile_features(hello
  PRIVATE
    cxx_std_20
)
```

`cmake_minimum_required()`는 최소 CMake 버전을 요구하고 policy 설정도 같이 잡는다. 이건 최상위 `CMakeLists.txt`의 처음에, `project()`보다 먼저 두는 게 맞다.

`project()`는 프로젝트 이름, 버전, 설명, 홈페이지, 언어 등을 설정한다. 최상위 `CMakeLists.txt`에는 `project()`를 직접 호출해야 한다. `include()`로 다른 파일에 숨겨둔 `project()`를 불러오는 건 최상위 project 호출로 인정되지 않는다.

`add_executable()`은 실행 파일 target을 만든다. 여기서 target이라는 말이 중요하다. CMake에서는 "파일을 어떻게 컴파일할지"보다 "어떤 target을 만들고, 그 target이 무엇을 필요로 하는지"를 중심으로 생각하는 게 낫다.

`target_compile_features()`는 해당 target이 요구하는 컴파일 기능을 선언한다. 여기서는 C++20 기능이 필요하다고 말한 것이다. 그러면 CMake가 필요할 때 `-std=...` 같은 플래그를 붙인다.

개인적으로는 `set(CMAKE_CXX_STANDARD 20)`보다 target별로 `target_compile_features()`를 붙이는 쪽이 더 읽기 좋다고 생각한다. 전자는 프로젝트 전체 분위기를 정하는 느낌이고, 후자는 "이 target은 이 기능을 요구한다"가 더 확실하게 받아들여진다.

## target 중심으로 생각하기

```cmake
include_directories(include)
link_directories(/some/lib)
add_compile_options(-Wall)
```

이게 잘 한걸까..

작은 프로젝트에서는 당장 잘 굴러가는 것처럼 보인다. 그런데 전역 설정을 뿌리면, 어떤 target이 어떤 include path, compile option, link dependency를 필요로 하는지 알기 어렵다.

```cmake
add_library(mathlib
  src/add.cpp
  src/mul.cpp
)

target_include_directories(mathlib
  PUBLIC
    include
)

target_compile_features(mathlib
  PUBLIC
    cxx_std_20
)

add_executable(app
  src/main.cpp
)

target_link_libraries(app
  PRIVATE
    mathlib
)
```

CMake의 buildsystem 모델은 target과 target property 중심이다.

`target_include_directories()`는 target의 include directory를 설정한다.

`target_link_libraries()`는 링크할 라이브러리와 usage requirement를 연결한다.

`target_compile_features()`는 필요한 언어 기능을 선언한다.

이런 식으로 target에 직접 붙이면 나중에 읽을 때 훨씬 덜 헷갈린다. `app`은 `mathlib`를 링크하고, `mathlib`는 자기 public header를 쓰기 위해 `include`를 consumer에게 전달한다. 이런 관계가 코드에 그대로 남는다.

## PUBLIC, PRIVATE, INTERFACE

`target_link_libraries()`를 보면 접근 제어자 같은 게 있다.

```cmake
target_link_libraries(my_lib
  PRIVATE
    impl_dep
  PUBLIC
    api_dep
  INTERFACE
    header_only_dep
)
```

대충 이렇게 생각하면 된다.

`PRIVATE`는 이 target을 빌드할 때만 필요하다. 주로 `.cpp` 안에서만 쓰는 라이브러리다.

`PUBLIC`은 이 target도 필요하고, 이 target을 쓰는 쪽도 필요하다. public header에 타입이나 헤더가 노출되는 경우다.

`INTERFACE`는 이 target 자신을 빌드할 때는 필요 없고, 이 target을 쓰는 쪽에만 전달된다. header-only 라이브러리나 compile definition을 묶어 전달할 때 자주 나온다.

예를 들어 public header가 이런 식이면,

```cpp
#pragma once

#include <fmt/format.h>

namespace mylib {
fmt::memory_buffer make_message();
}
```

`fmt` 타입이 public header에 드러난다. 그러면 `mylib`를 쓰는 사람도 `fmt` header를 볼 수 있어야 하므로 `fmt`는 `PUBLIC` dependency에 가깝다.

반대로 public header에는 `fmt`가 전혀 안 보이고 `.cpp`에서만 문자열 포맷에 쓴다면 `PRIVATE`이면 된다.

```cpp
#include <fmt/core.h>

#include "mylib/widget.hpp"

namespace mylib {
std::string Widget::format() const {
  return fmt::format("Widget({})", id_);
}
}
```

여기서는 consumer가 `fmt`를 알 필요가 없다.

이게 잘못 들어가면 include path가 consumer에게 안 넘어가거나, 반대로 필요 없는 의존성이 바깥으로 새어나간다. 특히 라이브러리를 설치하거나 다른 프로젝트에서 가져다 쓰는 순간 이런 차이가 바로 드러난다.

## executable과 library

```cmake
add_executable(my_app
  src/main.cpp
)
```

`add_executable()`은 지정한 source file들로 빌드되는 executable target을 추가한다. target 이름은 프로젝트 안에서 전역적으로 유일해야 한다.

라이브러리는 `add_library()`로 만든다.

```cmake
add_library(core STATIC
  src/core.cpp
)

add_library(shared_lib SHARED
  src/shared.cpp
)

add_library(plugin MODULE
  src/plugin.cpp
)
```

`STATIC`은 object file들을 묶은 archive다. 리눅스 기준으로 보통 `.a` 같은 형태를 생각하면 된다.

`SHARED`는 동적 라이브러리다. 리눅스의 `.so`, macOS의 `.dylib`, 윈도우의 `.dll` 같은 쪽이다.

`MODULE`은 다른 target이 일반적으로 링크하는 라이브러리라기보다는 런타임에 `dlopen`류로 로드하는 plugin 성격이다.

type을 생략하면 `BUILD_SHARED_LIBS` 값에 따라 `STATIC` 또는 `SHARED`가 선택된다.

```cmake
option(BUILD_SHARED_LIBS "Build shared libraries" OFF)

add_library(core
  src/core.cpp
)
```

이렇게 두면 사용자가 configure할 때 고를 수 있다.

```bash
cmake -S . -B build -DBUILD_SHARED_LIBS=ON
```

다만 `STATIC`과 `SHARED`는 그냥 취향 차이만은 아니다. 배포 방식, ABI, 심볼 export, 런타임 로딩, 디버깅 방식이 같이 따라온다. 정적은 실행 파일에 더 붙어서 들어가고, 동적은 런타임에 따로 로드되기 때문에 동적 라이브러리로 분리하면 해당 라이브러리 디버깅 시 빠르게 처리할 수 있다.

## INTERFACE library

라이브러리라고 해서 꼭 컴파일되는 산출물이 있어야 하는 건 아니다.

```cmake
add_library(project_options INTERFACE)

target_compile_features(project_options
  INTERFACE
    cxx_std_20
)

target_compile_options(project_options
  INTERFACE
    "$<$<CXX_COMPILER_ID:GNU,Clang>:-Wall;-Wextra>"
)

target_link_libraries(my_app
  PRIVATE
    project_options
)
```

`INTERFACE` library는 소스 파일을 컴파일하지 않고, 디스크에 라이브러리 산출물도 만들지 않는다.

대신 include path, compile options, compile definitions, link options 같은 usage requirement를 다른 target에 전달할 때 쓴다.

프로젝트 공통 옵션을 `project_options` 같은 target으로 묶어두면 전역으로 흩뿌리는 것보다 낫다. 그래도 너무 남발하면 "옵션 target이 옵션 target을 링크하고 또 다른 옵션 target을 링크하는" 이상한 그림이 나오니까, 진짜 공통으로 묶을 만한 것만 넣는 편이 좋다.

위 예제에서 `$<$<CXX_COMPILER_ID:GNU,Clang>:-Wall;-Wextra>`는 generator expression이다. configure 시점에 그냥 문자열로 끝나는 게 아니라, 실제 빌드 시스템을 만들 때 조건에 따라 값이 평가된다. `-Wall` 같은 옵션은 MSVC에는 그대로 먹지 않으므로 이런 식으로 compiler를 나눠주는 게 안전하다. 안쪽에 `;`가 들어가면 CMake list처럼 쪼개질 수 있으니 따옴표로 감싸두는 편이 낫다.

## 폴더를 나눌 때

테스트 폴더나 예제 폴더를 따로 둘 때는 `add_subdirectory()`를 쓴다.

```text
my_project/
  CMakeLists.txt
  CMakePresets.json
  include/
    my_project/
      math.hpp
  src/
    math.cpp
    main.cpp
  tests/
    CMakeLists.txt
    test_math.cpp
```

대충 이렇게 생겼다고 치면, 최상위 `CMakeLists.txt`는 이런 모양이 될 수 있다.

```cmake
cmake_minimum_required(VERSION 3.25)

project(MyProject
  VERSION 1.0.0
  DESCRIPTION "Modern CMake project"
  LANGUAGES CXX
)

option(MYPROJECT_BUILD_TESTS "Build tests" ON)

add_library(my_project
  src/math.cpp
)

add_library(MyProject::my_project ALIAS my_project)

target_include_directories(my_project
  PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
)

target_compile_features(my_project
  PUBLIC
    cxx_std_20
)

add_executable(my_project_app
  src/main.cpp
)

target_link_libraries(my_project_app
  PRIVATE
    MyProject::my_project
)

if(MYPROJECT_BUILD_TESTS)
  enable_testing()
  add_subdirectory(tests)
endif()
```

`add_library(MyProject::my_project ALIAS my_project)`는 별칭 target을 만든다.

같은 프로젝트 안에서도 `MyProject::my_project`처럼 namespace가 붙은 이름으로 링크하면, 나중에 설치된 패키지를 `find_package()`로 가져와 쓸 때와 모양이 비슷해진다. 그래서 프로젝트 내부와 외부 사용법을 맞추기 좋다.

`target_include_directories()`의 `BUILD_INTERFACE`와 `INSTALL_INTERFACE`도 중요하다.

```cmake
target_include_directories(my_project
  PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
)
```

빌드 트리에서 쓸 때는 현재 소스 디렉터리의 `include`를 본다. 설치된 뒤에는 설치 prefix 아래의 `include`를 본다.

설치 가능한 패키지를 만들 때 `INSTALL_INTERFACE`에 내 컴퓨터의 절대 경로를 박아 넣으면 relocation이 깨진다. 내 컴퓨터에서는 되는데 다른 사람 컴퓨터에서는 `/Users/me/...` 같은 경로를 찾는 상태가 되는 것이다.

테스트 쪽 `tests/CMakeLists.txt`는 이런 식으로 둘 수 있다.

```cmake
add_executable(my_project_tests
  test_math.cpp
)

target_link_libraries(my_project_tests
  PRIVATE
    MyProject::my_project
)

add_test(NAME my_project_tests COMMAND my_project_tests)
```

하위 디렉터리는 `add_subdirectory()`가 호출되는 순간 처리된다. 그리고 하위 디렉터리에는 source directory에 대응되는 build directory도 같이 생긴다.

## 외부 라이브러리 찾기

실제 프로젝트를 하다 보면 내 코드만 빌드하는 경우보다 외부 라이브러리를 링크하는 경우가 많다.

요즘 CMake에서는 가능하면 imported target을 쓰는 쪽이 좋다.

```cmake
find_package(fmt CONFIG REQUIRED)

target_link_libraries(my_app
  PRIVATE
    fmt::fmt
)
```

`find_package()`는 패키지를 찾는다. `REQUIRED`를 붙이면 못 찾았을 때 configure를 실패시킨다.

`fmt::fmt` 같은 target은 패키지가 제공하는 imported target이다. 여기에 include directory, compile definition, link library 같은 usage requirement가 이미 붙어 있다. 그래서 내가 직접 `${fmt_INCLUDE_DIRS}` 같은 변수를 꺼내서 include path를 추가하는 것보다 덜 헷갈린다.

스레드를 쓸 때도 비슷하다.

```cmake
find_package(Threads REQUIRED)

target_link_libraries(my_app
  PRIVATE
    Threads::Threads
)
```

리눅스에서 `-pthread`를 직접 붙일 수도 있지만, CMake에서는 `Threads::Threads`로 의도를 표현하는 쪽이 낫다. 어떤 플랫폼에서는 컴파일 옵션이 필요하고, 어떤 플랫폼에서는 링크 옵션이 필요하고, 어떤 플랫폼에서는 아무것도 필요 없을 수 있기 때문이다.

## cmake 문법

이제 LLM이 워낙 잘해주니까 문법을 꼭 알아야 하나 싶긴 하다.

근데 매번 물어볼 것도 아니고, 다른 사람이 적어둔 `CMakeLists.txt`를 어느 정도 읽을 수는 있어야 한다고 생각한다.

```cmake
set(MY_NAME "hello")
message(STATUS "MY_NAME=${MY_NAME}")
```

CMake 변수값은 기본적으로 문자열이다.

normal variable, cache variable, environment variable이 있고, normal variable은 function scope와 directory scope의 영향을 받는다.

`${VAR}`는 normal variable을 먼저 찾고, 없으면 cache entry를 찾아서 사용한다.

```cmake
set(SOURCES
  src/a.cpp
  src/b.cpp
  src/c.cpp
)

set(PATH_WITH_SPACE "/Users/me/My Project")
message(STATUS "${PATH_WITH_SPACE}") # 안전
```

줄바꿈으로 보이지만 list는 내부적으로 `;`로 구분된다.

unquoted argument는 세미콜론 때문에 여러 인자로 나뉠 수 있다. 공백이나 세미콜론이 섞인 값은 따옴표를 제대로 써야 한다.

```cmake
if(WIN32)
  message(STATUS "Windows")
elseif(APPLE)
  message(STATUS "Apple platform")
elseif(UNIX)
  message(STATUS "Unix-like")
endif()
```

`if()`는 조건에 따라 명령 블록을 실행한다. `ON`, `YES`, `TRUE`, `1` 등은 true로, `OFF`, `NO`, `FALSE`, `0`, 빈 문자열, `NOTFOUND`, `*-NOTFOUND` 등은 false로 알아듣는다.

```cmake
foreach(src IN LISTS SOURCES)
  message(STATUS "source: ${src}")
endforeach()
```

`foreach()`는 list의 각 값에 대해 명령 블록을 반복한다. `IN LISTS`, `ITEMS`, `RANGE`, `ZIP_LISTS` 같은 형태가 있다.

```cmake
function(add_warning_flags target)
  # 이름 인자로 받은 target에 warning option을 붙인다.
  target_compile_options(${target}
    PRIVATE
      "$<$<CXX_COMPILER_ID:GNU,Clang>:-Wall;-Wextra>"
  )
endfunction()

add_warning_flags(my_app)
```

`function()`은 나중에 호출할 명령을 정의한다. 함수는 새 scope를 만들기 때문에 함수 안에서 `set()`한 변수는 기본적으로 바깥으로 영향을 주지 않는다.

CMake 주석은 `#`이다. C++처럼 `//`를 쓰면 주석이 아니라 그냥 이상한 인자로 들어가서 터질 수 있다.

```cmake
option(MYPROJECT_ENABLE_LOGGING "Enable logging" ON)
option(MYPROJECT_BUILD_TESTS "Build tests" ON)
```

`option()`은 사용자가 선택할 수 있는 boolean option을 제공한다. 초기값을 안 주면 기본값은 `OFF`다.

사용은 아래처럼 한다.

```bash
cmake -S . -B build -DMYPROJECT_ENABLE_LOGGING=OFF
```

`-D<var>=<value>`는 CMake cache entry를 만들거나 갱신한다. 보통 프로젝트 안에 적힌 기본값보다 command line에서 준 `-D` 값이 우선한다.

그래서 configure 옵션을 바꿨는데 이상하게 계속 예전 값이 보이면 `build/CMakeCache.txt`를 의심해볼 만하다. 제일 단순한 해결은 build 폴더를 지우고 다시 configure하는 것이다.

## target_sources()

처음에는 `add_library()`나 `add_executable()` 안에 source를 다 넣어도 된다.

```cmake
add_library(my_lib
  src/a.cpp
  src/b.cpp
)
```

그런데 target을 먼저 만들고 나중에 source를 붙이고 싶을 때는 `target_sources()`를 쓴다.

```cmake
add_library(my_lib)

target_sources(my_lib
  PRIVATE
    src/a.cpp
    src/b.cpp
  PUBLIC
    FILE_SET HEADERS
    BASE_DIRS include
    FILES
      include/my_lib/a.hpp
      include/my_lib/b.hpp
)
```

`target_sources()`는 이미 생성된 target에 source를 추가한다.

`FILE_SET HEADERS`는 public header를 target과 묶어두는 방식이다. IDE에서 header를 보기에도 좋고, 설치할 때도 target과 header를 같이 다루기 좋다.

예전에는 `install(DIRECTORY include/ DESTINATION include)`처럼 헤더 폴더를 통째로 복사하는 예제가 많았다. 지금도 가능은 하지만, target이 어떤 header를 public으로 제공하는지 CMake가 알 수 있게 하려면 file set 쪽이 더 명확하다.

## install()

설치까지 가면 CMake가 조금 어려워진다.

처음에는 이 정도만 알아도 된다.

```cmake
include(GNUInstallDirs)

install(TARGETS my_lib
  EXPORT MyLibTargets
  FILE_SET HEADERS
)

install(EXPORT MyLibTargets
  NAMESPACE MyLib::
  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/MyLib
)
```

`install(TARGETS)`는 target의 산출물과 연결된 파일을 설치 규칙에 추가한다.

`FILE_SET HEADERS`를 쓰면 위에서 `target_sources()`로 등록한 public header도 같이 설치할 수 있다.

`install(EXPORT)`는 설치된 target 정보를 다른 CMake 프로젝트가 가져다 쓸 수 있게 export file로 만든다.

여기까지 하면 대충 이런 방향이 된다.

```cmake
find_package(MyLib REQUIRED)

target_link_libraries(app
  PRIVATE
    MyLib::my_lib
)
```

물론 제대로 된 package config까지 만들려면 `CMakePackageConfigHelpers` 같은 것도 봐야 한다. 입문 글에서 여기까지 다 파고들면 갑자기 숨이 막히니까, 일단은 "install은 단순 복사가 아니라, target을 외부에서 다시 찾을 수 있게 만드는 쪽까지 이어진다" 정도로 잡으면 된다.

## Preset

매번 command line에 generator, build type, option을 다 치는 것도 귀찮다.

그래서 `CMakePresets.json`을 둘 수 있다.

```json
{
  "version": 6,
  "cmakeMinimumRequired": {
    "major": 3,
    "minor": 25,
    "patch": 0
  },
  "configurePresets": [
    {
      "name": "debug",
      "displayName": "Debug",
      "generator": "Ninja",
      "binaryDir": "${sourceDir}/build/debug",
      "cacheVariables": {
        "CMAKE_BUILD_TYPE": "Debug",
        "MYPROJECT_BUILD_TESTS": "ON"
      }
    }
  ],
  "buildPresets": [
    {
      "name": "debug",
      "configurePreset": "debug"
    }
  ],
  "testPresets": [
    {
      "name": "debug",
      "configurePreset": "debug",
      "output": {
        "outputOnFailure": true
      }
    }
  ]
}
```

그러면 명령이 짧아진다.

```bash
cmake --preset debug
cmake --build --preset debug
ctest --preset debug
```

`CMakePresets.json`은 프로젝트 전체가 공유할 설정이고, 보통 git에 넣는다.

`CMakeUserPresets.json`은 개인 로컬 설정에 가깝다. 내 컴퓨터의 SDK 경로나 임시 옵션 같은 건 여기에 두고 git에는 안 넣는 편이 맞다.

## 디버깅

CMake가 꼬이면 일단 값을 찍어보는 게 제일 빠를 때가 많다.

```cmake
message(STATUS "CMAKE_CXX_COMPILER=${CMAKE_CXX_COMPILER}")
message(STATUS "PROJECT_SOURCE_DIR=${PROJECT_SOURCE_DIR}")
message(STATUS "CMAKE_CURRENT_SOURCE_DIR=${CMAKE_CURRENT_SOURCE_DIR}")
message(STATUS "CMAKE_CURRENT_BINARY_DIR=${CMAKE_CURRENT_BINARY_DIR}")
```

`message()`는 로그를 남기는 명령이고, `STATUS`, `WARNING`, `FATAL_ERROR`, `DEBUG`, `TRACE` 같은 mode가 있다.

`FATAL_ERROR`는 configure/generate를 중단시킨다.

target property도 확인할 수 있다.

```cmake
get_target_property(incs my_project INTERFACE_INCLUDE_DIRECTORIES)
message(STATUS "my_project interface includes: ${incs}")
```

`get_target_property()`는 target의 property 값을 변수에 저장한다. property가 없으면 `<variable>-NOTFOUND`로 설정된다.

패키지를 못 찾는 문제라면 configure 명령에 `--debug-find`를 붙여볼 수 있다.

```bash
cmake -S . -B build --debug-find
```

너무 많이 나오긴 하는데, CMake가 어느 경로에서 뭘 찾고 있는지 볼 수 있다.

그리고 진짜 모르겠으면 build 폴더를 지우고 다시 configure해보는 것도 생각보다 괜찮은 디버깅이다.

```bash
cmake -S . -B build
cmake --build build
```

CMake는 cache를 적극적으로 쓰기 때문에, 내가 고친 `CMakeLists.txt` 문제가 아니라 예전 configure 값이 남아서 생기는 문제도 꽤 있다.

결국 CMake를 처음 볼 때 제일 중요한 건 명령어를 많이 외우는 게 아니라 target 사이 관계를 보는 것이다.