/*
    Author: @ZerQAQ
*/

var canvas = document.createElement("canvas");

var CW = 90
var W = window.innerWidth - CW;
var H = window.innerHeight;
var bgc = "#000707";
var stop = 0;
var mouseX = 0, mouseY = 0;
var fontsize = 12
canvas.width = W;
canvas.height = H;
var ctx = canvas.getContext("2d");
var mouseClick = 0;
var mouseDown = 0;
var mouseUp = 0;
var trackMaxLen = 300;
var trackMaxTime = 100;
var mode = 0;
var parentStar = -1;
var addStarsSize = 10;
var addStarsDir = 1;
var frameNum = 0;
var newStar = 0;
var mergeMode = 1;
var showAllInf = 0;
var timeScale = 1;
const showInfModeValue = 0;
const clearStarModeValue = 1;
const addMoonModeValue = 2;
const addSunModeValue = 3;
const addStarModeValue = 4;
const modeStr = ["Show inf", "Clear star", "Add moon", "Add sun", "Add star"];
//document.body.appendChild(canvas);

var divelm = document.createElement("div");
divelm.style.width = CW.toString() + "px";
divelm.style.height = H.toString() + "px";
divelm.style.float = "left";
divelm.style.background = bgc;
divelm.id = "div0";
document.body.appendChild(divelm);

divelm = document.createElement("div");
divelm.style.width = (W + CW).toString() + "px";
divelm.style.height = H.toString() + "px";
divelm.id = "div1";
document.body.appendChild(divelm);

document.getElementById("div1").appendChild(canvas);

function addButton(func, innertext, id){
    if(id == null) id = "";
    buttonelm = document.createElement("button");
    buttonelm.setAttribute("onClick", func);
    buttonelm.innerHTML = innertext;
    buttonelm.style.cssText = "width:" + CW.toString() + "px"
    buttonelm.id = id;
    document.getElementById("div0").appendChild(buttonelm);
}

function addP(str){
    let pelm = document.createElement("p");
    pelm.innerHTML = str;
    pelm.style.cssText = "color: rgb(240, 240, 240); font-size:13.5px";
    document.getElementById("div0").append(pelm);
}

addP("I/O");

var textelm = document.createElement("textarea");
textelm.rows = "20";
textelm.cols = "5";
textelm.style.cssText = "color: rgb(240, 240, 240); margin: 0px; width: " + CW.toString() + "px; height: " + (H / 20).toFixed(0).toString() + "px"
textelm.style.background = bgc;
textelm.id = "IO";
document.getElementById("div0").appendChild(textelm);

//addButton("setTrackMaxTime()", "Set tracks's maxtime");
//addButton("setTrackMaxTimeAndLen()", "Set max time&len");
addButton("setStarSize()", "Set star size");
addButton("changeStarDir()", "Set star dir");
addButton("setTrackMaxTimeAndLen()", "Set tracklen");
addButton("setGravity()", "Set Gravity");

addP("control:");

addButton("stopAnimation()", "Stop", "stop");
addButton("selAll()", "show infs");
addButton("unselAll()", "unshow infs");
addButton("clearAll()", "Clear all");
addButton("changeMerge()", "Set merge");

addP("modes select:");

addButton("showInfMode()", "Show inf");
addButton("clearStarMode()", "Clear star");
addButton("addMoonMode()", "Add moon");
addButton("addSunMode()", "Add sun");
addButton("addStarMode()", "Add star");

addP("SL data");

addButton("getSeed()", "Get seed");
addButton("loadSeed()", "Load seed");

addP("Help");
addButton("showReadMe()", "get README");

const PI = Math.PI;
var Gravity = 1;
var G = 0.3;

class vector{
    constructor(x, y){
        this.x = x || 0;
        this.y = y || 0;
    }
    setn(x, y){
        this.x = x;
        this.y = y;
    }
    setv(v){
        this.x = v.x;
        this.y = v.y;
    }
    prt(){
        console.log("x:%d y:%d", this.x, this.y);
    }
}

function add(a, b){
    return new vector(a.x + b.x, a.y + b.y);
}

function sub(a, b){
    return new vector(a.x - b.x, a.y - b.y);
}

function vec(a, b){
    return new vector(b.x - a.x, b.y - a.y);
}

function div(v, n){
    return new vector(v.x / n, v.y / n);
}

function mul(v, n){
    return new vector(v.x * n, v.y * n);
}

function dot(a, b){
    return new vector(a.x * b.x, a.y * b.y);
}

function sqrlen(v){
    return v.x * v.x + v.y * v.y;
}

function len(v){
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

function nor(v){
    return div(v, len(v));
}

function rot(v, ct){
    return new vector(v.x * Math.cos(ct) + v.y * Math.sin(ct), - v.x * Math.sin(ct) + v.y * Math.cos(ct));
}

function getRandomColor(){
    return '#' + function(c){
        c += '56789abcdef'[Math.floor(Math.random() * 11)];
        return c.length == 6 ? c : arguments.callee(c);
    }('');
}

function colorReverse(oldColor){
    oldColor = '0x' + oldColor.replace(/#/g, '');
    let str = '000000' + (0xFFFFFF - oldColor).toString(16);
    return '#' + str.substring(str.length - 6, str.length);
}

function drawCircle(p, r, c){
    ctx.beginPath();
    ctx.fillStyle = ctx.strokeStyle = c;
    ctx.arc(p.x, p.y, r, 0, PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

class body{
    constructor(x, y, r){
        this.p = new vector(x || 0, y || 0);
        this.v = new vector();
        this.r = r;
        this.d = 1;
        this.m = PI * r * r * this.d;
        this.color = getRandomColor();
        this.fix = 0;
        this.del = 0;
        this.line = [];
        this.tline = [];
        this.f = new vector();
        this.sel = 0;
        this.psel = 0;
    }
    render(){
        drawCircle(this.p, this.r, this.color);
    }
    update(dv){
        this.v = add(this.v, dv);
        this.p = add(this.p, this.v);
        if(this.line.length == 0 || sqrlen(sub(this.p, this.line[this.line.length - 1])) > 10){
            this.line.push(this.p);
            this.tline.push(frameNum);
        }
        while(this.line.length > trackMaxLen || (this.line.length && frameNum - this.tline[0] > trackMaxTime)){
            this.line.shift();
            this.tline.shift();
        }
    }
}

function clear(){
    ctx.strokeStyle = ctx.fillStyle = bgc;
    ctx.fillRect(0, 0, W, H);
}

var o = new body(W / 2, H / 2, 20);
o.v = new vector(5, 0);

var world = [];
var temp = [];

function countv(p, s, dir){
    let v = Math.sqrt(s.m * G / len(sub(s.p, p.p)));
    return add(mul(rot(nor(sub(s.p, p.p)), PI / 2 * dir), v), s.v);
}

function countMoon(sun, r, p, dir){
    let ret = new body(p.x, p.y, r);
    ret.v = countv(ret, sun, dir)
    return ret;
}

function prtText(s, x, y){
    ctx.font = fontsize.toFixed(0).toString() + "px Arial"
    ctx.fillStyle = "#f0f0f0";
    ctx.textAlign = "left";
    ctx.textBaseline = "hanging";
    ctx.fillText(s, x, y);
}

function drawLine(a, b, lc){
    ctx.beginPath();
    ctx.fillStyle = ctx.strokeStyle = lc;
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.closePath();
}

function prtBasicInf(){
    let _fontsize = fontsize;
    fontsize = 13;
    let lh = fontsize / 4 * 5;
    let p = 0
    prtText("mode : " + modeStr[mode], 10 , 10 + p++ * lh);
    prtText("maxlen : " + trackMaxLen.toString(), 10, 10 + p++ * lh);
    prtText("maxtime : " + trackMaxTime.toString(), 10, 10 + p++ * lh);
    prtText("planet number : " + world.length, 10, 10 + p++ * lh);
    prtText("merge : " + (mergeMode ? "On" : "Off"), 10, 10 + p++ * lh);
    prtText("gravity constance : " + Gravity.toFixed(2).toString(), 10, 10 + p++ * lh);
    if(mode == addMoonModeValue){
        prtText("star size : " + addStarsSize.toString(), 10, 10 + p++ * lh);
        prtText("star direction : " + (addStarsDir == 1? "Clockwise" : "Counterclockwise"),
        10, 10 + p++ * lh);
    }
    if(mode == addSunModeValue || mode == addSunModeValue){
        prtText("star size : " + addStarsSize.toString(), 10, 10 + p++ * lh);
    }
    fontsize = _fontsize;
}

function inti1(){
    world.push(new body(W / 2, H / 2, 50));
    world[0].color = "#f0f000";
    world[0].fix = 1;
    world.push(new body(W / 2 + 300, H / 2, 20));
    world[1].v = countv(world[1], world[0], 1);
    world.push(new body(world[0].p.x + 350, world[0].p.y, 5));
    world[2].v = countv(world[2], world[1], 1);
    world.push(new body(W / 2 - 100, H / 2, 10));
    world[3].v = countv(world[3], world[0], 1);
}

function inti2(){
    for(let i = 1; i <= 500; i++){
        world.push(new body(Math.random() * W, Math.random() * H, Math.random() * 3));
    }
}

function prtBodyInfo(b, X, Y){
    prtText(
        "position:" + b.p.x.toFixed(2).toString() + " " + b.p.y.toFixed(2).toString(),
        X,
        Y
    );
    prtText(
        "velocity:" + b.v.x.toFixed(2).toString() + " " + b.v.y.toFixed(2).toString(),
        X,
        Y + fontsize / 2 * 2.5
    );
    console.log(typeof(b.r));
    prtText(
        "radiu:" + b.r.toFixed(2).toString() + " mass:" + b.m.toFixed(2).toString(),
        X,
        Y + fontsize / 2 * 2.5 * 2
    );
    prtText(
        (b.fix ? "fixed" : "not fixed") + (b.sel ? " [Always show]" : ""),
        X,
        Y + fontsize / 2 * 2.5 * 3
    );
}

function copy(a, b){
    a.p = b.p;
    a.color = b.color;
    a.sel = b.sel;
    a.psel = b.psel;
    for(let i = 0; i < b.line.length; i++){
        a.line[i] = b.line[i];
        a.tline[i] = b.tline[i];
    }
}

function draw(){
    if(!stop) frameNum++;
    clear();
    for(let i = 0; i < world.length; i++){ //删除太远的body
        if(sqrlen(world[i].p) > 2500000000) world[i].del = 1;
    }
    for(let i = 0; i < world.length; i++){ //计算互作用力
        if(world[i].fix || world[i].del) continue;
        if(stop) break;
        let f = new vector();
        for(let j = 0; j < world.length; j++){
            if(world[j].del) continue;
            if(i == j) continue;
            let r = len(sub(world[i].p, world[j].p));
            if(r < 10 || r > 1000) continue;
            f = add(f, mul(nor(sub(world[j].p, world[i].p)), world[i].m * world[j].m * G / (r * r)))
        }
        world[i].f = f;
    }

    for(let i = 0; i < world.length; i++){ //应用互作用力
        if(world[i].fix || world[i].del) continue;
        if(stop) break;
        world[i].update(div(world[i].f, world[i].m));
    }

    temp.length = 0;
    for(let i = 0; i < world.length; i++){ //判断碰撞
        if(stop || !mergeMode) break;
        if(world[i].fix || world[i].del) continue;
        for(let j = 0; j < world.length; j++){
            if(world[j].fix || world[j].del || world[i].del) continue;
            if(i == j) continue;
            if(sqrlen(sub(world[i].p, world[j].p)) >= function(x){return x * x}(world[i].r + world[j].r)) continue;
            
            let no = new body();
            if(world[i].m < world[j].m){
                copy(no, world[j]);
            }
            else{
                copy(no, world[i]);
            }
            no.v = div(add(mul(world[i].v, world[i].m), mul(world[j].v, world[j].m)), world[i].m + world[j].m);
            no.m = world[i].m + world[j].m;
            no.r = Math.sqrt(no.m / no.d / PI);
            world[i].del = world[j].del = 1;
            temp.push(no);
        }
    }
    for(let i = 0; i < world.length; i++) if(world[i].del == 0){
        temp.push(world[i]);
    }
    world.length = 0;
    for(let i = 0; i < temp.length; i++){
        world.push(temp[i]);
        if(temp[i].psel) parentStar = i;
    }
    
    for(let i = 0; i < world.length; i++){ //绘制
        if(world[i].del) continue;
        for(let j = 0; j < world[i].line.length - 1; j++){
            drawLine(world[i].line[j], world[i].line[j + 1], "#f0f0f0");
        }
        world[i].render();
    }

    for(let i = 0; i < world.length; i++){//显示信息
        let showed = 0;
        if(world[i].psel && i != parentStar) world[i].psel = 0;
        if(sqrlen(sub(new vector(mouseX, mouseY), world[i].p)) <= Math.max(world[i].r * world[i].r, 50)){
            if(mode == showInfModeValue){
                prtBodyInfo(world[i], world[i].p.x + 0.7071 * world[i].r, world[i].p.y + 0.7071 * world[i].r)
                if(mouseClick) world[i].sel = !world[i].sel;
                showed = 1;
            }
            else if(mode == addMoonModeValue){
                if(mouseClick){
                    if(parentStar != -1){
                        world[parentStar].psel = 0;
                    }
                    world[i].psel = 1;
                    mouseClick = 0;
                }
            }
            else if(mode == clearStarModeValue){
                if(mouseClick){
                    world[i].del = 1;
                }
            }
        }
        if((world[i].sel || showAllInf) && !showed){
            prtBodyInfo(world[i], world[i].p.x + 0.7071 * world[i].r, world[i].p.y + 0.7071 * world[i].r)
        }
        if(mode == addMoonModeValue && world[i].psel){
            let _p = world[i].p;
            parentStar = i;
            let col = colorReverse(world[i].color);
            drawLine(new vector(_p.x + 10, _p.y), new vector(_p.x - 10, _p.y), col);
            drawLine(new vector(_p.x, _p.y + 10), new vector(_p.x, _p.y - 10), col);
        }
    }

    if(mouseClick){
        if(mode == addMoonModeValue && parentStar != -1){
            let _ns = countMoon(world[parentStar], addStarsSize,
                new vector(mouseX, mouseY), addStarsDir);
            world.push(_ns);
        }
        else if(mode == addSunModeValue){
            let _ns = new body(mouseX, mouseY, addStarsSize);
            _ns.fix = 1;
            console.log(_ns.r);
            world.push(_ns);
        }
    }
    
    if(mode == addStarModeValue){
        if(mouseClick){
            newStar = new body(mouseX, mouseY, addStarsSize);
        }
        if(mouseDown || mouseUp){
            newStar.render();
            drawLine(newStar.p,
                new vector(mouseX, mouseY),
                "#f0f0f0");
        }
        if(mouseUp){
            console.log("add");
            newStar.v = div(sub(newStar.p, new vector(mouseX, mouseY)), 30);
            world.push(newStar);
            mouseUp = 0;
        }
    }

    prtBasicInf();
    if(mouseClick) mouseClick = 0;
    if(mouseUp) mouseUp = 0;
    //prtText(mouseX.toString() + " " + mouseY.toString(), mouseX, mouseY);
    requestAnimationFrame(draw);
}

inti1();
draw();

function getSeed(){
    let temp = [], tempt = [];
    for(let i = 0; i < world.length; i++){
        let tl = [], ttl = [];
        for(let j = 0; j < world[i].line.length; j++){
            tl.push(world[i].line[j]);
            ttl.push(world[i].tline[j]);
        }
        temp.push(tl); tempt.push(ttl);
    }
    for(let i = 0; i < world.length; i++){
        world[i].line.length = world[i].tline.length = 0;
    }
    textelm.innerHTML = JSON.stringify(world);
    for(let i = 0; i < world.length; i++){
        world[i].line = temp[i];
        world[i].tline = tempt[i];
    }
}

function loadSeed(){
    let js = textelm.value;
    let temp = JSON.parse(js);

    world.length = 0;
    for(let i = 0; i < temp.length; i++){
        let no = new body();
        no.p.setn(temp[i]["p"]["x"], temp[i]["p"]["y"]);
        no.v.setn(temp[i]["v"]["x"], temp[i]["v"]["y"]);
        no.r = temp[i]["r"];
        no.d = temp[i]["d"];
        no.m = temp[i]["m"];
        no.color = temp[i]["color"];
        no.fix = temp[i]["fix"];
        no.color = temp[i]["color"];
        world.push(no);
    }
    if(!stop) stopAnimation();
}

function stopAnimation(){
    stop = 1;
    let elm = document.getElementById("stop");
    elm.id = "start";
    elm.setAttribute("onClick", "startAnimation()");
    elm.innerHTML = "start";
}

function startAnimation(){
    stop = 0;
    let elm = document.getElementById("start");
    elm.id = "stop";
    elm.setAttribute("onClick", "stopAnimation()");
    elm.innerHTML = "stop";
}

function selAll(){
    showAllInf = 1;
}

function unselAll(){
    for(let i = 0; i < world.length; i++){
        world[i].sel = 0;
    }
    showAllInf = 0;
}

function windowToCanvas(x, y){
    let box = canvas.getBoundingClientRect();
    return new vector(Math.round(x - box.left), Math.round(y - box.top));
}

function setTrackMaxLen(){
    let str = textelm.value;
    trackMaxLen = parseInt(str);
}

function setTrackMaxTime(){
    let str = textelm.value;
    trackMaxTime = parseInt(str);
}

function setGravity(){
    let str = textelm.value;
    Gravity = parseFloat(str);
    G = 0.3 * Gravity;
}

function showInfMode(){
    mode = showInfModeValue;
}

function clearStarMode(){
    mode = clearStarModeValue;
}

function addMoonMode(){
    mode = addMoonModeValue;
}

function addSunMode(){
    mode = addSunModeValue;
}

function addStarMode(){
    mode = addStarModeValue;
}

function setTrackMaxTimeAndLen(){
    setTrackMaxTime();
    setTrackMaxLen();
}

function setStarSize(){
    addStarsSize = parseFloat(textelm.value);
}

function changeStarDir(){
    addStarsDir = addStarsDir == 1 ? -1 : 1;
}

function clearAll(){
    world.length = 0;
}

function changeMerge(){
    mergeMode = !mergeMode;
}

function showReadMe(){
    alert("In&Out部分：在文本框里输入内容，然后点击下面四个按钮可以分别改变一些值。\n \
    set star size：设置手动加入的星球的大小。\n \
    set star dir:在加入卫星模式下，设置卫星的旋转方向（顺时针或逆时针）\n \
    set tracklen: 设置轨迹长度\n \
    set Gravity:设置重力常数\n \
    \n \
    控制（control）部分：\n \
    Stop/Start 开始或者停止模拟\n \
    show infs/unshow infs：显示或不显示星球信息\n \
    Clear all：删除所有星球\n \
    Set merge：设置星球是否可以合并\n \
    \n \
    模式选择（modes select）部分：\n \
    Show inf：该模式下点击星球可以显示星球的信息\n \
    clear star：该模式下可以通过点击星球来删除星球\n \
    add mood：在该模式下，先通过点击选中一个星球作为母星，再在空白处点击，会生成大小为starsize的，顺/逆时针围绕着母星旋转的卫星\n \
    add sun：在该模式下，点击空白的地方来加入恒星，恒星不会运动，不会与其他星球融合\n \
    add star：通过鼠标来添加行星，可以通过拖动来控制初始速度，行星大小为starsize\n \
    \n \
    数据存取（SL data）部分：\n \
    Get seed：获得目前的星球数据，输出到文本框中\n \
    Load seed：载入文本框中的星球数据。load之后记得要点Start来开始模拟哦");
}

canvas.onmousemove = function(e){
   let v = windowToCanvas(e.clientX, e.clientY);
   mouseX = v.x;
   mouseY = v.y;
}

canvas.onmousedown = function(e){
    mouseClick = mouseDown = 1;
    console.log("moused");
}

canvas.onmouseup = function(e){
    mouseDown = 0;
    mouseUp = 1;
    console.log("mouseu");
}