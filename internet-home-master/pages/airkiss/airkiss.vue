<template>
	<view class="blufi-page-container">
		<!-- 步骤条 -->
		<view class="blufi-step-wrapper">
			<view class="steps-bar">
				<view v-for="(s, i) in steps" :key="i" class="step-item" :class="{ active: stepActive >= i }">
					<view class="step-dot">{{ i + 1 }}</view>
					<text class="step-text">{{ s.text }}</text>
				</view>
			</view>
		</view>

		<!-- 步骤0: 扫描设备 -->
		<block v-if="stepActive === 0">
			<view class="blufi-filter-wrapper">
				<input class="filter-input" v-model="macFilter" placeholder="mac/名称过滤" />
			</view>
			<scroll-view class="blufi-list-wrapper" scroll-y>
				<block v-for="item in filteredDevices" :key="item.deviceId">
					<view class="blufi-list-item" :id="item.deviceId" @click="blufiConnect">
						<view class="device-cell">
							<view class="device-info">
								<text class="device-name">设备名称: {{ item.localName || item.name }}</text>
								<text class="device-id">设备ID: {{ item.deviceId }}</text>
							</view>
							<text class="device-rssi">RSSI: {{ item.RSSI }}</text>
						</view>
					</view>
				</block>
				<view class="blufi-note-content" v-if="devicesList.length === 0">
					扫描前, 请确保蓝牙和位置权限已打开
				</view>
			</scroll-view>
		</block>

		<!-- 步骤1: 填写WiFi -->
		<view class="blufi-wifi-input-wrapper" v-if="stepActive === 1">
			<image class="blufi-wifi-input-cover" src="https://img.alicdn.com/tfs/TB1nzXJXmf2gK0jSZFPXXXsopXa-774-774.png" mode="aspectFit"></image>
			<view class="wifi-form">
				<view class="form-cell">
					<text class="form-label">SSID</text>
					<input class="form-input" v-model="ssid" placeholder="请输入WiFi名" />
				</view>
				<view class="form-cell">
					<text class="form-label">密码</text>
					<view class="pwd-row">
						<input class="form-input" v-model="password" :password="!showPassword" placeholder="请输入密码" />
						<text class="eye-icon" @click="showPassword = !showPassword">{{ showPassword ? '👁' : '👁‍🗨' }}</text>
					</view>
				</view>
				<view class="form-cell checkbox-cell">
					<checkbox :checked="isMoreMsg" @click="isMoreMsg = !isMoreMsg" />
					<text class="checkbox-label" @click="isMoreMsg = !isMoreMsg">更多信息</text>
				</view>
				<block v-if="isMoreMsg">
					<view class="form-cell" @click="showServerTypePopup = true">
						<text class="form-label">服务器类型</text>
						<view class="form-value-row">
							<text class="form-value">{{ serverTypeName }}</text>
							<text class="arrow">›</text>
						</view>
					</view>
					<view class="form-cell">
						<text class="form-label">IP地址</text>
						<input class="form-input" v-model="ip" placeholder="仅限英文、数字、符号.-" maxlength="100" @input="ipChange" />
					</view>
					<view class="form-cell">
						<text class="form-label">端口号</text>
						<input class="form-input" v-model="port" type="number" placeholder="仅限输入数字" maxlength="5" @input="portChange" />
					</view>
				</block>
			</view>
		</view>

		<!-- 步骤2: 配网成功 -->
		<view class="blufi-success-wrapper" v-if="stepActive === 2">
			<text class="success-text">配网成功</text>
			<text class="success-icon">✓</text>
		</view>

		<!-- 底部按钮 -->
		<view class="blufi-btn-wrapper">
			<button class="blufi-btn" :loading="blufiLoadStatus" @click="blufiBtnHandle">{{ blufiloadInfo }}</button>
		</view>

		<!-- 服务器类型弹窗 -->
		<view class="action-sheet-mask" v-if="showServerTypePopup" @click="showServerTypePopup = false"></view>
		<view class="action-sheet" v-if="showServerTypePopup">
			<view class="action-sheet-item" v-for="opt in serverTypeOptions" :key="opt.value" @click="onSelectServerType(opt)">
				<text>{{ opt.name }}</text>
			</view>
			<view class="action-sheet-cancel" @click="showServerTypePopup = false">
				<text>取消</text>
			</view>
		</view>
	</view>
</template>

<script>
const xBlufi = require('@/utils/blufi/xBlufi.js')

const SCAN_STEP = 0
const INPUT_STEP = 1
const DONE_STEP = 2

var timeouts = []
var intervalTimer = null
var sequenceCount = 0

export default {
	data() {
		return {
			isConnecting: false,
			blufiloadInfo: '扫描设备',
			blufiLoadStatus: false,
			blufiScanStatus: false,
			showPassword: false,
			macFilter: '',
			stepActive: 0,
			ssid: '',
			password: '',
			steps: [
				{ text: '1.连接设备' },
				{ text: '2.填写WiFi' },
				{ text: '3.配网成功' }
			],
			deviceId: '',
			deviceName: '',
			devicesListTemp: [],
			devicesList: [],
			isMoreMsg: false,
			serverType: 'tcp',
			serverTypeName: 'TCP服务器',
			ip: '',
			port: null,
			serverTypeOptions: [
				{ name: 'TCP服务器', value: 'tcp' },
				{ name: 'UDP服务器', value: 'udp' },
				{ name: 'MQTT服务器', value: 'mqtt' }
			],
			showServerTypePopup: false
		}
	},
	computed: {
		filteredDevices() {
			if (!this.macFilter) return this.devicesList
			const filter = this.macFilter.toLowerCase()
			return this.devicesList.filter(item => {
				return (
					(item.deviceId && item.deviceId.toLowerCase().indexOf(filter) !== -1) ||
					(item.name && item.name.toLowerCase().indexOf(filter) !== -1)
				)
			})
		}
	},
	onLoad() {
		sequenceCount = 0  // 加这行
		xBlufi.initXBlufi(1)
		xBlufi.listenDeviceMsgEvent(true, this.blufiEventHandler)
		this.clearIntervalTimer()
		xBlufi.notifyStartDiscoverBle({ isStart: false })
		this.devicesList = []
	},
	onUnload() {
		 // 先直接断开 BLE 连接
    if (this.deviceId) {
        uni.closeBLEConnection({ deviceId: this.deviceId })
    }
    // 再通知 xBlufi 层
    xBlufi.notifyConnectBle({
        isStart: false,
        deviceId: this.deviceId,
        name: this.deviceName
    })
    xBlufi.listenDeviceMsgEvent(false, this.blufiEventHandler)
    this.clearAllTimers()
	},
	methods: {
		blufiBtnHandle() {
			uni.vibrateShort()
			switch (this.stepActive) {
				case SCAN_STEP:
					if (this.blufiScanStatus) {
						this.clearIntervalTimer()
						xBlufi.notifyStartDiscoverBle({ isStart: false })
						this.blufiloadInfo = '扫描设备'
						this.blufiLoadStatus = false
						this.blufiScanStatus = false
					} else {
						this.blufiScanStatus = true
						xBlufi.notifyStartDiscoverBle({ isStart: true })
						this.blufiloadInfo = '扫描中(点击停止)'
						this.blufiLoadStatus = true
						intervalTimer = setInterval(() => {
							this.blufiUpdateList()
						}, 900)
					}
					break
				case INPUT_STEP:
					this.startConfig()
					break
				case DONE_STEP:
					break
			}
		},
		blufiConnect(e) {
				if (this.isConnecting) return
				this.isConnecting = true
				const deviceId = e.currentTarget.id
				this.blufiloadInfo = '连接中'
				this.blufiLoadStatus = true
				if (intervalTimer) {
						clearInterval(intervalTimer)
						intervalTimer = null
				}
				xBlufi.notifyStartDiscoverBle({ isStart: false })

				const device = this.devicesList.find(item => item.deviceId === deviceId)
				if (!device) {
						this.isConnecting = false
						return
				}

				const name = device.name
				console.log('连接deviceId:' + deviceId)
				xBlufi.notifyConnectBle({ isStart: true, deviceId, name })
				uni.showLoading({ title: '连接蓝牙设备中...', mask: true })
				timeouts.push(setTimeout(() => {
						uni.hideLoading()
						uni.showToast({ title: '连接超时，请重试', icon: 'none' })
						this.blufiReset()
				}, 15000))
		},
		blufiEventHandler(options) {
			switch (options.type) {
				case xBlufi.XBLUFI_TYPE.TYPE_GET_DEVICE_LISTS:
					if (options.result) {
						this.devicesListTemp = options.data
					}
					break
				case xBlufi.XBLUFI_TYPE.TYPE_CONNECTED:
					console.log('连接回调：' + JSON.stringify(options))
					uni.hideLoading()
					if (options.result) {
						uni.showToast({ title: '连接成功', icon: 'none' })
						this.clearAllTimers()
						this.blufiloadInfo = '配置WiFi'
						this.stepActive = 1
						this.blufiLoadStatus = false
						this.isConnecting = false
						this.deviceId = options.data.deviceId
						xBlufi.notifyInitBleEsp32({ deviceId: options.data.deviceId })
						this.initWifi()
						sequenceCount = 0
					} else {
						if (this.stepActive > 0) return  // 已连接成功，忽略多余的失败回调
						uni.showToast({ title: '蓝牙连接失败，请重试', icon: 'none' })
						this.blufiReset()
					}
					break
				case xBlufi.XBLUFI_TYPE.TYPE_GET_DEVICE_LISTS_START:
					if (!options.result) {
						this.clearIntervalTimer()
						this.blufiScanStatus = false
						this.blufiLoadStatus = false
						this.blufiloadInfo = '扫描设备'
						const errCode = options.data && options.data.errCode
						if (errCode === 10001) {
							uni.showModal({
								title: '提示',
								content: '蓝牙未开启，请打开蓝牙后重试',
								showCancel: false
							})
						} else if (errCode === 10000) {
							uni.showModal({
								title: '提示',
								content: '设备不支持蓝牙功能',
								showCancel: false
							})
						} else {
							uni.showModal({
								title: '提示',
								content: '蓝牙打开失败，请检查蓝牙权限或隐私授权后重试',
								showCancel: false
							})
						}
					}
					break
				case xBlufi.XBLUFI_TYPE.TYPE_GET_DEVICE_LISTS_STOP:
					this.blufiLoadStatus = false
					this.blufiScanStatus = false
					break
				case xBlufi.XBLUFI_TYPE.TYPE_STATUS_CONNECTED:
					if (!options.result && this.stepActive > 0 && this.deviceId) {
						uni.showToast({ title: '蓝牙连接已断开', icon: 'none' })
						this.blufiReset()
					}
					break
				case xBlufi.XBLUFI_TYPE.TYPE_CONNECT_ROUTER_RESULT:
					uni.hideLoading()
					if (!options.result) {
						uni.showModal({
							title: '温馨提示',
							content: '配网失败，请重试',
							showCancel: false
						})
						this.blufiReset()
					} else {
						if (options.data.progress === 100) {
							console.log(options.data.ssid)
							this.stepActive = 2
							this.blufiloadInfo = '配网成功'
							this.blufiLoadStatus = false
							this.clearAllTimers()
							setTimeout(() => {
								uni.closeBLEConnection({ deviceId: this.deviceId })
								this.blufiReset()
							}, 1500)
						}
					}
					break
				case xBlufi.XBLUFI_TYPE.TYPE_RECIEVE_CUSTON_DATA:
					console.log('收到设备发来的自定义数据结果：', options.data)
					break
				case xBlufi.XBLUFI_TYPE.TYPE_INIT_ESP32_RESULT:
					uni.hideLoading()
					console.log('初始化结果：', JSON.stringify(options))
					if (options.result) {
						console.log('初始化成功')
					} else {
						console.log('初始化失败')
						uni.showModal({
							title: '温馨提示',
							content: '设备初始化失败',
							showCancel: false,
							success: () => {
								uni.redirectTo({ url: '../search/search' })
							}
						})
					}
					break
			}
		},
		blufiReset() {
			if (this.deviceId) {
				uni.closeBLEConnection({ deviceId: this.deviceId })
			}
			this.blufiloadInfo = '扫描设备'
			this.blufiLoadStatus = false
			this.blufiScanStatus = false
			this.stepActive = 0
			this.devicesList = []
			this.devicesListTemp = []
			this.deviceId = ''
			this.macFilter = ''
			this.clearAllTimers()
			this.isConnecting = false
		},
		blufiUpdateList() {
			let list = this.devicesListTemp.slice()
			list.sort((a, b) => b.RSSI - a.RSSI)
			this.devicesList = list
		},
		blufiTimeoutHandle() {
			uni.hideLoading()
			uni.showToast({ title: '配网超时, 复位设备重试', icon: 'none' })
			this.blufiReset()
		},
		clearAllTimers() {
			timeouts.forEach(t => clearTimeout(t))
			timeouts = []
			if (intervalTimer) {
				clearInterval(intervalTimer)
				intervalTimer = null
			}
		},
		clearIntervalTimer() {
			if (intervalTimer) {
				clearInterval(intervalTimer)
				intervalTimer = null
			}
		},
		encodeUtf8(text) {
			const code = encodeURIComponent(text)
			const bytes = []
			for (var i = 0; i < code.length; i++) {
				const c = code.charAt(i)
				if (c === '%') {
					const hex = code.charAt(i + 1) + code.charAt(i + 2)
					const hexVal = parseInt(hex, 16)
					bytes.push(hexVal)
					i += 2
				} else {
					bytes.push(c.charCodeAt(0))
				}
			}
			return bytes
		},
		ipChange(e) {
			var value = (e.detail.value || '').trim()
			if (value === '' || /^[a-zA-Z0-9.\-]+$/.test(value)) {
				this.ip = value
			} else {
				uni.showToast({ title: 'IP地址仅限输入英文、数字、符、.和-', icon: 'none' })
			}
		},
		portChange(e) {
			var value = (e.detail.value || '').trim()
			if (value === '' || /^[0-9]+$/.test(value)) {
				this.port = value
			} else {
				uni.showToast({ title: '端口号仅限输入数字', icon: 'none' })
			}
		},
		startConfig() {
			if (!this.ssid) {
				uni.showToast({ title: 'SSID不能为空', icon: 'none' })
				return
			}
			if (this.isMoreMsg && !this.ip) {
				uni.showToast({ title: 'IP地址不能为空', icon: 'none' })
				return
			}
			if (this.isMoreMsg && !this.port) {
				uni.showToast({ title: '端口号不能为空', icon: 'none' })
				return
			}
			this.connectWifi()
			if (this.isMoreMsg) {
				const customData = JSON.stringify({
					[this.serverType]: {
						addr: this.ip,
						port: this.port
					}
				})
				const type = (0x13 << 2) | 0x01
				let customPayload = [type, 0x00, sequenceCount++]
				var tempCustomPayload = []
				for (var i = 0; i < customData.length; i++) {
					var utf8 = this.encodeUtf8(customData[i])
					tempCustomPayload.push(...utf8)
				}
				customPayload.push(tempCustomPayload.length)
				customPayload = [...customPayload, ...tempCustomPayload]
				var customArray = new Uint8Array(customPayload)
				this.writeCharacteristicValue(customArray.buffer)
			}
		},
		connectWifi() {
			uni.showLoading({ title: '正在配网', mask: true })
			this.blufiloadInfo = '配网中'
			this.blufiLoadStatus = true

			let ssidPayload = [0x09, 0x00, sequenceCount++]
			let pwdPayload = [0x0D, 0x00, sequenceCount++]
			let connectPayload = [0x0C, 0x00, 0x02, sequenceCount++]

			var tempSsidPayload = []
			for (var i = 0; i < this.ssid.length; i++) {
				var ssidUtf8 = this.encodeUtf8(this.ssid[i])
				tempSsidPayload.push(...ssidUtf8)
			}
			ssidPayload.push(tempSsidPayload.length)
			ssidPayload.push(...tempSsidPayload)

			var tempPwdPayload = []
			for (var i = 0; i < this.password.length; i++) {
				var pwdUtf8 = this.encodeUtf8(this.password[i])
				tempPwdPayload.push(...pwdUtf8)
			}
			pwdPayload.push(tempPwdPayload.length)
			pwdPayload.push(...tempPwdPayload)

			var ssidArray = new Uint8Array(ssidPayload)
			var passwordArray = new Uint8Array(pwdPayload)
			var connectCMD = new Uint8Array(connectPayload)

			this.writeCharacteristicValue(ssidArray.buffer)

			timeouts.push(setTimeout(() => {
				this.writeCharacteristicValue(passwordArray.buffer)
			}, 1000))

			timeouts.push(setTimeout(() => {
				this.writeCharacteristicValue(connectCMD.buffer)
			}, 2000))

			timeouts.push(setTimeout(() => {
				this.blufiTimeoutHandle()
			}, 60000))
		},
		writeCharacteristicValue(data) {
			uni.writeBLECharacteristicValue({
				deviceId: this.deviceId,
				serviceId: '0000FFFF-0000-1000-8000-00805F9B34FB',
				characteristicId: '0000FF01-0000-1000-8000-00805F9B34FB',
				value: data
			})
		},
		initWifi() {
				uni.authorize({
						scope: 'scope.userLocation',
						success: () => {
								uni.startWifi()
								uni.getConnectedWifi({
										success: (res) => {
												let password = uni.getStorageSync(res.wifi.SSID)
												console.log('restore password:', password)
												this.ssid = res.wifi.SSID
												this.password = password || ''
										},
										fail: () => {
												this.ssid = ''
										}
								})
						},
						fail: () => {
								this.ssid = ''
						}
				})
		},
		onSelectServerType(opt) {
			this.serverType = opt.value
			this.serverTypeName = opt.name
			this.showServerTypePopup = false
		},
		goBack() {
			uni.navigateBack()
		}
	}
}
</script>

<style lang="scss" scoped>
.blufi-page-container {
	min-height: 100vh;
	width: 100%;
	display: flex;
	flex-direction: column;
	background-color: #f5f5f5;
}

.blufi-step-wrapper {
	padding: 20rpx 30rpx;
	background-color: #fff;
}

.steps-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.step-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;

	.step-dot {
		width: 48rpx;
		height: 48rpx;
		border-radius: 50%;
		background-color: #ddd;
		color: #fff;
		font-size: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 8rpx;
	}

	.step-text {
		font-size: 22rpx;
		color: #999;
	}

	&.active {
		.step-dot {
			background-color: #1890ff;
		}

		.step-text {
			color: #1890ff;
		}
	}
}

.blufi-filter-wrapper {
	padding: 16rpx 25rpx;
	background-color: #fff;

	.filter-input {
		background-color: #f7f8fa;
		border-radius: 8rpx;
		padding: 16rpx 24rpx;
		font-size: 28rpx;
	}
}

.blufi-list-wrapper {
	flex: 1;
	padding: 20rpx 25rpx;
	padding-bottom: 220rpx;
	background-color: #f7f8fa;
	border-radius: 12rpx;
	box-sizing: border-box;
}

.blufi-list-item {
	margin: 16rpx;
	border-radius: 12rpx;
	background-color: #fff;
	overflow: hidden;
}

.device-cell {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx;
	overflow: hidden;

	.device-info {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
		overflow: hidden;

		.device-name {
			font-size: 28rpx;
			color: #333;
			margin-bottom: 8rpx;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.device-id {
			font-size: 22rpx;
			color: #999;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	.device-rssi {
		font-size: 24rpx;
		color: #666;
		margin-left: 16rpx;
		flex-shrink: 0;
	}
}

.blufi-note-content {
	text-align: center;
	color: #6b6b6b;
	font-size: 32rpx;
	font-weight: bold;
	margin-top: 100rpx;
}

.blufi-wifi-input-wrapper {
	flex: 1;
	padding: 25rpx;
	padding-bottom: 160rpx;
	display: flex;
	align-items: center;
	flex-direction: column;
	overflow-y: auto;
	background-color: #fff;
}

.blufi-wifi-input-cover {
	height: 300rpx;
	width: 300rpx;
	margin-bottom: 30rpx;
}

.wifi-form {
	width: 100%;
	background-color: #fff;
	border-radius: 12rpx;
	padding: 10rpx 24rpx;
}

.form-cell {
	display: flex;
	align-items: center;
	padding: 24rpx 0;
	border-bottom: 1rpx solid #f0f0f0;

	&:last-child {
		border-bottom: none;
	}

	&.checkbox-cell {
		padding: 20rpx 0;
	}

	.form-label {
		width: 160rpx;
		font-size: 28rpx;
		color: #333;
		flex-shrink: 0;
	}

	.form-input {
		flex: 1;
		font-size: 28rpx;
		color: #333;
	}

	.form-value-row {
		flex: 1;
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}

	.form-value {
		font-size: 28rpx;
		color: #666;
	}

	.arrow {
		font-size: 32rpx;
		color: #ccc;
		margin-left: 8rpx;
	}

	.checkbox-label {
		font-size: 28rpx;
		color: #333;
		margin-left: 12rpx;
	}
}

.pwd-row {
	flex: 1;
	display: flex;
	align-items: center;

	.form-input {
		flex: 1;
	}

	.eye-icon {
		font-size: 36rpx;
		margin-left: 16rpx;
		padding: 8rpx;
	}
}

.blufi-success-wrapper {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	.success-text {
		font-size: 48rpx;
		color: #07c160;
		margin-bottom: 30rpx;
	}

	.success-icon {
		font-size: 160rpx;
		color: #07c160;
	}
}

.blufi-btn-wrapper {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 30rpx 40rpx;
	padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
	background-color: #f5f5f5;
	z-index: 50;
}

.blufi-btn {
	width: 100%;
	height: 88rpx;
	background-color: #1890ff;
	color: #fff;
	font-size: 32rpx;
	border-radius: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;

	&::after {
		border: none;
	}
}

.action-sheet-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 100;
}

.action-sheet {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #fff;
	border-radius: 24rpx 24rpx 0 0;
	z-index: 101;
	padding-bottom: env(safe-area-inset-bottom);
}

.action-sheet-item {
	padding: 32rpx;
	text-align: center;
	font-size: 32rpx;
	color: #333;
	border-bottom: 1rpx solid #f0f0f0;

	&:active {
		background-color: #f5f5f5;
	}
}

.action-sheet-cancel {
	padding: 32rpx;
	text-align: center;
	font-size: 32rpx;
	color: #999;
	border-top: 12rpx solid #f5f5f5;

	&:active {
		background-color: #f5f5f5;
	}
}
</style>
