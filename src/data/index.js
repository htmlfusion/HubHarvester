chrome.storage.sync.get({
    activeUrls: [
        "https://github.com/",
        "https://huboard.com/"
    ],
    noteTemplate: '#%ISSUE.ID% %ISSUE.NAME%'
}, function(items) {
    function isAllowedToRun (activeUrls) {
        var allowed = false;
        for (var i = 0; i < activeUrls.length; i++) {
            if (window.location.href.indexOf(activeUrls[i]) > -1) {
                allowed = true;
            }
        }
        return allowed;
    }

    if (isAllowedToRun(items.activeUrls)) {
        console.log('runssss');

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

        function TrackingPage (noteTemplate) {
            this.activePages = [
                new GitHub(new TrackingElement(noteTemplate)),
                new HuBoard(new TrackingElement(noteTemplate))
            ];

            this.refresh = function () {
                if (!this.trackerPresent()) {
                    for(var i = 0; i < this.activePages.length; i++) {
                        this.activePages[i].refresh(this);
                    }
                }
                return this;
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

        function GitHub (trackingElement) {
            this.element   = trackingElement;
            this.appName   = 'GitHub';
            this.permalink = 'https://github.com/%ACCOUNT_ID%/%PROJECT_ID%/%ITEM_ID%';

            this.getAppName = function () {
                return this.appName;
            };
            this.getPermalink = function () {
                return this.permalink;
            };

            this.parseElement = function () {
                var url     = window.location.href.match(/^https:\/\/github.com\/(.*?)\/(.*?)\/(.*\d+)$/);
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
                    trackingPage.addScriptElement(this.getAppName(), this.getPermalink());

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
            this.permalink = 'https://huboard.com/%ACCOUNT_ID%/%PROJECT_ID%#/issues/';

            this.getAppName = function () {
                return this.appName;
            };
            this.getPermalink = function () {
                return this.permalink
                    + window.location.href.match(
                        /^https:\/\/huboard.com\/(.*?)\/(.*?)#\/issues\/(.*\d+)$/
                    )[3];
            };

            this.parseElement = function () {
                var issue_id = document.getElementsByTagName('h2')[0].getElementsByTagName('a')[0].innerText.replace('#', '');
                var issue_title = document.getElementsByTagName('h2')[0].innerText.replace('#' + issue_id, '').trim();
                var url = window.location.href.match(/^https:\/\/huboard.com\/(.*?)\/(.*?)#\/issues\/(.*\d+)$/);

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
                    trackingPage.addScriptElement(this.getAppName(), this.getPermalink());

                    var trackingElement = this.parseElement();
                    var domElement      = this.addStyles(trackingElement.dom());

                    var parent = document.getElementsByTagName('h2')[0];
                    parent.insertBefore(domElement, parent.firstChild);
                }
            };
            this.isCurrentPage = function() {
                return window.location.href.match(/^https:\/\/huboard.com\/.*\/.*#\/issues\/(.*\d+)$/);
            };
        }

        var page = new TrackingPage(items.noteTemplate).refresh();
        window.setInterval(function() { page.refresh(); }, 3000);
    }
});