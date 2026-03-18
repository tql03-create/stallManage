const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { stallName, stallDesc, stallImage } = event
  const wxContext = cloud.getWXContext()

  if (!wxContext.OPENID) {
    return {
      success: false,
      code: 401,
      message: '未授权访问'
    }
  }

  // 参数验证
  if (!stallName || !stallDesc || !stallImage) {
    return {
      success: false,
      code: 400,
      message: '摊位信息不完整'
    }
  }

  if (stallName.length > 20 || stallDesc.length > 200) {
    return {
      success: false,
      code: 400,
      message: '摊位名称或描述过长'
    }
  }

 // ... 参数验证部分保持不变 ...

try {
    // 检查用户是否已有摊位
    const stallCheck = await db.collection('stalls').where({
        _openid: wxContext.OPENID
    }).count()  // 改为使用count更高效

    if (stallCheck.total > 0) {
        return {
            code: 409,  // 移除 success 字段保持返回结构统一
            message: '您已创建过摊位'
        }
    }

    // 创建新摊位
    const result = await db.collection('stalls').add({
        data: {
            stallName: stallName.trim(),
            stallDesc: stallDesc.trim(),
            stallImage,
            isOpen: false,
            
            createTime: db.serverDate(),
            updateTime: db.serverDate(),
            _openid: wxContext.OPENID
        }
    })

    return {
        code: 0,  // 保持与前端约定的一致性
        message: '创建成功',
        data: {
            stallId: result._id  // 修正为正确获取文档ID
        }
    }

} catch (err) {
    console.error('[createStall] 创建摊位失败:', err)
    return {
        code: 500,  // 使用标准HTTP状态码
        message: '数据库写入失败: ' + err.message
    }
}
}