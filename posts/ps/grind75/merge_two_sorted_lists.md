---
title: "21. Merge Two Sorted Lists"
date: "2025-12-17"
category: "PS"
tags: ["ps", "leetcode", "grind75"]
---

오랜만에 LinkedList 형태라 감 되살리기까지 조금 걸렸던 문제.

처음 오답코드 먼저 보겠다.

```java
class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // 비내림차순으로 정렬되어야됨
        ListNode res = new ListNode();
        while(list1 != null && list2 != null){
            if(list1.val <= list2.val){
                res = list1;
                list1 = list1.next;
            }else{
                res = list2;
                list2 = list2.next;
            }
        }

        if(list1 == null){
            res.next = list2;
        }
        if(list2 == null){
            res.next = list1;
        }
        return res;
    }
}
```

나름 linkedList인걸 떠올리고 뭔가 해보려고했으나, 중요한게 빠졌다.

head가 추적이 안된다는 점과, 현재 커서가 불분명 하다는 점.

그래서 아래처럼 바꿔줘야된다.

```java
class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode head = new ListNode(0);
        ListNode curr = head; 

        while(list1 != null && list2 != null){
            if(list1.val <= list2.val){
                curr.next = list1;   
                list1 = list1.next;  
            } else {
                curr.next = list2;   
                list2 = list2.next;  
            }
            curr = curr.next; // 다음 노드로 이동
        }

        if(list1 != null){
            curr.next = list1;
        }
        if(list2 != null){
            curr.next = list2;
        }

        return head.next;
    }
}
```

head와 현재 노드를 가리키는 커서 두개가 생겼고, 통합 listnode에 노드가 추가할 노드를 `curr.next = list1` 형태로 넣어주는 게 달라졌다.

재귀함수로만 다루다가 class로 만들어진 걸 다루니까 어색하다.

트리 문제를 풀때도 ArrayList로 풀다보니 더 까다롭다고 느꼈다.