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
const validate = ajv.compile(schema);

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
  return result;
}

function pointerToPath(pointer = "") {
  if (!pointer) return "(deck)";
  return pointer
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.replaceAll("~1", "/").replaceAll("~0", "~"))
    .join(".");
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
    console.error(error.message);
    continue;
  }

  const valid = validate(deck);

  if (!valid) {
    hasError = true;
    console.error(`\n✗ ${relativePath}`);

    for (const error of validate.errors ?? []) {
      const location = pointerToPath(error.instancePath);
      console.error(`  - ${location}: ${error.message}`);
    }
    continue;
  }

  const slideIds = deck.slides.map((slide) => slide.id);
  const duplicateIds = slideIds.filter(
    (id, index) => slideIds.indexOf(id) !== index
  );

  if (duplicateIds.length > 0) {
    hasError = true;
    console.error(`\n✗ ${relativePath}`);
    console.error(
      `  - Tekrarlanan slide id: ${[...new Set(duplicateIds)].join(", ")}`
    );
    continue;
  }

  const folderId = path.basename(path.dirname(deckPath));
  if (deck.id !== folderId) {
    hasError = true;
    console.error(`\n✗ ${relativePath}`);
    console.error(
      `  - deck.id ("${deck.id}") klasör adıyla ("${folderId}") aynı olmalı.`
    );
    continue;
  }

  console.log(`✓ ${relativePath} (${deck.slides.length} slayt)`);
}

if (hasError) {
  console.error("\nDeck doğrulaması başarısız.");
  process.exit(1);
}

console.log(`\nTüm deck'ler geçerli: ${deckPaths.length} sunum.`);
