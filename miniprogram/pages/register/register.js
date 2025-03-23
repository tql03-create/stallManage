Page({
    data: {
      inviteCode: ''
    },
    onInviteCodeInput(e) {
      this.setData({
        inviteCode: e.detail.value
      });
    },
    onRegisterTap() {
      if (!this.data.inviteCode) {
        wx.showToast({ title: '请输入邀请码', icon: 'none' });
        return;
      }
      wx.cloud.callFunction({
        name: 'registerUser',
        data: {
          inviteCode: this.data.inviteCode
        }
      }).then(res => {
        const result = res.result;
        if (result.code === 0) {
          wx.showToast({ title: '注册成功', icon: 'success' });
          // 注册成功后跳转到摊位编辑页面
          wx.navigateTo({ url: '/pages/editStall/editStall' });
        } else {
          wx.showToast({ title: result.message, icon: 'none' });
        }
      }).catch(err => {
        console.error(err);
        wx.showToast({ title: '注册异常', icon: 'none' });
      });
    }
  });
  