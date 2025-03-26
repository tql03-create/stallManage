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

        
    },

   
});