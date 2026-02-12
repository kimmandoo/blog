---
title: In-App Update 알아보기
date: 2026-02-12
category: Andriod
tags: [trouble-shooting, android, in-app]
---

```shell
Failed to resume update check (Ask Gemini)
com.google.android.play.core.install.InstallException: -10: Install Error(-10): The app is not owned by any user on this device. An app is "owned" if it has been acquired from Play. (https://developer.android.com/reference/com/google/android/play/core/install/model/InstallErrorCode#ERROR_APP_NOT_OWNED)
	at com.google.android.play.core.appupdate.zzq.zzc(com.google.android.play:app-update@@2.1.0:3)
	at com.google.android.play.core.appupdate.internal.zzg.zza(com.google.android.play:app-update@@2.1.0:6)
	at com.google.android.play.core.appupdate.internal.zzb.onTransact(com.google.android.play:app-update@@2.1.0:3)
	at android.os.Binder.execTransactInternal(Binder.java:1426)
	at android.os.Binder.execTransact(Binder.java:1365)
```

인앱업데이트 구현하던 중 에러가 발생했다.

`ERROR_APP_NOT_OWNED (-10)` 에러는 다음과 같은 상황에서 발생한다.

1. **앱이 Google Play Store에서 설치되지 않은 경우** - APK를 직접 설치(사이드로딩)했을 때
2. **다른 Google 계정으로 설치된 경우** - 현재 기기의 활성 계정과 앱을 다운로드한 계정이 다를 때
3. **개발 중인 빌드를 사용하는 경우** - Debug 빌드나 로컬에서 설치한 경우

그러니까 Google Play의 In-App Update API를 사용하려면 playstore에서 설치된 앱이고, 업데이트 정보를 playstore한테서 받아와야되는데 사이드로딩은 그게 안되니까 발생하는 에러 메시지이다.

In-App Update를 제대로 테스트하려면 내부 테스트 트랙에 앱을 올려 테스트해야되는데, 내 경우에는 아직 DAU 10 정도의 작은 서비스라서 상남자 권법을 쓰기로 했다.

원래라면 아래 작업을 거쳐야한다.
- Google Play Console에서 현재 설치된 버전보다 높은 versionCode를 가진 버전을 Internal Testing 트랙에 앱 업로드
- 테스터로 등록된 계정으로 Play Store에서 설치

난 이거 대신, FakeAppUpdateManager를 쓸 것이다.

## FakeAppUpdateManager

https://developer.android.com/reference/com/google/android/play/core/appupdate/testing/FakeAppUpdateManager

> A fake implementation of the AppUpdateManager

말 그대로 로직 테스트를 위한 가짜 객체다.

로직만 테스트하는 것이기 때문에 이거로 update를 호출한다해도 따로 UI가 생성되진 않는다. 한마디로 단위테스트 용.

appUpdate를 진행하기 위해서는 함수 간 순서를 지켜야한다.

![image-1](/images/260212/1.png)

정상적인 flow면 user의 행동까지 호출할 수 없지만 fake manager이기 때문에 단위 테스트를 위한 user flow용 메서드까지 제공하는 것이다.

In-App 업데이트는 immediate 업데이트, flexible 업데이트로 나눠 볼 수 있다.

```kotlin
@Test
fun testImmediateUpdate() {
    val fakeManager = FakeAppUpdateManager(context)
    fakeManager.setUpdateAvailable(2)
    
    // 업데이트 플로우 시작
    fakeManager.startUpdateFlowForResult(...)
    
    // 사용자가 업데이트 수락
    fakeManager.userAcceptsUpdate()
    
    // 다운로드 시작 및 완료
    fakeManager.downloadStarts()
    fakeManager.downloadCompletes()
    
    // 설치 완료
    fakeManager.installCompletes()
}

@Test
fun testFlexibleUpdate() {
    val fakeManager = FakeAppUpdateManager(context)
    fakeManager.setUpdateAvailable(2)
    
    fakeManager.startUpdateFlowForResult(...)
    fakeManager.userAcceptsUpdate()
    

    fakeManager.downloadStarts()
    fakeManager.downloadCompletes()
    
    // 업데이트 완료 트리거
    fakeManager.completeUpdate()
    fakeManager.installCompletes()
}
```

flexible의 경우 completeUpdate가 하나 더 있는데,  업데이트 트리거가 되는 중요한 요소다.

immediate는 다운로드가 완료되면 즉시 자동설치가 이루어지고 앱이 새로 시작되는 반면 flexible은 업데이트 패키지를 다운로드 해두고, alert dialog와 같은 걸 띄워 사용자가 재시작을 결정하면 새 패키지를 설치한다.

이제 내가 구현한 코드를 보면서 더 나아가 보자.

## In-App Update 구현하기

```kotlin
fun checkForUpdates(activity: Activity) {  
    val appUpdateManager = if (BuildConfig.FIRESTORE_COLLECTION_PREFIX.isNotEmpty()) {  
        FakeAppUpdateManager(activity).apply {  
            setUpdateAvailable(BuildConfig.VERSION_CODE + 1)  
        }  
    } else {  
        AppUpdateManagerFactory.create(activity)  
    }  
  
    val appUpdateInfoTask = appUpdateManager.appUpdateInfo  
  
    appUpdateInfoTask  
        .addOnSuccessListener { appUpdateInfo ->  
            if (appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE) {  
                Log.d(TAG, "checkForUpdates: ${appUpdateInfo.availableVersionCode()}")  
                if (appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)) {  
                    appUpdateManager.startUpdateFlow(  
                        appUpdateInfo,  
                        activity,  
                        AppUpdateOptions.defaultOptions(AppUpdateType.IMMEDIATE),  
                    ).addOnSuccessListener { resultCode ->  
                        Log.d(TAG, "checkForUpdates: $resultCode")  
                    }.addOnFailureListener { error ->  
                        Log.e(TAG, "Failed to startUpdateFlow", error)  
                    }  
                }  
            }  
        }  
        .addOnFailureListener { error ->  
            Log.e(TAG, "Failed to check for updates", error)  
        }  
}  
  
fun resumeUpdateIfNeeded(activity: Activity) {  
    val appUpdateManager = if (BuildConfig.FIRESTORE_COLLECTION_PREFIX.isNotEmpty()) {  
        FakeAppUpdateManager(activity).apply {  
            setUpdateAvailable(BuildConfig.VERSION_CODE + 1)  
        }  
    } else {  
        AppUpdateManagerFactory.create(activity)  
    }  
  
    appUpdateManager.appUpdateInfo  
        .addOnSuccessListener { appUpdateInfo ->  
            Log.d(TAG, "resumeUpdateIfNeeded: ${appUpdateInfo.availableVersionCode()}")  
            if (appUpdateInfo.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {  
                appUpdateManager.startUpdateFlow(  
                    appUpdateInfo,  
                    activity,  
                    AppUpdateOptions.defaultOptions(AppUpdateType.IMMEDIATE),  
                ).addOnSuccessListener { resultCode ->  
                    Log.d(TAG, "resumeUpdateIfNeeded: $resultCode")  
                }.addOnFailureListener { error ->  
                    Log.e(TAG, "Failed to startUpdateFlow", error)  
                }  
            }  
        }  
        .addOnFailureListener { error ->  
            Log.e(TAG, "Failed to resume update check", error)  
        }  
}
```

Fake객체도 잘 설정해서 더이상 에러메시지는 보이지않지만 의문이 하나 남는다. 공식문서에서는 startUpdateFlowForResult를 사용하는데, 왜 쓸까?

## startUpdateFlow vs startUpdateFlowForResult

가장 큰 차이는, `onActivityResult()` 콜백의 사용 여부다.

```kotlin
public abstract Task<Integer> startUpdateFlow(
    AppUpdateInfo appUpdateInfo,  // 업데이트 정보
    Activity activity,             // 실행할 액티비티
    AppUpdateOptions options       // 업데이트 옵션
)
```

startUpdateFlow는 비동기로 업데이트 플로우를 시작한다. flow가 실행되어도, 업데이트 정보를 확인해 업데이트 flow가 실행되는 건 메인스레드를 블로킹하지않는다.

Task를 사용하기때문에 `addOnCompleteListener` 같은 걸 써서 상태를 확인할 수 있다.

```kotlin
appUpdateManager.startUpdateFlow(  
    appUpdateInfo,  
    activity,  
    AppUpdateOptions.defaultOptions(AppUpdateType.IMMEDIATE),  
).addOnCompleteListener { it ->  
    when(it.result){  
        Activity.RESULT_OK -> {}  
    }  
}
```

FakeAppUpdateManager로 테스트하면 code가 -1이 찍히는데, 이게 `RESULT.OK`라는 의미다.

- Activity.RESULT_OK = -1 
- Activity.RESULT_CANCELED = 0 
- ActivityResult.RESULT_IN_APP_UPDATE_FAILED = 1

```kotlin
lifecycleScope.launch {
    try {
        appUpdateManager.startUpdateFlow(appUpdateInfo, activity, options).await()
    } catch (e: Exception) {
        // 에러 처리
    }
}
```

startUpdateFlow가 `.await()`를 지원하기 때문에 코루틴과 통합도 자유롭다는 장점도 있다.

startUpdateFlowForResult는 이 흐름에 onActivityResult를 추가한 것이다.

```kotlin
fun checkUpdate() {
    appUpdateManager.appUpdateInfo.addOnSuccessListener { appUpdateInfo ->
        val started = appUpdateManager.startUpdateFlowForResult(
            appUpdateInfo,
            this,
            AppUpdateOptions.defaultOptions(AppUpdateType.IMMEDIATE),
            REQUEST_CODE
        )
    }
}

override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    super.onActivityResult(requestCode, resultCode, data)
    if (requestCode == REQUEST_CODE) {
        handleResult(resultCode)
    }
}
```

onActivityResult는 deprecated된 방식이므로, 조금 더 모던하게 표현하면 아래와 같다.

```kotlin
private val updateLauncher = registerForActivityResult(
   ActivityResultContracts.StartIntentSenderForResult()
) { result ->

}

appUpdateManager.startUpdateFlowForResult(
   appUpdateInfo,
   updateLauncher,
   AppUpdateOptions.defaultOptions(AppUpdateType.IMMEDIATE)
)
```

### Flexible Update

flexible update를 적용하려면 InstallStateUpdatedListener를 사용해야된다.

```kotlin
private val installStateUpdatedListener = InstallStateUpdatedListener { state ->  
    when (state.installStatus()) {  
        InstallStatus.DOWNLOADING -> {  
            val progress = (100.0 * state.bytesDownloaded() / state.totalBytesToDownload()).toInt()  
            Log.d(TAG, "다운로드 진행: $progress%")  
        }  
  
        InstallStatus.DOWNLOADED -> {  
            Log.d(TAG, "다운로드 완료 - 재시작 필요")  
            // handle  
        }  
  
        InstallStatus.FAILED -> {  
            Log.e(TAG, "설치 실패: ${state.installErrorCode()}")  
        }  
  
        else -> {  
  
        }  
    }  
}
```

state 값으로 progress를 보여주는 데 사용할 수도 있고,  다운로드가 다되면 실행할 다음 행동도 정의할 수 있다.

만든 listener는 `appUpdateManager.registerListener(installStateUpdatedListener)`로 등록하고 앱 수명주기에 맞춰서 unregister해주면 된다.

리스너만 등록하면 안되고, 당연히 startUpdateFlow로 트리거 해줘야 listener가 동작한다.

```kotlin
private fun startFlexibleUpdate(appUpdateInfo: AppUpdateInfo) {
        appUpdateManager.startUpdateFlow(
            appUpdateInfo,
            this,
            AppUpdateOptions.defaultOptions(AppUpdateType.FLEXIBLE)
        ).addOnSuccessListener { resultCode ->
            when (resultCode) {
                Activity.RESULT_OK -> {
                    Log.d(TAG, "백그라운드 다운로드 시작")
                }
                Activity.RESULT_CANCELED -> {
                    Log.d(TAG, "업데이트 거부")
                }
                ActivityResult.RESULT_IN_APP_UPDATE_FAILED -> {
                    Log.e(TAG, "업데이트 실패")
                }
            }
        }.addOnFailureListener { error ->
            Log.e(TAG, "Failed to start flexible update", error)
        }
    }
```

리스너를 통해서 다운로드가 다 되면, 사용자 액션을 받는 곳에 `appUpdateManager.completeUpdate()`를 두면 구현이 끝난다.

참조:
- https://medium.com/wantedly-engineering/testing-android-in-app-updates-with-fakeappupdatemanager-63d0e834c36
- https://developer.android.com/guide/playcore/in-app-updates/kotlin-java?hl=ko