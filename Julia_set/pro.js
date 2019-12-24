class vector{
    constructor(_x, _y){
        this.x = _x || 0;
        this.y = _y || 0;
    }
    set(_x, _y){
        this.x = _x;
        this.y = _y;
    }
    prt(){
        console.log("%f %f\n", this.x, this.y);
    }
}

class complexNumber{
    constructor(a, b){
        this.real = a || 0;
        this.virual = b || 0;
    }
}

var canvas = document.createElement("canvas");

var CW = 90;
var W = window.innerWidth - CW;
var H = window.innerHeight;
var cameraMaxX = 1.7;
var cameraMinX = -1.7;
var cameraMaxY = 1.7 * H / W;
var cameraMinY = -1.7 * H / W;
var cameraScale = 3;
var bgc = "#000707";
var ctx = canvas.getContext("2d");
var InfValue = 2;
InfValue *= InfValue;
var maxTime = 24;
var juliaConst = new complexNumber(-0.75, 0);

canvas.height = H;
canvas.width = W;

const PI = Math.PI;

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

function add(a, b){
    return new complexNumber(a.real + b.real, a.virual + b.virual);
}

function mul(a, b){
    return new complexNumber(
        a.real * b.real - a.virual * b.virual,
        a.real * b.virual + a.virual * a.real
    )
}

function pow(a, i){
    ret = new complexNumber(1, 0);
    for(let _i = 0; _i < i; _i++) ret = mul(ret, a);
    return ret;
}

function sqrlen(a){
    return a.real * a.real + a.virual * a.virual;
}

function drawCircle(p, r, c){
    //p = positionTranfrom(p);
    ctx.beginPath();
    ctx.fillStyle = ctx.strokeStyle = c;
    ctx.arc(p.x, p.y, r / cameraScale, 0, PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function drawLine(a, b, lc){
    //a = positionTranfrom(a);
    //b = positionTranfrom(b);
    ctx.beginPath();
    ctx.fillStyle = ctx.strokeStyle = lc;
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.closePath();
}

function drawPoint(p, pc){
    drawLine(p, p, pc);
}

function nextItem(v){
    return add(mul(v, v), juliaConst);
}

function positionTranfrom(p){
    let x = cameraMinX + (cameraMaxX - cameraMinX) * p.x / W;
    let y = cameraMinY + (cameraMaxY - cameraMinY) * p.y / H;
    return new vector(x, y);
}

function getColor(p){
    p = positionTranfrom(p);
    n = new complexNumber(p.x, p.y);
    ret = 0;
    while(sqrlen(n) < InfValue && ret < maxTime){
        n = nextItem(n);
        ret++;
    }
    return (ret / maxTime) * 0xffffff
}

function draw(){
    console.log(1);
    for(let i = 0; i < H; i++){
        for(let j = 0; j < W; j++){
            let v = getColor(new vector(i, j));
        }
    }
    requestAnimationFrame(draw);
}

draw();