const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// CARPETAS
const lessonsDir = path.join(__dirname, "public", "lessons");
const folders = ["beginner", "intermediate", "advanced"];

const ID_LENGTH = 10;

// Generador NanoID simple
const generateNanoId = (size) => {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const bytes = crypto.randomBytes(size);
  let id = "";
  for (let i = 0; i < size; i++) {
    id += alphabet[bytes[i] % alphabet.length];
  }
  return id;
};

console.log("🚀 Iniciando generación de IDs por frase...");

folders.forEach((folder) => {
  const currentDir = path.join(lessonsDir, folder);

  if (!fs.existsSync(currentDir)) {
    console.warn(`⚠️ La carpeta ${folder} no existe, saltando...`);
    return;
  }

  const files = fs.readdirSync(currentDir);

  files.forEach((file) => {
    if (path.extname(file) === ".json") {
      const filePath = path.join(currentDir, file);
      try {
        const rawData = fs.readFileSync(filePath, "utf8");
        let jsonData = JSON.parse(rawData);
        let modified = false;

        // 👉 AÑADIR ID A CADA FRASE
        if (jsonData.sentences && Array.isArray(jsonData.sentences)) {
          jsonData.sentences = jsonData.sentences.map((obj) => {
            if (!obj.id) {
              obj.id = generateNanoId(ID_LENGTH);
              modified = true;
            }
            return obj;
          });
        }

        if (modified) {
          fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf8");
          console.log(`✅ IDs añadidos en frases: ${folder}/${file}`);
        } else {
          console.log(`- Sin cambios: ${folder}/${file}`);
        }
      } catch (error) {
        console.error(`❌ Error procesando ${file}:`, error.message);
      }
    }
  });
});

console.log("✨ Proceso completado.");
