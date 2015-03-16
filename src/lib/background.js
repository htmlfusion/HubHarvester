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
    var urls = [];
    for (var name in items.hubHarvesterOptions) {
        urls.push(items.hubHarvesterOptions[name].activeUrl + '*');
    }

    chrome.webRequest.onHeadersReceived.addListener(
        function (details) {
            for (i = 0; i < details.responseHeaders.length; i++) {
                if (details.responseHeaders[i].name.toUpperCase() == 'CONTENT-SECURITY-POLICY') {
                    var csp = details.responseHeaders[i].value;
                    csp = csp.replace('script-src', 'script-src https://*.harvestapp.com');
                    csp = csp.replace('img-src', 'img-src https://*.harvestapp.com');
                    csp = csp.replace('frame-src', 'frame-src https://*.harvestapp.com');
                    csp = csp.replace('style-src', 'style-src https://*.harvestapp.com');
                    csp = csp.replace('connect-src', 'connect-src https://*.harvestapp.com');
                    details.responseHeaders[i].value = csp;
                }
            }
            return { responseHeaders : details.responseHeaders };
        },
        { urls : urls, types : ["main_frame"] },
        [ "blocking", "responseHeaders" ]
    );
});