# 🎮 Snake Game - Advanced Arcade Edition

Um jogo Snake moderno e portável para Windows, construído com **Electron**, **HTML5 Canvas** e **JavaScript**. Executável de forma independente sem necessidade de instalação.

## 🌟 Características

### Gameplay
- 🐍 **Menu interativo** com seleção de modos
- 📈 **Sistema de progressão** com dificuldade crescente
- 🎯 **Múltiplos tipos de cobras** com comportamentos diferentes
- 🍎 **Diversos tipos de alimentos** com efeitos variados
- 🗺️ **Mapas dinâmicos** com obstáculos
- ✨ **Efeitos visuais 3D** e tema neon

### Recursos
- 🖥️ **Modo tela cheia** com botão de saída
- 💾 **Salva melhor pontuação** em localStorage
- ⏸️ **Pausa/Retomar** durante o jogo
- 🎨 **Interface de vidro neon** moderna
- 🚀 **Portável** - apenas um executável, sem instalação

## 📋 Requisitos

- **Windows 10/11** (64-bit)
- Nenhuma dependência externa necessária

## 🚀 Como Executar

### Opção 1: Executável Portável (Recomendado)
1. Baixe o arquivo `Snake Game 1.0.0.exe` em `dist/`
2. Clique duas vezes para abrir
3. Desfrute do jogo!

### Opção 2: Compilar do Código Fonte

**Pré-requisitos:**
- Node.js 16+ (https://nodejs.org/)
- npm (vem com Node.js)

**Passos:**
```bash
# 1. Instalar dependências
npm install

# 2. Testar em desenvolvimento
npm start

# 3. Compilar para Windows
npm run build
```

O executável compilado estará em `dist/Snake Game 1.0.0.exe`

## 🎮 Controles

| Tecla | Ação |
|-------|------|
| ⬆️ ⬇️ ⬅️ ➡️ | Mover cobra |
| **SPACE** | Pausar/Retomar |
| **F** | Tela cheia / Normal |
| **ESC** | Sair (tela cheia) |

## 📦 Estrutura do Projeto

```
snake/
├── index.html          # Interface do jogo e canvas
├── style.css           # Estilos (tema neon, responsividade)
├── main.js             # Lógica do jogo (gameplay, colisões, pontuação)
├── electron.js         # Configuração Electron (janela, fullscreen)
├── preload.js          # Bridge de segurança Electron
├── package.json        # Dependências e scripts
├── dist/               # Arquivo executável compilado
└── node_modules/       # Dependências (não versionado)
```

## 🔧 Desenvolvimento

### Adicionar novo tipo de cobra
Edite `main.js` na função `drawSnake()` e adicione variações visuais.

### Modificar dificuldade
Ajuste `gameConfig` em `main.js` para alterar velocidade e progressão.

### Customizar visual
Modifique `style.css` para mudanças de tema e cores.

## 🔐 Segurança

- ✅ Assinado com certificado **NeonSnakeGame**
- ✅ Sem coleta de dados
- ✅ Código-fonte aberto
- ✅ Totalmente desconectado (offline)

## 📊 Tecnologias

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Electron | 29+ | Framework desktop |
| Node.js | 16+ | Runtime |
| HTML5 Canvas | - | Renderização de gráficos |
| Vanilla JS | ES6+ | Lógica do jogo |

## 📝 Notas de Desenvolvimento

- **Desenvolvido por:** GitHub Copilot
- **Data:** 13/08/2026
- **Versão:** 1.0.0
- **Licença:** MIT

### Melhorias Futuras
- [ ] Leaderboard online
- [ ] Sons e música
- [ ] Mais modos de jogo
- [ ] Skins personalizadas
- [ ] Multiplayer local

## 🐛 Relatar Bugs

Se encontrar algum problema, verifique:
1. Windows está atualizado
2. Controle inteligente de aplicativos está desativado
3. Tenha espaço de disco livre

## 🤝 Contribuições

Contribuições são bem-vindas! Faça um fork, crie uma branch e envie um pull request.

---

**Desenvolvido com ❤️ usando Electron e JavaScript puro**

Para mais informações sobre Electron: https://www.electronjs.org/
