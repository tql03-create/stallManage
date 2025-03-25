/**
 * 首页页面
 * 
 * 该页面负责展示摊位列表、轮播图、搜索功能，以及摊主的出摊/收摊状态管理
 * 包含以下主要功能：
 * 1. 展示所有摊位信息
 * 2. 搜索摊位
 * 3. 摊主状态管理（出摊/收摊）
 * 4. 轮播图展示
 */

Page({
    /**
     * 页面的初始数据
     */
    data: {
        userInfo: null,          // 用户信息
        myStall: null,           // 当前用户的摊位信息
        carouselImages: [],      // 轮播图数据
        toggleStallText: '出摊',  // 出摊/收摊按钮文本
        stalls: [],              // 所有摊位数据
        searchKeyword: '',       // 搜索关键词
        filteredStalls: []       // 过滤后的摊位列表
    },

    /**
     * 生命周期函数--监听页面加载
     */
    async onLoad() {
        await this.loadPageData();
    },

    /**
     * 生命周期函数--监听页面显示
     * 每次页面显示时重新加载数据，确保数据实时性
     */
    async onShow() {
        await this.loadPageData();
    },

    /**
     * 统一的数据加载方法
     * 加载页面所需的所有数据：用户信息、摊位信息、轮播图
     */
    async loadPageData() {
        try {
            const userInfo = wx.getStorageSync('userInfo');
            if (userInfo) {
                this.setData({ userInfo });
                await this.loadStallOwnerInfo();
            }
            await Promise.all([
                this.loadAllStalls(),
                this.loadBannerImages()
            ]);
        } catch (error) {
            console.error('加载页面数据失败:', error);
            wx.showToast({
                title: '加载数据失败，请重试',
                icon: 'none'
            });
        }
    },
    /**
     * 加载轮播图数据
     * @returns {Promise<void>}
     */
    async loadBannerImages() {
        try {
            const { result } = await wx.cloud.callFunction({
                name: 'getBanners'
            });
            if (result.code === 0) {
                // 根据order字段排序后转换为图片地址数组
                const sortedBanners = result.data.sort((a, b) => a.order - b.order);
                this.setData({
                    carouselImages: sortedBanners.map(item => item.imageUrl)
                });
            }
        } catch (error) {
            console.error('加载轮播图失败:', error);
            wx.showToast({
                title: '加载轮播图失败',
                icon: 'none'
            });
        }
    },

    /**
     * 加载当前用户的摊位信息
     * @returns {Promise<void>}
     */
    async loadStallOwnerInfo() {
        try {
            const { result } = await wx.cloud.callFunction({
                name: 'queryStallByOwner'
            });
            if (result.code === 0 && result.data) {
                this.setData({
                    myStall: result.data,
                    toggleStallText: result.data.isOpen ? '收摊' : '出摊'
                });
            }
        } catch (error) {
            console.error('加载摊主信息失败:', error);
            wx.showToast({
                title: '加载摊主信息失败',
                icon: 'none'
            });
        }
    },

    /**
     * 加载所有摊位列表
     * @returns {Promise<void>}
     */
    async loadAllStalls() {
        try {
            const { result } = await wx.cloud.callFunction({
                name: 'queryStallList'
            });
            if (result.code === 0) {
                // 按营业状态排序：营业中的排在前面
                const sortedStalls = result.data.sort((a, b) => {
                    if (a.isOpen === b.isOpen) return 0;
                    return a.isOpen ? -1 : 1;
                });
                this.setData({ 
                    stalls: sortedStalls,
                    filteredStalls: sortedStalls
                });
            }
        } catch (error) {
            console.error('加载摊位列表失败:', error);
            wx.showToast({
                title: '加载摊位列表失败',
                icon: 'none'
            });
        }
    },

    /**
     * 处理搜索输入事件
     * @param {Object} e - 输入事件对象
     */
    handleSearch(e) {
        const value = e.detail.value.trim();
        this.setData({ searchKeyword: value });
        this.filterStallsByKeyword(value);
    },

    /**
     * 根据关键词过滤摊位列表
     * @param {string} keyword - 搜索关键词
     */
    filterStallsByKeyword(keyword) {
        const filtered = !keyword ? this.data.stalls : this.data.stalls.filter(item => 
            item.stallName.toLowerCase().includes(keyword.toLowerCase()) || 
            item.stallDesc.toLowerCase().includes(keyword.toLowerCase())
        );
        this.setData({ filteredStalls: filtered });
    },

    /**
     * 处理摊主头像点击事件
     * 根据用户登录状态和摊位信息跳转到相应页面
     * @returns {Promise<void>}
     */
    async onOwnerAvatarTap() {
        const userInfo = wx.getStorageSync('userInfo');
        if (!userInfo) {
            wx.navigateTo({
                url: '/pages/userRegister/userRegister'
            });
            return;
        }

        try {
            const { result } = await wx.cloud.callFunction({
                name: 'queryStallByOwner'
            });
            if (result.code === 0) {
                // 根据是否已有摊位信息决定跳转到详情页还是编辑页
                const targetPage = result.data ? 'stallDetail' : 'stallEdit';
                wx.navigateTo({
                    url: `/pages/${targetPage}/${targetPage}`
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
    /**
     * 切换摊位营业状态
     * 处理出摊/收摊操作，更新本地和云端状态
     * @returns {Promise<void>}
     */
    async onToggleStallStatus() {
        if (!this.data.myStall) {
            wx.showToast({
                title: '请先创建摊位',
                icon: 'none'
            });
            return;
        }
        
      
        
        try {
            wx.showLoading({ 
                title: '更新中...',
                mask: true  // 防止重复点击
            });
            
            const newStatus = !this.data.myStall.isOpen;
            const { result } = await wx.cloud.callFunction({
                name: 'updateStallStatus',
                data: { 
                    isOpen: newStatus
                }
            });
    
            if (result.code === 0) {
                // 更新本地状态
                this.setData({
                    'myStall.isOpen': newStatus,
                    toggleStallText: newStatus ? '收摊' : '出摊'
                });
                
                // 重新加载摊位列表以更新UI
                await this.loadAllStalls();
    
                // 先隐藏 loading 再显示 toast
                wx.hideLoading();
                wx.showToast({
                    title: newStatus ? '已出摊' : '已收摊',
                    icon: 'success'
                });
            }
        } catch (error) {
            console.error('更新营业状态失败:', error);
            // 确保异常时先隐藏 loading
            wx.hideLoading();
            wx.showToast({
                title: '操作失败',
                icon: 'none'
            });
        }
    }
});