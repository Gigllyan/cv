/**
 * pokemap-viewer.js
 * Inject into index.html with: <script src="pokemap-viewer.js"></script>
 *
 * Provides:
 *   - buildMapsContent(pokemon)  → returns the HTML string for the 🗺️ Maps tab
 *   - A self-contained fullscreen map modal (injected once on load)
 *
 * Requires:
 *   - mapa.png in the same folder
 *   - mapas_data.json in the same folder (optional – falls back to data.js mapas)
 *   - getPokemonImageUrl() already defined in index.html
 */

// ─── Image helpers (same logic as admin/viewer) ───────────────────────────────
const PM_SPRITE    = n => {
  const s = String(n);
  if (s.includes('-')) return `https://gigllyan.github.io/cv/projetos/pokedex/pxgtutor/${s}.png`;
  return `https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/detail/${s.padStart(3,'0')}.png`;
};
const PM_SHINY_FB  = n => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${String(n).split('-')[0]}.png`;
const PM_NORMAL_FB = n => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${String(n).split('-')[0]}.png`;

function pmSetImg(el, numero) {
  el.src = PM_SPRITE(numero);
  el.onerror = () => {
    el.onerror = () => { el.src = PM_NORMAL_FB(numero); el.onerror = null; };
    el.src = PM_SHINY_FB(numero);
  };
}

// ─── Merge mapas: data.js value overridden by mapas_data.json if present ──────
let _mapaOverrides = null;
async function getMapaOverrides() {
  if (_mapaOverrides !== null) return _mapaOverrides;
  try {
    const r = await fetch('mapas_data.json?t=' + Date.now());
    _mapaOverrides = r.ok ? await r.json() : {};
  } catch { _mapaOverrides = {}; }
  return _mapaOverrides;
}

function getEffectiveMapas(pokemon, overrides, arrKey) {
  const key = arrKey + '|' + pokemon.nome;
  if (overrides[key]) return overrides[key];
  return (pokemon.mapas || []).map(m => ({
    top:  parseFloat(m.top  ?? m.y ?? 0),
    left: parseFloat(m.left ?? m.x ?? 0),
    text: m.text ?? m.name ?? ''
  }));
}

// ─── Determine array key from pokemon ─────────────────────────────────────────
function getArrayKey(pokemon) {
  const n = String(pokemon.numero);
  return n.includes('-') ? 'shinys' : 'pokes';
}

// ─────────────────────────────────────────────────────────────────────────────
//  buildMapsContent(pokemon)
//  Drop-in replacement for the mapsContent variable in renderSinglePage()
// ─────────────────────────────────────────────────────────────────────────────
function buildMapsContent(pokemon) {
  const mapas = (pokemon.mapas || []);
  const hasMaps = mapas.length > 0;

  if (!hasMaps) {
    return '<div class="info-section"><p style="text-align:center;color:#ccc">Localização desconhecida.</p></div>';
  }

  // Group locations by identical name (text).
  // Each group stores ALL indices that share that name, not just the first.
  // Clicking cycles through all pins of the group in order.
  const groupMap = new Map(); // text -> { indices: [], cyclePos: 0 }
  mapas.forEach((m, i) => {
    const key = (m.text || '').trim();
    if (!groupMap.has(key)) {
      groupMap.set(key, { indices: [i] });
    } else {
      groupMap.get(key).indices.push(i);
    }
  });

  // Cycle-counter per group (persists while the list is rendered)
  const cycleCounts = {};
  [...groupMap.keys()].forEach(k => { cycleCounts[k] = 0; });

  // Build the location list — one button per unique name, cycles on repeated clicks
  const listItems = [...groupMap.entries()].map(([text, { indices }]) => {
    const count = indices.length;
    // Use a JS expression that reads and advances the cycle counter on each click
    const onclickExpr = count === 1
      ? `pmGoToPin(${indices[0]})`
      : `pmGoToPinGroup(${JSON.stringify(indices)}, '${text.replace(/'/g,"\'")}')`;
    return `
    <li onclick="${onclickExpr}"
        style="background:#2a2a2a;margin-bottom:8px;padding:10px;border-radius:5px;
               border-left:4px solid #f08030;cursor:pointer;transition:background .2s;"
        onmouseover="this.style.background='#333'" onmouseout="this.style.background='#2a2a2a'">
      <strong style="color:#fff;font-size:1.05em">📍 ${text}</strong>
      ${count > 1
        ? `<div style="color:#bbb;font-size:12px;margin-top:4px">
             <span style="background:#f08030;color:#fff;border-radius:12px;padding:1px 8px;font-size:11px;font-weight:bold;">${count} locais</span>
           </div>`
        : ''}
    </li>`;
  }).join('');

  return `
    <div class="info-section">
      <h3>🗺️ Localização</h3>

      <!-- Mini-map thumbnail -->
      <div id="pm-thumb-wrap"
           onclick="pmOpenModal()"
           style="position:relative;border-radius:10px;overflow:hidden;cursor:pointer;
                  margin-bottom:16px;border:1px solid #444;box-shadow:0 4px 20px rgba(0,0,0,.5);
                  transition:box-shadow .25s,transform .2s;max-height:220px"
           onmouseover="this.style.boxShadow='0 0 0 2px #4dd0e1,0 8px 30px rgba(0,0,0,.7)';this.style.transform='translateY(-2px)'"
           onmouseout="this.style.boxShadow='0 4px 20px rgba(0,0,0,.5)';this.style.transform=''">

        <img id="pm-thumb-img" src="https://gigllyan.github.io/cv/projetos/pokedex/mapa.png" alt="Mapa"
             style="display:block;width:100%;object-fit:cover;object-position:center;max-height:220px;pointer-events:none">

        <!-- Thumbnail pins -->
        <div id="pm-thumb-pins" style="position:absolute;inset:0;pointer-events:none"></div>

        <!-- Hover overlay -->
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
                    background:rgba(0,0,0,.42);opacity:0;transition:opacity .25s"
             id="pm-thumb-overlay">
          <div style="background:#111;border:1px solid rgba(77,208,225,.4);border-radius:30px;
                      padding:10px 28px;color:#4dd0e1;font-weight:bold;font-size:.9rem">
            🗺 Ver no Mapa
          </div>
        </div>
      </div>

      <!-- Location list -->
      <ul id="pm-loc-list" style="list-style:none;padding:0">${listItems}</ul>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Fullscreen modal — injected once, reused for every pokemon
// ─────────────────────────────────────────────────────────────────────────────
let _modalInjected = false;

function pmInjectModal() {
  if (_modalInjected) return;
  _modalInjected = true;

  // Styles
  const style = document.createElement('style');
  style.textContent = `
    #pm-modal{position:fixed;inset:0;z-index:9000;background:rgba(5,6,12,.97);
      backdrop-filter:blur(12px);display:flex;flex-direction:column;
      opacity:0;pointer-events:none;transition:opacity .25s}
    #pm-modal.open{opacity:1;pointer-events:all}
    #pm-modal .pm-head{
      height:54px;background:#111318;border-bottom:1px solid rgba(255,255,255,.07);
      display:flex;align-items:center;justify-content:space-between;
      padding:0 18px;flex-shrink:0;position:relative;z-index:10}
    #pm-modal .pm-head-l{display:flex;align-items:center;gap:10px;min-width:0;overflow:hidden}
    #pm-modal .pm-poke-img{width:36px;height:36px;background:#1e2230;border-radius:8px;
      overflow:hidden;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    #pm-modal .pm-poke-img img{width:32px;height:32px;object-fit:contain;image-rendering:pixelated}
    #pm-modal .pm-title{font-size:.9rem;font-weight:800;color:#E8EAF0;white-space:nowrap;font-family:sans-serif}
    #pm-modal .pm-close{
      width:38px;height:38px;flex-shrink:0;background:#1a1d26;
      border:1px solid rgba(255,255,255,.1);border-radius:50%;cursor:pointer;
      color:#E8EAF0;font-size:1rem;display:flex;align-items:center;justify-content:center;
      transition:color .15s,border-color .15s,background .15s;margin-left:12px;z-index:20}
    #pm-modal .pm-close:hover{color:#fff;border-color:#E8637A;background:rgba(232,99,122,.15)}
    #pm-body{flex:1;position:relative;overflow:hidden;cursor:grab}
    #pm-body:active{cursor:grabbing}
    #pm-canvas{position:absolute;top:0;left:0;transform-origin:0 0;user-select:none}
    #pm-map-img{display:block;pointer-events:none;image-rendering:auto}
    #pm-pins{position:absolute;top:0;left:0;width:100%;height:100%}
    .pm-hud{position:absolute;font-family:'DM Mono',monospace;font-size:.7rem;color:#555a6e;
      background:rgba(17,19,24,.88);border:1px solid rgba(255,255,255,.07);
      border-radius:7px;padding:4px 12px;backdrop-filter:blur(4px);pointer-events:none;z-index:20}
    #pm-hud-zoom{bottom:14px;left:14px}
    #pm-hud-coord{top:12px;left:14px}
    #pm-hud-hint{top:12px;right:14px;color:#FF4B6E;background:rgba(255,75,110,.07);border-color:rgba(255,75,110,.22);pointer-events:none}
    .pm-ctrl{position:absolute;bottom:14px;right:14px;z-index:20;display:flex;flex-direction:column;gap:5px}
    .pm-btn{width:38px;height:38px;background:rgba(17,19,24,.9);border:1px solid rgba(255,255,255,.07);
      border-radius:8px;color:#E8EAF0;font-size:1rem;cursor:pointer;
      display:flex;align-items:center;justify-content:center;
      transition:border-color .15s;backdrop-filter:blur(4px)}
    .pm-btn:hover{border-color:#FF4B6E;color:#FF4B6E}
    .pm-pin{position:absolute;transform:translate(-50%,-50%) scale(var(--s,1));z-index:20;cursor:pointer;
      transition:transform .18s cubic-bezier(.34,1.56,.64,1),filter .18s}
    .pm-pin:hover,.pm-pin.active{transform:translate(-50%,-50%) scale(calc(var(--s,1)*1.35));z-index:30;filter:brightness(1.2)}
    .pm-bubble{width:46px;height:46px;border-radius:50%;overflow:hidden;
      border:3px solid #fff;box-shadow:0 3px 14px rgba(0,0,0,.75);
      background:#1e2230;position:relative}
    .pm-bubble img{width:100%;height:100%;object-fit:contain;image-rendering:pixelated;display:block}
    .pm-pulse{position:absolute;inset:-8px;border-radius:50%;pointer-events:none;
      animation:pm-pulse 2.4s ease-out infinite}
    @keyframes pm-pulse{0%{box-shadow:0 0 0 0 rgba(77,208,225,.55)}70%{box-shadow:0 0 0 14px rgba(77,208,225,0)}100%{box-shadow:0 0 0 0 rgba(77,208,225,0)}}
    .pm-pin.active .pm-pulse{animation:pm-pulse-a 1.6s ease-out infinite}
    @keyframes pm-pulse-a{0%{box-shadow:0 0 0 0 rgba(240,128,48,.65)}70%{box-shadow:0 0 0 18px rgba(240,128,48,0)}100%{box-shadow:0 0 0 0 rgba(240,128,48,0)}}
    .pm-tt{position:absolute;bottom:calc(100% + 10px);left:50%;transform:translateX(-50%) translateY(6px);
      background:#111520;border:1px solid rgba(255,255,255,.06);border-radius:10px;
      padding:10px 13px;min-width:150px;max-width:220px;box-shadow:0 20px 60px rgba(0,0,0,.8);
      pointer-events:none;opacity:0;transition:opacity .2s,transform .2s;z-index:50;white-space:nowrap}
    .pm-pin:hover .pm-tt,.pm-pin.active .pm-tt{opacity:1;transform:translateX(-50%) translateY(0)}
    .pm-tt-name{font-size:.8rem;font-weight:700;color:#4DC9A8;margin-bottom:4px;font-family:sans-serif}
    .pm-tt-loc{font-size:.71rem;color:#4A5168;font-style:italic;line-height:1.5;font-family:sans-serif;white-space:normal}
    .pm-tt-arr{position:absolute;bottom:-5px;left:50%;transform:translateX(-50%) rotate(45deg);
      width:8px;height:8px;background:#111520;border-right:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06)}
    /* info panel */
    #pm-info{position:absolute;bottom:20px;left:20px;z-index:30;
      background:rgba(13,16,24,.94);border:1px solid rgba(255,255,255,.07);border-radius:12px;
      padding:13px 15px;max-width:270px;backdrop-filter:blur(8px);
      transform:translateY(12px);opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;
      font-family:sans-serif}
    #pm-info.show{opacity:1;transform:none;pointer-events:all}
    #pm-info .pi-loc{font-size:.82rem;font-style:italic;color:#D8DCE8;line-height:1.5}
    #pm-info .pi-x{position:absolute;top:8px;right:8px;width:22px;height:22px;
      background:transparent;border:none;cursor:pointer;color:#4A5168;font-size:.8rem;
      display:flex;align-items:center;justify-content:center}
    #pm-info .pi-x:hover{color:#E8637A}
    /* show-all buttons */
    #pm-showall-all{position:absolute;top:12px;right:14px;z-index:20;
      background:rgba(13,16,24,.88);border:1px solid rgba(255,255,255,.07);border-radius:20px;
      padding:5px 14px;font-family:monospace;font-size:.7rem;color:#4A5168;
      cursor:pointer;backdrop-filter:blur(4px);transition:color .15s,border-color .15s;white-space:nowrap}
    #pm-showall-all:hover{color:#D4A853;border-color:rgba(212,168,83,.35)}
    #pm-showsame{position:absolute;top:12px;left:14px;z-index:20;
      background:rgba(0,217,196,.08);border:1px solid rgba(0,217,196,.25);border-radius:20px;
      padding:5px 14px;font-family:monospace;font-size:.7rem;color:#00D9C4;
      cursor:pointer;backdrop-filter:blur(4px);transition:color .15s,border-color .15s,background .15s;white-space:nowrap}
    #pm-showsame:hover{background:rgba(0,217,196,.15);border-color:#00D9C4}
    /* grid overlay */
    #pm-grid{position:absolute;inset:0;pointer-events:none;
      background-image:linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),
        linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px);
      background-size:40px 40px}
    @media(max-width:600px){.pm-head .pm-title{font-size:.8rem}#pm-hud-hint{display:none}}
  `;
  document.head.appendChild(style);

  // Modal HTML
  const div = document.createElement('div');
  div.id = 'pm-modal';
  div.innerHTML = `
    <div class="pm-head">
      <div class="pm-head-l">
        <div class="pm-poke-img"><img id="pm-hdr-img" src="" alt=""></div>
        <span id="pm-hdr-name" class="pm-title"></span>
      </div>
      <button class="pm-close" id="pm-close-btn" title="Fechar (Esc)">✕</button>
    </div>
    <div id="pm-body">
      <div id="pm-grid"></div>
      <div id="pm-canvas">
        <img id="pm-map-img" src="https://gigllyan.github.io/cv/projetos/pokedex/mapa.png
" alt="Mapa" draggable="false">
        <div id="pm-pins"></div>
      </div>
      <div class="pm-hud" id="pm-hud-coord">top: — · left: —</div>
      <div class="pm-hud" id="pm-hud-hint">Clique em um pin para ver o local</div>
      <div class="pm-hud" id="pm-hud-zoom">100%</div>
      <div class="pm-ctrl">
        <button class="pm-btn" id="pm-zi">＋</button>
        <button class="pm-btn" id="pm-zo">－</button>
        <button class="pm-btn" id="pm-zf">⊡</button>
      </div>
      <button id="pm-showall-all">🗺 Ver todos</button>
      <button id="pm-showsame" style="display:none">🔗 Mesma espécie</button>
      <div id="pm-info">
        <button class="pi-x" id="pm-info-close">✕</button>
        <div class="pi-loc" id="pm-info-loc"></div>
      </div>
    </div>`;
  document.body.appendChild(div);

  // ── State ──────────────────────────────────────────────────────────────────
  let zoom=1, panX=0, panY=0, dragging=false, lastM={x:0,y:0};
  let mapW=0, mapH=0, mapReady=false;
  let touches=[], activeIdx=null;
  let _currentPoke=null, _currentMapas=[];

  const body   = document.getElementById('pm-body');
  const canvas = document.getElementById('pm-canvas');
  const mapImg = document.getElementById('pm-map-img');
  const pins   = document.getElementById('pm-pins');

  mapImg.onload = () => {
    mapReady=true;
    mapW=mapImg.naturalWidth; mapH=mapImg.naturalHeight;
    mapImg.style.width=mapW+'px'; mapImg.style.height=mapH+'px';
    canvas.style.width=mapW+'px'; canvas.style.height=mapH+'px';
    pins.style.width=mapW+'px'; pins.style.height=mapH+'px';
  };

  // ── Transform ──────────────────────────────────────────────────────────────
  function applyT() {
    canvas.style.transform=`translate(${panX}px,${panY}px) scale(${zoom})`;
    document.getElementById('pm-hud-zoom').textContent=Math.round(zoom*100)+'%';
    scalePins();
  }

  // Escala os pins inversamente ao zoom via CSS var --s:
  // zoom baixo (longe) → pins maiores na tela; zoom alto (perto) → pins menores
  // Tamanho visual alvo = 46 / zoom, travado entre 22px e 72px.
  function scalePins() {
    const target = Math.max(22, Math.min(72, 46 / zoom));
    const s = (target / 46).toFixed(4);
    pins.querySelectorAll('.pm-pin').forEach(pin => {
      pin.style.setProperty('--s', s);
    });
  }
  function setZoom(nz,cx,cy) {
    const r=body.getBoundingClientRect();
    const ox=cx??r.width/2, oy=cy??r.height/2, ratio=nz/zoom;
    panX=ox-ratio*(ox-panX); panY=oy-ratio*(oy-panY);
    zoom=Math.max(0.05,Math.min(20,nz)); applyT();
  }
  function fitMap() {
    if(!mapReady)return;
    const r=body.getBoundingClientRect();
    zoom=Math.min(r.width/mapW,r.height/mapH);
    panX=(r.width-mapW*zoom)/2; panY=(r.height-mapH*zoom)/2; applyT();
  }
  function fitPins(mapas) {
    if(!mapReady||!mapas.length)return;
    const r=body.getBoundingClientRect();
    const tops=mapas.map(m=>m.top/100*mapH), lefts=mapas.map(m=>m.left/100*mapW);
    const minT=Math.min(...tops),maxT=Math.max(...tops);
    const minL=Math.min(...lefts),maxL=Math.max(...lefts);
    const pad=90,cW=maxL-minL+pad*2||120,cH=maxT-minT+pad*2||120;
    zoom=Math.min(r.width/cW,r.height/cH,5);
    panX=r.width/2-(minL+maxL)/2*zoom;
    panY=r.height/2-(minT+maxT)/2*zoom; applyT();
  }
  function goToPin(idx) {
    const m=_currentMapas[idx]; if(!m||!mapReady)return;
    const r=body.getBoundingClientRect();
    const tz=Math.max(zoom,2.5); zoom=tz;
    panX=r.width/2-(m.left/100*mapW)*tz;
    panY=r.height/2-(m.top/100*mapH)*tz; applyT();
  }

  // ── Controls ───────────────────────────────────────────────────────────────
  document.getElementById('pm-zi').onclick=()=>setZoom(zoom*1.3);
  document.getElementById('pm-zo').onclick=()=>setZoom(zoom/1.3);
  document.getElementById('pm-zf').onclick=fitMap;

  // "Ver todos" — show all pokemon that have mapas (from data.js + overrides)
  document.getElementById('pm-showall-all').onclick = async () => {
    const overrides = await getMapaOverrides();
    // gather all pokes with mapas from both arrays
    const allWithMapas = [];
    function collectArray(arr, arrKey) {
      if (!Array.isArray(arr)) return;
      arr.forEach(p => {
        const mapas = getEffectiveMapas(p, overrides, arrKey);
        if (mapas.length) allWithMapas.push({ poke:p, mapas });
      });
    }
    if (typeof ShinysMegasArray !== 'undefined') collectArray(ShinysMegasArray, 'shinys');
    if (typeof pokesarray       !== 'undefined') collectArray(pokesarray,       'pokes');
    // render all pins
    pins.innerHTML='';
    allWithMapas.forEach(({poke, mapas}) => mapas.forEach((m,i) => pins.appendChild(buildPin(m, i, poke))));
    scalePins();
    fitMap(); hideInfo(); activeIdx=null;
    document.getElementById('pm-hdr-name').textContent = 'Todos os pontos';
    document.getElementById('pm-hdr-img').src = '';
  };

  // "Mesma espécie" — show all variants with same base number
  document.getElementById('pm-showsame').onclick = async () => {
    if (!_currentPoke) return;
    const base = String(_currentPoke.numero).split('-')[0];
    const overrides = await getMapaOverrides();
    const same = [];
    function collectSame(arr, arrKey) {
      if (!Array.isArray(arr)) return;
      arr.forEach(p => {
        if (String(p.numero).split('-')[0] !== base) return;
        const mapas = getEffectiveMapas(p, overrides, arrKey);
        if (mapas.length) same.push({ poke:p, mapas });
      });
    }
    if (typeof ShinysMegasArray !== 'undefined') collectSame(ShinysMegasArray, 'shinys');
    if (typeof pokesarray       !== 'undefined') collectSame(pokesarray,       'pokes');
    pins.innerHTML='';
    same.forEach(({poke, mapas}) => mapas.forEach((m,i) => pins.appendChild(buildPin(m, i, poke))));
    scalePins();
    const allMapas = same.flatMap(s => s.mapas);
    fitMap(); if (allMapas.length) fitPins(allMapas);
    hideInfo(); activeIdx=null;
    const baseName = _currentPoke.nome.replace(/^(Shiny|Mega|Baby)\s+/i,'').trim();
    document.getElementById('pm-hdr-name').textContent = `${baseName} — todas variações (${same.length})`;
  };

  body.addEventListener('wheel',e=>{
    e.preventDefault();
    const r=body.getBoundingClientRect();
    setZoom(zoom*(e.deltaY>0?.85:1.18),e.clientX-r.left,e.clientY-r.top);
  },{passive:false});

  body.addEventListener('mousedown',e=>{ dragging=true; lastM={x:e.clientX,y:e.clientY}; body.style.cursor='grabbing'; });
  window.addEventListener('mousemove',e=>{
    if(!dragging)return;
    panX+=e.clientX-lastM.x; panY+=e.clientY-lastM.y; lastM={x:e.clientX,y:e.clientY}; applyT();
  });
  window.addEventListener('mouseup',()=>{ if(dragging){dragging=false;body.style.cursor='grab';} });

  body.addEventListener('touchstart',e=>{ touches=[...e.touches]; },{passive:true});
  body.addEventListener('touchmove',e=>{
    e.preventDefault();
    const r=body.getBoundingClientRect();
    if(e.touches.length===2){
      const[t0,t1]=e.touches,[p0,p1]=touches; if(!p0||!p1)return;
      const d=Math.hypot(t1.clientX-t0.clientX,t1.clientY-t0.clientY);
      const pd=Math.hypot(p1.clientX-p0.clientX,p1.clientY-p0.clientY); if(!pd)return;
      setZoom(zoom*(d/pd),((t0.clientX+t1.clientX)/2)-r.left,((t0.clientY+t1.clientY)/2)-r.top);
      panX+=((t0.clientX+t1.clientX)/2-(p0.clientX+p1.clientX)/2);
      panY+=((t0.clientY+t1.clientY)/2-(p0.clientY+p1.clientY)/2); applyT();
    } else if(e.touches.length===1&&touches.length===1){
      panX+=e.touches[0].clientX-touches[0].clientX;
      panY+=e.touches[0].clientY-touches[0].clientY; applyT();
    }
    touches=[...e.touches];
  },{passive:false});

  body.addEventListener('mousemove',e=>{
    if(!mapReady)return;
    const r=body.getBoundingClientRect();
    const lx=(e.clientX-r.left-panX)/zoom, ly=(e.clientY-r.top-panY)/zoom;
    document.getElementById('pm-hud-coord').textContent=
      `top: ${Math.max(0,Math.min(100,ly/mapH*100)).toFixed(1)}%  ·  left: ${Math.max(0,Math.min(100,lx/mapW*100)).toFixed(1)}%`;
  });

  // ── Info panel ─────────────────────────────────────────────────────────────
  function showInfo(loc) {
    document.getElementById('pm-info-loc').textContent = '📍 ' + (loc.text || '—');
    document.getElementById('pm-info').classList.add('show');
  }
  function hideInfo() { document.getElementById('pm-info').classList.remove('show'); }
  document.getElementById('pm-info-close').onclick = hideInfo;

  // ── Pins ───────────────────────────────────────────────────────────────────
  function updateActive() {
    pins.querySelectorAll('.pm-pin').forEach(p=>p.classList.toggle('active',+p.dataset.i===activeIdx));
  }
  function buildPin(m, i, poke) {
    const el=document.createElement('div');
    el.className='pm-pin'; el.dataset.i=i;
    el.style.top=m.top+'%'; el.style.left=m.left+'%';

    const pulse=document.createElement('div'); pulse.className='pm-pulse';
    const bubble=document.createElement('div'); bubble.className='pm-bubble';
    const img=document.createElement('img'); img.alt=poke.nome; img.loading='lazy';
    pmSetImg(img, poke.numero);
    bubble.appendChild(img);

    const tt=document.createElement('div'); tt.className='pm-tt';
    tt.innerHTML=`<div class="pm-tt-name">${poke.nome}</div><div class="pm-tt-loc">${m.text||'—'}</div><div class="pm-tt-arr"></div>`;

    el.appendChild(pulse); el.appendChild(bubble); el.appendChild(tt);
    el.addEventListener('click',ev=>{
      ev.stopPropagation();
      activeIdx=i; updateActive(); goToPin(i); showInfo(m);
    });
    return el;
  }
  function renderPins(poke, mapas) {
    pins.innerHTML='';
    mapas.forEach((m,i)=>pins.appendChild(buildPin(m,i,poke)));
    scalePins(); // aplica escala inicial baseada no zoom atual
  }

  // ── Open / Close ───────────────────────────────────────────────────────────
  document.getElementById('pm-close-btn').onclick = closeModal;
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&div.classList.contains('open')) closeModal(); });

  function closeModal() {
    div.classList.remove('open');
    document.body.style.overflow='';
    hideInfo(); activeIdx=null;
  }

  // ── PUBLIC API (attached to window) ───────────────────────────────────────
  window._pmOpen = async function(poke) {
    _currentPoke = poke;
    const overrides = await getMapaOverrides();
    _currentMapas = getEffectiveMapas(poke, overrides, getArrayKey(poke));

    // Header
    const hdrImg = document.getElementById('pm-hdr-img');
    pmSetImg(hdrImg, poke.numero);
    document.getElementById('pm-hdr-name').textContent = `#${poke.numero} ${poke.nome}`;

    // Show "Mesma espécie" only if other variants of this base number exist with mapas
    const base = String(poke.numero).split('-')[0];
    let sameCount = 0;
    function countSame(arr, arrKey) {
      if (!Array.isArray(arr)) return;
      arr.forEach(p => {
        if (String(p.numero).split('-')[0] !== base) return;
        if (getEffectiveMapas(p, overrides, arrKey).length) sameCount++;
      });
    }
    if (typeof ShinysMegasArray !== 'undefined') countSame(ShinysMegasArray, 'shinys');
    if (typeof pokesarray       !== 'undefined') countSame(pokesarray,       'pokes');
    document.getElementById('pm-showsame').style.display = sameCount > 1 ? '' : 'none';

    renderPins(poke, _currentMapas);
    div.classList.add('open');
    document.body.style.overflow='hidden';
    hideInfo(); activeIdx=null;

    if(mapReady){
      setTimeout(()=>{ fitMap(); if(_currentMapas.length) fitPins(_currentMapas); },55);
    } else {
      mapImg.addEventListener('load',()=>{
        setTimeout(()=>{ fitMap(); if(_currentMapas.length) fitPins(_currentMapas); },55);
      },{once:true});
    }
  };

  window._pmGoTo = function(idx) {
    if(!div.classList.contains('open')) return;
    activeIdx=idx; updateActive();
    goToPin(idx);
    if(_currentMapas[idx]) showInfo(_currentMapas[idx]);
  };
}

// ─── Thumbnail helpers (called from inline onclick in the tab HTML) ────────────
window.pmOpenModal = function() {
  const poke = window._pmCurrentPoke;
  if (poke) window._pmOpen(poke);
};
window.pmGoToPin = function(idx) {
  const poke = window._pmCurrentPoke;
  if (!poke) return;
  window._pmOpen(poke).then ? window._pmOpen(poke).then(()=>window._pmGoTo(idx)) : window._pmGoTo(idx);
};

// Cycles through all pins of a group each time the same button is clicked.
// _pmGroupCycles maps groupKey -> current position in that group's indices array.
window._pmGroupCycles = {};
window.pmGoToPinGroup = function(indices, groupKey) {
  const poke = window._pmCurrentPoke;
  if (!poke) return;
  // Advance cycle for this group
  const pos = (window._pmGroupCycles[groupKey] || 0) % indices.length;
  window._pmGroupCycles[groupKey] = pos + 1;
  const idx = indices[pos];
  window._pmOpen(poke).then
    ? window._pmOpen(poke).then(() => window._pmGoTo(idx))
    : window._pmGoTo(idx);
};

// ─── Thumbnail pin rendering ──────────────────────────────────────────────────
async function renderThumbPins(poke) {
  const container = document.getElementById('pm-thumb-pins');
  const thumbImg  = document.getElementById('pm-thumb-img');
  if (!container || !thumbImg) return;

  const overrides = await getMapaOverrides();
  const mapas = getEffectiveMapas(poke, overrides, getArrayKey(poke));
  container.innerHTML = '';

  // Wait for thumb image dimensions
  const getSize = () => new Promise(res => {
    if (thumbImg.naturalWidth) { res(); return; }
    thumbImg.addEventListener('load', res, {once:true});
  });
  await getSize();

  const w = thumbImg.offsetWidth || thumbImg.naturalWidth || 1;
  const h = thumbImg.offsetHeight || thumbImg.naturalHeight || 1;
  const sz = Math.max(18, Math.round(Math.min(w,h)*0.045));

  mapas.forEach(m => {
    const wrap = document.createElement('div');
    wrap.style.cssText=`position:absolute;top:${m.top}%;left:${m.left}%;
      transform:translate(-50%,-50%);width:${sz}px;height:${sz}px;border-radius:50%;
      overflow:hidden;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.7);pointer-events:none`;
    const img = document.createElement('img');
    img.style.cssText='width:100%;height:100%;object-fit:contain;image-rendering:pixelated;display:block';
    pmSetImg(img, poke.numero);
    wrap.appendChild(img);
    container.appendChild(wrap);
  });

  // Show hover overlay handler
  const tw = document.getElementById('pm-thumb-wrap');
  const ov = document.getElementById('pm-thumb-overlay');
  if (tw && ov) {
    tw.onmouseenter = () => ov.style.opacity='1';
    tw.onmouseleave = () => ov.style.opacity='0';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  HOOK INTO renderSinglePage — patches mapsContent variable after it renders
//  We override the global buildMapsContent so renderSinglePage can call it.
// ─────────────────────────────────────────────────────────────────────────────
// Store pokemon reference and render thumb pins when the tab becomes active
let _origSwitchModalTab = null;
function pmHookIntoPage() {
  pmInjectModal();

  // Patch switchModalTab to trigger thumb pin rendering on maps tab activation
  if (typeof switchModalTab === 'function' && !_origSwitchModalTab) {
    _origSwitchModalTab = switchModalTab;
    window.switchModalTab = function(tabId) {
      _origSwitchModalTab(tabId);
      if (tabId === 'maps' && window._pmCurrentPoke) {
        // slight delay to let the tab become visible first
        setTimeout(()=>renderThumbPins(window._pmCurrentPoke), 60);
      }
    };
  }
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', pmHookIntoPage);
} else {
  pmHookIntoPage();
}
