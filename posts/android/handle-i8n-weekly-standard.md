---
title: Locale.getDefault이 일으킨 버그 해결하기
date: 2026-02-01
category: Andriod
tags: [trouble-shooting, android, i8n]
---

앱 기능에 주간 리더보드가 있는데... 1주가 계산되는 로직때문에 사소한 버그가 생겼다.

<img src="/images/260201/1.png" width="50%">

이번주는 아직 16시간이 남았는데 리더보드는 이미 다음 주로 넘어가 있다.

왜 그런지 살펴보자.

## Locale.getDefault() 의 함정

Locale.getDefault()는 사용자가 스마트폰 설정에서 지정한 '지역' 정보를 가져온다. 이때 주의 시작을 언제로 할지가 결정되는데 getDefault의 경우 지역에 따라 일요일을 한 주의 시작으로 설정하는 경우가 있어서 발생하는 문제다.

주 계산 로직은 아래와 같다.

```kotlin
private fun getWeeklyPeriodId(): String {
    val today = LocalDate.now()
    val weekFields = WeekFields.of(Locale.getDefault())
    val weekNumber = today.get(weekFields.weekOfWeekBasedYear())
    return "weekly_${today.year}-W${String.format("%02d", weekNumber)}"
}
```

나는 서버 데이터를 Firestore로 사용하는데, Firestore와 연동할 날짜에 getDefault를 달아주면 조회하는 곳과 데이터가 생성되는 지역이 달라서 문제가 발생한다.

그래서 지역을 따로 설정하기 보다, ISO 표준 규격을 따르도록 하면 무조건 월요일을 한 주의 시작으로 잡아준다.

| 기준 |주의 시작 | 2026-02-01 (일)의 위치 | 리더보드 ID |
|-| -| -| -|
|WeekFields.ISO|월요일|지난 주의 마지막 날|weekly_2026-W05|
|Locale.US / KR|일요일|새로운 주의 첫째 날|weekly_2026-W06|


```kotlin
private fun getWeeklyPeriodId(): String {
    val today = LocalDate.now()
    val weekFields = WeekFields.ISO
    val weekNumber = today.get(weekFields.weekOfWeekBasedYear())
    return "weekly_${today.year}-W${String.format("%02d", weekNumber)}"
}
```

`today.get(weekFields.weekOfWeekBasedYear())`에서 이미 주단위 연도계산으로 월요일을 시작으로 계산 중이었는데, weekField가 firestore 계산 방식과 어긋나서 발생한 문제다.

이게 ISO-8601 표준을 따르는데, 그해의 첫 번째 목요일을 포함하는 주를 1주 차로 정의하는 4-day rule이라고 한다.

<img src="/images/260201/2.png" width="50%">
