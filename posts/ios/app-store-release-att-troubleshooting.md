---
title: 앱스토어 심사 리젝받은 AppTrackingTransparency 대응하기
date: 2026-06-07
category: ios
tags: [trouble-shooting, ios, app-store]
---

앱스토어에 앱을 올렸는데, 심사에서 이런 메시지가 왔다.

```text
Guideline 2.1 - Information Needed

The app uses the AppTrackingTransparency framework,
but we are unable to locate the App Tracking Transparency permission request.
```

대충 앱이 AppTrackingTransparency를 쓰고 있는데, 정작 권한 요청 팝업은 못 찾겠다는 내용이었다.

처음엔 좀 억울했다.

`Info.plist`에 ATT 문구를 넣어뒀기 때문이다.

```xml
<key>NSUserTrackingUsageDescription</key>
<string>맞춤형 광고 제공 및 광고 성과 측정을 위해 앱 추적 권한을 요청합니다.</string>
```

근데 알고 보니 이건 그냥 팝업에 들어갈 문구일 뿐이었다.

문구를 넣는다고 팝업이 뜨는게 아니다.

실제로 팝업을 띄우려면 이걸 호출해야 한다.

```swift
ATTrackingManager.requestTrackingAuthorization { _ in }
```

여기까지는 단순했다.

문제는 저 코드를 넣었는데도 팝업이 안 떴다는 것이다.

## 1차 수정

처음에는 `AppDelegate`에 넣었다.

앱이 active가 되면 ATT 권한 요청을 날리면 되겠지 싶었다.

```swift
import AppTrackingTransparency
import Flutter
import UIKit

@main
@objc class AppDelegate: FlutterAppDelegate {
  private var didRequestTrackingAuthorization = false

  override func applicationDidBecomeActive(_ application: UIApplication) {
    super.applicationDidBecomeActive(application)
    requestTrackingAuthorizationIfNeeded()
  }

  func requestTrackingAuthorizationIfNeeded() {
    guard #available(iOS 14, *) else {
      return
    }
    guard !didRequestTrackingAuthorization else {
      return
    }
    guard ATTrackingManager.trackingAuthorizationStatus == .notDetermined else {
      return
    }

    didRequestTrackingAuthorization = true
    ATTrackingManager.requestTrackingAuthorization { _ in }
  }
}
```

흐름은 아래와 같다.

1. iOS 14 이상인지 확인한다.
2. 이미 요청했으면 다시 요청하지 않는다.
3. tracking status가 `notDetermined`일 때만 요청한다.
4. `requestTrackingAuthorization`을 호출한다.

이 정도면 될 줄 알았다. 근데 release build를 아이폰에 설치해보니 팝업이 안 떴다.

## Info.plist를 다시 봄

일단 `Info.plist`를 다시 봤다.

ATT 문구가 빠졌나 싶었는데, 그건 아니었다.

오히려 눈에 들어온 건 이 부분이었다.

```xml
<key>UIApplicationSceneManifest</key>
<dict>
  <key>UIApplicationSupportsMultipleScenes</key>
  <false/>
  <key>UISceneConfigurations</key>
  <dict>
    <key>UIWindowSceneSessionRoleApplication</key>
    <array>
      <dict>
        <key>UISceneClassName</key>
        <string>UIWindowScene</string>
        <key>UISceneConfigurationName</key>
        <string>flutter</string>
        <key>UISceneDelegateClassName</key>
        <string>$(PRODUCT_MODULE_NAME).SceneDelegate</string>
        <key>UISceneStoryboardFile</key>
        <string>Main</string>
      </dict>
    </array>
  </dict>
</dict>
```

여기서 scene lifecycle을 쓰고 있었다.

이게 문제였다.

앱이 active가 되는 시점을 `AppDelegate.applicationDidBecomeActive`에서만 잡으려고 했는데, scene 기반 앱에서는 scene 쪽 lifecycle을 타는 경우가 있다.

즉 내가 기다리고 있던 이벤트가 내가 생각한 곳으로 안 들어올 수 있었다.

`AppDelegate`에 코드를 잘 넣어도, 그 메서드가 심사 환경에서 원하는 타이밍에 안 불리면 팝업은 안 뜬다.

그래서 `SceneDelegate` 쪽에도 연결했다.

```swift
import Flutter
import UIKit

class SceneDelegate: FlutterSceneDelegate {
  override func sceneDidBecomeActive(_ scene: UIScene) {
    super.sceneDidBecomeActive(scene)
    (UIApplication.shared.delegate as? AppDelegate)?
      .requestTrackingAuthorizationIfNeeded()
  }
}
```

이렇게 하면 scene이 active가 됐을 때 `AppDelegate`에 있는 helper를 부른다.

Flutter 앱이라서 `FlutterSceneDelegate`를 상속했고, `super.sceneDidBecomeActive(scene)`도 먼저 호출했다.

여기까지 하고 다시 설치했다.

근데 또 바로 뜨지는 않았다.

## active 체크가 너무 빨랐다

두 번째 문제는 active 체크 타이밍이었다.

처음에는 helper 시작 부분에 이런 코드를 넣어두었다.

```swift
guard UIApplication.shared.applicationState == .active else {
  return
}
```

앱이 active 상태일 때만 ATT를 띄워야 하니까, active가 아니면 return 치는게 맞아 보인다.

근데 `sceneDidBecomeActive` 직후에 바로 이 값을 보면 아직 `.active`로 안 잡히는 타이밍이 있었다.

그러면 이런 일이 생긴다.

```text
sceneDidBecomeActive 호출됨
-> requestTrackingAuthorizationIfNeeded 호출됨
-> applicationState가 아직 active가 아님
-> return
-> ATT 요청 예약 자체가 안 됨
```

이러면 아무 일도 안 일어난다.

심지어 여기서 `didRequestTrackingAuthorization = true`를 먼저 바꿔버리면 더 나빠진다.

실제로 요청은 안 했는데, 코드 입장에서는 이미 요청한 것으로 처리될 수 있기 때문이다.

그래서 구조를 바꿨다.

active 체크를 helper 초반이 아니라, 실제 요청 직전으로 옮겼다.

```swift
func requestTrackingAuthorizationIfNeeded() {
  guard #available(iOS 14, *) else {
    return
  }
  guard !didRequestTrackingAuthorization else {
    return
  }
  guard ATTrackingManager.trackingAuthorizationStatus == .notDetermined else {
    return
  }

  DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
    guard !self.didRequestTrackingAuthorization else {
      return
    }
    guard UIApplication.shared.applicationState == .active else {
      return
    }
    guard ATTrackingManager.trackingAuthorizationStatus == .notDetermined else {
      return
    }

    self.didRequestTrackingAuthorization = true
    ATTrackingManager.requestTrackingAuthorization { _ in }
  }
}
```

흐름은 이렇게 된다.

```text
sceneDidBecomeActive
-> 일단 ATT 요청이 필요한 상태인지 확인
-> 0.5초 뒤로 미룸
-> 그때 진짜 앱이 active인지 확인
-> 그때도 notDetermined인지 확인
-> didRequestTrackingAuthorization = true
-> requestTrackingAuthorization 호출
```

핵심은 `didRequestTrackingAuthorization = true`를 실제 요청 직전에 둔 것이다.

요청이 실패할 수 있는 조건을 다 통과한 다음에야 true로 바꾼다.

이렇게 안 하면 타이밍 문제로 한 번 return된 뒤 다음 기회가 막힐 수 있다.

## 팝업이 안뜨는게 정상인 경우

여기서 또 헷갈리는 지점이 있었다.

ATT 팝업은 계속 뜨는 팝업이 아니다.

상태가 `notDetermined`일 때만 뜬다.

```text
notDetermined -> 팝업 뜰 수 있음
authorized    -> 이미 허용해서 안 뜸
denied        -> 이미 거부해서 안 뜸
restricted    -> 시스템 정책상 안 뜸
```

그러니까 같은 기기에 앱을 계속 덮어 설치하면서 테스트하면, 팝업이 안 뜨는게 정상일 수 있다.

처음에는 이것도 헷갈렸다.

코드가 잘못돼서 안 뜨는 건지, 이미 권한 상태가 결정돼서 안 뜨는 건지 구분이 안 된다.

그래서 실기기 테스트는 앱을 지우고 다시 했다.

```bash
xcrun devicectl device uninstall app \
  --device 00008130-001E58C13AE0001C \
  app.gguldong.gguldong
```

그리고 release build로 다시 설치했다.

```bash
DART_TOOL_ANALYTICS=0 flutter run --release \
  -d 00008130-001E58C13AE0001C \
  --dart-define-from-file=config/admob.dart_defines.json
```

이렇게 fresh install 상태로 띄우니까 팝업이 보였다.

이걸 보고 나서야 Apple이 말한 "fresh install 또는 tracking permission reset 이후 녹화"가 왜 필요한지 이해됐다.

## AdMob 초기화도 같이 늦춰야 했다

ATT 팝업을 띄우는 것만으로 끝이 아니었다.

Apple 메시지에는 이런 내용도 있었다.

```text
The request should appear before any data is collected
that could be used to track the user.
```

즉 추적에 쓰일 수 있는 데이터를 수집하기 전에 ATT 요청이 떠야 한다.

근데 기존 코드에서는 앱 시작 시점에 AdMob을 초기화하고 있었다.

```dart
MobileAds.instance.initialize()
```

광고 SDK 초기화가 앱 시작과 동시에 일어나면, ATT 요청보다 앞선다고 볼 여지가 있다.

그래서 이 초기화를 제거했다.

대신 광고가 실제로 필요해지는 시점까지 미뤘다.

```text
앱 실행
-> ATT 요청
-> 사용자가 수동 동기화 누름
-> AdMob 초기화
-> InterstitialAd.load
```

이렇게 바꾸면 앱 시작 직후에는 광고 SDK를 건드리지 않는다.

그리고 광고 로딩이 실패해도 동기화는 계속 진행시켰다.

이건 심사 때문이기도 하지만, 기능적으로도 맞다.

광고가 안 떴다고 동기화를 막으면 안 된다.

## 테스트는 완벽하진 않지만 필요했다

이 문제는 UI 팝업이라서 테스트로 100% 보장하기는 어렵다.

그래도 최소한 같은 실수를 반복하지 않도록 문자열 기반 테스트를 걸었다.

확인한 건 대충 이런 것들이다.

```text
Info.plist가 SceneDelegate를 사용하고 있는지
SceneDelegate에서 requestTrackingAuthorizationIfNeeded를 호출하는지
AppDelegate가 AppTrackingTransparency를 import하는지
trackingAuthorizationStatus == .notDetermined 체크가 있는지
active 체크가 asyncAfter 안쪽에 있는지
앱 시작 시점에 MobileAds.initialize를 하지 않는지
```

테스트는 이렇게 돌렸다.

```bash
DART_TOOL_ANALYTICS=0 flutter test test/ios/privacy_manifest_test.dart
```

문자열 테스트라서 예쁘지는 않다.

근데 이 상황에서는 꽤 쓸모 있었다.

이런 코드는 리팩토링하다가 누가 `AppDelegate`로 다시 옮기거나, active 체크를 다시 앞으로 빼버리면 바로 심사 이슈로 돌아갈 수 있기 때문이다.

## 왜 이런 일이 발생?

정리하면 원인은 하나가 아니었다.

처음 착각은 이거였다.

```text
NSUserTrackingUsageDescription을 넣으면 ATT 팝업이 뜬다.
```

아니다.

그건 팝업 문구만 제공한다.

실제 요청은 코드에서 해야 한다.

두 번째 착각은 이거였다.

```text
앱 active 이벤트는 AppDelegate에서 잡으면 된다.
```

scene lifecycle을 쓰면 이것도 부족할 수 있다.

`SceneDelegate.sceneDidBecomeActive`에서 잡아줘야 했다.

세 번째 착각은 이거였다.

```text
sceneDidBecomeActive니까 바로 active 상태겠지.
```

이것도 아니었다.

아주 짧은 타이밍 차이 때문에 `UIApplication.shared.applicationState`가 아직 active로 안 보일 수 있었다.

그래서 실제 요청 직전에 다시 확인하는 식으로 바꿨다.

마지막으로, ATT는 광고 SDK 초기화 순서와 같이 봐야 했다.

팝업이 뜨더라도 광고 SDK가 먼저 초기화되면 심사자가 보기엔 순서가 이상할 수 있다.

결국 최종 구조는 이렇게 됐다.

```text
Info.plist에 NSUserTrackingUsageDescription 작성
SceneDelegate.sceneDidBecomeActive에서 요청 helper 호출
0.5초 뒤 active 상태 확인
notDetermined일 때만 requestTrackingAuthorization 호출
AdMob 초기화는 앱 시작이 아니라 광고 로딩 직전으로 이동
fresh install에서 팝업 확인
```

빌드는 잘 됐는데 심사에서 팝업이 안 보인다고 하는 문제라서 처음엔 좀 허무했다.

근데 까보면 그냥 "팝업 코드 한 줄 추가" 문제가 아니었다.

iOS lifecycle, ATT 상태, 광고 SDK 초기화 순서, 심사자가 보는 플로우가 전부 맞아야 했다.

이런 게 iOS 배포에서 제일 피곤한 부분인 것 같다.
