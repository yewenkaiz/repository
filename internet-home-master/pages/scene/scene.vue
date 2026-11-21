<template>
	<view class="scene-page">
		<view class="scene-info">
			<text class="label">场景名称</text>
			<text class="value">{{sceneData.NAME}}</text>
		</view>
		<view class="timer-list" v-if="timerList.length">
			<view class="timer-item" v-for="(item, index) in timerList" :key="index">
				<view class="timer-left">
					<text class="timer-name">{{item.NAME}}</text>
					<text class="timer-time">{{item.TIME}}</text>
					<text class="timer-repeat">{{formatRepeat(item.ENABLE, item.WEEK)}}</text>
				</view>
				<view class="timer-right" @click="editTimer(item)">
					编辑
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
						<uni-easyinput v-model="form.NAME" placeholder="请输入定时名称" />
					</uni-section>
					<uni-section title="时间" type="line">
						<picker mode="time" :value="form.TIME" @change="onTimeChange">
							<view class="time-picker">
								<text>{{form.TIME || '请选择时间'}}</text>
							</view>
						</picker>
					</uni-section>
					<uni-section title="重复类型" type="line">
						<uni-data-checkbox v-model="form.ENABLE" :localdata="type_work"></uni-data-checkbox>
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
export default {
	data() {
		return {
			sceneData: {},
			timerList: [],
			isEdit: false,
			form: {
				NAME: '',
				TIME: '',
				ENABLE: '',
				WEEK: [],
				SCENEID: '',
				ID: ''
			},
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
	onLoad() {
		const eventChannel = this.getOpenerEventChannel()
		eventChannel.on('sceneData', (data) => {
			this.sceneData = data
			uni.setNavigationBarTitle({
				title: this.sceneData.NAME
			})
			this.getTimerList()
		})
	},
	methods: {
		getTimerList() {
			this.$api({
				OBJECT: 'WEIFA',
				ACTIVE: 'TIMERLIST',
				KEYWORD: []
			}).then(res => {
				this.timerList = (res.KEYWORD || []).map(item => {
					if (item.ENABLE === '3' && typeof item.WEEK === 'string') {
						item.WEEK = JSON.parse(item.WEEK)
					}
					// 处理WEEK 为 0 1 2 3 4 5 6 格式
					item.WEEK = weekly.filter((i) => item.WEEK[i] === 1 || item.WEEK[item] === '1')
					return item
				}).filter(item => item.SCENEID === this.sceneData.ID)
			}).catch(() => {
				this.timerList = []
			})
		},
		showAddTimer() {
			this.isEdit = false
			this.form = {
				NAME: this.sceneData.NAME,
				TIME: '',
				ENABLE: '',
				WEEK: [],
				SCENEID: this.sceneData.ID,
				ID: this.sceneData.ID
			}
			this.$refs.addPopup.open()
		},
		editTimer(item) {
			this.isEdit = true
			this.form = {
				ID: item.ID,
				NAME: item.NAME || '',
				TIME: item.TIME || '',
				ENABLE: item.ENABLE,
				WEEK: item.WEEK ? item.WEEK : [],
				SCENEID: item.SCENEID
			}
			this.$refs.addPopup.open()
		},
		closePopup() {
			this.$refs.addPopup.close()
		},
		onTimeChange(e) {
			this.form.TIME = e.detail.value
		},
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
			// 将WEEK转换为字符串 并处理成对应的格式 0 为不工作 1为工作
			params.WEEK = params.ENABLE === '3' ? weekly.map(item => params.WEEK.includes(item) ? '1' : '0') : ['0', '0', '0', '0', '0', '0', '0']
			this.$api({
				OBJECT: 'WEIFA',
				ACTIVE: 'TIMER',
				KEYWORD: [params]
			}).then(res => {
				uni.showToast({title: this.isEdit ? '修改成功' : '添加成功', icon: 'success'})
				this.closePopup()
				this.getTimerList()
			}).catch(() => {
				uni.showToast({title: this.isEdit ? '修改失败' : '添加失败', icon: 'none'})
			})
		},
		formatRepeat(enable, week) {
			if (enable == '0') return '不工作'
			if (enable == '1') return '单次'
			if (enable == '2') return '每天'
			if (enable == '3' && week) {
				const WEEK = { 0: '周六', 1: '周日', 2: '周一', 3: '周二', 4: '周三', 5: '周四', 6: '周五' }
				return `周选（${week.map(item => WEEK[item]).join('、')}）`
			}
			return ''
		}
	}
}
</script>

<style lang="scss">
.scene-page {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding: 15px;
	padding-bottom: 80px;
	box-sizing: border-box;
}
.scene-info {
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
		.timer-repeat {
			font-size: 12px;
			color: #999;
		}
	}
	.timer-right {
		display: flex;
		align-items: center;
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
	bottom: 30px;
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
	}
}
</style>
