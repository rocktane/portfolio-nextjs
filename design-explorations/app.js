const ICONS={
 grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 list:'<path d="M8 5h13M8 12h13M8 19h13M3 5h.1M3 12h.1M3 19h.1"/>',
 flask:'<path d="M9 3h6m-5 0v6l-6 10a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L14 9V3M7 15h10"/>',
 route:'<circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 7v6a4 4 0 0 0 4 4h4M11 5h5a3 3 0 0 1 0 6h-2"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
 code:'<path d="m7 7-5 5 5 5m10-10 5 5-5 5M14 4l-4 16"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
 search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
 arrow:'<path d="M5 19 19 5M7 5h12v12"/>'
};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]||ICONS.grid}</svg>`;
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const external=(href,label,cls='')=>`<a class="${cls}" href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
document.querySelectorAll('[data-image]').forEach(img=>{img.src=PROJECTS.find(p=>p.id===img.dataset.image).image});
const state={design:'canopee',route:'projets',project:null,filter:'Tous',query:'',view:'grid'};
let pushedContact=false;
const main=document.querySelector('#dash-main'),projectDialog=document.querySelector('#project-dialog'),contactDialog=document.querySelector('#contact-dialog');
let hasRouted=false,lastHash='',programmatic=false;
const scrollPositions=new Map();
history.scrollRestoration='manual';
function navigate(hash){if(hash==='canopee/contact'&&location.hash!=='#canopee/contact')pushedContact=true;programmatic=true;if(location.hash!=='#'+hash)history.pushState(null,'','#'+hash);route()}
function projectsForRoute(){return state.route==='labo'?PROJECTS.filter(p=>p.lab):PROJECTS.slice(0,6)}
function projectCard(p){return `<article class="dash-card"><button type="button" class="dash-shot" data-project="${p.id}" aria-label="Voir le projet ${p.name}"><img src="${p.image}" alt="Capture d’écran de ${p.name}" width="1440" height="900" loading="lazy"><span class="open-project">${icon('arrow')}</span></button><div class="dash-card-info"><div class="dash-card-heading"><h2><button type="button" data-project="${p.id}">${p.name}</button></h2><span class="state ${p.state==='En cours'?'wip':''}">${p.state}</span></div><p>${p.tag}</p><div class="dash-card-bottom"><span>${p.kind} / ${p.stack[0]}</span>${external(p.url,(p.url.includes('github.com')?'Code':'Ouvrir')+icon('arrow'))}</div></div></article>`}
function updateResults(){
 const query=state.query.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const result=projectsForRoute().filter(p=>(state.filter==='Tous'||p.kind===state.filter)&&[p.name,p.tag,...p.stack,p.kind].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query));
 const grid=document.querySelector('#results');
 grid.className='dash-grid'+(state.view==='list'?' list-view':'');
 grid.innerHTML=result.length?result.map(projectCard).join(''):'<div class="empty-results"><h2>Aucun projet trouvé.</h2><button class="plain-button" type="button" data-reset>Réinitialiser la recherche</button></div>';
 document.querySelector('#results-meta').textContent=`${result.length} projet${result.length>1?'s':''}`;
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===state.filter)));
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===state.view)));
}
function catalog(){
 const projects=projectsForRoute(),types=['Tous',...['Web','Mobile','macOS'].filter(t=>projects.some(p=>p.kind===t))];
 if(!types.includes(state.filter))state.filter='Tous';
 return `<div class="dash-page-head"><h1 tabindex="-1">${state.route==='labo'?'Le labo':'Projets'}</h1><div class="view-switch" role="group" aria-label="Présentation des projets"><button type="button" data-view="grid" aria-label="Vue grille" aria-pressed="${state.view==='grid'}">${icon('grid')}</button><button type="button" data-view="list" aria-label="Vue liste" aria-pressed="${state.view==='list'}">${icon('list')}</button></div></div><div class="catalog-toolbar"><div class="filters" role="group" aria-label="Filtrer par plateforme" ${types.length<3?'hidden':''}>${types.map(t=>`<button type="button" data-filter="${t}" aria-pressed="${state.filter===t}">${t}<span>${t==='Tous'?projects.length:projects.filter(p=>p.kind===t).length}</span></button>`).join('')}</div><label class="search">${icon('search')}<input id="project-search" type="search" placeholder="Rechercher un projet…" aria-label="Rechercher un projet" value="${esc(state.query)}"></label></div><p class="results-meta" id="results-meta" role="status" aria-live="polite" aria-atomic="true"></p><div class="dash-grid" id="results"></div>`
}
function career(){return `<div class="dash-page-head"><h1 tabindex="-1">Parcours</h1></div><div class="career-header"><div><h2>Yohan Gouiran</h2><p>Développeur fullstack · Marseille</p></div></div><ol class="career-list"><li><time>2018–2023</time><div><h2>Ingénieur en construction durable</h2><p>ESTP Paris · 5 ans en bureaux d’études</p></div></li><li><time>2023–2024</time><div><h2>Développement web</h2><p>Le Wagon · Bootcamp puis professeur assistant</p></div></li><li><time>2024–2026</time><div><h2>Architecture SI & développement fullstack</h2><p>Epitech · Master Architecte SI, spécialité IA</p><p>Safee · Alternance mobile, API & infrastructure</p></div></li></ol><div class="career-actions"><a class="solid-button" href="/CV-20260409.pdf" target="_blank" rel="noopener noreferrer">Ouvrir le CV ${icon('arrow')}</a><a class="plain-button" href="#atelier/contact">Contacter Yohan</a></div>`}
function detail(p){return `<a class="detail-back" href="#atelier/${state.route}">← ${state.route==='labo'?'Le labo':'Tous les projets'}</a><div class="dash-page-head detail-heading"><div><h1 tabindex="-1">${p.name}</h1><p>${p.tag}</p></div>${external(p.url,(p.url.includes('github.com')?'Voir le code':'Ouvrir '+p.name)+' '+icon('arrow'),'solid-button')}</div><div class="project-detail"><figure><img src="${p.image}" alt="Capture d’écran de ${p.name}" width="1440" height="900"></figure><aside class="detail-meta"><span class="state ${p.state==='En cours'?'wip':''}">${p.state}</span><p>${p.description}</p><dl><div><dt>Contribution</dt><dd>${p.role}</dd></div><div><dt>Technologies</dt><dd>${p.stack.join(', ')}</dd></div><div><dt>Plateforme</dt><dd>${p.kind}</dd></div></dl></aside></div>`}
function contact(){return `<div class="dash-page-head"><h1 tabindex="-1">Contact</h1></div><section class="contact-page"><h2>Faisons équipe.</h2><a class="contact-email" href="mailto:dev@yohangouiran.com">dev@yohangouiran.com</a><div class="contact-actions"><a class="solid-button" href="mailto:dev@yohangouiran.com">Écrire un message ${icon('arrow')}</a><button class="plain-button" type="button" data-copy-email>Copier l’adresse</button></div><p class="contact-feedback" role="status" aria-live="polite"></p><a class="contact-option" href="https://form.typeform.com/to/lgl3RBTB" target="_blank" rel="noopener noreferrer"><span>Un projet à présenter ?<small>Le formulaire de contact</small></span><span aria-hidden="true">↗</span></a><a class="contact-option" href="https://www.linkedin.com/in/yohan-g" target="_blank" rel="noopener noreferrer"><span>LinkedIn<small>Échangeons sur votre mission</small></span><span aria-hidden="true">↗</span></a></section>`}
function renderDashboard(){
 main.innerHTML=state.project?detail(state.project):state.route==='contact'?contact():state.route==='parcours'?career():catalog();
 if(!state.project&&['projets','labo'].includes(state.route))updateResults();
 document.querySelector('#breadcrumb').textContent={projets:'Projets',labo:'Le labo',parcours:'Parcours',contact:'Contact'}[state.route];
 if(state.project)document.querySelector('#breadcrumb').innerHTML=`<a href="#atelier/${state.route}">${state.route==='labo'?'Le labo':'Projets'}</a> / ${state.project.name}`;
 document.querySelector('.top-contact').hidden=state.route==='contact';
 document.querySelector('.dash-footer a').hidden=state.route==='contact';
 document.querySelectorAll('[data-route]').forEach(a=>{if(a.dataset.route===state.route)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
}
function route(){
 const prev=lastHash,isProgrammatic=programmatic,previousProject=state.project;programmatic=false;
 if(hasRouted)scrollPositions.set(prev,window.scrollY);
 const parts=location.hash.slice(1).split('/'),design=['canopee','atelier'].includes(parts[0])?parts[0]:document.body.dataset.initial;
 const nextRoute=['projets','labo','parcours','contact'].includes(parts[1])?parts[1]:'projets';
 const project=design==='atelier'&&['projets','labo'].includes(nextRoute)?PROJECTS.find(p=>p.id===parts[2]&&(nextRoute==='labo'?p.lab:PROJECTS.indexOf(p)<6)):null;
 if(design==='atelier'&&parts[2]&&!project)history.replaceState(null,'','#atelier/'+nextRoute);
 lastHash=location.hash;
 const changed=state.design!==design||state.route!==nextRoute||state.project?.id!==project?.id;
 if(state.route!==nextRoute){state.query='';state.filter='Tous'}
 if(projectDialog.open)projectDialog.close();
 if(contactDialog.open&&(design!=='canopee'||parts[1]!=='contact'))contactDialog.close();
 state.design=design;state.route=nextRoute;state.project=project||null;
 document.body.dataset.theme=design;
 document.querySelector('#canopee-view').hidden=design!=='canopee';document.querySelector('#atelier').hidden=design!=='atelier';
 document.querySelectorAll('[data-design]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.design===design)));
 document.querySelector('.skip').href=design==='canopee'?'#main':'#dash-main';
 document.title=(design==='canopee'?'Canopée':'Atelier')+' — Yohan Gouiran';
 document.querySelector('meta[name="theme-color"]').content=design==='canopee'?'#103e3d':'#f5f7f4';
 if(design==='atelier'){renderDashboard();if(hasRouted&&changed)main.querySelector('h1')?.focus({preventScroll:true})}
 const isContactTransition=design==='canopee'&&(parts[1]==='contact'||prev==='#canopee/contact');
 if(!isContactTransition&&(hasRouted||parts[0])){
   if(!isProgrammatic&&scrollPositions.has(location.hash)){window.scrollTo({top:scrollPositions.get(location.hash),behavior:'instant'});if(design==='atelier'&&previousProject&&!project)main.querySelector('[data-project="'+previousProject.id+'"]')?.focus({preventScroll:true})}
   else if(design==='canopee'&&parts[1]==='projets')document.querySelector('#can-projects').scrollIntoView({behavior:'instant'});
   else if(changed||parts.length===1)window.scrollTo({top:0,behavior:'instant'});
 }
 if(design==='canopee'&&parts[1]==='contact'&&!contactDialog.open){if(hasRouted&&prev!=='#canopee/contact')pushedContact=true;contactDialog.showModal()}
 hasRouted=true;
}
function openProject(id){
 const p=PROJECTS.find(p=>p.id===id);if(!p)return;
 if(state.design==='atelier'){navigate('atelier/'+state.route+'/'+id);return}
 document.querySelector('#dialog-title').textContent=p.name;
 document.querySelector('#dialog-category').textContent=p.kind+' / '+p.state;
 const image=document.querySelector('#dialog-image');image.src=p.image;image.alt='Capture d’écran de '+p.name;
 const link=document.querySelector('#dialog-link');link.href=p.url;link.textContent=p.url.includes('github.com')?'Voir le code ↗':'Ouvrir '+p.name+' ↗';
 document.querySelector('#dialog-description').textContent=p.description;document.querySelector('#dialog-role').textContent=p.role;document.querySelector('#dialog-stack').textContent=p.stack.join(', ');
 projectDialog.showModal();projectDialog.scrollTop=0;
}
document.addEventListener('click',async e=>{
 const anchor=e.target.closest('a');
 if(anchor?.classList.contains('skip')){e.preventDefault();const target=document.querySelector(state.design==='atelier'?'#dash-main':'#main');target.focus();target.scrollIntoView({behavior:'instant'});return}
 const hash=anchor?.getAttribute('href');
 if(hash&&/^#(canopee|atelier)(\/|$)/.test(hash)&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){e.preventDefault();navigate(hash.slice(1));return}
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.design){navigate(b.dataset.design==='atelier'?'atelier/projets':'canopee');return}
 if(b.dataset.project){openProject(b.dataset.project);return}
 if(b.dataset.filter){state.filter=b.dataset.filter;updateResults();return}
 if(b.dataset.view){state.view=b.dataset.view;updateResults();return}
 if(b.hasAttribute('data-reset')){state.query='';state.filter='Tous';document.querySelector('#project-search').value='';updateResults();document.querySelector('#project-search').focus();return}
 if(b.hasAttribute('data-copy-email')){
   const feedback=document.querySelector('.contact-feedback');
   try{await navigator.clipboard.writeText('dev@yohangouiran.com');feedback.textContent='Adresse copiée.';b.textContent='Copié !'}catch{const el=document.querySelector('.contact-page .contact-email'),selection=window.getSelection(),range=document.createRange();range.selectNodeContents(el);selection.removeAllRanges();selection.addRange(range);feedback.textContent='Adresse sélectionnée. Copiez-la avec votre clavier.'}
 }
});
document.addEventListener('input',e=>{if(e.target.id==='project-search'){state.query=e.target.value;updateResults()}});
document.querySelector('#close-dialog').addEventListener('click',()=>projectDialog.close());document.querySelector('#close-contact').addEventListener('click',()=>contactDialog.close());
for(const dialog of [projectDialog,contactDialog])dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
contactDialog.addEventListener('close',()=>{if(location.hash==='#canopee/contact'){if(pushedContact){pushedContact=false;history.back()}else{history.replaceState(null,'','#canopee');lastHash=location.hash}}else pushedContact=false});
window.addEventListener('hashchange',route);route();
