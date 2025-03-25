/**
 * 摊位编辑页面
 * 
 * 该页面负责处理摊位信息的创建和编辑功能
 * 包含以下主要功能：
 * 1. 摊位基本信息（名称、描述）的输入和验证
 * 2. 摊位图片的上传和存储
 * 3. 根据模式（新建/编辑）保存摊位信息
 */

Page({
    data: {
        userInfo: {},       // 用户信息
        stallName: '',      // 摊位名称
        stallDesc: '',      // 摊位描述
        stallImage: '',     // 摊位图片云存储ID
        isEdit: false,      // 编辑模式标识
        isSubmitting: false // 防重复提交标识
    },

    /**
     * 处理摊位名称输入
     * @param {Object} e - 输入事件对象
     */
    handleStallNameInput(e) {
        this.setData({
            stallName: e.detail.value
        });
    },

    /**
     * 处理摊位描述输入
     * @param {Object} e - 输入事件对象
     */
    handleStallDescInput(e) {
        this.setData({
            stallDesc: e.detail.value
        });
    },

    /**
     * 处理图片上传
     * 支持从相册选择或使用相机拍摄
     */
    async handleImageUpload() {
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
           
            // 生成唯一的云存储路径
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
            this.showErrorToast('未选择图片');
        }
    },

    /**
     * 页面加载时的初始化
     * @param {Object} options - 页面参数
     */
    async onLoad(options) {
        // 从URL参数获取编辑模式状态
        const isEdit = options.isEdit === 'true';
        
        // 获取用户信息
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
            this.setData({ 
                userInfo,
                isEdit
            });
        }

        // 如果是编辑模式，加载现有摊位信息
        if (isEdit) {
            await this.loadStallInfo();
        }
    },

    /**
     * 加载现有摊位信息
     */
    async loadStallInfo() {
        try {
            const { result } = await wx.cloud.callFunction({
                name: 'queryStallByOwner'
            });

            if (result.code === 0 && result.data) {
                this.setData({
                    stallName: result.data.stallName || '',
                    stallDesc: result.data.stallDesc || '',
                    stallImage: result.data.stallImage || ''
                });
            }
        } catch (error) {
            console.error('获取摊位信息失败:', error);
            this.showErrorToast('获取摊位信息失败');
        }
    },

    /**
     * 验证表单数据
     * @returns {boolean} 验证结果
     */
    validateForm() {
        if (!this.data.stallName.trim()) {
            this.showErrorToast('请输入摊位名称');
            return false;
        }

        if (!this.data.stallDesc.trim()) {
            this.showErrorToast('请输入摊位描述');
            return false;
        }

        if (!this.data.stallImage) {
            this.showErrorToast('请上传摊位图片');
            return false;
        }

        return true;
    },

    /**
     * 显示错误提示
     * @param {string} message - 错误信息
     */
    showErrorToast(message) {
        wx.showToast({
            title: message,
            icon: 'none'
        });
    },

    /**
     * 保存摊位信息
     * 包含防重复提交机制
     */
    async handleSaveStall() {
        // 防重复提交
        if (this.data.isSubmitting) return;

        // 表单验证
        if (!this.validateForm()) return;

        try {
            this.setData({ isSubmitting: true });
            wx.showLoading({ title: '保存中...' });

            // 根据模式选择接口
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

                // 延迟跳转
                setTimeout(() => {
                    if (this.data.isEdit) {
                        wx.navigateBack();
                    } else {
                        wx.redirectTo({
                            url: '/pages/index/index'
                        });
                    }
                }, 1000);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('保存摊位信息失败:', error);
            this.showErrorToast('保存失败，请重试');
        } finally {
            wx.hideLoading();
            this.setData({ isSubmitting: false });
        }
    }
});