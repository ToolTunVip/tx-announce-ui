// txCustomAnnounce v9 — logo split animation

// ── DOM ───────────────────────────────────────────────────────
var logoContainer = document.getElementById('logoContainer');
var logoLeft      = document.getElementById('logoLeft');
var logoRight     = document.getElementById('logoRight');
var notify        = document.getElementById('notify');
var tickerContent = document.getElementById('tickerContent');
var adminPanel    = document.getElementById('adminPanel');
var msgInput      = document.getElementById('msgInput');
var charCountEl   = document.getElementById('charCount');
var statusMsgEl   = document.getElementById('statusMsg');

// ── Timers ────────────────────────────────────────────────────
var timers = [];
function wait(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); }
function clearAllTimers() { timers.forEach(clearTimeout); timers = []; }

// ── Helpers ───────────────────────────────────────────────────
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function getResourceName() {
    try { if (typeof window.GetParentResourceName === 'function') return window.GetParentResourceName(); } catch(e) {}
    return 'tx-announce-ui';
}
function nuiCallback(ep, data) {
    return fetch('https://' + getResourceName() + '/' + ep, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data || {})
    });
}

// ══════════════════════════════════════════════════════════════
//  CONFIG & SETTINGS
// ══════════════════════════════════════════════════════════════
var DEFAULT_CFG = {
    accent:'#cc2020', bar:'#0a0000', txt:'#ffffff',
    vol:55, speed:180, top:20, logoB64:''
};
var CFG = Object.assign({}, DEFAULT_CFG);

try {
    var saved = localStorage.getItem('txAnn_cfg');
    if (saved) Object.assign(CFG, JSON.parse(saved));
} catch(e) {}

var PRESETS = {
    crimson:{ accent:'#c0392b', bar:'#0d0200' },
    neon:   { accent:'#00d2ff', bar:'#00060d' },
    gold:   { accent:'#e6a817', bar:'#080600' },
    emerald:{ accent:'#00c48a', bar:'#000d07' },
    violet: { accent:'#9b59b6', bar:'#07000d' },
    sunset: { accent:'#e67e22', bar:'#0a0400' },
    ice:    { accent:'#74b9ff', bar:'#030810' },
    matrix: { accent:'#00e040', bar:'#000d03' }
};

function hexRgba(hex, a) {
    var r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    return 'rgba('+r+','+g+','+b+','+a+')';
}

function applyTheme() {
    var r = document.documentElement.style;
    r.setProperty('--a',      CFG.accent);
    r.setProperty('--a-dim',  hexRgba(CFG.accent, 0.16));
    r.setProperty('--a-glow', hexRgba(CFG.accent, 0.45));
    r.setProperty('--bar',    CFG.bar);
    r.setProperty('--txt',    CFG.txt);
    document.getElementById('announceWrap').style.top = CFG.top + 'px';
    if (snd) snd.volume = CFG.vol / 100;
    renderLogos();
}

// ── Logo render ───────────────────────────────────────────────
function renderLogos() {
    var src = CFG.logoB64;
    if (src && src.length > 50) {
        logoLeft.style.backgroundImage  = 'url("' + src + '")';
        logoRight.style.backgroundImage = 'url("' + src + '")';
    } else {
        // fallback: dùng file logo mặc định
        logoLeft.style.backgroundImage  = 'url("img/logo.png")';
        logoRight.style.backgroundImage = 'url("img/logo.png")';
    }
}

applyTheme();

// ── Sound ─────────────────────────────────────────────────────
var snd = null;
try { snd = new Audio('sounds/announce.mp3'); snd.volume = CFG.vol/100; } catch(e){}
function playSound() { try { if(snd){snd.currentTime=0;snd.play().catch(function(){});}}catch(e){}}
function stopSound()  { try { if(snd){snd.pause();snd.currentTime=0;}}catch(e){}}

// ══════════════════════════════════════════════════════════════
//  ANIMATION
// ══════════════════════════════════════════════════════════════

function hardReset() {
    // Xóa hết class animation
    logoContainer.classList.remove('logoShow', 'logoHide');
    // Reset logo halves
    logoLeft.style.transform  = 'translateX(0)';
    logoRight.style.transform = 'translateX(0)';
    // Reset notify bar
    notify.style.width = '0';
    // Reset ticker
    tickerContent.style.transition = 'none';
    tickerContent.style.transform  = 'translateX(200%)';
    tickerContent.style.opacity    = '1';
}

hardReset();

var isShowing = false;

function showAnnouncement(msg) {
    msg = (msg||'').trim() || 'Thông báo từ server';
    clearAllTimers();
    stopSound();
    hardReset();
    isShowing = true;

    // Chuẩn bị nội dung ticker
    tickerContent.innerHTML =
        '<span class="ticker-text">'+esc(msg)+'</span>'+
        '<span class="sep">◆</span>'+
        '<span class="ticker-text">'+esc(msg)+'</span>';

    playSound();

    // Phase 1: Logo xuất hiện (scale pop)
    void logoContainer.offsetWidth;
    logoContainer.classList.add('logoShow');

    // Phase 2: Logo tách + notify mở
    wait(function() {
        logoLeft.style.transform  = 'translateX(-30vh)';
        logoRight.style.transform = 'translateX(30vh)';
        notify.style.width        = '60vh';
    }, 600);

    // Phase 3: Ticker chạy
    wait(function() { runTicker(msg); }, 1300);

    // Tính thời gian ticker
    var notifyPx = window.innerHeight * 0.6 * 0.6; // ~60vh in px
    var contW    = tickerContent.scrollWidth || (msg.length * 13 + 200);
    var durMs    = Math.round((notifyPx + contW) / CFG.speed * 1000);
    durMs = Math.max(durMs, 6000);
    durMs = Math.min(durMs, 25000);

    // Phase 4: Logo ghép + notify đóng
    var closeAt = 600 + durMs + 800;
    wait(function() {
        logoLeft.style.transform  = 'translateX(0)';
        logoRight.style.transform = 'translateX(0)';
        notify.style.width        = '0';
    }, closeAt);

    // Phase 5: Logo biến mất
    wait(function() {
        logoContainer.classList.remove('logoShow');
        logoContainer.classList.add('logoHide');
        isShowing = false;
    }, closeAt + 650);
}

function runTicker(msg) {
    var bW = notify.offsetWidth  || 400;
    var cW = tickerContent.scrollWidth || 600;
    tickerContent.style.transition = 'none';
    tickerContent.style.opacity    = '1';
    tickerContent.style.transform  = 'translateX('+bW+'px)';
    wait(function() {
        var d = Math.round((bW + cW) / CFG.speed * 1000);
        tickerContent.style.transition = 'transform '+d+'ms linear';
        tickerContent.style.transform  = 'translateX(-'+cW+'px)';
    }, 30);
}

function hideAnnounce() { clearAllTimers(); stopSound(); hardReset(); isShowing = false; }

// ══════════════════════════════════════════════════════════════
//  SETTINGS LOGIC
// ══════════════════════════════════════════════════════════════
function switchTab(tab) {
    document.getElementById('contentAnnounce').classList.toggle('hidden', tab!=='announce');
    document.getElementById('contentSettings').classList.toggle('hidden', tab!=='settings');
    document.getElementById('tabAnnounce').classList.toggle('active', tab==='announce');
    document.getElementById('tabSettings').classList.toggle('active', tab==='settings');
    if (tab==='settings') syncUI();
}

function syncUI() {
    setColorField('clrAccent','hexAccent','prevAccent', CFG.accent);
    setColorField('clrBar',   'hexBar',   'prevBar',    CFG.bar);
    setColorField('clrTxt',   'hexTxt',   'prevTxt',    CFG.txt);
    setSlider('sldVol',  'valVol',   CFG.vol,   '%');
    setSlider('sldSpeed','valSpeed', CFG.speed, '');
    setSlider('sldTop',  'valTop',   CFG.top,   'px');
    document.querySelectorAll('.preset-swatch').forEach(function(b){ b.classList.remove('active'); });
    if (CFG.logoB64 && CFG.logoB64.length > 50) {
        var prev = document.getElementById('uploadPreview');
        prev.innerHTML = '<img src="'+CFG.logoB64+'" style="max-height:56px;max-width:180px;object-fit:contain;border-radius:4px;"><span>Click để đổi logo</span>';
    }
}

function setColorField(pickId, hexId, prevId, val) {
    var p=document.getElementById(pickId), h=document.getElementById(hexId), v=document.getElementById(prevId);
    if(p) p.value=val; if(h) h.textContent=val; if(v) v.style.background=val;
}
function setSlider(slId, valId, val, suffix) {
    var s=document.getElementById(slId), v=document.getElementById(valId);
    if(s) s.value=val; if(v) v.textContent=val+suffix;
}

function onColorChange() {
    CFG.accent = document.getElementById('clrAccent').value;
    CFG.bar    = document.getElementById('clrBar').value;
    CFG.txt    = document.getElementById('clrTxt').value;
    ['Accent','Bar','Txt'].forEach(function(k){
        var map={Accent:'accent',Bar:'bar',Txt:'txt'};
        var el=document.getElementById('clr'+k);
        if(!el) return;
        document.getElementById('hex'+k).textContent=el.value;
        document.getElementById('prev'+k).style.background=el.value;
    });
    applyTheme();
}

function onSliderChange() {
    CFG.vol   = parseInt(document.getElementById('sldVol').value);
    CFG.speed = parseInt(document.getElementById('sldSpeed').value);
    CFG.top   = parseInt(document.getElementById('sldTop').value);
    document.getElementById('valVol').textContent   = CFG.vol+'%';
    document.getElementById('valSpeed').textContent = CFG.speed;
    document.getElementById('valTop').textContent   = CFG.top+'px';
    applyTheme();
}

function applyPreset(name) {
    var p = PRESETS[name]; if(!p) return;
    Object.assign(CFG, p);
    applyTheme(); syncUI();
    document.querySelectorAll('.preset-swatch').forEach(function(b){
        b.classList.toggle('active', b.getAttribute('data-preset')===name);
    });
}

function handleLogoUpload(input) {
    if (!input.files || !input.files[0]) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        CFG.logoB64 = e.target.result;
        renderLogos();
        var prev = document.getElementById('uploadPreview');
        prev.innerHTML = '<img src="'+CFG.logoB64+'" style="max-height:56px;max-width:180px;object-fit:contain;border-radius:4px;"><span style="font-size:.72rem;color:rgba(180,180,220,.55)">Click để đổi logo</span>';
    };
    reader.readAsDataURL(input.files[0]);
}

function clearLogo() {
    CFG.logoB64 = '';
    renderLogos();
    var prev = document.getElementById('uploadPreview');
    prev.innerHTML = '<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="1.5" opacity="0.3"/><path d="M24 16v8m0 0v8m0-8h8m-8 0h-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/></svg><span>Chọn ảnh logo</span><span class="upload-hint">PNG, JPG — hiển thị tốt nhất 13vh × 13vh</span>';
}

function saveSettings() {
    try { localStorage.setItem('txAnn_cfg', JSON.stringify(CFG)); } catch(e){}
    showSettingsStatus('✓ Đã lưu cài đặt!', 'success');
}
function resetSettings() {
    Object.assign(CFG, DEFAULT_CFG);
    try { localStorage.removeItem('txAnn_cfg'); } catch(e){}
    applyTheme(); syncUI();
    showSettingsStatus('↺ Đã khôi phục mặc định', 'success');
}
function showSettingsStatus(t, type) {
    var el=document.getElementById('settingsStatus');
    el.textContent=t; el.className='status-msg visible '+type;
    setTimeout(function(){ el.className='status-msg'; }, 2500);
}

// ══════════════════════════════════════════════════════════════
//  PANEL
// ══════════════════════════════════════════════════════════════
msgInput.addEventListener('input', function(){ charCountEl.textContent=msgInput.value.length; });

function openAdminPanel()  { adminPanel.classList.add('open'); wait(function(){ msgInput.focus(); }, 50); }

var isPanelClosing = false;
function closeAdminPanel() {
    if(isPanelClosing) return;
    isPanelClosing = true;
    adminPanel.classList.remove('open');
    nuiCallback('closePanel',{}).catch(function(){}).finally(function(){
        setTimeout(function(){ isPanelClosing=false; }, 300);
    });
}
function useTemplate(t){ msgInput.value=t; charCountEl.textContent=t.length; msgInput.focus(); }
function previewMessage(){
    var m=msgInput.value.trim();
    if(!m){ showStatus('Vui lòng nhập nội dung!','error'); return; }
    showAnnouncement(m);
}
function sendMessage(){
    var m=msgInput.value.trim();
    if(!m){ showStatus('Vui lòng nhập nội dung!','error'); return; }
    var btn=document.getElementById('btnSend'); btn.disabled=true;
    nuiCallback('sendAnnouncement',{message:m})
        .then(function(r){ return r.json(); })
        .then(function(d){
            btn.disabled=false;
            if(d.success){ showStatus('✓ Đã gửi thông báo!','success'); msgInput.value=''; charCountEl.textContent='0'; setTimeout(closeAdminPanel,1200); }
            else showStatus(d.error||'Lỗi không xác định','error');
        })
        .catch(function(){ btn.disabled=false; showStatus('Lỗi kết nối server!','error'); });
}
function showStatus(t, type){
    statusMsgEl.textContent=t; statusMsgEl.className='status-msg visible '+type;
    setTimeout(function(){ statusMsgEl.className='status-msg'; }, 3000);
}

window.addEventListener('message', function(e){
    var d=e.data||{};
    if(d.type==='announce')         showAnnouncement(d.message);
    else if(d.type==='openPanel')   openAdminPanel();
    else if(d.type==='closePanel')  { adminPanel.classList.remove('open'); isPanelClosing=false; }
});
document.addEventListener('keydown', function(e){
    if(!adminPanel.classList.contains('open')) return;
    if(e.key==='Escape')            { e.preventDefault(); closeAdminPanel(); }
    if(e.key==='Enter'&&e.ctrlKey)  { e.preventDefault(); sendMessage(); }
});