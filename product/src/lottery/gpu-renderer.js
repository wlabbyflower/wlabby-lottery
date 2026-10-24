import * as THREE from 'three';

// One instanced draw for the entire card wall; labels are rasterized only when
// their content changes, never on every animation frame.
export class GPUCardRenderer {
  constructor(container, scene, camera, count) {
    this.scene = scene;
    this.camera = camera;
    this.objects = [];
    this.labels = [];
    this.theme = null;
    const canvas = document.createElement('canvas');
    const options = { alpha: true, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: false, stencil: false };
    const context = canvas.getContext('webgl2', options);
    if (!context) throw new Error('WebGL2 unavailable');
    this.renderer = new THREE.WebGLRenderer({ ...options, canvas, context });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    this.renderer.setClearColor(0x000000, 0);
    canvas.className = 'gpu-scene';
    canvas.setAttribute('aria-label', '3D 人员抽奖场景');
    container.append(canvas);
    this.overlay = document.createElement('div');
    this.overlay.className = 'winner-overlay';
    this.overlay.setAttribute('role', 'list');
    this.overlay.setAttribute('aria-label', '本轮中奖人员');
    container.append(this.overlay);
    this.winners = new Map();
    this.hidden = false;
    this.lost = false;
    this.onInvalidate = () => {};
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); this.lost = true; document.documentElement.dataset.rendererState = 'context-lost'; document.getElementById('renderStatus').textContent='渲染已暂停'; });
    canvas.addEventListener('webglcontextrestored', () => { this.lost = false; this.texture.needsUpdate = true; this.mesh.instanceMatrix.needsUpdate = true; this.states.needsUpdate = true; document.documentElement.dataset.rendererState = 'ready'; document.getElementById('renderStatus').textContent=this.info.software?'WebGL · 软件渲染':'WebGL · GPU 渲染'; this.onInvalidate(); });
    const maxSize = this.renderer.capabilities.maxTextureSize;
    this.columns = Math.ceil(Math.sqrt(count));
    this.tile = Math.min(256, Math.floor(maxSize / this.columns));
    this.rows = Math.ceil(count / this.columns);
    const atlas = document.createElement('canvas');
    atlas.width = this.columns * this.tile; atlas.height = this.rows * this.tile;
    this.atlas = atlas; this.ctx = atlas.getContext('2d');
    this.texture = new THREE.CanvasTexture(atlas);
    this.texture.generateMipmaps = false;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.colorSpace = THREE.NoColorSpace;
    const geometry = new THREE.PlaneGeometry(120, 160);
    const offsets = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) { offsets[i*2] = i % this.columns; offsets[i*2+1] = Math.floor(i / this.columns); }
    geometry.setAttribute('labelOffset', new THREE.InstancedBufferAttribute(offsets, 2));
    this.states = new THREE.InstancedBufferAttribute(new Float32Array(count), 1);
    geometry.setAttribute('cardState', this.states);
    this.material = new THREE.ShaderMaterial({
      uniforms: { atlas: { value: this.texture }, grid: { value: new THREE.Vector2(this.columns,this.rows) }, accent: { value: new THREE.Color('#70d9ff') }, background: { value: new THREE.Color('#edf3ff') }, ink: {value:new THREE.Color('#162743')}, time: { value: 0 }, dimmed: { value: 0 } },
      transparent: true, depthWrite: true,
      vertexShader: `attribute vec2 labelOffset; attribute float cardState;
        varying vec2 cellUV; varying vec2 textUV; varying float state; varying float seed;
        uniform vec2 grid;
        void main() {
          cellUV = uv; state = cardState; seed = labelOffset.x + labelOffset.y * grid.x;
          textUV = vec2((labelOffset.x+uv.x)/grid.x, 1.0-(labelOffset.y+1.0-uv.y)/grid.y);
          gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position,1.0);
        }`,
      fragmentShader: `uniform sampler2D atlas; uniform vec3 accent; uniform vec3 background; uniform vec3 ink; uniform float time; uniform float dimmed;
        varying vec2 cellUV; varying vec2 textUV; varying float state; varying float seed;
        void main() {
          if (state > 2.5) discard;
          vec2 q = abs(cellUV-.5)-vec2(.455,.47);
          float edge = length(max(q,0.0))+min(max(q.x,q.y),0.0)-.025;
          if(edge>0.0) discard;
          float border = smoothstep(-.012,-.003,edge);
          float highlighted = step(.5,state);
          float pulse = .5+.5*sin(time*.65+seed*1.71);
          float text = texture2D(atlas,textUV).a;
          vec3 base = mix(vec3(1.),accent,.025+highlighted*.12+pulse*.008);
          vec3 color = mix(base,accent,border*(.25+highlighted*.7));
          color = mix(color,ink,text);
          gl_FragColor = vec4(color,(.97+text*.03)*mix(1.0,.075,dimmed));
          #include <colorspace_fragment>
        }`
    });
    this.mesh = new THREE.InstancedMesh(geometry,this.material,count);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
    this.world = new THREE.Scene(); this.world.add(scene);

    const debug = context.getExtension('WEBGL_debug_renderer_info');
    const device = debug ? context.getParameter(debug.UNMASKED_RENDERER_WEBGL) : context.getParameter(context.RENDERER);
    this.info = { mode: 'webgl2', device, software: /swiftshader|llvmpipe|software|softpipe/i.test(device), powerPreference: context.getContextAttributes().powerPreference };
    if(this.info.software) { this.renderer.setPixelRatio(.75);  }
    this.position = new THREE.Vector3();
    const style=getComputedStyle(document.documentElement);
    this.setTheme({accent:style.getPropertyValue('--accent').trim(),background:style.getPropertyValue('--space').trim(),ink:style.getPropertyValue('--ink').trim()});
    window.addEventListener('lottery-theme-change',event=>{this.setTheme(event.detail);this.onInvalidate();});
  }
  setLabel(index, user, company) {
    this.labels[index] = {user,company};
    const size = this.tile, x = index % this.columns * size, y = Math.floor(index / this.columns) * size, ctx = this.ctx;
    ctx.clearRect(x,y,size,size); ctx.save(); ctx.translate(x,y); ctx.scale(size/128,size/128);
    ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.font='9px sans-serif'; ctx.fillText(company || '',64,19,108);
    ctx.font='bold 27px sans-serif'; ctx.fillText(String(user[1] || ''),64,61,114);
    ctx.font='8px sans-serif'; ctx.fillText(String(user[0] || ''),64,100,112); ctx.fillText(String(user[2] || ''),64,113,112);
    ctx.restore(); this.texture.needsUpdate=true;
  }
  setHighlight(index, active) { this.states.setX(index,active?1:0); this.states.needsUpdate=true; }
  setSize(width,height) { this.renderer.setSize(width,height); this.width=width; this.height=height; }
  showWinners(indices, createCard) {
    this.clearWinners(); this.material.uniforms.dimmed.value=1;
    for(const index of indices) {
      const label=this.labels[index], element=createCard(label.user,false,index,false);
      element.classList.add('prize'); element.setAttribute('role','listitem');
      if(label.user[3] && /^https?:\/\//i.test(label.user[3])) { const image=document.createElement('img'); image.src=label.user[3]; image.alt=label.user[1]; image.className='employee-photo'; element.append(image); }
      this.winners.set(index,element); this.overlay.append(element); this.states.setX(index,3);
    }
    this.states.needsUpdate=true; this.updateOverlay();
  }
  clearWinners() {
    for(const index of this.winners.keys()) this.states.setX(index,0);
    this.winners.clear(); this.overlay.replaceChildren(); this.states.needsUpdate=true;
    this.material.uniforms.dimmed.value=0;
  }
  updateOverlay() {
    this.world.updateMatrixWorld(true);
    for(const [index,element] of this.winners) {
      this.objects[index].getWorldPosition(this.position);
      const distance=this.position.distanceTo(this.camera.position);
      const scale=this.height/(2*Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2))*distance);
      this.position.project(this.camera);
      element.style.transform=`translate(-50%,-50%) translate(${(this.position.x+1)*this.width/2}px,${(1-this.position.y)*this.height/2}px) scale(${scale})`;
    }
  }
  render(objects, time, matricesDirty) {
    if(this.lost) return;
    if(matricesDirty) {
      for(let i=0;i<objects.length;i++) { objects[i].updateMatrix(); this.mesh.setMatrixAt(i,objects[i].matrix); }
      this.mesh.instanceMatrix.needsUpdate=true;
    }
    this.material.uniforms.time.value=time/1000;
    this.renderer.render(this.world,this.camera);
    if(this.winners.size && matricesDirty) this.updateOverlay();
  }
  setTheme(theme) {
    this.material.uniforms.accent.value.set(theme.accent); this.material.uniforms.background.value.set(theme.background); this.material.uniforms.ink.value.set(theme.ink || "#162743");
  }
  diagnostics() { return {...this.info, drawCalls:this.renderer.info.render.calls, cardCount:this.mesh.count, frame:this.renderer.info.render.frame, atlasVersion:this.texture.version, textureCount:this.renderer.info.memory.textures, pixelRatio:this.renderer.getPixelRatio(), camera:this.camera.position.toArray(), contextLost:this.lost}; }
}
