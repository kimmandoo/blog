---
title: derivedStateOf와 snapshotFlow 이해하기
date: 2025-12-15
category: Android
tags: [android, jetpack-compose]
---

Jetpack Compose에서 State를 다룰 때, 상태 변화에 반응해야 하는 경우가 자주 있다. 이를 위한 두 가지 강력한 API가 바로 `derivedStateOf`와 `snapshotFlow`이다.

이 둘의 핵심적인 차이는 무엇을 생성하느냐와 어디에 사용되느냐에 있다.

두 API 모두 State의 변화에 반응하지만, 그 목적과 메커니즘은 근본적으로 다르다.

`derivedStateOf`는 주로 UI 최적화를 위해 새로운 파생된 State 객체를 생성하고, `snapshotFlow`는 상태 변화를 ViewModel과 같은 Non-Compose 계층으로 연결하기 위해 설계된 Flow 스트림을 생성한다.

## derivedStateOf

```kotlin
@Composable
fun CountDisplay(count: State<Int>) {
    Text("Count: ${count.value}")
}

@Composable
fun Example() {
    var a by remember { mutableStateOf(0) }
    var b by remember { mutableStateOf(0) }
    val sum = remember { derivedStateOf { a + b } }
    // a나 b가 변경되면 CountDisplay는 리컴포지션되지만, 
    // Example 자체는 리컴포지션되지 않는다.
    CountDisplay(sum)
}
```

공식 문서의 예제 코드를 가져왔다.

`derivedStateOf`는 다른 State 객체들로부터 계산된 값을 가지는 새로운 State 객체를 만드는 데 사용된다.

'똑똑한 메모이제이션 계산기'라고 생각하면 된다. 계산 결과가 실제로 변경될 때만 값을 다시 계산하고, 이 값을 읽는 곳(readers)에 알려 리컴포지션을 유발한다.

이는 매우 중요한 최적화 도구인데, scrollState가 대표적인 예시이다.

```kotlin
val listState = rememberLazyListState()

// 비효율적인 방식
val showButtonBad = listState.firstVisibleItemIndex > 5

// 효율적인 방식
val showButtonGood by remember {
    derivedStateOf { listState.firstVisibleItemIndex > 5 }
}
```

`derivedStateOf`는 연산 자체를 감싸고 있다. 우리는 listState를 직접 읽는 것이 아니라, `derivedStateOf`가 생성한 `State<Boolean>`을 읽게 된다.

따라서 계산 결과인 `listState.firstVisibleItemIndex > 5`가 실제로 변경될 때만 값을 업데이트하고 소비자에게 알려 리컴포지션을 트리거한다.

왜 `showButtonBad`가 비효율적일까?

`showButtonBad`은 `listState.firstVisibleItemIndex`를 직접 읽는다. 스크롤을 할 때마다 `firstVisibleItemIndex`가 계속 변하므로, 이 컴포저블(그리고 `showButtonBad`를 사용하는 모든 컴포저블)이 불필요하게 계속 리컴포지션된다.

## snapshotFlow

`snapshotFlow`는 다르다.

Compose의 State 변경 사항을 코루틴(Coroutine)으로 내보내는 역할을 해주며, 보통 ViewModel에서 이를 수집(collect)하여 처리한다. 이를 통해 `debounce`, `distinctUntilChanged`, `filter`, `map`과 같은 연산자들을 사용할 수 있게 된다.

Compose의 State 시스템은 Compose 런타임의 일부이지만, ViewModel은 코루틴 기반의 StateFlow나 SharedFlow를 사용한다. 

`snapshotFlow`는 이 둘 사이의 연결다리 역할을 한다.

```kotlin
val listState = rememberLazyListState()

LaunchedEffect(listState) {
    snapshotFlow { listState.firstVisibleItemIndex }
        .map { index -> index > 5 } 
        .distinctUntilChanged()     
        .debounce(300)              
        .collect { showButton ->
            viewModel.onShowButtonChanged(showButton) 
        }
}
```

작동 방식은 `derivedStateOf`와 거의 비슷해 보이지만, Flow와 함께 디바운스(debounce)나 중복 제거(distinct) 로직을 사용할 수 있다는 점이 다르다.

`distinctUntilChanged()`를 사용하여 Boolean 값이 이전과 다를 때만 진행하도록 보장하고 `debounce(300)`을 사용하여 값을 방출하기 전 300ms 동안을 기다린다.

이는 사용자가 경계선 `(index 5)` 근처에서 빠르게 위아래로 스크롤할 때 ViewModel에 요청이 막 쏟아지는 것을 막을 수 있다.

요약하자면, UI State의 변경 사항을 ViewModel이나 다른 비즈니스 로직 계층에 알려야 한다면 snapshotFlow를 사용하면 좋다.