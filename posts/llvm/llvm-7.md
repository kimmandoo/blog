---
title: llvm 입문하기(7)
date: 2026-05-25
category: LLVM
tags: [cpp, llvm]
---

이번 장은 mutable variable이다.

지금까지 Kaleidoscope의 변수는 사실 "변하는 변수"가 아니었다. 함수 인자나 loop variable을 이름으로 참조할 수는 있었지만, `x = x + 1`처럼 값을 바꾸는 변수는 없었다.

LLVM IR은 SSA form을 사용한다. 그래서 처음에는 "값이 바뀌는 변수"와 잘 안 맞아 보인다.

근데 LLVM에서는 프론트엔드가 모든 SSA를 직접 손으로 만들 필요는 없다고 한다. register 값은 SSA여야 하지만, 메모리 위치 자체는 SSA가 아니기 때문이다.

이걸 이용하면 mutable variable을 일단 메모리에 두고 `load`/`store`로 표현할 수 있다. 나중에 최적화 pass가 가능한 부분을 SSA 값과 phi node로 승격해준다.

이걸 보려고 먼저 C 코드 하나를 생각해보자.

```cpp
int G, H;

int test(_Bool Condition) {
  int X;
  if (Condition)
    X = G;
  else
    X = H;
  return X;
}
```

5장에서 본 방식대로라면 `X`는 분기마다 다른 SSA 값이 되고, 합류 지점에서 phi가 필요하다.

```llvm
@G = weak global i32 0
@H = weak global i32 0

define i32 @test(i1 %Condition) {
entry:
  br i1 %Condition, label %cond_true, label %cond_false

cond_true:
  %X.0 = load i32, ptr @G
  br label %cond_next

cond_false:
  %X.1 = load i32, ptr @H
  br label %cond_next

cond_next:
  %X.2 = phi i32 [ %X.1, %cond_false ], [ %X.0, %cond_true ]
  ret i32 %X.2
}
```

PHI는 일반적인 함수 호출이 아니라 "분기들이 다시 합쳐질 때 어떤 값을 사용할지 결정하는 SSA 전용 명령"인 점 다시 상기하고 들어가자.

이 정도 예시는 직접 phi를 만들어도 괜찮아 보이는데, 조건문이 중첩되고 loop가 생기고 변수 대입이 여러 군데에서 일어나면 incoming block을 맞추는 일이 꽤 귀찮아질 것 같다.

# LLVM에서의 메모리

LLVM은 모든 register 값이 SSA form이기를 요구하지만, 메모리 객체는 SSA form으로 표현하지 않는다.

전역 변수부터 보면 느낌이 온다.

```llvm
@G = weak global i32 0
@H = weak global i32 0
```

변수 정의가 실제로는 주소처럼 동작한다. 즉 `@G`는 전역 데이터 영역에 `i32`를 위한 공간을 정의하고, `@G`라는 이름이 그 공간을 가리키고 있다. 읽으려면 `load`가 필요하고, 쓰려면 `store`가 필요하다.

스택 변수도 비슷하다. 함수 안에서는 `alloca`로 스택 슬롯을 만들 수 있다.

```llvm
define i32 @example() {
entry:
  %X = alloca i32
  ...
  %tmp = load i32, ptr %X
  %tmp2 = add i32 %tmp, 1
  store i32 %tmp2, ptr %X
  ...
```

`%X`는 값 자체가 아니라 스택 슬롯의 주소다. `%X`라는 SSA 값은 한 번만 정의되지만, 그 주소가 가리키는 메모리 안의 내용은 `store`로 바뀔 수 있다.

그러면 아까 예제도 phi 없이 쓸 수 있다.

```llvm
@G = weak global i32 0
@H = weak global i32 0

define i32 @test(i1 %Condition) {
entry:
  %X = alloca i32
  br i1 %Condition, label %cond_true, label %cond_false

cond_true:
  %X.0 = load i32, ptr @G
  store i32 %X.0, ptr %X
  br label %cond_next

cond_false:
  %X.1 = load i32, ptr @H
  store i32 %X.1, ptr %X
  br label %cond_next

cond_next:
  %X.2 = load i32, ptr %X
  ret i32 %X.2
}
```

변수 `X`에 해당하는 스택 슬롯을 하나 만들고, 분기마다 그 슬롯에 값을 저장한다. 마지막에는 그 슬롯에서 다시 읽는다.

SSA 대신 메모리 주소를 활용해 임의의 변경 가능한 변수를 PHI 노드 없이 처리할 수 있게 된 것이다.

- 변경 가능한 변수 하나는 스택 할당 하나
- 변수를 읽는 것은 스택에서 load
- 변수를 갱신하는 것은 스택에 store
- 변수의 주소를 얻는 것은 그냥 스택 주소를 직접 사용하면 됨

근데 단순한 연산인데 스택 공간에 너무 많은 접근이 일어난다고 생각할 수 있다. 이걸 `mem2reg`라는 최적화 pass로 처리할 수 있다.

`mem2reg`는 이런 단순한 `alloca/load/store` 패턴을 분석해서 가능한 경우 SSA register로 승격한다. 필요하면 phi node도 알아서 넣는다.

조건이 몇 가지 있다.

1. 함수의 entry block에 있는 `alloca`를 주로 대상으로 삼는다.
2. 사용이 직접적인 `load`와 `store`인 경우에 잘 승격된다.
3. 스택 슬롯의 주소가 함수 밖으로 전달되거나 복잡한 포인터 연산에 쓰이면 승격하기 어렵다.
4. 구조체나 배열처럼 통째로 승격하기 애매한 값은 보통 다른 pass의 도움, 예를 들면 SROA 같은 분해 작업이 먼저 필요하다.

이렇게 보면 프론트엔드가 매번 phi를 직접 계산하는 것보다 훨씬 편하다. 일단 메모리 기반 IR을 만들고, LLVM 최적화가 가능한 부분을 SSA 형태로 정리하게 맡기면 된다.

# Kaleidoscope의 변경 가능한 변수

이제 이 메모리 트릭을 써서 mutable한 변수를 만들어볼 것이다.

```llvm
# Define ':' for sequencing: as a low-precedence operator that ignores operands
# and just returns the RHS.
def binary : 1 (x y) y;

# Recursive fib, we could do this before.
def fib(x)
  if (x < 3) then
    1
  else
    fib(x-1)+fib(x-2);

# Iterative fib.
def fibi(x)
  var a = 1, b = 1, c in
  (for i = 3, i < x in
     c = a + b :
     a = b :
     b = c) :
  b;

# Call it.
fibi(10);
```

처음 봤을 때 `:`가 좀 이상했다.

"Kaleidoscope는 원래 모든 것이 표현식 중심입니다. C처럼 문장 statement가 강하게 나뉘어 있지 않습니다. 그래서 여러 연산을 순서대로 실행하고 싶을 때 `:` 같은 연산자를 만들어 사용합니다." 이게 처음엔 무슨 말인가 했다.

생각해보면 Kaleidoscope에는 C처럼 statement를 여러 줄 순서대로 나열하는 문법이 없다. 그런데 `c = a + b`, `a = b`, `b = c`처럼 여러 expression을 순서대로 실행하고 싶다.

그래서 `:`라는 아주 낮은 우선순위의 이항 연산자를 정의한다.

```llvm
def binary : 1 (x y) y;
```

이 연산자는 왼쪽 값은 버리고 오른쪽 값을 반환한다. 하지만 codegen은 왼쪽 expression을 먼저 만들고, 그 다음 오른쪽 expression을 만든다. 그래서 대입이나 함수 호출 같은 side effect가 있으면 왼쪽부터 실행되는 순서 표현처럼 쓸 수 있다.

즉 아래 코드는

```llvm
c = a + b :
a = b :
b = c
```

대략 이런 느낌이다.

```text
c = a + b;
a = b;
b = c;
```

진짜 statement 문법을 만든 건 아니고, expression 언어 안에서 순서를 흉내내는 작은 장치라고 보면 된다.

# 기존 변수 표현 바꾸기

지금까지 `NamedValues`는 이름을 LLVM `Value*`에 매핑했다.

```cpp
static std::map<std::string, Value *> NamedValues;
```

예를 들어 함수 인자 `x`가 있으면 `NamedValues["x"]`는 그 인자 값을 가리켰다. 그런데 mutable variable을 만들려면 이름이 "현재 값"이 아니라 "값이 저장되는 위치"를 가리키는 편이 낫다.

그래서 `AllocaInst*`를 저장하도록 바꾼다.

```cpp
static std::map<std::string, AllocaInst*> NamedValues;
```

이제 `NamedValues["x"]`는 `x`의 값이 아니라 `x`가 들어 있는 스택 슬롯을 가리킨다.

스택 슬롯을 만들 때는 entry block에 `alloca`가 생기도록 헬퍼 함수를 둔다.

```cpp
static AllocaInst *CreateEntryBlockAlloca(Function *TheFunction,
                                          StringRef VarName) {
  IRBuilder<> TmpB(&TheFunction->getEntryBlock(),
                 TheFunction->getEntryBlock().begin());
  return TmpB.CreateAlloca(Type::getDoubleTy(*TheContext), nullptr,
                           VarName);
}
```

이건 entry block에 `alloca`가 생성되도록 보장하는 헬퍼함수다. 현재 Builder의 삽입 위치가 어디든 상관없이, 함수 entry block의 맨 앞쪽에 `alloca`를 넣고 싶기 때문이다.

`mem2reg`가 보기 좋은 형태도 보통 이런 모양이다. entry block에 변수를 위한 `alloca`가 모여 있고, 실제 사용 지점에서는 `load`와 `store`를 한다.

이제 변수 참조도 값을 바로 반환하면 안 된다. 스택 슬롯에서 읽어와야 한다.

```cpp
Value *VariableExprAST::codegen() {
  // Look this variable up in the function.
  AllocaInst *A = NamedValues[Name];
  if (!A)
    return LogErrorV("Unknown variable name");

  // Load the value.
  return Builder->CreateLoad(A->getAllocatedType(), A, Name.c_str());
}
```

바꾼 방식에서는 변수 이름으로 alloca를 찾고, 거기서 `load`한 값을 반환한다. 이제 변수 참조 expression의 결과는 "스택 슬롯 주소"가 아니라 "그 슬롯에서 읽은 현재 값"이다.

## For 루프 수정

5장에서는 `for` loop variable을 phi node로 직접 만들었다. 이제는 loop variable도 mutable variable처럼 alloca를 사용한다.

```cpp
Function *TheFunction = Builder->GetInsertBlock()->getParent();

// Create an alloca for the variable in the entry block.
AllocaInst *Alloca = CreateEntryBlockAlloca(TheFunction, VarName);

// Emit the start code first, without 'variable' in scope.
Value *StartVal = Start->codegen();
if (!StartVal)
  return nullptr;

// Store the value into the alloca.
Builder->CreateStore(StartVal, Alloca);
...
```

시작값을 계산한 뒤 loop variable의 스택 슬롯에 저장한다. loop body 안에서 `i`를 읽으면 `VariableExprAST::codegen()`이 이 슬롯에서 `load`한다.

loop 끝에서는 현재 값을 다시 읽어서 step을 더하고 저장한다.

```cpp
// Compute the end condition.
Value *EndCond = End->codegen();
if (!EndCond)
  return nullptr;

// Reload, increment, and restore the alloca.  This handles the case where
// the body of the loop mutates the variable.
Value *CurVar = Builder->CreateLoad(Alloca->getAllocatedType(), Alloca,
                                    VarName.c_str());
Value *NextVar = Builder->CreateFAdd(CurVar, StepVal, "nextvar");
Builder->CreateStore(NextVar, Alloca);
...
```

코드가 거의 바뀐 건 없지만 phi node를 직접 만들 필요가 없어졌다는 점이 큰 차이점이다. 변수의 현재 상태는 스택 슬롯에 있고, 루프를 돌 때마다 그 슬롯을 업데이트한다.

함수 인자도 변경 가능하게 하려면 그거도 alloca를 해주면 된다.

```cpp
Function *FunctionAST::codegen() {
  ...
  Builder->SetInsertPoint(BB);

  // Record the function arguments in the NamedValues map.
  NamedValues.clear();
  for (auto &Arg : TheFunction->args()) {
    // Create an alloca for this variable.
    AllocaInst *Alloca = CreateEntryBlockAlloca(TheFunction, Arg.getName());

    // Store the initial value into the alloca.
    Builder->CreateStore(&Arg, Alloca);

    // Add arguments to variable symbol table.
    NamedValues[std::string(Arg.getName())] = Alloca;
  }

  if (Value *RetVal = Body->codegen()) {
    ...
```

이제 좀 잘 보인다.

각 인자에 대해 alloca를 만들고, 함수에 들어온 입력 값을 그 alloca에 저장한다음 해당 alloca를 인자의 메모리 위치로 심볼테이블에 저장한다.

이제 `x`를 읽으면 `load`, `x = ...`를 하면 `store`가 된다.

# mem2reg 붙이기

변수 생성방식을 바꿨으니까 `mem2reg`로 SSA 최적화를 해주기 위해 pass들을 추가한다.

```llvm
entry:
  %x1 = alloca double
  store double %x, ptr %x1
  %x2 = load double, ptr %x1
  %cmptmp = fcmp ult double %x2, 3.000000e+00
  %booltmp = uitofp i1 %cmptmp to double
  %ifcond = fcmp one double %booltmp, 0.000000e+00
  br i1 %ifcond, label %then, label %else
```

`mem2reg`를 안해도 코드생성은 되지만, 불필요한 load/store가 계속 발생한다. 예를 들어 아래 코드가

```llvm
entry:
  %cmptmp = fcmp ult double %x, 3.000000e+00
  %booltmp = uitofp i1 %cmptmp to double
  %ifcond = fcmp one double %booltmp, 0.000000e+00
  br i1 %ifcond, label %then, label %else
```

이런 식으로 바뀔 수 있다.

```cpp
// Promote allocas to registers.
TheFPM->addPass(PromotePass());
// Do simple "peephole" optimizations and bit-twiddling optzns.
TheFPM->addPass(InstCombinePass());
// Reassociate expressions.
TheFPM->addPass(ReassociatePass());
```

`PromotePass()`가 `alloca/load/store`를 SSA 값으로 승격하고, 필요하면 phi node를 넣어준다. 그 뒤 `InstCombine`, `Reassociate` 같은 기존 최적화가 더 정리한다.

`NamedValues["x"]`가 x의 스택 슬롯 주소가 되면서 x를 읽을 때는 load, 대입할 때는 store가 되는 식이다.

# 대입 연산자

이제 `=`도 연산자로 추가한다.

우선 이항 연산자이므로 precedence를 넣어야 한다. 보통 비교 연산보다 낮게 둔다.

```cpp
BinopPrecedence['='] = 2;
```

그리고 `BinaryExprAST::codegen()`에서 `=`만 특별 취급한다.

```cpp
Value *BinaryExprAST::codegen() {
  // Special case '=' because we don't want to emit the LHS as an expression.
  if (Op == '=') {
    // This assume we're building without RTTI because LLVM builds that way by
    // default. If you build LLVM with RTTI this can be changed to a
    // dynamic_cast for automatic error checking.
    VariableExprAST *LHSE = static_cast<VariableExprAST*>(LHS.get());
    if (!LHSE)
      return LogErrorV("destination of '=' must be a variable");
```

대입은 일반 이항 연산자처럼 왼쪽과 오른쪽을 둘 다 codegen하면 안 된다.

`x = 4`에서 왼쪽 `x`의 현재 값은 필요 없다. 필요한 건 `x`가 저장된 위치다. 그래서 LHS는 반드시 변수 참조여야 하고, 그 변수 이름으로 alloca를 찾아야 한다.

튜토리얼 코드는 LLVM이 기본적으로 RTTI 없이 빌드되는 상황을 의식해서 `static_cast`를 쓴다. 다만 이 코드는 "LHS가 실제로 `VariableExprAST`일 것"이라는 가정이 깔려 있다. 일반적인 컴파일러라면 AST에 노드 종류를 명시하거나, RTTI를 켠 환경에서 `dynamic_cast`를 써서 더 안전하게 검사하는 편이 낫다.

오른쪽은 일반 expression처럼 값을 만든다.

```cpp
// Codegen the RHS.
Value *Val = RHS->codegen();
if (!Val)
  return nullptr;

// Look up the name.
Value *Variable = NamedValues[LHSE->getName()];
if (!Variable)
  return LogErrorV("Unknown variable name");

Builder->CreateStore(Val, Variable);
return Val;
```

오른쪽 값을 만든 뒤, 왼쪽 변수의 스택 슬롯에 `store`한다. 그리고 대입 expression의 결과로 저장한 값을 그대로 반환한다. 그래서 `a = b = 3` 같은 식도 개념적으로는 오른쪽부터 값이 전달될 수 있다.

# 사용자 정의 지역 변수

대입만 있으면 부족하다. 새 지역 변수를 만드는 문법도 필요하다.

Kaleidoscope에서는 `var/in`을 사용한다.

```llvm
var a = 1, b = 2 in
  a + b
```

`a`, `b`라는 지역 변수를 만들고, `in` 뒤의 body expression을 실행한다. 전체 `var` expression의 결과는 body의 결과다. body가 끝나면 이 지역 변수들은 스코프에서 빠진다.

AST에는 여러 변수 이름과 optional initializer를 저장해둔다.

```cpp
/// VarExprAST - Expression class for var/in
class VarExprAST : public ExprAST {
  std::vector<std::pair<std::string, std::unique_ptr<ExprAST>>> VarNames;
  std::unique_ptr<ExprAST> Body;

public:
  VarExprAST(std::vector<std::pair<std::string, std::unique_ptr<ExprAST>>> VarNames,
             std::unique_ptr<ExprAST> Body)
    : VarNames(std::move(VarNames)), Body(std::move(Body)) {}

  Value *codegen() override;
};
```

`VarNames`는 `(이름, 초기값 expression)` 쌍의 벡터다. 초기값이 없을 수도 있으므로 `unique_ptr`가 비어 있을 수 있다.

Parser는 쉼표로 이어지는 변수 목록을 읽는다.

```cpp
/// varexpr ::= 'var' identifier ('=' expression)?
//                    (',' identifier ('=' expression)?)* 'in' expression
static std::unique_ptr<ExprAST> ParseVarExpr() {
  getNextToken();  // eat the var.

  std::vector<std::pair<std::string, std::unique_ptr<ExprAST>>> VarNames;

  // At least one variable name is required.
  if (CurTok != tok_identifier)
    return LogError("expected identifier after var");

  while (true) {
    std::string Name = IdentifierStr;
    getNextToken();  // eat identifier.

    // Read the optional initializer.
    std::unique_ptr<ExprAST> Init;
    if (CurTok == '=') {
      getNextToken(); // eat the '='.

      Init = ParseExpression();
      if (!Init) return nullptr;
    }

    VarNames.push_back(std::make_pair(Name, std::move(Init)));

    // End of var list, exit loop.
    if (CurTok != ',') break;
    getNextToken(); // eat the ','.

    if (CurTok != tok_identifier)
      return LogError("expected identifier list after var");
  }
```

이후에는 `in`을 확인하고 body expression을 읽으면 된다.

codegen에서는 각 변수마다 alloca를 만들고 초기값을 저장한다.

```cpp
Value *VarExprAST::codegen() {
  std::vector<AllocaInst *> OldBindings;

  Function *TheFunction = Builder->GetInsertBlock()->getParent();

  // Register all variables and emit their initializer.
  for (unsigned i = 0, e = VarNames.size(); i != e; ++i) {
    const std::string &VarName = VarNames[i].first;
    ExprAST *Init = VarNames[i].second.get();

    // Emit the initializer before adding the variable to scope, this prevents
    // the initializer from referencing the variable itself, and permits stuff
    // like this:
    //  var a = 1 in
    //    var a = a in ...   # refers to outer 'a'.
    Value *InitVal;
    if (Init) {
      InitVal = Init->codegen();
      if (!InitVal)
        return nullptr;
    } else { // If not specified, use 0.0.
      InitVal = ConstantFP::get(*TheContext, APFloat(0.0));
    }

    AllocaInst *Alloca = CreateEntryBlockAlloca(TheFunction, VarName);
    Builder->CreateStore(InitVal, Alloca);

    // Remember the old variable binding so that we can restore the binding when
    // we unrecurse.
    OldBindings.push_back(NamedValues[VarName]);

    // Remember this binding.
    NamedValues[VarName] = Alloca;
  }
```

여기서 눈여겨볼 점은 초기값을 먼저 codegen하고, 그 다음 새 변수를 scope에 넣는다는 것이다.

```llvm
var a = 1 in
  var a = a in ...
```

이런 코드에서 안쪽 `var a = a`의 오른쪽 `a`는 안쪽에서 방금 만들 `a`가 아니라 바깥쪽 `a`를 참조하는 게 맞다. 그래서 initializer를 계산할 때는 아직 새 binding을 넣지 않는다.

기존 binding은 `OldBindings`에 저장해둔다. 같은 이름의 바깥 변수가 있다면 잠시 가려지고, body가 끝난 뒤 다시 복구된다.

본문을 만든 뒤에는 binding을 되돌리고 body 값을 반환한다.

```cpp
// Codegen the body, now that all vars are in scope.
Value *BodyVal = Body->codegen();
if (!BodyVal)
  return nullptr;

// Pop all our variables from scope.
for (unsigned i = 0, e = VarNames.size(); i != e; ++i)
  NamedValues[VarNames[i].first] = OldBindings[i];

// Return the body computation.
return BodyVal;
```

이렇게 해서 `var/in`은 새 지역 변수를 만들고, body 안에서만 그 변수를 사용할 수 있게 한다.

mutable variable을 넣으면서 `NamedValues`의 의미가 바뀌었다.

전에는 이름이 LLVM 값 자체를 가리켰다.

```text
x -> Value*
```

이제는 이름이 값을 담는 메모리 위치를 가리킨다.

```text
x -> AllocaInst*
```

읽을 때는 `load`, 쓸 때는 `store`다. 이 방식 덕분에 프론트엔드는 복잡한 phi node를 직접 만들지 않고도 변경 가능한 변수를 표현할 수 있다.

대신 IR은 처음에는 지저분해진다. 이 부분은 `PromotePass()`가 가능한 `alloca`를 SSA register로 승격해주면서 정리한다.

5장에서 phi를 직접 만들면서 원리를 봤다면, 이번 장에서는 그걸 매번 직접 하지 않는 방법을 본 셈이다. 일단 변수처럼 보이게 `alloca/load/store`로 만들고, 나중에 LLVM pass에게 정리를 맡긴다.