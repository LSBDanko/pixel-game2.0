// 音乐控制函数
function toggleMusic() {
    console.log('toggleMusic 被调用');
    // 确保音频已加载
    if (!audioManager.bgMusic) {
        console.error('音频未初始化');
        return;
    }

    const musicButton = document.getElementById('music-toggle');

    // 检查当前音乐是否在播放
    if (audioManager.isPlaying) {
        // 如果正在播放，则暂停音乐
        console.log('暂停音乐');
        audioManager.bgMusic.muted = true;
        audioManager.isMuted = true;
        audioManager.pause();
        musicButton.textContent = '🎵 音乐: 关';
    } else {
        // 如果未播放，则播放音乐
        console.log('播放音乐');
        audioManager.bgMusic.muted = false;
        audioManager.isMuted = false;
        audioManager.play();
        musicButton.textContent = '🎵 音乐: 开';
    }
}

// 音量控制函数
let volumeLevels = [0.1, 0.3, 0.5, 0.7, 1.0];
let currentVolumeIndex = 1; // 默认为30%

function toggleVolume() {
    console.log('toggleVolume 被调用');
    // 确保音频已加载
    if (!audioManager.bgMusic) {
        console.error('音频未初始化');
        return;
    }

    currentVolumeIndex = (currentVolumeIndex + 1) % volumeLevels.length;
    const newVolume = volumeLevels[currentVolumeIndex];
    console.log('设置音量为:', newVolume);
    audioManager.setVolume(newVolume);

    const volumeButton = document.getElementById('volume-toggle');
    volumeButton.textContent = `🔊 音量: ${Math.round(newVolume * 100)}%`;

    // 如果当前没有静音且音乐未播放，则播放音乐
    if (!audioManager.isMuted && audioManager.bgMusic.paused) {
        console.log('音乐未播放，开始播放');
        audioManager.bgMusic.currentTime = 0; // 从头开始播放
        audioManager.play();
    }
}
