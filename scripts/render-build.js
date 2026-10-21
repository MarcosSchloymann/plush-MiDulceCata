const { execSync } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");
const serverDir = path.join(root, "server");
const clientDir = path.join(root, "client");

function run(command, cwd, env = process.env) {
  console.log(`\n> ${command}`);
  execSync(command, { cwd, stdio: "inherit", shell: true, env });
}

function withConnectTimeout(url) {
  if (!url) return url;
  const sep = url.includes("?") ? "&" : "?";
  if (/[?&]connect_timeout=/i.test(url)) return url;
  return `${url}${sep}connect_timeout=30`;
}

/** Neon pooler no soporta bien pg_advisory_lock; migrate necesita el host directo. */
function migrateEnv() {
  const env = { ...process.env };
  // Un solo deploy a la vez en Render free; evita P1002 por cold start / lock colgado en Neon.
  env.PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK = "1";

  let url = env.DIRECT_URL || env.DATABASE_URL || "";
  if (env.DIRECT_URL) {
    console.log("prisma migrate deploy usa DIRECT_URL.");
  } else if (/-pooler\./i.test(url)) {
    url = url.replace(/-pooler\./gi, ".");
    console.log("Neon pooler detectado: migrate usa el endpoint directo.");
  }
  env.DATABASE_URL = withConnectTimeout(url);
  return env;
}

function wakeDatabase(env) {
  console.log("\n> Despertando Postgres (Neon cold start)...");
  try {
    execSync("npx prisma db execute --stdin", {
      cwd: serverDir,
      stdio: ["pipe", "inherit", "inherit"],
      shell: true,
      env,
      input: "SELECT 1;\n",
    });
  } catch {
    console.warn("Wake falló; se intenta migrate igual.");
  }
}

function migrateDeploy() {
  const env = migrateEnv();
  wakeDatabase(env);
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      run("npx prisma migrate deploy", serverDir, env);
      return;
    } catch (error) {
      lastError = error;
      if (attempt === 3) break;
      console.warn(`migrate deploy falló (intento ${attempt}/3). Reintento en 8s...`);
      execSync("sleep 8", { stdio: "inherit", shell: true });
      wakeDatabase(env);
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
