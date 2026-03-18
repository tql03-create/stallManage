const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { userInfo } = event
  const wxContext = cloud.getWXContext()

  // 参数验证
  if (!userInfo || !userInfo.nickName || !userInfo.avatarUrl) {
    return {
      success: false,
      code: 400,
      message: '用户信息不完整'
    }
  }

  try {
    // 检查用户是否已存在
    const userCheck = await db.collection('users')
      .where({
        _openid: wxContext.OPENID
      })
      .get()

    if (userCheck.data.length > 0) {
      return {
        success: false,
        code: 409,
        message: '用户已存在'
      }
    }

    // 创建新用户
    const result = await db.collection('users').add({
      data: {
        _openid: wxContext.OPENID,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })

    return {
      success: true,
      code: 0,
      message: '注册成功',
      data: {
        userId: result._id
      }
    }

  } catch (err) {
    console.error('[registerUser] 注册失败:', err)
    return {
      success: false,
      code: -1,
      message: '系统错误'
    }
  }
}