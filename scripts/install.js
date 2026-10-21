const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");
const serverDir = path.join(root, "server");
const clientDir = path.join(root, "client");

function run(command, cwd) {
  execSync(command, { cwd, stdio: "inherit", shell: true });
}

const major = Number(process.versions.node.split(".")[0]);
if (major < 20) {
  console.error("Se necesita Node.js 20 o superior.");
  process.exit(1);
}

const envPath = path.join(serverDir, ".env");
const examplePath = path.join(serverDir, ".env.example");
if (!fs.existsSync(envPath)) {
  const secret = crypto.randomBytes(32).toString("hex");
  const content = fs
    .readFileSync(examplePath, "utf8")
    .replace("cambia-este-secreto-por-uno-largo-y-aleatorio", secret);
  fs.writeFileSync(envPath, content);
  console.log("Se creó server/.env con un SESSION_SECRET nuevo.");
}

const envText = fs.readFileSync(envPath, "utf8");
if (/DATABASE_URL=.*file:/i.test(envText)) {
  console.error("");
  console.error("La base ahora es PostgreSQL. Actualizá DATABASE_URL en server/.env");
  console.error("- Local con Docker: npm run db:up");
  console.error("- Sin Docker: creá un proyecto gratis en https://neon.tech y pegá la URL");
  console.error("");
  process.exit(1);
}

console.log("Intentando levantar Postgres local (Docker)...");
try {
  run("docker compose up -d", root);
} catch {
  console.warn("Docker no disponible. Usá Neon u otra Postgres en DATABASE_URL.");
}

console.log("Instalando dependencias...");
run("npm install", root);
run("npm install", serverDir);
run("npm install", clientDir);

console.log("Preparando la base de datos...");
try {
  run("npx prisma migrate deploy", serverDir);
  run("npx tsx prisma/seed.ts", serverDir);
} catch {
  console.error("");
  console.error("No se pudo conectar a Postgres. Revisá DATABASE_URL.");
  console.error("Con Docker: npm run db:up");
  console.error("Sin Docker: usá una URL de Neon (gratis) en server/.env");
  console.error("");
  process.exit(1);
}

console.log("");
console.log("Instalación lista.");
console.log("Desarrollo: npm run dev");
console.log("Producción: npm run prod");
console.log("Sitio:       http://localhost:5173");
console.log("Admin:       http://localhost:5173/admin");
console.log("Usuario:     admin");
console.log("Contraseña:  Cambiar123!  (cambiala desde el panel)");
