import api from '../utils/requset.js'

// ==================== Index 页面相关 API ====================

/**
 * 获取智能场景列表
 * @returns {Promise}
 */
export function getSceneList () {
  return api({ OBJECT: 'WEIFA', ACTIVE: 'SCENELIST', KEYWORD: [] })
}

/**
 * 获取设备列表
 * @returns {Promise}
 */
export function getDeviceList () {
  return api({ OBJECT: 'WEIFA', ACTIVE: 'DEVLIST', KEYWORD: [] })
}

/**
 * 控制设备（开关灯、窗帘、开启场景）
 * @param {Object} params - 控制参数
 *   - STATE: 状态值（0/1 开关，2001/2003 窗帘，'1' 场景）
 *   - DEVID: 设备ID（控制设备时）
 *   - SCENEID: 场景ID（控制场景时）
 * @returns {Promise}
 */
export function controlDevice (params) {
  return api({ OBJECT: 'WEIFA', ACTIVE: 'CONTORL', KEYWORD: [params] })
}

// ==================== 定时相关 API ====================

/**
 * 设置设备定时（添加/编辑）
 * ENABLE： 0不工作，1单次生效，2每天，3每周选天
 * WEEK：[周日,周一,周二,...周六] 0当天不工作，1当天工作
 * @param {Object} KEYWORD - 定时参数
 * @returns {Promise}
 */
export function setDeviceTimer (KEYWORD) {
  return api({ OBJECT:'WEIFA', ACTIVE: 'DEVICE_TIMER', KEYWORD: [KEYWORD] })
}

/**
 * 查询设备定时列表
 * @param {Object} params - 查询参数 {DEVID}
 * @returns {Promise}
 */
export function getDeviceTimerList () {
  return api({ OBJECT:'WEIFA', ACTIVE: 'DEVICE_TIMERLIST', KEYWORD: [] })
}

// ==================== 场景相关 ====================

/**
 * 注册场景（新增场景，会清除原终端关联场景）
 * @param {string} OBJECT - 威发终端ID
 * @param {Array<{ID: string, NAME: string}>} scenes - 场景列表
 *   - ID: 场景编号
 *   - NAME: 场景名称
 * @returns {Promise}
 * @example
 * registerScene('WEIFA123', [
 *   { ID: '1', NAME: '开灯' },
 *   { ID: '2', NAME: '关灯' }
 * ])
 */
export function registerScene ( scenes) {
  return api({ OBJECT:'WEIFA', ACTIVE: 'MAC_SCENEREG', KEYWORD: [scenes] })
}

/**
 * 场景修改（修改场景中的设备列表及状态）
 * @param {string} OBJECT - 威发终端ID
 * @param {Array<{SCENE_ID: string, ID: string, STATE: string}>} devices - 设备列表
 *   - SCENE_ID: 场景编号
 *   - ID: 设备ID
 *   - STATE: 设备状态 "1"开/"0"关
 * @returns {Promise}
 * @example
 * modifyScene('WEIFA123', [
 *   { SCENE_ID: '1', ID: '1', STATE: '1' },
 *   { SCENE_ID: '1', ID: '2', STATE: '0' }
 * ])
 */
export function modifyScene ( devices) {
  return api({ OBJECT:'WEIFA', ACTIVE: 'MAC_SCENE_MODIFY', KEYWORD: devices })
}

/**
 * 终端状态轮询查询
 * 说明：终端每30秒发起一次轮询，服务器返回指令数组。若30秒内无请求，则判定设备离线。
 * @param {string} OBJECT - 终端编号
 * @param {string} type - 查询类型：'XIAODU_STATEQUERY' 或 'QUERY'
 */
export function stateQuery ( type = 'XIAODU_STATEQUERY') {
  return api({ OBJECT:'WEIFA', ACTIVE: type, KEYWORD: [] })
}
// 获取指定场景下的设备列表
// [{  "ID":"XXX",  "NAME":"XXXX", "SCENE_ID":"XXX","DEVLIST":[{"ID":"1","STATE":"0"},{"ID":"2","STATE":"1"},{"ID":"3","STATE":"0"}] }...]

export function getSceneEquipment ( SCENE_ID) {
  return api({ OBJECT:'WEIFA', ACTIVE: 'SCENE_DEVLIST', KEYWORD: [{ SCENE_ID }] })
}

// 删除场景定时任务
export function delTask (data) {
  return api({ OBJECT:'WEIFA', ACTIVE: 'DEVICE_TIMER_DEL', KEYWORD: [data] })
}
// 终端最近访问时间 用于分辨网关是否在线
export function queryterminalOnline () {
  return api({ OBJECT:'WEIFA', ACTIVE: 'MAC_ONLINE', KEYWORD: [] })
}
