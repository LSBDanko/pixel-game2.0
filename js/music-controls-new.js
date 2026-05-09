// 音乐控制函数
function toggleMusic() {
    // 确保音频已加载
    if (!audioManager.bgMusic) {
        console.error('音频未初始化');
        return;
    }

    const isMuted = audioManager.toggleMute();
    const musicButton = document.getElementById('music-toggle');

    if (isMuted) {
        musicButton.textContent = '🎵 音乐: 关';
        audioManager.pause();
    } else {
        musicButton.textContent = '🎵 音乐: 开';
        // 取消静音并播放音乐
        audioManager.bgMusic.muted = false;
        audioManager.bgMusic.currentTime = 0; // 从头开始播放
        audioManager.play();
    }
}

// 音量控制函数
let volumeLevels = [0.1, 0.3, 0.5, 0.7, 1.0];
let currentVolumeIndex = 1; // 默认为30%

function toggleVolume() {
    // 确保音频已加载
    if (!audioManager.bgMusic) {
        console.error('音频未初始化');
        return;
    }

    currentVolumeIndex = (currentVolumeIndex + 1) % volumeLevels.length;
    const newVolume = volumeLevels[currentVolumeIndex];
    audioManager.setVolume(newVolume);

    const volumeButton = document.getElementById('volume-toggle');
    volumeButton.textContent = `🔊 音量: ${Math.round(newVolume * 100)}%`;

    // 如果当前没有静音且音乐未播放，则播放音乐
    if (!audioManager.isMuted && audioManager.bgMusic.paused) {
        audioManager.bgMusic.currentTime = 0; // 从头开始播放
        audioManager.play();
    }
}
