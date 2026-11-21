<template>
	<view class="more-page">
		<image class="home-banner" src="/static/home_banner.png"></image>
		<view class="home-content">
			<view class="title-wrap">
				<p class="title">智能场景</p>
			</view>
			<view class="scroll-wrap">
				<view class="scroll-view_H">
					<view class="scroll-item" v-for="(item,index) in sceneList" :key="index">
						<view class="item-header">
							<view class="icon-wrap">
								<image :src="item.url"></image>
							</view>
							<view class="item-content">
								<view class="scene-name">{{cutover?item.NAME:sceneSwitch(item.NAME)}}</view>
							</view>
						</view>
						<view class="item-footer">
							<view class="action-btn edit-btn" @click.stop="editScene(item)">编辑</view>
							<view class="action-btn timer-btn" @click.stop="timing(item)">定时</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<uni-fab :pattern="pattern" horizontal="right" vertical="bottom" :popMenu="false" @fabClick="triggerAdd" ></uni-fab>
		<!-- 新增场景弹窗 -->
		<uni-popup ref="addScenePopup" type="bottom">
			<view class="add-scene-popup">
				<view class="popup-header">
					<text class="cancel-btn" @click="closeScenePopup">取消</text>
					<text class="popup-title">新增场景</text>
					<text class="confirm-btn" @click="saveScene">保存</text>
				</view>
				<view class="popup-content">
					<uni-section title="选择场景" type="line">
						<uni-data-select v-model="selectedScene" :localdata="sceneOptions"></uni-data-select>
					</uni-section>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import {FilmScreenings, sceneTable, sceneSwitch} from '../../utils/commin.js'
	import { getSceneList, controlDevice, registerScene } from '../../api/api.js'
	export default {
		data() {
			return {
				sceneList: [],
				cutover: true,
				sceneSwitch,
				isEditMode: false,
				selectedScene: '',
				pattern: {
					color: "#fff",
					buttonColor: '#1890ff'
				}
			}
		},
		onLoad(){
			uni.getStorage({
				key:'cutover',
				success: (res) => {
					this.cutover=res.data
				}
			})
		},
		onShow() {
			this.loadSceneList()
		},
		computed: {
			sceneOptions() {
				// 获取已添加的场景ID集合
				const existingSceneIds = this.sceneList.map(item => item.ID)

				return sceneTable.map(item => {
					return {
						text: this.cutover ? item.name : sceneSwitch(item.name),
						value: item.id,
					}
				}).filter(i => !existingSceneIds.includes(i.value))
			}
		},
		methods: {
			loadSceneList() {
				getSceneList().then(res=>{
					this.sceneList=(res.KEYWORD||[]).map(item=>{return {...item,url:`/static/icon/${FilmScreenings(item.NAME)}.png`}})
				})
			},
			goBack() {
				uni.navigateBack()
			},
			timing(item){
				const data={...item,NAME:this.cutover?item.NAME:this.sceneSwitch(item.NAME)}
				uni.navigateTo({
					url:'../scene/scene',
					success:(res) =>{
						res.eventChannel.emit('sceneData',  data)
					}
				})
			},
			mode_click(obj){
				controlDevice({ STATE:'1', SCENEID:obj.SCENEID, DEVID:'' }).then(res=>{
					uni.showToast({ icon:"none", title:"开启"+obj.NAME+'的指令已发送！', duration:3000 })
				})
			},
			editScene(item) {
				uni.navigateTo({
					url:'../scene/manage',
					success:(res) =>{
						res.eventChannel.emit('sceneData', item)
					}
				})
			},
			triggerAdd(){
				this.selectedScene = ''
				this.$refs.addScenePopup.open()
			},
			closeScenePopup() {
				this.$refs.addScenePopup.close()
			},
			saveScene() {
				if (!this.selectedScene) {
					uni.showToast({ title: '请选择场景', icon: 'none' })
					return
				}
				// 调用API添加场景
				const NAME = sceneTable.find(i=>i.id === this.selectedScene).name
				registerScene({ ID: this.selectedScene, NAME}).then(res => {
					uni.showToast({ title: '场景已添加', icon: 'success' })
					this.closeScenePopup()
					this.loadSceneList()
				}).catch(() => {
					uni.showToast({
						title: '添加失败，请重试',
						icon: 'none'
					})
				})
			}
		}
	}
</script>

<style  lang="scss">
.more-page{
	width: 100%;
	height: 100%;
	background-color: rgb(241,244,249);
	position: relative;
	display: flex;
	flex-direction: column;
	.home-banner{
		width: 100%;
		flex-shrink: 0;
	}
	.back-btn{
		position: absolute;
		top: 15px;
		left: 15px;
		color: #fff;
		padding: 8px 12px;
		background-color: rgba(0, 0, 0, 0.3);
		border-radius: 6px;
		font-size: 14px;
		z-index: 10;
	}
	.home-content{
		background-color: rgb(241,244,249);
		border-radius: 30px 30px 0 0;
		z-index: 1;
		padding: 25px 20px 0px;
		flex: 1;
		margin-top: -50px;
		overflow-y: auto;
	}
	.scroll-view_H {
		display: flex;
		width: 100%;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 10px;
	}
	.scroll-item {
		width: calc(50% - 10px);
		background-color: #fff;
		border-radius: 10px;
		border: 1px solid #e8e8e8;
		overflow: hidden;
		transition: all 0.3s;
		display: flex;
		flex-direction: column;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		&:active{
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
			transform: translateY(-2px);
		}
		.item-header {
			display: flex;
			align-items: center;
			padding: 12px;
			border-bottom: 1px solid #f0f0f0;
			.icon-wrap {
				width: 50px;
				height: 50px;
				border-radius: 8px;
				background-color: #f5f7fa;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
				margin-right: 12px;
				image {
					width: 32px;
					height: 32px;
				}
			}
			.item-content {
				flex: 1;
				.scene-name {
					font-size: 14px;
					font-weight: 500;
					color: #333;
					margin-bottom: 6px;
				}
				.scene-actions {
					display: flex;
					gap: 6px;
				}
			}
		}
		.item-footer {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 10px 12px;
			gap: 8px;
		}
	}
	.action-btn {
		flex: 1;
		padding: 8px 12px;
		border-radius: 4px;
		font-size: 12px;
		text-align: center;
		transition: all 0.2s;
	}
	.edit-btn {
		background-color: #e6f7ff;
		color: #1890ff;
		border: 0.5px solid #1890ff;
		&:active {
			background-color: #bae7ff;
		}
	}
	.delete-btn {
		background-color: #fff1f0;
		color: #ff4d4f;
		border: 0.5px solid #ff4d4f;
		&:active {
			background-color: #ffccc7;
		}
	}
	.scroll-wrap {
		margin-bottom: 20px;
	}
	.title-wrap{
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		.title{
			font-size: 16px;
			font-weight: 600;
			color: #333;
		}
		.more{
			font-size: 14px;
			color: #999999;
		}
	}
	.bottom-actions {
		position: fixed;
		bottom: 20px;
		left: 20px;
		z-index: 100;
	}
	.edit-button {
		background-color: #1890ff;
		color: #fff;
		border: none;
		border-radius: 8px;
		padding: 12px 24px;
		font-size: 14px;
		font-weight: 500;
		display: inline-block;
		width: auto;
		transition: all 0.3s;
		box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
		&:active {
			background-color: #0050b3;
			box-shadow: 0 4px 12px rgba(24, 144, 255, 0.5);
			transform: translateY(-1px);
		}
	}
	.add-scene-popup {
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
			min-height: 320px;
		}
	}

}


</style>
