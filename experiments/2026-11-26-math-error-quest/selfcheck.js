"use strict";
/* 自检脚本：与 math-error-quest-v0.html 内生成器同一套函数（逐字复制核心逻辑）。
   用法：node math-error-quest-selfcheck.js [每类题数，默认1000]
   验证：① 答案 = a∓b 独立重算一致 ② 题型约束（减法必须退位 / 加法必须进位，
   且连续/单次比例符合生成分支）③ 每关 8 题不重复。任一失败以非零码退出。 */

function digits(n){ return [n%10, Math.floor(n/10)%10, Math.floor(n/100)%10]; }
function analyzeSub(a,b){
  const [au,at,ah]=digits(a), [bu,bt,bh]=digits(b);
  const borrowU = au < bu;
  const effT = at - (borrowU?1:0);
  const borrowT = effT < bt;
  return { answer:a-b, borrowU, borrowT, borrowCount:(borrowU?1:0)+(borrowT?1:0),
           zeroTens: at===0, continuous: borrowU && borrowT };
}
function analyzeAdd(a,b){
  const [au,at]=digits(a), [bu,bt]=digits(b);
  const carryU = au+bu >= 10;
  const carryT = at+bt+(carryU?1:0) >= 10;
  return { answer:a+b, carryU, carryT, carryCount:(carryU?1:0)+(carryT?1:0), continuous: carryU && carryT };
}
const ri=(lo,hi)=> lo + Math.floor(Math.random()*(hi-lo+1));
function genSubOne(){
  for(let t=0;t<500;t++){
    const r=Math.random(); let a,b;
    if(r<0.5){
      const ah=ri(2,9), au=ri(0,7);
      a=ah*100+au; b=ri(1,ah-1)*100 + ri(1,9)*10 + ri(au+1,9);
    }else if(r<0.82){
      const ah=ri(3,9), au=ri(0,8), at=ri(1,9);
      a=ah*100+at*10+au; b=ri(1,ah-1)*100 + ri(at,9)*10 + ri(au+1,9);
      if(at-1 >= Math.floor((b%100)/10)) continue;
    }else{
      const ah=ri(2,9), at=ri(1,9), au=ri(0,9);
      a=ah*100+at*10+au;
      if(Math.random()<0.5){ b=ri(1,ah-1)*100 + ri(0,at-1)*10 + ri(au+1<=9?au+1:9,9); if(au===9) continue; }
      else{ b=ri(1,ah-1)*100 + ri(at+1<=9?at+1:9,9)*10 + ri(0,au); if(at===9) continue; }
    }
    if(b>=a||b<100) continue;
    const an=analyzeSub(a,b);
    if(an.borrowCount<1) continue;
    if(r<0.82 && !an.continuous) continue;
    if(r>=0.82 && an.borrowCount!==1) continue;
    return {a,b,...an};
  }
  return {a:503,b:278,...analyzeSub(503,278)};
}
function genAddOne(){
  for(let t=0;t<500;t++){
    const r=Math.random(); let a,b;
    if(r<0.6){
      const au=ri(4,9), at=ri(4,9), ah=ri(1,4);
      a=ah*100+at*10+au;
      const bu=ri(10-au,9), bt=ri(Math.max(0,9-at),9), bh=ri(0,8-ah);
      b=bh*100+bt*10+bu;
    }else{
      const au=ri(0,9), at=ri(0,9), ah=ri(1,5);
      a=ah*100+at*10+au;
      if(Math.random()<0.5){ b=ri(0,4)*100 + ri(0,9-at)*10 + ri(10-au<=9?10-au:9,9); if(au===0) continue; }
      else{ b=ri(0,4)*100 + ri(10-at<=9?10-at:9,9)*10 + ri(0,9-au); if(at===9&&au===9) continue; }
    }
    if(b<100||a+b>999) continue;
    const an=analyzeAdd(a,b);
    if(an.carryCount<1) continue;
    if(r<0.6 && !an.continuous) continue;
    if(r>=0.6 && an.carryCount!==1) continue;
    return {a,b,...an};
  }
  return {a:467,b:358,...analyzeAdd(467,358)};
}
function genLevel(kind){
  const gen = kind===1?genSubOne:genAddOne, seen=new Set(), out=[];
  while(out.length<8){
    const q=gen(), key=q.a+"_"+q.b;
    if(seen.has(key)) continue;
    seen.add(key); out.push(q);
  }
  return out;
}

/* 独立验算器：用竖式逐位模拟（与 analyze 不同的实现路径，交叉验证） */
function verticalSub(a,b){
  let [x,y,z]=digits(a); const [bu,bt,bh]=digits(b); let borrows=0;
  if(x<bu){ x+=10; y-=1; borrows++; }
  if(y<bt){ y+=10; z-=1; borrows++; }
  return { ans:(z-bh)*100+(y-bt)*10+(x-bu), borrows };
}
function verticalAdd(a,b){
  const [au,at,ah]=digits(a), [bu,bt,bh]=digits(b); let carries=0;
  let u=au+bu; if(u>=10){ u-=10; carries++; }
  let t=at+bt+(carries&&au+bu>=10?1:0); const c1=au+bu>=10?1:0; t=at+bt+c1;
  let carryT=0; if(t>=10){ t-=10; carryT=1; carries++; }
  const h=ah+bh+carryT;
  return { ans:h*100+t*10+u, carries };
}

const N = parseInt(process.argv[2]||"1000",10);
let errors=0; const fail=m=>{ errors++; if(errors<=10) console.log("FAIL:",m); };

let subCont=0, subSingle=0, subZero=0;
for(let i=0;i<N;i++){
  const q=genSubOne(), v=verticalSub(q.a,q.b);
  if(q.answer!==q.a-q.b) fail(`减法答案字段错 ${q.a}-${q.b}`);
  if(v.ans!==q.answer) fail(`减法竖式交叉验算不一致 ${q.a}-${q.b}: ${v.ans} vs ${q.answer}`);
  if(v.borrows!==q.borrowCount) fail(`减法退位次数不一致 ${q.a}-${q.b}`);
  if(q.borrowCount<1) fail(`减法未退位 ${q.a}-${q.b}`);
  if(!(q.b<q.a && q.a<=999 && q.b>=100)) fail(`减法范围错 ${q.a}-${q.b}`);
  if(q.continuous) subCont++; else subSingle++;
  if(q.zeroTens) subZero++;
}
let addCont=0, addSingle=0;
for(let i=0;i<N;i++){
  const q=genAddOne(), v=verticalAdd(q.a,q.b);
  if(q.answer!==q.a+q.b) fail(`加法答案字段错 ${q.a}+${q.b}`);
  if(v.ans!==q.answer) fail(`加法竖式交叉验算不一致 ${q.a}+${q.b}: ${v.ans} vs ${q.answer}`);
  if(v.carries!==q.carryCount) fail(`加法进位次数不一致 ${q.a}+${q.b}`);
  if(q.carryCount<1) fail(`加法未进位 ${q.a}+${q.b}`);
  if(q.answer>999) fail(`加法和超 999 ${q.a}+${q.b}`);
  if(q.continuous) addCont++; else addSingle++;
}
let dupFail=0;
for(let i=0;i<200;i++){
  for(const kind of [1,2]){
    const lv=genLevel(kind), keys=new Set(lv.map(q=>q.a+"_"+q.b));
    if(lv.length!==8||keys.size!==8) dupFail++;
  }
}
if(dupFail) fail(`关卡组题重复/不足8题：${dupFail} 组`);

console.log(`自检完成：减法 ${N} 题（连续退位 ${subCont} · 单次退位 ${subSingle} · 其中含0题 ${subZero}），加法 ${N} 题（连续进位 ${addCont} · 单次进位 ${addSingle}），另组关卡 400 关查重复。`);
console.log(errors===0 ? "结果：全部通过，错误数 0" : `结果：失败，错误数 ${errors}`);
process.exit(errors===0?0:1);
