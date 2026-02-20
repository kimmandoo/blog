export type Locale = 'ko' | 'en' | 'ja';

export const translations = {
  ko: {
    // Navigation
    blog: 'Blog',
    android: 'Android',
    ps: 'PS',
    home: '홈',
    list: '목록',

    // Search
    search: '검색...',
    searchProblems: '문제 검색...',

    // Categories & Tags
    categories: 'Categories',
    tags: 'Tags',
    filter: '필터:',
    other: '기타',

    // Post list
    noPostsFound: '선택한 필터에 해당하는 글이 없습니다.',
    noSearchResults: '에 해당하는 글을 찾을 수 없습니다',
    noPSSearchResults: '에 해당하는 문제를 찾을 수 없습니다',
    viewAllPosts: '전체 글 보기',
    clearSearch: '검색 초기화',
    minuteShort: '분',
    minuteRead: '분',

    // PS page
    problemSolving: 'Problem Solving',
    psDescription: '알고리즘 문제 풀이 모음',
    totalProblems: '풀이 수',
    totalReadingTime: '총 읽기 시간(분)',
    tagCount: '태그 수',
    tagDistribution: '태그 분포',
    searchResults: '검색 결과',
    allProblems: '전체 문제',
    countSuffix: '개',

    // Android page
    androidTitle: '안드로이드',
    androidDescription: '안드로이드 개발에 필요한 지식을 개인적으로 정리한 장소입니다.',
    allDocuments: '전체 문서',
    noDocumentsFound: '에 해당하는 문서를 찾을 수 없습니다',
    noDocumentsYet: '아직 작성된 문서가 없습니다.',
    addMarkdownTo: '디렉토리에 마크다운 파일을 추가해주세요.',

    // Reading progress
    minutesRemaining: '분 남음',
    readingComplete: '읽기 완료!',

    // Footer
    copyright: '©',
  },
  en: {
    blog: 'Blog',
    android: 'Android',
    ps: 'PS',
    home: 'Home',
    list: 'List',

    search: 'Search...',
    searchProblems: 'Search problems...',

    categories: 'Categories',
    tags: 'Tags',
    filter: 'Filter:',
    other: 'Other',

    noPostsFound: 'No posts found for the selected filter.',
    noSearchResults: 'No posts found matching',
    noPSSearchResults: 'No problems found matching',
    viewAllPosts: 'View all posts',
    clearSearch: 'Clear Search',
    minuteShort: 'min',
    minuteRead: 'min read',

    problemSolving: 'Problem Solving',
    psDescription: 'Algorithm problem solutions',
    totalProblems: 'Problems',
    totalReadingTime: 'Total reading time (min)',
    tagCount: 'Tags',
    tagDistribution: 'Tag Distribution',
    searchResults: 'Search Results',
    allProblems: 'All Problems',
    countSuffix: '',

    androidTitle: 'Android',
    androidDescription: 'A personal collection of knowledge needed for Android development.',
    allDocuments: 'All Documents',
    noDocumentsFound: 'No documents found matching',
    noDocumentsYet: 'No documents yet.',
    addMarkdownTo: 'Add markdown files to the directory.',

    minutesRemaining: 'min remaining',
    readingComplete: 'Reading complete!',

    copyright: '©',
  },
  ja: {
    blog: 'Blog',
    android: 'Android',
    ps: 'PS',
    home: 'ホーム',
    list: 'リスト',

    search: '検索...',
    searchProblems: '問題を検索...',

    categories: 'カテゴリ',
    tags: 'タグ',
    filter: 'フィルター:',
    other: 'その他',

    noPostsFound: '選択されたフィルターに該当する記事がありません。',
    noSearchResults: 'に該当する記事が見つかりません',
    noPSSearchResults: 'に該当する問題が見つかりません',
    viewAllPosts: 'すべての記事を見る',
    clearSearch: '検索をクリア',
    minuteShort: '分',
    minuteRead: '分',

    problemSolving: 'Problem Solving',
    psDescription: 'アルゴリズム問題の解法まとめ',
    totalProblems: '解答数',
    totalReadingTime: '総読書時間(分)',
    tagCount: 'タグ数',
    tagDistribution: 'タグ分布',
    searchResults: '検索結果',
    allProblems: 'すべての問題',
    countSuffix: '件',

    androidTitle: 'アンドロイド',
    androidDescription: 'Android開発に必要な知識を個人的にまとめた場所です。',
    allDocuments: 'すべてのドキュメント',
    noDocumentsFound: 'に該当するドキュメントが見つかりません',
    noDocumentsYet: 'まだドキュメントがありません。',
    addMarkdownTo: 'ディレクトリにマークダウンファイルを追加してください。',

    minutesRemaining: '分 残り',
    readingComplete: '読了！',

    copyright: '©',
  },
} as const;

export type TranslationKey = keyof typeof translations.ko;

export function getTranslation(locale: Locale, key: TranslationKey): string {
  return translations[locale][key];
}

export const LOCALE_LABELS: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
};

export const LOCALE_SHORT: Record<Locale, string> = {
  ko: 'KO',
  en: 'EN',
  ja: 'JA',
};
