'use strict';
const $=id=>document.getElementById(id);
const ids=['category','title','subtitle','author','date','sectionTitle','insetTitle','insetText','insetPage','insetSide','insetWidth'];
const editors=['introText','bodyText','quote'];
let lineHeights={};
let extraInsets=[];
const insetKeys=['insetTitle','insetText','insetPage','insetSide','insetWidth'];
function insetData(){return [Object.fromEntries(insetKeys.map(key=>[key,$(key).value])),...extraInsets]}
function updateInsetControls(){
 const container=$('additionalInsets');container.replaceChildren();
 extraInsets.forEach((data,index)=>{
  const panel=$('firstInset').cloneNode(true);panel.removeAttribute('id');panel.className='inset-editor';
  const heading=document.createElement('p');heading.className='section-title';heading.textContent='Encart '+(index+2);panel.prepend(heading);
  insetKeys.forEach(key=>{const field=panel.querySelector('#'+key);field.removeAttribute('id');field.value=data[key]||'';field.setAttribute('aria-label',field.closest('label').firstChild.textContent+' — encart '+(index+2));field.addEventListener('input',()=>{data[key]=field.value;schedule()})});
  const remove=panel.querySelector('#removeInset');remove.removeAttribute('id');remove.onclick=()=>{extraInsets.splice(index,1);updateInsetControls();render()};container.append(panel);
 });
}

let images=[[],[],[]],photoSettings=[[],[],[]],photoLinks=[[],[],[]],timer;
const photoPresets={small:{label:'Petit',width:0.24,factor:0.6},medium:{label:'Moyen',width:0.4,factor:1},large:{label:'Grand',width:0.56,factor:1.4}};
function photoPreset(page,index){return photoPresets[photoSettings[page]?.[index]]||photoPresets.medium}
let defaultBackground=document.querySelector('[name=background]:checked').value;
let pageBackgrounds={};
const backgroundChoices=[...document.querySelectorAll('[name=background]')];
function syncBackgroundChoices(){
 const page=$('backgroundPage').value;
 const selected=pageBackgrounds[page]||defaultBackground;
 backgroundChoices.forEach(input=>{input.checked=input.value===selected});
 $('inheritBackground').hidden=page==='default'||!pageBackgrounds[page];
}
function updateBackgroundControls(){
 const select=$('backgroundPage'),selected=select.value;
 const count=Math.max(2,area.querySelectorAll('.sheet').length,...Object.keys(pageBackgrounds).map(Number));
 select.replaceChildren(new Option('Fond par défaut','default'));
 for(let page=1;page<=count;page++)select.add(new Option('Page '+page,String(page)));
 select.value=[...select.options].some(option=>option.value===selected)?selected:'1';
 syncBackgroundChoices();
}
const photoSizes=new Map();
const area=document.querySelector('.preview-area');
const logos='';
function updatePhotoControls(){
 const count=Math.max(3,images.length,area.querySelectorAll('.sheet').length);
 for(let n=1;n<=count;n++){
  let input=$('pageImage'+n);
  if(!input){const label=document.createElement('label');label.textContent='Photos — page '+n;input=document.createElement('input');input.id='pageImage'+n;input.type='file';input.accept='image/png,image/jpeg,image/webp';label.append(input);$('pageImage3').closest('label').parentNode.append(label)}
  input.multiple=true;
  input.onchange=async e=>{try{const photos=await Promise.all([...e.target.files].map(f=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(f)})));photoLinks[n-1]=[...(images[n-1]||[]).map((_,i)=>photoLinks[n-1]?.[i]||''),...photos.map(()=> '')];photoSettings[n-1]=[...(images[n-1]||[]).map((_,i)=>photoSettings[n-1]?.[i]||'medium'),...photos.map(()=> 'medium')];images[n-1]=[...(images[n-1]||[]),...photos];render()}catch{alert('Impossible de lire une photo.')}finally{input.value=''}};
  let list=$('photoList'+n);
  if(!list){list=document.createElement('div');list.id='photoList'+n;list.className='photo-list';input.closest('label').after(list)}
  list.replaceChildren();
  (images[n-1]||[]).forEach((src,i)=>{const item=document.createElement('div');const img=document.createElement('img');img.src=src;img.alt='Photo '+(i+1)+' — page '+n;const controls=document.createElement('div');controls.className='photo-controls';const label=document.createElement('label');label.textContent='Taille';const select=document.createElement('select');select.setAttribute('aria-label','Taille de la photo '+(i+1)+' — page '+n);Object.entries(photoPresets).forEach(([value,preset])=>select.add(new Option(preset.label,value)));select.value=photoSettings[n-1]?.[i]||'medium';select.onchange=()=>{photoSettings[n-1]||=[];photoSettings[n-1][i]=select.value;render()};label.append(select);const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent='Retirer la photo '+(i+1);button.onclick=()=>{images[n-1].splice(i,1);photoSettings[n-1]?.splice(i,1);photoLinks[n-1]?.splice(i,1);render()};const linkLabel=document.createElement('label');linkLabel.textContent='Lien';const linkInput=document.createElement('input');linkInput.type='url';linkInput.placeholder='https://… (facultatif)';linkInput.setAttribute('aria-label','Lien de la photo '+(i+1)+' — page '+n);linkInput.value=photoLinks[n-1]?.[i]||'';linkInput.oninput=()=>linkInput.setCustomValidity('');linkInput.onchange=()=>{const value=linkInput.value.trim(),href=value?webLink(value):'';if(value&&!href){linkInput.setCustomValidity('Saisissez une adresse commençant par https:// ou http://.');linkInput.reportValidity();return}photoLinks[n-1]||=[];photoLinks[n-1][i]=href;render()};linkLabel.append(linkInput);controls.append(label,linkLabel,button);item.append(img,controls);list.append(item)});
  const remove=$('removeImage'+n);if(remove){remove.hidden=!(images[n-1]||[]).length;remove.textContent='Retirer toutes les photos';remove.onclick=()=>{images[n-1]=[];photoSettings[n-1]=[];photoLinks[n-1]=[];render()}}
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
function linkedPhoto(im,page,index){
 const href=webLink(photoLinks[page]?.[index]||'');if(!href)return im;
 const a=document.createElement('a');a.className='photo-link';a.href=href;a.target='_blank';a.rel='noopener noreferrer';a.title='Ouvrir le lien de cette photo';a.append(im);return a;
}
function pageBreakMarker(){
 const marker=document.createElement('div');marker.dataset.pageBreak='true';marker.className='editor-page-break';marker.contentEditable='false';marker.tabIndex=0;marker.setAttribute('role','button');marker.title='Supprimer ce saut de page';marker.textContent='Saut de page — supprimer';return marker;
}
function clean(html){const t=document.createElement('div');t.innerHTML=html; t.querySelectorAll('script,style,iframe,object,embed,link,meta,img').forEach(n=>n.remove());t.querySelectorAll('[data-page-break]').forEach(n=>n.replaceWith(pageBreakMarker()));t.querySelectorAll('*').forEach(n=>{if(n.dataset.pageBreak==='true')return;const href=n.tagName==='A'?webLink(n.getAttribute('href')||''):null;for(const a of [...n.attributes])if(!['style','color','size','face'].includes(a.name))n.removeAttribute(a.name);if(href){n.href=href;n.target='_blank';n.rel='noopener noreferrer'}if(n.style){const keep={};['color','fontSize','fontWeight','fontStyle','textDecoration','textAlign','lineHeight'].forEach(k=>keep[k]=n.style[k]);n.removeAttribute('style');Object.entries(keep).forEach(([key,value])=>{if(value)n.style[key]=value})}});linkify(t);return t.innerHTML}
function state(){return {version:10,insets:insetData(),lineHeights:{...lineHeights},fields:Object.fromEntries(ids.map(id=>[id,$(id).value])),editors:Object.fromEntries(editors.map(id=>[id,$(id).innerHTML])),background:defaultBackground,pageBackgrounds:{...pageBackgrounds},images,photoSettings,photoLinks,colors:Object.fromEntries([...document.querySelectorAll('.rich-toolbar')].map(t=>[t.dataset.editor,t.querySelector('[type=color]').value]))}}
function save(){const s=state();try{localStorage.setItem('newsletter-draft',JSON.stringify({...s.fields,...s.editors,background:s.background,pageBackgrounds:s.pageBackgrounds,photoSettings:s.photoSettings,photoLinks:s.photoLinks,images:s.images,insets:s.insets,lineHeights:s.lineHeights}));}catch{} }
function applyLineHeight(root,value){
 root.style.lineHeight=value||'';
 root.querySelectorAll('p,div,li,ul,ol,blockquote').forEach(node=>{if(!node.dataset.pageBreak)node.style.lineHeight=value||''});
}
function textBlocks(id){const nodes=blocks($(id).innerHTML);if(lineHeights[id])nodes.forEach(node=>applyLineHeight(node,lineHeights[id]));return nodes}
function blocks(html){const d=document.createElement('div');d.innerHTML=clean(html);return [...d.childNodes].filter(n=>n.textContent.trim()||n.nodeName==='BR').map(n=>{if(n.nodeType===3){const p=document.createElement('p');p.textContent=n.textContent;return p}return n})}
function slice(node,start,end){const w=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);let nodes=[],n;while(n=w.nextNode())nodes.push(n);const at=offset=>{for(const n of nodes){if(offset<=n.length)return[n,offset];offset-=n.length}return[node,node.childNodes.length]};const r=document.createRange();r.setStart(...at(start));r.setEnd(...at(end));const c=node.cloneNode(false);let fragment=r.cloneContents();let ancestor=r.commonAncestorContainer;if(ancestor.nodeType===3)ancestor=ancestor.parentNode;while(ancestor&&ancestor!==node){const wrapper=ancestor.cloneNode(false);wrapper.append(fragment);fragment=wrapper;ancestor=ancestor.parentNode}c.append(fragment);
 // A range may clone an empty list item at its boundary. A continued item
 // keeps its text on the next page without drawing another bullet.
 c.querySelectorAll('li').forEach(item=>{if(!item.textContent.trim()&&!item.querySelector('img'))item.remove()});
 if(start>0){const [text,offset]=at(start);const item=text.parentElement?.closest('li');if(item&&node.contains(item)){
  const before=document.createRange();before.selectNodeContents(item);before.setEnd(text,offset);
  const after=document.createRange();after.selectNodeContents(item);after.setStart(text,offset);
  if(before.toString().trim()&&after.toString().trim()){const lists=[node,...node.querySelectorAll('ul,ol')].filter(list=>list.matches('ul,ol'));for(const list of lists){const index=[...list.children].indexOf(item);if(index<0)continue;const target=list===node?c:[...c.querySelectorAll(list.tagName.toLowerCase())][0];if(target?.firstElementChild)target.firstElementChild.style.listStyleType='none';break}}
 }}
 return c}
function render(){clearTimeout(timer);updatePhotoControls();area.replaceChildren();const s=state();let queue=[];
 if(s.fields.sectionTitle.trim()){const h=document.createElement('h2');h.textContent=s.fields.sectionTitle;queue.push(h)}
 queue.push(...textBlocks('introText'),...textBlocks('bodyText'));
 if($( 'quote').textContent.trim()){const q=document.createElement('blockquote');q.className='quote';q.innerHTML=clean(s.editors.quote);if(lineHeights.quote)applyLineHeight(q,lineHeights.quote);queue.push(q)}
 const pendingInsets=s.insets.map(data=>({...data,remaining:data.insetText.trim(),page:Math.min(99,Math.max(1,Number(data.insetPage)||1)),started:false})).filter(data=>data.remaining);
 let page=0;
 do{page++;const sheet=document.createElement('article');sheet.className='sheet';sheet.style.setProperty('--paper',`url("assets/backgrounds/${s.pageBackgrounds[page]||s.background}.png")`);sheet.innerHTML=logos;area.append(sheet);
 if(page===1){for(const [key,tag,cls] of [['category','div','category'],['title','h1','headline'],['subtitle','p','subtitle']]){if(s.fields[key]){const n=document.createElement(tag);n.className=cls;n.textContent=s.fields[key];sheet.append(n)}}const meta=document.createElement('div');meta.className='metadata';meta.textContent=[s.fields.author,s.fields.date].filter(Boolean).join(' | ');sheet.append(meta)}
 const flow=document.createElement('div');flow.className='flow';sheet.append(flow);const bottom=sheet.getBoundingClientRect().top+1058;
 let added=0;
 const photos=images[page-1]||[];
 // Try photos after the remaining text, retaining each selected size.
 let photosBelow=false;
 if(!pendingInsets.some(data=>data.remaining&&page>=data.page)&&queue.length&&!queue.some(node=>node.dataset.pageBreak==='true')&&photos.length&&photos.every(src=>photoSizes.has(src))){
  queue.forEach(node=>flow.append(node.cloneNode(true)));
  const gallery=document.createElement('div');gallery.className='conclusion-photos';
  photos.forEach((src,i)=>{const size=photoSizes.get(src);const im=document.createElement('img');im.src=src;im.alt='Illustration '+(i+1)+' de la page '+page;im.width=size.width;im.height=size.height;const width=flow.clientWidth*photoPreset(page-1,i).width;im.style.width=width+'px';im.style.height=(width*size.height/size.width)+'px';gallery.append(linkedPhoto(im,page-1,i))});
  flow.append(gallery);
  if(flow.getBoundingClientRect().bottom<=bottom){queue=[];photosBelow=true}else flow.replaceChildren();
 }
 // Stagger floats down the page so paragraphs wrap around each photograph.
 const available=Math.max(80,bottom-flow.getBoundingClientRect().top);
 const totalWeight=photos.reduce((sum,_,i)=>sum+photoPreset(page-1,i).factor,0);
 const photoHeight=Math.min(220,Math.max(24,(available*0.78-photos.length*20)/Math.max(1,totalWeight)));
 const orderedPhotos=photos.map((src,i)=>({src,i}));if(orderedPhotos.length>1)orderedPhotos.push(orderedPhotos.splice(1,1)[0]);
 if(!photosBelow)orderedPhotos.forEach(({src,i})=>{const im=document.createElement('img');im.className='photo'+((i+page)%2===0?' left':'');const preset=photoPreset(page-1,i),heightLimit=photoHeight*preset.factor;im.style.maxWidth=(preset.width*100)+'%';im.style.maxHeight=heightLimit+'px';const size=photoSizes.get(src);if(size){const width=Math.min(flow.clientWidth*preset.width,heightLimit*size.width/size.height);im.style.width=width+'px';im.style.height=(width*size.height/size.width)+'px'}im.onload=()=>{if(!photoSizes.has(src)&&im.naturalWidth){photoSizes.set(src,{width:im.naturalWidth,height:im.naturalHeight});schedule()}};im.src=src;im.alt='Illustration '+(i+1)+' de la page '+page;flow.append(linkedPhoto(im,page-1,i));if(i===1){im.style.marginTop=Math.max(2,bottom-im.getBoundingClientRect().bottom-10)+'px'}const rect=im.getBoundingClientRect(),paper=sheet.getBoundingClientRect();im.dataset.printTop=i===1?1058-rect.height-12:rect.top-paper.top;im.dataset.printLeft=im.classList.contains('left')?62:794-62-rect.width});
 for(const data of pendingInsets){
  if(!data.remaining||page<data.page)continue;
  let insetRemaining=data.remaining;
  const inset=document.createElement('aside');inset.className='article-inset'+(data.insetSide==='left'?' left':'');
  inset.style.width=(['34','40','46'].includes(data.insetWidth)?data.insetWidth:'40')+'%';
  const heading=document.createElement('h3');heading.textContent=data.insetTitle.trim()||'À noter';
  if(data.started)heading.textContent+=' (suite)';
  const text=document.createElement('p');text.textContent=insetRemaining;inset.append(heading,text);flow.append(inset);
  // Split very long sidebars at a word boundary while retaining all their text.
  if(inset.getBoundingClientRect().bottom+14>bottom){
   const stops=[...insetRemaining.matchAll(/\s+/g)].map(m=>m.index+m[0].length);
   let lo=0,hi=stops.length-1,best=0;
   while(lo<=hi){const mid=(lo+hi)>>1;text.textContent=insetRemaining.slice(0,stops[mid]);if(inset.getBoundingClientRect().bottom+14<=bottom){best=stops[mid];lo=mid+1}else hi=mid-1}
   // If no whole word fits below the photos, continue the inset on the next page.
   if(!best)inset.remove();
   text.textContent=insetRemaining.slice(0,best);insetRemaining=insetRemaining.slice(best);
  }else insetRemaining='';
  data.remaining=insetRemaining;if(inset.isConnected)data.started=true;
  linkify(text);
 }
 const fits=()=>flow.getBoundingClientRect().bottom<=bottom;
 while(queue.length){
 const node=queue[0];if(node.dataset.pageBreak==='true'){queue.shift();break}flow.append(node);if(fits()){queue.shift();added++;continue}node.remove();
 // Keep a block together whenever it can fit on a fresh page. Only blocks
 // taller than a full page need the word-level splitting below.
 const probe=sheet.cloneNode(false);probe.style.visibility='hidden';probe.style.position='absolute';
 const probeFlow=document.createElement('div');probeFlow.className='flow';probeFlow.append(node.cloneNode(true));probe.append(probeFlow);area.append(probe);
 const fitsFreshPage=probeFlow.getBoundingClientRect().bottom<=probe.getBoundingClientRect().top+1058;probe.remove();
 if(fitsFreshPage&&(added>0||page===1||flow.querySelector('.photo,.article-inset')))break;
 // Prefer a break between list items, so an ordinary item stays together.
 if(node.matches('ul,ol')&&node.children.length>1){
  let count=0;
  for(let i=1;i<node.children.length;i++){const part=node.cloneNode(false);[...node.children].slice(0,i).forEach(item=>part.append(item.cloneNode(true)));flow.append(part);const ok=fits();part.remove();if(!ok)break;count=i}
  if(count){const part=node.cloneNode(false);for(let i=0;i<count;i++)part.append(node.firstElementChild);flow.append(part);if(node.tagName==='OL')node.start=(Number(node.getAttribute('start'))||1)+count;added++;break}
 }
 const words=[...node.textContent.matchAll(/\s+/g)].map(m=>m.index+m[0].length);let lo=0,hi=words.length-1,best=0;
 while(lo<=hi){const mid=(lo+hi)>>1,c=slice(node,0,words[mid]);flow.append(c);const ok=fits();c.remove();if(ok){best=words[mid];lo=mid+1}else hi=mid-1}
 if(best>0){flow.append(slice(node,0,best));queue[0]=slice(node,best,node.textContent.length);added++}
 else if(!added&&page>1&&!flow.querySelector('.article-inset')){flow.append(node);queue.shift();added++;}
 break;
 }
 const num=document.createElement('span');num.className='page-number';num.textContent=page;sheet.append(num);
 }while((queue.length||pendingInsets.some(data=>data.remaining)||images.slice(page).some(photos=>photos.length))&&page<100);
 updatePhotoControls();
 updateBackgroundControls();
 save();
}
function schedule(){clearTimeout(timer);timer=setTimeout(render,180)}
ids.forEach(id=>$(id).addEventListener('input',schedule));editors.forEach(id=>$(id).addEventListener('input',schedule));
backgroundChoices.forEach(n=>n.addEventListener('change',()=>{const page=$('backgroundPage').value;if(page==='default')defaultBackground=n.value;else pageBackgrounds[page]=n.value;render()}));
$('backgroundPage').onchange=syncBackgroundChoices;
$('inheritBackground').onclick=()=>{delete pageBackgrounds[$('backgroundPage').value];render()};
document.querySelectorAll('.rich-toolbar').forEach(t=>{const ed=$(t.dataset.editor);let range;document.addEventListener('selectionchange',()=>{const s=getSelection();if(s.rangeCount&&ed.contains(s.anchorNode))range=s.getRangeAt(0).cloneRange()});const command=(cmd,v)=>{ed.focus();if(range){const s=getSelection();s.removeAllRanges();s.addRange(range)}document.execCommand(cmd,false,v);schedule()};t.querySelectorAll('[data-command]').forEach(b=>{b.onmousedown=e=>e.preventDefault();b.onclick=()=>command(b.dataset.command)});t.querySelector('[data-size]').onchange=e=>command('fontSize',e.target.value);t.querySelector('[type=color]').oninput=e=>command('foreColor',e.target.value);t.querySelector('[data-line-height]').onchange=e=>{lineHeights[ed.id]=e.target.value;applyLineHeight(ed,e.target.value);schedule()}});
let bodyRange;
document.addEventListener('selectionchange',()=>{const selection=getSelection();if(selection.rangeCount&&$('bodyText').contains(selection.anchorNode)&&$('bodyText').contains(selection.focusNode))bodyRange=selection.getRangeAt(0).cloneRange()});
$('insertPageBreak').onmousedown=e=>e.preventDefault();
$('insertPageBreak').onclick=()=>{
 const ed=$('bodyText');ed.focus();
 const caret=bodyRange&&ed.contains(bodyRange.startContainer)?bodyRange.cloneRange():document.createRange();
 if(!bodyRange||!ed.contains(caret.startContainer)){caret.selectNodeContents(ed);caret.collapse(false)}
 caret.collapse(true);
 // Extract the tail with its formatting, splitting any paragraph at the caret.
 const tailRange=caret.cloneRange();tailRange.setEnd(ed,ed.childNodes.length);const tail=tailRange.extractContents();
 const marker=pageBreakMarker();ed.append(marker);
 if(!tail.textContent.trim()&&!tail.querySelector('[data-page-break]')){const p=document.createElement('p');p.append(document.createElement('br'));tail.append(p)}
 const next=tail.firstChild;ed.append(tail);
 const selection=getSelection(),range=document.createRange();range.selectNodeContents(next);range.collapse(true);selection.removeAllRanges();selection.addRange(range);bodyRange=range.cloneRange();schedule();
};
function removePageBreak(event){const marker=event.target.closest('[data-page-break]');if(marker&&$('bodyText').contains(marker)){event.preventDefault();marker.remove();bodyRange=null;schedule()}}
$('bodyText').addEventListener('click',removePageBreak);
$('bodyText').addEventListener('keydown',event=>{if(['Enter',' ','Backspace','Delete'].includes(event.key)&&event.target.matches('[data-page-break]'))removePageBreak(event)});
$('expandBody').onclick=()=>{document.body.classList.add('body-editor-open');$('bodyText').focus()};$('collapseBody').onclick=()=>document.body.classList.remove('body-editor-open');document.addEventListener('keydown',e=>{if(e.key==='Escape')document.body.classList.remove('body-editor-open')});
function restore(s){extraInsets=[];if(Array.isArray(s.insets)){const valid=s.insets.filter(data=>data&&typeof data==='object').map(data=>Object.fromEntries(insetKeys.map(key=>[key,typeof data[key]==='string'?data[key]:''])));s={...s,fields:{...s.fields,...valid[0]}};extraInsets=valid.slice(1)}updateInsetControls();lineHeights={};editors.forEach(id=>{const value=String(s.lineHeights?.[id]||'');if(['1','1.15','1.3','1.5','1.75','2'].includes(value))lineHeights[id]=value;document.querySelector('[data-editor="'+id+'"] [data-line-height]').value=lineHeights[id]||''});ids.forEach(id=>{if(typeof s.fields?.[id]==='string')$(id).value=s.fields[id]});editors.forEach(id=>{if(typeof s.editors?.[id]==='string')$(id).innerHTML=clean(s.editors[id]);applyLineHeight($(id),lineHeights[id])});if(backgroundChoices.some(n=>n.value===s.background))defaultBackground=s.background;pageBackgrounds={};Object.entries(s.pageBackgrounds||{}).forEach(([page,value])=>{if(/^[1-9]\d*$/.test(page)&&Number(page)<=100&&backgroundChoices.some(n=>n.value===value))pageBackgrounds[page]=value});photoSettings=[];photoLinks=[];images=Array.from({length:Math.max(3,Math.min(s.images?.length||0,100))},(_,page)=>{const sources=Array.isArray(s.images?.[page])?s.images[page]:[s.images?.[page]];const valid=[];photoSettings[page]=[];photoLinks[page]=[];sources.forEach((src,i)=>{if(typeof src==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(src)){valid.push(src);photoLinks[page].push(webLink(typeof s.photoLinks?.[page]?.[i]==='string'?s.photoLinks[page][i]:'')||'');photoSettings[page].push(Object.hasOwn(photoPresets,s.photoSettings?.[page]?.[i])?s.photoSettings[page][i]:'medium')}});return valid});render()}
$('exportJson').onclick=()=>{const u=URL.createObjectURL(new Blob([JSON.stringify(state(),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='newsletter.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
$('importJson').onclick=()=>$('importFile').click();$('importFile').onchange=async e=>{try{const s=JSON.parse(await e.target.files[0].text());if(!s.fields||!s.editors)throw Error();restore(s)}catch{alert('Fichier de newsletter invalide.')}e.target.value=''};
$('addInset').onclick=()=>{extraInsets.push({insetTitle:'',insetText:'',insetPage:'1',insetSide:'right',insetWidth:'40'});updateInsetControls();$('additionalInsets').lastElementChild.querySelector('input').focus();schedule()};
$('removeInset').onclick=()=>{$('insetText').value='';$('insetTitle').value='';render()};
$('reset').onclick=()=>{if(confirm('Effacer le brouillon ?')){localStorage.removeItem('newsletter-draft');location.reload()}};
$('print').onclick=async()=>{await document.fonts.ready;render();window.print()};
function preparePrint(){
 render();
 // Keep floats for text wrapping, but paint photos at fixed sheet coordinates.
 // Print fragmentation can otherwise move a bottom-aligned float to another page.
 area.querySelectorAll('.sheet').forEach(sheet=>sheet.querySelectorAll('.flow .photo').forEach(im=>{
  const copy=im.cloneNode();copy.className='print-photo';copy.removeAttribute('style');
  const rect=im.getBoundingClientRect();Object.assign(copy.style,{top:im.dataset.printTop+'px',left:im.dataset.printLeft+'px',width:rect.width+'px',height:rect.height+'px'});if(im.parentElement.matches('a.photo-link')){const link=im.parentElement.cloneNode(false);link.className='print-photo-link';Object.assign(link.style,{position:'absolute',top:im.dataset.printTop+'px',left:im.dataset.printLeft+'px',width:rect.width+'px',height:rect.height+'px'});Object.assign(copy.style,{position:'static',top:'auto',left:'auto'});link.append(copy);sheet.append(link)}else sheet.append(copy);
  const gap=parseFloat(im.style.marginTop)||0;
  if(gap>2){im.style.height=(rect.height+gap)+'px';im.style.maxHeight='none';im.style.marginTop='0';im.style.shapeOutside='inset('+gap+'px -24px -8px -24px) border-box'}
 }));
}
window.addEventListener('beforeprint',preparePrint);
window.addEventListener('afterprint',render);
try{const s=JSON.parse(localStorage.getItem('newsletter-draft')||'null');if(s)restore({fields:s,editors:s,background:s.background,pageBackgrounds:s.pageBackgrounds,photoSettings:s.photoSettings,photoLinks:s.photoLinks,images:s.images,insets:s.insets,lineHeights:s.lineHeights})}catch{}
if(!$('date').value)$('date').value=new Date().toISOString().slice(0,10);
document.fonts.ready.then(render);
