---
title: 외부 이미지를 앱 내부로 가져오기
date: 2025-12-23
category: Andriod
tags: [trouble-shooting, android, bitmap]
---

만들고 있는 메모장에, 본인이 원하는 이미지로 배경을 꾸밀 수 있는 기능을 넣고 있다.

처음에는 uri 받아서 그걸 datastore에 특정 형식으로 저장해 꺼내쓰는 걸 생각해서 구현했으나, 아래 에러에 직면했다.

```bash
java.lang.RuntimeException: Failure delivering result ResultInfo{who=null, request=2001097182, result=-1, data=Intent { dat=content://com.android.providers.media.documents/document/image:26 flg=0x1 }} to activity {com.kkok.app/com.kkok.presenter.MainActivity}: java.lang.SecurityException: No persistable permission grants found for UID 10341 and Uri content://com.android.providers.media.documents/document/image:26 
    at android.app.ActivityThread.deliverResults(ActivityThread.java:5946)
    at android.app.ActivityThread.handleSendResult(ActivityThread.java:5985)
```

`java.lang.SecurityException: No persistable permission grants found` 이게 문제였다.

```kotlin
val launcher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.GetContent()
) { uri: Uri? ->
    uri?.let {
        context.contentResolver.takePersistableUriPermission(
            it,
            Intent.FLAG_GRANT_READ_URI_PERMISSION
        )
        imageUri = it
    }
}
```

시스템은 GetContent한테 persistable한 권한을 줄 수 없는데, contract가 잘못된 상황이다.

안드로이드에서 다른 앱으로 부터 데이터를 받을때 contentResolver를 한번 거쳐 URI를 통해 데이터를 받게 된다. 이 때 시스템은 2종류의 권한을 발행한다. 하나는 임시, 하나는 지속 권한이다.

임시 권한은 앱이 종료되거나 컴포넌트가 닫혀서 해당 프로세스가 사라지면 권한도 사라진다. 지속 권한(persistable)은 임시 권한과 다르게 권한이 계속 유지되는 걸 의미한다.

코드 상으로는 지속 권한을 요청하면서, contract는 임시권한이라 충돌이 발생했다.

그래서 이걸 아래처럼 바꿔주면 일단 해결된다.

```kotlin
val launcher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.OpenDocument(),
) { uri: Uri? ->
    uri?.let { selectedUri ->
        scope.launch {
            val savedUri = saveImageToInternalStorage(context, selectedUri)
            if (savedUri != null) {
                viewModel.processIntent(BackgroundImageIntent.OnSetWallpaperUri(savedUri.toString()))
            }
        }
    }
}
```

`saveImageToInternalStorage`는 내가 따로 만든 함수다. 

이전 코드와의 차이는 GetContent가 OpenDocument로 바뀐 것이다.

사용자가 사진을 선택하면, 시스템이 선택된 파일에 대해 앱 uid에 대한 권한을 부여한다. GetContent는 이때 Intent 액션에 `FLAG_GRANT_READ_URI_PERMISSION`만 붙여서 보내고, OpenDocument는 시스템이 `FLAG_GRANT_PERSISTABLE_URI_PERMISSION`를 자동으로 붙여서 보낸다.

그 후 `takePersistableUriPermission`을 호출하면, 시스템 서비스는 이 URI가 '영구 전환 후보'인지 확인한다. 후보가 아니면? 위에 처럼 exception을 던진다.

[AOSP코드](https://cs.android.com/android/platform/superproject/+/master:frameworks/base/services/core/java/com/android/server/uri/UriGrantsManagerService.java) 를 보면 조금 더 이해가 간다.

```java
@Override
public void takePersistableUriPermission(Uri uri, final int modeFlags, @Nullable String toPackage, int userId) {
    final int uid;
    if (toPackage != null) {
        mAmInternal.enforceCallingPermission(FORCE_PERSISTABLE_URI_PERMISSIONS, "takePersistableUriPermission");
        uid = mPmInternal.getPackageUid(toPackage, 0 /* flags */, userId);
    } else {
        enforceNotIsolatedCaller("takePersistableUriPermission");
        uid = Binder.getCallingUid();
    }

    Preconditions.checkFlagsArgument(modeFlags, Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);

    synchronized (mLock) {
        boolean persistChanged = false;

        UriPermission exactPerm = findUriPermissionLocked(uid, new GrantUri(userId, uri, 0));
        UriPermission prefixPerm = findUriPermissionLocked(uid, new GrantUri(userId, uri, FLAG_GRANT_PREFIX_URI_PERMISSION));

        final boolean exactValid = (exactPerm != null) && ((modeFlags & exactPerm.persistableModeFlags) == modeFlags);
        final boolean prefixValid = (prefixPerm != null) && ((modeFlags & prefixPerm.persistableModeFlags) == modeFlags);

        if (!(exactValid || prefixValid)) {
            throw new SecurityException("No persistable permission grants found for UID "+ uid + " and Uri " + uri.toSafeString());
        }

        if (exactValid) { persistChanged |= exactPerm.takePersistableModes(modeFlags); }
        if (prefixValid) { persistChanged |= prefixPerm.takePersistableModes(modeFlags); }

        persistChanged |= maybePrunePersistedUriGrantsLocked(uid);

        if (persistChanged) {
            schedulePersistUriGrants();
        }
    }
}
```

synchronized 부분부터 보면 된다. persistableModeFlags에 의해서 exception을 throw할 지 말지 결정되는데 이게 OpenDocument를 사용했을 때 아래 코드를 통해 이 flag가 설정된다.

```java
boolean grantModes(int modeFlags, @Nullable UriPermissionOwner owner) {
    final boolean persistable = (modeFlags & Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION) != 0;
    ...
```

GetContent에서 OpenDocument로 바꾸면 laucher에게 넘겨줘야하는 input도 바뀐다.

```kotlin
BackgroundImageScreen(
    onBackClick = onBackClick,
    onLauncherOpen = { launcher.launch(arrayOf("image/*")) },
``

`ACTION_OPEN_DOCUMENT`는 기본적으로 사용자가 여러 종류의 파일 타입을 동시에 선택할 수 있도록 `EXTRA_MIME_TYPES`라는 키를 사용하는 방식으로 설계되었기 때문에, 미리 MIME Type을 지정해서 호출해줘야한다.

## 복사본 쓰면 되는데 굳이 OpenDocument?

길게 얘기했지만, 사실 내 경우엔 원본에 계속 액세스할 필요가 없어서 이미지를 설정할 때 딱 한번 권한이 필요하다는 점을 기억해야된다.

그래서 그냥 아래처럼 GetConent를 써도 된다.

```kotlin
val launcher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.GetContent(),
) { uri: Uri? ->
    uri?.let { selectedUri ->
        scope.launch {
            val savedUri = saveImageToInternalStorage(context, selectedUri)
            if (savedUri != null) {
                viewModel.processIntent(BackgroundImageIntent.OnSetWallpaperUri(savedUri.toString()))
            }
        }
    }
}

// FileUtils.kt
suspend fun saveImageToInternalStorage(
    context: Context,
    uri: Uri,
): Uri? =
    withContext(Dispatchers.IO) {
        try {
            val directory = File(context.filesDir, "wallpapers")
            if (!directory.exists()) directory.mkdirs()

            val fileName = "wallpaper_${System.currentTimeMillis()}.jpg"
            val destFile = File(directory, fileName)

            context.contentResolver.openInputStream(uri)?.use { inputStream ->
                FileOutputStream(destFile).use { outputStream ->
                    inputStream.copyTo(outputStream)
                }
            }

            Uri.fromFile(destFile)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
```

## 심사 대비 - 사진 선택 도구(PhotoPicker)

Android 11 이전까지만 해도 위와 같은 방식을 사용해서 이미지를 가져왔다.

근데 구글에서 API 30, 즉 Android 11 부터 [photopicker](https://developer.android.com/training/data-storage/shared/photo-picker?hl=ko)를 도입하더니, 지금은 사진첩에 접근할 경우 Android 14 (API 34)를 타겟팅하는 앱의 경우 전체 사진 라이브러리 접근(READ_MEDIA_IMAGES)보다 PhotoPicker 사용을 강력히 권장중인 것으로 알고 있다.

출시까지는 조금 먼 얘기인 것 같지만.. 일단 준비하자.

```kotlin
val launcher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickVisualMedia(),
) { uri: Uri? ->
    uri?.let { selectedUri ->
        scope.launch {
            val savedUri = saveImageToInternalStorage(context, selectedUri)
            if (savedUri != null) {
                viewModel.processIntent(BackgroundImageIntent.OnSetWallpaperUri(savedUri.toString()))
            }
        }
    }
}

BackgroundImageScreen(
    onBackClick = onBackClick,
    onLauncherOpen = { launcher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) },
    ...
```

GetContent 버전에서 contract만 `PickVisualMedia`로 바꿔주면 된다. 이러면 심사로 부터 안전한 이미지 접근 코드가 된 것이다.

## Contract?

Activity Result API에서 말하는 Contract는 이름 그대로 "내가 이런 데이터를 줄 테니, 나중에 결과로 저런 데이터를 돌려줘"라고 시스템과 맺는 정규화된 약속을 의미한다.

startActivityForResult에서 조금 진화된 방식으로, requestCode랑 Intent관리가 수월해졌다.

```kotlin
override fun createIntent(context: Context, input: Intent): Intent = input
override fun parseResult(resultCode: Int, intent: Intent?): ActivityResult =
    ActivityResult(resultCode, intent)
```

createIntent는 launcher.launch 때 실행되고, parseResult는 rememberLauncherForActivityResult의 onResult 람다에 사용된다.

## 이미지 복사본 떠올 때 최적화하기

지금 saveImageToInternalStorage를 보면, 파일스트림 열어서 원본을 그대로 복사하고 있다. 이렇게 하면 고화질 사진의 경우에도 원본을 복사하게 되면서 앱 용량이 불필요하게 커지고, 심하면 OOM이 발생할 가능성도 있기 때문에 이 부분을 개선해줘야된다.

사실 coil에서 이 작업을 대신 해주기 때문에, 보여주는 용도만 쓴다면 이게 필요없는데, 나의 경우에는 복사본을 앱 내에 저장해서 가져다 쓰기 때문에 리사이징으로 최적화를 하는 것이다.

https://developer.android.com/topic/performance/graphics/load-bitmap?hl=ko

공식문서를 착실하게 따라가 보자.

```kotlin
fun calculateInSampleSize(options: BitmapFactory.Options, reqWidth: Int, reqHeight: Int): Int {
    val (height: Int, width: Int) = options.run { outHeight to outWidth }
    var inSampleSize = 1

    if (height > reqHeight || width > reqWidth) {
        val halfHeight: Int = height / 2
        val halfWidth: Int = width / 2

        while (halfHeight / inSampleSize >= reqHeight && halfWidth / inSampleSize >= reqWidth) {
            inSampleSize *= 2
        }
    }

    return inSampleSize
}
```

공식 문서에 적혀있는 샘플링 코드다. 만약 해상도가 2048x1536이고 inSampleSize가 4로 디코딩된 이미지는 약 512x384의 비트맵을 생성하고 이걸 메모리에 올리면 1/4이 아닌 1/$2^4$ 으로 올라가게 된다.

안드로이드에서 기본 비트맵 설정이 ARGB_8888인데, 각 속성은 8bits씩을 차지한다. 그래서 픽셀 하나를 표시하는 데 4byte를 사용되어 메모리는 $w*h*4byte$ 로 계산된다.

options를 잘 설정하는 게 중요한데, inJustDecodeBounds 옵션을 키면 메모리에 올리지 않고 리소스의 크기만 읽어올 수 있다. 이걸 사용해서 메모리 사용량을 줄이는 것이다.

```kotlin
suspend fun saveImageToInternalStorage(
    context: Context,
    uri: Uri,
    maxDimension: Int = 2560 // QHD
): Uri? = withContext(Dispatchers.IO) {
    try {
        val contentResolver = context.contentResolver

        val options = BitmapFactory.Options().apply {
            inJustDecodeBounds = true
        }

        contentResolver.openInputStream(uri)?.use { inputStream ->
            BitmapFactory.decodeStream(inputStream, null, options)
        }

        options.inSampleSize = calculateInSampleSize(options, maxDimension)
        options.inJustDecodeBounds = false

        val resizedBitmap = contentResolver.openInputStream(uri)?.use { inputStream ->
            BitmapFactory.decodeStream(inputStream, null, options)
        }

        resizedBitmap?.let { bitmap ->
            val directory = File(context.filesDir, "wallpapers")
            if (!directory.exists()) directory.mkdirs()

            val fileName = "wallpaper.jpg"
            val destFile = File(directory, fileName)

            FileOutputStream(destFile).use { outputStream ->
                bitmap.compress(Bitmap.CompressFormat.JPEG, 90, outputStream)
            }

            bitmap.recycle()
            Uri.fromFile(destFile)
        }
    } catch (e: Exception) {
        e.printStackTrace()
        null
    }
}
```

contentResolver가 넘겨주는 게 스트림(외부 데이터는 stream, 앱 내부 리소스는 resource)이라 decodeResource 대신 decodeStream을 사용한다.

스트림은 한 번 읽으면 끝나기 때문에, use로 알아서 닫히도록 해줬고 크기를 잴 때와, 파일을 실제로 리사이징할 때 총 2번 스트림을 열어준다.

지금 코드는 긴 변 기준으로 QHD 크기에 맞게 리사이징 하는 코드다.

BitmapFactory.decodeStream은 이미지의 회전 정보(Exif)를 무시하고 원본 픽셀 데이터만 읽어오기 때문에 회전이 제대로 안먹은 이미지가 들어올 수도 있다. coil이 보여줄 때 그건 알아서 할 것 같긴 한데, 문제가 생기면 그 때 고쳐보도록 하겠다.