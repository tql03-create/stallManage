const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    // 获取用户信息
    const userInfo = await db.collection('users')
      .where({
        _openid: wxContext.OPENID
      })
      .get()

    if (userInfo.data.length === 0) {
      return {
        success: false,
        code: 404,
        message: '用户不存在'
      }
    }

    // 获取用户的摊位信息
    const stallInfo = await db.collection('stalls')
      .where({
        _openid: wxContext.OPENID
      })
      .get()

    // 组装返回数据
    const userData = {
      ...userInfo.data[0],
      isStallOwner: stallInfo.data.length > 0,
      stallInfo: stallInfo.data[0] || null
    }

    // 删除敏感字段
    delete userData._openid

    return {
      success: true,
      code: 0,
      message: '获取成功',
      data: userData
    }

  } catch (err) {
    console.error('[getUserInfo] 获取用户信息失败:', err)
    return {
      success: false,
      code: 500,
      message: '系统错误'
    }
  }
}