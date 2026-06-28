---
title: journal log 사용하기
date: 2026-06-28
category: LINUX
tags: [linux]
---

# journal log를 보게 된 이유

장비 부팅 로그를 뽑을 일이 있어서 리눅스 장비에 들어갔다. 처음엔 `/var/log` 밑에서 적당한 파일을 하나 찾으면 될 줄 알았다. 안드로이드에서 문제가 생기면 `logcat`부터 보는 것처럼, 리눅스도 어딘가에 로그 파일이 떨어져 있을 거라고 생각했다.

막상 보니 내가 찾던 로그가 파일 하나로 깔끔하게 모여 있진 않았다. 그래서 급하게 쓴 명령이 이거다.

```bash
journalctl --all > boot2.log
```

파일 이름을 `boot2.log`로 해놔서 나중에 나도 살짝 헷갈렸다. 여기서 `2`는 아무 뜻도 없다. 그냥 그때 대충 붙인 이름이고, 위 명령 안에는 두 번째 부팅 로그를 고르는 옵션이 들어 있지 않다.

`--all`은 journal 안의 내용을 되도록 생략하지 않고 보여달라는 옵션이다. 그러니 위 명령은 특정 부팅을 고르지 않고, 그때 볼 수 있던 journal 로그를 `boot2.log`라는 파일로 저장한 셈이다. 이걸 먼저 구분해두면 뒤에서 `-b`, `-b -1` 같은 옵션을 볼 때 덜 헷갈린다.

`journalctl`을 조금 써보니, 이건 `/var/log/something.log` 같은 파일을 직접 여는 감각과 다르다. `journald`가 모아둔 로그를 boot, unit, priority 같은 조건으로 좁혀 보게 해주는 쪽에 가깝다.

## journald가 모으는 것들

처음엔 journal log라고 해서 systemd service 로그만 모이는 줄 알았다. 열어보면 범위가 꽤 넓다.

| 로그 출처 | 예시 |
| --- | --- |
| 커널 로그 | 드라이버, 파일시스템, 네트워크, panic 관련 로그 |
| syslog | `syslog()`로 찍은 전통적인 로그 |
| systemd service stdout/stderr | service가 `printf`, `echo`, stderr로 찍은 로그 |
| native journal API | systemd journal 전용 API로 넣은 구조화 로그 |
| audit 로그 | 커널 audit subsystem에서 온 보안/감사 로그 |

systemd service에서 그냥 stdout이나 stderr로 찍은 로그도 `journalctl -u 서비스명`으로 따라갈 수 있다. 따로 로그 파일 경로를 몰라도 service 이름만 알면 어느 정도 들어갈 수 있어서 편했다.

```bash
journalctl -u systemd-networkd.service
```

이렇게 보면 특정 unit 로그만 따로 볼 수 있다.

## 부팅 기준으로 보기

그때는 현재 부팅에서 무슨 일이 있었는지를 보고 싶었다. 그런데 처음에 쓴 명령은 전체 로그를 한 번에 다 받아오는 쪽에 가까웠다.

```bash
journalctl --all > boot2.log
```

급할 때는 이렇게라도 뽑아두면 도움이 되지만, 부팅 문제를 계속 볼 때는 범위가 너무 넓다. 부팅 단위로 자르려면 `-b`를 붙인다.

```bash
journalctl -b --no-pager > boot_current.log
```

직전 부팅 로그는 이렇게 본다.

```bash
journalctl -b -1 --no-pager > boot_prev.log
```

부팅 목록은 먼저 확인해두는 편이 좋다.

```bash
journalctl --list-boots
```

`-b`는 journal entry에 들어 있는 `_BOOT_ID`를 기준으로 로그를 걸러준다. 파일 이름에 붙인 숫자와는 관계가 없다. 그래서 `boot2.log` 같은 파일명보다 `journalctl --list-boots`에 나오는 boot id와 offset을 보는 습관이 더 중요했다.

## 시간을 같이 보기

부팅 문제를 볼 때는 시간 정보가 꽤 중요하다. 어느 service가 몇 초쯤에 죽었는지, 네트워크가 언제 올라왔는지, 커널 에러가 먼저인지 service fail이 먼저인지 봐야 할 때가 많다.

그럴 땐 출력 포맷을 바꿔서 저장했다.

```bash
journalctl -b -o short-iso-precise --no-pager > boot.log
```

기본 출력도 읽을 수 있지만, 파일로 받아서 나중에 비교할 때는 `short-iso-precise`가 편했다. 시간대가 선명하게 보이니까 "여기서 먼저 터졌네"를 찾기 쉽다.

## 에러부터 보기

전체 로그를 처음부터 끝까지 읽고 있으면 금방 지친다. 장비 부팅 로그는 양이 많고, info 로그까지 다 섞이면 눈이 빨리 피곤해진다. 그래서 보통 warning 이상부터 먼저 본다.

```bash
journalctl -b -p warning --no-pager
```

에러만 보고 싶으면 이렇게 줄인다.

```bash
journalctl -b -p err --no-pager
```

여기서 헷갈리기 쉬운 점이 하나 있다. `-p err`는 err만 보여주는 옵션처럼 보이지만, 실제로는 err보다 심각한 `crit`, `alert`, `emerg`도 같이 나온다. 숫자로 보면 priority가 낮을수록 더 심각하다.

| 숫자 | 이름 | 의미 |
| --- | --- | --- |
| 0 | emerg | 시스템 사용 불가능 수준 |
| 1 | alert | 즉시 조치 필요 |
| 2 | crit | 치명적 문제 |
| 3 | err | 에러 |
| 4 | warning | 경고 |
| 5 | notice | 정상 범위지만 주목 필요 |
| 6 | info | 일반 정보 |
| 7 | debug | 디버그 |

나는 대체로 `warning`부터 본다. 너무 많으면 `err`로 줄이고, 힌트가 부족하면 다시 `warning`이나 전체 로그로 넓힌다.

## 커널 로그 따로 보기

service fail만 보고 있으면 원인을 놓칠 때가 있다. 어떤 service가 실패했다고 떠도, 그 전에 디바이스 초기화가 실패했거나 파일시스템 마운트가 늦었거나 네트워크 인터페이스가 준비되지 않았을 수 있다.

그래서 커널 로그는 따로 뽑아둔다.

```bash
journalctl -k -b --no-pager > kernel_boot.log
```

직전 부팅을 봐야 하면 이렇게 바꾼다.

```bash
journalctl -k -b -1 --no-pager > kernel_prev.log
```

실제로 장비 로그를 볼 때도 처음엔 systemd service 쪽만 계속 따라갔다. 그런데 같은 시간대의 커널 로그를 열어보니 service 자체보다, 그 전에 필요한 디바이스 준비가 늦어진 흐름이 드러났다. 그 뒤로는 boot log와 kernel log를 같이 뽑는 편이다.

## 문자열로 찾기

로그를 파일로 뽑은 뒤 `grep`으로 찾아도 된다.

```bash
journalctl -b | grep -i error
```

`journalctl` 자체에도 검색 옵션이 있다.

```bash
journalctl -b -g "failed|error|timeout" --no-pager
```

`-g`는 `MESSAGE=` 필드에 정규식을 걸어 검색한다. 부팅 문제를 볼 때는 이런 키워드를 자주 넣었다.

```bash
journalctl -b -g "fail|failed|error|timeout|denied|segfault|panic|oom|killed|watchdog" --no-pager

journalctl -b -g "firmware|driver|hdmi|cec|network|eth|wlan|mount|fsck|reboot|crash|core" --no-pager
```

처음부터 키워드만 믿고 들어가면 놓치는 로그도 생긴다. 그래도 로그가 너무 많을 때 어디부터 볼지 잡는 용도로는 괜찮았다.

## service 실패를 볼 때

systemd service가 실패한 상황이면 먼저 실패한 unit을 확인한다.

```bash
systemctl --failed
```

그 다음 해당 unit 로그를 본다.

```bash
journalctl -u 서비스명 -b --no-pager
```

예를 들면 이렇게 볼 수 있다.

```bash
journalctl -u systemd-networkd.service -b --no-pager
```

이렇게 들어가면 전체 로그에서 헤매는 시간이 줄어든다. 다만 실패한 service 로그만 보고 끝내면 원인을 놓칠 때가 있다. 의존하던 다른 service나 커널 로그 쪽에 힌트가 남는 경우도 많다.

그래서 보통은 이 순서로 본다.

1. `systemctl --failed`로 실패한 service 확인
2. `journalctl -u 서비스명 -b`로 해당 service 로그 확인
3. 같은 시간대의 전체 boot log 확인
4. 필요하면 kernel log 확인

로그가 많을수록 한 파일 안에서만 계속 보게 된다. 이 순서를 정해두면 시야가 조금 덜 좁아진다.

## journal이 저장되는 위치

journal 데이터는 보통 두 군데 중 하나에 저장된다.

```bash
/run/log/journal/
```

여기는 휘발성이라 reboot하면 사라진다.

```bash
/var/log/journal/
```

여기는 영구 저장소라 reboot 후에도 남는다.

이전 부팅 로그를 봐야 하는데 `journalctl -b -1`이 아무것도 보여주지 않으면, persistent journal이 꺼져 있거나 예전 로그가 남아있지 않은 상황일 수 있다.

설정은 보통 여기서 확인한다.

```bash
/etc/systemd/journald.conf
```

주로 보는 값은 `Storage=`다.

```ini
[Journal]
Storage=persistent
```

값은 대략 이렇게 보면 된다.

| 값 | 의미 |
| --- | --- |
| `volatile` | `/run/log/journal`에 저장. reboot하면 사라짐 |
| `persistent` | `/var/log/journal`에 저장. reboot 후에도 남음 |
| `auto` | `/var/log/journal`이 있으면 persistent처럼 동작 |
| `none` | 저장하지 않음 |

이전 부팅 로그를 계속 봐야 하는 장비라면 persistent 여부부터 확인하는 게 좋다.

## 용량 정리

journal은 계속 쌓이면 용량을 먹는다. 현재 사용량은 이렇게 본다.

```bash
journalctl --disk-usage
```

오래된 로그를 기간 기준으로 지우려면 이렇게 한다.

```bash
sudo journalctl --vacuum-time=7d
```

용량 기준으로 지울 수도 있다.

```bash
sudo journalctl --vacuum-size=500M
```

파일 개수 기준도 가능하다.

```bash
sudo journalctl --vacuum-files=5
```

다만 active journal 파일은 바로 정리 대상에 들어가지 않을 수 있다. 그래서 vacuum을 돌린 뒤에도 정확히 원하는 크기 아래로 내려가지 않는 경우가 있다.

## 내가 보통 뽑는 세트

지금은 부팅 문제를 보면 대충 이렇게 뽑는다.

```bash
mkdir -p logs

journalctl --list-boots > logs/boots.txt
journalctl -b -o short-iso-precise --no-pager > logs/boot_current.log
journalctl -b -p warning -o short-iso-precise --no-pager > logs/boot_current_warn.log
journalctl -k -b -o short-iso-precise --no-pager > logs/kernel_current.log
journalctl -b -o verbose --no-pager > logs/boot_current_verbose.log
```

직전 부팅 문제면 `-b -1`로 바꾼다.

```bash
mkdir -p logs

journalctl --list-boots > logs/boots.txt
journalctl -b -1 -o short-iso-precise --no-pager > logs/boot_prev.log
journalctl -b -1 -p warning -o short-iso-precise --no-pager > logs/boot_prev_warn.log
journalctl -k -b -1 -o short-iso-precise --no-pager > logs/kernel_prev.log
```

공유해야 하면 압축한다.

```bash
tar -czvf journal_logs.tar.gz logs/
```

`verbose` 로그는 평소에 자주 보진 않는다. 대신 `_PID`, `_EXE`, `_SYSTEMD_UNIT`, `_BOOT_ID` 같은 구조화 필드까지 확인해야 할 때 열어본다.

```bash
journalctl -b -o verbose --no-pager
```

JSON으로 보고 싶으면 이렇게 볼 수도 있다.

```bash
journalctl -b -o json-pretty --no-pager
```

처음에는 `journalctl --all > boot2.log`만 쓸 줄 알았는데 이제는 어떤 걸 볼지 정하고, 그 다음 로그 범위를 줄인다.

현재 부팅이면:

```bash
journalctl -b -o short-iso-precise --no-pager > boot_current.log
```

직전 부팅이면:

```bash
journalctl -b -1 -o short-iso-precise --no-pager > boot_prev.log
```

에러 중심이면:

```bash
journalctl -b -p warning -o short-iso-precise --no-pager > boot_warn.log
```

커널 로그는 따로:

```bash
journalctl -k -b -o short-iso-precise --no-pager > kernel_boot.log
```

## 참고

- [journalctl man page](https://man7.org/linux/man-pages/man1/journalctl.1.html)
