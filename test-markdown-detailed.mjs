import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { inspect } from 'util';

const testCases = [
  '**ff**',
  'test **ff** test',
  '**ff**.',
  '**ff**,',
  '**ff**!',
];

console.log('Testing with remarkGfm:');
for (const test of testCases) {
  const tree = remark()
    .use(remarkGfm)
    .parse(test);
  
  const result = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(test);
  
  console.log('\nInput: "' + test + '"');
  console.log('AST:', inspect(tree, false, 10, true));
  console.log('Output:', result.toString().trim());
}

console.log('\n\nTesting WITHOUT remarkGfm:');
for (const test of testCases) {
  const tree = remark()
    .parse(test);
  
  const result = await remark()
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(test);
  
  console.log('\nInput: "' + test + '"');
  console.log('AST:', inspect(tree, false, 10, true));
  console.log('Output:', result.toString().trim());
}
