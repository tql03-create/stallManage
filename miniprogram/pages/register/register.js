Page({
    data: {
        inviteCode: '',
        isCodeVerified: false,
        isVerifying: false,
        userInfo: {}
    },

    onInviteCodeInput(e) {
        this.setData({
            inviteCode: e.detail.value
        });
    },

    async onVerifyCode() {
        if (!this.data.inviteCode) {
            wx.showToast({ title: '请输入邀请码', icon: 'none' });
            return;
        }

        this.setData({ isVerifying: true });

        try {
            const { result } = await wx.cloud.callFunction({
                name: 'verifyInviteCode',
                data: {
                    inviteCode: this.data.inviteCode
                }
            });

            if (result.code === 0) {
                this.setData({
                    isCodeVerified: true,
                    isVerifying: false
                });
                wx.showToast({ title: '验证成功', icon: 'success' });
            } else {
                wx.showToast({ title: result.message, icon: 'none' });
                this.setData({ isVerifying: false });
            }
        } catch (err) {
            console.error('验证失败', err);
            wx.showToast({ title: '验证失败', icon: 'none' });
            this.setData({ isVerifying: false });
        }
    },
    // 在Page对象中添加这两个方法
    onChooseAvatar(e) {
        const { avatarUrl } = e.detail;
        // 只保存头像URL
        this.setData({
            'userInfo.avatarUrl': avatarUrl
        });
    
        // 只存储必要的信息
        const userInfoToStore = {
            avatarUrl: avatarUrl,
            nickName: this.data.userInfo.nickName || ''
        };
        wx.setStorageSync('userInfo', userInfoToStore);
    },
    
    onInputNickname(e) {
        const nickName = e.detail.value;
        // 只保存昵称
        this.setData({
            'userInfo.nickName': nickName
        });
    
        // 只存储必要的信息
        const userInfoToStore = {
            avatarUrl: this.data.userInfo.avatarUrl || '',
            nickName: nickName
        };
        wx.setStorageSync('userInfo', userInfoToStore);
    },
    async onGetUserProfile() {
        try {
            // 1. 检查必要信息
            if (!this.data.userInfo.avatarUrl || !this.data.userInfo.nickName) {
                wx.showToast({
                    title: '请先完善头像和昵称',
                    icon: 'none'
                });
                return;
            }
    
            // 2. 准备要传递的用户信息（只包含必要字段）
            const userInfoToRegister = {
                nickName: this.data.userInfo.nickName,
                avatarUrl: this.data.userInfo.avatarUrl
            };
    
            // 3. 调用注册云函数
            const registerResult = await wx.cloud.callFunction({
                name: 'registerUser',
                data: {
                    userInfo: userInfoToRegister
                    
                }
            });
    
            // 4. 处理返回结果
            if (registerResult.result) {
                if (registerResult.result.code === 0) {  // 注册成功
                    wx.showToast({
                        title: '注册成功',
                        icon: 'success'
                    });
                    setTimeout(() => {
                        wx.navigateTo({
                            url: '/pages/editStall/editStall'
                        });
                    }, 1500);
                } else if (registerResult.result.code === 1) {  // 用户已存在
                    wx.showToast({
                        title: registerResult.result.message,
                        icon: 'none'
                    });
                    setTimeout(() => {
                        wx.switchTab({
                            url: '/pages/index/index'
                        });
                    }, 1500);
                } else {  // 其他错误
                    wx.showToast({
                        title: registerResult.result.message || '注册失败',
                        icon: 'none'
                    });
                }
            }
    
        } catch (error) {
            console.error('注册失败:', error);
            wx.showToast({
                title: '注册失败，请重试',
                icon: 'none'
            });
        }
    }
});