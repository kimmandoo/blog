---
title: cache 디렉토리 이해하기
date: 2026-06-21
category: AOSP
tags: [aosp, android]
---

# /cache/recovery는 뭐하는 곳인가

업무중 ota update 테스트를 하면서 `/cache/recovery`라는 경로를 접하게 됐다.

처음에는 이름 그대로 "리커버리에서 쓰는 캐시인가?" 정도로 생각했다. 그런데 로그랑 OTA 흐름을 따라가다 보니 단순한 임시 폴더가 아니었다. 안드로이드 OS와 recovery가 서로 할 일을 주고받을 때 쓰는 공간이었다.

일반 부팅 상태에서는 시스템 파티션을 마음대로 갈아엎을 수 없다. OTA 업데이트를 설치하거나 공장 초기화를 해야 할 때는 기기를 recovery mode로 다시 부팅한 다음, 거기서 작업한다. 이때 메인 OS는 recovery에게 "재부팅하면 이 일을 해줘"라고 미리 적어두고, recovery는 작업이 끝난 뒤 "해봤는데 이렇게 됐다"는 기록을 남긴다.

그 tmp 역할을 하는 곳이 `/cache/recovery`라고 보면 된다.

다만 요즘 기기에서는 이야기가 조금 달라진다. A/B 업데이트를 쓰는 기기에서는 예전처럼 별도의 cache partition이나 recovery partition이 없는 경우가 많다. 업데이트는 부팅된 OS에서 `update_engine`이 반대쪽 slot에 적용하고, recovery ramdisk도 `boot.img` 안에 들어간다. 그래서 아래 내용은 non-A/B 방식이나 legacy recovery 흐름을 볼 때 더 잘 맞는다.

## 전체 흐름

전체 흐름은 이런 식이다.

사용자가 업데이트를 누르거나 공장 초기화를 실행하면, 안드로이드 프레임워크가 recovery로 넘길 명령을 준비한다. 그 다음 bootloader가 다음 부팅에서 recovery로 들어갈 수 있게 표시를 남긴다. AOSP 코드를 따라가보면 bootloader는 `misc` 파티션의 앞부분을 확인하고, 거기에 `boot-recovery` 같은 값이 있으면 recovery image로 부팅한다.

여기서 헷갈렸던 부분이 있다. `/cache/recovery/command`는 recovery가 실행할 명령어 목록이고, `misc` 파티션의 BCB(Bootloader Control Block)는 다음 부팅을 recovery로 보내기 위한 신호다. 둘 다 recovery 흐름에 필요하지만 역할은 다르다.

부팅이 recovery로 넘어가면 recovery는 command 파일이나 BCB에 적힌 인자를 읽는다. 그리고 OTA 설치, data wipe, cache wipe 같은 작업을 한다. 작업이 끝나면 로그를 `/cache/recovery/log`나 `last_log` 쪽에 남기고, 다시 일반 안드로이드 OS로 재부팅한다.

정리하면 이렇다.

1. 사용자가 업데이트나 초기화를 실행한다.
2. 시스템이 recovery에게 넘길 명령을 준비한다.
3. bootloader가 다음 부팅에서 recovery로 들어가도록 표시한다.
4. recovery가 부팅되면서 명령을 읽고 작업한다.
5. 결과 로그를 남기고 다시 안드로이드로 돌아온다.

글로 쓰면 길어 보이는데, 결국 메인 OS가 시킨 일을 recovery가 대신 처리하고 로그를 남기는 구조다.

## command

`command`는 이름 그대로 recovery에게 넘기는 명령 파일이다.

예를 들어 공장 초기화를 실행하면 `--wipe_data` 같은 인자가 들어갈 수 있고, OTA 패키지를 설치해야 하면 `--update_package=/path/to/update.zip` 같은 값이 들어갈 수 있다. recovery는 부팅되자마자 이 파일을 읽고, 한 줄씩 인자로 해석해서 할 일을 정한다.

그래서 이 파일은 입력값이다. OS가 recovery에게 던지는 쪽지라고 생각하면 편하다.

작업이 끝나면 recovery는 보통 이 command 파일을 지운다. 안 그러면 다음 부팅 때 또 같은 작업을 반복할 수 있기 때문이다. 공장 초기화 같은 작업이 두 번 돈다고 생각하면 꽤 무섭다.

## log, last_log

`log`는 recovery가 작업하면서 남기는 로그다. OTA 설치가 실패했거나 wipe 도중 에러가 났다면 일단 이 파일부터 보게 된다.

기기나 안드로이드 버전에 따라 `recovery.log`처럼 보이는 경우도 있는데, 어쨌든 recovery가 실행되면서 찍은 로그다. "업데이트 패키지를 열었다", "서명 검증을 했다", "어느 단계에서 실패했다" 같은 내용이 여기에 남는다.

`last_log`는 이전 recovery 실행 로그다. recovery가 새로 실행되면 기존 로그를 밀어내고 새 로그를 쓰기 때문에, 직전 기록은 `last_log` 쪽으로 넘어간다.

이 구조 덕분에 방금 실패한 recovery 작업뿐 아니라, 한두 번 전의 실패 기록도 어느 정도 따라갈 수 있다.

## last_install

`last_install`에는 최근 OTA 설치 시도 기록이 남는다.

업데이트 패키지 경로, 설치 결과, 걸린 시간 같은 정보가 들어갈 수 있다. 메인 OS로 돌아온 뒤에 시스템이 "이번 업데이트가 성공했는지" 판단할 때 이런 기록을 본다.

OTA가 실패했을 때 `log`만 봐도 대부분 힌트가 나오지만, 설치 시도 자체의 요약을 보고 싶으면 `last_install`도 같이 보면 된다.

## intent

`intent`에는 recovery 작업이 끝난 뒤 메인 OS로 돌려줄 결과 메시지가 들어간다.

예전 안드로이드 흐름에서는 recovery가 `--send_intent` 같은 인자를 받아서 결과 문자열을 이 파일에 써둘 수 있었다. 그러면 OS가 다시 부팅된 뒤 이 값을 보고 후처리를 할 수 있다.

요즘 앱에서 말하는 Intent랑 이름은 비슷하지만, 여기서는 recovery와 OS 사이에 남겨두는 작은 결과 파일 정도로 이해했다.

## block.map

`block.map`은 이름 때문에 처음에 좀 헷갈렸다.

처음에는 "시스템 파티션의 어느 블록을 업데이트할지 적어둔 파일인가?" 싶었다. 그런데 recovery 관점에서는 OTA 패키지를 블록 단위로 읽기 위한 지도라고 보는 게 더 맞았다. 특히 암호화된 `/data`에 OTA zip이 있으면 recovery가 파일 시스템을 제대로 열지 못할 수 있다. 이때 `uncrypt` 같은 흐름을 통해 OTA 패키지가 디스크의 어느 블록에 있는지 map 파일을 만들어두고, recovery는 그 map을 보고 패키지를 읽는다.

그래서 command에 `--update_package=@/cache/recovery/block.map` 같은 식으로 들어가는 경우가 있다. `@`가 붙으면 일반 파일 경로가 아니라 block map을 통해 읽겠다는 의미다.

실제 파티션을 어떻게 패치할지는 OTA 패키지 안의 payload나 transfer list 쪽에서 다룬다. `block.map`은 recovery가 OTA 패키지를 찾아 읽기 위해 참고하는 파일이다.

## last_kmsg

`last_kmsg`도 같이 볼 일이 있다.

`last_log`가 recovery 프로그램 레벨의 로그라면, `last_kmsg`는 커널 로그다. recovery로 부팅하는 과정에서 파티션 마운트가 실패하거나, 커널 쪽에서 I/O 문제가 나거나, 더 아래 레벨의 문제가 있을 때 본다.

일반적인 OTA 실패는 `last_log`만 봐도 충분한 경우가 많다. 그런데 recovery가 제대로 뜨기도 전에 죽거나, 마운트 자체가 이상하다면 `last_kmsg`를 같이 열어보게 된다.

## last_locale

`last_locale`은 recovery UI 언어와 관련된 파일이다.

기기가 recovery로 들어갔을 때 어떤 locale로 화면을 보여줄지 기억해둔다. OTA나 wipe 자체와 직접 연결된 파일은 아니지만, `/cache/recovery` 안에서 같이 보이는 경우가 있어서 적어둔다.

## 숫자가 붙은 파일들

`last_log.1`, `last_log.2` 같은 파일도 보일 수 있다.

이건 특별한 의미가 있다기보다 로그 로테이션이다. recovery가 여러 번 실행될 때마다 기존 로그를 한 칸씩 뒤로 밀어두는 방식이다. 숫자가 클수록 더 오래된 로그다.

대략 이런 식으로 움직인다.

| 파일명 | 의미 |
| --- | --- |
| `log` | 현재 실행 중이거나 가장 최근 recovery 실행 로그 |
| `last_log` | 직전 recovery 실행 로그 |
| `last_log.1` | 그보다 한 번 더 이전 로그 |
| `last_log.2` | 더 오래된 로그 |
| `last_kmsg` | 직전 recovery 부팅 과정의 커널 로그 |
| `last_kmsg.1` | 더 오래된 커널 로그 |

최대 몇 개까지 남길지는 구현이나 제조사 설정에 따라 다를 수 있다. 보통은 무한정 쌓지 않고 오래된 것부터 지운다. cache 파티션은 말 그대로 임시 공간이라 여기에 로그를 끝없이 쌓아둘 이유가 없다.

## 지워도 되나?

루팅된 기기나 커스텀 리커버리에서 `/cache/recovery`를 보면 괜히 지워도 되는지 궁금해진다.

대부분의 경우 이 안의 로그 파일을 지운다고 바로 기기가 고장나지는 않는다. 다만 예약된 OTA 명령이나 직전 실패 로그가 날아갈 수 있다. 특히 업데이트가 걸려있는 상태에서 `command`나 `block.map`을 지우면 recovery가 해야 할 일을 잃어버릴 수 있다.

그러니까 문제 분석 중이면 지우지 않는 게 낫고, 단순히 오래된 로그가 남아있는 정도라면 큰 의미는 없다.

개발하면서 이 디렉토리를 보는 목적은 보통 하나다.

업데이트나 초기화가 왜 실패했는지 알고 싶어서다.

그럴 때는 먼저 `last_log`를 보고, 설치 자체의 결과가 궁금하면 `last_install`을 보고, 커널이나 마운트 문제가 의심되면 `last_kmsg`까지 보면 된다. `/cache/recovery`는 복잡한 기능을 하는 디렉토리라기보다는, recovery가 혼자 일하고 사라지지 않도록 흔적을 남겨두는 자리였다.

## 참고

- [AOSP recovery.cpp](https://android.googlesource.com/platform/bootable/recovery/+/c5eedd0954a55c2e1f000534c745fa4ecd1b12ab/recovery.cpp)
- [AOSP - Implement OTA updates](https://source.android.com/docs/core/architecture/bootloader/updating)
- [AOSP - Implement A/B updates](https://source.android.com/docs/core/ota/ab/ab_implement)
