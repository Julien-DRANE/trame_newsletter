'use strict';
const $=id=>document.getElementById(id);
const ids=['category','title','subtitle','author','date','sectionTitle'];
const editors=['introText','bodyText','quote'];
let images=[null,null,null],timer;
const area=document.querySelector('.preview-area');
const logos=document.querySelector('.logos').outerHTML;
function clean(html){const t=document.createElement('div');t.innerHTML=html; t.querySelectorAll('script,style,iframe,object,embed,link,meta,img').forEach(n=>n.remove());t.querySelectorAll('*').forEach(n=>{for(const a of [...n.attributes])if(!['style','color','size','face'].includes(a.name))n.removeAttribute(a.name);if(n.style){const keep={};['color','fontSize','fontWeight','fontStyle','textDecoration','textAlign'].forEach(k=>keep[k]=n.style[k]);n.removeAttribute('style');Object.assign(n.style,keep)}});return t.innerHTML}
function state(){return {version:2,fields:Object.fromEntries(ids.map(id=>[id,$(id).value])),editors:Object.fromEntries(editors.map(id=>[id,$(id).innerHTML])),background:document.querySelector('[name=background]:checked').value,images,colors:Object.fromEntries([...document.querySelectorAll('.rich-toolbar')].map(t=>[t.dataset.editor,t.querySelector('[type=color]').value]))}}
function save(){const s=state();try{localStorage.setItem('newsletter-draft',JSON.stringify({...s.fields,...s.editors,background:s.background}));}catch{} }
function blocks(html){const d=document.createElement('div');d.innerHTML=clean(html);return [...d.childNodes].filter(n=>n.textContent.trim()||n.nodeName==='BR').map(n=>{if(n.nodeType===3){const p=document.createElement('p');p.textContent=n.textContent;return p}return n})}
function slice(node,start,end){const w=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);let nodes=[],n;while(n=w.nextNode())nodes.push(n);const at=offset=>{for(const n of nodes){if(offset<=n.length)return[n,offset];offset-=n.length}return[node,node.childNodes.length]};const r=document.createRange();r.setStart(...at(start));r.setEnd(...at(end));const c=node.cloneNode(false);c.append(r.cloneContents());return c}
function render(){clearTimeout(timer);area.replaceChildren();const s=state();let queue=[];
 if(s.fields.sectionTitle.trim()){const h=document.createElement('h2');h.textContent=s.fields.sectionTitle;queue.push(h)}
 queue.push(...blocks(s.editors.introText),...blocks(s.editors.bodyText));
 if($( 'quote').textContent.trim()){const q=document.createElement('blockquote');q.className='quote';q.innerHTML=clean(s.editors.quote);queue.push(q)}
 let page=0;
 do{page++;const sheet=document.createElement('article');sheet.className='sheet';sheet.style.setProperty('--paper',`url("assets/backgrounds/${s.background}.png")`);sheet.innerHTML=logos;area.append(sheet);
 if(page===1){for(const [key,tag,cls] of [['category','div','category'],['title','h1','headline'],['subtitle','p','subtitle']]){if(s.fields[key]){const n=document.createElement(tag);n.className=cls;n.textContent=s.fields[key];sheet.append(n)}}const meta=document.createElement('div');meta.className='metadata';meta.textContent=[s.fields.author,s.fields.date].filter(Boolean).join(' | ');sheet.append(meta)}
 const flow=document.createElement('div');flow.className='flow';sheet.append(flow);const bottom=sheet.getBoundingClientRect().top+1058;
 let added=0,photo=false;const threshold=page===1?0:page===2?220:400;
 const fits=()=>flow.getBoundingClientRect().bottom<=bottom;
 while(queue.length){if(!photo&&images[page-1]&&(flow.getBoundingClientRect().height>=threshold||queue.length===1)){const im=document.createElement('img');im.className='photo'+(page===3?' left':'');im.src=images[page-1];im.alt='Illustration de l’article';flow.append(im);if(!fits())im.remove();photo=true}
 const node=queue[0];flow.append(node);if(fits()){queue.shift();added++;continue}node.remove();
 const words=[...node.textContent.matchAll(/\s+/g)].map(m=>m.index+m[0].length);let lo=0,hi=words.length-1,best=0;
 while(lo<=hi){const mid=(lo+hi)>>1,c=slice(node,0,words[mid]);flow.append(c);const ok=fits();c.remove();if(ok){best=words[mid];lo=mid+1}else hi=mid-1}
 if(best>0){flow.append(slice(node,0,best));queue[0]=slice(node,best,node.textContent.length);added++}
 else if(!added&&page>1){flow.append(node);queue.shift();added++;}
 break;
 }
 const num=document.createElement('span');num.className='page-number';num.textContent=page;sheet.append(num);
 }while(queue.length&&page<100);
 save();
}
function schedule(){clearTimeout(timer);timer=setTimeout(render,180)}
ids.forEach(id=>$(id).addEventListener('input',schedule));editors.forEach(id=>$(id).addEventListener('input',schedule));
document.querySelectorAll('[name=background]').forEach(n=>n.addEventListener('change',render));
document.querySelectorAll('.rich-toolbar').forEach(t=>{const ed=$(t.dataset.editor);let range;document.addEventListener('selectionchange',()=>{const s=getSelection();if(s.rangeCount&&ed.contains(s.anchorNode))range=s.getRangeAt(0).cloneRange()});const command=(cmd,v)=>{ed.focus();if(range){const s=getSelection();s.removeAllRanges();s.addRange(range)}document.execCommand(cmd,false,v);schedule()};t.querySelectorAll('[data-command]').forEach(b=>{b.onmousedown=e=>e.preventDefault();b.onclick=()=>command(b.dataset.command)});t.querySelector('select').onchange=e=>command('fontSize',e.target.value);t.querySelector('[type=color]').oninput=e=>command('foreColor',e.target.value)});
[1,2,3].forEach((n)=>$('pageImage'+n).onchange=async e=>{const f=e.target.files[0];if(!f)return;images[n-1]=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(f)});render()});
$('expandBody').onclick=()=>{document.body.classList.add('body-editor-open');$('bodyText').focus()};$('collapseBody').onclick=()=>document.body.classList.remove('body-editor-open');document.addEventListener('keydown',e=>{if(e.key==='Escape')document.body.classList.remove('body-editor-open')});
function restore(s){ids.forEach(id=>{if(typeof s.fields?.[id]==='string')$(id).value=s.fields[id]});editors.forEach(id=>{if(typeof s.editors?.[id]==='string')$(id).innerHTML=clean(s.editors[id])});document.querySelectorAll('[name=background]').forEach(n=>{if(n.value===s.background)n.checked=true});images=[0,1,2].map(i=>typeof s.images?.[i]==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(s.images[i])?s.images[i]:null);render()}
$('exportJson').onclick=()=>{const u=URL.createObjectURL(new Blob([JSON.stringify(state(),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='newsletter.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
$('importJson').onclick=()=>$('importFile').click();$('importFile').onchange=async e=>{try{const s=JSON.parse(await e.target.files[0].text());if(!s.fields||!s.editors)throw Error();restore(s)}catch{alert('Fichier de newsletter invalide.')}e.target.value=''};
$('reset').onclick=()=>{if(confirm('Effacer le brouillon ?')){localStorage.removeItem('newsletter-draft');location.reload()}};
$('print').onclick=async()=>{await document.fonts.ready;render();window.print()};
window.addEventListener('beforeprint',render);
try{const s=JSON.parse(localStorage.getItem('newsletter-draft')||'null');if(s)restore({fields:s,editors:s,background:s.background})}catch{}
if(!$('date').value)$('date').value=new Date().toISOString().slice(0,10);
document.fonts.ready.then(render);
