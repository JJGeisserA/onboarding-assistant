import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { readFileSync } from 'fs';
import { basename } from 'path';
import { createInterface } from 'readline';
import { config } from 'dotenv';

config();

const PARENTS_FILE = './parents.json';
const VECTORSTORE_FILE = './vectorstore.json';
const TOP_K = 4;

const SYSTEM_PROMPT = `You are an onboarding assistant for new software engineers.
Your job is to answer questions using ONLY the documentation provided in the context below.
If the context does not contain enough information to answer, say exactly:
"I don't have that information documented — please ask your team lead."
Always end your answer with a "Sources:" line listing the document filenames you used.`;

const prompt = ChatPromptTemplate.fromMessages([
  ['system', SYSTEM_PROMPT],
  ['human', 'Context:\n{context}\n\nQuestion: {question}'],
]);

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

async function main() {
  console.log('Initializing Onboarding Assistant...');

  let parents, vectorstore;
  try {
    parents = JSON.parse(readFileSync(PARENTS_FILE, 'utf-8'));
    vectorstore = JSON.parse(readFileSync(VECTORSTORE_FILE, 'utf-8'));
  } catch {
    console.error("Index not found. Run 'npm run ingest' first.");
    process.exit(1);
  }

  const parentsMap = Object.fromEntries(parents.map(p => [p.id, p]));
  const embeddings = new GoogleGenerativeAIEmbeddings({ model: 'text-embedding-004' });
  const llm = new ChatGoogleGenerativeAI({ model: 'gemini-1.5-flash', temperature: 0 });
  const chain = prompt.pipe(llm).pipe(new StringOutputParser());

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  console.log("Ready. Type your question or 'exit' to quit.\n");

  const ask = () => {
    rl.question('You: ', async (input) => {
      const question = input.trim();
      if (!question) return ask();
      if (['exit', 'quit'].includes(question.toLowerCase())) {
        console.log('Goodbye!');
        return rl.close();
      }

      const [queryEmbedding] = await embeddings.embedDocuments([question]);
      const hits = vectorstore
        .map(e => ({ ...e, score: cosineSimilarity(queryEmbedding, e.embedding) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, TOP_K);

      const seen = new Set();
      const relevantParents = [];
      for (const hit of hits) {
        const pid = hit.metadata.parentId;
        if (!seen.has(pid) && parentsMap[pid]) {
          seen.add(pid);
          relevantParents.push(parentsMap[pid]);
        }
      }

      if (!relevantParents.length) {
        console.log("\nAssistant: I don't have that information documented — please ask your team lead.\n");
        return ask();
      }

      const context = relevantParents
        .map(p => `[Source: ${basename(p.source)}]\n${p.content}`)
        .join('\n\n---\n\n');

      const answer = await chain.invoke({ context, question });
      console.log(`\nAssistant: ${answer}\n`);
      ask();
    });
  };

  ask();
}

main().catch(console.error);