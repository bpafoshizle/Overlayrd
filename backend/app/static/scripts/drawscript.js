const alertList = [
    ['HNDR', 'twitch-new-follow-img', 'rgba(100, 65, 164, 1)'],
    ['EGriZZ', 'twitch-new-follow-img', 'rgba(100, 65, 164, 1)'],
    ['KuHouse', 'twitch-new-follow-img', 'rgba(100, 65, 164, 1)'],
    ['NotLilBear', 'twitch-new-follow-img', 'rgba(100, 65, 164, 1)'],
]
const timeOut = 5000;
let alertIndex = 0;

function drawAlert() {
    eventAlertBox(alertList[alertIndex][0], alertList[alertIndex][1], alertList[alertIndex][2]);
    alertIndex = (alertIndex+1) % alertList.length;
    setTimeout(drawAlert, timeOut)
}

function eventAlertBox(username, alertImageId, textStyle) {
    const imgStartX = 1200;
    const imgStartY = 500;
    const imgWidth = 700;
    const imgHeight = 700;
    const imgTextOffsetY = 450;
    let alpha = 0;
    let fadeIn = true;

    function draw() {
        const canvas = document.getElementById('bg-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = alpha;
        ctx.drawImage(document.getElementById(alertImageId), imgStartX, imgStartY, imgWidth, imgHeight);
        ctx.fillStyle = textStyle;
        ctx.font = '56px Monaco';
        let width = ctx.measureText(username).width;
        ctx.fillText(username, imgStartX + (imgWidth - width)/2, imgStartY + imgTextOffsetY);
        if(fadeIn) {
            alpha += 0.01;
            if (alpha >= 1) {
                fadeIn = false;
                setTimeout(() => {
                    fadeIn = false;
                }, timeOut/2);
            }
        } else {
            alpha -= 0.01;
            if (alpha <= 0) {
                fadeIn = true;
                setTimeout(() => {
                    fadeIn = true;
                }, timeOut/2);
            }
        }
        requestAnimationFrame(draw);
    }

    draw();
    
}




function drawRectangle(ctx) {
    // https://tacticalliondesigns.com/twitch-graphic-sizes/
    ctx.fillStyle = 'rgba(100, 65, 164, .5)';
    ctx.fillRect(10, 10, 700, 250);
    ctx.fillStyle = 'rgba(192,255,169, .5)';
    ctx.fillRect(10, 300, 700, 250);
}

function drawNestedSquares(ctx) {
    ctx.fillRect(25, 25, 100, 100);
    ctx.clearRect(45, 45, 60, 60);
    ctx.strokeRect(50, 50, 50, 50);
}

function drawTriangle(ctx) {
    ctx.beginPath();
    ctx.moveTo(75,50);
    ctx.lineTo(100,75);
    ctx.lineTo(100,25);
    ctx.fill();
}

function drawSmiley(ctx) {
    ctx.beginPath();
    ctx.arc(75, 75, 50, 0, Math.PI * 2, true); // Outer circle
    ctx.moveTo(110, 75);
    ctx.arc(75, 75, 35, 0, Math.PI, false);  // Mouth (clockwise)
    ctx.moveTo(65, 65);
    ctx.arc(60, 65, 5, 0, Math.PI * 2, true);  // Left eye
    ctx.moveTo(95, 65);
    ctx.arc(90, 65, 5, 0, Math.PI * 2, true);  // Right eye
    ctx.stroke();
}

function drawTwoTriangles(ctx) {
    // Filled triangle
    ctx.beginPath();
    ctx.moveTo(25,25);
    ctx.lineTo(105,25);
    ctx.lineTo(25,105);
    ctx.fill();

    // Stroked triangle
    ctx.beginPath();
    ctx.moveTo(125,125);
    ctx.lineTo(125,45);
    ctx.lineTo(45,125);
    ctx.closePath();
    ctx.stroke();
}

function drawArcs(ctx) {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) {
            ctx.beginPath();
            const x = 25 + j * 50; // x coordinate
            const y = 25 + i * 50; // y coordinate
            const radius = 20; // Arc radius
            const startAngle = 0; // Starting point on circle
            const endAngle = Math.PI + (Math.PI * j) / 2; // End point on circle
            const anticlockwise = i % 2 !== 0; // clockwise or anticlockwise

            ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);

            if (i > 1) {
                ctx.fill();
            } else {
                ctx.stroke();
            }
        }
    }
}

function quadraticBezierCurves(ctx) {
    // Quadratic curves example
    ctx.beginPath();
    ctx.moveTo(75, 25);
    ctx.quadraticCurveTo(25, 25, 25, 62.5);
    ctx.quadraticCurveTo(25, 100, 50, 100);
    ctx.quadraticCurveTo(50, 120, 30, 125);
    ctx.quadraticCurveTo(60, 120, 65, 100);
    ctx.quadraticCurveTo(125, 100, 125, 62.5);
    ctx.quadraticCurveTo(125, 25, 75, 25);
    ctx.stroke();
}

function cubicBezierCurves(ctx) {
    // Cubic curves example
    ctx.beginPath();
    ctx.moveTo(75, 40);
    ctx.bezierCurveTo(75, 37, 70, 25, 50, 25);
    ctx.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5);
    ctx.bezierCurveTo(20, 80, 40, 102, 75, 120);
    ctx.bezierCurveTo(110, 102, 130, 80, 130, 62.5);
    ctx.bezierCurveTo(130, 62.5, 130, 25, 100, 25);
    ctx.bezierCurveTo(85, 25, 75, 37, 75, 40);
    ctx.fill();
}

function drawPackman(ctx) {
    roundedRect(ctx, 12, 12, 150, 150, 15);
    roundedRect(ctx, 19, 19, 150, 150, 9);
    roundedRect(ctx, 53, 53, 49, 33, 10);
    roundedRect(ctx, 53, 119, 49, 16, 6);
    roundedRect(ctx, 135, 53, 49, 33, 10);
    roundedRect(ctx, 135, 119, 25, 49, 10);

    ctx.beginPath();
    ctx.arc(37, 37, 13, Math.PI / 7, -Math.PI / 7, false);
    ctx.lineTo(31, 37);
    ctx.fill();

    for (let i = 0; i < 8; i++) {
        ctx.fillRect(51 + i * 16, 35, 4, 4);
    }

    for (let i = 0; i < 6; i++) {
        ctx.fillRect(115, 51 + i * 16, 4, 4);
    }

    for (let i = 0; i < 8; i++) {
        ctx.fillRect(51 + i * 16, 99, 4, 4);
    }

    ctx.beginPath();
    ctx.moveTo(83, 116);
    ctx.lineTo(83, 102);
    ctx.bezierCurveTo(83, 94, 89, 88, 97, 88);
    ctx.bezierCurveTo(105, 88, 111, 94, 111, 102);
    ctx.lineTo(111, 116);
    ctx.lineTo(106.333, 111.333);
    ctx.lineTo(101.666, 116);
    ctx.lineTo(97, 111.333);
    ctx.lineTo(92.333, 116);
    ctx.lineTo(87.666, 111.333);
    ctx.lineTo(83, 116);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(91, 96);
    ctx.bezierCurveTo(88, 96, 87, 99, 87, 101);
    ctx.bezierCurveTo(87, 103, 88, 106, 91, 106);
    ctx.bezierCurveTo(94, 106, 95, 103, 95, 101);
    ctx.bezierCurveTo(95, 99, 94, 96, 91, 96);
    ctx.moveTo(103, 96);
    ctx.bezierCurveTo(100, 96, 99, 99, 99, 101);
    ctx.bezierCurveTo(99, 103, 100, 106, 103, 106);
    ctx.bezierCurveTo(106, 106, 107, 103, 107, 101);
    ctx.bezierCurveTo(107, 99, 106, 96, 103, 96);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(101, 102, 2, 0, Math.PI * 2, true);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(89, 102, 2, 0, Math.PI * 2, true);
    ctx.fill();
}

function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
    ctx.lineTo(x + width - radius, y + height);
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    ctx.lineTo(x + width, y + radius);
    ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
    ctx.lineTo(x + radius, y);
    ctx.quadraticCurveTo(x, y, x, y + radius);
    ctx.stroke();
}