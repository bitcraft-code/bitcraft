# 📦 Setup do Repositório Remoto - Bitcraft

Este documento guia você passo a passo para colocar o código do Bitcraft no GitHub e começar a criar jogos.

---

## ✅ Pré-requisitos

1. **Conta no GitHub** com acesso à organização `Bitcraft` (ou sua conta pessoal)
2. **Git instalado** na máquina
3. **Node.js + pnpm** já configurados (verifique com `node -v` e `pnpm -v`)

---

## 🚀 Passo a Passo

### 1️⃣ Criar Repositório no GitHub

1. Acesse https://github.com/new
2. **Nome do repositório:** `bitcraft` (ou `mobile-games`, `game-factory`, etc.)
3. **Owner:** Selecione sua conta/organização `Bitcraft`
4. **Visibilidade:** 
   - 🔒 **Private** (recomendado para projetos em desenvolvimento)
   - 🌍 **Public** (se quiser open source)
5. **NÃO marque** "Initialize this repository with a README" (deixe vazio)
6. Clique em **Create repository**

Anote a URL do repositório, exemplo:
```
https://github.com/Bitcraft/bitcraft.git
# ou
git@github.com:Bitcraft/bitcraft.git
```

---

### 2️⃣ Inicializar Git Localmente

No terminal, na raiz do projeto (`/Users/fernandomuniz/Workspace/Bitcraft`):

```bash
# Inicializar repositório git
git init

# Configurar usuário (se não tiver configurado globalmente)
git config user.name "Seu Nome"
git config user.email "seu.email@bitcraft.com"
```

---

### 3️⃣ Criar .gitignore (se necessário)

O repositório já possui `.gitignore`. Verifique o conteúdo:

```bash
cat .gitignore
```

Deve incluir:
- `node_modules/`
- `.env*`
- `dist/`
- `build/`
- `.expo/`
- `*.log`
- `.DS_Store`

---

### 4️⃣ Adicionar Remote

```bash
# Adicionar remote (substitua pela SUA URL do GitHub)
git remote add origin https://github.com/Bitcraft/bitcraft.git

# Verificar se foi adicionado corretamente
git remote -v
```

**Saída esperada:**
```
origin  https://github.com/Bitcraft/bitcraft.git (fetch)
origin  https://github.com/Bitcraft/bitcraft.git (push)
```

---

### 5️⃣ Fazer Primeiro Commit

```bash
# Adicionar todos os arquivos
git add .

# Verificar o que será commitado
git status

# Fazer o commit inicial
git commit -m "feat: initial commit - Bitcraft game factory platform

- Monorepo structure with pnpm workspaces
- Shared packages: analytics, app-shell, game-core, monetization, storage, ui
- Template apps: snake, tictactoe, flappy, template
- Genre templates: arcade, puzzle, runner
- CLI scripts: create-game, create-games, generate-aso-keywords, etc.
- Documentation: architecture audits, AI spec, human guide
- Validation pipeline: typecheck, lint, expo config, web export"
```

---

### 6️⃣ Push para o Remote

```bash
# Definir branch principal como main
git branch -M main

# Enviar para o GitHub
git push -u origin main
```

**Se pedir autenticação:**
- Use **Personal Access Token** (GitHub Settings → Developer settings → Personal access tokens)
- Ou configure **SSH** (recomendado):
  ```bash
  # Gerar chave SSH (se não tiver)
  ssh-keygen -t ed25519 -C "seu.email@bitcraft.com"
  
  # Adicionar chave ao GitHub (GitHub Settings → SSH and GPG keys)
  cat ~/.ssh/id_ed25519.pub
  
  # Trocar remote para SSH
  git remote set-url origin git@github.com:Bitcraft/bitcraft.git
  ```

---

### 7️⃣ Verificar no GitHub

1. Acesse o repositório no GitHub
2. Confirme que os arquivos apareceram
3. Verifique a estrutura de pastas:
   - ✅ `apps/`
   - ✅ `packages/`
   - ✅ `scripts/`
   - ✅ `templates/`
   - ✅ `docs/`
   - ✅ `package.json`
   - ✅ `pnpm-workspace.yaml`

---

## 🎮 Próximos Passos: Começar a Criar Jogos

### Opção A: Gerar um Novo Jogo

```bash
# Da raiz do repositório (após git push)
pnpm install

# Criar um jogo de arcade
pnpm create-game my-arcade-game --genre arcade

# Ou criar um jogo minimalista
pnpm create-game my-simple-game --minimal
```

### Opção B: Desenvolver um Jogo Existente

```bash
# Instalar dependências
pnpm install

# Iniciar desenvolvimento do snake
pnpm dev:snake

# Ou tictactoe
pnpm dev:tictactoe
```

---

## 🔄 Workflow de Desenvolvimento

```bash
# 1. Criar branch para nova feature/jogo
git checkout -b feature/novo-jogo-arcade

# 2. Desenvolver...

# 3. Validar mudanças
pnpm validate:all
pnpm lint:architecture

# 4. Commitar
git add .
git commit -m "feat: adiciona novo jogo arcade"

# 5. Push
git push origin feature/novo-jogo-arcade

# 6. Criar Pull Request no GitHub
```

---

## 📋 Checklist de Validação

- [ ] Repositório criado no GitHub
- [ ] Git inicializado localmente (`git init`)
- [ ] Remote adicionado (`git remote add origin ...`)
- [ ] Primeiro commit feito
- [ ] Push realizado com sucesso
- [ ] Arquivos visíveis no GitHub
- [ ] `pnpm install` funciona após clone
- [ ] `pnpm create-game` funciona

---

## 🛠️ Comandos Úteis

```bash
# Listar jogos existentes
pnpm list:games

# Validar todo o projeto
pnpm validate:all

# Check de saúde do repositório
pnpm doctor

# Dashboard de analytics
pnpm dashboard
```

---

## 📚 Documentação de Referência

- **Guia para desenvolvedores:** `docs/instructions/game-factory-human-guide.md`
- **Spec para AI agents:** `docs/instructions/game-factory-ai-spec.md`
- **Auditoria de arquitetura:** `docs/audits/`

---

## ⚠️ Troubleshooting

### "Permission denied (publickey)"
```bash
# Configurar SSH novamente
ssh -T git@github.com
```

### "fatal: remote origin already exists"
```bash
git remote remove origin
git remote add origin <nova-url>
```

### "pnpm: command not found"
```bash
npm install -g pnpm
```

---

**Pronto!** 🎉 Seu repositório está no GitHub e pronto para começar a criar jogos.
