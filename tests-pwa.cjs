// node tests-pwa.cjs : contrôles sans dépendance ni réseau, avec des doubles de test.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = __dirname;
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
const scope = 'https://example.test/code-secret/';

function checkManifest() {
  assert.equal(manifest.name, 'Code secret');
  assert.equal(manifest.short_name, 'Code secret');
  assert.equal(manifest.display, 'standalone');
  assert.equal(new URL(manifest.id, new URL(scope).origin).href, scope);
  for (const key of ['scope', 'start_url']) assert.equal(new URL(manifest[key], scope).href, scope);
  for (const icon of manifest.icons) {
    const png = fs.readFileSync(path.join(root, icon.src));
    assert.equal(png.subarray(1,4).toString(), 'PNG');
    assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, icon.sizes);
  }
  assert(manifest.icons.some(i => i.sizes==='192x192' && i.purpose==='any'));
  assert(manifest.icons.some(i => i.sizes==='512x512' && i.purpose==='any'));
  assert(manifest.icons.some(i => i.purpose==='maskable'));
  const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert(html.includes('rel="manifest" href="manifest.webmanifest"'));
  assert(html.includes('rel="apple-touch-icon"'));
  assert(html.includes('https://leelee-heg.github.io/code-secret/?installer=1'));
  assert(!fs.readFileSync(path.join(root,'style.css'),'utf8').includes('@import'));
  console.log('OK PWA : manifeste, sous-chemin GitHub Pages, tailles PNG et ressources locales');
}

async function checkWorker() {
  const handlers = {}, stores = new Map();
  let offline = false, claimed = false;
  const keyOf = request => typeof request === 'string' ? request : request.url;
  async function network(request) {
    if(offline) throw new Error('Hors connexion simulé');
    const url = new URL(keyOf(request));
    const name = url.pathname.replace('/code-secret/', '') || 'index.html';
    const file = path.join(root,name);
    return fs.existsSync(file) ? new Response(fs.readFileSync(file)) : new Response('Absent',{status:404});
  }
  const caches = {
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); },
    async open(name) {
      if(!stores.has(name)) stores.set(name,new Map());
      const map = stores.get(name);
      return {
        async addAll(requests) {
          const entries = [];
          for(const request of requests) {
            const response = await network(request);
            assert(response.ok, 'Ressource de préchargement absente : '+request.url);
            entries.push([request.url,response]);
          }
          entries.forEach(([key,value]) => map.set(key,value));
        },
        async put(request,response) { map.set(keyOf(request),response); },
        async match(request) { return map.get(keyOf(request))?.clone(); }
      };
    }
  };
  const self = {
    registration:{scope}, location:new URL(scope),
    addEventListener(name,handler) { handlers[name]=handler; },
    clients:{
      async claim() { claimed=true; },
      async get(id) { return {url:id==='test' ? scope+'?test=1' : scope}; }
    }
  };
  vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'), { self,caches,URL,Request,fetch:network });
  let work;
  handlers.install({waitUntil(promise){work=promise;}}); await work;
  stores.set('another-app:cache',new Map());
  stores.set(`code-secret:${scope}:old`,new Map());
  handlers.activate({waitUntil(promise){work=promise;}}); await work;
  assert(claimed); assert(stores.has('another-app:cache')); assert(!stores.has(`code-secret:${scope}:old`));
  function request(resource,mode='cors',clientId='') {
    let response;
    handlers.fetch({request:{url:new URL(resource,scope).href,method:'GET',mode},clientId,
      respondWith(promise){response=promise;}});
    return response;
  }
  offline=true;
  assert((await (await request('./?installer=1','navigate')).text()).includes('Installer Code secret'));
  assert((await (await request('./game.js?v=0.2.0-accords')).text()).includes('CodeSecretSession'));
  assert.equal((await request('./assets/icon-192.png')).status,200);
  assert.equal(request('./?test=1','navigate'),undefined);
  assert.equal(request('./tests-api.html','navigate'),undefined);
  assert.equal(request('https://another.test/other.js'),undefined);
  await assert.rejects(request('./game.js?v=0.2.0-accords','cors','test'),/Hors connexion simulé/);
  console.log('OK PWA : préchargement complet, repli hors ligne simulé, mode test sur le réseau et caches isolés');
}

async function checkInstallGuide() {
  const events = {}, elements = {};
  for(const id of ['installation','install-dialog','install-open','install-native','install-message','offline-status']) {
    elements[id] = {hidden:false,textContent:'',open:false,handlers:{},
      addEventListener(name,handler){this.handlers[name]=handler;},showModal(){this.open=true;}};
  }
  const display={matches:false,addEventListener(){}};
  let registered = null;
  const navigator = {serviceWorker:{
    ready:Promise.resolve({}),
    async register(url,options) {registered={url,options};return {addEventListener(){},waiting:null};}
  }};
  const window={isSecureContext:true,matchMedia:()=>display,addEventListener:(name,handler)=>{events[name]=handler;}};
  window.self=window; window.top=window;
  const source=fs.readFileSync(path.join(root,'pwa.js'),'utf8');
  vm.runInNewContext(source,{window,navigator,location:new URL(scope+'?installer=1'),URLSearchParams,
    document:{getElementById:id=>elements[id]}});
  assert(elements['install-dialog'].open);
  assert(elements['install-native'].hidden);
  await events.load();
  assert.equal(registered.url,'./sw.js');
  assert.equal(registered.options.scope,'./');
  assert(elements['offline-status'].textContent.includes('disponible hors connexion'));
  let prompted=0,prevented=false;
  events.beforeinstallprompt({preventDefault(){prevented=true;},async prompt(){prompted++;},userChoice:Promise.resolve({outcome:'dismissed'})});
  assert(prevented); assert(!elements['install-native'].hidden);
  await elements['install-native'].handlers.click();
  assert.equal(prompted,1); assert(elements['install-native'].hidden);
  assert(elements['install-message'].textContent.includes('annulée'));
  events.appinstalled(); assert(elements['install-message'].textContent.includes('terminée'));
  const testElements={...elements,installation:{hidden:false}};
  const testEvents={};
  vm.runInNewContext(source,{window:{...window,addEventListener:(n,h)=>{testEvents[n]=h;}},navigator,
    location:new URL(scope+'?test=1'),URLSearchParams,document:{getElementById:id=>testElements[id]}});
  assert(testElements.installation.hidden); assert.equal(testEvents.load,undefined);
  console.log('OK PWA : guide automatique du QR, invitation native simulée, annulation et exclusion du mode test');
}

(async () => { checkManifest(); await checkWorker(); await checkInstallGuide();
  console.log('Contrôles PWA réussis (simulations explicitement indiquées).');
})().catch(error=>{console.error(error);process.exitCode=1;});
