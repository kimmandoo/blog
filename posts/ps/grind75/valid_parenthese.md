---
title: "20. Valid Parentheses"
date: "2025-12-17"
category: "PS"
tags: ["ps", "leetcode", "grind75"]
---

어렵지 않았음

```java 
class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque();
        for(int i=0; i<s.length(); i++){
            char c = s.charAt(i);
            if(c == ')' || c == '}' || c ==']'){
                // 닫히는 괄호면
                if(stack.isEmpty()) return false;

                char top = stack.peek();

                if(c == ')'){
                    if(top == '(') stack.pop();
                    else return false;
                } else if(c == '}'){
                    if(top == '{') stack.pop();
                    else return false;
                } else if(c == ']'){
                    if(top == '[') stack.pop();
                    else return false;
                }
            }else{
                stack.push(c);
            }
        }
        return stack.isEmpty();
    }
}
```

peek쓸 때 stack이 비어있으면 NPE가 발생한다는 것만 주의하면 되는 문제.

## 다른 풀이?

ArrayDeque 말고 그냥 배열로 stack 처럼 쓰는 정도가 생각난다.

배열 크기를 `s.length()`로 잡고, idx이동시키면서 값 관리하면 될 것 같음. 

push면 `stack[++idx] = value; pop이면 stack[idx--] = '';` 이런 식으로 가능할 듯.