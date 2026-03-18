const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const { stallName, stallDesc, stallImage } = event

    try {
        const { stats } = await db.collection('stalls')
            .where({
                _openid: wxContext.OPENID
            })
            .update({
                data: {
                    stallName,
                    stallDesc,
                    stallImage,
                    updateTime: db.serverDate()
                }
            })
            console.log(stats.updated )
        if (stats.updated === 1) {
            return {
                code: 0,
                message: '更新成功'
            }
        } else {
            return {
                code: -1,
                message: '未找到摊位信息'
            }
        }

    } catch (err) {
        console.error('更新摊位信息失败:', err)
        return {
            code: -1,
            message: '更新失败'
        }
    }
}