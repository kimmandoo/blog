---
title: "121. Best Time to Buy and Sell Stock"
date: "2026-01-06"
category: "PS"
tags: ["ps", "leetcode", "grind75"]
---

무식하게 도전했다가 배워가는 문제.

1번의 순회과정에서 최저가에 주식을 매수해 최대가격에 판매하는 게 목적인 문제다.

솔직히 처음에는 $O(n^2)$ 으로 접근했다.

```java
class Solution {
    public int maxProfit(int[] prices) {
        int n=prices.length;
        int mx = -1;
        for(int i=0; i<n-1; i++){
            for(int j=i+1; j<n; j++){
                mx = Math.max(mx, prices[j]-prices[i]);
            }
        }
        return mx == -1 ? 0 : mx;
    }
}
```

논리는 맞으니까 당연히 답이 나올 줄 알았는데, 203번째 tc에서 시간초과가 발생하는 걸 목격했다. 일단 여기서 배운 거 하나, -> 무조건 최적화를 생각할 것.

문제를 풀 때 완전탐색으로 일단 풀고, 최적화를 수행하는 게 정석인데 이번 문제 풀 때는 최적화에 대한 생각을 하지 못했다.

그렇게 최적화를 해본 2번째 문제.

```java
class Solution {
    public int maxProfit(int[] prices) {
        int n=prices.length;
        int mx = -1;
        int minP = Integer.MAX_VALUE;
        for(int i=0; i<n; i++){
            minP = Math.min(minP, prices[i]);
            mx = Math.max(mx, prices[i]-minP);
        }
        return mx == -1 ? 0 : mx;
    }
}
```

문제를 읽다보니 greedy하게 접근해야하는 문제 같아서, 이전 최소값을 계속 들고 현재 값과 차이를 mx에 저장하는 방식으로 구현했다.

정답은 맞았는데... topic을 열어보니 DP가 적혀있다.

이전에 계산한 값을 그대로 사용한다는 의미를 DP라고 한건가? 싶어서 gemini에게 설명을 부탁했다.

> 매일매일 새롭게 계산하는 것이 아니라, 어제까지 구해놓은 최적의 값(minP, mx)을 이용해 오늘의 최적의 값을 갱신하고 있으므로 DP의 원리가 적용된 것입니다.

그래도 평소 생각하는 dp랑 결이 다른 것 같아 점화식으로 변환해달라고 했다.

$dp[i] = \max(dp[i-1], \text{prices}[i] - \text{minPrice})$

minPrice값은 내가 처리한 대로 하고, dp값에는 i번째 날의 최대 이익이 들어가도록 한 점화식이다.

이걸 코드로 구현하면 아래와 같다.

```java
class Solution {
    public int maxProfit(int[] prices) {
        int n = prices.length;

        int[] dp = new int[n];
        int minPrice = prices[0]; 

        dp[0] = 0;

        for (int i = 1; i < n; i++) {
            minPrice = Math.min(minPrice, prices[i]);
            dp[i] = Math.max(dp[i - 1], prices[i] - minPrice);
        }

        return dp[n - 1];
    }
}
```

크게 달라지진 않았는데, 내 약점이 dp배열을 정의내리는 것이라 이런 쉬운 문제 부터 연습해가야한다.
