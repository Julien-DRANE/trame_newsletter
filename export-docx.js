'use strict';
// Native OOXML export. The bundled docx library keeps downloads available offline.
async function buildWordDocument(){
 const D=window.docx;
 await document.fonts.ready;
 // Resolve image dimensions before the final pagination pass.
 await Promise.all(images.flat().map(src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{photoSizes.set(src,{width:im.naturalWidth,height:im.naturalHeight});resolve()};im.onerror=reject;im.src=src})));
 render();
 const paragraphs=[];
 const color=value=>{const m=value.match(/\d+/g);return m?.length>=3?m.slice(0,3).map(n=>Number(n).toString(16).padStart(2,'0')).join(''):undefined};
 function runs(node){
  if(node.nodeType===3){const style=getComputedStyle(node.parentElement);return [new D.TextRun({text:node.textContent,bold:Number(style.fontWeight)>=600,italics:style.fontStyle==='italic',underline:style.textDecorationLine.includes('underline')?{}:undefined,color:color(style.color),size:Math.round(parseFloat(style.fontSize)*1.5)})]}
  if(node.nodeType!==1)return [];
  if(node.tagName==='BR')return [new D.TextRun({break:1})];
  const children=[...node.childNodes].flatMap(runs);
  const href=node.tagName==='A'?webLink(node.getAttribute('href')||''):null;
  return href?[new D.ExternalHyperlink({link:href,children})]:children;
 }
 function textParagraph(node){
  const style=getComputedStyle(node),tag=node.tagName;
  const heading={H1:D.HeadingLevel.TITLE,H2:D.HeadingLevel.HEADING_1,H3:D.HeadingLevel.HEADING_2}[tag];
  return new D.Paragraph({children:runs(node),heading,alignment:heading?D.AlignmentType.LEFT:({center:D.AlignmentType.CENTER,right:D.AlignmentType.RIGHT,justify:D.AlignmentType.JUSTIFIED}[style.textAlign]||D.AlignmentType.LEFT),spacing:{after:180,line:320},bullet:tag==='LI'?{level:0}:undefined});
 }
 async function imageRun(im,sheet){
  const source=new Image();await new Promise((resolve,reject)=>{source.onload=resolve;source.onerror=reject;source.src=im.src});
  // PNG conversion makes WebP photos readable in Word as well.
  const canvas=document.createElement('canvas');canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;canvas.getContext('2d').drawImage(source,0,0);
  const data=Uint8Array.from(atob(canvas.toDataURL('image/png').split(',')[1]),c=>c.charCodeAt(0));
  const r=im.getBoundingClientRect(),s=sheet.getBoundingClientRect();
  return new D.ImageRun({type:'png',data,transformation:{width:r.width,height:r.height},altText:{title:im.alt,description:im.alt,name:im.alt},floating:im.classList.contains('photo')?{horizontalPosition:{relative:D.HorizontalPositionRelativeFrom.PAGE,offset:Math.round((r.left-s.left)*9525)},verticalPosition:{relative:D.VerticalPositionRelativeFrom.PAGE,offset:Math.round((r.top-s.top)*9525)},wrap:{type:D.TextWrappingType.SQUARE},margins:{left:228600,right:228600,top:19050,bottom:76200},allowOverlap:false}:undefined});
 }
 async function walk(node,sheet){
  if(node.nodeType===3){if(node.textContent.trim())paragraphs.push(new D.Paragraph({children:runs(node)}));return}
  if(node.nodeType!==1||node.classList.contains('page-number'))return;
  if(node.classList.contains('article-inset')){
   const r=node.getBoundingClientRect(),paper=sheet.getBoundingClientRect();
   const edge={style:D.BorderStyle.SINGLE,size:6,color:'7892AE',space:8};
   paragraphs.push(new D.Paragraph({children:[new D.TextRun({text:node.querySelector('h3').textContent,bold:true,size:24}),new D.TextRun({break:1}),...runs(node.querySelector('p'))],
    frame:{type:'absolute',position:{x:Math.round((r.left-paper.left+16)*15),y:Math.round((r.top-paper.top+14)*15)},width:Math.round((r.width-32)*15),height:Math.round((r.height-28)*15),anchor:{horizontal:D.FrameAnchorType.PAGE,vertical:D.FrameAnchorType.PAGE},wrap:D.FrameWrap.AROUND,space:{horizontal:360,vertical:120}},
    border:{top:edge,bottom:edge,left:edge,right:edge},shading:{fill:'F2F5F9'},spacing:{after:0,line:280}}));return;
  }
  if(node.tagName==='IMG'){paragraphs.push(new D.Paragraph({children:[await imageRun(node,sheet)],spacing:{after:120}}));return}
  if(node.matches('p,h1,h2,h3,h4,li,blockquote,.category,.metadata,.subtitle')){
   if(node.matches('blockquote')&&node.querySelector('p,div')){for(const child of node.childNodes)await walk(child,sheet)}else paragraphs.push(textParagraph(node));return;
  }
  if(!node.children.length&&node.textContent.trim()){paragraphs.push(textParagraph(node));return}
  for(const child of node.childNodes)await walk(child,sheet);
 }
 for(const [index,sheet] of [...area.querySelectorAll('.sheet')].entries()){
  if(index)paragraphs.push(new D.Paragraph({children:[new D.PageBreak()]}));
  for(const child of sheet.childNodes)await walk(child,sheet);
 }
 return new D.Document({title:$('title').value,creator:$('author').value,styles:{default:{document:{run:{font:'Arial',size:24,color:'263D5C'}}}},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1500,right:930,bottom:960,left:930}}},children:paragraphs}]});
}
$('exportDocx').onclick=async()=>{
 const button=$('exportDocx');button.disabled=true;button.textContent='Export Word en cours…';
 try{const blob=await window.docx.Packer.toBlob(await buildWordDocument());const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=($('title').value.trim()||'newsletter').replace(/[<>:"/\\|?*\x00-\x1f]/g,'-').slice(0,100)+'.docx';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(error){console.error(error);alert('Impossible de créer le document Word. Veuillez réessayer.')}finally{button.disabled=false;button.textContent='Exporter Word (.docx)'}
};
