Page({
    data: {
        banners: [
            '../../images/banners/banner-1.jpg',
            '../../images/banners/banner-2.jpg',
            '../../images/banners/banner-3.jpg'
        ],
        products: [
            {
                image: '../../images/goods/product1.jpg',
                name: '商品1',
                price: 29.9
            },
            {
                image: '../../images/goods/product2.jpg',
                name: '商品2',
                price: 39.9
            }
        ],
        vendorStatus: false,
        vendorStatusText: '出摊'
    },
    onSearch(e) {
        const keyword = e.detail;
        console.log('搜索关键词:', keyword);
        // 实现搜索逻辑
    },
    onSearchChange(e) {
        // 搜索框内容变化时的处理
    },
    toggleVendorStatus() {
        this.setData({
            vendorStatus: !this.data.vendorStatus,
            vendorStatusText: this.data.vendorStatus ? '打样中' : '出摊6小时'
        });
        // 更新出摊状态逻辑
    }
});