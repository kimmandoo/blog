---
title: callbackFlow로 callback api를 flow로 전환하기
date: 2025-12-15
category: kotlin-coroutine
tags: [kotlin-coroutine, flow]
---

안드로이드 개발을 하다 보면 위치 정보(Location), 텍스트 변경(TextWatcher), 센서 데이터 등과 같이 시스템이나 외부 라이브러리가 콜백(Callback)으로 던져주는 데이터를 처리해야 할 때가 있다.

이런 비동기 콜백 데이터를 코틀린의 Flow 파이프라인으로 가져오기 위해 사용하는 것이 `callbackFlow`다.

Flow와 callbackFlow의 가장 큰 차이는 "데이터를 누가 생산하는가"이다. flow는 능동, callbackFlow는 수동이라고 개념을 잡자.

```kotlin
val simpleFlow = flow {
    for (i in 1..3) {
        delay(1000) // 원할 때 멈출(suspend) 수 있음
        emit(i)     // 직접 배달 (suspend)
    }
}
```

flow는 개발자가 정의한 로직에 따라 데이터를 순차적으로 만들어서 내보낸다.

```kotlin
// 외부(리스너)가 데이터를 줄 때까지 기다림
val locationFlow = callbackFlow {
    val listener = object : LocationListener {
        override fun onLocationUpdate(location: String) {
            // emit(location) -> ❌ 호출 불가 (Suspend 함수가 아니기 때문)
            trySend(location) // ✅ OK (비동기 채널에 던져넣기)
        }
    }
}
```

반대로 callbackFlow는 데이터가 언제 올지 모른다. 외부(시스템, UI, 라이브러리)에서 콜백을 호출해줄 때, 데이터를 받아와야 된다.

## callbackFlow 구조

리스너 등록 - 데이터 전달 - 종료 처리로 구성된다. 특히 종료처리는 `awaitClose`로 되는데, flow가 닫힐 때 리스너를 해제하도록 하고, flow를 구독중일 때 suspend를 먹여 callback을 받는 flow가 닫히지 않도록 해주는 역할을 한다.

```kotlin
fun getLocationFlow(): Flow<String> = callbackFlow {
    // 1. 리스너 정의
    val listener = object : LocationListener {
        override fun onLocationUpdate(location: String) {
            // 2. 데이터가 들어오면 Flow 파이프라인으로 전송
            trySend(location) 
        }
    }

    // 3. 리스너 등록 (데이터 수신 시작)
    locationManager.registerListener(listener)

    // 4. 종료 대기 및 청소
    // Flow 수집이 끝날 때까지 여기서 대기(Suspend)하다가, 종료 신호가 오면 블록 내부를 실행함
    awaitClose {
        locationManager.unregisterListener(listener)
    }
}
```

### 왜 emit이 아니라 trySend인가?

일단 emit은 suspend 함수고, trySend는 일반 함수다. 콜백함수는 suspend가 아니기 때문에, emit을 사용하기 부적절하다는 점이 첫번째로 알고 들어가야하는 부분이다.

callbackFlow는 내부적으로 채널(Channel)이라는 버퍼(Queue)를 가지고 있다. 컨베이어 벨트를 생각하면 된다.

- `emit()` (Suspend 함수)

받는 사람이 가져갈 때까지 벨트 앞에서 기다린다. 콜백 함수(onLocationUpdate)는 시스템이 호출하는 일반 함수인데, 여기서 코드 실행을 멈추고(Suspend) 기다리면 앱이 버벅이거나 ANR이 발생해 크래시가 날 수 있다.

- `trySend()` (일반 함수)

일단 벨트 위에 물건을 툭 던져놓고 바로 자기 할 일을 하러 간다. 즉, 기다리지 않고(Non-blocking) 채널에 자리가 있으면 성공(Success), 꽉 찼으면 실패(Failure)를 반환한다.

trySend는 데이터를 내부 Channel/Buffer에 집어넣는 역할을 하며, collect하는 쪽에서 이 데이터를 하나씩 꺼내간다. 우리가 아는 flow로 바꿔주는 것이다.

### callbackFlow는 cold-flow이다.

callbackFlow는 기본적으로 Cold Flow다. 이는 "구독자(Collector)가 생길 때마다 코드를 처음부터 다시 실행한다"는 뜻으로 코드 로직에 따라 매번 인스턴스를 생성하게 될 수도 있다는 것이다.

```kotlin
val locationFlow = repository.getLocationFlow() // Cold Flow

// 화면 A에서 구독 -> 리스너 등록 1
lifecycleScope.launch { locationFlow.collect { ... } } 

// 화면 B에서 구독 -> 리스너 등록 2 -> 이미 있는 리스너를 재사용하지않음
lifecycleScope.launch { locationFlow.collect { ... } }
```

동일한 역할을 하는 리스너를 2개나 등록하는 것은 자원 낭비다. 이를 해결하기 위해 Hot Flow(SharedFlow, StateFlow)로 변환해주는 작업이 필요하다.

`shareIn`, `stateIn`으로 간단하게 바꿀 수 있다.

```kotlin
val sharedFlow = rawFlow.shareIn(
    scope = viewModelScope,
    started = SharingStarted.WhileSubscribed(5000), // 5초 여유
    replay = 1 // 신규 구독자에게 최근 데이터 1개 재발송
)
```

shareIn은 SharedFlow를 생각하면 된다. 초기값이 필요 없고, 이벤트가 발생했을 때만 전파한다. 일회성 작업에 적절하다.

```kotlin
val stateFlow = rawFlow.stateIn(
    scope = viewModelScope,
    started = SharingStarted.WhileSubscribed(5000),
    initialValue = "위치 확인 중..."
)
```

stateIn은 StateFlow에 적절하다. 초기값이 필수이며, 항상 현재의 상태를 가지고 있다.

WhileSubscribed(5000)의 의미는 구독자가 사라져도 5초간은 연결을 끊지 말고 기다리라는 의미다. 구성변경이 발생하면 액티비티가 파괴되었다가 재생성되는데, 그 때 잠시 구독자가 0명이 되어 리스너에 완전히 새로 연결되는 경우가 생긴다.

이 때 생기는 비효율을 막기위해 WhileSubscribed 옵션을 넣어준다.