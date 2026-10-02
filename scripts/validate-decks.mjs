import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import Ajv2020 from "ajv/dist/2020.js";

const root = process.cwd();
const schemaPath = path.join(root, "schema", "deck.schema.json");
const presentationsDir = path.join(root, "presentations");

if (!fs.existsSync(schemaPath)) {
  console.error("Schema bulunamadı:", schemaPath);
  process.exit(1);
}

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const ajv = new Ajv2020({
  allErrors: true,
  strict: false
});
const validateSchema = ajv.compile(schema);

function findDecks(dir) {
  if (!fs.existsSync(dir)) return [];

  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...findDecks(fullPath));
    } else if (entry.isFile() && entry.name === "deck.json") {
      result.push(fullPath);
    }
  }
  return result.sort();
}

function pointerToPath(pointer = "") {
  if (!pointer) return "(deck)";
  return pointer
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.replaceAll("~1", "/").replaceAll("~0", "~"))
    .join(".");
}

function semanticErrors(deck, deckPath) {
  const errors = [];

  const folderId = path.basename(path.dirname(deckPath));
  if (deck.id !== folderId) {
    errors.push(
      `deck.id ("${deck.id}") klasör adıyla ("${folderId}") aynı olmalı.`
    );
  }

  const seenIds = new Set();
  for (const slide of deck.slides) {
    if (seenIds.has(slide.id)) {
      errors.push(`Tekrarlanan slide id: ${slide.id}`);
    }
    seenIds.add(slide.id);

    if (slide.type === "question" || slide.type === "question_answer") {
      for (const target of slide.reveal ?? []) {
        if (!(target in slide) || slide[target] === "") {
          errors.push(
            `${slide.id}: reveal "${target}" alanını açmak istiyor ancak alan yok veya boş.`
          );
        }
      }
    }

    if (slide.type === "table") {
      slide.rows.forEach((row, rowIndex) => {
        if (row.length !== slide.headers.length) {
          errors.push(
            `${slide.id}: table satır ${rowIndex + 1} hücre sayısı (${row.length}) header sayısıyla (${slide.headers.length}) aynı olmalı.`
          );
        }
      });
    }

    if (slide.type === "definitions" && slide.groupSize > slide.items.length) {
      errors.push(
        `${slide.id}: groupSize (${slide.groupSize}) kavram sayısından (${slide.items.length}) büyük olmamalı.`
      );
    }
  }

  return errors;
}

const deckPaths = findDecks(presentationsDir);

if (deckPaths.length === 0) {
  console.error("presentations/ altında deck.json bulunamadı.");
  process.exit(1);
}

let hasError = false;

for (const deckPath of deckPaths) {
  const relativePath = path.relative(root, deckPath);

  let deck;
  try {
    deck = JSON.parse(fs.readFileSync(deckPath, "utf8"));
  } catch (error) {
    hasError = true;
    console.error(`\n✗ ${relativePath}: geçersiz JSON`);
    console.error(`  - ${error.message}`);
    continue;
  }

  const valid = validateSchema(deck);

  if (!valid) {
    hasError = true;
    console.error(`\n✗ ${relativePath}: schema doğrulaması`);

    for (const error of validateSchema.errors ?? []) {
      const location = pointerToPath(error.instancePath);
      console.error(`  - ${location}: ${error.message}`);
    }
    continue;
  }

  const extraErrors = semanticErrors(deck, deckPath);
  if (extraErrors.length > 0) {
    hasError = true;
    console.error(`\n✗ ${relativePath}: semantik doğrulama`);
    for (const error of extraErrors) {
      console.error(`  - ${error}`);
    }
    continue;
  }

  console.log(`✓ ${relativePath} (${deck.slides.length} slayt)`);
}

if (hasError) {
  console.error("\nDeck doğrulaması başarısız.");
  process.exit(1);
}

console.log(`\nTüm deck'ler geçerli: ${deckPaths.length} sunum.`);
