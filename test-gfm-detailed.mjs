import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

// Test case from the issue - could "ff" be interpreted as something else?
const testCases = [
  {
    input: '**ff**',
    desc: 'Basic ff bold'
  },
  {
    input: 'Some text **ff** more text',
    desc: 'ff bold in sentence'
  },
  {
    input: '**f**',
    desc: 'Single f'
  },
  {
    input: '**fff**',
    desc: 'Triple f'
  },
  {
    input: '**FF**',
    desc: 'Uppercase FF'
  },
  {
    input: 'URL like **ff**://test',
    desc: 'ff before protocol-like pattern'
  },
  {
    input: 'ftp://**ff**',
    desc: 'ff after ftp'
  }
];

console.log('Testing with remarkGfm (GitHub Flavored Markdown):');
console.log('='.repeat(60));

for (const { input, desc } of testCases) {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(input);
  
  const output = result.toString().trim();
  const hasStrong = output.includes('<strong>ff</strong>') || output.includes('<strong>FF</strong>');
  
  console.log(`\n${desc}`);
  console.log(`Input:  "${input}"`);
  console.log(`Output: ${output}`);
  console.log(`✓ Has <strong>: ${hasStrong ? 'YES' : 'NO'}`);
}
