import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getDatabase,ref,onValue,query,limitToLast} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {firebaseConfig,SETTINGS as S} from "./config.js";
const $=id=>document.getElementById(id);
const cells=[...document.querySelectorAll('#intro .cell')];const t0=performance.now();
(function run(n){const p=Math.min(1,(n-t0)/2400);$('pct').textContent=Math.round(p*100);
cells.forEach((c,i)=>c.classList.toggle('on',p>(i+1)/7));
if(p<1)requestAnimationFrame(run);else setTimeout(()=>{$('intro').classList.add('gone');document.body.classList.remove('loading')},350)})(t0);
const G=[{k:'voltage',l:'Pack voltage',u:'V',min:S.vMin,max:S.vMax,d:2},{k:'current',l:'Current',u:'A',min:0,max:S.iMax,d:2},{k:'temp',l:'Temperature',u:'°C',min:0,max:80,d:1}];
$('gauges').innerHTML=G.map(g=>`<div class="g"><svg viewBox="0 0 140 140"><circle class="tr" cx="70" cy="70" r="52"/><circle class="vl" id="a-${g.k}" cx="70" cy="70" r="52"/></svg><div class="num"><span id="${g.k}">--</span><small>${g.u}</small></div><div class="lb">${g.l}</div></div>`).join('');
const col={ok:'var(--ok)',warn:'var(--wa)',bad:'var(--bd)'};
function tween(el,to,d){const from=+el.dataset.v||0;el.dataset.v=to;const s=performance.now();el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash');
(function f(n){const p=Math.min(1,(n-s)/500);el.textContent=(from+(to-from)*p).toFixed(d);if(p<1)requestAnimationFrame(f)})(s)}
const fmtT=h=>!isFinite(h)?'--':h<1?Math.round(h*60)+' min':Math.floor(h)+' h '+Math.round((h%1)*60)+' min';
let cur=null,offset=0,hist=[],n=100;
const db=getDatabase(initializeApp(firebaseConfig));
onValue(ref(db,'.info/serverTimeOffset'),s=>offset=s.val()||0);
onValue(ref(db,S.liveKey),s=>{if(s.val()){cur=s.val();render(cur)}});
onValue(query(ref(db,S.historyKey),limitToLast(400)),s=>{hist=Object.values(s.val()||{}).sort((a,b)=>a.ts-b.ts);drawCharts()});
function level(g,v){if(g==='voltage')return v<S.vLow||v>S.vHigh?'bad':'ok';if(g==='temp')return v>=S.tHot?'bad':v>=S.tWarn?'warn':'ok';return Math.abs(v)>S.iWarn?'warn':'ok'}
function render(d){
const I=S.dischargeIsNegative?-d.current:+d.current; // discharge = positive amps
G.forEach(g=>{const v=g.k==='current'?Math.abs(I):+d[g.k],f=Math.max(0,Math.min(1,(v-g.min)/(g.max-g.min)));tween($(g.k),v,g.d);
const a=$('a-'+g.k);a.style.strokeDasharray=`${245*f} 327`;a.style.stroke=col[level(g.k,v)]});
const soc=+d.soc;tween($('soc'),soc,0);$('fill').style.transform=`scaleY(${soc/100})`;$('fill').style.fill=soc<=S.socCrit?col.bad:soc<=S.socLow?col.warn:col.ok;
const V=+d.voltage,chg=I<-.2,dis=I>.2;
$('mode').textContent=chg?'Charging':dis?'Discharging':'Idle';document.body.classList.toggle('charging',chg);
const P=V*Math.abs(I);$('pw').textContent=P>=1000?(P/1000).toFixed(2)+' kW':P.toFixed(0)+' W';
const kwh=S.packAh*S.nominalV/1000*soc/100;$('en').textContent=kwh.toFixed(2)+' kWh';$('rg').textContent=(kwh/S.kWhPerKm).toFixed(0)+' km';
$('etl').textContent=chg?'Time to full':'Time left';
$('et').textContent=chg?fmtT(S.packAh*(100-soc)/100/Math.abs(I)):dis?fmtT(S.packAh*soc/100/Math.abs(I)):'--';
const al=[];const add=(l,t)=>al.push(`<li class="${l}">${t}</li>`);
if(soc<=S.socCrit)add('bad','Charge is critically low');else if(soc<=S.socLow)add('warn','Charge is low, plan to recharge');
if(V<S.vLow)add('bad','Pack voltage is under the safe limit');if(V>S.vHigh)add('bad','Pack voltage is over the safe limit');
if(d.temp>=S.tHot)add('bad','Pack is overheating');else if(d.temp>=S.tWarn)add('warn','Pack temperature is rising');
if(Math.abs(I)>S.iWarn)add('warn','Heavy current draw');
$('alerts').innerHTML=al.length?al.join(''):'<li>All readings are within safe limits</li>';
}
setInterval(()=>{const p=$('pill'),b=$('banner');if(!cur){p.textContent='Waiting for device';return}
const age=Date.now()+offset-cur.ts,off=age>S.offlineAfterMs,t=new Date(cur.ts).toLocaleString([], {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',second:'2-digit'});
document.body.classList.toggle('offline',off);p.className='pill '+(off?'off':'live');p.textContent=off?'Device offline':'Live';
b.hidden=!off;if(off){const m=Math.floor(age/60000);b.innerHTML=`<b>Device is offline.</b> These are old readings from ${t} (${m<1?Math.round(age/1000)+' s':m<60?m+' min':Math.floor(m/60)+' h'} ago). Check power and Wi-Fi on the monitor unit.`}
$('sync').textContent='Last reading '+t},1000);
const CH=[{k:'voltage',t:'Voltage',u:'V',c:'#f0b24a'},{k:'current',t:'Current',u:'A',c:'#6cc3d5'},{k:'soc',t:'State of charge',u:'%',c:'#8fcf8f'},{k:'temp',t:'Temperature',u:'°C',c:'#e5604d'}];
$('charts').innerHTML=`<div class="rng" style="grid-column:1/-1">${[50,100,400].map(x=>`<button data-n="${x}" class="${x==n?'on':''}">Last ${x} records</button>`).join('')}</div>`+
CH.map(c=>`<div class="ch"><div class="hd"><h2>${c.t}</h2><span class="st" id="s-${c.k}"></span></div><canvas id="c-${c.k}"></canvas></div>`).join('');
document.querySelectorAll('.rng button').forEach(b=>b.onclick=()=>{n=+b.dataset.n;document.querySelectorAll('.rng button').forEach(x=>x.classList.toggle('on',x==b));drawCharts()});
Chart.defaults.color='#86a09a';Chart.defaults.font.family="'Barlow Condensed',sans-serif";Chart.defaults.font.size=13;
const charts=CH.map(c=>new Chart($('c-'+c.k),{type:'line',data:{labels:[],datasets:[{data:[],borderColor:c.c,backgroundColor:c.c+'22',fill:true,tension:.35,pointRadius:0,borderWidth:2}]},
options:{maintainAspectRatio:false,animation:{duration:700},plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{maxTicksLimit:6}},y:{grid:{color:'#274542'}}}}}));
function drawCharts(){const h=hist.slice(-n);CH.forEach((c,i)=>{const v=h.map(r=>c.k==='current'&&S.dischargeIsNegative?-r.current:+r[c.k]);charts[i].data.labels=h.map(r=>new Date(r.ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}));charts[i].data.datasets[0].data=v;charts[i].update();
$('s-'+c.k).textContent=v.length?`low ${Math.min(...v).toFixed(1)} · average ${(v.reduce((a,b)=>a+b,0)/v.length).toFixed(1)} · high ${Math.max(...v).toFixed(1)} ${c.u}`:'No records yet'})}
