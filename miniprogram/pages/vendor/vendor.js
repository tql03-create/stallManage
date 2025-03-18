Page({
    data: {
        avatarUrl: '',
        nickName: '',
        vendorName: '',
        vendorDescription: '',
        fileList: []
    },
    onLoad() {
        // 获取用户信息
        const user = wx.getStorageSync('user');
        if (user) {
            this.setData({
                avatarUrl: user.avatarUrl,
                nickName: user.nickName
            });
        }
    },
    onVendorNameChange(e) {
        this.setData({
            vendorName: e.detail
        });
    },
    onVendorDescriptionChange(e) {
        this.setData({
            vendorDescription: e.detail
        });
    },
    onDeleteFile(e) {
        const index = e.detail.index;
        const fileList = this.data.fileList;
        fileList.splice(index, 1);
        this.setData({
            fileList: fileList
        });
    },
    onReadFile(e) {
        const file = e.detail.file;
        this.setData({
            fileList: [...this.data.fileList, file]
        });
    },
    saveVendorInfo() {
        const vendorInfo = {
            name: this.data.vendorName,
            description: this.data.vendorDescription,
            fileList: this.data.fileList
        };
        wx.setStorageSync('vendorInfo', vendorInfo);
        wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000
        });
        // 切换到首页并更新出摊按钮状态
        wx.switchTab({
            url: '/pages/home/home'
        });
    }
});