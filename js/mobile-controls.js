// 手机控制相关变量
let joystickTouchId = null;
let joystickCenterX = 0;
let joystickCenterY = 0;

// 设置手机控制
function setupMobileControls() {
    const joystick = document.getElementById('joystick');
    const joystickKnob = document.getElementById('joystick-knob');
    const attackBtn = document.getElementById('attack-btn');

    // 虚拟摇杆触摸事件
    joystick.addEventListener('touchstart', handleJoystickStart, { passive: false });
    joystick.addEventListener('touchmove', handleJoystickMove, { passive: false });
    joystick.addEventListener('touchend', handleJoystickEnd, { passive: false });

    // 攻击按钮点击事件
    attackBtn.addEventListener('touchstart', handleAttackButton, { passive: false });
    attackBtn.addEventListener('click', handleAttackButton);
}

// 清理手机控制
function cleanupMobileControls() {
    const joystick = document.getElementById('joystick');
    const joystickKnob = document.getElementById('joystick-knob');
    const attackBtn = document.getElementById('attack-btn');

    // 移除虚拟摇杆触摸事件
    joystick.removeEventListener('touchstart', handleJoystickStart);
    joystick.removeEventListener('touchmove', handleJoystickMove);
    joystick.removeEventListener('touchend', handleJoystickEnd);

    // 移除攻击按钮事件
    attackBtn.removeEventListener('touchstart', handleAttackButton);
    attackBtn.removeEventListener('click', handleAttackButton);

    // 重置摇杆状态
    resetJoystick();
}

// 重置摇杆状态
function resetJoystick() {
    const joystickKnob = document.getElementById('joystick-knob');
    joystickKnob.style.transform = 'translate(-50%, -50%)';
    gameState.joystickActive = false;
    gameState.joystickX = 0;
    gameState.joystickY = 0;
    joystickTouchId = null;
}

// 摇杆触摸开始
function handleJoystickStart(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    joystickTouchId = touch.identifier;

    const joystick = document.getElementById('joystick');
    const rect = joystick.getBoundingClientRect();
    joystickCenterX = rect.left + rect.width / 2;
    joystickCenterY = rect.top + rect.height / 2;

    gameState.joystickActive = true;
    updateJoystick(touch.clientX, touch.clientY);
}

// 摇杆移动
function handleJoystickMove(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joystickTouchId) {
            updateJoystick(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
            break;
        }
    }
}

// 摇杆触摸结束
function handleJoystickEnd(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joystickTouchId) {
            resetJoystick();
            break;
        }
    }
}

// 更新摇杆位置
function updateJoystick(clientX, clientY) {
    const joystick = document.getElementById('joystick');
    const joystickKnob = document.getElementById('joystick-knob');
    const rect = joystick.getBoundingClientRect();
    const maxDistance = rect.width / 2 - 25; // 25是摇杆半径

    const dx = clientX - joystickCenterX;
    const dy = clientY - joystickCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 限制摇杆移动范围
    const limitedDistance = Math.min(distance, maxDistance);
    const angle = Math.atan2(dy, dx);

    const knobX = Math.cos(angle) * limitedDistance;
    const knobY = Math.sin(angle) * limitedDistance;

    // 更新摇杆位置
    joystickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;

    // 更新游戏状态
    gameState.joystickX = knobX / maxDistance;
    gameState.joystickY = knobY / maxDistance;
}

// 处理攻击按钮
function handleAttackButton(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    // 向玩家前方攻击
    const player = gameState.player;
    const canvas = document.getElementById('game-canvas');

    // 根据玩家方向计算攻击目标位置
    let targetX = player.x + player.width / 2;
    let targetY = player.y + player.height / 2;

    switch(player.direction) {
        case 0: // 下
            targetY += 100;
            break;
        case 1: // 上
            targetY -= 100;
            break;
        case 2: // 左
            targetX -= 100;
            break;
        case 3: // 右
            targetX += 100;
            break;
    }

    // 执行攻击
    playerAttack(targetX, targetY);
}
