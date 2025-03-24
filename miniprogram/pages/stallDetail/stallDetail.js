Page({
    data: {
      userInfo: {},
      stallInfo: {}
    },
  
    onLoad: async function() {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({ userInfo });
      }
  
      await this.fetchStallInfo();
    },
  
    async fetchStallInfo() {
      try {
        const { result } = await wx.cloud.callFunction({
          name: 'getMyStall'
        });
  
        if (result.code === 0 && result.data) {
          this.setData({
            stallInfo: result.data
          });
        }
      } catch (error) {
        console.error('获取摊位信息失败:', error);
        wx.showToast({
          title: '获取信息失败',
          icon: 'none'
        });
      }
    },
  
    onEdit() {
        // 检查摊位是否在营业中
        if (this.data.stallInfo.isOpen) {
            wx.showToast({
                title: '请先收摊后再编辑',
                icon: 'none',
                duration: 2000
            });
            return;
        }
    
        // 摊位未营业时才允许跳转到编辑页面
        // 跳转到编辑页面，并传递 isEdit 参数
    wx.navigateTo({
        url: '/pages/editStall/editStall?isEdit=true'
    });
    },
  
    async onToggleStatus() {
      try {
        const newStatus = !this.data.stallInfo.isOpen;
        const { result } = await wx.cloud.callFunction({
          name: 'updateStallStatus',
          data: {
            isOpen: newStatus
          }
        });
            console.log(result.code)
        if (result.code === 0) {
          this.setData({
            'stallInfo.isOpen': newStatus
          });
          wx.showToast({
            title: newStatus ? '已出摊' : '已收摊',
            icon: 'success'
          });
        }
      } catch (error) {
        console.error('更新状态失败:', error);
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    }
  });