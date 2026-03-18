const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    try {
        const { data } = await db.collection('stalls').get()
        return {
            code: 0,
            data: data
        }
    } catch (err) {
        console.error('获取摊位列表失败:', err)
        return {
            code: -1,
            message: '获取失败'
        }
    }
}