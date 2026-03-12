# Auditoria do create-game

Documento para revisão por outro engenheiro sênior. Contém provas objetivas (conteúdo de arquivos, diffs e resultados de comandos) da implementação e do audit do script `create-game`.

---

## 1. Conteúdo completo de `scripts/create-game.js`

```javascript
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const APPS_DIR = path.join(ROOT, "apps");
const TEMPLATE_DIR = path.join(APPS_DIR, "template");

const GAME_NAME_REGEX = /^[a-z][a-z0-9-]*[a-z0-9]$|^[a-z]$/;

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function gameNameToPascal(name) {
  return name
    .split("-")
    .map((part) => capitalize(part))
    .join("");
}

function validateGameName(name) {
  if (!name || typeof name !== "string") {
    console.error("Error: Game name is required.");
    console.error("Usage: pnpm create-game <game-name>");
    console.error("Example: pnpm create-game flappy");
    process.exit(1);
  }
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) {
    console.error("Error: Game name cannot be empty.");
    process.exit(1);
  }
  if (!GAME_NAME_REGEX.test(trimmed)) {
    console.error(
      "Error: Game name must be lowercase, alphanumeric with optional hyphens (e.g. flappy, my-game)."
    );
    process.exit(1);
  }
  return trimmed;
}

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, "utf8");
  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }
  fs.writeFileSync(filePath, content);
}

function walkDir(dir, ext, callback) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "node_modules") {
      walkDir(full, ext, callback);
    } else if (e.isFile() && ext.test(e.name)) {
      callback(full);
    }
  }
}

function main() {
  const gameName = validateGameName(process.argv[2]);
  const appDir = path.join(APPS_DIR, gameName);
  const displayName = capitalize(gameName);
  const pascalName = gameNameToPascal(gameName);

  if (fs.existsSync(appDir)) {
    console.error(`Error: App "apps/${gameName}" already exists.`);
    process.exit(1);
  }

  if (!fs.existsSync(TEMPLATE_DIR)) {
    console.error("Error: apps/template not found.");
    process.exit(1);
  }

  console.log(`Creating app from template: apps/${gameName}`);

  fs.cpSync(TEMPLATE_DIR, appDir, { recursive: true });

  const nodeModulesDir = path.join(appDir, "node_modules");
  if (fs.existsSync(nodeModulesDir)) {
    fs.rmSync(nodeModulesDir, { recursive: true });
  }

  const packagePath = path.join(appDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  pkg.name = `@bitcraft/${gameName}`;
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + "\n");

  const appConfigPath = path.join(appDir, "app.config.ts");
  let appConfig = fs.readFileSync(appConfigPath, "utf8");
  appConfig = appConfig
    .replace(/name: "Bitcraft Template"/, `name: "Bitcraft ${displayName}"`)
    .replace(/slug: "template"/, `slug: "${gameName}"`)
    .replace(/scheme: "bitcraft-template"/, `scheme: "bitcraft-${gameName}"`)
    .replace(
      /bundleIdentifier: "br\.dev\.bitcraft\.template"/,
      `bundleIdentifier: "br.dev.bitcraft.${gameName}"`
    )
    .replace(
      /package: "br\.dev\.bitcraft\.template"/,
      `package: "br.dev.bitcraft.${gameName}"`
    );
  fs.writeFileSync(appConfigPath, appConfig);

  const replacements = [
    ["Template", pascalName],
    ["template", gameName],
  ];

  walkDir(appDir, /\.(ts|tsx)$/, (filePath) => {
    replaceInFile(filePath, replacements);
  });

  const oldProviderPath = path.join(appDir, "src", "TemplateGameProvider.tsx");
  const newProviderPath = path.join(appDir, "src", `${pascalName}GameProvider.tsx`);
  if (fs.existsSync(oldProviderPath)) {
    fs.renameSync(oldProviderPath, newProviderPath);
  }

  console.log("");
  console.log("Created:");
  console.log(`  apps/${gameName}/`);
  console.log(`  package.json  → name: @bitcraft/${gameName}`);
  console.log(`  app.config.ts → slug: ${gameName}, name: Bitcraft ${displayName}`);
  console.log(`  app.config.ts → ios.bundleIdentifier: br.dev.bitcraft.${gameName}`);
  console.log(`  app.config.ts → android.package: br.dev.bitcraft.${gameName}`);
  console.log(`  src/*.ts, app/*.tsx → Template/template → ${pascalName}/${gameName}`);
  console.log(`  src/TemplateGameProvider.tsx → src/${pascalName}GameProvider.tsx`);
  console.log("");
  console.log("Next steps:");
  console.log(`  pnpm install`);
  console.log(`  pnpm --filter @bitcraft/${gameName} start`);
  console.log(`  Or add root scripts: dev:${gameName}, ios:${gameName}, android:${gameName}, web:${gameName}`);
}

main();
```

---

## 2. Diff exato do `package.json` da raiz

Única alteração em relação ao estado anterior (sem create-game):

```diff
   "typecheck": "pnpm -r typecheck",
   "lint": "eslint .",
+  "create-game": "node scripts/create-game.js"
 },
```

Nenhuma outra linha do root `package.json` foi alterada para o create-game.

---

## 3. Conteúdo completo dos arquivos gerados em `apps/flappy`

### apps/flappy/package.json

```json
{
  "name": "@bitcraft/flappy",
  "version": "1.0.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "build:preview": "eas build --platform all --profile preview",
    "build:production": "eas build --platform all --profile production"
  },
  "dependencies": {
    "@bitcraft/analytics": "workspace:*",
    "@bitcraft/app-shell": "workspace:*",
    "@bitcraft/game-core": "workspace:*",
    "@bitcraft/monetization": "workspace:*",
    "@bitcraft/storage": "workspace:*",
    "@react-native-async-storage/async-storage": "2.2.0",
    "babel-preset-expo": "~55.0.8",
    "expo": "^55.0.6",
    "expo-constants": "~55.0.7",
    "expo-linking": "~55.0.7",
    "expo-router": "~55.0.5",
    "expo-status-bar": "~55.0.4",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "react-native": "0.83.2",
    "react-native-safe-area-context": "~5.6.2",
    "react-native-screens": "~4.23.0",
    "react-native-web": "^0.21.0"
  }
}
```

### apps/flappy/app.config.ts

```typescript
import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Bitcraft Flappy",
  slug: "flappy",
  scheme: "bitcraft-flappy",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true,
  },
  ios: {
    bundleIdentifier: "br.dev.bitcraft.flappy",
  },
  android: {
    package: "br.dev.bitcraft.flappy",
  },
};

export default config;
```

---

## 4. Confirmação: identificadores do template substituídos

O script substitui todos os identificadores do template nos arquivos que gera (package.json, app.config.ts e todos os .ts/.tsx em `apps/<game-name>/`), além de renomear o provider.

| Identificador no template | Onde aparece | No app gerado (ex.: flappy) |
|---------------------------|-------------|-----------------------------|
| `@bitcraft/template` | package.json `name` | `@bitcraft/flappy` |
| `br.dev.bitcraft.template` | app.config.ts `ios.bundleIdentifier`, `android.package` | `br.dev.bitcraft.flappy` |
| `slug: "template"` | app.config.ts | `slug: "flappy"` |
| `scheme: "bitcraft-template"` | app.config.ts | `scheme: "bitcraft-flappy"` |
| `name: "Bitcraft Template"` | app.config.ts | `name: "Bitcraft Flappy"` |
| `Template` (tipos, componentes, UI) | src/game.ts, src/TemplateGameProvider.tsx, app/*.tsx | `Flappy` (FlappyState, FlappyGameProvider, "Flappy", etc.) |
| `template` (strings: namespace, storage, analytics, logs) | TemplateGameProvider.tsx, game.ts | `flappy` |
| Arquivo `TemplateGameProvider.tsx` | src/ | Renomeado para `FlappyGameProvider.tsx` |

Prova nos arquivos gerados:

- **apps/flappy/package.json**: `"name": "@bitcraft/flappy"` (não há `template`).
- **apps/flappy/app.config.ts**: `slug: "flappy"`, `name: "Bitcraft Flappy"`, `scheme: "bitcraft-flappy"`, `bundleIdentifier: "br.dev.bitcraft.flappy"`, `package: "br.dev.bitcraft.flappy"` (não há `template` nem `Template`).
- **apps/flappy/src/FlappyGameProvider.tsx**: `createMockAnalyticsProvider("flappy")`, `namespace: "flappy"`, `id: "flappy.premium"`, `title: "Flappy Premium"`, `createAsyncStorageAdapter("flappy")`, `createGameOpenedEvent("flappy", ...)`, `"[flappy] load"`, `"flappy.setup_event"`, tipos `FlappySession`, `FlappySettings`, `FlappyGameProvider`, `useFlappyGame`, `resetFlappy` (não há `template` nem `Template`).
- **apps/flappy/src/game.ts**: `FlappyState`, `FlappySettings`, `FlappySession`, `defaultFlappySettings`, `createFlappySession`, `refreshFlappySession`, `"Flappy ready to customize."` (não há `template` nem `Template`).
- **apps/flappy/app/_layout.tsx**: `FlappyGameProvider`, `"../src/FlappyGameProvider"`, `title: "Flappy"`.
- **apps/flappy/app/index.tsx**: `useFlappyGame`, `FlappyHomeScreen`, `resetFlappy`, `title="Flappy"`, `"Loading flappy configuration..."`.
- **apps/flappy/app/settings.tsx**: `useFlappyGame`, `FlappySettingsScreen`, `title="Flappy settings"`, `"flappy-specific setting"`, `"The flappy already includes..."`.

**Conclusão:** O script substitui todos os identificadores do template (incluindo `@bitcraft/template`, `br.dev.bitcraft.template`, `template` e `Template`) nos arquivos que ele cria/altera.

---

## 5. Execução e resultado do export

Comando executado:

```bash
pnpm --filter @bitcraft/flappy exec expo export --platform web
```

Saída:

```
undefined
/Users/fernandomuniz/Workspace/Bitcraft/apps/flappy:
 ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command "expo" not found
```

Motivo: o create-game remove `node_modules` do app gerado; sem `pnpm install` (ou `pnpm install --no-frozen-lockfile` quando o lockfile ainda não tem o novo app), o pacote `expo` não está disponível no contexto do filtro `@bitcraft/flappy`, então o comando `expo` não é encontrado.

Em seguida foi executado:

```bash
pnpm install --no-frozen-lockfile
```

Resultado: falha por restrição do ambiente (EPERM ao criar diretório em `node_modules/.pnpm/...`), não por erro do create-game.

**Conclusão para o export:**

- O script está correto: ele avisa “Next steps: pnpm install” e não instala dependências.
- Para o export funcionar, é necessário:
  1. `pnpm install --no-frozen-lockfile` (para incluir o novo app no lockfile e instalar deps),
  2. Depois: `pnpm --filter @bitcraft/flappy exec expo export --platform web`.

Não foi possível rodar o export até o fim neste ambiente; o comportamento esperado após um `pnpm install` completo é que o comando acima execute o export web para `@bitcraft/flappy`.

---

## 6. Ajuste feito no script (identificadores em src e app)

**Problema encontrado na auditoria:** O script original só alterava `package.json` e `app.config.ts`. Em `apps/flappy` gerado por essa versão ainda apareciam:

- `template` / `Template` em `src/TemplateGameProvider.tsx`, `src/game.ts`, `app/_layout.tsx`, `app/index.tsx`, `app/settings.tsx`
- Arquivo `TemplateGameProvider.tsx` não renomeado

**Correção aplicada no script** (já incorporada no código da seção 1):

1. **Substituição em todos os `.ts` e `.tsx`** do app gerado:
   - `Template` → `pascalName` (ex.: `Flappy`)
   - `template` → `gameName` (ex.: `flappy`)
2. **Renomear** `src/TemplateGameProvider.tsx` → `src/${pascalName}GameProvider.tsx` (ex.: `FlappyGameProvider.tsx`).
3. **Helpers adicionados:** `gameNameToPascal()` (ex.: `my-game` → `MyGame`), `replaceInFile()`, `walkDir()`.

Com isso, o app gerado (por exemplo `apps/flappy`) fica sem nenhum identificador `template`/`Template` nos arquivos que o script toca e com o provider renomeado corretamente.

---

## Checklist para o revisor

- [ ] Revisar lógica e segurança do `scripts/create-game.js` (validação, caminhos, substituições).
- [ ] Confirmar que o diff do root `package.json` está correto e mínimo.
- [ ] Validar que os exemplos de arquivos gerados (package.json, app.config.ts) estão consistentes com o template e com o nome do jogo.
- [ ] Verificar a tabela de identificadores (seção 4) contra o código do template em `apps/template/`.
- [ ] Avaliar o resultado do export (seção 5) e a necessidade de `pnpm install` após create-game.
- [ ] Revisar o ajuste da seção 6 (substituição em src/app e rename do provider) e possíveis edge cases (ex.: `game-name` com hífen → PascalCase).
