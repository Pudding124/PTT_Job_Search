// iframe
var body = document.createElement("div");
document.body.appendChild(body);
body.setAttribute("id", "Job");

const iframe = document.createElement('iframe');
iframe.id = 'iframe';
iframe.sandbox = 'allow-popups allow-scripts allow-same-origin allow-forms';
iframe.frameBorder = "0";
iframe.src = chrome.runtime.getURL('popup.html');
body.prepend(iframe);

const header = document.createElement('div');
header.setAttribute("id", "header");
body.prepend(header);

let isDragging = false;
let offsetX, offsetY;
let lastX, lastY;

function updatePosition() {
    if (isDragging) {
        body.style.left = `${lastX}px`;
        body.style.top = `${lastY}px`;
        requestAnimationFrame(updatePosition);
    }
}

body.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - body.offsetLeft;
    offsetY = e.clientY - body.offsetTop;
    document.body.style.userSelect = 'none';
    requestAnimationFrame(updatePosition);
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
    lastX = e.clientX - offsetX;
    lastY = e.clientY - offsetY;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.userSelect = '';
});