const { execSync } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");
const serverDir = path.join(root, "server");
const clientDir = path.join(root, "client");

function run(command, cwd, env = process.env) {
  console.log(`\n> ${command}`);
  execSync(command, { cwd, stdio: "inherit", shell: true, env });
}

/** Neon pooler no soporta bien pg_advisory_lock; migrate necesita el host directo. */
function migrateEnv() {
  const env = { ...process.env };
  const url = env.DIRECT_URL || env.DATABASE_URL || "";
  if (env.DIRECT_URL) {
    env.DATABASE_URL = env.DIRECT_URL;
    console.log("prisma migrate deploy usa DIRECT_URL.");
    return env;
  }
  if (/-pooler\./i.test(url)) {
    env.DATABASE_URL = url.replace(/-pooler\./gi, ".");
    console.log("Neon pooler detectado: migrate usa el endpoint directo.");
  }
  return env;
}

function migrateDeploy() {
  const env = migrateEnv();
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      run("npx prisma migrate deploy", serverDir, env);
      return;
    } catch (error) {
      lastError = error;
      if (attempt === 3) break;
      console.warn(`migrate deploy falló (intento ${attempt}/3). Reintento en 5s...`);
      execSync("sleep 5", { stdio: "inherit", shell: true });
    }
  }
  throw lastError;
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
migrateDeploy();
run("npm run build", clientDir);
run("npm run build", serverDir);

console.log("\nBuild de Render listo.");
