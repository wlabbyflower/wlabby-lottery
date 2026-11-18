<template>
  <main>
    <header><h1>抽奖设置</h1><a href="/">返回抽奖大屏</a></header>
    <p>修改年份和背景，保存后刷新大屏生效。</p>
    <form v-if="ready" @submit.prevent="save">
      <label>高亮年份<input id="year" v-model="form.year" inputmode="numeric" maxlength="4" required pattern="[0-9]{4}"><small>以原版橙色卡片拼成四位数字。</small></label>
      <label>背景样式<select id="backgroundMode" v-model="form.backgroundMode"><option value="stars">原版动态星空</option><option value="image">自定义背景图</option><option value="color">纯色背景</option></select></label>
      <label>背景颜色<input id="backgroundColor" v-model="form.backgroundColor" type="color"></label>
      <label>上传背景图<input id="backgroundFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif" :disabled="busy" @change="upload"><small>PNG、JPEG、WebP、GIF，最大 5MB。上传图片随设置保存。</small></label>
      <label>或使用图片网址<input id="backgroundUrl" v-model="url" type="url" placeholder="https://example.com/background.jpg" @input="setUrl"><small>{{ embedded ? '已载入保存的本地图片，可上传新图替换。' : '外部图片需能从大屏所在浏览器访问。' }}</small></label>
      <div v-if="form.backgroundMode === 'image' && form.backgroundImage" class="image-preview" :style="{ backgroundImage: `url(${JSON.stringify(form.backgroundImage)})` }" aria-label="背景图片预览"></div>
      <div class="actions"><button id="save" :disabled="busy">{{ busy ? '处理中…' : '保存设置' }}</button><button id="removeImage" type="button" :disabled="busy" @click="removeImage">移除背景图片</button></div>
    </form>
    <p id="status" role="status" :class="{ error }">{{ message }}</p>
  </main>
</template>
<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
const form = reactive({ year:'', backgroundMode:'stars', backgroundColor:'#000a14', backgroundImage:'' })
const ready=ref(false), busy=ref(false), url=ref(''), message=ref('正在读取设置…'), error=ref(false), dirty=ref(false)
watch(form,()=>{if(ready.value)dirty.value=true},{flush:'sync'})
const embedded = computed(()=>form.backgroundImage.startsWith('data:'))
function notify(text, failed=false) { message.value=text;error.value=failed }
function setUrl() { form.backgroundImage=url.value.trim();dirty.value=true }
function removeImage() { form.backgroundImage='';url.value='';form.backgroundMode='stars';dirty.value=true;notify('图片已移除，请保存设置。') }
async function upload(event) {
  const file=event.target.files[0];if(!file)return
  busy.value=true
  try {
    if(file.size>5*1024*1024 || !['image/png','image/jpeg','image/webp','image/gif'].includes(file.type))throw new Error('请选择 5MB 以内的 PNG、JPEG、WebP 或 GIF')
    const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('图片读取失败'));reader.readAsDataURL(file)})
    const image=new Image();image.src=data;await image.decode()
    form.backgroundImage=data;form.backgroundMode='image';url.value='';dirty.value=true;notify('图片已载入，请保存设置。')
  } catch(e) { notify(e.message,true) } finally { busy.value=false;event.target.value='' }
}
async function save() {
  busy.value=true
  try {
    const response=await fetch('/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const data=await response.json();if(!response.ok)throw new Error(data.error||'保存失败')
    Object.assign(form,data);dirty.value=false;notify('设置已保存，刷新抽奖大屏即可生效。')
  } catch(e) { notify(e.message,true) } finally { busy.value=false }
}
onMounted(async()=>{try{const response=await fetch('/settings');if(!response.ok)throw new Error('读取设置失败');Object.assign(form,await response.json());url.value=embedded.value?'':form.backgroundImage;ready.value=true;notify('设置已读取。')}catch(e){notify(e.message,true)}})
window.addEventListener('beforeunload',event=>{if(dirty.value){event.preventDefault();event.returnValue=''}})
</script>
<style>
:root{color-scheme:dark;font-family:Helvetica,"Microsoft YaHei",sans-serif;background:#000a14;color:#e3ffff}*{box-sizing:border-box}body{margin:0;padding:24px}main{max-width:680px;margin:24px auto;padding:28px;border:1px solid #7fffff55;background:#021722}header{display:flex;align-items:center;justify-content:space-between;gap:20px}h1{font-size:24px;margin:0}a{color:#7fffff;font-size:14px}p,small{color:#abc9cd;line-height:1.7}form{display:grid;gap:22px;margin-top:26px}label{display:grid;gap:9px;font-size:14px}input,select{width:100%;padding:11px;border:1px solid #7fffff55;background:#00111c;color:#e3ffff;font:inherit}input[type=color]{height:44px;padding:5px}small{font-size:12px}.actions{display:flex;gap:12px;flex-wrap:wrap}button{padding:12px 20px;font:inherit;cursor:pointer;color:#7fffff;border:1px solid #7fffff88;background:#00363c}button:disabled{opacity:.5;cursor:wait}.error{color:#ffab8c}.image-preview{height:210px;background-size:cover;background-position:center;border:1px solid #7fffff55}@media(max-width:500px){body{padding:12px}main{padding:20px;margin:12px auto}header{align-items:flex-start}h1{font-size:21px}}
</style>
