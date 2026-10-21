const { spawn } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");
const serverDir = path.join(root, "server");

function run(command, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, { cwd, stdio: "inherit", shell: true });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(command))));
  });
}

async function main() {
  console.log("Compilando cliente y servidor...");
  await run("npm run build", root);
  await run("npx prisma migrate deploy", serverDir);
  console.log("Iniciando en http://localhost:4000");
  const child = spawn("node dist/index.js", {
    cwd: serverDir,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, NODE_ENV: "production" },
  });
  child.on("exit", (code) => process.exit(code ?? 0));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
