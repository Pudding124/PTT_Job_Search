// var bkg = chrome.extension.getBackgroundPage();
const stopWord = [
    "科技", "股份", "公司", "有限", "企業",
    "集團", "國際", "家庭", "online", "網路",
    "股", "資訊", "服務", "社", "分公司", "台灣"
];


chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // console.log('tabs', tabs);
    var tab = tabs[0];
    tab_title = tab.title;
    chrome.tabs.executeScript(tab.id, {
        code: 'document.querySelector("h1").textContent'
    }, serviceManager);
});

function serviceManager(query) {
    let newQuery = processQuery(query);
    search_soft_job(newQuery);
    search_tech_job(newQuery);
}

function processQuery(query) {
    // 去除標點符號，與變換成小寫
    query = query.toString().toLowerCase().replace(/(~|`|!|@|#|$|%|^|&|\*|\(|\)|{|}|\[|\]|;|:|\"|'|<|,|\.|>|\?|\/|\\|\||-|_|\+|=)/g, " ")
    // bkg.console.log('not process query: ' + query);
    for (let word of stopWord) {
        query = query.toString().replace(word, '');
    }
    return query;
}

function search_soft_job(query) {

    // let english_query = query.toString().replace(/[^A-Za-z0-9]+/g, ' ');
    // let chinese_query = query.toString().replace(/[^\u4e00-\u9fa5]/g, '');

    // 預設查詢
    let queryElement = document.getElementById("Job Query");
    queryElement.value = query.replace(/\s/g, '');
    // bkg.console.log('job query: ' + query);

    // request 
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == XMLHttpRequest.DONE) {
            let loader = document.getElementById("Soft Job Loader");
            draw_Soft_Compoment(xmlHttp.responseText);
            loader.setAttribute("style", "display:none");
        }
    }
    xmlHttp.onerror = function(e) {
        let originSoftJobResult = document.getElementById("Soft-Job-Content");
        originSoftJobResult.innerHTML = "herokuapp request error";
    };
    xmlHttp.open("GET", "https://www.ptt.cc/bbs/Soft_Job/search?q=" + query, true); // false for synchronous request
    xmlHttp.send(null);
}

function draw_Soft_Compoment(htmlText) {
    // 每筆回傳結果
    var response = document.implementation.createHTMLDocument().documentElement;
    response.innerHTML = htmlText;
    let array = response.getElementsByClassName("r-ent");

    // create UI
    let parent = document.getElementById("Soft-Job-Content");
    for (let index = 0; index < array.length; index++) {
        let card = document.createElement("div");
        card.setAttribute("class", "card");
        let cardContainer = document.createElement("div");
        cardContainer.setAttribute("class", "container");

        let a = document.createElement("a");
        let br = document.createElement("br");
        var title = document.createTextNode(array[index].getElementsByClassName("title")[0].textContent.replace(/\s/g, ''));
        a.setAttribute("href", "https://www.ptt.cc/" + array[index].getElementsByClassName("title")[0].getElementsByTagName("a")[0].getAttribute("href").replace(/\s/g, ''));
        a.setAttribute("target", "_blank");
        a.appendChild(br);
        a.appendChild(title);

        let p = document.createElement("p");
        p.textContent = "推文數：" + array[index].getElementsByClassName("nrec")[0].textContent.replace(/\s/g, '') + " 日期：" + array[index].getElementsByClassName("date")[0].textContent.replace(/\s/g, '');

        cardContainer.appendChild(a);
        cardContainer.appendChild(p);
        card.appendChild(cardContainer);
        parent.appendChild(card);
    }
}

function search_tech_job(query) {

    // 預設查詢
    let queryElement = document.getElementById("Job Query");
    queryElement.value = query.replace(/\s/g, '');
    // bkg.console.log('job query: ' + query);

    // request 
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == XMLHttpRequest.DONE) {
            let loader = document.getElementById("Tech Job Loader");
            loader.setAttribute("style", "display:none");
            draw_Tech_Compoment(xmlHttp.responseText);
        }
    }
    xmlHttp.onerror = function(e) {
        let originTechJobResult = document.getElementById("Tech-Job-Content");
        originTechJobResult.innerHTML = "herokuapp request error";
    };
    xmlHttp.open("GET", "https://www.ptt.cc/bbs/Tech_Job/search?q=" + query, true); // false for synchronous request
    xmlHttp.send(null);
}

function draw_Tech_Compoment(htmlText) {
    // 每筆回傳結果
    var response = document.implementation.createHTMLDocument().documentElement;
    response.innerHTML = htmlText;
    let array = response.getElementsByClassName("r-ent");

    // create UI
    let parent = document.getElementById("Tech-Job-Content");
    for (let index = 0; index < array.length; index++) {
        let card = document.createElement("div");
        card.setAttribute("class", "card");
        let cardContainer = document.createElement("div");
        cardContainer.setAttribute("class", "container");

        let a = document.createElement("a");
        let br = document.createElement("br");
        var title = document.createTextNode(array[index].getElementsByClassName("title")[0].textContent.replace(/\s/g, ''));
        a.setAttribute("href", "https://www.ptt.cc/" + array[index].getElementsByClassName("title")[0].getElementsByTagName("a")[0].getAttribute("href").replace(/\s/g, ''));
        a.setAttribute("target", "_blank");
        a.appendChild(br);
        a.appendChild(title);

        let p = document.createElement("p");
        p.textContent = "推文數：" + array[index].getElementsByClassName("nrec")[0].textContent.replace(/\s/g, '') + " 日期：" + array[index].getElementsByClassName("date")[0].textContent.replace(/\s/g, '');

        cardContainer.appendChild(a);
        cardContainer.appendChild(p);
        card.appendChild(cardContainer);
        parent.appendChild(card);
    }
}

// 設定搜尋功能
document.addEventListener('DOMContentLoaded', function () {
    let researchJobButton = document.getElementById("Research Job");
    researchJobButton.addEventListener('click', function () {
        researchJob();
    });

    let researchJobInput = document.getElementById("Job Query");
    researchJobInput.addEventListener('keyup', function (event) {
        if(event.keyCode === 13) {
            researchJob();
        }
    });
});

function researchJob() {
    let newQuery = document.getElementById("Job Query").value;

    let originSoftJobResult = document.getElementById("Soft-Job-Content");
    let originTechJobResult = document.getElementById("Tech-Job-Content");

    let softLoader = document.getElementById("Soft Job Loader");
    let techLoader = document.getElementById("Tech Job Loader");

    originSoftJobResult.innerHTML = "";
    originTechJobResult.innerHTML = "";
    softLoader.setAttribute("style", "display:block");
    techLoader.setAttribute("style", "display:block");

    search_soft_job(newQuery);
    search_tech_job(newQuery);
}