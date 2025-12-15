import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

const testCases = [
  '**hello world**',
  '**a**',
  '**ff**',
  '**fff**',
  'This is **ff** in the middle.',
  '**test** and **ff** together.'
];

for (const test of testCases) {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(test);
  
  console.log('Input: ' + test);
  console.log('Output: ' + result.toString());
  console.log('---');
}
