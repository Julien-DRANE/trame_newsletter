'use strict';
const $=id=>document.getElementById(id);
const ids=['category','title','subtitle','author','date','sectionTitle'];
const editors=['introText','bodyText','quote'];
let images=[[],[],[]],timer;
const photoSizes=new Map();
const area=document.querySelector('.preview-area');
const logos='';
function updatePhotoControls(){
 const count=Math.max(3,images.length,area.querySelectorAll('.sheet').length);
 for(let n=1;n<=count;n++){
  let input=$('pageImage'+n);
  if(!input){const label=document.createElement('label');label.textContent='Photos — page '+n;input=document.createElement('input');input.id='pageImage'+n;input.type='file';input.accept='image/png,image/jpeg,image/webp';label.append(input);$('pageImage3').closest('label').parentNode.append(label)}
  input.multiple=true;
  input.onchange=async e=>{try{const photos=await Promise.all([...e.target.files].map(f=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(f)})));images[n-1]=[...(images[n-1]||[]),...photos];render()}catch{alert('Impossible de lire une photo.')}finally{input.value=''}};
  let list=$('photoList'+n);
  if(!list){list=document.createElement('div');list.id='photoList'+n;list.className='photo-list';input.closest('label').after(list)}
  list.replaceChildren();
  (images[n-1]||[]).forEach((src,i)=>{const item=document.createElement('div');const img=document.createElement('img');img.src=src;img.alt='Photo '+(i+1)+' — page '+n;const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent='Retirer la photo '+(i+1);button.onclick=()=>{images[n-1].splice(i,1);render()};item.append(img,button);list.append(item)});
  const remove=$('removeImage'+n);if(remove){remove.hidden=!(images[n-1]||[]).length;remove.textContent='Retirer toutes les photos';remove.onclick=()=>{images[n-1]=[];render()}}
 }
}
function webLink(value){
 const url=value.trim();
 try{const parsed=new URL(/^www\./i.test(url)?'https://'+url:url);return ['http:','https:'].includes(parsed.protocol)?parsed.href:null}catch{return null}
}
function linkify(root){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];let node;
 while(node=walker.nextNode())if(!node.parentElement.closest('a'))nodes.push(node);
 for(const node of nodes){const pattern=/\b(?:https?:\/\/|www\.)[^\s<>]+/gi;const fragment=document.createDocumentFragment();let last=0;
  for(const match of node.textContent.matchAll(pattern)){let text=match[0].replace(/[.,;:!?]+$/,'');while(text.endsWith(')')&&(text.match(/\)/g)||[]).length>(text.match(/\(/g)||[]).length)text=text.slice(0,-1);const href=webLink(text);if(!href)continue;fragment.append(document.createTextNode(node.textContent.slice(last,match.index)));const a=document.createElement('a');a.href=href;a.target='_blank';a.rel='noopener noreferrer';a.textContent=text;fragment.append(a);last=match.index+text.length}
  if(last){fragment.append(document.createTextNode(node.textContent.slice(last)));node.replaceWith(fragment)}
 }
}
function clean(html){const t=document.createElement('div');t.innerHTML=html; t.querySelectorAll('script,style,iframe,object,embed,link,meta,img').forEach(n=>n.remove());t.querySelectorAll('*').forEach(n=>{const href=n.tagName==='A'?webLink(n.getAttribute('href')||''):null;for(const a of [...n.attributes])if(!['style','color','size','face'].includes(a.name))n.removeAttribute(a.name);if(href){n.href=href;n.target='_blank';n.rel='noopener noreferrer'}if(n.style){const keep={};['color','fontSize','fontWeight','fontStyle','textDecoration','textAlign'].forEach(k=>keep[k]=n.style[k]);n.removeAttribute('style');Object.entries(keep).forEach(([key,value])=>{if(value)n.style[key]=value})}});linkify(t);return t.innerHTML}
function state(){return {version:3,fields:Object.fromEntries(ids.map(id=>[id,$(id).value])),editors:Object.fromEntries(editors.map(id=>[id,$(id).innerHTML])),background:document.querySelector('[name=background]:checked').value,images,colors:Object.fromEntries([...document.querySelectorAll('.rich-toolbar')].map(t=>[t.dataset.editor,t.querySelector('[type=color]').value]))}}
function save(){const s=state();try{localStorage.setItem('newsletter-draft',JSON.stringify({...s.fields,...s.editors,background:s.background}));}catch{} }
function blocks(html){const d=document.createElement('div');d.innerHTML=clean(html);return [...d.childNodes].filter(n=>n.textContent.trim()||n.nodeName==='BR').map(n=>{if(n.nodeType===3){const p=document.createElement('p');p.textContent=n.textContent;return p}return n})}
function slice(node,start,end){const w=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);let nodes=[],n;while(n=w.nextNode())nodes.push(n);const at=offset=>{for(const n of nodes){if(offset<=n.length)return[n,offset];offset-=n.length}return[node,node.childNodes.length]};const r=document.createRange();r.setStart(...at(start));r.setEnd(...at(end));const c=node.cloneNode(false);c.append(r.cloneContents());return c}
function render(){clearTimeout(timer);updatePhotoControls();area.replaceChildren();const s=state();let queue=[];
 if(s.fields.sectionTitle.trim()){const h=document.createElement('h2');h.textContent=s.fields.sectionTitle;queue.push(h)}
 queue.push(...blocks(s.editors.introText),...blocks(s.editors.bodyText));
 if($( 'quote').textContent.trim()){const q=document.createElement('blockquote');q.className='quote';q.innerHTML=clean(s.editors.quote);queue.push(q)}
 let page=0;
 do{page++;const sheet=document.createElement('article');sheet.className='sheet';sheet.style.setProperty('--paper',`url("assets/backgrounds/${s.background}.png")`);sheet.innerHTML=logos;area.append(sheet);
 if(page===1){for(const [key,tag,cls] of [['category','div','category'],['title','h1','headline'],['subtitle','p','subtitle']]){if(s.fields[key]){const n=document.createElement(tag);n.className=cls;n.textContent=s.fields[key];sheet.append(n)}}const meta=document.createElement('div');meta.className='metadata';meta.textContent=[s.fields.author,s.fields.date].filter(Boolean).join(' | ');sheet.append(meta)}
 const flow=document.createElement('div');flow.className='flow';sheet.append(flow);const bottom=sheet.getBoundingClientRect().top+1058;
 let added=0;
 const photos=images[page-1]||[];
 // Try the remaining text followed by full-width photos before using floats.
 let photosBelow=false;
 if(queue.length&&photos.length&&photos.every(src=>photoSizes.has(src))){
  queue.forEach(node=>flow.append(node.cloneNode(true)));
  const gallery=document.createElement('div');gallery.className='conclusion-photos';
  photos.forEach((src,i)=>{const size=photoSizes.get(src);const im=document.createElement('img');im.src=src;im.alt='Illustration '+(i+1)+' de la page '+page;im.width=size.width;im.height=size.height;im.style.height=(flow.clientWidth*size.height/size.width)+'px';gallery.append(im)});
  flow.append(gallery);
  if(flow.getBoundingClientRect().bottom<=bottom){queue=[];photosBelow=true}else flow.replaceChildren();
 }
 // Stagger floats down the page so paragraphs wrap around each photograph.
 const available=Math.max(80,bottom-flow.getBoundingClientRect().top);
 const photoHeight=Math.min(220,Math.max(24,(available*0.78)/Math.max(1,photos.length)-20));
 const orderedPhotos=photos.map((src,i)=>({src,i}));if(orderedPhotos.length>1)orderedPhotos.push(orderedPhotos.splice(1,1)[0]);
 if(!photosBelow)orderedPhotos.forEach(({src,i})=>{const im=document.createElement('img');im.className='photo'+((i+page)%2===0?' left':'');im.style.maxHeight=photoHeight+'px';const size=photoSizes.get(src);if(size){const width=Math.min(flow.clientWidth*0.4,photoHeight*size.width/size.height);im.style.width=width+'px';im.style.height=(width*size.height/size.width)+'px'}im.onload=()=>{if(!photoSizes.has(src)&&im.naturalWidth){photoSizes.set(src,{width:im.naturalWidth,height:im.naturalHeight});schedule()}};im.src=src;im.alt='Illustration '+(i+1)+' de la page '+page;flow.append(im);if(i===1){im.style.marginTop=Math.max(2,bottom-im.getBoundingClientRect().bottom-10)+'px'}const rect=im.getBoundingClientRect(),paper=sheet.getBoundingClientRect();im.dataset.printTop=i===1?1058-rect.height-12:rect.top-paper.top;im.dataset.printLeft=im.classList.contains('left')?62:794-62-rect.width});
 const fits=()=>flow.getBoundingClientRect().bottom<=bottom;
 while(queue.length){
 const node=queue[0];flow.append(node);if(fits()){queue.shift();added++;continue}node.remove();
 // Keep a block together whenever it can fit on a fresh page. Only blocks
 // taller than a full page need the word-level splitting below.
 const probe=sheet.cloneNode(false);probe.style.visibility='hidden';probe.style.position='absolute';
 const probeFlow=document.createElement('div');probeFlow.className='flow';probeFlow.append(node.cloneNode(true));probe.append(probeFlow);area.append(probe);
 const fitsFreshPage=probeFlow.getBoundingClientRect().bottom<=probe.getBoundingClientRect().top+1058;probe.remove();
 if(fitsFreshPage&&(added>0||page===1||flow.querySelector('.photo')))break;
 const words=[...node.textContent.matchAll(/\s+/g)].map(m=>m.index+m[0].length);let lo=0,hi=words.length-1,best=0;
 while(lo<=hi){const mid=(lo+hi)>>1,c=slice(node,0,words[mid]);flow.append(c);const ok=fits();c.remove();if(ok){best=words[mid];lo=mid+1}else hi=mid-1}
 if(best>0){flow.append(slice(node,0,best));queue[0]=slice(node,best,node.textContent.length);added++}
 else if(!added&&page>1){flow.append(node);queue.shift();added++;}
 break;
 }
 const num=document.createElement('span');num.className='page-number';num.textContent=page;sheet.append(num);
 }while((queue.length||images.slice(page).some(photos=>photos.length))&&page<100);
 updatePhotoControls();
 save();
}
function schedule(){clearTimeout(timer);timer=setTimeout(render,180)}
ids.forEach(id=>$(id).addEventListener('input',schedule));editors.forEach(id=>$(id).addEventListener('input',schedule));
document.querySelectorAll('[name=background]').forEach(n=>n.addEventListener('change',render));
document.querySelectorAll('.rich-toolbar').forEach(t=>{const ed=$(t.dataset.editor);let range;document.addEventListener('selectionchange',()=>{const s=getSelection();if(s.rangeCount&&ed.contains(s.anchorNode))range=s.getRangeAt(0).cloneRange()});const command=(cmd,v)=>{ed.focus();if(range){const s=getSelection();s.removeAllRanges();s.addRange(range)}document.execCommand(cmd,false,v);schedule()};t.querySelectorAll('[data-command]').forEach(b=>{b.onmousedown=e=>e.preventDefault();b.onclick=()=>command(b.dataset.command)});t.querySelector('select').onchange=e=>command('fontSize',e.target.value);t.querySelector('[type=color]').oninput=e=>command('foreColor',e.target.value)});
$('expandBody').onclick=()=>{document.body.classList.add('body-editor-open');$('bodyText').focus()};$('collapseBody').onclick=()=>document.body.classList.remove('body-editor-open');document.addEventListener('keydown',e=>{if(e.key==='Escape')document.body.classList.remove('body-editor-open')});
function restore(s){ids.forEach(id=>{if(typeof s.fields?.[id]==='string')$(id).value=s.fields[id]});editors.forEach(id=>{if(typeof s.editors?.[id]==='string')$(id).innerHTML=clean(s.editors[id])});document.querySelectorAll('[name=background]').forEach(n=>{if(n.value===s.background)n.checked=true});images=Array.from({length:Math.max(3,Math.min(s.images?.length||0,100))},(_,i)=>(Array.isArray(s.images?.[i])?s.images[i]:[s.images?.[i]]).filter(src=>typeof src==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(src)));render()}
$('exportJson').onclick=()=>{const u=URL.createObjectURL(new Blob([JSON.stringify(state(),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='newsletter.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
$('importJson').onclick=()=>$('importFile').click();$('importFile').onchange=async e=>{try{const s=JSON.parse(await e.target.files[0].text());if(!s.fields||!s.editors)throw Error();restore(s)}catch{alert('Fichier de newsletter invalide.')}e.target.value=''};
$('reset').onclick=()=>{if(confirm('Effacer le brouillon ?')){localStorage.removeItem('newsletter-draft');location.reload()}};
$('print').onclick=async()=>{await document.fonts.ready;render();window.print()};
function preparePrint(){
 render();
 // Keep floats for text wrapping, but paint photos at fixed sheet coordinates.
 // Print fragmentation can otherwise move a bottom-aligned float to another page.
 area.querySelectorAll('.sheet').forEach(sheet=>sheet.querySelectorAll('.flow .photo').forEach(im=>{
  const copy=im.cloneNode();copy.className='print-photo';copy.removeAttribute('style');
  const rect=im.getBoundingClientRect();Object.assign(copy.style,{top:im.dataset.printTop+'px',left:im.dataset.printLeft+'px',width:rect.width+'px',height:rect.height+'px'});sheet.append(copy);
  const gap=parseFloat(im.style.marginTop)||0;
  if(gap>2){im.style.height=(rect.height+gap)+'px';im.style.maxHeight='none';im.style.marginTop='0';im.style.shapeOutside='inset('+gap+'px -24px -8px -24px) border-box'}
 }));
}
window.addEventListener('beforeprint',preparePrint);
window.addEventListener('afterprint',render);
try{const s=JSON.parse(localStorage.getItem('newsletter-draft')||'null');if(s)restore({fields:s,editors:s,background:s.background})}catch{}
if(!$('date').value)$('date').value=new Date().toISOString().slice(0,10);
document.fonts.ready.then(render);
