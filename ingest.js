import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { readFileSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';
import { glob } from 'glob';
import pdfParse from 'pdf-parse';

config();

const DOCS_DIR = './docs';
const PARENTS_FILE = './parents.json';
const VECTORSTORE_FILE = './vectorstore.json';

const parentSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 100 });
const childSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 20 });

async function loadDocuments() {
  const docs = [];
  const mdFiles = await glob(`${DOCS_DIR}/**/*.md`);
  for (const file of mdFiles) {
    docs.push({ content: readFileSync(file, 'utf-8'), source: file });
  }
  const pdfFiles = await glob(`${DOCS_DIR}/**/*.pdf`);
  for (const file of pdfFiles) {
    const { text } = await pdfParse(readFileSync(file));
    docs.push({ content: text, source: file });
  }
  return docs;
}

async function ingest() {
  console.log('Loading documents...');
  const rawDocs = await loadDocuments();

  if (!rawDocs.length) {
    console.log(`No documents found in ${DOCS_DIR}/. Add .md or .pdf files and try again.`);
    return;
  }
  console.log(`Found ${rawDocs.length} document(s). Splitting...`);

  const parents = [];
  for (const doc of rawDocs) {
    const chunks = await parentSplitter.splitText(doc.content);
    for (const chunk of chunks) {
      parents.push({ id: randomUUID(), content: chunk, source: doc.source });
    }
  }

  const childTexts = [];
  const childMetas = [];
  for (const parent of parents) {
    const chunks = await childSplitter.splitText(parent.content);
    for (const chunk of chunks) {
      childTexts.push(chunk);
      childMetas.push({ parentId: parent.id, source: parent.source });
    }
  }
  console.log(`Created ${parents.length} parent chunks and ${childTexts.length} child chunks.`);

  console.log('Embedding child chunks (this may take a moment)...');
  const embeddings = new GoogleGenerativeAIEmbeddings({ model: 'text-embedding-004' });
  const vectors = await embeddings.embedDocuments(childTexts);

  const vectorstore = childTexts.map((text, i) => ({
    text,
    embedding: vectors[i],
    metadata: childMetas[i],
  }));

  writeFileSync(PARENTS_FILE, JSON.stringify(parents, null, 2), 'utf-8');
  writeFileSync(VECTORSTORE_FILE, JSON.stringify(vectorstore, null, 2), 'utf-8');
  console.log(`Done. Index saved to ${VECTORSTORE_FILE} and ${PARENTS_FILE}`);
}

ingest().catch(console.error);