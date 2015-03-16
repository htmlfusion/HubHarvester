function save_options() {
    chrome.storage.sync.set({
        noteTemplate: document.getElementById('noteTemplate').value
    }, function() {
        window.close();
    });
}

function restore_options() {
    chrome.storage.sync.get({
        noteTemplate: '#%ISSUE.ID% %ISSUE.NAME%'
    }, function(items) {
        document.getElementById('noteTemplate').value = items.noteTemplate;
        document.getElementById('save').onclick = save_options;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);