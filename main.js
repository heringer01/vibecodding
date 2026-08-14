const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const starField = Array.from({ length: 48 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 1 + Math.random() * 2,
    alpha: 0.4 + Math.random() * 0.6
}));

const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const levelEl = document.getElementById('level');
const statusEl = document.getElementById('statusText');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const menuScreen = document.getElementById('menuScreen');
const gameOver = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const playBtn = document.getElementById('playBtn');
const restartBtn = document.getElementById('restartBtn');

const snakeVariants = {
    classic: {
        name: 'Classic',
        head: '#dffef3',
        body: '#4bf2b0',
        accent: '#17d68f',
        preference: 'normal'
    },
    blaze: {
        name: 'Blaze',
        head: '#fff2d4',
        body: '#ffb648',
        accent: '#ff7b54',
        preference: 'ember'
    },
    shadow: {
        name: 'Shadow',
        head: '#f1ebff',
        body: '#b492ff',
        accent: '#7e61ff',
        preference: 'void'
    },
    titan: {
        name: 'Titan',
        head: '#dff8ff',
        body: '#6be6ff',
        accent: '#22a8d5',
        preference: 'crystal'
    }
};

const foodTypes = {
    normal: { color: '#ff5d7a', points: 10, label: 'Normal' },
    boost: { color: '#ffc857', points: 20, label: 'Boost' },
    shield: { color: '#69d2e7', points: 15, label: 'Shield' },
    gold: { color: '#ffe66d', points: 30, label: 'Gold' },
    ember: { color: '#ff8a3d', points: 18, label: 'Ember' },
    void: { color: '#9d7dff', points: 24, label: 'Void' },
    crystal: { color: '#7af5ff', points: 19, label: 'Crystal' }
};

const maps = [
    {
        name: 'Neon Garden',
        spawn: [{ x: 4, y: 10 }, { x: 3, y: 10 }, { x: 2, y: 10 }],
        walls: [
            [8, 5], [9, 5], [10, 5], [11, 5],
            [14, 14], [15, 14], [16, 14],
            [6, 16], [7, 16], [8, 16], [9, 16]
        ]
    },
    {
        name: 'Circuit Run',
        spawn: [{ x: 5, y: 11 }, { x: 4, y: 11 }, { x: 3, y: 11 }],
        walls: [
            [7, 3], [7, 4], [7, 5], [7, 6], [7, 7],
            [15, 3], [15, 4], [15, 5], [15, 6], [15, 7],
            [7, 15], [8, 15], [9, 15], [10, 15], [11, 15],
            [14, 15], [15, 15], [16, 15]
        ]
    },
    {
        name: 'Pulse Maze',
        spawn: [{ x: 3, y: 9 }, { x: 2, y: 9 }, { x: 1, y: 9 }],
        walls: [
            [5, 4], [5, 5], [5, 6], [5, 7], [5, 8], [5, 9],
            [9, 4], [10, 4], [11, 4], [12, 4], [13, 4],
            [15, 9], [15, 10], [15, 11], [15, 12], [15, 13],
            [11, 16], [12, 16], [13, 16], [14, 16], [15, 16]
        ]
    },
    {
        name: 'Solar Grid',
        spawn: [{ x: 4, y: 12 }, { x: 3, y: 12 }, { x: 2, y: 12 }],
        walls: [
            [10, 2], [10, 3], [10, 4], [10, 5], [10, 6],
            [4, 9], [5, 9], [6, 9], [7, 9], [8, 9],
            [13, 9], [14, 9], [15, 9], [16, 9], [17, 9],
            [10, 14], [10, 15], [10, 16], [10, 17], [10, 18]
        ]
    }
];

const state = {
    phase: 'menu',
    snake: [],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: null,
    walls: [],
    score: 0,
    best: Number(localStorage.getItem('bestScore') || 0),
    level: 1,
    levelTarget: 80,
    gameSpeed: 180,
    gameLoop: null,
    selectedSnake: 'classic',
    selectedMode: 'classic',
    boostTimer: 0,
    shield: 0,
    mapIndex: 0,
    multiplier: 1,
    status: 'Mapa 1 · Neon Garden',
    levelTransition: false,
    transitionTimer: 0
};

function resizeCanvas() {
    const maxSize = Math.min(window.innerWidth - 70, window.innerHeight - 220, 920);
    const size = Math.max(420, maxSize);
    canvas.width = size;
    canvas.height = size;
    draw();
}

function updateHUD() {
    scoreEl.textContent = state.score;
    bestEl.textContent = state.best;
    levelEl.textContent = state.level;
    statusEl.textContent = state.status;
}

function setStatus(text) {
    state.status = text;
    statusEl.textContent = text;
}

function syncSelectedSnakeButtons() {
    document.querySelectorAll('.snake-option').forEach((button) => {
        button.classList.toggle('active', button.dataset.snake === state.selectedSnake);
    });
}

function getMap(levelNumber) {
    const index = (levelNumber - 1) % maps.length;
    return { index, map: maps[index] };
}

function loadMap(levelNumber) {
    const { index, map } = getMap(levelNumber);
    state.mapIndex = index;
    state.level = levelNumber;
    state.walls = map.walls.map(([x, y]) => ({ x, y }));
    state.snake = map.spawn.map((segment) => ({ ...segment }));
    state.direction = { x: 1, y: 0 };
    state.nextDirection = { x: 1, y: 0 };
    state.status = `Mapa ${levelNumber} · ${map.name}`;
    state.boostTimer = 0;
    state.shield = 0;
    state.multiplier = 1 + Math.floor((levelNumber - 1) / 2) * 0.25;
    state.levelTransition = true;
    state.transitionTimer = 120; // 2 segundos de pausa
    generateFood();
    updateHUD();
    draw();
}

function pickFoodType() {
    const preferred = snakeVariants[state.selectedSnake].preference;
    const roll = Math.random();

    if (preferred === 'ember' && roll < 0.5) return 'ember';
    if (preferred === 'void' && roll < 0.5) return 'void';
    if (preferred === 'crystal' && roll < 0.5) return 'crystal';

    if (state.level >= 4 && roll < 0.18) return 'gold';
    if (state.level >= 2 && roll < 0.28) return 'boost';
    if (state.level >= 2 && roll < 0.42) return 'shield';
    return 'normal';
}

function generateFood() {
    const occupied = new Set(state.snake.map((segment) => `${segment.x},${segment.y}`));
    state.walls.forEach((wall) => occupied.add(`${wall.x},${wall.y}`));

    const cells = [];
    for (let y = 0; y < 20; y += 1) {
        for (let x = 0; x < 20; x += 1) {
            const key = `${x},${y}`;
            if (!occupied.has(key)) cells.push({ x, y });
        }
    }

    if (!cells.length) {
        state.food = null;
        return;
    }

    const { x, y } = cells[Math.floor(Math.random() * cells.length)];
    state.food = {
        x,
        y,
        type: pickFoodType()
    };
}

function restartLoop() {
    clearInterval(state.gameLoop);
    state.gameLoop = setInterval(update, state.gameSpeed);
}

function startGame() {
    if (state.phase === 'running') return;

    state.phase = 'running';
    state.score = 0;
    state.level = 1;
    state.levelTarget = 80;
    state.gameSpeed = 180;
    state.boostTimer = 0;
    state.shield = 0;
    state.multiplier = 1;
    state.levelTransition = false;
    state.transitionTimer = 0;
    menuScreen.style.display = 'none';
    gameOver.style.display = 'none';
    pauseBtn.disabled = false;
    pauseBtn.textContent = 'Pausar';
    loadMap(1);
    restartLoop();
}

function finishRun() {
    state.phase = 'gameover';
    clearInterval(state.gameLoop);
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pausar';

    if (state.score > state.best) {
        state.best = state.score;
        localStorage.setItem('bestScore', state.best);
    }

    bestEl.textContent = state.best;
    finalScoreEl.textContent = state.score;
    gameOver.style.display = 'flex';
}

function getBonusMultiplier() {
    return state.multiplier || 1;
}

function updateSpeed() {
    const scoreFactor = Math.floor(state.score / 50) * 10;
    const levelFactor = (state.level - 1) * 18;
    const nextSpeed = Math.max(72, 180 - scoreFactor - levelFactor);
    if (nextSpeed !== state.gameSpeed) {
        state.gameSpeed = nextSpeed;
        restartLoop();
    }
}

function handleFoodPickup() {
    const reward = foodTypes[state.food.type];
    let currentGain = reward.points * getBonusMultiplier();

    if (state.selectedSnake === 'blaze' && state.food.type === 'ember') {
        currentGain += 8;
    }
    if (state.selectedSnake === 'shadow' && state.food.type === 'void') {
        currentGain += 10;
    }
    if (state.selectedSnake === 'titan' && state.food.type === 'crystal') {
        currentGain += 7;
        state.shield += 1;
    }

    state.score += Math.round(currentGain);

    if (state.food.type === 'boost') {
        state.boostTimer = 14;
        state.gameSpeed = Math.max(72, state.gameSpeed - 16);
        setStatus('Boost ativo · velocidade aumentada');
    }

    if (state.food.type === 'shield') {
        state.shield += 1;
        setStatus('Escudo ganho · 1 proteção');
    }

    if (state.food.type === 'gold') {
        state.score += 15;
        setStatus('Gold bonus · +15 extra');
    }

    if (state.food.type === 'ember' && state.selectedSnake === 'blaze') {
        state.score += 10;
        setStatus('Fúria do Blaze · +10');
    }

    if (state.food.type === 'void' && state.selectedSnake === 'shadow') {
        state.score += 12;
        setStatus('Manto do Shadow · +12');
    }

    if (state.score >= state.levelTarget) {
        state.level += 1;
        state.levelTarget += 90;
        loadMap(state.level);
        setStatus(`Nível ${state.level} · ${maps[(state.level - 1) % maps.length].name}`);
        return;
    }

    generateFood();
    updateHUD();
    updateSpeed();
}

function update() {
    if (state.phase !== 'running') return;

    // Pausa durante transição de nível - evita que cobra bata
    if (state.levelTransition) {
        state.transitionTimer -= 1;
        if (state.transitionTimer <= 0) {
            state.levelTransition = false;
        }
        return;
    }

    if (state.boostTimer > 0) {
        state.boostTimer -= 1;
        if (state.boostTimer === 0) {
            setStatus(`Mapa ${state.level} · ${maps[(state.level - 1) % maps.length].name}`);
        }
    }

    state.direction = state.nextDirection;
    const head = {
        x: state.snake[0].x + state.direction.x,
        y: state.snake[0].y + state.direction.y
    };

    const outOfBounds = head.x < 0 || head.y < 0 || head.x >= 20 || head.y >= 20;
    const hitBody = state.snake.some((segment) => segment.x === head.x && segment.y === head.y);
    const hitWall = state.walls.some((wall) => wall.x === head.x && wall.y === head.y);

    if (outOfBounds || hitBody || hitWall) {
        if (state.shield > 0) {
            state.shield -= 1;
            setStatus('Escudo absorveu um impacto');
            state.snake.pop();
            return;
        }
        finishRun();
        return;
    }

    state.snake.unshift(head);

    if (state.food && head.x === state.food.x && head.y === state.food.y) {
        handleFoodPickup();
    } else {
        state.snake.pop();
    }

    updateHUD();
    draw();
}

function drawGrid() {
    const size = canvas.width;
    const cell = size / 20;

    ctx.strokeStyle = 'rgba(116, 160, 210, 0.12)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 20; i += 1) {
        const pos = i * cell;
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, size);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(size, pos);
        ctx.stroke();
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#040b17');
    gradient.addColorStop(0.5, '#0b1630');
    gradient.addColorStop(1, '#091018');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const glow = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.35, 10, canvas.width * 0.5, canvas.height * 0.35, canvas.width * 0.7);
    glow.addColorStop(0, 'rgba(88, 214, 255, 0.24)');
    glow.addColorStop(0.45, 'rgba(68, 170, 255, 0.08)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    starField.forEach((star) => {
        ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
        ctx.fillRect(star.x * canvas.width, star.y * canvas.height, star.r, star.r);
    });

    drawGrid();
}

function drawWalls() {
    const cell = canvas.width / 20;
    state.walls.forEach((wall) => {
        const x = wall.x * cell + 2;
        const y = wall.y * cell + 2;
        const w = cell - 4;
        const h = cell - 4;

        ctx.fillStyle = '#18324d';
        ctx.fillRect(x, y, w, h);

        ctx.fillStyle = '#2a5d88';
        ctx.fillRect(x + 2, y + 2, w - 4, h - 4);

        ctx.strokeStyle = 'rgba(120, 225, 255, 0.7)';
        ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);

        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x + 4, y + 4, w * 0.25, h * 0.25);
    });
}

function drawFood() {
    if (!state.food) return;

    const type = foodTypes[state.food.type];
    const cell = canvas.width / 20;
    const x = state.food.x * cell + cell / 2;
    const y = state.food.y * cell + cell / 2;
    const radius = cell * 0.32;

    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.6);
    glow.addColorStop(0, '#ffffff');
    glow.addColorStop(0.18, type.color);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = type.color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.arc(x - radius * 0.22, y - radius * 0.22, radius * 0.26, 0, Math.PI * 2);
    ctx.fill();
}

function drawSnake() {
    const cell = canvas.width / 20;
    const style = snakeVariants[state.selectedSnake];

    state.snake.forEach((segment, index) => {
        const x = segment.x * cell + 2;
        const y = segment.y * cell + 2;
        const w = cell - 4;
        const h = cell - 4;

        ctx.fillStyle = index === 0 ? style.head : style.body;
        ctx.shadowColor = index === 0 ? style.accent : style.body;
        ctx.shadowBlur = index === 0 ? 18 : 12;
        ctx.fillRect(x, y, w, h);

        ctx.fillStyle = index === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)';
        ctx.fillRect(x + 2, y + 2, w * 0.5, h * 0.28);

        if (index === 0) {
            ctx.fillStyle = '#061824';
            const eyeSize = Math.max(2, cell * 0.08);
            ctx.fillRect(x + cell * 0.24, y + cell * 0.22, eyeSize, eyeSize);
            ctx.fillRect(x + cell * 0.57, y + cell * 0.22, eyeSize, eyeSize);
        }
    });

    ctx.shadowBlur = 0;
}

function drawShield() {
    if (state.shield <= 0) return;

    ctx.fillStyle = 'rgba(105, 210, 231, 0.3)';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`ESCUDO x${state.shield}`, 20, canvas.height - 20);
}

function draw() {
    drawBackground();
    drawWalls();
    drawFood();
    drawSnake();
    drawShield();

    // Visual de transição de nível
    if (state.levelTransition) {
        const progress = 1 - (state.transitionTimer / 120);
        const opacity = Math.sin(progress * Math.PI) * 0.8;

        ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.5})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = `bold ${canvas.width * 0.15}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.strokeStyle = `rgba(75, 242, 176, ${opacity})`;
        ctx.lineWidth = 3;

        const text = `NÍVEL ${state.level}`;
        ctx.strokeText(text, canvas.width * 0.5, canvas.height * 0.4);
        ctx.fillText(text, canvas.width * 0.5, canvas.height * 0.4);

        ctx.font = `${canvas.width * 0.05}px Arial`;
        ctx.fillStyle = `rgba(200, 200, 200, ${opacity * 0.7})`;
        ctx.fillText(maps[(state.level - 1) % maps.length].name, canvas.width * 0.5, canvas.height * 0.6);
    }
}

function togglePause() {
    if (state.phase !== 'running' && state.phase !== 'paused') return;

    if (state.phase === 'running') {
        state.phase = 'paused';
        pauseBtn.textContent = 'Retomar';
        setStatus('Jogo pausado');
    } else {
        state.phase = 'running';
        pauseBtn.textContent = 'Pausar';
        setStatus(`Mapa ${state.level} · ${maps[(state.level - 1) % maps.length].name}`);
    }
}

function handleKeydown(event) {
    const key = event.key;

    if (key === 'Enter' && state.phase === 'menu') {
        startGame();
        return;
    }

    if (key === ' ' && (state.phase === 'running' || state.phase === 'paused')) {
        event.preventDefault();
        togglePause();
        return;
    }

    if (state.phase !== 'running') return;

    const moves = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 }
    };

    const next = moves[key.toLowerCase()] || moves[key];
    if (!next) return;

    const notReverse = !(next.x === -state.direction.x && next.y === -state.direction.y);
    if (notReverse) {
        state.nextDirection = next;
    }
    event.preventDefault();
}

function toggleFullScreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen?.();
        fullscreenBtn.textContent = 'Tela cheia';
        return;
    }

    if (window.electronAPI && typeof window.electronAPI.toggleFullscreen === 'function') {
        window.electronAPI.toggleFullscreen();
        fullscreenBtn.textContent = 'Sair da tela cheia';
        return;
    }

    document.documentElement.requestFullscreen?.();
    fullscreenBtn.textContent = 'Sair da tela cheia';
}

document.addEventListener('fullscreenchange', () => {
    fullscreenBtn.textContent = document.fullscreenElement ? 'Sair da tela cheia' : 'Tela cheia';
});

// Tooltips dos modos
document.querySelectorAll('.mode-option').forEach((button) => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.mode-option').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        state.selectedMode = button.dataset.mode;
    });
    
    button.addEventListener('mouseenter', (e) => {
        const tooltip = document.getElementById('modeTooltip');
        tooltip.textContent = button.title;
        tooltip.style.display = 'block';
        const rect = button.getBoundingClientRect();
        tooltip.style.top = (rect.bottom + 8) + 'px';
        tooltip.style.left = (rect.left + rect.width / 2 - 100) + 'px';
    });
    
    button.addEventListener('mouseleave', () => {
        document.getElementById('modeTooltip').style.display = 'none';
    });
});

document.querySelectorAll('.snake-option').forEach((button) => {
    button.addEventListener('click', () => {
        state.selectedSnake = button.dataset.snake;
        syncSelectedSnakeButtons();
    });
});

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
playBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
fullscreenBtn.addEventListener('click', toggleFullScreen);
document.addEventListener('keydown', handleKeydown);
window.addEventListener('resize', resizeCanvas);

bestEl.textContent = state.best;
updateHUD();
syncSelectedSnakeButtons();
resizeCanvas();
draw();
