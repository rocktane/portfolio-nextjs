/* Browser checks against the actual prototypes. No server or app dependencies. */
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=process.env.PORTFOLIO_URL||pathToFileURL(path.join(__dirname,'index.html')).href;
 // Regression checks for the council's exact scroll/history scenarios.
 const navigationFailures=[];
 await page.setViewportSize({width:1440,height:900});
 await page.goto(url+'#canopee');await page.evaluate(()=>document.fonts.ready);
 await page.locator('.can-ending .can-contact').scrollIntoViewIfNeeded();
 const contactScroll=await page.evaluate(()=>scrollY);
 await page.locator('.can-ending .can-contact').click();await page.locator('#contact-dialog').waitFor();
 await page.keyboard.press('Escape');await page.waitForURL('**#canopee');await page.evaluate(()=>new Promise(requestAnimationFrame));
 if(Math.abs(await page.evaluate(()=>scrollY)-contactScroll)>2)navigationFailures.push('Canopée contact must preserve scroll');
 await page.goForward();await page.locator('#contact-dialog').waitFor();await page.keyboard.press('Escape');await page.waitForURL('**#canopee');await page.evaluate(()=>new Promise(requestAnimationFrame));await page.goForward();await page.locator('#contact-dialog').waitFor();await page.keyboard.press('Escape');await page.waitForURL('**#canopee');
 await page.goto(url+'#atelier/projets');await page.locator('#results').waitFor();
 await page.locator('#results [data-project=amp]').first().scrollIntoViewIfNeeded();
 const gridScroll=await page.evaluate(()=>scrollY);
 await page.locator('#results [data-project=amp]').first().click();await page.locator('.project-detail').waitFor();
 await page.goBack();await page.locator('#results').waitFor();await page.evaluate(()=>new Promise(requestAnimationFrame));
 if(Math.abs(await page.evaluate(()=>scrollY)-gridScroll)>2)navigationFailures.push('Atelier Back must preserve grid position');
 assert.equal(await page.evaluate(()=>document.activeElement.dataset.project),'amp','Back restores keyboard focus to the project');
 assert.deepEqual(navigationFailures,[]);
 const screenshotDir=process.env.SCREENSHOT_DIR||'/tmp/portfolio-v2';require('node:fs').mkdirSync(screenshotDir,{recursive:true});
 const routes=['canopee','atelier/projets','atelier/labo','atelier/parcours','atelier/contact','atelier/projets/brower'];
 for(const width of [320,390,768,1100,1440,1920]){
  await page.setViewportSize({width,height:960});
  for(const route of routes){
   await page.goto(url+'#'+route);await page.evaluate(()=>document.fonts.ready);if(route.startsWith('atelier'))await page.locator('[data-route="'+route.split('/')[1]+'"][aria-current=page]').waitFor();else await page.locator('#canopee-view').waitFor();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width} ${route}`);
   assert.equal(await page.locator('body').getAttribute('data-theme'),route.startsWith('atelier')?'atelier':'canopee');
   const dock=await page.locator('.design-dock').boundingBox();assert(dock.x>=0&&dock.x+dock.width<=width&&dock.y+dock.height<=960,`dock ${width}`);
   const images=await page.locator(route==='canopee'?'.can-grid img':route.split('/').length===3?'.project-detail img':'.dash-grid img').all();
   for(const image of images){
    assert(await image.evaluate(async el=>{if(!el.complete)await new Promise(r=>{el.onload=r;el.onerror=r});return el.naturalWidth>0}),'broken image');
    assert(await image.evaluate(el=>{for(let p=el;p;p=p.parentElement){const c=getComputedStyle(p);if(c.filter!=='none'||c.mixBlendMode!=='normal'||c.opacity!=='1')return false}return true}),'altered screenshot');
   }
   if([390,1440].includes(width)&&['canopee','atelier/projets','atelier/contact','atelier/projets/brower'].includes(route))await page.screenshot({path:path.join(screenshotDir,route.replaceAll('/','-')+'-'+width+'.png'),fullPage:true,animations:'disabled'});
  }
 }
 await page.setViewportSize({width:1100,height:900});await page.goto(url+'#atelier/projets');
 assert.equal(await page.locator('.dash-card').count(),6);
 await page.getByRole('button',{name:'Mobile',exact:false}).click();assert.equal(await page.locator('.dash-card').count(),2);
 await page.locator('#project-search').fill('cashou');assert.equal(await page.locator('.dash-card').count(),1);
 await page.locator('#project-search').fill('absent-zzz');assert.equal(await page.locator('.dash-card').count(),0);assert(await page.getByRole('heading',{name:'Aucun projet trouvé.'}).isVisible());
 await page.getByRole('button',{name:'Réinitialiser la recherche'}).click();assert.equal(await page.locator('.dash-card').count(),6);
 await page.getByRole('button',{name:'Vue liste',exact:true}).click();assert(await page.locator('#results').evaluate(el=>el.classList.contains('list-view')));
 await page.getByRole('button',{name:'Voir le projet Brower',exact:true}).click();await page.waitForURL('**#atelier/projets/brower');await page.locator('.project-detail img').waitFor();assert(!await page.locator('#project-dialog').isVisible());assert.equal(await page.locator('.detail-heading .solid-button').getAttribute('href'),'https://bro.yohan.one');
 const source=await page.locator('.project-detail img').getAttribute('src');const file=require('node:fs').readFileSync(path.join(__dirname,'../public/projects/brower.webp'));assert.equal(source.split(',')[1],file.toString('base64'),'screenshot bytes must match');
 await page.reload();await page.locator('.project-detail').waitFor();assert((await page.locator('#breadcrumb').textContent()).includes('Brower'));
 await page.goBack();await page.locator('#results').waitFor();assert.equal(await page.locator('.dash-card').count(),6);
 await page.locator('#project-search').fill('cashou');
 await page.getByRole('link',{name:'Le labo',exact:false}).click();await page.waitForFunction(()=>document.querySelectorAll('.dash-card').length===3);assert.equal(await page.locator('.dash-card').count(),3);assert.equal(await page.locator('#project-search').inputValue(),'');assert(!await page.locator('.filters').isVisible());
 await page.getByRole('link',{name:'Se connecter',exact:true}).click();await page.waitForURL('**#atelier/contact');assert(page.url().endsWith('#atelier/contact'));await page.getByRole('heading',{name:'Faisons équipe.'}).waitFor();assert(await page.getByRole('heading',{name:'Faisons équipe.'}).isVisible());
 assert.equal(await page.getByRole('link',{name:'Écrire un message',exact:false}).first().getAttribute('href'),'mailto:dev@yohangouiran.com');
 await page.getByRole('link',{name:'Parcours',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.career-list li').length===3);assert.equal(await page.locator('.career-list li').count(),3);
 await page.locator('.skip').focus();await page.keyboard.press('Enter');assert(page.url().endsWith('#atelier/parcours'));assert.equal(await page.locator('body').getAttribute('data-theme'),'atelier');
 await page.getByRole('button',{name:'Canopée',exact:false}).click();assert.equal(await page.locator('.can-card').count(),6);
 await page.locator('.can-nav').getByRole('link',{name:'Projets',exact:true}).click();await page.waitForFunction(()=>scrollY>0);await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.locator('.can-nav').getByRole('link',{name:'Projets',exact:true}).click();await page.waitForFunction(()=>scrollY>0);
 await page.locator('.can-nav').getByRole('link',{name:'Parlons-en',exact:false}).click();await page.locator('#contact-dialog').waitFor();assert(await page.locator('#contact-dialog').isVisible());await page.keyboard.press('Escape');await page.waitForFunction(()=>!location.hash.endsWith('/contact'));assert(page.url().endsWith('#canopee/projets')); 
 await page.locator('[data-project=exo]').first().click();assert(await page.locator('#project-dialog').isVisible());await page.getByRole('button',{name:'Fermer le projet',exact:true}).click();
 await page.goto(url+'#atelier/contact');await page.reload();await page.getByRole('heading',{name:'Faisons équipe.'}).waitFor();assert(await page.getByRole('heading',{name:'Faisons équipe.'}).isVisible());
 const keyboard=await browser.newPage();await keyboard.goto(url+'#canopee');await keyboard.keyboard.press('Tab');assert(await keyboard.locator('.skip').evaluate(el=>el===document.activeElement),'Canopée skip must be first Tab target');await keyboard.close();
 for(const invalid of ['atelier/projets/zzz','atelier/labo/brower']){await page.goto(url+'#'+invalid);await page.waitForURL('**#'+invalid.split('/').slice(0,2).join('/'));await page.locator('#results').waitFor()}
 if(process.env.PORTFOLIO_URL){const cv=await page.request.get(new URL('/CV.pdf',url).href);assert.equal(cv.status(),200);assert((await cv.body()).subarray(0,5).equals(Buffer.from('%PDF-')))}
 assert.deepEqual(errors,[]);
 console.log('PASS: 36 route/viewport combinations, original images, dock, search, filters, empty state, list, shareable project detail/reload/Back, Canopée dialog/Escape, same-hash links, skip link, isolated section search, labo, contact/login, career, reload, scroll restoration, first Tab, invalid URLs.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
