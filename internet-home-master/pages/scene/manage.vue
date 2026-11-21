<template>
	<view class="manage-page">
		<view class="scene-info">
			<text class="label">场景名称</text>
			<text class="value">{{sceneData.NAME}}</text>
		</view>

		<!-- 添加设备按钮 -->
		<view class="add-device-btn" @click="showAddDevice">
			<text>+ 添加设备</text>
		</view>

		<!-- 已选设备列表 -->
		<view class="device-list" v-if="selectedDevicesList.length">
			<view class="list-title">已选设备</view>
			<view class="device-item" v-for="(item, index) in selectedDevicesList" :key="index">
				<view class="device-left">
					<view class="device-header">
						<text class="device-name">{{item.NICK_NAME || item.NAME}}</text>
						<text v-if="item.NICK_NAME" class="origin-name">({{item.NAME}})</text>
					</view>
				</view>
				<view class="device-right">
					<view class="control-group">
						<switch :checked="item.STATE == '1'" @change="(e) => toggleDeviceState(item, e)"></switch>
						<view class="remove-btn" @click="removeDevice(index)">移除</view>
					</view>
				</view>
			</view>
		</view>

		<view class="empty-tip" v-if="!selectedDevicesList.length">
			<text>还没有添加设备，请点击上方添加设备按钮</text>
		</view>

		<!-- 添加设备弹窗 -->
		<uni-popup ref="addDevicePopup" type="bottom">
			<view class="add-device-popup">
				<view class="popup-header">
					<text class="cancel-btn" @click="closeAddDevice">取消</text>
					<text class="popup-title">选择设备</text>
					<text class="confirm-btn" @click="confirmAddDevice">确定</text>
				</view>
				<view class="popup-content">
					<view class="device-checkbox-list">
						<uni-data-checkbox mode="button" multiple v-model="selectedDevices" :localdata="hobby"></uni-data-checkbox>
					</view>
				</view>
			</view>
		</uni-popup>

		<!-- 保存按钮 -->
		<view class="save-btn-wrap">
			<button class="save-btn" @click="saveChanges">保存修改</button>
		</view>
	</view>
</template>

<script>
	import { getDeviceList, modifyScene, getSceneEquipment } from '../../api/api.js'
	export default {
		data() {
			return {
				sceneData: {},
				allDevices: [],
				selectedDevices: [],
				selectedDevicesList: []
			}
		},
		onLoad() {
			const eventChannel = this.getOpenerEventChannel()
			eventChannel.on('sceneData', (data) => {
				this.sceneData = data
				uni.setNavigationBarTitle({
					title: this.sceneData.NAME
				})
				this.loadAllDevices().then(() => {
					// 加载完所有设备后，加载该场景的设备并回填
					this.loadSceneDevices()
				})
			})
		},
		computed: {
			hobby() {
				return this.allDevices.map(item =>{
					const NAME = item.NICK_NAME ? `${item.NICK_NAME}(${item.NAME})` : item.NAME
					return {text:NAME,value:item.ID}
				})
			}
		},
		methods: {
			loadAllDevices() {
				return getDeviceList().then(res => {
					if (res.KEYWORD) {
						this.allDevices = res.KEYWORD
					}
				}).catch(() => {
					this.allDevices = []
				})
			},
			// 加载场景下的已有设备并回填
			loadSceneDevices() {
				const sceneId = this.sceneData.SCENEID || this.sceneData.ID
				if (!sceneId) return

				getSceneEquipment(sceneId).then(res => {
					if (res.KEYWORD && res.KEYWORD.length > 0) {
						const sceneData = res.KEYWORD[0]
						if (sceneData.DEVLIST && sceneData.DEVLIST.length > 0) {
							// 回填已有设备，保持服务端原始数据格式
							this.selectedDevicesList = sceneData.DEVLIST.map(item => {
								const deviceInfo = this.allDevices.find(d => d.ID === item.ID)
								return {
									SCENE_ID: sceneId,
									ID: item.ID,
									STATE: item.STATE,  // 直接使用服务端返回的STATE，不做任何默认处理
									NAME: deviceInfo ? (deviceInfo.NICK_NAME ? `${deviceInfo.NICK_NAME}(${deviceInfo.NAME})` : deviceInfo.NAME) : ''
								}
							})
						}
					}
				}).catch(() => {
					// 如果查询失败，不影响正常的添加编辑流程
					console.log('加载场景设备失败')
				})
			},
			showAddDevice() {
				// 初始化临时选中ID
				this.selectedDevices = this.selectedDevicesList.map(i=>i.ID)
				this.$refs.addDevicePopup.open()
			},
			closeAddDevice() {
				this.$refs.addDevicePopup.close()
			},
			confirmAddDevice() {
				const sceneId = this.sceneData.SCENEID || this.sceneData.ID
				this.selectedDevicesList = this.allDevices.filter(item=>{
					return this.selectedDevices.includes(item.ID)
				}).map(item=>{
					const obj = this.selectedDevicesList.find(i=>i.ID===item.ID)
					return {
						SCENE_ID:sceneId,
						ID:item.ID,
						STATE:obj ? obj.STATE:'0',
						NAME: item.NICK_NAME ?`${item.NICK_NAME}(${item.NAME})` : item.NAME
					}
				})
				this.closeAddDevice()

			},
			toggleDeviceState(item, e) {
				const newState = e.detail.value ? '1' : '0'
				const index = this.selectedDevicesList.findIndex(d => d.ID === item.ID)
				if (index > -1) {
					this.$set(this.selectedDevicesList[index], 'STATE', newState)
				}

			},
			removeDevice(index) {
				this.selectedDevicesList.splice(index, 1)
			},
			saveChanges() {
				if (!this.selectedDevicesList.length) {
					uni.showToast({
						title: '请至少选择一个设备',
						icon: 'none'
					})
					return
				}

				if (!this.sceneData.SCENEID && !this.sceneData.ID) {
					uni.showToast({
						title: '场景信息获取失败',
						icon: 'none'
					})
					return
				}

				// 构建修改数据
				const modifyData = this.selectedDevicesList.map(i=>{
					const {SCENE_ID,ID,STATE} = i
					return {SCENE_ID,ID,STATE}
				})
				// 调用修改场景接口
				modifyScene(modifyData).then(res => {
					uni.showToast({
						title: '场景已保存',
						icon: 'success'
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				}).catch(() => {
					uni.showToast({
						title: '保存失败，请重试',
						icon: 'none'
					})
				})
			}
		}
	}
</script>

<style lang="scss">
.manage-page {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding: 15px;
	padding-bottom: 72px;
	box-sizing: border-box;
}

.scene-info {
	background-color: #fff;
	padding: 15px;
	border-radius: 8px;
	display: flex;
	justify-content: space-between;
	margin-bottom: 20px;
	.label {
		font-size: 14px;
		color: #333;
		font-weight: 500;
	}
	.value {
		font-size: 14px;
		color: #666;
	}
}

.add-device-btn {
	background-color: #e6f7ff;
	border: 1px solid #1890ff;
	border-radius: 8px;
	padding: 12px;
	text-align: center;
	margin-bottom: 20px;
	text {
		font-size: 14px;
		color: #1890ff;
		font-weight: 500;
	}
	&:active {
		background-color: #bae7ff;
	}
}

.device-list {
	background-color: #fff;
	border-radius: 8px;
	overflow: hidden;
	margin-bottom: 20px;
}

.list-title {
	padding: 12px 15px;
	border-bottom: 1px solid #f0f0f0;
	font-size: 13px;
	color: #999;
	background-color: #fafafa;
}

.device-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 15px;
	border-bottom: 1px solid #f0f0f0;
	&:last-child {
		border-bottom: none;
	}
}

.device-left {
	flex: 1;
}

.device-header {
	display: flex;
	align-items: center;
	gap: 6px;
}

.device-name {
	font-size: 14px;
	color: #333;
	font-weight: 500;
}

.origin-name {
	font-size: 12px;
	color: #999;
}

.device-right {
	margin-left: 10px;
}

.control-group {
	display: flex;
	align-items: center;
	gap: 12px;
}

.remove-btn {
	background-color: #fff1f0;
	color: #ff4d4f;
	border: 0.5px solid #ff4d4f;
	border-radius: 4px;
	padding: 6px 12px;
	font-size: 12px;
	text-align: center;
	transition: all 0.2s;
	&:active {
		background-color: #ffccc7;
	}
}

.empty-tip {
	text-align: center;
	padding: 50px 15px;
	color: #999;
	font-size: 14px;
	background-color: #fff;
	border-radius: 8px;
	margin-bottom: 20px;
}

.add-device-popup {
	background-color: #fff;
	border-radius: 16px 16px 0 0;
	max-height: 80vh;
	overflow-y: auto;
	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px;
		border-bottom: 1px solid #f0f0f0;
		position: sticky;
		top: 0;
		background-color: #fff;
		z-index: 1;
		.cancel-btn {
			font-size: 14px;
			color: #999;
		}
		.popup-title {
			font-size: 16px;
			font-weight: 500;
			color: #333;
		}
		.confirm-btn {
			font-size: 14px;
			color: #1890ff;
		}
	}
	.popup-content {
		padding: 15px;
	}
}

.device-checkbox-list {
	max-height: 500px;
	overflow-y: auto;
}

.checkbox-item {
	padding: 12px 0;
	border-bottom: 1px solid #f0f0f0;
	&:last-child {
		border-bottom: none;
	}
}

.checkbox-wrapper {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 5px 0;
}

.checkbox-label {
	font-size: 14px;
	color: #333;
	flex: 1;
}

.save-btn-wrap {
	position: fixed;
	bottom: 0px;
	left: 0px;
	right: 0px;
	display: flex;
	background-color: #f5f5f5;
	padding: 10px;
}

.save-btn {
	flex: 1;
	background-color: #1890ff;
	color: #fff;
	border: none;
	border-radius: 8px;
	padding: 8px 0;
	font-size: 14px;
	font-weight: 500;
	transition: all 0.3s;
	&:active {
		background-color: #0050b3;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(24, 144, 255, 0.5);
	}
}
</style>
