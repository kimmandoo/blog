---
title: "Rust로 ESP32 개발환경 세팅하기"
date: "2026-08-09"
category: "ESP32"
tags: ["esp32", "rust", "embedded"]
---

요즘 ESP32를 만져보기 시작했다.

대세를 따르기 위해 Rust로 접근해보려고 한다. 기판 뒤에는 `ESP32-DevKit V1`이라고 적혀 있는데, `C3`인지 `S3`인지 같은 칩 정보는 따로 보이지 않았다.

그래서 일단 보드가 어떤 칩을 쓰는지 확인하고, 그 결과에 맞춰 Rust 환경을 구성해보기로 했다.

## Rust 환경 세팅

Rust는 설치 스크립트를 직접 받아서 설치하기보다 `rustup`으로 관리하는 편이 좋다.(공식 문서에서도 그걸 추천함) 예전에 Homebrew로 Rust를 설치한 적도 있었는데, toolchain과 target을 같이 관리해야 하니 `rustup`을 사용하는 게 맞는 것 같다.

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

rustc --version
cargo --version

rustup toolchain install stable --component rust-src
rustup component add rustfmt clippy
```

ESP32는 칩에 따라 CPU 아키텍처가 다르다. ESP32-C2, C3, C6, H2처럼 RISC-V를 사용하는 칩은 그에 맞는 target을 추가해야 한다.

```bash
rustup target add riscv32imc-unknown-none-elf
# ESP32-C2, ESP32-C3

rustup target add riscv32imac-unknown-none-elf
# ESP32-C6, ESP32-H2
```

쿠팡에서 구매한 보드가 따로 명칭이 안적혀있었기 때문에 내 보드도 이 중 하나일 거라고 생각했다. 근데 이후 espflash 돌려보니까 아니더라.

## 보드가 연결됐는지 확인하기

먼저 보드를 연결하기 전후에 시리얼 장치 목록을 비교한다.

```bash
ls /dev/cu.*

/dev/cu.usbserial-0001
/dev/cu.SLAB_USBtoUART
/dev/cu.wchusbserialXXXX
```

USB-UART 칩 정보까지 확인하고 싶으면 `system_profiler`를 사용하면 된다.

```bash
system_profiler SPUSBDataType
```

출력에서 `Silicon Labs`, `CP210x`, `CH340`, `wch` 같은 이름을 확인할 수 있다. 내 보드는 `Silicon Labs CP2102 USB to UART Bridge Controller`로 나왔다.

연결 직후 어떤 장치가 추가됐는지 보고 싶으면 다음 명령으로 커널 로그를 따라가면 된다.

```bash
dmesg --follow
```

일반적으로 `/dev/ttyUSB0` 또는 `/dev/ttyACM0` 같은 시리얼 포트가 생긴다.

## espflash로 칩 정보 확인하기

Rust 환경에서는 Cargo로 설치할 수 있는 `espflash`를 사용하기로 했다.

```bash
cargo install espflash --locked
```

연결된 포트 목록은 `espflash list-ports`로도 확인할 수 있다.

```bash
espflash list-ports
```

내 환경에서는 대략 아래처럼 출력됐다.

```text
/dev/cu.usbserial-0001   EA60:10C4  Silicon Labs  CP2102 USB to UART Bridge Controller
/dev/tty.usbserial-0001  EA60:10C4  Silicon Labs  CP2102 USB to UART Bridge Controller
```

이제 실제 포트 이름을 넣어 `board-info`를 실행한다.

```bash
espflash board-info --port /dev/cu.usbserial-0001
```

포트 옵션을 생략해도 자동으로 찾는 경우가 있지만, 여러 장치가 연결될 수 있으니 명시하는 편이 안전하다.

출력은 아래와 비슷했다.

```text
[INFO ] Serial port: '/dev/cu.usbserial-0001'
[INFO ] Connecting...
[INFO ] Using flash stub
Chip type:         esp32 (revision v3.1)
Crystal frequency: 40 MHz
Flash size:        4MB
Features:          WiFi, BT, Dual Core, 240MHz, VRef calibration in efuse, Coding Scheme None
MAC address:       20:9b:a9:xx:xx:xx
Security features: None
```

`Chip type` 부분이 중요하다.

```text
ESP32    → ESP32 클래식
ESP32-S3 → ESP32-S3
ESP32-C3 → ESP32-C3
```

내 보드는 `esp32` 클래식으로 확인됐다. 기판에 `ESP32-DevKit V1`라고 적혀있었는데 이거면 보통 esp32 클래식인가 보다..

타임아웃이 발생하면 보드의 `BOOT` 버튼을 누른 상태에서 `EN` 또는 `RESET` 버튼을 한 번 누른 뒤, `BOOT` 버튼을 놓고 같은 명령을 다시 실행하면 된다. 자동으로 부트로더에 진입하는 보드라면 이 과정이 필요 없을 수도 있다.

## Xtensa ESP32는 별도 toolchain이 필요하다

위에서 RISC-V target을 추가하는 방법을 올려놨지만 내 보드는 클래식 ESP32라서 해당되지 않았다. 클래식 ESP32는 Xtensa 아키텍처를 사용한다.

ESP32의 Xtensa 칩을 Rust로 타겟팅하려면 일반적인 stable Rust만으로는 부족하다. 현재는 ESP32용으로 수정된 Rust compiler fork를 사용해야 해서 `espup`으로 환경을 구성한다.

```bash
cargo install espup --locked
espup install
```

설치가 끝나면 `export-esp.sh`가 생성된다. 이 파일에는 ESP용 toolchain과 관련 환경변수를 설정하는 내용이 들어 있다.

난 맥북이라 zsh를 사용하고 있으므로 거기에 맞춰서 기본 설정 파일에 내용을 추가한다.

```bash
cat $HOME/export-esp.sh >> ~/.zshrc
source ~/.zshrc
```

`source`를 실행하면 현재 열려 있는 터미널에도 바로 적용된다. 새 터미널을 열면 자동으로 적용되기 때문에 매번 직접 실행할 필요는 없다.

## 빌드와 플래시에 사용할 도구 설치

프로젝트를 생성해주는 `esp-generate`와 보드에 바이너리를 올려주는 `espflash`를 설치한다.

```bash
cargo install esp-generate --locked
cargo install espflash --locked
```

디버깅용으로 `probe-rs`도 설치할 수 있다.

```bash
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/probe-rs/probe-rs/releases/latest/download/probe-rs-tools-installer.sh | sh
```

macOS에서는 probe-rs를 사용하기 위해 추가로 설정해야 하는 부분이 없었다. 우선은 `espflash`만으로도 빌드한 결과를 보드에 올리고 로그를 확인할 수 있으니, 여기까지 하고 샘플 프로젝트를 실행해보기로 했다.

## esp-generate로 프로젝트 만들기

`esp-generate`를 실행하면 보드와 프로젝트 옵션을 선택하는 화면이 나온다.

```bash
esp-generate
```

보드에 맞는 모듈을 선택하고, 필요한 기능을 체크한 뒤 프로젝트를 생성한다. 화면에서 `Flashing, logging and debugging (espflash)`를 선택하면 `cargo run`만으로 빌드와 플래시를 이어서 실행할 수 있다.

![esp-generate 설정 화면](/images/260809/1.png)

생성된 프로젝트로 이동해서 실행한다.

```bash
cd hello-world
cargo run
```

처음 실행하면 빌드 시간이 조금 걸린다. rust가 장난처럼 까이는 요인 중에 하나가 빌드 시간이던데 가볍게 체감할 수 있었다. 

이후 `espflash`가 보드를 연결하고, 바이너리를 플래시에 기록한 다음 시리얼 로그를 보여준다.

```text
[INFO ] Serial port: '/dev/cu.usbserial-0001'
[INFO ] Connecting...
[INFO ] Using flash stub
Chip type:         esp32 (revision v3.1)
Crystal frequency: 40 MHz
Flash size:        4MB
Features:          WiFi, BT, Dual Core, 240MHz, VRef calibration in efuse, Coding Scheme None
App/part. size:    74,560/4,128,768 bytes, 1.81%
[INFO ] Flashing has completed!
Commands:
    CTRL+R    Reset chip
    CTRL+C    Exit
```

`Flashing has completed!`이 출력되면 일단 플래시는 성공한 것이다. 이후에는 보드가 리셋되면서 부트로더 로그가 이어진다.

```text
ets Jul 29 2019 12:21:46

rst:0x1 (POWERON_RESET),boot:0x13 (SPI_FAST_FLASH_BOOT)
I (27) boot: ESP-IDF v5.5.1 2nd stage bootloader
I (28) boot: Multicore bootloader
I (30) boot: chip revision: v3.1
I (33) boot.esp32: SPI Speed      : 40MHz
I (37) boot.esp32: SPI Mode       : DIO
I (40) boot.esp32: SPI Flash Size : 4MB
I (134) boot: Loaded app from partition at offset 0x10000
```

Rust 코드가 컴파일돼서 ESP32용 바이너리가 만들어졌으며, 실제 보드의 플래시까지 완료된 상태다.

초등학생 때 과학상자, 고무동력기 만들던 기억이 떠올라서 심장이 두근거린다. 일단 나는 rust를 거의 모르기 때문에, 기본 문법부터 가볍게 훑고 ai agent와 놀아볼 예정이다!