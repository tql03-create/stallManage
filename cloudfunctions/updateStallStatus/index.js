const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const { isOpen } = event  // 从请求参数中获取状态

    try {
        // 更新用户摊位的营业状态
        const { stats } = await db.collection('stalls')
            .where({
                _openid: wxContext.OPENID
            })
            .update({
                data: {
                    isOpen: isOpen,
                    updateTime: db.serverDate()
                }
            })

        if (stats.updated === 1) {
            return {
                code: 0,
                message: '状态更新成功'
            }
        } else {
            return {
                code: -1,
                message: '未找到摊位信息'
            }
        }

    } catch (err) {
        console.error('更新摊位状态失败:', err)
        return {
            code: -1,
            message: '更新失败'
        }
    }
}