---
title: "URL에서 내용 읽어 노션에 저장해주는 n8n workflow 만들기"
date: "2025-12-02"
category: "Automation"
tags: ["n8n", "automation"]
---

# 헬퍼를 만들어보자

미디엄이나, 기술블로그 글같은 걸 수집만 해두고 안읽는 경우가 많았는데 요약본이라도 확인하고 넘어가면 좋을 것 같았다. 자동화해보기로 했다.

## n8n 서비스도 host에 붙여야된다

[이전 글](https://kimmandoo.vercel.app/posts/automation/intro-n8n)에서 cloudflare만 host에 묶고, n8n은 묶지않았다. 이러면 webhook을 호출하려고 할 때 IPv4만 찾아서 나가려고하기 때문에, 통신이 안되는 문제가 발생한다.

```bash
(/usr/local/lib/node_modules/n8n/node_modules/.pnpm/posthog-node@3.2.1/node_modules/node_modules/tslib/tslib.es6.js:83:53) n8n  |     at rejected (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/posthog-node@3.2.1/node_modules/node_modules/tslib/tslib.es6.js:74:65) { n8n  |   error: DOMException [TimeoutError]: The operation was aborted due to timeout n8n  |       at node:internal/deps/undici/undici:14900:13, n8n  |   [cause]: DOMException [TimeoutError]: The operation was aborted due to timeout n8n  |       at node:internal/deps/undici/undici:14900:13 n8n  | } n8n  | Error fetching feature flags Error [PostHogFetchNetworkError]: Network error while fetching PostHog n8n  |     at new PostHogFetchNetworkE
```

docker-compose 파일을 열어 수정해주자.

```yml
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: always
    network_mode: "host"
    environment:
      - N8N_PORT=5678
      - WEBHOOK_URL=https://n8n.도메인
      - N8N_EDITOR_BASE_URL=https://n8n.도메인
      - GENERIC_TIMEZONE=Asia/Seoul
      - N8N_SECURE_COOKIE=true
      - N8N_PROXY_HOPS=1
      - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true # 권한 경고 해결
      - DB_SQLITE_POOL_SIZE=10                     # SQLite 성능 경고 해결
      - N8N_RUNNERS_ENABLED=false
      - N8N_GIT_NODE_DISABLE_BARE_REPOS=true       # Git 보안 경고 해결
    volumes:
      - ./n8n_data:/home/node/.n8n
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    restart: always
    network_mode: "host"
    command: tunnel run
    environment:
      - TUNNEL_TOKEN="터널 토큰"
      - TUNNEL_EDGE_IP_VERSION=6
```

network_mode를 host로 바꿔주고, 어차피 호스트의 네트워크를 쓰니까 도커로 포워딩을 해줄 필요가 없으니 port를 삭제했다.

또한 `N8N_RUNNERS_ENABLED`를 false로 다시 바꿔줬다. 이걸 false로 하면 n8n 로그에서 deprecated 됐다고 경고를 하는 데, true로 돌리면 task-runner가 다른 프로세스로 떠서 돌아간다. 내 목표는 작은 VM 인스턴스에서 최대한 간단하고, 신경쓸 일 없게 돌아가는 것이기 때문에 RUNNER를 분리하지 않고 돌리기로 했다.(이게 메모리를 덜 먹는다)

## 구축 시작

준비물은 3개다.

1. Telegram Bot Token
2. Notion API Token
3. Gemini API Token

텔레그램으로 링크를 봇에게 전달하면, 그게 트리거가 되어 Gemini가 미리 삽입된 프롬프트대로 동작한다. 그 api response를 가지고 가공해서, Notion에 삽입하는 게 최종 목표다.

이 세가지 모두 무료로 사용할 수 있다!

![alt text](/images/251202/image-3.png)

Gemini API의 경우 무료분으로 주어지는 모델 사용량이 있는데, 내 사용패턴에서는 무료 사용량을 넘길 일이 없다.

Telegram Bot은 BotFather를 사용해서 만들 수 있다. [공식 문서](https://core.telegram.org/bots#6-botfather)를 참고해서 만들자.

Notion API Token은 [여기](https://developers.notion.com/docs/getting-started)를 참고해서 만들 수 있다. Integration을 만들고, 사용될 페이지를 생성해 권한을 부여한 후 토큰을 복사해두자.

Gemini API Token은 [여기](https://aistudio.google.com/app/)에서 프로젝트를 만들고, Get API Key를 눌러서 만들 수 있다. 이 토큰도 복사해두자.

이제 n8n에 접속해서 workflow를 만들어보자.

모든 토큰은 각 블록의 credentials에서 설정해주면 된다.

![alt text](/images/251202/image.png)
이게 다 만들어진 workflow다. 각 블록별로 설명해보겠다.

먼저 텔레그램 봇이 메시지를 받으면 트리거된다. 메시지 내용에는 url이 있는데, 이 Url을 Jina로 감싸서 다음 블록으로 넘긴다. 이러면 마크다운으로 바뀌어서 날아간다.
![alt text](/images/251202/image-4.png)

jina가 반환해준 마크다운 문서를 gemini에게 넘겨줘야하는데, 나는 프롬프트를 아래와 같이 설정했다.

```text
아래 내용을 노션 페이지에 저장하기 좋게 정리해줘.

[규칙]
1. 첫 줄에는 '제목'만 적어줘 (특수문자 제외).
2. 두 번째 줄부터는 본문 내용을 작성해.
3. 본문은 [3줄 요약] -> [상세 내용] -> [용어 설명] 순서로 작성해줘.
4. 상세 내용은 Markdown 포맷을 사용해줘.

[내용]:
{{ $json.data }}
```

Gemini가 응답을 주면 그걸 이제 notion에 바로 쏠 수 있는 형태로 가공해야된다. 이건 Code 블록을 하나 만들어서 처리한다.

Code블록은 python이나 javascript로 작성할 수 있는데, 나는 llm의 힘을 빌려 javascript로 작성했다.

```javascript
// 1. Gemini 결과 가져오기
const inputItem = $input.item.json;
const fullText = inputItem.text || inputItem.message || ""; 

// 2. 제목과 본문 분리 로직
let title = "요약 내용";
let body = fullText;

const firstNewLineIndex = fullText.indexOf('\n');
if (firstNewLineIndex !== -1) {
  const tempTitle = fullText.substring(0, firstNewLineIndex).trim();
  // 제목 줄이 너무 길지 않고, 코드 블럭 시작이 아닐 때만 제목으로 인정
  if (tempTitle.length < 100 && !tempTitle.startsWith('```')) {
     title = tempTitle.replace(/^#+\s*/, '').replace(/제목:|Title:/gi, '').trim();
     body = fullText.substring(firstNewLineIndex + 1).trim();
  }
}
if (!body) body = fullText; 

// === [Helper] 굵은 글씨(**) 파싱 함수 ===
function parseRichText(text) {
  if (!text) return [];
  const parts = text.split(/(\*\*.*?\*\*)/g);
  const richTextArr = [];
  parts.forEach(part => {
    if (part === '') return;
    if (part.startsWith('**') && part.endsWith('**')) {
      richTextArr.push({
        type: 'text',
        text: { content: part.slice(2, -2) },
        annotations: { bold: true }
      });
    } else {
      richTextArr.push({ type: 'text', text: { content: part } });
    }
  });
  return richTextArr;
}

// 3. 본문 파싱 및 블록 생성
const blocks = [];

// (1) 원본 링크 추가
const sourceUrl = $('Telegram Trigger').item.json.message.text || "";
if (sourceUrl) {
    blocks.push({
      object: 'block',
      type: 'callout',
      callout: {
        rich_text: [{ type: 'text', text: { content: '원본 링크 바로가기', link: { url: sourceUrl } } }],
        icon: { emoji: '🔗' },
        color: 'gray_background'
      }
    });
}

// (2) 라인별 파싱 (코드 블럭 감지 로직 추가)
const lines = body.split('\n');
let inCodeBlock = false;
let codeBuffer = [];
let codeLanguage = "plain text";

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  // A. 코드 블록 시작/종료 감지 (```)
  if (trimmed.startsWith('```')) {
    if (inCodeBlock) {
      // [코드 블록 닫기]
      blocks.push({
        object: 'block',
        type: 'code',
        code: {
          rich_text: [{ type: 'text', text: { content: codeBuffer.join('\n') } }],
          language: codeLanguage
        }
      });
      inCodeBlock = false;
      codeBuffer = [];
      codeLanguage = "plain text";
    } else {
      // [코드 블록 열기]
      inCodeBlock = true;
      // ```javascript 처럼 언어가 지정되어 있으면 추출, 없으면 plain text
      const lang = trimmed.replace('```', '').trim();
      // Notion이 지원하는 언어 이름으로 매핑하거나 그대로 사용 (기본값 plain text)
      codeLanguage = lang || "plain text";
    }
    continue; // ``` 줄 자체는 내용에 포함하지 않음
  }

  // B. 코드 블록 내부인 경우 -> 버퍼에 저장
  if (inCodeBlock) {
    codeBuffer.push(line);
    continue;
  }

  // C. 일반 텍스트 처리 (빈 줄 무시)
  if (trimmed === '') continue;

  let type = 'paragraph';
  let contentText = trimmed;
  
  // 헤딩 및 리스트 처리
  if (trimmed.startsWith('### ')) { type = 'heading_3'; contentText = trimmed.replace(/^###\s*/, ''); }
  else if (trimmed.startsWith('## ')) { type = 'heading_2'; contentText = trimmed.replace(/^##\s*/, ''); }
  else if (trimmed.startsWith('# ')) { type = 'heading_1'; contentText = trimmed.replace(/^#\s*/, ''); }
  else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) { type = 'bulleted_list_item'; contentText = trimmed.replace(/^[-*]\s*/, ''); }
  else if (/^\d+\.\s/.test(trimmed)) { type = 'numbered_list_item'; contentText = trimmed.replace(/^\d+\.\s*/, ''); }

  blocks.push({
    object: 'block',
    type: type,
    [type]: { rich_text: parseRichText(contentText) }
  });
}

// 혹시 코드 블록이 닫히지 않고 끝났을 경우 처리
if (inCodeBlock && codeBuffer.length > 0) {
   blocks.push({
      object: 'block',
      type: 'code',
      code: {
        rich_text: [{ type: 'text', text: { content: codeBuffer.join('\n') } }],
        language: codeLanguage
      }
   });
}

// 4. 결과 반환
return {
  json: {
    title: title,
    all_blocks: blocks
  }
};
```

이 코드는 Gemini에서 받아온 긴 텍스트를 Notion 블록 형식으로 바꿔주는 역할을 한다. Gemini가 마크다운 형식으로 응답을 주기 때문에, 이를 적절히 파싱해서 Notion이 이해할 수 있는 블록 형태로 변환하는 것이다.

Notion 블록을 꺼내서, 페이지를 만들도록 설정한다.

![alt text](/images/251202/image-1.png)

아까 권한을 준 페이지를 Parent Page로 설정해주고, Title을 위에서 만든 Code 블록에서 꺼내오도록 설정해준다. 이미지에서 보이는 것과 같이 Blocks로 하는 것도 있는데, 나는 위에서 만든 Code 블록에서 가공된 block 배열을 쓸 것이기 때문에 Notion Node가 아니라 Notion API로 직접 쏠 것이다.

이전 Code 블록에서 생성된 block 배열을 chunk 100개 단위로 쪼개서 업로드 한다. Notion API는 한 번에 너무 많은 블록을 추가하는 것을 허용하지 않기 때문에, 여러 번에 나눠서 추가해야 한다.

```javascript
// 1. 바로 앞 노드('Create Page')에서 생성된 Notion Page ID 가져오기
const pageId = $input.item.json.id;

// 2. 'Prepare Data' 노드에서 만들어둔 블록 데이터 가져오기
// 주의: 바로 앞 노드가 아니므로 $('노드이름').first()를 사용하여 데이터를 찾습니다.
const prepareDataNode = $('Prepare Data').first();
const allBlocks = prepareDataNode ? prepareDataNode.json.all_blocks : [];

// 3. 안전장치: 만약 블록 데이터가 없다면 아무것도 하지 않고 종료
if (!allBlocks || allBlocks.length === 0) {
  return [];
}

// 4. Notion API 제한(한 번에 100개)에 맞춰 쪼개기 (Chunking)
const chunkSize = 100; 
const returnItems = [];

for (let i = 0; i < allBlocks.length; i += chunkSize) {
  returnItems.push({
    json: {
      page_id: pageId,  // 다음 노드(HTTP Request)로 넘겨줄 Page ID
      children: allBlocks.slice(i, i + chunkSize) // 100개씩 자른 블록 데이터
    }
  });
}

return returnItems;
```

앞선 코드에서 생성 된 노션 페이지에 대한 id를 가져왔고 방금 또 하나의 Code블록을 만들어서 보낼 준비를 다 마쳤다.

마지막으로, HTTP Request 노드를 만들어서 Notion API에 블록을 추가해주면 끝난다.

HTTP Method는 PATCH, URL은 `https://api.notion.com/v1/blocks/{{ $json.page_id }}/children`, Credential Type은 Notion API로 설정한다.

나머지는 다 JSON으로 맞추고 JSON블록에는 `{{ { "children": $json.children } }}`를 넣어준다.

Request Workflow로 테스트해보고 잘 되면 active로 전환해서 사용하면 된다.

![res](/images/251202/image-2.png)

이렇게 해서 텔레그램으로 링크를 보내면 알아서 요약본이 노션에 정리되는 workflow를 만들었다. 텔레그램이 한국에서는 범죄에 이용되는 경우가 많았어서 거부감이 느껴질 수 있는데, 그러면 slack이나 discord webhook을 트리거로 사용해도 된다.

이제부터는 내가 읽고싶거나 관심있는 글들을 텔레그램 봇에게 보내서, 노션에 정리된 요약본을 확인하면 된다. 자동화라는 걸 처음 해봤는데, 이걸로 생산성이 늘어난 지는 모르겠고 일단 기분이 좋다...