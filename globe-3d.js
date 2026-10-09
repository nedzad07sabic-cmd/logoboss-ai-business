/* LogoBoss 3D Earth with 30 luminous orbital pearls. No external dependencies. */
(()=>{
'use strict';
let canvas=document.getElementById('motionEarth');
if(!canvas)return;
const host=canvas.parentElement,pause=document.getElementById('motionPause');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const SATELLITE_COUNT=30,TAIL_STEPS=12,TAU=Math.PI*2;
const palette=[[85/255,197/255,1],[105/255,126/255,1],[171/255,119/255,1]];
const satellites=Array.from({length:SATELLITE_COUNT},(_,i)=>({
  ring:i%3,phase:Math.floor(i/3)/10*TAU+(i%3)*.24,
  speed:[.00011,-.000092,.000126][i%3],size:.86+(i%5)*.06,hue:i*.37
}));
canvas.dataset.orbitCount=String(SATELLITE_COUNT);
canvas.dataset.orbitStyle='pearl-trails';
let paused=false,visible=true,frame=0,last=0,angle=.18,time=0,draw;
function brandColor(phase){
  const p=(Math.sin(phase)*.5+.5)*2,i=Math.min(1,Math.floor(p)),f=p-i,s=f*f*(3-2*f);
  return palette[i].map((v,k)=>v+(palette[i+1][k]-v)*s);
}
function orbitPoint(a,k){
  const x=Math.cos(a)*1.29,y=Math.sin(a)*.45,z=Math.sin(a)*1.12,t=[-.42,.48,1.05][k];
  return[x*Math.cos(t)-y*Math.sin(t),x*Math.sin(t)+y*Math.cos(t),z];
}
const gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});
if(gl){
  const vs='attribute vec3 aPosition;attribute vec3 aNormal;attribute vec3 aTint;attribute float aScale;uniform float uAngle,uDpr,uPointSize,uAspect;varying vec3 vNormal,vOriginal,vTint;varying float vScale;vec3 spin(vec3 p){float c=cos(uAngle),s=sin(uAngle);p=vec3(p.x*c+p.z*s,p.y,-p.x*s+p.z*c);float t=.18;return vec3(p.x,p.y*cos(t)-p.z*sin(t),p.y*sin(t)+p.z*cos(t));}void main(){vec3 p=spin(aPosition);vNormal=spin(aNormal);vOriginal=normalize(aNormal);vTint=aTint;vScale=aScale;float w=4.0-p.z*.45;gl_Position=vec4(p.x*3.04/uAspect,-p.y*3.04,-p.z*.9,w);gl_PointSize=uPointSize*uDpr*(.7+max(p.z,0.0)*.45)*aScale;}';
  const fs='precision mediump float;uniform float uKind;uniform vec3 uColor;varying vec3 vNormal,vOriginal,vTint;varying float vScale;void main(){if(uKind>3.5){vec2 q=(gl_PointCoord-.5)*2.0;float d=dot(q,q);if(d>1.0)discard;if(uKind<4.5){vec3 n=vec3(q.x,-q.y,sqrt(max(0.0,1.0-d)));float light=.25+.75*max(dot(n,normalize(vec3(-.6,.8,1.4))),0.0);float gloss=pow(max(dot(n,normalize(vec3(-.35,.5,1.8))),0.0),32.0);vec3 c=vTint*light+vec3(.76,.85,1.0)*gloss*.65+vTint*pow(1.0-n.z,2.0)*.18;gl_FragColor=vec4(c,1.0-smoothstep(.78,1.0,d));}else{float glow=pow(1.0-sqrt(d),2.0);gl_FragColor=vec4(vTint,glow*(uKind<5.5?.26:vScale*.32));}return;}vec3 n=normalize(vNormal);float facing=max(n.z,0.0);float rim=pow(1.0-facing,3.0),light=max(dot(n,normalize(vec3(-.7,-.8,1.2))),0.0);if(uKind<.5){vec3 c=mix(vec3(.018,.036,.082),vec3(.05,.15,.27),light);float longitude=atan(vOriginal.x,vOriginal.z),latitude=asin(clamp(vOriginal.y,-1.0,1.0));float grid=(1.0-smoothstep(.025,.052,abs(sin(longitude*12.0))))+(1.0-smoothstep(.025,.05,abs(sin(latitude*12.0))));c+=vec3(.05,.1,.18)*grid*.25;c+=mix(vec3(.06,.38,.85),vec3(.4,.17,.9),n.x*.5+.5)*rim*.5;gl_FragColor=vec4(c,1.0);}else if(uKind<1.5){float d=length(gl_PointCoord-vec2(.5));if(d>.5)discard;vec3 c=mix(vec3(.24,.61,.98),vec3(.61,.43,1.0),n.x*.5+.5);gl_FragColor=vec4(c*(.55+light*.7),(1.0-smoothstep(.3,.5,d))*.95);}else if(uKind<2.5){vec3 c=mix(vec3(.12,.55,1.0),vec3(.52,.22,1.0),n.x*.5+.5);gl_FragColor=vec4(c,rim*.28);}else{gl_FragColor=vec4(uColor,.18);}}';
  function shader(type,source){
    const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);
    if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error('Globe shader failed');
    return sh;
  }
  try{
    const program=gl.createProgram();
    gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Globe program failed');
    gl.useProgram(program);
    const loc={
      p:gl.getAttribLocation(program,'aPosition'),n:gl.getAttribLocation(program,'aNormal'),
      tint:gl.getAttribLocation(program,'aTint'),scale:gl.getAttribLocation(program,'aScale'),
      angle:gl.getUniformLocation(program,'uAngle'),dpr:gl.getUniformLocation(program,'uDpr'),
      size:gl.getUniformLocation(program,'uPointSize'),aspect:gl.getUniformLocation(program,'uAspect'),
      kind:gl.getUniformLocation(program,'uKind'),color:gl.getUniformLocation(program,'uColor')
    };
    function buffer(values,dynamic=false){
      const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
      gl.bufferData(gl.ARRAY_BUFFER,values instanceof Float32Array?values:new Float32Array(values),dynamic?gl.DYNAMIC_DRAW:gl.STATIC_DRAW);
      return b;
    }
    function mesh(positions,normals=positions,dynamic=false){
      return{p:buffer(positions,dynamic),n:buffer(normals,dynamic),count:positions.length/3};
    }
    function pointMesh(positions,tints,scales){
      return{...mesh(positions,positions,true),t:buffer(tints,true),s:buffer(scales)};
    }
    function attribute(index,b,size){
      gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.enableVertexAttribArray(index);gl.vertexAttribPointer(index,size,gl.FLOAT,false,0,0);
    }
    function bind(m){
      attribute(loc.p,m.p,3);attribute(loc.n,m.n,3);
      if(m.t){attribute(loc.tint,m.t,3);attribute(loc.scale,m.s,1);}
      else{
        gl.disableVertexAttribArray(loc.tint);gl.vertexAttrib3f(loc.tint,.4,.55,1);
        gl.disableVertexAttribArray(loc.scale);gl.vertexAttrib1f(loc.scale,1);
      }
    }
    function emit(m,kind,mode,color=[.23,.6,1]){
      bind(m);gl.uniform1f(loc.kind,kind);gl.uniform3fv(loc.color,color);gl.drawArrays(mode,0,m.count);
    }
    function sphere(scale){
      const p=[],point=(lat,lon)=>[Math.cos(lat)*Math.sin(lon)*scale,-Math.sin(lat)*scale,Math.cos(lat)*Math.cos(lon)*scale];
      for(let i=0;i<36;i++)for(let j=0;j<72;j++){
        const a=-Math.PI/2+i*Math.PI/36,b=j*Math.PI/36;
        const v=[point(a,b),point(a+Math.PI/36,b),point(a,b+Math.PI/36),point(a+Math.PI/36,b+Math.PI/36)];
        for(const k of [0,1,2,2,1,3])p.push(...v[k]);
      }
      return mesh(p);
    }
    const earth=sphere(1),atmosphere=sphere(1.065);
    const land=mesh((window.LB_EARTH_POINTS||[]).flat().map(x=>x*1.01));
    const orbitMeshes=Array.from({length:3},(_,k)=>{
      const p=[];for(let j=0;j<=160;j++)p.push(...orbitPoint(j/160*TAU,k));return mesh(p);
    });
    const pearlPositions=new Float32Array(SATELLITE_COUNT*3),pearlTints=new Float32Array(SATELLITE_COUNT*3);
    const pearlScales=new Float32Array(satellites.map(s=>s.size));
    const tailPositions=new Float32Array(SATELLITE_COUNT*TAIL_STEPS*3),tailTints=new Float32Array(SATELLITE_COUNT*TAIL_STEPS*3);
    const tailScales=new Float32Array(SATELLITE_COUNT*TAIL_STEPS);
    satellites.forEach((s,i)=>{
      pearlPositions.set(orbitPoint(s.phase,s.ring),i*3);
      for(let j=0;j<TAIL_STEPS;j++)tailScales[i*TAIL_STEPS+j]=(.14+.8*(1-(j+1)/TAIL_STEPS))*s.size;
    });
    const pearls=pointMesh(pearlPositions,pearlTints,pearlScales),tails=pointMesh(tailPositions,tailTints,tailScales);
    function stream(m,positions,tints){
      for(const b of [m.p,m.n]){gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferSubData(gl.ARRAY_BUFFER,0,positions);}
      gl.bindBuffer(gl.ARRAY_BUFFER,m.t);gl.bufferSubData(gl.ARRAY_BUFFER,0,tints);
    }
    function movePearls(){
      satellites.forEach((s,i)=>{
        const a=s.phase+time*s.speed,color=brandColor(a+s.hue+time*.00004);
        pearlPositions.set(orbitPoint(a,s.ring),i*3);pearlTints.set(color,i*3);
        for(let j=0;j<TAIL_STEPS;j++){
          const at=(i*TAIL_STEPS+j)*3,t=a-Math.sign(s.speed)*.14*(j+1)/TAIL_STEPS;
          tailPositions.set(orbitPoint(t,s.ring),at);tailTints.set(color,at);
        }
      });
      stream(pearls,pearlPositions,pearlTints);stream(tails,tailPositions,tailTints);
    }
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.frontFace(gl.CW);gl.clearColor(0,0,0,0);
    canvas.dataset.renderer='webgl';
    draw=()=>{
      const dpr=Math.min(devicePixelRatio||1,1.75),rect=canvas.getBoundingClientRect();
      if(!rect.width||!rect.height)return;
      const w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.uniform1f(loc.angle,angle);gl.uniform1f(loc.aspect,rect.width/rect.height);
      gl.uniform1f(loc.dpr,dpr);gl.uniform1f(loc.size,2.2);
      gl.disable(gl.BLEND);gl.depthMask(true);emit(earth,0,gl.TRIANGLES);
      gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);emit(land,1,gl.POINTS);
      gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);emit(atmosphere,2,gl.TRIANGLES);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      orbitMeshes.forEach((m,k)=>emit(m,3,gl.LINE_STRIP,brandColor(time*.00004+k*1.7)));
      movePearls();
      const size=Math.max(7,Math.min(13,rect.width*.016));
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
      gl.uniform1f(loc.size,size*.65);emit(tails,6,gl.POINTS);
      gl.uniform1f(loc.size,size*2.8);emit(pearls,5,gl.POINTS);
      gl.depthMask(true);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform1f(loc.size,size);emit(pearls,4,gl.POINTS);
    };
  }catch(error){
    const replacement=canvas.cloneNode(false);canvas.replaceWith(replacement);canvas=replacement;draw=null;
  }
}
if(!draw){
  const ctx=canvas.getContext('2d');if(!ctx)return;
  canvas.dataset.renderer='canvas2d';
  function spin(p){
    const c=Math.cos(angle),s=Math.sin(angle),x=p[0]*c+p[2]*s,z=-p[0]*s+p[2]*c;
    return[x,p[1]*Math.cos(.18)-z*Math.sin(.18),p[1]*Math.sin(.18)+z*Math.cos(.18)];
  }
  const rgb=(c,alpha=1)=>'rgba('+c.map(v=>Math.round(v*255)).join(',')+','+alpha+')';
  draw=()=>{
    const rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height,dpr=Math.min(devicePixelRatio||1,1.75);
    if(!w||!h)return;
    canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    const r=w*.37,x=w/2,y=h/2;
    const points=satellites.map(s=>{
      const a=s.phase+time*s.speed,p=spin(orbitPoint(a,s.ring));
      return{s,a,p,color:brandColor(a+s.hue+time*.00004)};
    });
    function rings(front){
      for(let k=0;k<3;k++){
        ctx.strokeStyle=rgb(brandColor(time*.00004+k*1.7),.13);ctx.lineWidth=.65;
        ctx.beginPath();let active=false;
        for(let j=0;j<=160;j++){
          const p=spin(orbitPoint(j/160*TAU,k));
          if((p[2]>=0)!==front){active=false;continue;}
          const px=x+p[0]*r,py=y-p[1]*r;
          if(active)ctx.lineTo(px,py);else ctx.moveTo(px,py);active=true;
        }
        ctx.stroke();
      }
    }
    function pearl(o){
      const {s,a,p,color}=o,px=x+p[0]*r,py=y-p[1]*r;
      const radius=Math.max(2.25,w*.0055)*s.size*(.75+Math.max(p[2],0)*.3);
      ctx.save();ctx.globalCompositeOperation='lighter';
      for(let j=TAIL_STEPS;j>=1;j--){
        const f=1-j/TAIL_STEPS,t=spin(orbitPoint(a-Math.sign(s.speed)*.14*j/TAIL_STEPS,s.ring));
        ctx.fillStyle=rgb(color,.05+f*.2);ctx.beginPath();
        ctx.arc(x+t[0]*r,y-t[1]*r,radius*(.1+f*.55),0,TAU);ctx.fill();
      }
      const halo=ctx.createRadialGradient(px,py,0,px,py,radius*3);
      halo.addColorStop(0,rgb(color,.34));halo.addColorStop(.35,rgb(color,.13));halo.addColorStop(1,rgb(color,0));
      ctx.fillStyle=halo;ctx.beginPath();ctx.arc(px,py,radius*3,0,TAU);ctx.fill();
      ctx.globalCompositeOperation='source-over';
      const shine=ctx.createRadialGradient(px-radius*.32,py-radius*.4,radius*.05,px,py,radius);
      shine.addColorStop(0,'#eaf2ff');shine.addColorStop(.28,rgb(color));shine.addColorStop(1,rgb(color.map(v=>v*.35)));
      ctx.fillStyle=shine;ctx.beginPath();ctx.arc(px,py,radius,0,TAU);ctx.fill();ctx.restore();
    }
    rings(false);points.filter(o=>o.p[2]<0).forEach(pearl);
    const g=ctx.createRadialGradient(x-r*.4,y-r*.5,0,x,y,r);
    g.addColorStop(0,'#13294b');g.addColorStop(.8,'#071126');g.addColorStop(1,'#25457c');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
    for(const p of window.LB_EARTH_POINTS||[]){
      const c=Math.cos(angle),s=Math.sin(angle),z=-p[0]*s+p[2]*c;if(z<0)continue;
      ctx.fillStyle='rgba(100,167,255,'+(.25+z*.7)+')';ctx.beginPath();
      ctx.arc(x+(p[0]*c+p[2]*s)*r,y+p[1]*r,1+z*.6,0,TAU);ctx.fill();
    }
    rings(true);points.filter(o=>o.p[2]>=0).forEach(pearl);
  };
}
function animate(t){
  frame=0;if(paused||reduced.matches||document.hidden||!visible)return;
  const elapsed=Math.min(t-last,60);
  if(t-last>=33){time+=elapsed;angle+=elapsed*.00006;last=t;draw();}
  frame=requestAnimationFrame(animate);
}
function resume(){
  if(!frame&&!paused&&!reduced.matches&&!document.hidden&&visible){
    last=performance.now();frame=requestAnimationFrame(animate);
  }else draw();
}
pause.addEventListener('click',()=>{
  paused=!paused;pause.setAttribute('aria-pressed',String(paused));
  pause.setAttribute('aria-label',paused?'Resume globe animation':'Pause globe animation');
  pause.querySelector('span').textContent=paused?'▷':'Ⅱ';
  if(paused){cancelAnimationFrame(frame);frame=0;draw();}else resume();
});
new ResizeObserver(()=>draw()).observe(host);
new IntersectionObserver(entries=>{
  visible=entries[0].isIntersecting;
  if(visible)resume();else{cancelAnimationFrame(frame);frame=0;}
},{rootMargin:'80px'}).observe(host);
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){cancelAnimationFrame(frame);frame=0;}else resume();
});
reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;draw();resume();});
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);frame=0;});
canvas.addEventListener('webglcontextrestored',()=>{host.classList.add('globe-static-fallback');pause.hidden=true;});
draw();resume();
})();
