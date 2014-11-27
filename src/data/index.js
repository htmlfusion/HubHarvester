updatePage();
window.setInterval(function() { updatePage(); }, 3000);

function updatePage() {
    if (document.getElementsByClassName("harvest-timer").length == 0) {
        if (window.location.href.match(/^https:\/\/github.com\/(.*?)\/(.*?)\/(.*\d+)$/))
        {
            appendGitHub();
        }
        else if (window.location.href.match(/^https:\/\/huboard.com\/.*\/.*#\/issues\/(.*\d+)$/))
        {
            appendHuboard();
        }
    }
}

function addScriptElement() {
    var s = document.createElement('script');
    var ph = document.getElementsByTagName('script')[0];

    s.type = 'text/javascript';
    s.innerHTML = "window._harvestPlatformConfig = { " +
        "'applicationName': 'GitHub', " +
        "'permalink': 'https://github.com/%ACCOUNT_ID%/%PROJECT_ID%/%ITEM_ID%', " +
        "'referral': '66lx'" +
        "}; " +
        "var s = document.createElement('script');" +
        "s.src = '//platform.harvestapp.com/assets/platform.js';" +
        "s.async = true;" +
        "var ph = document.getElementsByTagName('script')[0];" +
        "ph.parentNode.insertBefore(s, ph);";
    ph.parentNode.insertBefore(s, ph);
}
function createTrackingElement(data) {
    var div = document.createElement('div');
    div.className='harvest-timer';
    div.setAttribute('data-account', JSON.stringify({ 'id' : data.account }));
    div.setAttribute('data-project', JSON.stringify({ 'id' : data.project, 'name' : data.project }));
    div.setAttribute('data-item', JSON.stringify({ 'id' : data.id, 'name' : data.name }));
    return div;
}

function appendHuboard() {
    if (document.getElementsByTagName('h2').length > 0) {
        addScriptElement();
        var issue_id = document.getElementsByTagName('h2')[0].getElementsByTagName('a')[0].innerText.replace('#', '');
        var issue_title = document.getElementsByTagName('h2')[0].innerText.replace(' #' + issue_id, '');
        var url = window.location.href.match(/^https:\/\/huboard.com\/(.*?)\/(.*?)#\/issues\/(.*\d+)$/);
        var data = { 'account' : url[1], 'project' : url[2], 'id' : 'issues/' + issue_id, 'name' : issue_title };
        var trackingElement = createTrackingElement(data);
        trackingElement.style.cssFloat = 'left';
        trackingElement.style.marginTop = '4px';
        trackingElement.style.marginRight = '4px';
        var parent = document.getElementsByTagName('h2')[0];
        parent.insertBefore(trackingElement, parent.firstChild);
    }
}
function appendGitHub() {
    addScriptElement();
    var url = window.location.href.match(/^https:\/\/github.com\/(.*?)\/(.*?)\/(.*\d+)$/);
    var name = document.getElementsByClassName('js-issue-title')[0].innerHTML;
    var data = { 'account' : url[1], 'project' : url[2], 'id' : url[3], 'name' : name };
    var trackingElement = createTrackingElement(data);
    trackingElement.style.width = '20px';
    trackingElement.style.height = '26px';
    trackingElement.style.marginLeft = '5px';
    trackingElement.style.paddingTop = '5px';
    trackingElement.style.float = 'left';
    document.getElementsByClassName('gh-header-actions')[0].appendChild(trackingElement);
}