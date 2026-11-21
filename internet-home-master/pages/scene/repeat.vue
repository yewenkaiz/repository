<template>
	<view class="repeat-index">
		<view style="height: 10px;"></view>
		<view class="repeat-item" :class="{checked:checked==0}" @click="choose(0)">不工作</view>
		<view class="repeat-item" :class="{checked:checked==1}" @click="choose(1)">单次</view>
		<view class="repeat-item" :class="{checked:checked==2}" @click="choose(2)">每天</view>
		<view class="repeat-item" :class="{checked:checked==3}" @click="choose(3)">每周</view>
		<view class="multiple-list" v-show="checked==3" >
				<view class="multiple-item" :class="{checked:weekList[0]}" @click="weekChoose(0)">周六</view>
				<view class="multiple-item" :class="{checked:weekList[1]}" @click="weekChoose(1)">周日</view>
				<view class="multiple-item" :class="{checked:weekList[2]}" @click="weekChoose(2)">周一</view>
				<view class="multiple-item" :class="{checked:weekList[3]}" @click="weekChoose(3)">周二</view>
				<view class="multiple-item" :class="{checked:weekList[4]}" @click="weekChoose(4)">周三</view>
				<view class="multiple-item" :class="{checked:weekList[5]}" @click="weekChoose(5)">周四</view>
				<view class="multiple-item" :class="{checked:weekList[6]}" @click="weekChoose(6)">周五</view>
			</checkbox-group>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				checked: 1,
				weekList: [true, false, false, false, false, false, false]
			}
		},
		onLoad() {
			 const eventChannel = this.getOpenerEventChannel();
			  eventChannel.on('acceptDataFromOpenerPage', (data)=> {
				 this.checked=data.checked
				 this.weekList=data.weekList
			   })
		},
		onUnload(){
			 const eventChannel = this.getOpenerEventChannel();
			 eventChannel.emit('someEvent', {checked:this.checked,weekList:this.weekList});
		},
		methods: {
			choose(key) {
				this.checked = key
			},
			weekChoose(key){
				if(this.weekList.filter(item=>{return item}).length==1&&this.weekList[key]){
					uni.showToast({
						title:'至少选择一天',
						icon:'error',
						duration:2000
					})
				}else{
					this.weekList[key]=!this.weekList[key]
					this.$forceUpdate()
				}
			}
		}
	}
</script>

<style lang="scss">
	.repeat-index {
		height: 100%;
		background-color: rgb(241, 244, 249);

		.repeat-item {
			padding: 10px;
			background-color: #FFF;
			display: flex;
			justify-content: space-between;
			margin-bottom: 20px;
		}

		.checked::after {
			content: '✔';
			color: #5773FB;
			display: inline-block;
			margin: 0 10px;
		}
		.multiple-list{
			margin: 10px 0;
			background-color: #fff;
			border-top: 1px solid #e4e4e4 ;
			.multiple-item{
				padding: 10px;
				border-bottom: 1px solid #e4e4e4;
				display: flex;
				justify-content: space-between;
			}
		}

	}
</style>
