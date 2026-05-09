// 排行榜和在线积分管理
const leaderboard = {
    // 从本地存储加载排行榜数据
    loadFromStorage() {
        const data = localStorage.getItem('pixelGameLeaderboard');
        if (data) {
            try {
                gameState.leaderboard = JSON.parse(data);
            } catch (e) {
                console.error('加载排行榜数据失败:', e);
                gameState.leaderboard = [];
            }
        }
    },

    // 保存排行榜数据到本地存储
    saveToStorage() {
        try {
            localStorage.setItem('pixelGameLeaderboard', JSON.stringify(gameState.leaderboard));
        } catch (e) {
            console.error('保存排行榜数据失败:', e);
        }
    },

    // 添加分数到排行榜
    addScore(playerName, score, difficulty) {
        const entry = {
            name: playerName,
            score: score,
            difficulty: difficulty,
            date: new Date().toISOString()
        };

        gameState.leaderboard.push(entry);

        // 按分数降序排序
        gameState.leaderboard.sort((a, b) => b.score - a.score);

        // 只保留前50名
        if (gameState.leaderboard.length > 50) {
            gameState.leaderboard = gameState.leaderboard.slice(0, 50);
        }

        this.saveToStorage();
    },

    // 获取排行榜数据
    getLeaderboard(limit = 10) {
        return gameState.leaderboard.slice(0, limit);
    },

    // 获取指定难度的排行榜
    getLeaderboardByDifficulty(difficulty, limit = 10) {
        return gameState.leaderboard
            .filter(entry => entry.difficulty === difficulty)
            .slice(0, limit);
    },

    // 更新排行榜显示
    updateLeaderboardDisplay() {
        const leaderboardList = document.querySelector('.mvp-list');
        if (!leaderboardList) return;

        const topPlayers = this.getLeaderboard(10);

        leaderboardList.innerHTML = topPlayers.map((player, index) => `
            <div class="mvp-item">
                <div class="rank">${index + 1}</div>
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="player-score">得分: ${player.score}</div>
                    <div class="player-difficulty">难度: ${this.getDifficultyText(player.difficulty)}</div>
                </div>
                ${index === 0 ? '<div class="mvp-badge">MVP</div>' : ''}
            </div>
        `).join('');
    },

    // 获取难度文本
    getDifficultyText(difficulty) {
        const difficultyMap = {
            'easy': '简单',
            'normal': '普通',
            'hard': '困难'
        };
        return difficultyMap[difficulty] || difficulty;
    }
};

// 页面加载时初始化排行榜
document.addEventListener('DOMContentLoaded', () => {
    leaderboard.loadFromStorage();

    // 如果当前页面是MVP页面，更新排行榜显示
    if (gameState.currentPage === 'mvp') {
        leaderboard.updateLeaderboardDisplay();
    }
});

// 修改页面切换函数，在切换到MVP页面时更新排行榜
const originalShowPage = showPage;
showPage = function(pageId) {
    originalShowPage(pageId);

    if (pageId === 'mvp') {
        leaderboard.updateLeaderboardDisplay();
    }
};

// 修改停止游戏函数，在游戏结束时保存分数到排行榜
const originalStopGame = stopGame;
stopGame = function() {
    if (gameState.isPlaying && gameState.score > 0) {
        leaderboard.addScore(
            gameState.playerName,
            gameState.score,
            gameState.difficulty
        );
    }

    originalStopGame();
};
