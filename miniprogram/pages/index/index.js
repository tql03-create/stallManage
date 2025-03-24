Page({
    data: {
        userInfo: null,
        myStall: null,
        carouselImages: [
            
        ],
        toggleStallText: '出摊',
        // 只保留一个stalls数组，通过计算属性获取过滤后的结果
        stalls: [],
        searchKeyword: '', // 新增搜索关键词状态
        filteredStalls: []
    },

    async onLoad() {
        await this.loadPageData();
    },

    async onShow() {
        await this.loadPageData();
       
    },

    // 统一的数据加载方法
    async loadPageData() {
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
            this.setData({ userInfo });
            await this.getMyStallInfo();
        }
        await Promise.all([
            this.getAllStalls(),
            this.getBanners()  // 新增获取轮播图
        ]);
    },
    // 新增获取轮播图方法
    async getBanners() {
        try {
            const { result } = await wx.cloud.callFunction({
                name: 'getBanners'
            });
            if (result.code === 0) {
                // 根据 order 排序后再转换为图片地址数组
                const sortedBanners = result.data.sort((a, b) => a.order - b.order);
                console.log(sortedBanners)
                this.setData({
                    carouselImages: sortedBanners.map(item => item.imageUrl)
                });
            }
        } catch (error) {
            console.error('获取轮播图失败:', error);
        }
    },
    // 获取我的摊位信息
    async getMyStallInfo() {
        try {
            const { result } = await wx.cloud.callFunction({
                name: 'getMyStall'
            });
            if (result.code === 0 && result.data) {
                this.setData({
                    myStall: result.data,
                    toggleStallText: result.data.isOpen ? '收摊' : '出摊'  // 保持与数据库字段一致
                });
            }
        } catch (error) {
            console.error('获取摊位信息失败:', error);
        }
    },

    // 获取所有摊位列表
    async getAllStalls() {
        try {
            const { result } = await wx.cloud.callFunction({
                name: 'getAllStalls'
            });
            if (result.code === 0) {
                const sortedStalls = result.data.sort((a, b) => {
                    if (a.isOpen === b.isOpen) return 0;
                    return a.isOpen ? -1 : 1;
                });
                this.setData({ 
                    stalls: sortedStalls,
                    filteredStalls: sortedStalls // 初始化过滤结果
                });
            }
        } catch (error) {
            console.error('获取摊位列表失败:', error);
            wx.showToast({
                title: '获取摊位列表失败',
                icon: 'none'
            });
        }
    },

    // 获取过滤后的摊位列表
   
    // 实时输入

    handleSearch(e) {
        const value = e.detail.value.trim();
        this.setData({ searchKeyword: value });
        this.updateFilteredStalls(value);
    },
    updateFilteredStalls(keyword) {
        const filtered = !keyword ? this.data.stalls : this.data.stalls.filter(item => 
            item.stallName.toLowerCase().includes(keyword.toLowerCase()) || 
            item.stallDesc.toLowerCase().includes(keyword.toLowerCase())
        );
        this.setData({ filteredStalls: filtered });
    },

    async onOwnerAvatarTap() {
        const userInfo = wx.getStorageSync('userInfo');
        if (!userInfo) {
            wx.navigateTo({
                url: '/pages/register/register'
            });
            return;
        }

        try {
            const { result } = await wx.cloud.callFunction({
                name: 'getMyStall'
            });
            if (result.code === 0) {
                if (result.data) {
                    wx.navigateTo({
                        url: '/pages/stallDetail/stallDetail'
                    });
                } else {
                    wx.navigateTo({
                        url: '/pages/editStall/editStall'
                    });
                }
            }
        } catch (error) {
            console.error('获取摊位信息失败:', error);
            wx.showToast({
                title: '获取信息失败',
                icon: 'none'
            });
        }
    },
    async onToggleStallStatus() {
        try {
            wx.showLoading({ title: '更新中...' });
            
            const newStatus = !this.data.myStall.isOpen;
            const { result } = await wx.cloud.callFunction({
                name: 'updateStallStatus',
                data: { 
                    isOpen: newStatus
                }
            });

            if (result.code === 0) {
                this.setData({
                    'myStall.isOpen': newStatus,
                    toggleStallText: newStatus ? '收摊' : '出摊'
                });
                
                await this.getAllStalls();

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
        } finally {
            wx.hideLoading();
        }
    }
});