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

const dragHandle = document.createElement('div');
dragHandle.setAttribute("id", "drag-handle");
header.appendChild(dragHandle);

const searchContainer = document.createElement('div');
searchContainer.setAttribute("id", "outer-search-container");
searchContainer.innerHTML = `
    <input type="text" id="outer-job-query" placeholder="以公司名搜尋...">
    <button id="outer-job-search-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    </button>
`;
header.appendChild(searchContainer);

searchContainer.addEventListener('mousedown', (e) => {
    e.stopPropagation(); // prevent iframe dragging
});

const doSearch = () => {
    let q = document.getElementById('outer-job-query').value;
    chrome.runtime.sendMessage({ action: "searchFromHeader", query: q });
};

document.getElementById('outer-job-search-btn').addEventListener('click', doSearch);
document.getElementById('outer-job-query').addEventListener('keyup', (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
        doSearch();
    }
});

// Update input value when popup.js auto-fetches the query
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'updateQuery') {
        document.getElementById('outer-job-query').value = event.data.query;
    }
});

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