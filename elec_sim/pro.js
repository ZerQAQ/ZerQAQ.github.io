/*
    Author: @ZerQAQ
*/

var canvas = document.createElement("canvas");
var CW = 90
var W = window.innerWidth - CW;
var H = window.innerHeight;
var cameraMaxX = W;
var cameraMinX = 0;
var cameraMaxY = H;
var cameraMinY = 0;
var cameraScale = 1;
var bgc = "#000707";
var stop = 0;
var mouseX = 0, mouseY = 0;
var tmouseX = 0, tmouseY = 0;
var mouseClickX = 0, mouseClickY = 0;
var fontsize = 12
canvas.width = W;
canvas.height = H;
var ctx = canvas.getContext("2d");
var mouseClick = 0;
var mouseDown = 0;
var mouseUp = 0;
var trackMaxLen = 100;
var trackMaxTime = 100;
var timeScale = 1;
var frameNum = 0;
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
    pelm.style.cssText = "color: rgb(240, 240, 240); font-size:13.5px; height: 6px";
    document.getElementById("div0").append(pelm);
}

const PI = Math.PI;
const CIRCLE = 1;
const RECTANGLE = 2;
const K = 5;
var Gravity = 1;
var G = 0.3;
var ctx = canvas.getContext("2d");

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

function positionTranfrom(v){
    let x = (v.x - cameraMinX) * W / (cameraMaxX - cameraMinX);
    let y = (v.y - cameraMinY) * H / (cameraMaxY - cameraMinY);
    return new vector(x, y);
}
function fpositionTranfrom(v){
    let x = cameraMinX + v.x * (cameraMaxX - cameraMinX) / W;
    let y = cameraMinY + v.y * (cameraMaxY - cameraMinY) / H;
    return new vector(x, y);
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
    p = positionTranfrom(p);
    ctx.beginPath();
    ctx.fillStyle = ctx.strokeStyle = c;
    ctx.arc(p.x, p.y, r / cameraScale, 0, PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function drawLine(a, b, lc){
    a = positionTranfrom(a);
    b = positionTranfrom(b);
    ctx.beginPath();
    ctx.fillStyle = ctx.strokeStyle = lc;
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.closePath();
}

function prtText(s, x, y, abs, tAlign, col){
    if(col == null) col = "#f0f0f0";
    if(tAlign == null) tAlign = "left";
    if(abs == null){
        let v = new vector(x, y);
        v = positionTranfrom(v);                                                                                                                                    
        x = v.x; y = v.y;
    }
    ctx.font = fontsize.toFixed(0).toString() + "px Arial"
    ctx.fillStyle = col;
    ctx.textAlign = tAlign;
    ctx.textBaseline = "hanging";
    ctx.fillText(s, x, y);
}

class body{
    constructor(x, y, qdivm, r){
        this.p = new vector(x || 0, y || 0);
        this.v = new vector();
        this.r = r || 5;
        this.qdivm = qdivm;
        this.color = getRandomColor();
        this.del = 0;
        this.line = [];
        this.tline = [];
    }
    copy(){
        let ret = new body(this.p.x, this.p.y, this.qdivm, this.r);
        ret.del = this.del;
        ret.color = this.color;
        ret.del = this.del;
        for(let i = 0; i < this.line.length; i++){
            ret.line.push(this.line[i]);
            ret.tline.push(this.tline[i]);
        }
        return ret;x
    }
    render(){
        drawCircle(this.p, this.r, this.color);
    }
    update(dv){
        this.v = add(this.v, mul(dv, timeScale));
        this.p = add(this.p, mul(this.v, timeScale));
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

class shape{
    constructor(type, l, h){
        this.type = type;
        if(type == RECTANGLE){
            this.l = l;
            this.h = h;
        }
        else if(type == CIRCLE){
            this.r = l;
        }
    }
}

class field{
    constructor(type, x, y, shape, v){

    }
}

class point{
    constructor(x, y, q){
        this.p = new vector(x, y);
        this.q = q;
        this.r = 10;
        this.color = q > 0 ? "#d00000" : "#0000d0";
    }
    render(){
        drawCircle(this.p, this.r, this.color);

        drawLine(sub(this.p, new vector(this.r * 0.7, 0)),
        add(this.p, new vector(this.r * 0.7, 0)), "#f0f0f0");

        if(this.q > 0){
            drawLine(sub(this.p, new vector(0, this.r * 0.7)),
            add(this.p, new vector(0, this.r * 0.7)), "#f0f0f0");
        }
    }
}

var particle = [], fields = [], points = [];

function elcPos(p){
    let ret = 0;
    for(let i = 0; i < points.length; i++){
        ret += points[i].q / len(sub(p, points[i].p));
    }
    ret *= K;
    return ret;
}

function EleLine(p){
    let ret = new vector(0, 0);
    for(let i = 0; i < points.length; i++){
        let sqrr = sqrlen(sub(p, points[i].p));
        ret += mul(nor(sub(p, points[i].p)), points[i].q * K / sqrr);
    }
    return ret;
}

function drawEleLine(o){
    o.prt();
    if(cameraMaxX < o.x || o.x < cameraMinX || cameraMaxY < o.y || cameraMinY > o.y) return;
    let dl = nor(EleLine(o));
    drawLine(o, add(o, mul(dl, 10)));
    drawEleLine(add(o, mul(dl, 10)));
}

function inti(){
    particle.push(new body(W / 2 + 50, H / 2, 1));
    points.push(new point(W / 2, H / 2 + 100, -10));
    points.push(new point(W / 2, H / 2 - 100, 10));
}

function clear(){
    ctx.strokeStyle = ctx.fillStyle = bgc;
    ctx.fillRect(0, 0, W, H);
}

function draw(){
    clear();
    for(let i = 0; i < particle.length; i++){
        let obj = particle[i];
        let dv = new vector(0, 0);
        for(let j = 0; j < points.length; j++){
            let pot = points[j];
            let sqrr = sqrlen(sub(obj.p, pot.p));
            dv = add(dv, mul(nor(sub(obj.p, pot.p)), obj.qdivm * pot.q * K / sqrr));
        }
        obj.update(dv);
        obj.v.prt();
    }

    for(let i = 0; i < particle.length; i++){
        particle[i].render();
    }
    for(let i = 0; i < points.length; i++){
        points[i].render();
        for(let j = 0; j < 11; j++){
            let dt = rot(new vector(0, 1), PI * 2 * j / 12);
            drawEleLine(add(points[i].p, mul(dt, points[i].r)));
        }
    }

    for(let i = 0; i < particle.length; i++){ //绘制
        if(particle[i].del) continue;
        for(let j = 0; j < particle[i].line.length - 1; j++){
            drawLine(particle[i].line[j], particle[i].line[j + 1], "#f0f0f0");
        }
        particle[i].render();
    }

    requestAnimationFrame(draw);
}

inti();
draw();