const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { inviteCode } = event
  const wxContext = cloud.getWXContext()

  // 参数验证
  if (!inviteCode || inviteCode.length < 6) {
    return {
      success: false,
      code: 400,
      message: '无效的邀请码'
    }
  }

  try {
    // 检查邀请码是否存在且有效
    const inviteCodeCheck = await db.collection('inviteCodes')
      .where({
        code: inviteCode,
      })
      .get()

    if (inviteCodeCheck.data.length === 0) {
      return {
        success: false,
        code: 404,
        message: '邀请码无效或已过期'
      }
    }

    return {
      success: true,
      code: 0,
      message: '邀请码验证成功',
      data: {
        inviteCodeId: inviteCodeCheck.data[0]._id
      }
    }

  } catch (err) {
    console.error('[verifyInviteCode] 验证失败:', err)
    return {
      success: false,
      code: 500,
      message: '系统错误'
    }
  }
}