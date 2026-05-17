---
title: llvm 입문하기(4)
date: 2026-05-17
category: LLVM
tags: [cpp, llvm]
---

이번 장은 JIT랑 Optimizer를 붙이는 장이다.

이전 글까지는 소스 코드를 LLVM IR로 바꾸는 데 집중했다. 그런데 IR을 그냥 만들기만 하면 끝이 아니다. 예를 들어 `1 + 2 + x` 같은 식은 컴파일하는 시점에 이미 `3 + x`로 줄일 수 있다. 이런 일을 optimizer가 한다.

JIT은 만들어진 IR을 그 자리에서 기계어로 바꾸고 실행할 수 있게 해주는 쪽이다. Just In Time compile은 프로그램 실행 중 필요한 코드를 즉석에서 컴파일하는 방식이라고 보면 된다.

## Trivial Constant Folding

IRBuilder는 아주 단순하고 명확한 최적화를 IR 생성 중에 해준다.

예를 들어 `def test(x) 1+2+x;`를 넣으면 이런 IR이 나온다.

```ir
define double @test(double %x) {
entry:
  %addtmp = fadd double 3.000000e+00, %x
  ret double %addtmp
}
```

원래 AST를 그대로 옮겼다면 `1 + 2`를 계산하는 명령이 따로 보였을 것이다.

```ir
define double @test(double %x) {
entry:
  %addtmp = fadd double 2.000000e+00, 1.000000e+00
  %addtmp1 = fadd double %addtmp, %x
  ret double %addtmp1
}
```

그런데 실제로는 `1 + 2`가 `3.0`으로 접혀 있다. 이런 걸 상수 접기(constant folding)라고 한다.

LLVM IR을 만들 때 대부분 IRBuilder의 `CreateFAdd` 같은 메서드를 거치기 때문에, Builder가 "두 피연산자가 모두 상수네?" 같은 상황을 볼 수 있다. 가능하면 새 instruction을 만들지 않고 계산된 constant를 바로 돌려준다.

다만 IRBuilder가 하는 최적화는 IR을 만드는 그 순간에 보이는 것에 한정된다.

```kaleidoscope
ready> def test(x) (1+2+x)*(x+(1+2));
```

이걸 넣으면 처음에는 이런 식으로 나온다.

```ir
define double @test(double %x) {
entry:
  %addtmp = fadd double 3.000000e+00, %x
  %addtmp1 = fadd double %x, 3.000000e+00
  %multmp = fmul double %addtmp, %addtmp1
  ret double %multmp
}
```

사람이 보면 `%addtmp`랑 `%addtmp1`은 둘 다 `x + 3`이다. 그래서 하나만 계산하고 `tmp * tmp`로 쓰면 될 것 같다.

하지만 IRBuilder 입장에서는 방금 만든 instruction 주변만 보고 판단한다. `3 + x`와 `x + 3`이 수학적으로 같다는 것까지 찾아내려면 더 넓은 분석이 필요하다.

여기서 두 가지 변환이 필요하다.

- reassociation: 식을 재배치해서 `3 + x`와 `x + 3` 같은 형태를 같은 꼴로 맞춘다.
- CSE(Common Subexpression Elimination): 같은 계산을 하는 instruction을 하나로 줄인다.

이런 최적화는 IRBuilder가 아니라 LLVM optimization pass가 처리한다.

## LLVM Optimization Passes

LLVM 최적화는 패스 단위로 생각하면 된다.

패스는 IR을 입력으로 받아 분석하거나 수정해서 더 나은 IR로 바꾸는 작업 단위다. LLVM은 어떤 패스를 어떤 순서로 실행할지 컴파일러 구현자가 직접 고를 수 있게 해준다.

패스는 크게 module 단위 패스와 function 단위 패스로 나눠볼 수 있다. 지금 Kaleidoscope는 REPL처럼 한 줄 입력하면 바로 처리하는 구조라 전체 프로그램을 다 본 뒤 최적화하기 어렵다. 그래서 여기서는 함수 하나가 만들어질 때마다 function 단위 최적화를 돌린다.

정적 컴파일러처럼 파일 전체를 한 번에 다 보고 처리한다면 module 단위 최적화를 나중에 몰아서 돌릴 수도 있다.

패스는 transform pass와 analysis pass로도 나눌 수 있다.

analysis pass는 정보를 계산한다. 예를 들어 루프 최적화를 하려면 먼저 어디가 루프인지 알아야 한다. 그런 정보를 구하는 쪽이다.

transform pass는 실제 IR을 바꾼다. analysis pass가 계산한 정보를 바탕으로 instruction을 합치거나, 불필요한 블록을 지우거나, 식의 형태를 바꾼다.

함수 단위 최적화를 적용하려면 `FunctionPassManager`를 준비한다.

```cpp
void InitializeModuleAndManagers(void) {
  TheContext = std::make_unique<LLVMContext>();
  TheModule = std::make_unique<Module>("KaleidoscopeJIT", *TheContext);
  TheModule->setDataLayout(TheJIT->getDataLayout());

  Builder = std::make_unique<IRBuilder<>>(*TheContext);

  TheFPM = std::make_unique<FunctionPassManager>();

  TheLAM = std::make_unique<LoopAnalysisManager>();
  TheFAM = std::make_unique<FunctionAnalysisManager>();
  TheCGAM = std::make_unique<CGSCCAnalysisManager>();
  TheMAM = std::make_unique<ModuleAnalysisManager>();

  ThePIC = std::make_unique<PassInstrumentationCallbacks>();
  TheSI = std::make_unique<StandardInstrumentations>(*TheContext,
                                                     /*DebugLogging*/ true);
  TheSI->registerCallbacks(*ThePIC, TheMAM.get());
  ...
}
```

`TheModule->setDataLayout(TheJIT->getDataLayout())`도 여기서 나온다. DataLayout은 target machine에서 포인터 크기, 타입 정렬, 메모리 배치가 어떤지 알려주는 정보다. JIT은 현재 실행 중인 플랫폼에 맞게 기계어를 만들어야 하므로 module도 JIT의 DataLayout을 따라야 한다.

AnalysisManager는 IR 계층별로 존재한다.

- `ModuleAnalysisManager`: 모듈 단위 분석
- `FunctionAnalysisManager`: 함수 단위 분석
- `LoopAnalysisManager`: 루프 단위 분석
- `CGSCCAnalysisManager`: 호출 그래프의 SCC 단위 분석

CGSCC는 Call Graph Strongly Connected Component다. 호출 그래프에서 서로 재귀적으로 얽힌 함수 묶음을 다룰 때 쓰는 단위라고 보면 된다.

이제 transform pass들을 추가한다.

```cpp
TheFPM->addPass(InstCombinePass());
TheFPM->addPass(ReassociatePass());
TheFPM->addPass(GVNPass());
TheFPM->addPass(SimplifyCFGPass());
```

`InstCombinePass`는 자잘한 instruction 조합을 정리하고, `ReassociatePass`는 식의 결합 순서를 바꿔 같은 꼴을 만들기 쉽게 한다. `GVNPass`는 global value numbering으로 같은 값을 계산하는 instruction을 찾아 중복을 줄인다. `SimplifyCFGPass`는 제어 흐름 그래프에서 불필요한 블록 같은 것을 정리한다.

위에서 봤던 `x + 3`이 두 번 계산되는 예시는 `ReassociatePass`와 `GVNPass`가 같이 들어가야 깔끔해진다.

그 다음 transform pass들이 사용할 analysis pass를 등록한다.

```cpp
PassBuilder PB;
PB.registerModuleAnalyses(*TheMAM);
PB.registerFunctionAnalyses(*TheFAM);
PB.crossRegisterProxies(*TheLAM, *TheFAM, *TheCGAM, *TheMAM);
```

준비가 끝났으면 함수 코드 생성이 끝난 뒤 pass manager를 실행한다.

```cpp
if (Value *RetVal = Body->codegen()) {
  Builder->CreateRet(RetVal);

  verifyFunction(*TheFunction);

  TheFPM->run(*TheFunction, *TheFAM);

  return TheFunction;
}
```

이 위치가 중요하다. 먼저 함수의 IR을 완성하고 `verifyFunction`으로 생성된 IR이 말이 되는지 확인한다. 그 다음 최적화를 돌린다.

최적화를 적용하면 아까 두 개로 쪼개졌던 add가 하나로 줄어든다.

```ir
define double @test(double %x) {
entry:
  %addtmp = fadd double %x, 3.000000e+00
  %multmp = fmul double %addtmp, %addtmp
  ret double %multmp
}
```

## Adding a JIT Compiler

정적 컴파일 흐름은 대략 이렇다.

소스 코드 -> 컴파일 -> 실행 파일 생성 -> 나중에 실행

JIT을 붙이면 흐름이 이렇게 바뀐다.

LLVM IR 생성 -> 즉석에서 기계어 생성 -> 바로 실행

Kaleidoscope는 REPL이지만 내부적으로는 LLVM IR을 만들고, JIT이 그 IR을 native machine code로 바꿔 실행한다.

먼저 JIT 전역 변수를 두고 native target을 초기화한다.

```cpp
static std::unique_ptr<KaleidoscopeJIT> TheJIT;

int main() {
  InitializeNativeTarget();
  InitializeNativeTargetAsmPrinter();
  InitializeNativeTargetAsmParser();

  BinopPrecedence['<'] = 10;
  BinopPrecedence['+'] = 20;
  BinopPrecedence['-'] = 20;
  BinopPrecedence['*'] = 40;

  fprintf(stderr, "ready> ");
  getNextToken();

  TheJIT = ExitOnErr(KaleidoscopeJIT::Create());
  InitializeModuleAndManagers();

  MainLoop();
  return 0;
}
```

`InitializeNativeTarget()` 계열 함수는 현재 프로그램이 실행 중인 플랫폼을 타겟으로 쓰겠다는 초기화다. Windows면 Windows용 타겟 정보, Linux면 그 환경의 타겟 정보를 준비한다고 보면 된다. 꼭 Linux x64로 고정되는 것은 아니고 현재 호스트 트리플에 맞춰진다.

`KaleidoscopeJIT`는 LLVM 예제 코드 안에 있는 간단한 JIT 래퍼다.

https://github.com/llvm/llvm-project/blob/main/llvm/examples/Kaleidoscope/include/KaleidoscopeJIT.h

여기서 중요한 API는 일단 두 개다.

- `addModule`: LLVM IR module을 JIT에 추가해서 실행 가능하게 만든다.
- `lookup`: JIT 안에서 컴파일된 symbol의 주소를 찾는다.

top-level expression을 처리하는 코드는 이런 식으로 바뀐다.

```cpp
static ExitOnError ExitOnErr;

static void HandleTopLevelExpression() {
  if (auto FnAST = ParseTopLevelExpr()) {
    if (FnAST->codegen()) {
      auto RT = TheJIT->getMainJITDylib().createResourceTracker();

      auto TSM = ThreadSafeModule(std::move(TheModule), std::move(TheContext));
      ExitOnErr(TheJIT->addModule(std::move(TSM), RT));
      InitializeModuleAndManagers();

      auto ExprSymbol = ExitOnErr(TheJIT->lookup("__anon_expr"));

      double (*FP)() = ExprSymbol.getAddress().toPtr<double (*)()>();
      fprintf(stderr, "Evaluated to %f\n", FP());

      ExitOnErr(RT->remove());
    }
  } else {
    getNextToken();
  }
}
```

파싱과 codegen이 성공하면 현재 module을 JIT에 넘긴다. 이때 `ThreadSafeModule`은 `TheModule`과 `TheContext`의 소유권을 묶어서 JIT로 넘기는 포장지 같은 역할을 한다.

module을 JIT에 추가하면 그 module은 더 이상 수정하면 안 된다. 그래서 바로 `InitializeModuleAndManagers()`를 호출해서 다음 입력을 담을 새 module을 연다.

그 다음 `lookup("__anon_expr")`로 방금 만든 익명 함수의 symbol을 찾고, 주소를 `double (*)()` 함수 포인터로 바꾼 뒤 호출한다.

top-level expression이 왜 함수로 감싸지는지도 여기서 보인다. LLVM IR은 그냥 `4 + 5` 같은 표현식 하나를 혼자 실행하는 구조가 아니다. 그래서 Kaleidoscope는 top-level expression을 인자 없이 `double`을 반환하는 함수로 감싼다.

```llvm
define double @__anon_expr() {
entry:
  ret double 9.000000e+00
}
```

이 함수가 JIT으로 컴파일되고, 우리는 그 주소를 함수 포인터처럼 호출하는 것이다.

실행이 끝난 뒤에는 `RT->remove()`로 익명 표현식 module을 JIT에서 제거한다. 이건 top-level expression을 계속 보관할 필요가 없기 때문이다.

여기서 한 가지 문제가 생긴다. 함수 정의와 익명 표현식을 같은 module에 넣어두면, 익명 표현식을 지울 때 함수 정의까지 같이 사라질 수 있다. 그러면 나중에 같은 함수를 다시 호출하려고 할 때 JIT이 구현을 찾지 못한다.

그래서 함수 정의와 익명 표현식은 module을 따로 관리해야 한다. 튜토리얼은 한 걸음 더 나아가 함수 하나마다 module을 따로 두는 방식으로 간다.

새 module을 열 때마다 이전 함수들의 선언을 다시 만들 수 있어야 하므로 `FunctionProtos` 맵을 둔다.

```cpp
static std::map<std::string, std::unique_ptr<PrototypeAST>> FunctionProtos;

Function *getFunction(std::string Name) {
  if (auto *F = TheModule->getFunction(Name))
    return F;

  auto FI = FunctionProtos.find(Name);
  if (FI != FunctionProtos.end())
    return FI->second->codegen();

  return nullptr;
}
```

`getFunction()`은 먼저 현재 module에서 함수 선언을 찾는다. 없으면 `FunctionProtos`에 저장해둔 prototype으로 현재 module 안에 새 선언을 만든다.

예를 들어 예전에 `def foo(x) x + 1;`을 정의했고, 새 module에서 `foo(2);`를 컴파일한다고 생각해보자.

새 module 안에는 `foo`의 실제 구현이 없다. 그래도 `call` instruction을 만들려면 `foo`가 어떤 시그니처를 갖는지 알아야 한다. 그래서 구현은 이전 module/JIT 안에 있어도, 현재 module 안에는 선언이 필요하다.

`CallExprAST::codegen()`은 기존 `TheModule->getFunction()` 대신 `getFunction()`을 쓰면 된다.

```cpp
Value *CallExprAST::codegen() {
  Function *CalleeF = getFunction(Callee);
  ...
}
```

`FunctionAST::codegen()`에서는 prototype을 먼저 `FunctionProtos`에 저장한 뒤 `getFunction()`을 호출한다.

```cpp
Function *FunctionAST::codegen() {
  auto &P = *Proto;
  FunctionProtos[Proto->getName()] = std::move(Proto);
  Function *TheFunction = getFunction(P.getName());
  if (!TheFunction)
    return nullptr;
  ...
}
```

정의와 extern 처리도 바뀐다.

```cpp
static void HandleDefinition() {
  if (auto FnAST = ParseDefinition()) {
    if (auto *FnIR = FnAST->codegen()) {
      fprintf(stderr, "Read function definition:");
      FnIR->print(errs());
      fprintf(stderr, "\n");
      ExitOnErr(TheJIT->addModule(
          ThreadSafeModule(std::move(TheModule), std::move(TheContext))));
      InitializeModuleAndManagers();
    }
  } else {
    getNextToken();
  }
}

static void HandleExtern() {
  if (auto ProtoAST = ParseExtern()) {
    if (auto *FnIR = ProtoAST->codegen()) {
      fprintf(stderr, "Read extern: ");
      FnIR->print(errs());
      fprintf(stderr, "\n");
      FunctionProtos[ProtoAST->getName()] = std::move(ProtoAST);
    }
  } else {
    getNextToken();
  }
}
```

`HandleDefinition`은 새로 정의한 함수를 JIT에 넘기고 새 module을 연다. `HandleExtern`은 prototype을 `FunctionProtos`에 저장한다.

주의할 점은 LLVM 9 이후 ORC JIT API에서는 같은 JITDylib 안의 중복 symbol 정의를 허용하지 않는다는 것이다. 예전 튜토리얼 흐름에는 `def foo(x) x+1;` 다음에 다시 `def foo(x) x+2;`처럼 같은 이름을 재정의하는 예시가 나오지만, LLVM 9 이상에서는 이 부분을 그대로 따라가면 duplicate symbol 문제가 날 수 있다.

공식 튜토리얼에도 이 경고가 붙어 있다. 지금은 "함수마다 module을 나누면 선언을 다시 만들 수 있다"는 구조만 이해하고, 같은 이름 재정의 예시는 조심해서 보는 게 맞다.

## Symbol Resolution

이제 이런 코드를 실행할 수 있다.

```kaleidoscope
ready> extern sin(x);
ready> extern cos(x);
ready> def foo(x) sin(x)*sin(x) + cos(x)*cos(x);
ready> foo(4.0);
Evaluated to 1.000000
```

그런데 Kaleidoscope 안에서 `sin`이나 `cos`를 구현한 적이 없다. JIT은 이 이름들을 어떻게 찾을까?

KaleidoscopeJIT은 먼저 JIT에 추가된 module 안에서 symbol을 찾는다. 거기서 못 찾으면 현재 프로세스에서 같은 이름의 symbol을 찾는다. `sin`과 `cos`는 현재 프로세스 주소 공간에서 접근 가능한 libm 함수이기 때문에 연결될 수 있다.

또 한 가지 흥미로운 점은 `sin(1.0)`처럼 인자가 상수인 경우다. `sin`, `cos` 같은 표준 수학 함수는 최적화 과정에서 직접 계산되어 함수 호출 자체가 사라질 수도 있다.

이 규칙 덕분에 C++ 코드로 Kaleidoscope 언어를 확장할 수도 있다.

```cpp
#ifdef _WIN32
#define DLLEXPORT __declspec(dllexport)
#else
#define DLLEXPORT
#endif

extern "C" DLLEXPORT double putchard(double X) {
  fputc((char)X, stderr);
  return 0;
}
```

이 함수를 C++ 쪽에 만들고 Kaleidoscope에서 `extern putchard(x);`로 선언하면 호출할 수 있다.

여기서 `extern "C"`는 C++ name mangling을 막기 위해 필요하다. C++은 함수 오버로딩을 지원하므로 실제 binary symbol 이름에 타입 정보를 섞는다. 예를 들어 `putchard(double)`이 `_Z8putchardd` 같은 이름이 될 수 있다.

하지만 Kaleidoscope에서 `extern putchard(x);`라고 쓰면 JIT은 `"putchard"`라는 이름을 찾는다. C++ 컴파일러가 이름을 바꿔버리면 찾을 수 없으니 `extern "C"`로 C 방식 linkage를 쓰게 한다.

`DLLEXPORT`는 Windows용이다. Windows에서는 동적 symbol lookup이 `GetProcAddress`를 쓰기 때문에 외부에서 찾을 수 있도록 함수를 export해야 한다. 그래서 `_WIN32`일 때만 `__declspec(dllexport)`를 붙이고, 그 외 환경에서는 빈 매크로로 둔다.

`putchard`가 `double`을 받고 `double`을 반환하는 것도 Kaleidoscope에 맞춘 모양이다. 이 시점의 Kaleidoscope는 모든 값을 `double`로 다루기 때문에, 문자 하나를 출력하는 함수도 `double putchard(double X)` 형태로 맞춘다.

```cpp
fputc((char)X, stderr);
return 0;
```

`(char)X`는 `double` 값을 문자 코드로 바꾸는 C 스타일 캐스팅이다. 예를 들어 `putchard(120);`을 호출하면 `120.0`이 문자 코드 120으로 바뀌고, ASCII에서 120은 `x`라서 `x`가 출력된다.

반환값 `0`은 `double`로 암시 변환되어 `0.0`처럼 반환된다. 출력이 목적이라 반환값 자체는 큰 의미가 없다.

## 26.05.17 컴파일 오류 고치기

공식 튜토리얼의 기본 컴파일 명령은 이런 형태다.

```bash
clang++ -g toy.cpp `llvm-config --cxxflags --ldflags --system-libs --libs core orcjit native` -O3 -o toy
```

Linux에서 현재 프로세스의 symbol을 JIT이 찾게 하려면 `-rdynamic`도 필요할 수 있다.

```bash
clang++ -g my_llvm.cpp `llvm-config --cxxflags --ldflags --system-libs --libs core orcjit native` -rdynamic -O3 -o out/my_llvm
```

여기서 조심할 점은 `-rdynamic`을 백틱 안에 넣으면 안 된다는 것이다.

```bash
clang++ -g my_llvm.cpp `llvm-config --cxxflags --ldflags --system-libs --libs -rdynamic core orcjit native` -O3 -o out/my_llvm
```

이렇게 쓰면 `-rdynamic`이 `clang++` 옵션이 아니라 `llvm-config`의 인자로 들어간다. `llvm-config`는 `-rdynamic`이라는 LLVM 컴포넌트를 모른다. 그래서 라이브러리 옵션이 제대로 나오지 않거나, 결과적으로 링커가 LLVM symbol을 못 찾아 실패할 수 있다.

PowerShell에서는 백틱이 명령 치환이 아니므로 `$(...)`를 써야 한다.

```powershell
clang++ -g my_llvm.cpp $(llvm-config --cxxflags --ldflags --system-libs --libs core orcjit native) -O3 -o out/my_llvm
```

LLVM 버전에 따라 예제 코드도 조금 다르다. LLVM 18 계열에서는 `ExecutorSymbolDef`에서 바로 `toPtr`을 부르는 형태가 아니라 주소를 꺼낸 뒤 포인터로 바꾸는 형태를 쓴다.

```cpp
double (*FP)() = ExprSymbol.getAddress().toPtr<double (*)()>();
```

또 `KaleidoscopeJIT.h` 쪽도 버전에 따라 include와 `RTDyldObjectLinkingLayer` 생성자 람다 모양이 달라질 수 있다. LLVM 18 예제에서는 `ExecutorProcessControl.h`를 포함하고, object layer 생성 람다는 인자를 받지 않는 형태다.

```cpp
#include "llvm/ExecutionEngine/Orc/ExecutorProcessControl.h"

ObjectLayer(*this->ES,
            []() {
              return std::make_unique<SectionMemoryManager>();
            }),
```