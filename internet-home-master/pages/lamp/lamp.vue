<template>
	<view :class="['lamp-page']">
		<view  :class="['inside',activeColor]">
			
		</view>
		<view class="on-sky">
			<view class="slider-info">
				颜色
			</view>
			<view class="color-slide">
				<view v-for="(item,index) in rgbList" :key="index" :class="['color-item', item]" @click="setColor(item)"></view>
			</view>
			<view class="color-wrap" v-if="type==701">
				<view v-for="(item,index) in whiteList" :key="index" :class="['color-item', item]" @click="setColor(item)"></view>
			</view>
			<view class="color-wrap" v-if="type==702">
				<view v-for="(item,index) in rgbList" :key="index" :class="['color-item', item]" @click="setColor(item)"></view>
			</view>
			<view class="slider-wrap">
				<slider value="60" @change="sliderChange" step="10"  backgroundColor="#E8E8E8" activeColor="#EDEDED"/>
				<view class="slider-info">
					亮度 10
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				activeColor:'',
				rgbList:['white','red','orange','green','cyan','yellow','blue','purple'],
				whiteList:['white','center','yellow'],
				type:''
			};
		},
		onLoad(op) {
			// this.type=op.TYPE
		},
		methods:{
			setColor(data){
				this.activeColor = data
			}
		}
	}
</script>

<style lang="scss">
	.color-slide{
		width: 100%;
	}
	.white{
		background-color: #ffffff;
	}
	.center{
		background: linear-gradient(to right bottom,
				rgba(255, 255, 204, 0.6),
				rgba(255, 255, 204, 0.3),
				rgba(255, 255, 204, 0.2));
	}
	.yellow{
		background: linear-gradient(to right bottom,
				rgba(255, 255, 153, 0.6),
				rgba(255, 255, 153, 0.3),
				rgba(255, 255, 153, 0.2));
	}
		
	.red{
		background-color: #ff0033;
			&+.on-sky{
				color: #fff;
			}
	}
	.orange{
		background-color: #FFA040;	
	}
	.green{
		background-color:#66ff66;
	}
	.cyan{
		background-color: #01FFFF;
	}
	.blue{
		background-color: #00ccff;
	}
	.purple{
		background-color: #663399;
		color: #fff;
		&+.on-sky{
			color: #fff;
		}
	}
	.inside{
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
		filter: blur(20px);
		
	}
	.lamp-page {
		
		padding: 20px 20px;
		height: 100%;
		
		.on-sky{
			position: absolute;
			z-index: 10;
		}
		.slider-wrap{
			
		}
		.color-wrap {
			display: flex;
			justify-content: space-between;
			margin-bottom: 80px;
			flex-wrap: wrap;
			.color-item {
				border-radius: 100px;
				width: 60px;
				height: 60px;
				border: 1px solid #eeeeee;
				box-shadow: 0 6px 8px #ebedf0;
				margin: 10px;
				&.yellow{
					background: rgb(255, 255, 153);
				}
				&.center{
					background: rgb(255, 255, 204);
	
	}
			}
		}
		.slider-info{
			text-align: center;
			margin:20px 0 ;
		}
	}
</style>
