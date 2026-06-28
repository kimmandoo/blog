---
title: cpp로 대용량 안드로이드 로그 분석기 개발하기
date: 2026-05-11
category: CPP
tags: [cpp, android, thread]
---

로그를 조금 더 편하게 보기 위한 분석기를 C++로 만들어봤다.

구조는 단순하다.

로그 파일을 읽고, 이벤트별 빈도를 세고, 로그 레벨별 빈도를 세고, 에러 이벤트가 발생한 위치를 따로 기록한다.

처음에는 싱글 스레드로 만들고, 그 다음 분석 시간을 줄이기 위해 멀티 스레드로 확장했다.

## 로그 한 줄 파싱하기

처음에는 `std::istringstream`으로 한 줄을 토큰 단위로 나누면 된다고 생각했다.

안드로이드 로그는 보통 이런 형태다.

```log
05-05 10:30:11.297 24108 24108 E AndroidRuntime: FATAL EXCEPTION: main
```

날짜, 시간, pid, tid, level, tag, message 순서로 자르면 된다.

그런데 실제 로그를 보면 항상 이렇게 예쁘게 떨어지지는 않는다.

```log
I ACE    : text
Mams:BackupManager: text
```

이런 식으로 tag 위치에 공백이 들어가거나, tag 안에 `:`가 붙어 있는 경우가 있다.
그냥 공백 기준으로 자르면 `ACE`만 tag로 잡히거나, message와 tag의 경계가 흐려진다.

그래서 로그 헤더를 먼저 읽고, 그 뒤는 `: `를 기준으로 다시 나누는 쪽으로 바꿨다.
tag와 message의 경계를 공백이 아니라 구분자 기준으로 잡는 것이다.

중간중간 공백을 지우기 위해 `trim`도 직접 넣었다.
C++11에는 지금처럼 바로 쓸 수 있는 trim 함수가 없기 때문이다.

```cpp
std::string trim(const std::string& str) {
    size_t start = str.find_first_not_of(" \t\r\n");
    if (start == std::string::npos) return "";
    size_t end = str.find_last_not_of(" \t\r\n");
    return str.substr(start, end - start + 1);
}
```

## istringstream 제거

처음 구현에서는 `std::istringstream`을 계속 만들었다.

한 줄만 보면 문제 없어 보이는데, 대상 로그가 707만 줄 정도 되면 얘기가 달라진다.
매 줄마다 내부 버퍼를 만들고, 임시 문자열을 만들고, 다시 파싱하는 비용이 계속 쌓인다.

그래서 공백 위치만 직접 따라가면서 필요한 토큰을 잘라내도록 바꿨다.

결과는 꽤 바로 보였다.

```bash
 Performance counter stats for './a.out target.log':

        5833261700      task-clock:u                     #    0.904 CPUs utilized             
                 0      context-switches:u               #    0.000 /sec                      
                 0      cpu-migrations:u                 #    0.000 /sec                      
              7046      page-faults:u                    #    1.208 K/sec                     
       67173384544      instructions:u                   #    2.78  insn per cycle            
                                                  #    0.00  stalled cycles per insn   
       24199969892      cycles:u                         #    4.149 GHz                       
          89101891      stalled-cycles-frontend:u        #    0.37% frontend cycles idle      
          21793948      stalled-cycles-backend:u         #    0.09% backend cycles idle       
       14225179498      branches:u                       #    2.439 G/sec                     
          45729645      branch-misses:u                  #    0.32% of all branches           

       6.452690211 seconds time elapsed

       5.150092000 seconds user
       0.682432000 seconds sys
```

after

```bash
 Performance counter stats for './a.out target.log':

        4164682200      task-clock:u                     #    0.900 CPUs utilized             
                 0      context-switches:u               #    0.000 /sec                      
                 0      cpu-migrations:u                 #    0.000 /sec                      
              7942      page-faults:u                    #    1.907 K/sec                     
       40759051194      instructions:u                   #    2.52  insn per cycle            
                                                  #    0.00  stalled cycles per insn   
       16186377422      cycles:u                         #    3.887 GHz                       
          47124765      stalled-cycles-frontend:u        #    0.29% frontend cycles idle      
          16300362      stalled-cycles-backend:u         #    0.10% backend cycles idle       
        8798683981      branches:u                       #    2.113 G/sec                     
          32728184      branch-misses:u                  #    0.37% of all branches           

       4.627105785 seconds time elapsed

       3.532178000 seconds user
       0.631399000 seconds sys
```

전체 실행 시간은 약 28% 줄었고, instruction 개수는 약 39% 줄었다.

여기서 중요한 점은 알고리즘을 크게 바꾼 게 아니라, 불필요한 객체 생성을 줄였다는 것이다.
수백만 줄을 처리할 때는 이런 작은 비용도 그대로 누적된다.

## 문자열 대신 offset 저장하기

에러 로그를 나중에 출력하려면 해당 줄을 어딘가에 저장해둬야 한다.

처음에는 에러 문자열 자체를 vector에 넣으려고 했다. 그런데 로그 파일이 커질수록 이 방식은 부담이 커진다.
에러가 많으면 문자열 복사도 많아지고, vector가 들고 있는 메모리도 계속 늘어난다.

그래서 문자열을 저장하지 않고, 원본 파일에서의 위치만 저장했다.

```cpp
for (std::streampos offset : result.errorOffsets) {
    originalFile.seekg(offset);
    std::getline(originalFile, errorLine);
    outFile << errorLine << "\n";
}
```

`std::streampos`는 파일 스트림 안에서의 위치를 나타내는 타입이다.
분석할 때는 에러가 발생한 위치만 기록하고, 출력할 때 원본 파일을 다시 열어서 그 위치로 이동한 뒤 한 줄을 읽는다.

이렇게 하면 분석 중에는 큰 문자열을 계속 들고 있을 필요가 없다.

성능도 더 좋아졌다.

before
```bash
 Performance counter stats for './a.out target.log':

        4098312500      task-clock:u                     #    0.901 CPUs utilized             
                 0      context-switches:u               #    0.000 /sec                      
                 0      cpu-migrations:u                 #    0.000 /sec                      
              7257      page-faults:u                    #    1.771 K/sec                     
       40069985213      instructions:u                   #    2.49  insn per cycle            
                                                  #    0.00  stalled cycles per insn   
       16061188341      cycles:u                         #    3.919 GHz                       
          62378787      stalled-cycles-frontend:u        #    0.39% frontend cycles idle      
          14096448      stalled-cycles-backend:u         #    0.09% backend cycles idle       
        8612037313      branches:u                       #    2.101 G/sec                     
          34402430      branch-misses:u                  #    0.40% of all branches           

       4.550336995 seconds time elapsed

       3.444756000 seconds user
       0.652690000 seconds sys
```
after
```bash
 Performance counter stats for './a.out target.log':

        3376384900      task-clock:u                     #    0.897 CPUs utilized             
                 0      context-switches:u               #    0.000 /sec                      
                 0      cpu-migrations:u                 #    0.000 /sec                      
               974      page-faults:u                    #  288.474 /sec                      
       21758779563      instructions:u                   #    2.31  insn per cycle            
                                                  #    0.01  stalled cycles per insn   
        9401937609      cycles:u                         #    2.785 GHz                       
         211613645      stalled-cycles-frontend:u        #    2.25% frontend cycles idle      
          56140139      stalled-cycles-backend:u         #    0.60% backend cycles idle       
        4657979802      branches:u                       #    1.380 G/sec                     
          39074444      branch-misses:u                  #    0.84% of all branches           

       3.766160090 seconds time elapsed

       2.202098000 seconds user
       1.174452000 seconds sys
```

문자열 복사와 저장이 줄어들면서 page fault가 크게 줄었다.
instruction도 거의 절반 가까이 줄었다.

대신 `seekg`로 파일 위치를 다시 찾아가야 하니까 sys time은 늘었다.
그래도 문자열을 계속 복사하는 비용이 더 컸기 때문에 전체 시간은 줄었다.

offset으로 다시 읽을 때는 정렬도 해준다.

```cpp
std::sort(global.errorOffsets.begin(), global.errorOffsets.end());
```

offset이 뒤죽박죽이면 파일을 여기저기 건너뛰면서 읽게 된다.
정렬해두면 원본 파일 접근이 순차 읽기에 가까워지고, 스트림 버퍼를 재사용할 가능성도 높아진다.

## 멀티 스레드 적용

싱글 스레드만으로도 어느 정도 빨라졌지만, 로그가 수천만 줄이 되면 여전히 시간이 오래 걸린다.

그래서 파일을 코어 수만큼 나누고, 각 구간을 따로 분석하게 했다.

```cpp
size_t numThreads = std::thread::hardware_concurrency();
if (numThreads == 0) numThreads = 4;

std::streampos chunkSize = fileSize / numThreads;
std::vector<std::future<AnalysisResult>> futures;

for (size_t i = 0; i < numThreads; ++i) {
    std::streampos start = i * chunkSize;
    std::streampos end = (i == numThreads - 1) ? fileSize : start + chunkSize;

    futures.push_back(std::async(std::launch::async, analyzeChunk, filePath, start, end));
}
```

여기서는 thread를 직접 만들지 않고 `std::async`를 썼다.
`std::launch::async`를 넘기면 각 `analyzeChunk`가 별도의 비동기 작업으로 실행된다.

반환값은 `std::future<AnalysisResult>`로 받아둔다.
나중에 `f.get()`을 호출하면 해당 작업이 끝날 때까지 기다렸다가 결과를 꺼낼 수 있다.

테스트 환경은 8코어였다.

single
```bash
 Performance counter stats for './single_analyzer target.log':

        1640145300      task-clock:u                     #    0.909 CPUs utilized             
                 0      context-switches:u               #    0.000 /sec                      
                 0      cpu-migrations:u                 #    0.000 /sec                      
               971      page-faults:u                    #  592.021 /sec                      
       11672982755      instructions:u                   #    2.80  insn per cycle            
                                                  #    0.02  stalled cycles per insn   
        4171844792      cycles:u                         #    2.544 GHz                       
         204008129      stalled-cycles-frontend:u        #    4.89% frontend cycles idle      
          52795928      stalled-cycles-backend:u         #    1.27% backend cycles idle       
        2633212301      branches:u                       #    1.605 G/sec                     
          30357161      branch-misses:u                  #    1.15% of all branches           

       1.804770269 seconds time elapsed

       1.072711000 seconds user
       0.563628000 seconds sys
```

multi
```bash
 Performance counter stats for './multi_analyzer target.log':

        4947830100      task-clock:u                     #    8.094 CPUs utilized             
                 0      context-switches:u               #    0.000 /sec                      
                 0      cpu-migrations:u                 #    0.000 /sec                      
              3228      page-faults:u                    #  652.407 /sec                      
       21721996561      instructions:u                   #    1.93  insn per cycle            
                                                  #    0.03  stalled cycles per insn   
       11259169441      cycles:u                         #    2.276 GHz                       
         584661449      stalled-cycles-frontend:u        #    5.19% frontend cycles idle      
         141380731      stalled-cycles-backend:u         #    1.26% backend cycles idle       
        4909704443      branches:u                       #  992.294 M/sec                     
          56120091      branch-misses:u                  #    1.14% of all branches           

       0.611267262 seconds time elapsed

       2.886787000 seconds user
       1.966233000 seconds sys
```

user time과 sys time은 늘었다.
여러 코어가 동시에 일했기 때문이다.

하지만 실제 대기 시간은 크게 줄었다.
병렬 처리에서는 이게 제일 중요한 숫자다.

빌드할 때는 `-pthread` 옵션을 붙이는 쪽이 좋다.
내 WSL 환경에서는 빼도 일단 동작했지만, 스레드를 쓴다는 의도를 컴파일러와 링커에 명확하게 전달하는 편이 맞다.

## 멀티라인 로그 처리

안드로이드 로그에는 한 줄짜리 이벤트만 있는 게 아니다.

예를 들어 crash stacktrace는 여러 줄로 이어진다.

```log
05-05 10:30:11.297 24108 24108 E AndroidRuntime: FATAL EXCEPTION: main
05-05 10:30:11.297 24108 24108 E AndroidRuntime: Process: com.broadcom.nrdphelper, PID: 24108
05-05 10:30:11.297 24108 24108 E AndroidRuntime: java.lang.RuntimeException: Unable to start service ...
05-05 10:30:11.297 24108 24108 E AndroidRuntime:     at android.app.ActivityThread.handleServiceArgs(ActivityThread.java:4839)
05-05 10:30:11.297 24108 24108 E AndroidRuntime:     at android.os.Handler.dispatchMessage(Handler.java:106)
05-05 10:30:11.297 24108 24108 E AndroidRuntime:     ... 9 more
```

또는 이런 형태도 있다.

```log
--------- beginning of crash
F libc    : Fatal signal 11 (SIGSEGV)
backtrace:
    #00 pc 000000000001234
    #01 pc 000000000004321
```

이걸 단순히 한 줄씩 이벤트로 세면 실제로는 하나의 에러인데 여러 이벤트처럼 보일 수 있다.
반대로 헤더가 없는 stacktrace 줄은 그냥 ignore될 수도 있다.

그래서 이전 로그 헤더와 이어지는지를 보고 continuation으로 분류했다.

기준은 timestamp, pid, tid, level, tag다.

```cpp
bool isSameHeaderContinuation(const LogRecord& previous, const LogRecord& current) {
    return previous.timestamp == current.timestamp
        && previous.pid == current.pid
        && previous.tid == current.tid
        && previous.level == current.level
        && previous.tag == current.tag;
}
```

판단 흐름은 이렇다.

```cpp
if (!parseLogLine(line, record)) {
    if (hasPreviousLogHeader) {
        result.continuationLines++;
        continue;
    }

    result.ignoredLines++;
    continue;
}

if (hasPreviousLogHeader && isSameHeaderContinuation(previousRecord, record)) {
    result.continuationLines++;
    previousRecord = record;
    continue;
}

hasPreviousLogHeader = true;
previousRecord = record;
analyzeRecord(record, currentOffset, result);
```

이전 로그가 정상적으로 파싱됐는데 현재 줄이 파싱되지 않으면, 일단 이전 로그의 continuation으로 본다.
현재 줄도 파싱되었지만 헤더 정보가 이전 로그와 같으면 이것도 continuation으로 본다.

continuation은 `analyzeRecord`로 넘기지 않는다.
그래야 같은 에러 묶음이 여러 번 집계되지 않는다.

출력할 때도 같은 기준을 사용한다.
에러 offset에서 시작해 다음 줄을 계속 읽다가, 이전 로그와 이어지지 않는 헤더가 나오면 그 에러 묶음이 끝난 것으로 판단한다.

## chunk 경계 문제

멀티 스레드로 나누면서 새로운 문제가 생겼다.

파일을 단순히 n등분하면 하나의 멀티라인 로그가 chunk 경계에 걸릴 수 있다.
앞부분은 이전 chunk가 보고, 뒷부분은 다음 chunk가 보는 식이다.

처음에는 chunk 끝에 도달해도 이전 로그가 있으면 조금 더 읽게 했다.

```cpp
if (currentOffset == std::streampos(-1) || currentOffset >= endOffset) {
    if (!hasPreviousLogHeader) {
        break;
    }
}
```

그런데 이렇게 하니까 700만 줄짜리 로그를 6000만 줄 넘게 읽었다고 나왔다.
각 스레드가 자기 chunk에서 멈추지 못하고 파일 끝까지 읽은 것이다.

그래서 방향을 바꿨다.

각 chunk는 자기 범위만 분석한다.
대신 결과에 첫 로그와 마지막 로그 정보를 같이 담아둔다.

```cpp
struct AnalysisResult {
    size_t totalLines = 0;
    size_t parsedLines = 0;
    size_t continuationLines = 0;
    size_t ignoredLines = 0;

    bool hasFirstRecord = false;
    LogRecord firstRecord;
    std::streampos firstRecordOffset = 0;

    bool hasLastRecord = false;
    LogRecord lastRecord;
};
```

merge 단계에서 이전 chunk의 마지막 로그와 현재 chunk의 첫 로그를 비교한다.
두 로그의 timestamp, pid, tid, level, tag가 같으면 현재 chunk의 첫 로그는 새 이벤트가 아니라 이전 chunk의 continuation이다.

이 경우 이미 증가한 카운트를 되돌려야 한다.

```cpp
void decrementCount(std::unordered_map<std::string, size_t>& counts, const std::string& key) {
    auto it = counts.find(key);
    if (it == counts.end()) return;

    if (it->second <= 1) {
        counts.erase(it);
        return;
    }

    it->second--;
}

void removeOffset(std::vector<std::streampos>& offsets, std::streampos offset) {
    auto it = std::find(offsets.begin(), offsets.end(), offset);
    if (it != offsets.end()) {
        offsets.erase(it);
    }
}
```

`parsedLines`, `levelCount`, `eventCount`는 하나씩 줄이고, `continuationLines`는 늘린다.
만약 그 첫 로그가 ERROR였다면 `errorOffsets`에서도 제거한다.
그래야 같은 에러 묶음이 출력에서 중복되지 않는다.

이 처리는 성능 개선이라기보다는 정합성을 맞추는 작업에 가깝다.
chunk 경계를 보정하려면 비교 과정이 추가되기 때문에 오버헤드는 생긴다.

그래도 멀티라인 로그를 제대로 묶으려면 필요한 비용이다.
