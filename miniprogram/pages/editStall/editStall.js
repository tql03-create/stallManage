Page({
    data: {
      userInfo: {},
      stallName: '',
      stallDesc: '',
      stallImage: '',
      isEdit: false
    },
  
 
  
    // 摊位名称输入
    onStallNameInput(e) {
      this.setData({
        stallName: e.detail.value
      });
    },
  
    // 摊位描述输入
    onStallDescInput(e) {
      this.setData({
        stallDesc: e.detail.value
      });
    },
  
    // 上传图片
    async onUploadImage() {
        try {
          // 选择图片
          const { tempFiles } = await wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            sizeType: ['compressed'],
            sourceType: ['album', 'camera']
          });
      
          wx.showLoading({
            title: '上传中...'
          });
      
          // 上传到云存储
          const cloudPath = `stall/${Date.now()}-${Math.random().toString(36).slice(-6)}.jpg`;
          const { fileID } = await wx.cloud.uploadFile({
            cloudPath,
            filePath: tempFiles[0].tempFilePath
          });
      
          this.setData({
            stallImage: fileID
          });
      
          wx.hideLoading();
        } catch (error) {
          console.error('上传图片失败:', error);
          wx.hideLoading();
          wx.showToast({
            title: '上传失败，请重试',
            icon: 'none'
          });
        }
      },
      onLoad: async function(options) {
        // 从 URL 参数获取 isEdit 状态
        const isEdit = options.isEdit === 'true';
        // console.log('URL参数 isEdit:', isEdit); // 添加日志
        
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
            this.setData({ 
                userInfo,
                isEdit: isEdit
            });
            // console.log('设置后的 isEdit:', this.data.isEdit); // 添加日志
        }
    
        try {
            const { result } = await wx.cloud.callFunction({
                name: 'getMyStall'
            });
    
            if (result.code === 0 && result.data) {
                this.setData({
                    stallName: result.data.stallName || '',
                    stallDesc: result.data.stallDesc || '',
                    stallImage: result.data.stallImage || ''
                });
                // console.log('获取摊位信息后的 isEdit:', this.data.isEdit); // 添加日志
            }
        } catch (error) {
            console.error('获取摊位信息失败:', error);
        }
    },
    // 保存摊位信息
    async onSaveStall() {
      try {
          // 验证必填信息
          if (!this.data.stallName.trim()) {
              wx.showToast({
                  title: '请输入摊位名称',
                  icon: 'none'
              });
              return;
          }
  
          if (!this.data.stallDesc.trim()) {
              wx.showToast({
                  title: '请输入摊位描述',
                  icon: 'none'
              });
              return;
          }
  
          if (!this.data.stallImage) {
              wx.showToast({
                  title: '请上传摊位图片',
                  icon: 'none'
              });
              return;
          }
  
          wx.showLoading({
              title: '保存中...'
          });
          console.log(this.data.isEdit)
          // 根据isEdit判断是创建还是更新
          const functionName = this.data.isEdit ? 'updateStall' : 'createStall';
          const { result } = await wx.cloud.callFunction({
              name: functionName,
              data: {
                  stallName: this.data.stallName,
                  stallDesc: this.data.stallDesc,
                  stallImage: this.data.stallImage
              }
          });
  
          if (result.code === 0) {
              wx.showToast({
                  title: '保存成功',
                  icon: 'success'
              });
              
              // 延迟跳转回详情页
              setTimeout(() => {
                  if (this.data.isEdit) {
                      // 编辑模式下返回上一页
                      wx.navigateBack();
                  } else {
                      // 创建模式下跳转到首页
                      wx.redirectTo({
                          url: '/pages/index/index'
                      });
                  }
              }, 1500);
          } else {
              throw new Error(result.message);
          }
  
      } catch (error) {
          console.error('保存摊位信息失败:', error);
          wx.showToast({
              title: '保存失败，请重试',
              icon: 'none'
          });
      } finally {
          wx.hideLoading();
      }
  }
    
  })