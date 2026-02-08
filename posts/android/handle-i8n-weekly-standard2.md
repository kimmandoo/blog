---
title: Locale.getDefault이 일으킨 버그 해결하기(2)
date: 2026-02-08
category: Andriod
tags: [trouble-shooting, android, i8n]
---

서비스를 시작하고, Google Ads로 돈을 써가며 유저를 모으고 있다.

그 와중에... 이상한 글자가 key 값으로 저장된 걸 확인했다.

<img src="/images/260208/image.png" width="50%">


?! 이게 뭘까..

`٠٦`은 동부 아랍 숫자(Eastern Arabic numerals)로, 우리가 흔히 쓰는 06과 같은 값이라고 한다... 생각지도 못한 문제가 발생하게 된 것이다.

이유는 아래와 같다.

```kotlin
    private fun getWeeklyPeriodId(): String {
        val today = LocalDate.now()
        val weekFields = WeekFields.ISO
        val weekNumber = today.get(weekFields.weekOfWeekBasedYear())
        return "weekly_${today.year}-W${String.format("%02d", weekNumber)}"
    }
```

이게 key 값을 생성하는 로직인데, weekNumber를 String format해주는 과정에서 locale이 default로 들어간 것이다.

String.format에 Locale을 명시적으로 넣어주지 않으면 시스템의 기본 설정인 `Locale.getDefault()`를 사용하는 데 이거때문에 발생한 i8n 트러블 슈팅이라고 할 수 있다.

해결법은 매우 간단하다. 현재 내 서비스가 US를 기준으로 하기 때문에 Locale.US만 달아주면 끝!

```kotlin
private fun getWeeklyPeriodId(): String {
    val today = LocalDate.now()
    val weekFields = WeekFields.ISO
    val weekNumber = today.get(weekFields.weekOfWeekBasedYear())
    
    return "weekly_${today.year}-W${String.format(Locale.US, "%02d", weekNumber)}"
}
```

다행히도 해당 환경에 속한 유저들이 유효한 데이터를 저장하진 않았어서 대처가 빠르게 가능했다.

Locale.US 말고 Locale.ROOT도 있다. 중립적인 정보를 사용한다고 하는데 시스템 내부 식별자 생성 목적이라면 특정 국가에 종속되지 않는 Locale.ROOT를 사용하는 것이 더 명확한 의도 표현이 될 수 있을 것 같다.

물론 나는 주 타겟층이 영미권/한국/일본이기에 이번엔 그냥 넘어간다.

## padStart

```kotlin
return "weekly_${today.year}-W${weekNumber.toString().padStart(2, '0')}"
```

개발자스럽게 해결하자면 아예 formating을 쓰지않는 방법이 있다. 일단 weekNumber 자체는 숫자로 내려오는데 그 숫자가 시스템언어에 맞게 변환되는 문제기때문에, kotlin 문법 중 padStart같은 걸 쓰면 해결 되는 문제이기도 하다.

Locale 때문에 진땀빼는 일이 앞으로 조금 더 있을 것 같은데... String.format 코드의 Lint가 경고를 날리면 무시하지 말자...