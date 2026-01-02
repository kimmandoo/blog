---
title: Compose에서 Darkmode 제대로 지원하기
date: 2025-12-30
category: Andriod
tags: [trouble-shooting, android, material-theme, jetpack-compose]
---

메모장에 다크모드를 적용하는 도중에 부딪히며 알게된 정보를 기록해보겠다.

이미지를 배경화면으로 설정하고, 그 위에 Box로 가린 뒤 opacity를 조절하는 방식으로 구현했었는데 다크모드 전환할 때 원하는 결과가 나오지 않았다. 이때 컬러를 background로 했었는데, scrim이 있다는 것을 알게 되었다.

### scrim

UI 디자인에서 뒤에 있는 콘텐츠를 가리거나, 배경을 어둡게 눌러주어 앞에 있는 콘텐츠(팝업, 텍스트 등)를 돋보이게 만드는 반투명한 레이어를 말한다. 내가 원하는 상황에 딱 맞는 기능이다.

예를 들면,

- **Modal/Dialog:** 팝업창이 뜰 때 뒤에 깔리는 어두운 배경.
- **Bottom Sheet:** 바텀 시트가 올라올 때 뒤쪽 화면이 어두워지는 것.
- **Text over Image:** (이번 케이스) 밝은 이미지 위에 흰 글씨를 쓸 때, 글씨 뒤에 살짝 검은색 그라데이션을 넣는 것.

이런 곳에 쓸 수 있다.

`MaterialTheme.colorScheme.scrim`이라는 색상 토큰이 기본으로 존재하는데  `val Neutral0 = Color(red = 0, green = 0, blue = 0)`으로 되어있다.

이 존재를 알고 나서 처음에는 이미지 위에 `scrim`을 덮어서 이미지를 어둡게 만들려 했지만, 나중에는 텍스트 가독성을 위해 텍스트 에디터 뒤에 반투명한 배경(Container)을 까는 방식으로 해결했다.

### darkmode 지원 원칙

**"절대 색상" 대신 "의미론적(Semantic) 색상" 사용하기**가 핵심이다.

`Color.White`나 `Color.Black`을 직접 박아넣으면 다크 모드에서 색상이 반전되지 않아 글씨가 안 보인다. 정확하게 내 상황과 똑같았다. theme가 바뀌면 material이 그걸 감지해서 처리하도록 하면 편한데 static하게 고정시켜두면 관리가 번거롭기도 하고 예상하지 못한 문제가 발생할 수 있다.

```kotlin
// 다크모드 가면 글씨가 안 보임
Text(text = "메모", color = Color.Black) 

// 테마에 따라 자동 변환
Text(text = "메모", color = MaterialTheme.colorScheme.onSurface)
```

예를 들면, `Color.White` (배경), `Color.Black` (글씨) 보다는 `MaterialTheme.colorScheme.background` (배경), `MaterialTheme.colorScheme.onBackground` (글씨)를 사용하는 게 정신건강에 아주 아주 좋다.

방금 코드에서 테마 색상값 정의 패턴 냄새가 느껴지는 가?

### On 이해하기

Material Design에는 "on"이라는 접두사가 붙은 색상들이 있다. 영어 그대로 생각하면 되는데, "~위에 올라가는 색"이다.

브랜드 컬러는 `primary`, 브랜드 컬러 위에 글씨는 `onPrimary`가 된다. 

좀 더 가서, `Surface` (배경) 위에는 무조건 `onSurface` (글씨/아이콘)를 쓰고, `Primary` (버튼 배경) 위에는 무조건 `onPrimary` (버튼 글씨)를 쓰는 식으로 짝(Pair)을 맞춰주면 다크 모드에서 배경이 검게 변할 때 글씨는 자동으로 하얗게 변하게 된다. 

이미지를 배경화면으로 쓰는 나의 경우에는, surface를 하나 위로 띄워서 처리하는 게 자연스럽다.

```kotlin
val editorBackgroundColor = if (isImage) {
    MaterialTheme.colorScheme.surface.copy(alpha = 1 - state.wallpaperOpacity)
} else {
    Color.Transparent
}

Scaffold(
    containerColor = editorBackgroundColor,
    topBar = {
...
```

이렇게 사용했다. 

### Icon의 경우

텍스트는 `Text` 컴포저블이 색상을 관리해주지만, 아이콘은 이미지 파일 자체에 색상이 박혀 있는 경우가 많다. 

만약 디자이너가 검은색으로 만들어준 SVG 아이콘을 그대로 사용하면 다크 모드에서 아이콘이 배경에 묻혀 보이지 않게 된다. 따라서 아이콘을 사용할 때는 절대 원본 색상을 믿으면 안 되며, 반드시 코드상에서 `tint` 속성을 통해 색상을 입혀줘야된다. 

```kotlin
Icon(
    painter = painterResource(id = R.drawable.ic_save),
    contentDescription = "저장",
    // 틴트를 지정하지 않으면 검정 아이콘이 안 보일 수 있음
    // 부모 컨테이너의 텍스트 색상(onSurface)을 따라가게 설정
    tint = LocalContentColor.current 
    // 혹은 tint = MaterialTheme.colorScheme.onSurface
)
```

이때도 역시 `Color.Black`처럼 static으로 박는게 아니라 `LocalContentColor.current`나 `MaterialTheme.colorScheme.onSurface`를 사용하여 부모 컨테이너의 배경색에 맞춰 아이콘 색상이 자동으로 따라가도록 설정하면 하나의 아이콘 리소스로 라이트 모드와 다크 모드 모두를 완벽하게 대응할 수 있다.