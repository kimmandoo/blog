---
title: "125. Valid Palindrome"
date: "2026-01-06"
category: "PS"
tags: ["ps", "leetcode", "grind75"]
---

처음에 너무 어렵게 풀었다.

java의 기본 내장 라이브러리를 적극 활용하자.

```java
Character.isLetterOrDigit(c); // 알파벳이나 숫자만 통과
Character.toLowerCase(c); // 소문자변환
sb.reverse().toString(); // StringBuilder는 reverse를 제공한다. String 객체로 바꿀 거면 toString() 호출
```

처음 풀 때는 내장함수가 기억나지 않아서 엄청 돌아갔다. 심지어 숫자처리도 빼먹고 있었음.

```java
class Solution {
    public boolean isPalindrome(String s) {
        StringBuilder sb = new StringBuilder();
        // System.out.println((int)'A');
        // System.out.println((int)'Z');
        // System.out.println((int)'a');
        // System.out.println((int)'z');
        for(int i=0; i<s.length(); i++){
            char c = s.charAt(i);
            if((c <= 122 && c >= 97) || (c >= 65 && c <= 90) ){
                if(c < 97) c += 'a'-'A'; // lowercase
                sb.append(c);
            }
        }
        String ori = sb.toString();
        String rv = sb.reverse().toString();
        // System.out.println(ori);
        // System.out.println(rv);
        return rv.equals(ori);
    }
}
```

부끄러운 코드다.

```java
class Solution {
    public boolean isPalindrome(String s) {
        StringBuilder sb = new StringBuilder();
        
        for(int i = 0; i < s.length(); i++){
            char c = s.charAt(i);
            
            if(Character.isLetterOrDigit(c)) {
                sb.append(Character.toLowerCase(c));
            }
        }
        
        String ori = sb.toString();
        String rv = sb.reverse().toString();
        
        return ori.equals(rv);
    }
}
```

Character를 다뤄야할 일이 종종 생기는데, 이런 간단한 내장함수들은 알아두면 유용할 것 같다.

특히 StringBuilder 쪽 내장함수가 좋아보인다.

```java
StringBuilder sb = new StringBuilder("abcde");
sb.reverse(); 
// 결과: "edcba"
```

```java
StringBuilder sb = new StringBuilder("Java");
sb.setCharAt(1, 'o'); 
// 결과: "Jova"
```

String은 불변(Immutable)이라 중간 글자 하나를 바꾸려면 문자열을 새로 만들어야 하지만, StringBuilder는 바로 바꿀 수 있다. $O(1)$이라 매우 빠름.

```java
StringBuilder sb = new StringBuilder("012345");
sb.deleteCharAt(0);       // "12345" (첫 글자 삭제)
sb.delete(0, 2);          // "345" ("12" 삭제, end 인덱스는 포함 안 됨)
```

특정 인덱스의 문자 하나를 지우거나, 범위를 지정해서 싹 지울 때 사용. 스택(Stack)처럼 문자열을 다룰 때 유용할 것 같다. ArrayDeque으로 하는 게 나을수도...

```java
StringBuilder sb = new StringBuilder("ac");
sb.insert(1, "b"); 
// 결과: "abc"
```

insert나 delete는 뒤의 글자들을 밀거나 당겨야 하므로 시간 복잡도가 $O(N)$.

```java
StringBuilder sb = new StringBuilder("ABCDEFG");
// 1. 뒤에꺼 잘라내기 (길이 조절)
sb.setLength(3); 
// 결과: "ABC" (나머지 삭제됨)
sb.setLength(0); 
// 결과: "" (빈 문자열됨) -> new StringBuilder()보다 메모리 효율적
```

문자열을 자르거나, 내용을 비울 때 유용하다.

`setLength(0)` 해버리면 재사용할 때 객체 새로 안 만들고 비워서 조금 더 메모리를 아낄 수 있다.