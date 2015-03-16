function parse_form_data(form) {
    var data = {};

    for ( var i = 0; i < form.elements.length; i++ ) {
        var value = form.elements[i].value;
        var names = form.elements[i].name.split('_');

        if (names[0] != '') {
            if (!data[names[0]]) {
                data[names[0]] = {};
            }
            data[names[0]][names[1]] = value;
        }
    }
    return data;
}

function save_options() {
    chrome.storage.sync.set({
        hubHarvesterOptions: parse_form_data(document.getElementById('hubHarvesterOptions'))
    }, function() {
        window.close();
    });
}

function reset_options() {
    chrome.storage.sync.remove(['hubHarvesterOptions']);
}

function restore_options() {
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
    }, function(provider) {
        for (var name in provider.hubHarvesterOptions) {
            document.getElementById(name + '_activeUrl').value    = provider.hubHarvesterOptions[name].activeUrl;
            document.getElementById(name + '_noteTemplate').value = provider.hubHarvesterOptions[name].noteTemplate;
        }

        document.getElementById('save').onclick = save_options;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);