export class PeoplePreview {
  constructor(users, heading, onViewChange) {
    this.users=users; this.page=0; this.size=24; this.view='cards'; this.paused=false; this.onViewChange=onViewChange;
    this.root=document.getElementById('peoplePreview');
    document.getElementById('previewHeading').textContent=heading || '参与人员预览';
    document.getElementById('previewPrevious').onclick=()=>this.move(-1);
    document.getElementById('previewNext').onclick=()=>this.move(1);
    document.getElementById('previewPause').onclick=()=>{this.paused=!this.paused;this.updateControls();};
    document.querySelectorAll('[data-preview-view]').forEach(button=>button.onclick=()=>this.setView(button.dataset.previewView));
    this.timer=setInterval(()=>{if(!document.hidden&&!this.paused&&!this.root.hidden&&this.view==='cards')this.move(1);},3000);
    window.addEventListener('pagehide',()=>clearInterval(this.timer),{once:true});
    this.render(); this.setView('cards');
  }
  setUsers(users) {this.users=users;this.page=0;this.render();}
  setView(view) {
    this.view=view;
    this.root.dataset.view=view;
    document.querySelectorAll('[data-preview-view]').forEach(button=>{const active=button.dataset.previewView===view;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    document.getElementById('previewHint').textContent=view==='sphere'?'拖动旋转 · 滚轮缩放 · 触屏可滑动':'每 3 秒自动换一批 · 可暂停或翻页 · 不影响抽奖概率';
    this.onViewChange(view);
  }
  move(step) {const pages=Math.max(1,Math.ceil(this.users.length/this.size));this.page=(this.page+step+pages)%pages;this.render();}
  updateControls() {
    const pause=document.getElementById('previewPause');pause.textContent=this.paused?'继续轮播':'暂停轮播';pause.setAttribute('aria-pressed',String(this.paused));
    document.getElementById('previewPrevious').disabled=document.getElementById('previewNext').disabled=this.users.length<=this.size;
  }
  render() {
    const cards=document.getElementById('previewCards');cards.replaceChildren();
    if(!this.users.length) {const empty=document.createElement('p');empty.className='preview-empty';empty.textContent='暂无待抽人员，请通过左上角设置导入名单。';cards.append(empty);}
    let index=0;
    for(const user of this.users.slice(this.page*this.size,(this.page+1)*this.size)) {
      const card=document.createElement('article');card.className='person-preview-card';card.style.setProperty('--card-delay',`${index++*12}ms`);card.setAttribute('role','listitem');
      const avatar=document.createElement('div');avatar.className='person-avatar';avatar.textContent=Array.from(String(user[1]))[0] || '人';
      if(user[3]&&/^https?:\/\//i.test(user[3])) {const photo=new Image();photo.src=user[3];photo.alt='';photo.loading='lazy';photo.onerror=()=>photo.remove();avatar.append(photo);}
      const info=document.createElement('div');info.className='person-info';
      const id=document.createElement('span');id.className='person-id';id.textContent='工号 '+user[0];
      const name=document.createElement('strong');name.className='person-name';name.textContent=user[1];if(Array.from(user[1]).length>5)name.classList.add('long-name');
      const department=document.createElement('span');department.className='person-department';department.textContent=user[2] || '参与人员';
      info.append(id,name,department);card.append(avatar,info);cards.append(card);
    }
    const first=this.users.length?this.page*this.size+1:0,last=Math.min((this.page+1)*this.size,this.users.length);
    document.getElementById('previewRange').textContent=`${first}–${last} / ${this.users.length} 人`;
    document.getElementById('previewTotal').textContent=`${this.users.length} 位待抽人员`;
    this.updateControls();
  }
}
