---
title: navigation3의 철학으로 인해 만나게 된 backstack empty 에러
date: 2025-12-22
category: Andriod
tags: [trouble-shooting, android, jetpack-compose]
---

사이드를 마무리 지으려고 메모앱 개발을 재개했는데, 배경화면 기능을 만들던 중 백버튼을 빠르게 두번 눌렀더니 크래시가 나는 걸 발견했다.

```bash
Error was captured in composition. (Ask Gemini)
java.lang.IllegalArgumentException: NavDisplay backstack cannot be empty
	at androidx.navigation3.ui.NavDisplayKt__NavDisplayKt.NavDisplay(NavDisplay.kt:196)
	at androidx.navigation3.ui.NavDisplayKt.NavDisplay(Unknown Source:1)
	at androidx.navigation3.ui.NavDisplayKt__NavDisplayKt.NavDisplay$lambda$3$NavDisplayKt__NavDisplayKt(Unknown Source:36)
	at androidx.navigation3.ui.NavDisplayKt__NavDisplayKt.$r8$lambda$M55rh_bPSu57F7XJ1H9iBm_a7NY(Unknown Source:0)
	at androidx.navigation3.ui.NavDisplayKt__NavDisplayKt$$ExternalSyntheticLambda2.invoke(D8$$SyntheticClass:0)
	at androidx.compose.runtime.RecomposeScopeImpl.compose(RecomposeScopeImpl.kt:204)
	at androidx.compose.runtime.ComposerImpl.recomposeToGroupEnd(ComposerImpl.kt:1690)
	at androidx.compose.runtime.ComposerImpl.skipCurrentGroup(ComposerImpl.kt:2026)
	at androidx.compose.runtime.ComposerImpl.doCompose-aFTiNEg(ComposerImpl.kt:2660)
	at androidx.compose.runtime.ComposerImpl.recompose-aFTiNEg$runtime(ComposerImpl.kt:2584)
	at androidx.compose.runtime.CompositionImpl.recompose(Composition.kt:1079)
    ...
```

재밌다.

원인은 일단 백스택이 비어있는데 pop을 수행해서 그런 것인데, 일단 onBack에 size 체크해주는 걸로 해결했다.

```kotlin
    val backStack = rememberNavBackStack(Screen.Memo)
    val handleBack: () -> Unit = {
        if (backStack.size > 1) {
            backStack.removeLastOrNull()
        } else {
            onExitApp()
        }
    }
    NavDisplay(
        modifier =
            Modifier
                .fillMaxSize(),
        backStack = backStack,
        onBack = handleBack,
        entryProvider =
            entryProvider {
...
```

backstack 크기가 1이면, activity finish를 호출하도록 했다.

## 왜 이런일이 발생?

NavDisplay 내부 구조를 보면 이런 코드가 있다.

```kotlin
require(backStack.isNotEmpty()) { "NavDisplay backstack cannot be empty" }
```

backstack이 비어있으면 저 메시지를 던지면서 앱을 종료시킨다. backStack은 단순한 List<Any>이고, NavDisplay는 리스트에 있는 것을 보여주는 역할만 한다. 

리스트가 비었을 때 앱을 끄는 역할은 하지 않고 오히려 에러를 던지게 하고 있어서 이런 문제가 발생했다.

Nav2에서는 NavController라는 녀석이 네비게이션을 관리해줬길래 이런 사소한 컨트롤은 해주지않아도 됐었던 것 같은데... 확인해봤다.

```kotlin
internal fun popBackStack(): Boolean {
    return if (backQueue.isEmpty()) {
        // Nothing to pop if the back stack is empty
        false
    } else {
        popBackStack(currentDestination!!.id, true)
    }
}
```

popBackStack이 이렇게 구현되어있었다. else를 타고 쭉쭉 내려가면 이렇게 생긴 코드가 나온다.

```kotlin
internal fun popBackStackInternal(
    destinationId: Int,
    inclusive: Boolean,
    saveState: Boolean = false
): Boolean {
    if (backQueue.isEmpty()) {
        // Nothing to pop if the back stack is empty
        return false
    }
    val popOperations = mutableListOf<Navigator<*>>()
    val iterator = backQueue.reversed().iterator()
    var foundDestination: NavDestination? = null
    while (iterator.hasNext()) {
        val destination = iterator.next().destination
        val navigator = _navigatorProvider.getNavigator<Navigator<*>>(destination.navigatorName)
        if (inclusive || destination.id != destinationId) {
            popOperations.add(navigator)
        }
        if (destination.id == destinationId) {
            foundDestination = destination
            break
        }
    }
    if (foundDestination == null) {
        // We were passed a destinationId that doesn't exist on our back stack.
        // Better to ignore the popBackStack than accidentally popping the entire stack
        val destinationName = NavDestination.getDisplayName(navContext, destinationId)
        Log.i(
            TAG,
            "Ignoring popBackStack to destination $destinationName as it was not found " +
                "on the current back stack"
        )
        return false
    }
    return executePopOperations(popOperations, foundDestination, inclusive, saveState)
}
```

이 코드는 아래 로직으로 돌아간다.

1. 스택 비었나? 체크.
2. 위에서부터 하나씩 깐다.
3. 목표 지점이 나올 때까지 "너 삭제, 너도 삭제..." 하며 리스트에 담는다.
4. 목표 지점을 만나면 inclusive 옵션에 따라 얘까지 삭제할지 말지 정하고 멈춘다.
5. 목표를 못 찾았으면? 아무것도 안 하고 끝낸다.

이걸 navController가 해주고 있던 건데, navigation3에서는 기본철학이 스택관리를 개발자에게 위임하는 것이라서 이런 결과가 나온 것 같다.