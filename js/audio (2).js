// 音频管理器
const audioManager = {
    bgMusic: null,
    isMuted: false,

    // 初始化音频
    init() {
        try {
            // 创建音频元素
            // 使用相对路径引用本地音乐文件
            this.bgMusic = new Audio('music/五五分Fifty-Fifty - 我们.mp3');
            this.bgMusic.loop = true; // 循环播放
            this.bgMusic.volume = 0.3; // 设置初始音量为30%

            // 预加载音频
            this.bgMusic.load();

            // 添加音频加载完成事件
            this.bgMusic.addEventListener('canplaythrough', () => {
                console.log('背景音乐加载完成');
            });

            // 添加音频错误事件
            this.bgMusic.addEventListener('error', (e) => {
                console.error('背景音乐加载失败:', e);
                console.error('错误详情:', this.bgMusic.error);
            });
        } catch (error) {
            console.error('初始化音频管理器失败:', error);
        }
    },

    // 播放背景音乐
    play() {
        if (this.bgMusic && !this.isMuted) {
            // 使用Promise处理播放，避免在用户交互前播放失败
            const playPromise = this.bgMusic.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('自动播放被阻止，等待用户交互:', error);
                });
            }
        }
    },

    // 暂停背景音乐
    pause() {
        if (this.bgMusic) {
            this.bgMusic.pause();
        }
    },

    // 设置音量
    setVolume(volume) {
        if (this.bgMusic) {
            this.bgMusic.volume = Math.max(0, Math.min(1, volume));
        }
    },

    // 静音/取消静音
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.bgMusic) {
            this.bgMusic.muted = this.isMuted;
        }
        return this.isMuted;
    },

    // 获取当前音量
    getVolume() {
        return this.bgMusic ? this.bgMusic.volume : 0;
    }
};

// 页面加载时初始化音频管理器
document.addEventListener('DOMContentLoaded', () => {
    audioManager.init();
});
