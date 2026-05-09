// 游戏状态管理
const gameState = {
    currentPage: 'home',
    isPlaying: false,
    score: 0,
    player: {
        x: 0,
        y: 0,
        width: 40,
        height: 40,
        speed: 5,
        originalSpeed: 5, // 记录原始速度
        color: '#e94560',
        direction: 0, // 0:下, 1:上, 2:左, 3:右
        isAttacking: false,
        attackCooldown: 0,
        originalAttackCooldown: 20, // 记录原始攻击冷却
        speedDebuff: 0, // 速度减益计时器
        attackDebuff: 0 // 攻击减益计时器
    },
    enemies: [],
    collectibles: [],
    projectiles: [],
    enemyWaves: [], // 敌人声波
    gameLoop: null,
    totalGames: 0,
    highScore: 0,
    totalTime: 0,
    totalScore: 0,
    startTime: 0,
    timeLimit: 150, // 2分30秒 = 150秒
    timeRemaining: 150,
    mouseX: 0,
    mouseY: 0,
    moveUp: false,
    moveDown: false,
    moveLeft: false,
    moveRight: false,
    joystickActive: false,
    joystickX: 0,
    joystickY: 0
};

// 页面切换函数
function showPage(pageId) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 显示目标页面
    document.getElementById(pageId).classList.add('active');
    gameState.currentPage = pageId;
    
    // 如果切换到数据页面，更新数据显示
    if (pageId === 'data') {
        updateDataDisplay();
    }
    
    // 如果离开游戏页面，停止游戏
    if (pageId !== 'start' && gameState.isPlaying) {
        stopGame();
    }
}

// 游戏初始化
function initGame() {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置玩家初始位置在右下角
    gameState.player.x = canvas.width - gameState.player.width - 20;
    gameState.player.y = canvas.height - gameState.player.height - 20;
    
    // 清空敌人和收集物
    gameState.enemies = [];
    gameState.collectibles = [];
    
    // 生成初始敌人和收集物
    spawnEnemies(5);
    spawnCollectibles(3);
    
    // 重置分数
    gameState.score = 0;
    
    // 记录游戏开始时间
    gameState.startTime = Date.now();
}

// 开始游戏
function startGame() {
    if (gameState.isPlaying) return;
    
    gameState.isPlaying = true;
    gameState.totalGames++;
    
    initGame();
    
    // 重置时间
    gameState.timeRemaining = gameState.timeLimit;
    
    // 获取选择的难度
    const difficulty = document.getElementById('difficulty-select').value;
    
    // 根据难度调整游戏参数
    switch(difficulty) {
        case 'easy':
            gameState.player.speed = 7;
            break;
        case 'normal':
            gameState.player.speed = 5;
            break;
        case 'hard':
            gameState.player.speed = 3;
            break;
    }
    
    // 获取选择的角色
    const character = document.getElementById('character-select').value;
    
    // 根据角色调整玩家颜色
    switch(character) {
        case 'warrior':
            gameState.player.color = '#e94560';
            break;
        case 'mage':
            gameState.player.color = '#533483';
            break;
        case 'rogue':
            gameState.player.color = '#0f3460';
            break;
    }
    
    // 开始游戏循环
    gameState.gameLoop = setInterval(gameLoop, 1000 / 120); // 提高帧率到120FPS
    
    // 添加事件监听
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('mousedown', handleMouseClick);
    canvas.addEventListener('mousemove', handleMouseMove);
    
    // 添加手机控制事件监听
    setupMobileControls();
}

// 停止游戏
function stopGame() {
    if (!gameState.isPlaying) return;
    
    gameState.isPlaying = false;
    
    // 更新统计数据
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
    }
    gameState.totalScore += gameState.score;
    gameState.totalTime += (gameState.timeLimit - gameState.timeRemaining) / 60; // 转换为分钟
    
    // 清除游戏循环
    clearInterval(gameState.gameLoop);
    
    // 移除事件监听
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    const canvas = document.getElementById('game-canvas');
    canvas.removeEventListener('mousedown', handleMouseClick);
    canvas.removeEventListener('mousemove', handleMouseMove);
    
    // 移除手机控制事件监听
    cleanupMobileControls();
}

// 游戏主循环
function gameLoop() {
    updateGame();
    drawGame();
}

// 更新游戏状态
function updateGame() {
    const canvas = document.getElementById('game-canvas');
    
    // 更新时间
    gameState.timeRemaining -= 1/120; // 每帧减少1/120秒
    if (gameState.timeRemaining <= 0) {
        gameState.timeRemaining = 0;
        stopGame();
        alert('时间到！最终得分: ' + gameState.score);
        return;
    }
    
    // 更新玩家位置
    if (keys.w && gameState.player.y > 0) {
        gameState.player.y -= gameState.player.speed;
        gameState.player.direction = 1; // 上
    }
    if (keys.s && gameState.player.y < canvas.height - gameState.player.height) {
        gameState.player.y += gameState.player.speed;
        gameState.player.direction = 0; // 下
    }
    if (keys.a && gameState.player.x > 0) {
        gameState.player.x -= gameState.player.speed;
        gameState.player.direction = 2; // 左
    }
    if (keys.d && gameState.player.x < canvas.width - gameState.player.width) {
        gameState.player.x += gameState.player.speed;
        gameState.player.direction = 3; // 右
    }
    
    // 虚拟摇杆控制
    if (gameState.joystickActive) {
        const moveX = gameState.joystickX * gameState.player.speed;
        const moveY = gameState.joystickY * gameState.player.speed;
        
        if (moveY < -0.1 && gameState.player.y > 0) {
            gameState.player.y -= Math.abs(moveY);
            gameState.player.direction = 1; // 上
        }
        if (moveY > 0.1 && gameState.player.y < canvas.height - gameState.player.height) {
            gameState.player.y += Math.abs(moveY);
            gameState.player.direction = 0; // 下
        }
        if (moveX < -0.1 && gameState.player.x > 0) {
            gameState.player.x -= Math.abs(moveX);
            gameState.player.direction = 2; // 左
        }
        if (moveX > 0.1 && gameState.player.x < canvas.width - gameState.player.width) {
            gameState.player.x += Math.abs(moveX);
            gameState.player.direction = 3; // 右
        }
    }
    
    // 更新玩家减益效果
    if (gameState.player.speedDebuff > 0) {
        gameState.player.speedDebuff--;
        gameState.player.speed = gameState.player.originalSpeed * 0.5; // 速度减半
    } else {
        gameState.player.speed = gameState.player.originalSpeed;
    }

    if (gameState.player.attackDebuff > 0) {
        gameState.player.attackDebuff--;
        // 攻击冷却时间加倍
        gameState.player.originalAttackCooldown = 40;
    } else {
        gameState.player.originalAttackCooldown = 20;
    }

    // 更新攻击冷却
    if (gameState.player.attackCooldown > 0) {
        gameState.player.attackCooldown -= 1;
    }
    
    // 更新敌人位置
    gameState.enemies.forEach(enemy => {
        // 简单的追踪玩家逻辑
        const dx = gameState.player.x - enemy.x;
        const dy = gameState.player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
        }
        
        // 检测碰撞
        // 敌人攻击逻辑
        if (enemy.attackCooldown > 0) {
            enemy.attackCooldown--;
        } else if (distance < 300) { // 在一定范围内攻击
            enemyAttack(enemy);
            enemy.attackCooldown = enemy.attackInterval;
        }

        // 检测碰撞
        if (checkCollision(gameState.player, enemy)) {
            stopGame();
            alert('游戏结束！得分: ' + gameState.score);
        }
    });
    
    // 更新投射物位置
    gameState.projectiles = gameState.projectiles.filter(projectile => {
        projectile.x += projectile.dx;
        projectile.y += projectile.dy;
        projectile.life -= 1;
        
        // 检测是否击中敌人
        let hitEnemy = false;
        gameState.enemies.forEach(enemy => {
            if (checkCollision(projectile, enemy)) {
                // 减少敌人生命值
                enemy.health -= projectile.damage;
                hitEnemy = true;
                
                // 如果敌人生命值耗尽，增加分数
                if (enemy.health <= 0) {
                    gameState.score += enemy.points;
                }
            }
        });
        
        // 移除生命值耗尽的敌人
        gameState.enemies = gameState.enemies.filter(enemy => enemy.health > 0);
        
        // 移除生命值耗尽或击中敌人的投射物
        return projectile.life > 0 && !hitEnemy && 
               projectile.x > 0 && projectile.x < canvas.width &&
               projectile.y > 0 && projectile.y < canvas.height;
    });
    
    // 检测收集物碰撞
    gameState.collectibles = gameState.collectibles.filter(collectible => {
        if (checkCollision(gameState.player, collectible)) {
            gameState.score += collectible.points;
            return false; // 移除已收集的物品
        }
        return true;
    });
    
    // 如果收集物太少，生成新的
    if (gameState.collectibles.length < 3) {
        spawnCollectibles(1);
    }
    
    // 如果敌人太少，生成新的
    if (gameState.enemies.length < 5) {
        spawnEnemies(1);
    }

    // 更新声波位置
    gameState.enemyWaves = gameState.enemyWaves.filter(wave => {
        wave.x += wave.dx;
        wave.y += wave.dy;
        wave.life -= 1;
        wave.radius += 0.2; // 声波逐渐扩大

        // 检测是否击中玩家
        if (checkCollision(wave, gameState.player)) {
            stopGame();
            alert('游戏结束！得分: ' + gameState.score);
            return false;
        }

        // 移除生命值耗尽或超出画布的声波
        return wave.life > 0 &&
               wave.x > 0 && wave.x < canvas.width &&
               wave.y > 0 && wave.y < canvas.height;
    });
}

// 绘制游戏
function drawGame() {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    // 清空画布
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制玩家
    drawPlayer(ctx, gameState.player);
    
    // 绘制敌人
    gameState.enemies.forEach(enemy => {
        drawEnemy(ctx, enemy);
    });
    
    // 绘制收集物
    gameState.collectibles.forEach(collectible => {
        ctx.fillStyle = collectible.color;
        ctx.fillRect(
            collectible.x,
            collectible.y,
            collectible.width,
            collectible.height
        );
    });
    
    // 绘制投射物
    gameState.projectiles.forEach(projectile => {
        ctx.fillStyle = projectile.color;
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    // 绘制声波（白色光圈效果）
    gameState.enemyWaves.forEach(wave => {
        // 计算透明度，随着生命周期减少而变淡
        const opacity = wave.life / 180;

        // 绘制外圈（光晕效果）
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 绘制主圈
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // 绘制内圈（增加光圈层次感）
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius - 2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.7})`;
        ctx.lineWidth = 1;
        ctx.stroke();
    });
    
    // 绘制分数和时间
    ctx.fillStyle = '#fff';
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.fillText('得分: ' + gameState.score, 10, 30);
    
    // 绘制时间条
    const timePercent = gameState.timeRemaining / gameState.timeLimit;
    const timeColor = timePercent > 0.5 ? '#4ecdc4' : (timePercent > 0.2 ? '#ffe66d' : '#ff6b6b');
    ctx.fillStyle = timeColor;
    ctx.fillRect(10, 40, (canvas.width - 20) * timePercent, 10);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(10, 40, canvas.width - 20, 10);
    
    // 显示剩余时间文本
    const minutes = Math.floor(gameState.timeRemaining / 60);
    const seconds = Math.floor(gameState.timeRemaining % 60);
    ctx.fillText(`时间: ${minutes}:${seconds.toString().padStart(2, '0')}`, 10, 75);
}

// 生成敌人
function spawnEnemies(count) {
    const canvas = document.getElementById('game-canvas');
    
    for (let i = 0; i < count; i++) {
        gameState.enemies.push({
            x: 20 + Math.random() * 100, // 在左上角区域生成敌人
            y: 20 + Math.random() * 100,
            width: 40,
            height: 40,
            speed: 0.5 + Math.random() * 1, // 降低敌人移动速度
            color: '#ff6b6b',
            points: 20 + Math.floor(Math.random() * 30),
            direction: 0, // 0:下, 1:上, 2:左, 3:右
            attackCooldown: 0, // 攻击冷却
            attackInterval: 120 + Math.random() * 60, // 攻击间隔
            maxHealth: 100, // 最大生命值
            health: 100 // 当前生命值
        });
    }
}

// 绘制玩家
function drawPlayer(ctx, player) {
    const x = player.x;
    const y = player.y;
    const size = player.width;
    const pixelSize = size / 5; // 5x5像素网格
    
    // 根据方向绘制不同朝向的像素人物
    ctx.fillStyle = player.color;
    
    // 身体
    ctx.fillRect(x + pixelSize, y + pixelSize, 3 * pixelSize, 3 * pixelSize);
    
    // 头部
    ctx.fillStyle = '#ffcc99';
    ctx.fillRect(x + pixelSize, y, 3 * pixelSize, 2 * pixelSize);
    
    // 眼睛
    ctx.fillStyle = '#000';
    if (player.direction === 1) { // 上
        ctx.fillRect(x + 2 * pixelSize, y, pixelSize, pixelSize);
    } else if (player.direction === 2) { // 左
        ctx.fillRect(x + pixelSize, y + pixelSize, pixelSize, pixelSize);
    } else if (player.direction === 3) { // 右
        ctx.fillRect(x + 3 * pixelSize, y + pixelSize, pixelSize, pixelSize);
    } else { // 下
        ctx.fillRect(x + pixelSize, y + pixelSize, pixelSize, pixelSize);
        ctx.fillRect(x + 3 * pixelSize, y + pixelSize, pixelSize, pixelSize);
    }
    
    // 腿
    ctx.fillStyle = player.color;
    if (player.direction === 2) { // 左
        ctx.fillRect(x, y + 3 * pixelSize, pixelSize, 2 * pixelSize);
    } else if (player.direction === 3) { // 右
        ctx.fillRect(x + 4 * pixelSize, y + 3 * pixelSize, pixelSize, 2 * pixelSize);
    } else {
        ctx.fillRect(x + pixelSize, y + 3 * pixelSize, pixelSize, 2 * pixelSize);
        ctx.fillRect(x + 3 * pixelSize, y + 3 * pixelSize, pixelSize, 2 * pixelSize);
    }
}

// 绘制敌人
function drawEnemy(ctx, enemy) {
    const x = enemy.x;
    const y = enemy.y;
    const size = enemy.width;
    const pixelSize = size / 5; // 5x5像素网格
    
    // 身体
    ctx.fillStyle = enemy.color;
    ctx.fillRect(x, y, size, size);
    
    // 眼睛
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + pixelSize, y + pixelSize, pixelSize, pixelSize);
    ctx.fillRect(x + 3 * pixelSize, y + pixelSize, pixelSize, pixelSize);
    
    // 瞳孔
    ctx.fillStyle = '#000';
    ctx.fillRect(x + pixelSize + pixelSize/4, y + pixelSize + pixelSize/4, pixelSize/2, pixelSize/2);
    ctx.fillRect(x + 3 * pixelSize + pixelSize/4, y + pixelSize + pixelSize/4, pixelSize/2, pixelSize/2);
    
    // 嘴巴
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 2 * pixelSize, y + 3 * pixelSize, pixelSize, pixelSize);
    
    // 绘制血条
    const healthPercent = enemy.health / enemy.maxHealth;
    const healthBarWidth = size;
    const healthBarHeight = 4;
    const healthBarY = y - healthBarHeight - 2;
    
    // 血条背景
    ctx.fillStyle = '#333';
    ctx.fillRect(x, healthBarY, healthBarWidth, healthBarHeight);
    
    // 血条前景
    const healthColor = healthPercent > 0.5 ? '#4ecdc4' : (healthPercent > 0.2 ? '#ffe66d' : '#ff6b6b');
    ctx.fillStyle = healthColor;
    ctx.fillRect(x, healthBarY, healthBarWidth * healthPercent, healthBarHeight);
}

// 玩家攻击
function playerAttack(mouseX, mouseY) {
    if (gameState.player.attackCooldown > 0) return;
    
    const player = gameState.player;
    const dx = mouseX - (player.x + player.width / 2);
    const dy = mouseY - (player.y + player.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 播放攻击音效
    audioManager.playAttackSound();
    
    // 创建投射物
    gameState.projectiles.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        dx: (dx / distance) * 10, // 投射物速度
        dy: (dy / distance) * 10,
        radius: 5,
        width: 10, // 用于碰撞检测
        height: 10, // 用于碰撞检测
        color: player.color,
        life: 60, // 投射物存在时间（帧数）
        damage: 18 // 投射物伤害值
    });
    
    // 设置攻击冷却
    gameState.player.attackCooldown = gameState.player.originalAttackCooldown;
}

// 敌人攻击
function enemyAttack(enemy) {
    const dx = gameState.player.x - enemy.x;
    const dy = gameState.player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 创建声波
    gameState.enemyWaves.push({
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height / 2,
        dx: (dx / distance) * 3, // 声波速度
        dy: (dy / distance) * 3,
        radius: 8,
        width: 16, // 用于碰撞检测
        height: 16, // 用于碰撞检测
        color: '#ffffff', // 白色声波
        life: 180 // 声波存在时间（帧数）
    });
}

// 生成收集物
function spawnCollectibles(count) {
    const canvas = document.getElementById('game-canvas');
    
    for (let i = 0; i < count; i++) {
        gameState.collectibles.push({
            x: Math.random() * (canvas.width - 20),
            y: Math.random() * (canvas.height - 20),
            width: 20,
            height: 20,
            points: 10 + Math.floor(Math.random() * 20),
            color: '#4ecdc4'
        });
    }
}

// 检测碰撞
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// 键盘状态
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

// 键盘按下事件
function handleKeyDown(e) {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
        keys[key] = true;
        e.preventDefault();
    }
}

// 键盘抬起事件
function handleKeyUp(e) {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
        keys[key] = false;
        e.preventDefault();
    }
}

// 鼠标点击事件
function handleMouseClick(e) {
    if (!gameState.isPlaying) return;
    
    const canvas = document.getElementById('game-canvas');
    const rect = canvas.getBoundingClientRect();
    
    // 计算鼠标在画布上的位置
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // 玩家攻击
    playerAttack(mouseX, mouseY);
}

// 鼠标移动事件
function handleMouseMove(e) {
    const canvas = document.getElementById('game-canvas');
    const rect = canvas.getBoundingClientRect();
    gameState.mouseX = e.clientX - rect.left;
    gameState.mouseY = e.clientY - rect.top;
}

// 更新数据显示
function updateDataDisplay() {
    document.getElementById('total-games').textContent = gameState.totalGames;
    document.getElementById('high-score').textContent = gameState.highScore;
    document.getElementById('total-time').textContent = gameState.totalTime.toFixed(2) + '分钟';
    
    const avgScore = gameState.totalGames > 0 
        ? (gameState.totalScore / gameState.totalGames).toFixed(2) 
        : 0;
    document.getElementById('avg-score').textContent = avgScore;
}