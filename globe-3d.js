/* LogoBoss 3D Earth. Native WebGL; geographic points are from public-domain Natural Earth. */
(()=>{
'use strict';
let canvas=document.getElementById('motionEarth');
if(!canvas)return;
const host=canvas.parentElement,pause=document.getElementById('motionPause'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=false,visible=true,frame=0,last=0,angle=.18,time=0,draw;
const gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});
if(gl){
 const vs='attribute vec3 aPosition;attribute vec3 aNormal;uniform float uAngle;uniform float uDpr;uniform float uPointSize;uniform float uAspect;varying vec3 vNormal;varying vec3 vOriginal;vec3 spin(vec3 p){float c=cos(uAngle),s=sin(uAngle);p=vec3(p.x*c+p.z*s,p.y,-p.x*s+p.z*c);float t=.18;return vec3(p.x,p.y*cos(t)-p.z*sin(t),p.y*sin(t)+p.z*cos(t));}void main(){vec3 p=spin(aPosition);vNormal=spin(aNormal);vOriginal=normalize(aNormal);float w=4.0-p.z*.45;gl_Position=vec4(p.x*3.04/uAspect,-p.y*3.04,-p.z*.9,w);gl_PointSize=uPointSize*uDpr*(.7+max(p.z,0.0)*.45);}';
 const fs='precision mediump float;uniform float uKind;uniform vec3 uColor;varying vec3 vNormal;varying vec3 vOriginal;void main(){vec3 n=normalize(vNormal);float facing=max(n.z,0.0);float rim=pow(1.0-facing,3.0);float light=max(dot(n,normalize(vec3(-.7,-.8,1.2))),0.0);if(uKind<.5){vec3 c=mix(vec3(.018,.036,.082),vec3(.05,.15,.27),light);float longitude=atan(vOriginal.x,vOriginal.z);float latitude=asin(clamp(vOriginal.y,-1.0,1.0));float grid=(1.0-smoothstep(.025,.052,abs(sin(longitude*12.0))))+(1.0-smoothstep(.025,.05,abs(sin(latitude*12.0))));c+=vec3(.05,.1,.18)*grid*.25;c+=mix(vec3(.06,.38,.85),vec3(.4,.17,.9),n.x*.5+.5)*rim*.5;gl_FragColor=vec4(c,1.0);}else if(uKind<1.5){float d=length(gl_PointCoord-vec2(.5));if(d>.5)discard;float a=1.0-smoothstep(.3,.5,d);vec3 c=mix(vec3(.24,.61,.98),vec3(.61,.43,1.0),n.x*.5+.5);gl_FragColor=vec4(c*(.55+light*.7),a*.95);}else if(uKind<2.5){vec3 c=mix(vec3(.12,.55,1.0),vec3(.52,.22,1.0),n.x*.5+.5);gl_FragColor=vec4(c,rim*.28);}else if(uKind<3.5){gl_FragColor=vec4(uColor,.3);}else{vec3 c=uColor*(.35+.75*light)+uColor*rim*.3;gl_FragColor=vec4(c,1.0);}}';
 function shader(type,source){const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error('Globe shader failed');return sh;}
 try{
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Globe program failed');
 gl.useProgram(program);
 const loc={p:gl.getAttribLocation(program,'aPosition'),n:gl.getAttribLocation(program,'aNormal'),angle:gl.getUniformLocation(program,'uAngle'),dpr:gl.getUniformLocation(program,'uDpr'),size:gl.getUniformLocation(program,'uPointSize'),aspect:gl.getUniformLocation(program,'uAspect'),kind:gl.getUniformLocation(program,'uKind'),color:gl.getUniformLocation(program,'uColor')};
 function mesh(positions,normals=positions,dynamic=false){const p=gl.createBuffer(),n=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,p);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),dynamic?gl.DYNAMIC_DRAW:gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,n);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(normals),dynamic?gl.DYNAMIC_DRAW:gl.STATIC_DRAW);return{p,n,count:positions.length/3};}
 function bind(m){gl.bindBuffer(gl.ARRAY_BUFFER,m.p);gl.enableVertexAttribArray(loc.p);gl.vertexAttribPointer(loc.p,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,m.n);gl.enableVertexAttribArray(loc.n);gl.vertexAttribPointer(loc.n,3,gl.FLOAT,false,0,0);}
 function emit(m,kind,mode,color=[.23,.6,1]){bind(m);gl.uniform1f(loc.kind,kind);gl.uniform3fv(loc.color,color);gl.drawArrays(mode,0,m.count);}
 function sphere(scale){let p=[];const point=(lat,lon)=>[Math.cos(lat)*Math.sin(lon)*scale,-Math.sin(lat)*scale,Math.cos(lat)*Math.cos(lon)*scale];for(let i=0;i<36;i++)for(let j=0;j<72;j++){const a=-Math.PI/2+i*Math.PI/36,b=j*Math.PI/36;const v=[point(a,b),point(a+Math.PI/36,b),point(a,b+Math.PI/36),point(a+Math.PI/36,b+Math.PI/36)];for(const k of [0,1,2,2,1,3])p.push(...v[k]);}return mesh(p);}
 const earth=sphere(1),atmosphere=sphere(1.065),land=mesh((window.LB_EARTH_POINTS||[]).flat().map(x=>x*1.01));
 const orbitMeshes=[],orbits=[];
 function orbitPoint(a,k){let x=Math.cos(a)*1.29,y=Math.sin(a)*.45,z=Math.sin(a)*1.12;const t=[-.42,.48,1.05][k];return[x*Math.cos(t)-y*Math.sin(t),x*Math.sin(t)+y*Math.cos(t),z];}
 for(let k=0;k<3;k++){const p=[];for(let j=0;j<=160;j++)p.push(...orbitPoint(j/160*Math.PI*2,k));orbitMeshes.push(mesh(p));orbits.push(k);}
 function cube(center,size){const positions=[],normals=[];const faces=[[[1,0,0],[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]],[[-1,0,0],[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,-1,-1]],[[0,1,0],[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1]],[[0,-1,0],[-1,-1,1],[-1,-1,-1],[1,-1,-1],[1,-1,1]],[[0,0,1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],[[0,0,-1],[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]]];for(const f of faces)for(const j of [1,2,3,1,3,4]){positions.push(...f[j].map((v,i)=>center[i]+v*size));normals.push(...f[0]);}return{positions,normals};}
 const satellites=[0,1,2].map(k=>{const m=cube(orbitPoint(k*2.1,k),.037);return mesh(m.positions,m.normals,true);});
 function update(m,positions,normals){gl.bindBuffer(gl.ARRAY_BUFFER,m.p);gl.bufferSubData(gl.ARRAY_BUFFER,0,new Float32Array(positions));gl.bindBuffer(gl.ARRAY_BUFFER,m.n);gl.bufferSubData(gl.ARRAY_BUFFER,0,new Float32Array(normals));}
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.frontFace(gl.CW);gl.clearColor(0,0,0,0);
 draw=()=>{
 const dpr=Math.min(devicePixelRatio||1,1.75),rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
 const w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform1f(loc.angle,angle);gl.uniform1f(loc.aspect,rect.width/rect.height);gl.uniform1f(loc.dpr,dpr);gl.uniform1f(loc.size,2.2);gl.disable(gl.BLEND);gl.depthMask(true);emit(earth,0,gl.TRIANGLES);
 gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);emit(land,1,gl.POINTS);
 gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);emit(atmosphere,2,gl.TRIANGLES);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 orbitMeshes.forEach((m,k)=>emit(m,3,gl.LINE_STRIP,k===1?[.55,.3,1]:[.19,.58,1]));
 gl.depthMask(true);gl.disable(gl.BLEND);
 satellites.forEach((m,k)=>{const c=cube(orbitPoint(time*.00026*(k%2?-1:1)+k*2.1,k),.038+k*.008);update(m,c.positions,c.normals);emit(m,4,gl.TRIANGLES,k===1?[.55,.34,1]:[.2,.62,1]);});
 };
 }catch(error){const replacement=canvas.cloneNode(false);canvas.replaceWith(replacement);canvas=replacement;draw=null;}
}
if(!draw){
 const ctx=canvas.getContext('2d');if(!ctx)return;
 draw=()=>{const rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height,dpr=Math.min(devicePixelRatio||1,1.75);if(!w)return;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);const r=w*.37,x=w/2,y=h/2,g=ctx.createRadialGradient(x-r*.4,y-r*.5,0,x,y,r);g.addColorStop(0,'#13294b');g.addColorStop(.8,'#071126');g.addColorStop(1,'#25457c');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();for(const p of window.LB_EARTH_POINTS||[]){const c=Math.cos(angle),s=Math.sin(angle),z=-p[0]*s+p[2]*c;if(z<0)continue;ctx.fillStyle='rgba(100,167,255,'+(.25+z*.7)+')';ctx.beginPath();ctx.arc(x+(p[0]*c+p[2]*s)*r,y+p[1]*r,1+z*.6,0,Math.PI*2);ctx.fill();}ctx.strokeStyle='#705bfc66';ctx.beginPath();ctx.ellipse(x,y,r*1.32,r*.36,-.45,0,Math.PI*2);ctx.stroke();for(let i=0;i<3;i++){const a=time*.0003+i*2.1,px=x+Math.cos(a)*r*1.28,py=y+Math.sin(a)*r*.48;ctx.fillStyle=i===1?'#9d7bff':'#59bfff';ctx.fillRect(px-4,py-4,8,8);}};
}
function animate(t){frame=0;if(paused||reduced.matches||document.hidden||!visible)return;const elapsed=Math.min(t-last,60);if(t-last>=33){time+=elapsed;angle+=elapsed*.00006;last=t;draw();}frame=requestAnimationFrame(animate);}
function resume(){if(!frame&&!paused&&!reduced.matches&&!document.hidden&&visible){last=performance.now();frame=requestAnimationFrame(animate);}else draw();}
pause.addEventListener('click',()=>{paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Resume globe animation':'Pause globe animation');pause.querySelector('span').textContent=paused?'▷':'Ⅱ';if(paused){cancelAnimationFrame(frame);frame=0;draw();}else resume();});
new ResizeObserver(()=>draw()).observe(host);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)resume();else{cancelAnimationFrame(frame);frame=0;}},{rootMargin:'80px'}).observe(host);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else resume();});
reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;draw();resume();});
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);frame=0;});
canvas.addEventListener('webglcontextrestored',()=>{host.classList.add('globe-static-fallback');pause.hidden=true;});
draw();resume();
})();