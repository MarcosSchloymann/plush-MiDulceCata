const { execSync } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");
const serverDir = path.join(root, "server");
const clientDir = path.join(root, "client");

function run(command, cwd) {
  console.log(`\n> ${command}`);
  execSync(command, { cwd, stdio: "inherit", shell: true, env: process.env });
}

const major = Number(process.versions.node.split(".")[0]);
if (major < 20) {
  console.error("Se necesita Node.js 20 o superior.");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL. Configurala en Render (Neon u otra Postgres).");
  process.exit(1);
}

run("npm install", root);
run("npm install", serverDir);
run("npm install", clientDir);
run("npx prisma generate", serverDir);
run("npx prisma migrate deploy", serverDir);
run("npm run build", clientDir);
run("npm run build", serverDir);

console.log("\nBuild de Render listo.");
