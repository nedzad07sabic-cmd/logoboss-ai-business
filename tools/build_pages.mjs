import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>readFileSync(path.join(dir,file),'utf8');
const write=(file,content)=>writeFileSync(path.join(dir,file),content,'utf8');
const context={window:{},URL,Intl,Date};vm.createContext(context);
vm.runInContext(read('catalog-data.js'),context);
vm.runInContext(read('catalog-experience.js'),context);
const data=context.window.LB_CATALOG,render=context.window.LB_RENDER;
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const version='20261011-catalog-3';
const scripts=`<script src="/catalog-data.js?v=${version}" defer></script>\n<script src="/catalog-experience.js?v=${version}" defer></script>`;
mkdirSync(path.join(dir,'packages'),{recursive:true});
for(const p of data.packages){
  const url='https://logobossweb-ai.eu/packages/'+p.id+'.html';
  const structured={ '@context':'https://schema.org','@type':'Service',name:p.name,description:p.short.de,url,provider:{'@type':'Organization',name:'LogoBoss AI',url:'https://logobossweb-ai.eu/'},serviceType:data.groups[p.group].name.de};
  const html=`<!doctype html>
<html lang="de" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(p.name)} | LogoBoss AI</title><meta name="description" content="${escape(p.short.de)}">
<link rel="canonical" href="${url}"><meta property="og:title" content="${escape(p.name)} | LogoBoss AI"><meta property="og:description" content="${escape(p.short.de)}"><meta property="og:url" content="${url}"><meta property="og:type" content="website"><meta property="og:image" content="https://logobossweb-ai.eu/assets/brand/logoboss-ai.jpg">
<meta name="theme-color" content="#f8fafc"><link rel="icon" href="/favicon.ico"><link rel="manifest" href="/site.webmanifest"><link rel="stylesheet" href="/catalog-experience.css?v=${version}">
<script type="application/ld+json">${JSON.stringify(structured).replace(/</g,'\\u003c')}</script>
${scripts}</head><body class="lb-catalog-page"><div id="lbHeader">${render.header('de')}</div><main id="lbExperience" data-package="${p.id}">${render.packagePage(p,'de')}</main><div id="lbFooter">${render.footer('de')}</div></body></html>\n`;
  write('packages/'+p.id+'.html',html);
}
let index=read('index.html');
if(!index.includes('id="lbExperience"')){
  index=index.replace('<body>','<body class="lb-catalog-page">');
  index=index.replace('<main id="homeView">','<div id="lbHeader">'+render.header('de')+'</div>\n<main id="lbExperience">'+render.home('de')+'</main>\n<main id="homeView" aria-hidden="true" inert>');
  index=index.replace('<main class="detail-view hidden" id="detailView">','<main class="detail-view hidden" id="detailView" aria-hidden="true" inert>');
  index=index.replace('<footer class="lb-footer-premium" id="contact">','<div id="lbFooter">'+render.footer('de')+'</div>\n<footer class="lb-footer-premium lb-legacy-footer" id="contact" aria-hidden="true" inert>');
  // Retain all integration hooks, but avoid duplicate public section/canvas IDs.
  const start=index.indexOf('<main id="homeView"'),end=index.indexOf('</main>',start)+7;
  let legacy=index.slice(start,end);
  for(const id of ['home','systems','services','about','motionEarth','motionPause'])legacy=legacy.replaceAll('id="'+id+'"','id="legacy-'+id+'"');
  legacy=legacy.replace(/id="offer-([^"\s]+)"/g,'id="legacy-offer-$1"');
  index=index.slice(0,start)+legacy+index.slice(end);
  index=index.replace(/<script src="\.\/immersive-3d\.js[^"\n]*" defer><\/script>\s*/,'');
  index=index.replace('<script src="./earth-points.js',scripts+'\n<script src="./earth-points.js');
  index=index.replace('</head>','<link rel="stylesheet" href="/catalog-experience.css?v='+version+'">\n</head>');
  index=index.replace(/<meta name="theme-color" content="[^"]*">/,'<meta name="theme-color" content="#f8fafc">');
}else{
  index=index.replace(/<div id="lbHeader">[\s\S]*?<\/header><\/div>/,'<div id="lbHeader">'+render.header('de')+'</div>');
  index=index.replace(/<main id="lbExperience">[\s\S]*?<\/main>/,'<main id="lbExperience">'+render.home('de')+'</main>');
  index=index.replace(/<div id="lbFooter">[\s\S]*?<\/footer><\/div>/,'<div id="lbFooter">'+render.footer('de')+'</div>');
}
// The legacy order flow stays intact. Checkout is offered directly on package pages.
index=index.replace(/20261011-catalog-\d+/g,version);
write('index.html',index);
const sitemap=read('sitemap.xml');
const additions=data.packages.map(p=>'<url><loc>https://logobossweb-ai.eu/packages/'+p.id+'.html</loc><lastmod>2026-10-11</lastmod></url>').filter(line=>!sitemap.includes(line.match(/<loc>(.*?)<\/loc>/)[1]));
if(additions.length)write('sitemap.xml',sitemap.replace('</urlset>',additions.join('\n')+'\n</urlset>'));
console.log(`Built home and ${data.packages.length} package pages.`);
