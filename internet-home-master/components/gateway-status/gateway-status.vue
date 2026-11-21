<template>
	<view class="gateway-status" :class="{ 'online': isOnline, 'offline': !isOnline }">
		<view class="status-container">
			<image class="status-icon" :src="statusIcon"></image>
			<text class="status-text">网关{{ isOnline ? '在线' : '离线' }}</text>
		</view>
	</view>
</template>

<script>
	import { queryterminalOnline } from '../../api/api.js'

	export default {
		name: 'GatewayStatus',
		data() {
			return {
				isOnline: true,
				queryTimer: null
			}
		},
		computed: {
			statusIcon() {
				return this.isOnline ? '/static/xiaodu/in.png' : '/static/xiaodu/out.png'
			}
		},
		mounted() {
			this.queryStatus()
			// 每30秒查询一次网关状态
			this.queryTimer = setInterval(() => {
				this.queryStatus()
			}, 60000)
		},
		beforeDestroy() {
			if (this.queryTimer) {
				clearInterval(this.queryTimer)
			}
		},
		methods: {
			queryStatus() {
				queryterminalOnline().then(res => {
					// 只要接口返回成功，就说明网关在线
					 if (Array.isArray(res.KEYWORD) && res.KEYWORD[0]) {
						const { TIMESTAMP } = res.KEYWORD[0]
						if(TIMESTAMP){
							const date = this.formatCustomDate(TIMESTAMP)
							this.isOnline = (new Date().getTime() - new Date(date).getTime()) < (30 * 1000)
						}else{
							this.isOnline = false
						}
					} else {
						this.isOnline = false
					}
				}).catch(() => {
					// 接口报错说明网关离线
					this.isOnline = false
				})
			},
			formatCustomDate(dateStr) {
				// 提取各部分 (假设输入总是这个固定长度)
				const year = dateStr.substring(0, 4);
				const month = dateStr.substring(5, 7);
				const day = dateStr.substring(8, 10);
				const hour = dateStr.substring(10, 12); // 直接接着取
				const minute = dateStr.substring(13, 15);
				const second = dateStr.substring(16, 18);

				// 返回标准格式字符串
				return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
			}
		}
	}
</script>

<style lang="scss" scoped>
.gateway-status {
	padding: 8px 12px;
	border-radius: 6px;
	transition: all 0.3s;

	&.online {
		background-color: #f6ffed;
		border: 1px solid #b7eb8f;
	}

	&.offline {
		background-color: #fff1f0;
		border: 1px solid #ffccc7;
	}

	.status-container {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.status-icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}

	.status-text {
		font-size: 12px;
		font-weight: 500;

		.online & {
			color: #52c41a;
		}

		.offline & {
			color: #ff4d4f;
		}
	}
}
</style>
