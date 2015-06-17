chrome.storage.sync.get({
    hubHarvesterOptions: {
        GitHub: {
            activeUrl: 'https://github.com/',
            noteTemplate: '#%ITEM.ID% %ITEM.NAME%'
        },
        HuBoard: {
            activeUrl: 'https://huboard.com/',
            noteTemplate: '#%ITEM.ID% %ITEM.NAME%'
        },
        GitLab: {
            activeUrl: '',
            noteTemplate: '#%ITEM.ID% %ITEM.NAME%'
        }
    }
}, function(items) {
    function isAllowedToRun (provider) {
        for (var name in provider) {
            if (window.location.href.indexOf(provider[name].activeUrl) > -1) {
                return true;
            }
        }
        return false;
    }

    if (isAllowedToRun(items.hubHarvesterOptions)) {
        var page = new TrackingPage(items.hubHarvesterOptions).refresh();
        window.setInterval(function() { page.refresh(); }, 3000);
    }
});

function TrackingElement (noteTemplate) {
    this.noteTemplate = noteTemplate;
    this.account      = { id: null, name: null };
    this.project      = { id: null, name: null };
    this.item         = { id: null, name: null };

    this.setAccount = function (account) {
        this.account = { 'id' : account, 'name': account };
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
        div.setAttribute('data-item', JSON.stringify(
            { id : this.item.id, name: this.parseNoteTemplate() }
        ));
        return div;
    };
    this.parseNoteTemplate = function () {
        return this.noteTemplate
            .replace('%ITEM.ID%', this.item.id.replace('issues/', '').replace('pull/', ''))
            .replace('%ITEM.NAME%', this.item.name)
            .replace('%ACCOUNT.ID%', this.account.id)
            .replace('%ACCOUNT.NAME%', this.account.name)
            .replace('%PROJECT.ID%', this.project.id)
            .replace('%PROJECT.NAME%', this.project.name);
    }
}

function TrackingPage (provider) {
    this.activePages = [];

    for (var name in provider) {
        switch (name) {
            case 'GitHub':
                this.activePages.push(new GitHub(new TrackingElement(provider[name].noteTemplate)));
                break;
            case 'HuBoard':
                this.activePages.push(new HuBoard(new TrackingElement(provider[name].noteTemplate)));
                break;
            case 'GitLab':
                this.activePages.push(new GitLab(
                    new TrackingElement(provider[name].noteTemplate),
                    provider[name].activeUrl
                ));
                break;
        }
    }

    this.refresh = function () {
        if (!this.trackerPresent()) {
            for(var i = 0; i < this.activePages.length; i++) {
                this.activePages[i].refresh(this);
            }
        }
        return this;
    };
    this.addScriptElement = function (applicationName) {
        var s = document.createElement('script');
        var ph = document.getElementsByTagName('script')[0];

        s.type = 'text/javascript';
        s.innerHTML =   "window._harvestPlatformConfig = { " +
        "'applicationName': '" + applicationName + "', " +
        "'permalink': '" + window.location.href + "' " +
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

function GitHub (trackingElement) {
    this.element   = trackingElement;
    this.appName   = 'GitHub';

    this.parseElement = function () {
        var url     = window.location.href.split('#')[0].match(/^https:\/\/github.com\/(.*?)\/(.*?)\/(.*\d+)$/);
        var name    = document.getElementsByClassName('js-issue-title')[0].innerHTML;

        return this.element.setAccount(url[1]).setProject(url[2]).setItem(url[3], name);
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
        if (this.isCurrentPage()) {
            trackingPage.addScriptElement(this.appName);

            var trackingElement = this.parseElement();
            var domElement      = this.addStyles(trackingElement.dom());

            document.getElementsByClassName('gh-header-actions')[0].appendChild(domElement);
        }
    };
    this.isCurrentPage = function() {
        return window.location.href.match(/^https:\/\/github.com\/(.*?)\/(.*?)\/(.*\d+)$/);
    };
}

function HuBoard (trackingElement) {
    this.element   = trackingElement;
    this.appName   = 'HuBoard';

    this.parseElement = function () {
        var issue_id = document.getElementsByTagName('h2')[0].getElementsByTagName('a')[0].innerText.replace('#', '');
        var issue_title = document.getElementsByTagName('h2')[0].innerText.replace('#' + issue_id, '').trim();
        var url = window.location.href.match(/^https:\/\/huboard.com\/(.*?)\/(.*?)#\/issues\/(.*\d+)/);

        return this.element.setAccount(url[1]).setProject(url[2]).setItem('issues/' + issue_id, issue_title);
    };
    this.addStyles = function(element) {
        element.style.cssFloat    = 'left';
        element.style.marginTop   = '4px';
        element.style.marginRight = '4px';
        return element;
    };
    this.refresh = function (trackingPage) {
        if (this.isCurrentPage() && document.getElementsByTagName('h2').length > 0) {
            trackingPage.addScriptElement(this.appName);

            var trackingElement = this.parseElement();
            var domElement      = this.addStyles(trackingElement.dom());

            var parent = document.getElementsByTagName('h2')[0];
            parent.insertBefore(domElement, parent.firstChild);
        }
    };
    this.isCurrentPage = function() {
        return window.location.href.match(/^https:\/\/huboard.com\/.*\/.*#\/issues\/(.*\d+)/);
    };
}

function GitLab (trackingElement, activeUrl) {
    this.element   = trackingElement;
    this.activeUrl = activeUrl;
    this.appName   = 'GitLab';

    this.parseElement = function () {
        var url     = window.location.href.match(new RegExp('^' + this.activeUrl + '(.*)/(.*)/(.*\\d+)$'));
        var name    = document.getElementsByClassName('box-title')[0].innerHTML.trim();

        return this.element.setAccount(url[1]).setProject(url[2]).setItem(url[3], name);
    };
    this.addStyles = function(element) {
        element.style.display = 'inline-block';
        element.style.float = 'right';
        element.style.width = '10px';
        element.style.height = '18px';
        element.style.textAlign = 'center';
        element.style.verticalAlign = 'middle';
        element.style.padding = '6px 12px';
        element.style.lineHeight = '18px';
        element.style.fontSize = '13px';
        element.style.cursor = 'pointer';
        element.style.marginBottom = '0';
        return element;
    };
    this.refresh = function (trackingPage) {
        if (this.isCurrentPage()) {
            trackingPage.addScriptElement(this.appName);

            var trackingElement = this.parseElement();
            var domElement      = this.addStyles(trackingElement.dom());

            document.getElementsByClassName('page-title')[0].getElementsByClassName('pull-right')[0].appendChild(domElement);
        }
    };
    this.isCurrentPage = function() {
        if (this.activeUrl == '') {
            return false;
        }

        return window.location.href.match(
            new RegExp('^' + this.activeUrl + '.*/.*/issues/(.*\\d+)$')
        );
    };
}