Page({
    data: {
      stallName: '',
      stallDesc: '',
      stallImage: ''
    },
    onStallNameInput(e) {
      this.setData({
        stallName: e.detail.value
      });
    },
    onStallDescInput(e) {
      this.setData({
        stallDesc: e.detail.value
      });
    },
    onChooseImage() {
      wx.chooseImage({
        count: 1,
        success: res => {
          const filePath = res.tempFilePaths[0];
          this.setData({
            stallImage: filePath
          });
        }
      });
    },
    onSaveStall() {
      if (!this.data.stallName || !this.data.stallDesc || !this.data.stallImage) {
        wx.showToast({ title: '请完整填写摊位信息', icon: 'none' });
        return;
      }
      // 上传图片到云存储
      const cloudPath = `stall-images/${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}.jpg`;
      wx.cloud.uploadFile({
        cloudPath,
        filePath: this.data.stallImage,
        success: res => {
          const fileID = res.fileID;
          // 调用云函数保存摊位信息
          wx.cloud.callFunction({
            name: 'saveStall',
            data: {
              stallName: this.data.stallName,
              stallDesc: this.data.stallDesc,
              stallImage: fileID
            }
          }).then(res => {
            const result = res.result;
            if (result.code === 0) {
              wx.showToast({ title: '保存成功', icon: 'success' });
              // 保存成功后跳转到首页
              wx.switchTab({ url: '/pages/index/index' });
            } else {
              wx.showToast({ title: result.message, icon: 'none' });
            }
          }).catch(err => {
            console.error(err);
            wx.showToast({ title: '保存失败，服务器异常', icon: 'none' });
          });
        },
        fail: err => {
          console.error(err);
          wx.showToast({ title: '图片上传失败', icon: 'none' });
        }
      });
    }
  });
  