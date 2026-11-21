<template>
	<view class="timer-page">
		<view class="device-info">
			<text class="label">设备名称</text>
			<text class="value">{{deviceInfo.NICK_NAME? `${deviceInfo.NICK_NAME}(${deviceInfo.NAME})` : deviceInfo.NAME}}</text>
		</view>
		<view class="timer-list" v-if="timerList.length">
			<view class="timer-item" v-for="(item, index) in timerList" :key="index">
				<view class="timer-left">
					<text class="timer-name">{{item.NAME }}</text>
					<text class="timer-time">{{item.DISPLAY_TIME || item.TIME}}</text>
					<text class="timer-repeat">{{formatRepeat(item.ENABLE, item.WEEK)}}</text>
					<view class="timer-order">
						<text class="order-label">执行:</text>
						<text :class="['order-value', item.ORDER == '1' ? 'open' : 'close']">{{item.ORDER == '1' ? '打开' : '关闭'}}</text>
					</view>
				</view>
				<view class="timer-right">
					<text class="edit-btn" @click="editTimer(item)">编辑</text>
					<text class="delete-btn" @click="deleteTimer(item)">删除</text>
				</view>
			</view>
		</view>
		<view class="empty-tip" v-else>
			<text>暂无定时任务</text>
		</view>

		<view class="add-timer-btn" @click="showAddTimer">
			<text>+ 添加定时</text>
		</view>

		<!-- 添加定时弹窗 -->
		<uni-popup ref="addPopup" type="bottom">
			<view class="add-timer-popup">
				<view class="popup-header">
					<text class="cancel-btn" @click="closePopup">取消</text>
					<text class="popup-title">{{isEdit ? '编辑定时' : '添加定时'}}</text>
					<text class="confirm-btn" @click="saveTimer">保存</text>
				</view>
				<view class="popup-content">
					<uni-section title="名称" type="line">
						<uni-easyinput v-model="form.NAME" :disabled="isEdit" placeholder="请输入定时名称" />
					</uni-section>
					<uni-section title="时间" type="line">
						<picker mode="time" :value="form.TIME" @change="onTimeChange">
							<view class="time-picker">
								<text>{{form.TIME || '请选择时间'}}</text>
							</view>
						</picker>
					</uni-section>
					<uni-section title="执行" type="line">
						<view class="order-selector">
							<text :class="['order-btn', form.ORDER == '1' ? 'active' : '']" @click="form.ORDER = '1'">打开</text>
							<text :class="['order-btn', form.ORDER == '0' ? 'active' : '']" @click="form.ORDER = '0'">关闭</text>
						</view>
					</uni-section>
					<uni-section title="重复类型" type="line">
						<uni-data-checkbox v-model="form.ENABLE" :disabled="isEdit" :localdata="type_work"></uni-data-checkbox>
					</uni-section>
					<uni-section title="周选" type="line" v-if="form.ENABLE == '3'">
						<uni-data-checkbox multiple v-model="form.WEEK" :localdata="weekList"></uni-data-checkbox>
					</uni-section>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
const weekly = ['0', '1', '2', '3', '4', '5', '6']
import {getDeviceTimerList, setDeviceTimer, delTask} from '../../api/api.js'
export default {
	data() {
		return {
			type: 'device',
			deviceInfo: {},
			timerList: [],
			isEdit: false,
			form: {
				NAME: '',
				TIME: '',
				ENABLE: '',
				WEEK: [],
				ORDER: '1',
				DEVID:'',
				ID:''
			},
			stateList: [
				{text: '开启', value: '1'},
				{text: '关闭', value: '0'}
			],
			type_work: [
				{text: '不工作', value: '0'},
				{text: '单次', value: '1'},
				{text: '每天', value: '2'},
				{text: '周选', value: '3'}
			],
			weekList: [
				{text: '周六', value: '0'},
				{text: '周日', value: '1'},
				{text: '周一', value: '2'},
				{text: '周二', value: '3'},
				{text: '周三', value: '4'},
				{text: '周四', value: '5'},
				{text: '周五', value: '6'}
			]
		}
	},
	onLoad(options) {
		this.type = options.type || 'device'
		const eventChannel = this.getOpenerEventChannel()
		eventChannel.on('timerData', (data) => {
			this.deviceInfo = data
			this.getTimerList()
		})
	},
	methods: {
		// 获取定时列表
		getTimerList() {
			getDeviceTimerList().then(res => {
				this.list = res.KEYWORD ||[]
				this.timerList = (res.KEYWORD || []).map(item => {
          if (item.ENABLE === '3' && typeof item.WEEK === 'string') {
            item.WEEK = JSON.parse(item.WEEK)
          }
          // 处理WEEK 为 0 1 2 3 4 5 6 格式
          item.WEEK = weekly.filter((i) => item.WEEK[i] === 1 || item.WEEK[item] === '1')
          // 时间格式转换：xx-xx 转 xx:xx 用于显示
          if (item.TIME) {
            item.DISPLAY_TIME = item.TIME.replace('-', ':')
          }
          return item
        }).filter(item => item.DEVID === this.deviceInfo.DEVID)
			}).catch(() => {
				this.timerList = []
			})
		},
		// 显示添加定时弹窗
		showAddTimer() {
			this.isEdit = false
			this.form = {
				NAME: this.getNextName(),
				TIME: '',
				ENABLE: '',
				WEEK: [],
				ORDER: '1',
				DEVID:this.deviceInfo.DEVID,
				ID:this.generateUUID8() + ''
			}
			this.$refs.addPopup.open()
		},
		// 编辑定时
		editTimer(item, index) {
			this.isEdit = true
			this.form = {
				ID: item.ID,
				NAME: item.NAME || '',
				TIME: item.TIME ? item.TIME.replace('-', ':') : '', // 将xx-xx格式转换为xx:xx供picker使用
				ENABLE: item.ENABLE,
				WEEK: item.WEEK ? item.WEEK : [],
				ORDER: item.ORDER || '1',
				DEVID:item.DEVID
			}
			this.$refs.addPopup.open()
		},
		// 关闭弹窗
		closePopup() {
			this.$refs.addPopup.close()
		},
		// 时间选择
		onTimeChange(e) {
			this.form.TIME = e.detail.value
		},
		// 保存定时
		saveTimer() {
			if (!this.form.NAME) {
				uni.showToast({title: '请输入名称', icon: 'none'})
				return
			}
			if (!this.form.TIME) {
				uni.showToast({title: '请选择时间', icon: 'none'})
				return
			}
			if (this.form.ENABLE == '3' && this.form.WEEK.length == 0) {
				uni.showToast({title: '请选择周几', icon: 'none'})
				return
			}
			const params = { ...this.form }
			// 时间格式转换：xx:xx 转 xx-xx 用于服务端
			params.TIME = params.TIME.replace(':', '-')
			// 将WEEK转换为字符串 并处理成对应的格式 O 为不工作 1为工作
      params.WEEK = params.ENABLE === '3' ? weekly.map(item => params.WEEK.includes(item) ? '1' : '0') : ['0', '0', '0', '0', '0', '0', '0']
			setDeviceTimer(params).then(res => {
				uni.showToast({title: this.isEdit ? '修改成功' : '添加成功', icon: 'success'})
				this.closePopup()
				this.getTimerList()
			}).catch(() => {
				uni.showToast({title: this.isEdit ? '修改失败' : '添加失败', icon: 'none'})
			})
		},
		// 删除定时
		deleteTimer(item) {
			uni.showModal({
				title: '提示',
				content: '确定删除该定时任务吗？',
				success: (res) => {
					if (res.confirm) {
						delTask({ ID: item.ID, DEVID: item.DEVID }).then(() => {
							uni.showToast({ title: '删除成功', icon: 'success' })
							this.getTimerList()
						}).catch(() => {
							uni.showToast({ title: '删除失败', icon: 'none' })
						})
					}
				}
			})
		},
		// 格式化重复
		formatRepeat(enable, week) {
			if (enable == '0') return '不工作'
			if (enable == '1') return '单次'
			if (enable == '2') return '每天'
			if (enable == '3' && week) {
				const WEEK = { 0: '周六', 1: '周日', 2: '周一', 3: '周二', 4: '周三', 5: '周四', 6: '周五' }
      	return `周选（${week.map(item => WEEK[item]).join('、')}）`
			}
			return ''
		},
		// 获取当前列表最大的ID + 1
    getNextId () {
      if (!this.list || this.list.length === 0) return 1
      const maxId = Math.max(...this.list.map(item => Number(item.ID) || 0))
      return maxId + 1
    },
		// 自动递增的名称，确保不与已有定时重复
		getNextName() {
			const baseName = this.deviceInfo.NAME
			let index = this.timerList.length
			let name = baseName + index
			const allNames = (this.list || []).map(item => item.NAME)
			while (allNames.includes(name)) {
				index++
				name = baseName + index
			}
			return name
		},
		// 生成8位随机UUID
    generateUUID8 () {
      const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
      let uuid = ''
      for (let i = 0; i < 8; i++) {
        uuid += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return uuid
    }
	}
}
</script>

<style lang="scss">
.timer-page {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding: 15px;
	padding-bottom: 50px;
	box-sizing: border-box;
}
.device-info {
	background-color: #fff;
	padding: 15px;
	border-radius: 8px;
	display: flex;
	justify-content: space-between;
	margin-bottom: 15px;
	.label {
		font-size: 14px;
		color: #333;
	}
	.value {
		font-size: 14px;
		color: #666;
	}
}
.timer-list {
	.timer-item {
		background-color: #fff;
		padding: 15px;
		border-radius: 8px;
		margin-bottom: 10px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.timer-left {
		.timer-name {
			font-size: 14px;
			color: #333;
			display: block;
			margin-bottom: 5px;
		}
		.timer-time {
			font-size: 24px;
			font-weight: 500;
			color: #333;
			display: block;
		}
		.timer-action {
			font-size: 12px;
			color: #1890ff;
			margin-right: 10px;
		}
		.timer-repeat {
			font-size: 12px;
			color: #999;
			margin-bottom: 6px;
		}
		.timer-order {
			font-size: 12px;
			display: flex;
			align-items: center;
			gap: 6px;
		}
		.order-label {
			color: #999;
		}
		.order-value {
			padding: 2px 8px;
			border-radius: 3px;
			font-size: 11px;
			font-weight: 500;
			&.open {
				background-color: #e6f7ff;
				color: #1890ff;
			}
			&.close {
				background-color: #fff1f0;
				color: #ff4d4f;
			}
		}
	}
	.timer-right {
		display: flex;
		align-items: center;
		gap: 10px;
		.edit-btn {
			font-size: 14px;
			color: #1890ff;
		}
		.delete-btn {
			font-size: 14px;
			color: #ff4d4f;
		}
	}
}
.empty-tip {
	text-align: center;
	padding: 50px 0;
	color: #999;
	font-size: 14px;
}
.add-timer-btn {
	position: fixed;
	bottom: 8px;
	left: 15px;
	right: 15px;
	background-color: #1890ff;
	color: #fff;
	text-align: center;
	padding: 12px 0;
	border-radius: 8px;
	font-size: 16px;
}
.add-timer-popup {
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
		padding: 0 15px 30px;
		.time-picker {
			padding: 10px 0;
			font-size: 14px;
			color: #333;
		}
		.order-selector {
			display: flex;
			gap: 10px;
			padding: 10px 0;
		}
		.order-btn {
			flex: 1;
			padding: 8px 12px;
			border-radius: 4px;
			border: 1px solid #d9d9d9;
			background-color: #fafafa;
			color: #666;
			font-size: 14px;
			text-align: center;
			transition: all 0.2s;
			&.active {
				background-color: #e6f7ff;
				border-color: #1890ff;
				color: #1890ff;
				font-weight: 500;
			}
		}
	}
}
</style>
