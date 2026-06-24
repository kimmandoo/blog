---
title: inline, noinline, crossinline 이해하기
date: 2025-12-15
category: Kotlin
tags: [kotlin]
---

### inline

코틀린에서 고차 함수(Higher-Order Function)를 사용할 때, 함수 매개변수에 `inline`, `noinline`, `crossinline` 키워드를 사용하여 성능 최적화와 제약 조건을 설정할 수 있다. 이 글에서는 각각의 키워드가 무엇인지, 언제 어떻게 사용하는지에 대해 알아보자.

코틀린에서 함수에 람다를 전달할 때, 사실 내부적으로는 객체가 생성된다. 

```kotlin
// 일반 함수
fun doSomething(action: () -> Unit) {
    action()
}

// 사용할 때
doSomething { 
    println("Hello") 
}
```

위 코드는 자바(JVM) 바이트코드로 변환될 때 무거운 작업으로 변한다. 만약 이 함수가 루프 안에서 100만 번 호출된다면? **100만 개의 객체**가 생겼다 사라지며 GC(가비지 컬렉터)에 부담을 주게 된다.

이로 인해 성능 저하가 발생할 수 있는데, `inline` 키워드를 사용하면 컴파일러가 해당 함수를 호출하는 곳에 함수 본문을 직접 삽입하여 오버헤드를 줄일 수 있다.

```kotlin
// inline 키워드 추가
inline fun doSomething(action: () -> Unit) {
    println("시작")
    action()
    println("끝")
}

fun main() {
    doSomething { 
        println("중간 작업") 
    }
}
```

inline 키워드를 붙이면 컴파일러가 코드를 호출하는 곳에 그대로 박아넣는다. 따라서 객체 생성 오버헤드가 사라지고 성능이 향상된다.

우리가 자주 쓰는 `forEach, map, run, apply` 같은 함수들이 전부 inline으로 되어 있는 이유라고 할 수 있다.

가끔은 무조건 복사 붙여넣기 하면 안 되는 상황이 있다. 그럴 때 `noinline`과 `crossinline` 키워드를 사용한다.

### noinline

```kotlin
inline fun test(
    block1: () -> Unit,      // 얘는 inline 됨 (코드 복사)
    noinline block2: () -> Unit // 얘는 객체로 남겨둠
) {
    block1()
    someOtherFunction(block2) // 다른 함수에 변수처럼 넘기려면 객체여야 함!
}
```

함수에 람다를 2개 받는데, 하나는 복사하고 싶고 하나는 변수처럼 쓰고 싶을 때 `noinline`을 붙여준다. `noinline` 키워드를 붙인 람다는 여전히 객체로 남아있기 때문에 다른 함수에 인자로 넘길 수 있다.

inline으로 만들면 객체를 만들지 않기 때문에, 람다를 변수처럼 다른 함수에 넘기거나 저장할 수 없다.

### crossinline

crossinline 키워드는 inline 함수 내에서 람다가 비지역 반환(non-local return)을 하지 못하도록 제한할 때 사용한다.

```kotlin
inline fun runNow(block: () -> Unit) {
    block()
}

fun main() {
    println("1. 시작")
    
    runNow {
        println("2. 작업 중")
        return // 여기서 main() 함수 자체가 종료되어 버림!
    }
    
    println("3. 끝") // 이 코드는 영원히 실행되지 않음
}
```

일반적인 inline 함수에서는 람다 안에서 return을 쓰면 그 함수를 호출한 바깥 함수까지 종료됩니다. 이걸 비지역 반환(Non-local return)이라고 한다.

이걸 막고 싶거나, 다른 스레드(코루틴 등) 안에서 실행될 때 안전하게 만들기 위해 `crossinline` 키워드를 사용한다.

```kotlin
inline fun runAsync(crossinline block: () -> Unit) {
    val thread = Thread {
        block() // 이제 에러 안 남!
    }
    thread.start()
}

fun main() {
    runAsync {
        println("작업 시작")
        // return // 이제 여기서 그냥 'return'을 쓰면 컴파일 에러가 남! (안전장치를 컴파일타임에 걸어둠)
        return@runAsync // '레이블 반환'만 허용됨 (람다만 종료)
    }
}
```

정리해보면 `noinline`은 "아예 복사 붙여넣기 금지", `crossinline`는 "복사 붙여넣기는 하되(성능 이득) `return`은 금지"로 이해할 수 있다.

### 제네릭 실체화 - reified

제네릭 타입은 컴파일 타임에만 존재하고 런타임에는 사라진다. 그래서 제네릭 타입을 검사하거나 캐스팅할 때 문제가 발생할 수 있다. `reified` 키워드를 사용하면 inline 함수 내에서 제네릭 타입을 런타임에도 사용할 수 있게 된다.

```kotlin
fun <T> checkType(value: Any) {
    // T가 런타임에 뭔지 몰라서 검사 불가
    if (value is T) { ... } 
}
```

일반 제네릭의 경우에는 위와 같이 타입 검사가 불가능하다. 하지만 `reified` 키워드를 사용하면 가능해진다.

```kotlin
inline fun <reified T> isOfType(value: Any): Boolean {
    return value is T // 런타임에도 T 타입을 알 수 있음
}
fun main() {
    println(isOfType<String>("Hello")) // true
    println(isOfType<Int>("Hello"))    // false
}
```

`reified` 키워드는 inline 함수와 함께 사용되어야 하며, 이를 통해 제네릭 타입에 대한 타입 검사를 안전하게 수행할 수 있다.

왜 가능할까? inline 함수는 호출되는 곳에 코드가 복사 붙여넣기 되기 때문에, 컴파일 타임에 구체적인 타입 정보가 함수 본문에 삽입된다. 따라서 복사가 이미 이루어진 시점인 런타임에도 해당 타입 정보를 사용할 수 있게 되는 것이다.

inline 키워드는 "성능(Runtime)을 위해 코드 크기(Compile size)를 희생하는 전략"이다. 따라서 무조건 남발하는 것은 좋지 않다.

재귀를 타거나, 함수의 길이가 길거나, 람다를 안받는 일반함수 같이 불필요하거나 비효율적인 곳에 잘못 사용하면 코드 크기가 커져서 오히려 성능이 저하될 수 있다.

### 접근제어자와 같이 쓰려면?

접근제어 키워드와 같이 쓰면 어떻게 될까?

```kotlin
class MyClass {
    private val secretKey = "1234" // 나만 볼 수 있는 변수

    // 컴파일 에러 발생
    inline fun performAction() {
        println(secretKey) 
    }
}
// ======== 컴파일러는 아래처럼 받아들인다 ========
fun main() {
    val myClass = MyClass()
    
    // performAction() 호출 코드가 아래처럼 바뀜
    println(myClass.secretKey) // secretKey는 private인데? 접근 불가!
}
```

inline 함수는 호출되는 곳에 코드가 복사 붙여넣기 되기 때문에, 접근 제어자가 private인 멤버에 접근할 수 없다. 이 경우 컴파일 에러가 발생한다.

해결 방법은 2개다. inline함수도 private으로 만들거나, 멤버 변수를 internal으로 바꾸는 것이다. public은 고려사항이 아니다.

```kotlin
class MyClass {
    @PublishedApi
    internal val secretKey = "1234"

    inline fun performAction() {
        println(secretKey)
    }
}
class MyClass {
    private val secretKey = "1234"

    private inline fun performAction() {
        println(secretKey) 
    }
}
```

internal로 바꾸면 같은 모듈 내에서는 접근 가능해지고, private으로 바꾸면 어차피 inline함수도 클래스 내부에서만 사용한다는 의미가 되므로 private 멤버에 접근 가능해진다.

`@PublishedApi` 어노테이션은 internal 멤버가 inline 함수에서 사용될 때 컴파일러에게 이 멤버가 외부에 공개되어야 한다고 알려주는 역할을 한다. 이를 통해 inline 함수가 호출되는 곳에서도 internal 멤버에 접근할 수 있게 된다.

소스 코드 레벨은 여전히 internal이지만 바이트코드 레벨에서는 컴파일러가 이 변수를 사실상 public으로 바꿔서 컴파일해버린다. 그래서 inline 함수가 복사되어 외부 모듈로 나갔을 때, 바이트코드 레벨에서는 public처럼 보이기 때문에 에러 없이 실행되는 것이다.

즉 `@PublishedApi`가 붙은 멤버는 사실상 Public API라고 생각하고 관리해야한다. 함부로 이름을 바꾸거나 지우면, 이를 사용하는 inline 함수들이 전부 망가질 수도 있다.
