// 音频管理器
const audioManager = {
    bgMusic: null,
    attackSound: null,
    isMuted: false,
    isPlaying: false,

    // 初始化音频
    init() {
        try {
            // 创建音频元素
            // 使用本地音乐文件
            this.bgMusic = new Audio('music/五五分Fifty-Fifty - 我们.mp3');
            this.bgMusic.loop = true; // 循环播放
            this.bgMusic.volume = 0.3; // 设置初始音量为30%
            this.bgMusic.crossOrigin = "anonymous"; // 允许跨域

            // 预加载音频
            this.bgMusic.load();
            
            // 创建攻击音效
            this.attackSound = new Audio('music/attack.mp3');
            this.attackSound.volume = 0.5; // 设置攻击音效音量为50%
            this.attackSound.crossOrigin = "anonymous"; // 允许跨域
            
            // 预加载攻击音效
            this.attackSound.load();

            // 添加音频加载完成事件
            this.bgMusic.addEventListener('canplaythrough', () => {
                console.log('背景音乐加载完成');
            });

            // 添加音频错误事件
            this.bgMusic.addEventListener('error', (e) => {
                console.error('背景音乐加载失败:', e);
                console.error('错误详情:', this.bgMusic.error);
            });

            // 添加加载中事件
            this.bgMusic.addEventListener('loadstart', () => {
                console.log('开始加载背景音乐...');
            });

            // 添加加载元数据事件
            this.bgMusic.addEventListener('loadedmetadata', () => {
                console.log('音频元数据已加载，时长:', this.bgMusic.duration);
            });

            // 添加播放结束事件
            this.bgMusic.addEventListener('ended', () => {
                this.isPlaying = false;
            });

            // 添加播放事件
            this.bgMusic.addEventListener('play', () => {
                this.isPlaying = true;
                console.log('音乐开始播放');
            });

            // 添加暂停事件
            this.bgMusic.addEventListener('pause', () => {
                this.isPlaying = false;
                console.log('音乐已暂停');
            });
        } catch (error) {
            console.error('初始化音频管理器失败:', error);
        }
    },

    // 播放背景音乐
    play() {
        console.log('尝试播放音乐，isMuted:', this.isMuted, 'bgMusic存在:', !!this.bgMusic);
        if (this.bgMusic) {
            // 取消静音
            this.bgMusic.muted = false;
            this.isMuted = false;
            
            // 使用Promise处理播放，避免在用户交互前播放失败
            const playPromise = this.bgMusic.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('音乐播放成功');
                }).catch(error => {
                    console.error('播放失败:', error);
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
    },
    
    // 播放攻击音效
    playAttackSound() {
        if (this.attackSound) {
            // 重置音效到开始位置，以便连续播放
            this.attackSound.currentTime = 0;
            // 使用Promise处理播放
            const playPromise = this.attackSound.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('攻击音效播放成功');
                }).catch(error => {
                    console.error('攻击音效播放失败:', error);
                });
            }
        }
    }
};

// 页面加载时初始化音频管理器
document.addEventListener('DOMContentLoaded', () => {
    audioManager.init();
});
