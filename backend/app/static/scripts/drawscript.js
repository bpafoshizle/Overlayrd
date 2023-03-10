function listenEvents() {
    const alertTimeout = 5000;
    const initialUrl = 'wss://eventsub-beta.wss.twitch.tv/ws';
    const twitchSubscriptionUrl = 'https://api.twitch.tv/helix/eventsub/subscriptions';
    let ws;
    let sessionId;
    let keepAliveInterval;
    let lastKeepAliveTimestamp;
    let reconnect = false;

    function connect(url=initialUrl, reconnect=false) {
        reconnect = reconnect;
        ws = new WebSocket(url);
        if(!reconnect) {
            subscribeToEvents()
        }
    }

    function subscribeToEvents() {
        postData(twitchSubscriptionUrl, {
            "type": "channel.follow",
            "version": "1",
            "condition": {
                "broadcaster_user_id": `${broadcasterId}`
            },
            "transport": {
                "method": "websocket",
                "session_id": `${sessionId}`
            }
        })
        .then(data => {
            console.log(data);
        });
    }

    async function postData(url = '', data = {}) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Client-Id': `${clientId}`,
                'Authoprization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    ws.onopen(() => {
        console.log('connected to eventsub');
    });
    ws.onmessage(event => {
        const data = JSON.parse(event.data);
        if(data.metadata.message_type === 'session_welcome') {
            let payload = data.payload;
            sessionId = payload.session.id
            keepAliveInterval = payload.session.keepalive_timeout_seconds;
            subscribeToEvents();
        }
        else if(data.metadata.message_type === 'session_keepalive'){
            lastKeepAliveTimestamp = data.metadata.message_timestamp;
        }
        else if(data.metadata.message_type === 'session_reconnect') {
            console.log('reconnecting to eventsub');
            ws.close();
            connect(true, data.payload.reconnect_url);
        }
        else if(data.metadata.message_type === 'notification') {
            lastKeepAliveTimestamp = data.metadata.message_timestamp;
            let payload = data.payload;
            let eventType = payload.subscription.type;
            let username = payload.event.broadcaster_user_name;
            let alertImageId = null;
            let textStyle = null;
            if(eventType === 'channel.follow') {
                alertImageId = 'twitch-new-follower-img';
                textStyle = '#6441a4';
                eventAlertBox(username, alertImageId, textStyle, alertTimeout);
            }
            else if(eventType === 'channel.subscribe') {
                alertImageId = 'twitch-new-subscriber-img';
                textStyle = '#6441a4';
                eventAlertBox(username, alertImageId, textStyle, alertTimeout);
            }
        }
    });
    ws.onerror( error => {
        console.log('error: ', error);
    });
    ws.onclose(() => {
        console.log('disconnected from eventsub');
    });

    connect();
}

function eventAlertBox(username, alertImageId, textStyle, timeOut) {
    function calculateImgPlacement(imageId) {
        const canvas = document.querySelector('#bg-canvas');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = textStyle;
        ctx.font = '56px Monaco';
        // const img = document.getElementById(imageId);
        const img = document.querySelector(`#${imageId}`);
        return {
            imgStartX: (canvas.width - img.width),
            imgStartY: (canvas.height - img.height),
            imgWidth: img.width,
            imgHeight: img.height,
            imgTextOffsetY: parseInt(img.dataset.textYOffset),
            imgTextOffsetX: parseInt(img.dataset.textXOffset),
            textWidth: ctx.measureText(username).width,
            alertAudioId: img.dataset.audioId
        }
    }
    const {
        imgStartX, 
        imgStartY, 
        imgWidth, 
        imgHeight, 
        imgTextOffsetY,
        imgTextOffsetX,
        textWidth,
        alertAudioId
     } = calculateImgPlacement(alertImageId);

    // console.log(`imgStartX: ${imgStartX}, imgStartY: ${imgStartY}, imgWidth: ${imgWidth}, imgHeight: ${imgHeight}, imgTextOffsetY: ${imgTextOffsetY}, imgTextOffsetX: ${imgTextOffsetX}, textWidth: ${textWidth}`)
    let alpha = 0;
    let fadeIn = true;

    // 60 frames per second * 2.5 seconds = 150 frames. 1/150 = 0.006666666666666667
    let fps = 60;
    let secondsToHalf = timeOut/2/1000;
    let framesToHalf = fps * secondsToHalf;
    let delta = 1/framesToHalf;
    let startTime = Date.now();

    let audio = document.querySelector(`#${alertAudioId}`);
    audio.play();
    
    function draw() {
        const canvas = document.querySelector('#bg-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = alpha;
        ctx.drawImage(document.querySelector(`#${alertImageId}`), imgStartX, imgStartY, imgWidth, imgHeight);
        ctx.fillText(
            username,
            imgStartX + imgTextOffsetX + (imgWidth - textWidth)/2, 
            imgStartY + imgTextOffsetY
        );
        if(fadeIn) {
            alpha += delta;
            if (alpha >= 1) {
                fadeIn = false;
                setTimeout(() => {
                    fadeIn = false;
                }, timeOut/2);
            }
        } else {
            alpha -= delta;
            if (alpha <= 0) {
                fadeIn = true;
                setTimeout(() => {
                    fadeIn = true;
                }, timeOut/2);
            }
        }
        if(Date.now() - startTime < timeOut) {
            requestAnimationFrame(draw);
        }
        else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    draw();
}

// DEBUGGING FUNCTIONS
const alertList = [
    ['HNDR', 'twitch-new-follower-img', '#6441a4'],
    ['EGriZZ', 'twitch-new-subscriber-img', '#6441a4'],
    ['NotLilBear', 'twitch-first-time-chat-img', '#6441a4'],
    ['KuHouse', 'twitch-new-donation-img', '#c0ffa9'],
]

function loopDrawAlert() {
    const timeOut = 5000;
    let alertIndex = 0;
    let requestId = null;

    function drawAlert() {
        eventAlertBox(alertList[alertIndex][0], alertList[alertIndex][1], alertList[alertIndex][2], timeOut, requestId);
        alertIndex = (alertIndex+1) % alertList.length;
        setTimeout(drawAlert, timeOut)
    }
    drawAlert();
}

function drawOneAlert() {
    const timeOut = 5000;
    let alertIndex = 0;
    eventAlertBox(alertList[alertIndex][0], alertList[alertIndex][1], alertList[alertIndex][2], timeOut);
}