const stopWord = [
    "科技", "股份", "公司", "有限", "企業",
    "集團", "國際", "家庭", "online", "網路",
    "股", "資訊", "服務", "社", "分公司", "台灣"
];

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if(!tabs[0]) return;
    chrome.scripting.executeScript(
        {
            target: { tabId: tabs[0].id },
            function: () => {
                let h1 = document.querySelector("h1");
                return h1 ? h1.textContent : "";
            }
        },
        (res) => {
             if(res && res[0]) {
                 serviceManager(res[0].result);
             } else {
                 serviceManager("");
             }
        }
    );
});

function serviceManager(query) {
    let newQuery = processQuery(query).trim();

    // Sync the processed query to the header input in content script
    window.parent.postMessage({ type: 'updateQuery', query: newQuery }, "*");

    if (!newQuery) {
        document.getElementById("Soft Job Loader").setAttribute("style", "display:none");
        document.getElementById("Tech Job Loader").setAttribute("style", "display:none");
        document.getElementById("Gossiping Job Loader").setAttribute("style", "display:none");
        document.getElementById("Soft-Job-Content").innerHTML = "<p style='padding:15px;text-align:center;'>沒有擷取到有效的公司名稱，請從上方搜尋框輸入！</p>";
        document.getElementById("Tech-Job-Content").innerHTML = "<p style='padding:15px;text-align:center;'>沒有擷取到有效的公司名稱，請從上方搜尋框輸入！</p>";
        document.getElementById("Gossiping-Job-Content").innerHTML = "<p style='padding:15px;text-align:center;'>沒有擷取到有效的公司名稱，請從上方搜尋框輸入！</p>";
        return;
    }

    search_soft_job(newQuery, 1);
    search_tech_job(newQuery, 1);
    checkOver18AndSearchGossiping(newQuery, 1);
}

function processQuery(query) {
    if(!query) return "";
    query = query.toString().toLowerCase().replace(/(~|`|!|@|#|$|%|^|&|\*|\(|\)|{|}|\[|\]|;|:|\"|'|<|,|\.|>|\?|\/|\\|\||-|_|\+|=)/g, " ")
    for (let word of stopWord) {
        query = query.toString().replace(word, '');
    }
    return query;
}

function renderResults(htmlText, containerId) {
    var response = document.implementation.createHTMLDocument().documentElement;
    response.innerHTML = htmlText;
    let array = response.getElementsByClassName("r-ent");
    let parent = document.getElementById(containerId);

    if (array.length === 0) {
        parent.innerHTML = "<p style='padding:15px;text-align:center;'>沒有搜尋到相關資料</p>";
        return;
    }

    for (let index = 0; index < array.length; index++) {
        let card = document.createElement("div");
        card.setAttribute("class", "card");
        let cardContainer = document.createElement("div");
        cardContainer.setAttribute("class", "container");

        let a = document.createElement("a");
        let titleDiv = array[index].getElementsByClassName("title")[0];
        let titleAnchor = titleDiv.getElementsByTagName("a")[0];
        
        if(!titleAnchor) continue; 

        var title = document.createTextNode(titleDiv.textContent.replace(/\s/g, ''));
        a.setAttribute("href", "https://www.ptt.cc/" + titleAnchor.getAttribute("href").replace(/\s/g, ''));
        a.setAttribute("target", "_blank");
        a.appendChild(title);

        let nrec = array[index].getElementsByClassName("nrec")[0].textContent.replace(/\s/g, '');
        let dateObj = array[index].getElementsByClassName("date")[0].textContent.replace(/\s/g, '');

        let p = document.createElement("p");
        p.textContent = "推文數：" + (nrec || '0') + " 日期：" + dateObj;

        cardContainer.appendChild(a);
        cardContainer.appendChild(p);
        card.appendChild(cardContainer);
        parent.appendChild(card);
    }
}

function search_soft_job(query, pageNum) {
    let queryElement = document.getElementById("Job Query");
    queryElement.value = query.replace(/\s/g, '');

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == XMLHttpRequest.DONE) {
            document.getElementById("Soft Job Loader").setAttribute("style", "display:none");
            renderResults(xmlHttp.responseText, "Soft-Job-Content");
        }
    }
    xmlHttp.onerror = function () {
        document.getElementById("Soft Job Loader").setAttribute("style", "display:none");
        document.getElementById("Soft-Job-Content").innerHTML = "request error";
    };
    xmlHttp.open("GET", "https://www.ptt.cc/bbs/Soft_Job/search?page=" + pageNum + "&q=" + query, true);
    xmlHttp.send(null);
}

function search_tech_job(query, pageNum) {
    let queryElement = document.getElementById("Job Query");
    queryElement.value = query.replace(/\s/g, '');

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == XMLHttpRequest.DONE) {
            document.getElementById("Tech Job Loader").setAttribute("style", "display:none");
            renderResults(xmlHttp.responseText, "Tech-Job-Content");
        }
    }
    xmlHttp.onerror = function () {
        document.getElementById("Tech Job Loader").setAttribute("style", "display:none");
        document.getElementById("Tech-Job-Content").innerHTML = "request error";
    };
    xmlHttp.open("GET", "https://www.ptt.cc/bbs/Tech_Job/search?page=" + pageNum + "&q=" + query, true);
    xmlHttp.send(null);
}

let over18Checked = false;
function checkOver18AndSearchGossiping(query, pageNum) {
    const doSearch = () => {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == XMLHttpRequest.DONE) {
                document.getElementById("Gossiping Job Loader").setAttribute("style", "display:none");
                renderResults(xmlHttp.responseText, "Gossiping-Job-Content");
            }
        }
        xmlHttp.onerror = function () {
            document.getElementById("Gossiping Job Loader").setAttribute("style", "display:none");
            document.getElementById("Gossiping-Job-Content").innerHTML = "request error";
        };
        xmlHttp.open("GET", "https://www.ptt.cc/bbs/Gossiping/search?page=" + pageNum + "&q=" + query, true);
        xmlHttp.send(null);
    };

    if (over18Checked) {
        doSearch();
    } else {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://www.ptt.cc/ask/over18", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                over18Checked = true;
                doSearch();
            }
        };
        xhr.send("from=%2Fbbs%2FGossiping%2Fsearch&yes=yes");
    }
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === "searchFromHeader") {
            document.getElementById("Job Query").value = request.query;
            document.getElementById("Ptt-Page").textContent = 1;
            researchJob();
        }
    });

    document.getElementById("Research Job").addEventListener('click', function () {
        document.getElementById("Ptt-Page").textContent = 1;
        researchJob();
    });

    document.getElementById("Job Query").addEventListener('keyup', function (event) {
        if (event.keyCode === 13) {
            document.getElementById("Ptt-Page").textContent = 1;
            researchJob();
        }
    });

    document.getElementById("pre-page").addEventListener('click', function () {
        let pageNum = parseInt(document.getElementById("Ptt-Page").textContent);
        if (pageNum > 1) {
            document.getElementById("Ptt-Page").textContent = pageNum - 1;
            researchJob();
        }
    });

    document.getElementById("next-page").addEventListener('click', function () {
        let pageNum = parseInt(document.getElementById("Ptt-Page").textContent);
        document.getElementById("Ptt-Page").textContent = pageNum + 1;
        researchJob();
    });
});

function researchJob() {
    let newQuery = document.getElementById("Job Query").value;
    let pageNum = document.getElementById("Ptt-Page").textContent;

    document.getElementById("Soft-Job-Content").innerHTML = "";
    document.getElementById("Tech-Job-Content").innerHTML = "";
    document.getElementById("Gossiping-Job-Content").innerHTML = "";

    document.getElementById("Soft Job Loader").setAttribute("style", "display:flex");
    document.getElementById("Tech Job Loader").setAttribute("style", "display:flex");
    document.getElementById("Gossiping Job Loader").setAttribute("style", "display:flex");
    
    // Sync to parent if possible, but keep simple
    window.parent.postMessage({ type: 'updateQuery', query: newQuery }, "*");

    search_soft_job(newQuery, pageNum);
    search_tech_job(newQuery, pageNum);
    checkOver18AndSearchGossiping(newQuery, pageNum);
}