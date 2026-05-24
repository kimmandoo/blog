---
title: llvm 입문하기(6)
date: 2026-05-25
category: LLVM
tags: [cpp, llvm]
---

이번 장은 사용자 정의 연산자다.

지금까지는 재귀 하강 파싱이랑 연산자 우선순위 파싱으로 미리 정해둔 연산자만 처리했다. `<`, `+`, `-`, `*` 정도를 알고 있고, Parser는 `BinopPrecedence`를 보고 우선순위를 처리했다.

이번에는 사용자가 직접 연산자를 정의할 수 있게 만든다. 예를 들면 이런 식이다.

```llvm
# Logical unary not.
def unary!(v)
  if v then
    0
  else
    1;

# Define > with the same precedence as <.
def binary> 10 (LHS RHS)
  RHS < LHS;

# Binary "logical or", (note that it does not "short circuit")
def binary| 5 (LHS RHS)
  if LHS then
    1
  else if RHS then
    1
  else
    0;

# Define = with slightly lower precedence than relationals.
def binary= 9 (LHS RHS)
  !(LHS < RHS | LHS > RHS);
```

여기서 `def binary> 10 (LHS RHS)`는 `>`라는 이항 연산자를 정의하는 코드고, `10`은 연산자 우선순위다.

이미 사전에 정의된 `<` 연산자로 다른 연산자를 구현하는 코드이다.

이걸 런타임에 적용된다고 표현할 수도 있겠지만, 좀 더 정확히는 REPL에서 `def binary...` 정의를 읽은 뒤 그 다음 입력부터 파서가 그 연산자를 알아보게 되는 것이다. 이미 파싱이 끝난 AST를 나중에 바꾸는 건 아니다.

`binary|` 예제에는 short circuit이 없다는 주석이 붙어 있다.

```cpp
if (a != null && a.length > 0)
```

이런 코드에서 `a != null`이 false면 뒤의 `a.length > 0`은 아예 평가하지 않는다. 이게 short circuit이다.

근데 지금 정의하려는 `|`의 경우는 일반 함수처럼 동작하기 때문에 양쪽 항이 모두 계산된 다음 return 값을 찾는다. 그러니까 built-in `||` 같은 short circuit 연산자는 아니다.

# 사용자 정의 이항 연산자

커스텀 단항, 이항 연산자를 이제 만들어볼건데, 항상 하듯이 lexer, parser까지는 후루룩이다.

```cpp
enum Token {
  ...
  // operators
  tok_binary = -11,
  tok_unary = -12
};
...
static int gettok() {
...
    if (IdentifierStr == "for")
      return tok_for;
    if (IdentifierStr == "in")
      return tok_in;
    if (IdentifierStr == "binary")
      return tok_binary;
    if (IdentifierStr == "unary")
      return tok_unary;
    return tok_identifier;
```

`binary`, `unary`를 keyword로 인식하게 했다.

그리고 함수 정의 연산자를 확장해서, 연산자임을 구분하게 만든다. 기존 `PrototypeAST`는 함수 이름과 인자 이름만 갖고 있었는데, 이제 이 prototype이 일반 함수인지 연산자인지, 이항 연산자라면 우선순위가 얼마인지도 저장한다.

```cpp
/// PrototypeAST - This class represents the "prototype" for a function,
/// which captures its argument names as well as if it is an operator.
class PrototypeAST {
  std::string Name;
  std::vector<std::string> Args;
  bool IsOperator;
  unsigned Precedence;  // Precedence if a binary op.

public:
  PrototypeAST(const std::string &Name, std::vector<std::string> Args,
               bool IsOperator = false, unsigned Prec = 0)
  : Name(Name), Args(std::move(Args)), IsOperator(IsOperator),
    Precedence(Prec) {}

  Function *codegen();
  const std::string &getName() const { return Name; }

  bool isUnaryOp() const { return IsOperator && Args.size() == 1; }
  bool isBinaryOp() const { return IsOperator && Args.size() == 2; }

  char getOperatorName() const {
    assert(isUnaryOp() || isBinaryOp());
    return Name[Name.size() - 1];
  }

  unsigned getBinaryPrecedence() const { return Precedence; }
};
```

이름을 `binary>` 같은 문자열로 저장한다. 그래서 `getOperatorName()`은 이름의 마지막 글자를 꺼내면 된다. `binary>`의 마지막 글자는 `>`이고, `unary!`의 마지막 글자는 `!`다.

파싱도 생각보다는 간단하다.

```cpp
/// prototype
///   ::= id '(' id* ')'
///   ::= binary LETTER number? (id, id)
static std::unique_ptr<PrototypeAST> ParsePrototype() {
  std::string FnName;

  unsigned Kind = 0;  // 0 = identifier, 1 = unary, 2 = binary.
  unsigned BinaryPrecedence = 30;

  switch (CurTok) {
  default:
    return LogErrorP("Expected function name in prototype");
  case tok_identifier:
    FnName = IdentifierStr;
    Kind = 0;
    getNextToken();
    break;
  case tok_binary:
    getNextToken();
    if (!isascii(CurTok))
      return LogErrorP("Expected binary operator");
    FnName = "binary";
    FnName += (char)CurTok;
    Kind = 2;
    getNextToken();

    // Read the precedence if present.
    if (CurTok == tok_number) {
      if (NumVal < 1 || NumVal > 100)
        return LogErrorP("Invalid precedence: must be 1..100");
      BinaryPrecedence = (unsigned)NumVal;
      getNextToken();
    }
    break;
  }

  if (CurTok != '(')
    return LogErrorP("Expected '(' in prototype");

  std::vector<std::string> ArgNames;
  while (getNextToken() == tok_identifier)
    ArgNames.push_back(IdentifierStr);
  if (CurTok != ')')
    return LogErrorP("Expected ')' in prototype");

  // success.
  getNextToken();  // eat ')'.

  // Verify right number of names for operator.
  if (Kind && ArgNames.size() != Kind)
    return LogErrorP("Invalid number of operands for operator");

  return std::make_unique<PrototypeAST>(FnName, std::move(ArgNames), Kind != 0,
                                         BinaryPrecedence);
}
```

`Kind`는 prototype 종류를 뜻한다. 일반 함수면 0, 단항 연산자면 1, 이항 연산자면 2다. 이항 연산자는 피연산자가 두 개여야 하므로 인자도 두 개여야 한다.

연산자를 함수처럼 취급한다는 것만 명심하면 그냥 쭉 읽어도 이해가 잘 된다.

예를 들어

```llvm
def binary@ 20 (x y)
  x + y;
```

이건 parser가 `binary@`로 받아올거고, 사용자가 `3 @ 4`로 사용하면 파서는 코드 생성 시점에 `binary@(3, 4)`로 바꾼다.

이 연산자를 codegen에서는 default로 처리한다.

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
    break;
  }

  // If it wasn't a builtin binary operator, it must be a user defined one. Emit
  // a call to it.
  Function *F = getFunction(std::string("binary") + Op);
  assert(F && "binary operator not found!");

  Value *Ops[2] = { L, R };
  return Builder->CreateCall(F, Ops, "binop");
}
```

`+`, `-`, `*`, `<`는 직접 LLVM instruction으로 만든다. 그 외의 연산자는 `binary`에 연산자 문자를 붙인 함수 이름으로 찾는다.

예를 들어 `@`라면 `binary@` 함수를 찾아서 호출한다. LLVM이 기본으로 알고있는 연산이 아니기 때문에, 연산자처럼 보이는 함수 호출을 수행하게 된다.

새 이항 연산자를 정의했다면 Parser가 그 연산자의 우선순위도 알아야 한다.

```cpp
Function *FunctionAST::codegen() {
  // Transfer ownership of the prototype to the FunctionProtos map, but keep a
  // reference to it for use below.
  auto &P = *Proto;
  FunctionProtos[Proto->getName()] = std::move(Proto);
  Function *TheFunction = getFunction(P.getName());
  if (!TheFunction)
    return nullptr;

  // If this is an operator, install it.
  if (P.isBinaryOp())
    BinopPrecedence[P.getOperatorName()] = P.getBinaryPrecedence();

  // Create a new basic block to start insertion into.
  BasicBlock *BB = BasicBlock::Create(*TheContext, "entry", TheFunction);
  ...
```

`P.isBinaryOp()`이면 `BinopPrecedence`에 등록한다. 그래서 이후 입력부터 해당 연산자를 이항 연산자로 파싱할 수 있다.

# 사용자 정의 단항 연산자

단항 연산자는 피연산자가 하나뿐이다.

```cpp
/// UnaryExprAST - Expression class for a unary operator.
class UnaryExprAST : public ExprAST {
  char Opcode;
  std::unique_ptr<ExprAST> Operand;

public:
  UnaryExprAST(char Opcode, std::unique_ptr<ExprAST> Operand)
    : Opcode(Opcode), Operand(std::move(Operand)) {}

  Value *codegen() override;
};
```

파싱은 `ParseUnary()`에서 처리한다.

```cpp
/// unary
///   ::= primary
///   ::= '!' unary
static std::unique_ptr<ExprAST> ParseUnary() {
  // If the current token is not an operator, it must be a primary expr.
  if (!isascii(CurTok) || CurTok == '(' || CurTok == ',')
    return ParsePrimary();

  // If this is a unary operator, read it.
  int Opc = CurTok;
  getNextToken();
  if (auto Operand = ParseUnary())
    return std::make_unique<UnaryExprAST>(Opc, std::move(Operand));
  return nullptr;
}
```

현재 토큰이 ASCII 연산자처럼 보이면 단항 연산자로 읽는다. `(`와 `,`는 expression 구조에서 따로 쓰이므로 제외한다.

`ParseUnary()`를 재귀호출하는 이유는 `!!x`의 경우같이 `!(!x)`로 처리해야될 경우가 있기 때문이다.

이제 expression 파싱의 시작점도 `ParsePrimary()`가 아니라 `ParseUnary()`가 된다.

```cpp
/// binoprhs
///   ::= ('+' unary)*
static std::unique_ptr<ExprAST> ParseBinOpRHS(int ExprPrec,
                                              std::unique_ptr<ExprAST> LHS) {
  ...
    // Parse the unary expression after the binary operator.
    auto RHS = ParseUnary();
    if (!RHS)
      return nullptr;
  ...
}

/// expression
///   ::= unary binoprhs
///
static std::unique_ptr<ExprAST> ParseExpression() {
  auto LHS = ParseUnary();
  if (!LHS)
    return nullptr;

  return ParseBinOpRHS(0, std::move(LHS));
}
```

`ParseUnary` 자체가 이제 거대한 `ParsePrimary`가 되었기 때문에, 기존에 `ParsePrimary`를 호출하던 곳을 모두 `ParseUnary`로 바꿔줘도 상관없다.

아까 이항 연산자 만들때도 얘기 나왔던 거지만, 일반 함수 호출로 커스텀 연산을 처리한다. 그렇기 때문에 prototype 파서에도 단항연산자 지원을 추가해야된다.

```cpp
/// prototype
///   ::= id '(' id* ')'
///   ::= binary LETTER number? (id, id)
///   ::= unary LETTER (id)
static std::unique_ptr<PrototypeAST> ParsePrototype() {
  std::string FnName;

  unsigned Kind = 0;  // 0 = identifier, 1 = unary, 2 = binary.
  unsigned BinaryPrecedence = 30;

  switch (CurTok) {
  default:
    return LogErrorP("Expected function name in prototype");
  case tok_identifier:
    FnName = IdentifierStr;
    Kind = 0;
    getNextToken();
    break;
  case tok_unary:
    getNextToken();
    if (!isascii(CurTok))
      return LogErrorP("Expected unary operator");
    FnName = "unary";
    FnName += (char)CurTok;
    Kind = 1;
    getNextToken();
    break;
  case tok_binary:
    ...
```

`!` 연산자는 `unary!`라는 이름을 갖게 된다.

codegen도 이항 연산자와 같은 발상이다.

```cpp
Value *UnaryExprAST::codegen() {
  Value *OperandV = Operand->codegen();
  if (!OperandV)
    return nullptr;

  Function *F = getFunction(std::string("unary") + Opcode);
  if (!F)
    return LogErrorV("Unknown unary operator");

  return Builder->CreateCall(F, OperandV, "unop");
}
```

codegen도 마찬가지다. 피연산자 값을 먼저 만들고, `unary`에 연산자 문자를 붙인 함수를 찾아 호출한다.

이번 장은 연산자를 함수처럼 취급한다는 것만 이해하면 되는 것 같다.

예를 들어 사용자가 보기에는

```text
3 @ 4
```

이렇게 보이지만 내부적으로는

```text
binary@(3, 4)
```

처럼 처리된다.
