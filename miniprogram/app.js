App({
    onLaunch: function () {
        // 初始化云开发
        if (!wx.cloud) {
            console.error("请使用 2.2.3 或以上的基础库以使用云能力");
            return;
        }
        
        wx.cloud.init({
            env: "cloud1-8gtrx5qheeed07c3",
            traceUser: true
        });

        // 初始化全局数据
        this.globalData = {
            userInfo: null,
            isLoggedIn: false,
            isVendor: false
        };

        // 检查用户登录状态
        this.checkLoginStatus();
    },

    // 检查用户登录状态
    checkLoginStatus: function() {
        const that = this;
        wx.getStorage({
            key: 'userInfo',
            success: function(res) {
                that.globalData.userInfo = res.data;
                that.globalData.isLoggedIn = true;
                that.globalData.isVendor = true;
            },
            fail: function() {
                console.log('未找到登录信息');
            }
        });
    },
    // 全局错误处理
    onError: function(err) {
        console.error('应用错误：', err);
        // 可以在这里添加错误上报逻辑
    },

    // 全局未处理Promise拒绝处理
    onUnhandledRejection: function(err) {
        console.error('未处理的Promise拒绝：', err);
    },

    // 全局页面不存在处理
    onPageNotFound: function(res) {
        wx.redirectTo({
            url: '/pages/index/index'
        });
    }
});