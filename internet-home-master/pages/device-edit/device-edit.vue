<template>
	<view class="edit-page">
		<view class="form-item">
			<text class="label">设备名称</text>
			<text class="value">{{deviceInfo.NAME}}</text>
		</view>
		<view class="form-item">
			<text class="label">设备别名</text>
			<input class="input" type="text" maxlength="10" v-model="alias" placeholder="请输入设备别名" />
		</view>
		<view class="btn-wrap">
			<button class="btn-save" @click="saveAlias">保存</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				deviceInfo: {},
				alias: ''
			}
		},
		onLoad(options) {
			// 接收设备信息
			const eventChannel = this.getOpenerEventChannel()
			eventChannel.on('deviceData', (data) => {
				this.deviceInfo = data
				this.alias = data.NICK_NAME || data.NAME
			})
		},
		methods: {
			saveAlias() {
				if (!this.alias.trim()) {
					uni.showToast({ title: '请输入别名', icon: 'none' })
					return
				}
				this.$api({ OBJECT: 'WEIFA', ACTIVE: 'MAC_NICK_NAME', KEYWORD: [{ ID: this.deviceInfo.DEVID, NAME: this.alias }] }).then(res => {
					uni.showToast({ title: '保存成功', icon: 'success' })
					setTimeout(() => { uni.navigateBack() }, 1500)
				}).catch(err => {
					uni.showToast({ title: '保存失败', icon: 'none' })
				})
			}
		}
	}
</script>

<style lang="scss">
.edit-page {
	padding: 20px;
	background-color: #f5f5f5;
	min-height: 100vh;
	box-sizing: border-box;

	.form-item {
		background-color: #fff;
		padding: 15px;
		border-radius: 8px;
		margin-bottom: 15px;
		display: flex;
		align-items: center;
		justify-content: space-between;

		.label {
			font-size: 14px;
			color: #333;
			flex-shrink: 0;
		}

		.value {
			font-size: 14px;
			color: #666;
		}

		.input {
			flex: 1;
			text-align: right;
			font-size: 14px;
			color: #333;
		}
	}

	.btn-wrap {
		margin-top: 40px;

		.btn-save {
			background-color: #1890ff;
			color: #fff;
			border: none;
			border-radius: 8px;
			font-size: 16px;
			height: 44px;
			line-height: 44px;

			&:active {
				background-color: #096dd9;
			}
		}
	}
}
</style>
