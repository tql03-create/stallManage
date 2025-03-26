/**
 * 摊位详情页面
 * 展示摊位信息并提供编辑和营业状态切换功能
 */
Page({
  data: {
    userInfo: {},
    stallInfo: {},
    loading: true
  },
  onLogout() {
    wx.showModal({
      title: '确认注销',
      content: '注销后需要重新注册，确定要继续吗？',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '注销中...' });
            
            // 调用云函数删除用户数据
            const { result } = await wx.cloud.callFunction({
              name: 'logoutUser'
            });
            
            if (result.code === 0) {
              // 清除本地存储
              wx.removeStorageSync('userInfo');
              
              wx.showToast({
                title: '注销成功',
                icon: 'success'
              });
              
              // 跳转到首页
              setTimeout(() => {
                wx.reLaunch({
                  url: '/pages/index/index'
                });
              }, 1500);
            } else {
              throw new Error(result.message || '注销失败');
            }
          } catch (error) {
            console.error('注销失败:', error);
            this.handleError('注销失败', error.message);
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },
  onLoad: async function() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (!userInfo) {
        this.handleError('用户信息不存在', '请先登录');
        return;
      }

      this.setData({ userInfo });
      await this.fetchStallInfo();
    } catch (error) {
      this.handleError('页面加载失败', error.message);
    } finally {
      this.setData({ loading: false });
    }
  },
  
  // 添加 onShow 生命周期函数
  onShow: async function() {
    try {
      this.setData({ loading: true });
      await this.fetchStallInfo();
    } catch (error) {
      this.handleError('页面加载失败', error.message);
    } finally {
      this.setData({ loading: false });
    }
  },
  /**
   * 获取摊位信息
   */
  async fetchStallInfo() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'queryStallByOwner'
      });

      if (result.code === 0 && result.data) {
        this.setData({
          stallInfo: result.data
        });
      } else {
        this.handleError('获取摊位信息失败', result.message || '未知错误');
      }
    } catch (error) {
      this.handleError('获取摊位信息失败', error.message);
    }
  },

  /**
   * 处理编辑摊位操作
   */
  onEdit() {
    if (this.data.stallInfo.isOpen) {
      this.handleError('无法编辑', '请先收摊后再编辑');
      return;
    }

    wx.navigateTo({
      url: '/pages/stallEdit/stallEdit?isEdit=true',
      fail: (error) => this.handleError('页面跳转失败', error.message)
    });
  },

  /**
   * 切换摊位营业状态
   */
  async onToggleStatus() {
    try {
      const newStatus = !this.data.stallInfo.isOpen;
      const { result } = await wx.cloud.callFunction({
        name: 'updateStallStatus',
        data: {
          isOpen: newStatus
        }
      });

      if (result.code === 0) {
        this.setData({
          'stallInfo.isOpen': newStatus
        });
        wx.showToast({
          title: newStatus ? '已出摊' : '已收摊',
          icon: 'success'
        });
      } else {
        this.handleError('状态更新失败', result.message || '未知错误');
      }
    } catch (error) {
      this.handleError('状态更新失败', error.message);
    }
  },

  /**
   * 统一错误处理
   * @param {string} title - 错误提示标题
   * @param {string} message - 错误详细信息
   */
  handleError(title, message) {
    wx.showModal({
      title: title,
      content: message,
      showCancel: false,
      confirmText: '知道了'
    });
  }
});