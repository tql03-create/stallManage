const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    try {
        const banners = await db.collection('banners')
            .where({
                isActive: true
            })
            .orderBy('order', 'asc')
            .get()
        
        return {
            code: 0,
            data: banners.data
        }
    } catch (error) {
        return {
            code: -1,
            message: error.message
        }
    }
}