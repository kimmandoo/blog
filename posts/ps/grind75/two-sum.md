---
title: "1. Two Sum"
date: "2025-12-17"
category: "PS"
tags: ["ps", "leetcode", "grind75"]
---

완전탐색적으로 접근해도 풀린다.

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        // 두 수의 합이 target이 되는 idx를 배열로 반환
        int n = nums.length;
        for(int i=0; i<n-1; i++){
            for(int j=i+1; j<n; j++){
                if(nums[i]+nums[j] == target){
                    return new int[]{i,j};
                }
            }
        }
        return new int[]{0,0};
    }
}
```

여기서 약간의 최적화를 진행해보자.

```java
import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();

        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i]; // 현재 숫자와 더해서 target이 되는 짝꿍 숫자

            // 짝꿍 숫자가 이미 map에 기록되어 있는지 확인
            if (map.containsKey(complement)) {
                // 찾았다면 [짝꿍의 인덱스, 현재 인덱스] 반환
                return new int[] { map.get(complement), i };
            }

            // 못 찾았다면 현재 숫자와 인덱스를 기록해두고 다음으로 넘어감
            map.put(nums[i], i);
        }

        return new int[] {}; 
    }
}
```

$O(n^2)$ 풀이를 $O(n)$으로 만들기 위한 트릭이다. target값을 아니까 한 번 순회하면서 `target - 지금 값`이 발견됐는 지 보면 된다.

발견 못하면 hashmap에 <값, idx> 형태로 넣는데, 지나온 값을 map에 넣기 때문에 현재 값이 [1] 위치에 존재해야 된다.