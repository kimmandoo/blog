---
title: llvm 입문하기(3)
date: 2026-05-10
category: LLVM
tags: [cpp, llvm]
---

이제 IR이다.

## LLVM IR(intermediate representation)

컴파일러는 보통 세 단계로 나뉜다.

- Frontend: 소스 코드(C, Rust 등)를 읽어 분석 -> clang도 여기 속함
- Optimizer: 코드를 더 빠르고 효율적으로 개선
- Backend: 특정 CPU에 맞는 기계어로 변환

이 중간에서 사용하는 번역용 공용 중간 언어가 LLVM IR이다. 일단 IR로 변환하면 동일한 최적화 도구를 쓸 수 있고 cpu환경에 맞춰 변환할 수 있다.

3가지 형태를 갖고 있다. 사람이 읽을 수 있는 `.ll` 파일, 기계가 읽는 `.bc` 파일, 그리고 컴파일러 내부에서 조작될 `in-memory C++` 객체가 있다.

LLVM IR의 값은 타입을 가지고, `%1`, `%addtmp`, `%calltmp` 같은 레지스터형 값은 SSA라는 특성을 갖고 있다. 다만 메모리 위치 자체가 SSA인 것은 아니다.

SSA는 Static Single Assignment로, 하나의 SSA 값에는 딱 한 번만 정의가 생긴다는 뜻이다. 값이 바뀌는 상황은 기존 값을 수정하는 게 아니라 새로운 SSA 값을 만들어 표현한다.

말이 조금 애매한데 LLVM IR에서 `%1`, `%addtmp`, `%calltmp` 같은 것들은 “변수”라기보다 한 번 계산된 결과값에 붙은 이름이다.

계층구조가 있는데, Module -> Function -> Basic Block -> Instruction 순으로 작아진다.

cpp 코드가 ir로 변환되려면 clang의 도움이 필요하다.

1. 전처리(Preprocessing): #include, #define 등을 처리하여 하나의 거대한 소스 파일 생성
2. 구문 분석 및 AST 생성 (Parsing & AST): C++ 문법을 분석하여 AST(Abstract Syntax Tree, 추상 구문 트리)라는 계층 구조 생성
3. 의미 분석 (Semantic Analysis): 변수 타입이 맞는지, 함수가 존재하는지 등을 체크
4. IR 생성 (CodeGen): Clang의 CodeGen 모듈이 AST를 순회하며 각 노드를 LLVM IR 명령어로 1:1 또는 1:N 매핑하여 생성

지금 튜토리얼에서는 codegen이 큰 역할을 한다.

```cpp
class Calculator {
public:
    int add(int a, int b) {
        return a + b;
    }
};

int main() {
    Calculator calc;
    return calc.add(10, 20);
}
```

이걸 `clang++ -S -emit-llvm example.cpp -o example.ll` 이렇게 입력하면 대략 이런 흐름의 IR을 볼 수 있다. 실제 출력은 clang 버전, 최적화 옵션, 디버그용 이름 보존 여부에 따라 attribute나 임시 이름이 조금씩 달라진다.

```IR
;
define linkonce_odr i32 @_ZN10Calculator3addEii(ptr %this, i32 %a, i32 %b) {
  %1 = add nsw i32 %a, %b
  ret i32 %1
}

define i32 @main() {
  %calc = alloca %class.Calculator, align 1
  ; 
  %res = call i32 @_ZN10Calculator3addEii(ptr %calc, i32 10, i32 20)
  ret i32 %res
}
```

이런 식으로 변환된다.

`%calc = alloca %class.Calculator`를 보면 조금 이상할 수도 있다. SSA 값은 한 번만 정의된다면서 왜 메모리 공간을 잡는지 헷갈릴 수 있기 때문이다.

alloca는 스택 메모리에 공간을 할당하는 명령어다. 

프론트엔드는 특히 주소가 필요할 수 있는 자동 변수나 `-O0`처럼 디버그하기 쉬운 IR을 만들 때 `alloca`와 `load`/`store`로 소스 변수들을 표현하는 경우가 많다. 이후 최적화 단계에서 승격 가능한 `alloca`는 `mem2reg` 같은 패스를 통해 SSA 값 형태로 바뀔 수 있다. 다만 주소가 외부로 새거나 메모리로 남아야 하는 값은 계속 메모리 접근으로 남는다.

IR을 보면 맹글링이 일어난다.

C++은 함수 오버로딩(이름은 같은데 인자가 다른 함수)을 지원하는데, IR이랑 어셈블러는 함수 이름이 유일해야된다.

그래서 clang은 네임스페이스+클래스이름+함수이름+파라미터타입 정보를 다 더해서 고유 문자열을 만든다. 이게 맹글링.

## Code Generation Setup

llvm ir 코드를 생성하기 위해서는 약간의 설정이 필요하다. 먼저 codegen 메서드들을 각 AST 클래스 안에 포함시킨다.

```cpp
/// ExprAST - Base class for all expression nodes.
class ExprAST {
public:
  virtual ~ExprAST() = default;
  virtual Value *codegen() = 0;
};

/// NumberExprAST - Expression class for numeric literals like "1.0".
class NumberExprAST : public ExprAST {
  double Val;

public:
  NumberExprAST(double Val) : Val(Val) {}
  Value *codegen() override;
};
...
```

codegen 메서드는 해당 AST 노드와 그 노드가 의존하는 모든 것에 대한 IR을 생성하라는 뜻이며, LLVM의 Value 객체를 반환한다.

Value클래스는 LLVM에서 SSA(Static Single Assignment) 레지스터 혹은 SSA 값을 표현하는 데 사용된다.

위에서도 간단하게 소개했지만 SSA 값의 가장 뚜렷한 특징은, 관련 명령이 실행될 때 그 값이 계산되며, 그 명령이 다시 실행되기 전까지는 새 값으로 바뀌지 않는다는 점이다.

파서에서 썼던 것과 비슷한 LogError 메서드도 필요하다. 선언되지않은 매개변수같은 걸 잡아준다.

```cpp
static std::unique_ptr<LLVMContext> TheContext;
static std::unique_ptr<IRBuilder<>> Builder;
static std::unique_ptr<Module> TheModule;
static std::map<std::string, Value *> NamedValues;

Value *LogErrorV(const char *Str) {
  LogError(Str);
  return nullptr;
}
```

static 변수들이 codegen 과정에서 사용된다.

TheContext는 LLVM의 여러 핵심 자료구조를 소유하는 객체다. 타입 테이블, 상수 값 테이블 등이 여기에 포함된다. 관련 API에 넘겨줄 하나의 인스턴스가 필요하다고 보면 된다.

Builder 객체는 LLVM 명령을 쉽게 생성할 수 있게 도와주는 헬퍼 객체다.
IRBuilder 클래스 템플릿의 인스턴스는 현재 어느 위치에 명령을 삽입할지 추적하며, 새 명령을 만드는 메서드들을 제공한다.

TheModule은 함수와 전역 변수를 담는 LLVM 구성 요소다. 여러 면에서 LLVM IR이 코드를 담는 최상위 구조라고 볼 수 있다.

그래서 codegen() 메서드는 unique_ptr<Value>가 아니라 raw pointer인 Value*를 반환한다.

이 포인터는 소유권 전달용이 아니라, 이미 LLVM IR 내부 자료구조에 편입된 노드를 가리키는 핸들이다.

나는 아직 이 소유권 개념이 제대로 잡혀있지 않아서 조금 더 살펴봤다.

C++에서 `unique_ptr`는 "이 포인터가 객체를 단독 소유하고, 포인터가 파괴될 때 객체도 정리한다"는 뜻이다. 지역 변수로 선언한 `unique_ptr`는 스코프를 벗어날 때 파괴되지만, 핵심은 스코프 자체보다 소유권이다. 멤버나 컨테이너 안에 들어 있다면 그 소유자가 살아 있는 동안 같이 살아 있다.

참고로 지역 변수로 만든 `unique_ptr`의 수명주기는 스코프다.

```cpp
void createValue() {
    auto myVal = std::make_unique<Value>(); // 생성은 여기서
}
// 스코프 벗어나는 순간 myVal은 파괴되고, Value 객체도 메모리에서 delete 
```

`codegen()`이 `unique_ptr<Value>`가 아니라 `Value *`를 반환하는 이유는 호출자가 그 값을 새로 소유해야 해서가 아니다. 이미 LLVM IR 자료구조 안에 들어간 객체를 가리키는 비소유 핸들을 돌려주는 것이다. 여러 명령어가 같은 값을 참조할 수 있는 것도 raw pointer라서 가능한 게 아니라, IR 그래프가 객체의 수명은 관리하고 참조 관계만 포인터로 표현하기 때문이다.

NamedValues 맵은 코드에 대한 심볼 테이블이다. 현재 스코프에서 어떤 값들이 정의되어 있는지, 그리고 그것들의 LLVM 표현이 무엇인지를 추적한다.

좀만 더 Value*에 대해 깊게 들어가보면, LLVM IR 객체는 종류에 따라 상위 IR 구조가 소유한다. 예를 들어 Function은 Module에, BasicBlock은 Function에, Instruction은 BasicBlock에 들어가고, Type이나 Constant처럼 유일화되는 객체는 LLVMContext 쪽에서 관리된다. IRBuilder는 새 instruction을 만들고 그 instruction을 현재 block에 삽입한다.

그래서 CreateFAdd 같은 게 반환하는 Value*는 내가 delete 해야 하는 포인터가 아니라 이미 LLVM IR 그래프에 들어간 객체를 가리킬 뿐인 비소유 참조다.

현재 형태의 Kaleidoscope에서는 참조 가능한 것이 함수 매개변수뿐이다.
따라서 함수 본문에 대한 코드를 생성할 때 이 맵 안에는 함수 매개변수들이 들어 있게 된다.

## Expression Code Generation

codegen을 보기전에 범위 지정 연산자에대해 알고 넘어가겠다.

`::`는 `어디 안에 들어있는`으로 해석하면 된다.

익숙한 std::string 같은 게 std 네임스페이스 안에 있는 string을 쓰겠다는 의미다.

이게 네임스페이스 뿐만 아니라, 클래스, 전역범위에도 다 적용 가능하다.

`ExprAST::~ExprAST()` 이건 ExprAST클래스안에 있는 소멸자에 접근하는 것이고 `::gettok()` 전역범위에 있는 gettok 메서드에 접근하는 것이다.

접근자라고 하면 `.`이랑 `->`도 생각날 수 있다.

생성 된 객체의 내부 멤버에 접근할 때는 `.`, 포인터를 통해 멤버를 호출할 때는 `->`를 사용한다.

std::string name; 이라고 가정하면 name.clear()이 string 클래스 내부 clear() 멤버 메서드에 접근했다는 의미인 것을 바로 알 수 있다.

---

다시 본론으로 돌아와서, 표현식 노드에 대한 LLVM 코드 생성은 매우 직관적이다.

```cpp
Value *NumberExprAST::codegen() {
  return ConstantFP::get(*TheContext, APFloat(Val));
}
```

Kaleidoscope 튜토리얼의 숫자 리터럴은 모두 `double`이므로 LLVM IR에서는 부동소수점 상수인 `ConstantFP`로 표현된다. 이 클래스는 내부에 `APFloat`로 숫자값을 담는다. 정수 상수라면 `ConstantInt`를 쓰는 식으로 타입에 맞는 Constant 클래스가 따로 있다. 여기서 주의할 점은 LLVM IR에서 상수들이 유일화(uniqued)되어 공유된다는 것이다. 메모리를 아끼기 위해서 같은 값의 상수는 메모리에 딱 하나만 만들어놓고 돌려쓰자는 철학에 가깝다.

그래서 상수나 타입처럼 유일화되는 객체의 API는 `new foo(...)`나 `foo::Create(...)`처럼 직접 객체를 만드는 방식 대신 `foo::get(...)` 방식을 자주 사용한다.

`new`를 쓰면 힙 메모리에 객체를 새로 할당하는데, `foo::get(...)` 방식은 이미 생성된 값이 있으면 기존 값을 반환할 수 있다.

상수가 같은 지 확인할 때도 매번 객체 내부를 비교하는 방식보다, 유일화된 객체의 동일성을 활용하는 쪽이 유리하다.

```cpp
Value *VariableExprAST::codegen() {
  // Look this variable up in the function.
  Value *V = NamedValues[Name];
  if (!V)
    return LogErrorV("Unknown variable name");
  return V;
}
```

위에서 NamedValues를 전역으로 선언했는데, 여기엔 함수 인자들 값만 들어가있을 것이다. 지정한 key가 맵에 없으면 알 수 없는 변수를 참조한 것이니까 에러를 발생 시킨다.

```cpp
Value *BinaryExprAST::codegen() {
  Value *L = LHS->codegen();
  Value *R = RHS->codegen();
  if (!L || !R)
    return nullptr;

  switch (Op) {
  case '+':
    return Builder->CreateFAdd(L, R, "addtmp");
  case '-':
    return Builder->CreateFSub(L, R, "subtmp");
  case '*':
    return Builder->CreateFMul(L, R, "multmp");
  case '<':
    L = Builder->CreateFCmpULT(L, R, "cmptmp");
    // Convert bool 0/1 to double 0.0 or 1.0
    return Builder->CreateUIToFP(L, Type::getDoubleTy(*TheContext),
                                 "booltmp");
  default:
    return LogErrorV("invalid binary operator");
  }
}
```

바이너리 연산자라고 이전 글에서 썼었는데, 단어 번역을 해보니까 이항 연산자더라..

이항 연산의 기본 구성은 간단하다. 표현식 왼쪽항에 대해 재귀적으로 코드를 생성하고, 오른쪽항에 대해 생성한 뒤 이항 표현식의 결과를 계산한다.

IRBuilder는 새로 만드는 명령을 어디에 삽입할지 이미 알고 있다. 그래서 어떤 명령을 만들고 어떤 피연산자를 쓸건지만 지정하면 된다. `"addtmp"` 같은 문자열 리터럴은 LLVM의 alias가 아니라 결과 값에 붙이는 이름 힌트라고 생각하면 된다. 없어도 되지만 사람이 읽기 편해진다.

같은 이름 힌트가 여러 번 생성되면, LLVM이 알아서 뒤에 숫자를 붙여 유일한 이름으로 만든다.

여기서 쓰는 `fadd`, `fsub`, `fmul` 같은 산술 명령은 두 피연산자 타입이 같아야 하고, 결과 타입도 피연산자 타입과 일치한다. 어차피 지금 언어에서는 `double` 값밖에 없어서 타입 조합을 깊게 고민하지 않아도 된다.

문제라고 하면 이제 비교연산이 t/f로 나올건데 이것도 double 형태로 바꿔야된다는 점이다.

그래서 `UIToFP` 명령을 결합해서 쓴다. `FCmpULT`의 결과는 `i1`인 0/1 값이고, 이것을 `double`의 0.0/1.0으로 바꿔야 하기 때문이다. `SIToFP`도 정수를 부동소수점으로 바꾸는 명령이지만 signed로 해석하므로 이 목적에는 `UIToFP`가 맞다. 반대 방향 변환은 `FPToUI`/`FPToSI`다.

```cpp
Value *CallExprAST::codegen() {
  // Look up the name in the global module table.
  Function *CalleeF = TheModule->getFunction(Callee);
  if (!CalleeF)
    return LogErrorV("Unknown function referenced");

  // If argument mismatch error.
  if (CalleeF->arg_size() != Args.size())
    return LogErrorV("Incorrect # arguments passed");

  std::vector<Value *> ArgsV;
  for (unsigned i = 0, e = Args.size(); i != e; ++i) {
    ArgsV.push_back(Args[i]->codegen());
    if (!ArgsV.back())
      return nullptr;
  }

  return Builder->CreateCall(CalleeF, ArgsV, "calltmp");
}
```

먼저 LLVM Module의 심볼 테이블에서 함수 이름을 찾는데, LLVM Module은 우리가 JIT하는 함수들을 담고 있는 컨테이너라는 점을 기억하자.
각 함수에 사용자가 지정한 이름을 그대로 붙였기 때문에, 함수 이름 해석은 LLVM의 심볼 테이블에 맡길 수 있다.

호출할 함수를 얻은 뒤에는, 넘겨줄 각 인자에 대해 재귀적으로 코드를 생성하고, 마지막으로 LLVM의 `call` 명령(CreateCall)을 만든다.

## Function Code Generation

프로토타입과 함수에 대한 코드 생성은 여러 세부 사항을 처리해야 하므로 표현식 코드 생성만큼 깔끔하진 않은게 사실이다.

```cpp
Function *PrototypeAST::codegen() {
  // Make the function type:  double(double,double) etc.
  std::vector<Type*> Doubles(Args.size(),
                             Type::getDoubleTy(*TheContext));
  FunctionType *FT =
    FunctionType::get(Type::getDoubleTy(*TheContext), Doubles, false);

  Function *F =
    Function::Create(FT, Function::ExternalLinkage, Name, TheModule.get());
```

표현식이 계산한 값이 아니라 함수의 외부 인터페이스를 설명하는 프로토타입은 함수 본문에도 쓰이고, 외부 함수 선언에도 쓰인다.

위 코드의 함수 반환 값은 `Function *`이다.

`FunctionType::get` 호출은 주어진 프로토타입에 사용할 함수 타입을 만든다. LLVM에서 Type도 Constant처럼 유일화되어 관리되기 때문에 여기도 new를 줄이고 get으로 가져온다.

external linkage는 이 함수가 현재 모듈 밖에서 정의될 수도 있고, 현재 모듈 밖의 함수들이 이 함수를 호출할 수도 있다는 뜻이다.

```cpp
// Set names for all arguments.
unsigned Idx = 0;
for (auto &Arg : F->args())
  Arg.setName(Args[Idx++]);

return F;
```

지금까진 extern에 대응 하도록 하는 그냥 함수 선언에 대한 IR 코드 대응 방법이었으면, 이제 함수정의에서 본문을 어떻게 처리할 지도 보겠다.

```cpp
Function *FunctionAST::codegen() {
    // First, check for an existing function from a previous 'extern' declaration.
  Function *TheFunction = TheModule->getFunction(Proto->getName());

  if (!TheFunction)
    TheFunction = Proto->codegen();

  if (!TheFunction)
    return nullptr;

  if (!TheFunction->empty())
    return (Function*)LogErrorV("Function cannot be redefined.");
```

함수 정의의 경우 이전에 extern 문으로 이미 생성된 함수가 있을 수 있기 때문에 먼저 `TheModule`의 심볼 테이블에서 기존 버전을 찾는다.

`Module::getFunction`이 null을 반환하면 이전 버전이 없다는 뜻이므로, 프로토타입에서 새로 코드 생성한다.

어느 경우든, 본문을 만들기 전에 그 함수가 비어 있는지(아직 본문이 없는지) 확인해야 한다.

```cpp
// Create a new basic block to start insertion into.
BasicBlock *BB = BasicBlock::Create(*TheContext, "entry", TheFunction);
Builder->SetInsertPoint(BB);

// Record the function arguments in the NamedValues map.
NamedValues.clear();
for (auto &Arg : TheFunction->args())
  NamedValues[std::string(Arg.getName())] = &Arg;
```

이제 Builder가 실제로 설정되는 지점이다.

먼저 "entry"라는 이름의 basic block을 만들고, 이것을 TheFunction에 삽입한다.

그 다음 builder에게 앞으로 생성할 새 명령들을 이 basic block의 끝에 삽입하라고 알려준다.

LLVM에서 basic block은 함수의 제어 흐름 그래프(Control Flow Graph)를 구성하는 중요한 요소다.

현재는 제어 흐름이 없기 때문에 함수마다 블록 하나만 가지게 된다.

그다음 NamedValues 맵을 비우고, 함수 인자들을 맵에 넣는다.
이렇게 해야 VariableExprAST 노드가 변수 이름으로 이 값들에 접근할 수 있다.

```cpp
if (Value *RetVal = Body->codegen()) {
  // Finish off the function.
  Builder->CreateRet(RetVal);

  // Validate the generated code, checking for consistency.
  verifyFunction(*TheFunction);

  return TheFunction;
}
```

삽입 위치와 NamedValues 설정이 끝나면 함수 루트 표현식에 대해 codegen()을 호출한다.

codegen은 위에서 처리한 것처럼 entry 블록 안에 표현식을 계산하는 명령들을 생성하고, 그 계산 결과 값을 반환한다.

이어서 LLVM `ret` 명령을 만들면 함수가 만들어진다. 함수를 만든 뒤에는 LLVM이 제공하는 verifyFunction을 호출한다.

생성된 코드가 일관성을 유지하는지 여러 검사를 수행하는데, 컴파일러 동작 검증이라고 보면된다.

```cpp
  // Error reading body, remove function.
  TheFunction->eraseFromParent();
  return nullptr;
}
```

오류가 발생하면 생성하던 함수를 `eraseFromParent()`로 지운다. 이건 버그라기보다 에러 복구에 가깝다. 잘못 입력한 함수가 심볼 테이블에 남아 있으면 나중에 같은 이름으로 다시 정의할 수 없기 때문이다.

`FunctionAST::codegen()`이 기존 IR Function을 발견한 경우, 그 함수의 시그니처가 현재 정의의 프로토타입과 일치하는지 검사하지 않는다.

이러면 이전의 extern 선언이 함수 정의보다 우선하게 되고, 그 결과 코드 생성이 실패할 수 있다.

공식 튜토리얼에서 드는 예시는 인자 개수보다 인자 이름이 달라지는 경우다.

```kaleidoscope
extern foo(a);
def foo(b) b;
```

인자 개수는 둘 다 1개라서 `arg_size()` 검사만으로는 잡을 수 없다. 기존 `extern`이 만든 IR Function에는 인자 이름 `a`가 남아 있는데, 함수 본문은 `b`를 참조한다. 그래서 `NamedValues`에 `b`가 없어 `Unknown variable name`이 날 수 있다.

해결하려면 `PrototypeAST`에서 인자 이름 목록을 꺼낼 수 있게 하고, 함수 정의를 만들 때 기존 Function의 인자 이름을 현재 프로토타입 기준으로 맞춰줘야 한다.

```cpp
class PrototypeAST {
  std::string Name;
  std::vector<std::string> Args;

public:
  // ...
  const std::string &getName() const { return Name; }
  const std::vector<std::string> &getArgs() const { return Args; }
};

Function *FunctionAST::codegen() {
  Function *TheFunction = TheModule->getFunction(Proto->getName());

  if (!TheFunction)
    TheFunction = Proto->codegen();

  if (!TheFunction)
    return nullptr;

  if (!TheFunction->empty()) {
    LogErrorV("Function cannot be redefined.");
    return nullptr;
  }

  const auto &ArgNames = Proto->getArgs();
  if (TheFunction->arg_size() != ArgNames.size()) {
    LogErrorV("Function argument count mismatch.");
    return nullptr;
  }

  unsigned Idx = 0;
  for (auto &Arg : TheFunction->args())
    Arg.setName(ArgNames[Idx++]);

  BasicBlock *BB = BasicBlock::Create(*TheContext, "entry", TheFunction);
  Builder->SetInsertPoint(BB);
  
  NamedValues.clear();
  for (auto &Arg : TheFunction->args())
    NamedValues[std::string(Arg.getName())] = &Arg;

  if (Value *RetVal = Body->codegen()) {
    Builder->CreateRet(RetVal);
    verifyFunction(*TheFunction);
    return TheFunction;
  }

  TheFunction->eraseFromParent();
  return nullptr;
}
```

핵심은 본문 여부만 보는 데서 끝내지 않고, 현재 정의의 프로토타입 정보를 기준으로 기존 선언의 인자 정보를 다시 맞추는 것이다. 이 챕터의 Kaleidoscope는 모든 인자 타입이 `double`이라 타입 비교는 단순하지만, 실제 언어라면 함수 타입까지 같이 검증해야 한다.

컴파일은 이렇게

```bash
clang++ -g -O3 my_llvm.cpp `llvm-config --cxxflags --ldflags --system-libs --libs core` -o my_llvm
```

clang++ [일반 컴파일 옵션] my_llvm.cpp [LLVM include/lib 옵션들] -o my_llvm

유닉스 계열 셸에서 백틱으로 감싼 `llvm-config ...` 부분은 먼저 실행되어 LLVM include/lib 옵션 문자열로 치환된다. PowerShell에서는 백틱이 명령 치환 문법이 아니므로 보통 `$(llvm-config --cxxflags --ldflags --system-libs --libs core)` 형태를 쓴다.
