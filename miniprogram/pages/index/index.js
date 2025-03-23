Page({
    data: {
        isOpen: false,
        // 出摊与否状态示例数据
        stallStatusList: [
            { title: '出摊中' },
            { title: '已打烊' },
            // 你也可以再添加其他状态，如“即将开摊”等
        ],
        isOwner: true,
        myStall: {
            "stallName": "烧烤摊",
            "isClosed": true
        },
        // 轮播图示例数据
        carouselImages: [
            '../../images/banners/banner-1.jpg',
            '../../images/banners/banner-2.jpg',
            '../../images/banners/banner-3.jpg',
        ],

        // 摊位示例数据
        stalls: [
            {
                id: 1,
                avatar: '../../images/avatar/bbq.jpg',
                name: '烧烤摊',
                desc: '各类美味烧烤，香气四溢！',
                isClosed: false
            },
            {
                id: 2,
                avatar: '../../images/avatar/naica.jpg',
                name: '奶茶铺',
                desc: '鲜茶现泡，丝滑口感～',
                isClosed: false
            },
            {
                id: 3,
                avatar: '../../images/avatar/malatang.jpg',
                name: '深夜麻辣烫',
                desc: '麻辣鲜香，欲罢不能！',
                isClosed: true
            },
            {
                id: 4,
                avatar: '../../images/avatar/fantuan.jpg',
                name: '饭团小摊',
                desc: '各种米饭料理，美味健康！',
                isClosed: false
            }
        ],

        // 搜索结果过滤后的数据
        filteredStalls: [],

        // 出摊/收摊 按钮的文字
        toggleStallText: '出摊'
    },

    onLoad() {
        // 页面初始化逻辑，如请求接口等
        // 初始时，默认全部显示
        this.setData({
            filteredStalls: this.data.stalls
        });

        let sortedStalls = this.data.stalls.sort((a, b) => {
            if (a.isClosed === b.isClosed) return 0;
            return a.isClosed ? 1 : -1;
          });
          this.setData({
            filteredStalls: sortedStalls
          });
    },
    
    // 实时输入搜索（可做防抖处理）
    onSearchInput(e) {
        const value = e.detail.value.trim();
        //   console.log(value)
        this.filterStalls(value);
    },

    // 点击键盘“搜索”按钮
    onSearchConfirm(e) {
        const value = e.detail.value.trim();
        console.log(value)
        //   this.filterStalls(value);
    },

    // 根据搜索内容过滤摊位
    filterStalls(keyword) {
        if (!keyword) {
            // 如果搜索关键字为空，则显示所有摊位
            this.setData({
                filteredStalls: this.data.stalls
            });
            return;
        }
        const filtered = this.data.stalls.filter(item => {
            return (
                item.name.includes(keyword) ||
                item.desc.includes(keyword)
            );
        });
        this.setData({
            filteredStalls: filtered
        });
    },

   

   

    // 点击摊主头像
    onOwnerAvatarTap() {
        console.log('点击摊主注册/登录');
        // 例如跳转到摊主注册/登录页
        wx.navigateTo({ url: '/pages/register/register' });
    },

    // 右下角 出摊/收摊 切换按钮
    onToggleStallStatus() {
        // 检查当前摊位的状态
        if (this.data.toggleStallText === '出摊') {
            // 如果当前是“出摊”，则更新为“收摊”并设置 isClosed 为 true
            this.setData({
                toggleStallText: '收摊',
                myStall: {
                    ...this.data.myStall,
                    isClosed: false
                }
            });

            // 这里可以调用接口或做本地逻辑来切换自己摊位的状态
        } else {
            // 如果当前是“收摊”，则更新为“出摊”并设置 isClosed 为 false
            this.setData({
                toggleStallText: '出摊',
                myStall: {
                    ...this.data.myStall,
                    isClosed: true
                }
            });

            // 同理可调用接口等
        }
    }
});
