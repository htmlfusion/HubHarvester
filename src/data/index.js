var page = new TrackingPage();
page.refresh();

window.setInterval(function() { page.refresh(); }, 3000);

function TrackingElement () {
    this.account = null;
    this.project = null;
    this.item    = null;

    this.setAccount = function (account) {
        this.account = { 'id' : account };
        return this;
    };
    this.setItem = function (id, name) {
        this.item = { 'id' : id, 'name' : name };
        return this;
    };
    this.setProject = function (project) {
        this.project = { 'id' : project, 'name' : project };
        return this;
    };

    this.dom = function () {
        var div = document.createElement('div');
        div.className='harvest-timer';
        div.setAttribute('data-account', JSON.stringify(this.account));
        div.setAttribute('data-project', JSON.stringify(this.project));
        div.setAttribute('data-item', JSON.stringify(this.item));
        console.log(div);
        return div;
    };
}

function TrackingPage () {
    this.activePages = [
        new GitHub(),
        new HuBoard()
    ];

    this.refresh = function () {
        if (!this.trackerPresent()) {
            for(var i = 0; i < this.activePages.length; i++) {
                if (this.activePages[i].isCurrentPage()) {
                    this.activePages[i].refresh(this);
                }
            }
        }
    };
    this.addScriptElement = function (applicationName, permalink) {
        var s = document.createElement('script');
        var ph = document.getElementsByTagName('script')[0];

        s.type = 'text/javascript';
        s.innerHTML =   "window._harvestPlatformConfig = { " +
                            "'applicationName': '" + applicationName + "', " +
                            "'permalink': '" + permalink + "' " +
                        "}; " +
                        "var s = document.createElement('script');" +
                        "s.src = '//platform.harvestapp.com/assets/platform.js';" +
                        "s.async = true;" +
                        "var ph = document.getElementsByTagName('script')[0];" +
                        "ph.parentNode.insertBefore(s, ph);";
        ph.parentNode.insertBefore(s, ph);
    };
    this.trackerPresent = function() {
        return document.getElementsByClassName("harvest-timer").length > 0;
    };
}

function GitHub () {
    this.appName   = 'GitHub';
    this.permalink = 'https://github.com/%ACCOUNT_ID%/%PROJECT_ID%/%ITEM_ID%';

    this.parseElement = function () {
        var element = new TrackingElement();
        var url     = window.location.href.match(/^https:\/\/github.com\/(.*?)\/(.*?)\/(.*\d+)$/);
        var name    = document.getElementsByClassName('js-issue-title')[0].innerHTML;
        return this.addStyles(
            element.setAccount(url[1]).setProject(url[2]).setItem(url[3], name).dom()
        );
    };
    this.addStyles = function (element) {
        element.style.width      = '20px';
        element.style.height     = '26px';
        element.style.marginLeft = '5px';
        element.style.paddingTop = '5px';
        element.style.float      = 'left';
        return element;
    };
    this.refresh = function (trackingPage) {
        trackingPage.addScriptElement(this.appName, this.permalink);
        document.getElementsByClassName('gh-header-actions')[0].appendChild(this.parseElement());
    };
    this.isCurrentPage = function() {
        return window.location.href.match(/^https:\/\/github.com\/(.*?)\/(.*?)\/(.*\d+)$/);
    };
}

function HuBoard () {
    this.appName   = 'HuBoard';
    this.permalink = 'https://huboard.com/%ACCOUNT_ID%/%PROJECT_ID%#/issues/';

    this.parseElement = function () {
        var element = new TrackingElement();
        var issue_id = document.getElementsByTagName('h2')[0].getElementsByTagName('a')[0].innerText.replace('#', '');
        var issue_title = document.getElementsByTagName('h2')[0].innerText.replace('#' + issue_id, '').trim();
        var url = window.location.href.match(/^https:\/\/huboard.com\/(.*?)\/(.*?)#\/issues\/(.*\d+)$/);

        this.permalink = this.permalink + url[3];
        return this.addStyles(
            element.setAccount(url[1]).setProject(url[2]).setItem('issues/' + issue_id, issue_title).dom()
        );
    };
    this.addStyles = function(element) {
        element.style.cssFloat    = 'left';
        element.style.marginTop   = '4px';
        element.style.marginRight = '4px';
        return element;
    };
    this.refresh = function (trackingPage) {
        trackingPage.addScriptElement(this.appName, this.permalink);
        if (document.getElementsByTagName('h2').length > 0) {
            var parent = document.getElementsByTagName('h2')[0];
            parent.insertBefore(
                this.parseElement(),
                parent.firstChild
            );
        }
    };
    this.isCurrentPage = function() {
        return window.location.href.match(
            /^https:\/\/huboard.com\/.*\/.*#\/issues\/(.*\d+)$/
        );
    };
}
