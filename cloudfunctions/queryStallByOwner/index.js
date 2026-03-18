const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    try {
        // 查询用户的摊位信息
        const { data } = await db.collection('stalls')
            .where({
                _openid: wxContext.OPENID
            })
            .field({
                stallName: true,
                stallDesc: true,
                stallImage: true,
                isOpen: true,
                createTime: true,
                updateTime: true
            })
            .get()

        return {
            code: 0,
            data: data[0] || null,  // 如果没有摊位返回 null
            message: '获取成功'
        }

    } catch (err) {
        console.error('获取摊位信息失败:', err)
        return {
            code: -1,
            data: null,
            message: '获取摊位信息失败'
        }
    }
}