---
title: LongPress 애니메이션 구현하기
date: 2026-01-31
category: Andriod
tags: [trouble-shooting, android, jetpack-compose]
---

프로젝트 진행 중 버튼을 길게 누를 때 점진적으로 채워지는 progress ui가 필요했다. 단순 버튼 보다 사용자의 의도가 확실할 때 동작할 수 있도록 구현하고 싶었고, 고민한 과정을 적어보겠다.

---

## compose로 progress bar 그리기

처음엔 직관적으로 구현하려고 progress 값을 progress composable의 width로 업데이트 되게 했다.

```kotlin
@Composable
fun WithoutDrawWithContent() {
    val progress = remember { Animatable(0f) }
    val scope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(60.dp)
            .clip(RoundedCornerShape(12.dp))
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF424242))
        )

        Box(
            modifier = Modifier
                .fillMaxWidth(progress.value)
                .height(60.dp)
                .background(Color(0xFFFF5252))
        )

        Box(
            modifier = Modifier
                .fillMaxSize()
                .pointerInput(Unit) {
                    detectTapGestures(
                        onPress = {
                            scope.launch {
                                progress.animateTo(
                                    targetValue = 1f,
                                    animationSpec = tween(1000, easing = LinearEasing)
                                )
                            }
                            tryAwaitRelease()
                            scope.launch { progress.snapTo(0f) }
                        }
                    )
                },
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "PRESS & HOLD",
                color = Color.White,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
```

구현은 되는데 성능 면에서 아주 큰 문제가 있다.

왜 문제가 될까? Compose의 렌더링 파이프라인을 이해해야 한다. Compose는 Composition, Layout, Drawing이라는 세 단계를 거쳐 UI를 그린다. 

위 코드에서 `progress.value`가 변경될 때마다 진행 바 Box의 `fillMaxWidth(progress.value)` 부분이 새로운 값을 받게 되고 이건 곧바로 리컴포지션을 발생시킨다.

60fps로 애니메이션이 동작한다면 1초에 60번 즉 1초 애니메이션 동안 약 60번의 리컴포지션이 발생하는 것이다.

심지어 에뮬레이터에서는 차이가 나지 않을 수 있는데 실기기로 테스트했을 때는 뚝뚝 끊기는 느낌이 매우 강했다.

이걸 해결하기 위해서는 UI에 특화된 Modifier 확장함수를 써야된다. `drawWithContent`를 사용하면 동일한 시각적 효과를 훨씬 효율적으로 구현할 수 있다.

```kotlin
@Composable
fun WithDrawWithContent() {
    val progress = remember { Animatable(0f) }
    val scope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(60.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFF424242))
            .pointerInput(Unit) {
                detectTapGestures(
                    onPress = {
                        scope.launch {
                            progress.animateTo(
                                targetValue = 1f,
                                animationSpec = tween(1000, easing = LinearEasing)
                            )
                        }
                        tryAwaitRelease()
                        scope.launch { progress.snapTo(0f) }
                    }
                )
            }
            .drawWithContent {
                clipRect(right = size.width * progress.value) {
                    drawRect(Color(0xFF4CAF50))
                }
                drawContent()
            },
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "PRESS & HOLD",
            color = Color.White,
            fontWeight = FontWeight.Bold
        )
    }
}
```

`drawWithContent`는 Compose 렌더링 파이프라인의 Drawing 단계에서만 작동한다. `progress.value`가 변경되어도 Composition이나 Layout 단계를 거치지 않고 Canvas에 그려지는 내용만 바뀔 뿐이다.

`clipRect`는 특정 영역만 그리도록 제한하는 Canvas API로 `right = size.width * progress.value`로 오른쪽 끝을 설정하면 progress 값에 따라 점점 더 길게 그려진다. 

예를 들어 progress가 0.5라면 전체 너비의 50%까지만 초록색 사각형이 그려지고 나머지는 배경색이 보이게 된다. 

## 진짜 된 걸까?

실제로 layout inspector를 켜서 보면 drawWithContent를 사용한게 더 recomposition 횟수가 많다.

이론은 맞는데, 지금 progress.value가 state라서 state가 바뀌니 리컴포지션이 일어나고 draw 과정이 progress 업데이트 횟수보다 많아질 것이다. 의심하지않고 읽고 있었다면 죄송한 부분이 되겠다.

그래서 Animatable의 .value를 읽는 위치가 중요하다.

위에서 drawWithContent는 Drawing 단계에서만 작동하므로 리컴포지션이 발생하지 않는다고 했는데 조건이 하나 붙는다.

drawWithContent 람다 안에서 progress.value를 읽으면, Compose의 스냅샷 시스템이 "이 Composable은 progress에 의존한다"고 기록해서 progress가 바뀌면 해당 Composable이 리컴포지션 대상이 된다. 놀랍다.

진짜 Drawing 단계에서만 동작하게 하려면 drawWithContent 대신 Modifier.graphicsLayer와 함께 State 읽기를 람다 안에서 defer처리하는 방식으로 바꿔야한다.


```kotlin
val progress = remember { Animatable(0f) }
val scope = rememberCoroutineScope()

Box(
    modifier = Modifier
        .fillMaxWidth()
        .height(60.dp)
        .clip(RoundedCornerShape(12.dp))
        .background(Color(0xFF424242))
        .pointerInput(Unit) {
            detectTapGestures(
                onPress = {
                    scope.launch {
                        progress.animateTo(
                            targetValue = 1f,
                            animationSpec = tween(1000, easing = LinearEasing)
                        )
                    }
                    tryAwaitRelease()
                    scope.launch { progress.snapTo(0f) }
                }
            )
        }
        .graphicsLayer {
            clip = true
            shape = GenericShape { size, _ ->
                addRect(Rect(0f, 0f, size.width * progress.value, size.height))
            }
        }
        .background(Color(0xFF4CAF50)),
    contentAlignment = Alignment.Center
) {
    Text(
        text = "PRESS & HOLD",
        color = Color.White,
        fontWeight = FontWeight.Bold
    )
}
```

![image-1](/images/260131/image.png)

graphicsLayer에서 읽는 State는 Drawing 단계에서만 평가되기 때문에 놀랍게도 recomposition이 발생하지않는다.

---

진행 바를 그리는 최적화를 마쳤으니 이제 애니메이션 자체를 어떻게 제어할지 결정해야 한다. Compose는 여러 가지 애니메이션 API를 제공하며 각각 다른 특성을 가진다.

### delay()

첫 번째 방식은 코루틴의 `delay()`를 사용한다.

```kotlin
@Composable
fun LongPressCase1() {
    var progress by remember { mutableFloatStateOf(0f) }
    var isPressed by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(60.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFF1976D2))
            .pointerInput(Unit) {
                detectTapGestures(
                    onPress = {
                        isPressed = true
                        scope.launch {
                            val totalTime = 1000L
                            val steps = 50
                            val stepDelay = totalTime / steps

                            for (i in 1..steps) {
                                if (!isPressed) {
                                    progress = 0f
                                    break
                                }
                                delay(stepDelay)
                                progress = i / steps.toFloat()
                            }

                            if (progress >= 1f) {
                                Log.d(TAG, "Case 1: Long press completed!")
                            }
                        }

                        tryAwaitRelease()
                        isPressed = false
                        progress = 0f
                    }
                )
            }
            .graphicsLayer {
                clip = true
                shape = GenericShape { size, _ ->
                    addRect(Rect(0f, 0f, size.width * progress, size.height))
                }
            }
            .background(Color(0xFF64B5F6)),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "PRESS & HOLD",
            color = Color.White,
            fontWeight = FontWeight.Bold
        )
    }
}
```

단순하다. 1초를 50개의 스텝으로 나누고 각 스텝마다 20ms씩 대기한다.

매 스텝마다 progress를 2%씩 증가시켜 최종적으로 100%에 도달한다. 중간에 손가락을 떼면 `isPressed`가 false가 되어 루프를 탈출한다.

문제는 `delay()`가 정확히 지정된 시간만큼 대기하는 것을 보장하지 않는다. 시스템이 바쁘거나 다른 작업이 대기 중이라면 실제 지연 시간이 더 길어질 수 있다. 

20ms씩 50번 대기하면 이론상 1000ms가 되어야 하지만 실제로는 1050ms나 1100ms가 걸릴 수 있다. 사용자 입장에서는 애니메이션이 예상보다 느리게 느껴진다.

또 다른 문제는 프레임 레이트와의 불일치다. 60Hz를 목표로 설정하면 약 16.67ms마다 화면을 갱신한다.

그런데 20ms마다 progress를 업데이트하면 일부 프레임에서는 변화가 없고 일부 프레임에서는 어쩌다보니 두 번 업데이트될 수 있다. 이는 애니메이션이 미묘하게 끊기는 느낌을 주게 된다.

### Animatable.animateTo()

두 번째 방식은 프레임워크 레벨에서 최적화된 애니메이션을 제공하는 Compose의 `Animatable` API를 사용하는 것이다.

```kotlin
@Composable
fun LongPressCase2() {
    val progress = remember { Animatable(0f) }
    val scope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(60.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFFE91E63))
            .pointerInput(Unit) {
                detectTapGestures(
                    onPress = {
                        scope.launch {
                            val result = progress.animateTo(
                                targetValue = 1f,
                                animationSpec = tween(
                                    durationMillis = 1000,
                                    easing = LinearEasing
                                )
                            )

                            if (result.endReason == AnimationEndReason.Finished) {
                                Log.d(TAG, "Case 2: Long press completed!")
                            }
                        }

                        tryAwaitRelease()
                        scope.launch { progress.snapTo(0f) }
                    }
                )
            }
            .graphicsLayer {
                clip = true
                shape = GenericShape { size, _ ->
                    addRect(Rect(0f, 0f, size.width * progress.value, size.height))
                }
            }
            .background(Color(0xFFF06292)),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "PRESS & HOLD",
            color = Color.White,
            fontWeight = FontWeight.Bold
        )
    }
}
```

`Animatable`의 핵심 원리는 프레임 동기화다. 

`animateTo()`를 호출하면 내부적으로 매 프레임마다 현재 시간을 체크하고 지정된 duration과 easing 함수에 따라 정확한 progress 값을 계산한다.

예를 들어 1000ms 동안 0에서 1로 애니메이션한다면 첫 프레임(16.67ms)에서는 0.01667, 두 번째 프레임(33.34ms)에서는 0.03334와 같이 정밀하게 계산된다. 

`LinearEasing`을 사용했으므로 progress는 시간에 정확히 비례한다. 만약 `FastOutSlowInEasing`을 사용했다면 시작과 끝에서 속도가 느려지는 부드러운 곡선을 그린다.

`animateTo()`는 `AnimationResult`를 반환하는데 여기에는 애니메이션이 완료되었는지 취소되었는지를 나타내는 `endReason`이 포함된다. 

사용자가 중간에 손가락을 떼면 `tryAwaitRelease()` 이후의 `snapTo(0f)`가 실행되어 애니메이션이 즉시 취소되고 다음번 실행 시 `endReason`은 `Finished`가 아닌 `BoundReached`가 된다.

delay방식과는 다르게 1000ms라고 지정하면 정확히 1000ms에 완료되며 모든 프레임이 균일하게 업데이트된다.

### InteractionSource + animateFloatAsState

세 번째 방식은 상태 기반 애니메이션이다.

```kotlin
@Composable
fun LongPressCase3() {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()

    val progress by animateFloatAsState(
        targetValue = if (isPressed) 1f else 0f,
        animationSpec = if (isPressed) {
            tween(durationMillis = 1000, easing = LinearEasing)
        } else {
            snap()
        },
        label = "progress"
    )

    LaunchedEffect(progress) {
        if (progress >= 1f) {
            Log.d(TAG, "Case 3: Long press completed!")
        }
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(60.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFFFF9800))
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                onClick = {}
            )
            .graphicsLayer {
                clip = true
                shape = GenericShape { size, _ ->
                    addRect(Rect(0f, 0f, size.width * progress, size.height))
                }
            }
            .background(Color(0xFFFFB74D)),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "PRESS & HOLD",
            color = Color.White,
            fontWeight = FontWeight.Bold
        )
    }
}
```

이 방식은 명령형이 아닌 선언형이다.

"애니메이션을 시작해"라고 말하는 대신 "눌렸을 때는 1이고 아닐 때는 0이다"라고 선언하여 Compose가 알아서 상태 변화를 감지하고 애니메이션을 실행한다.

`MutableInteractionSource`는 사용자 인터랙션을 추적하는 Compose의 내장 메커니즘이다. 

`clickable` Modifier에 연결하면 press, release, drag 등의 이벤트를 자동으로 수집한다. `collectIsPressedAsState()`는 이 중 press 상태만 Flow로 변환하여 Compose State로 만든다.

`animateFloatAsState`는 타겟 값이 변경될 때마다 자동으로 애니메이션을 시작한다. `isPressed`가 true가 되면 0에서 1로 1000ms 동안 애니메이션하고, false가 되면 `snap()`을 사용하여 즉시 0으로 돌아간다. 

이 모든 과정을 Compose가 알아서 상태를 보고 관리하며 코루틴을 직접 관리할 필요가 없다.

완료 감지는 `LaunchedEffect`로 처리한다. progress가 1.0에 도달하면 side effect 패턴에 맞게 원하는 동작을 수행하면 된다.

이 방식은 Compose의 Recomposition 최적화를 최대한 활용한다. `isPressed`가 변경되어도 Box 전체가 리컴포지션되지 않고, `animateFloatAsState`의 결과만 업데이트된다.