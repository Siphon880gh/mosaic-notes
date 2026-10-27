var PERSIST = {
    pollFile: ""
}

/**
 * 
 * TODO: Implement saving a list of local storage keys you can access
 * So you can dropdrop select a storage key to load that HTML's boxes
 * Also implement user creating new keys
 * 
 */
function saveBodyHTML(localStorageKey) {
    const prepend = "mosaic_notes__"
    let html = $(".grid").html();
    
    console.log(html)
    localStorage.setItem(prepend+localStorageKey, html)
    window.PERSIST.pollFile = localStorageKey;
    window.history.pushState("","", "#"+localStorageKey);
    window.document.title = "MOS - "+localStorageKey
}

function listSavedFiles() {
    const prepend = "mosaic_notes__";
    const names = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || key.indexOf(prepend) !== 0) continue;
        if (key.indexOf(prepend + "_page_view") === 0) continue;
        if (key === prepend + "tour_invited") continue;
        names.push(key.substr(prepend.length));
    }
    names.sort(function (a, b) {
        return a.localeCompare(b);
    });
    return names;
}

function deleteSavedFile(localStorageKey) {
    const prepend = "mosaic_notes__"
    localStorage.removeItem(prepend+localStorageKey)
    if (window.PERSIST.pollFile === localStorageKey) window.PERSIST.pollFile = "";
    // Drop the #file from the URL so a reload doesn't try to reopen it
    if (window.location.hash.substr(1) === localStorageKey) {
        window.history.replaceState("", "", window.location.pathname + window.location.search);
        window.document.title = "Mosaic Notes"
    }
    if (typeof renderFilesList === "function" && document.getElementById("files-list")) renderFilesList();
}

function loadBodyHTML(localStorageKey) {
    const prepend = "mosaic_notes__"
    let html = localStorage.getItem(prepend+localStorageKey)
    if(html) {
        $(".grid").html(html);
        fixLayoutHandles();
        window.PERSIST.pollFile = localStorageKey;
        window.history.pushState("","", "#"+localStorageKey);
        window.document.title = "MOS - "+localStorageKey
    } else {
        displayMessage("Error", `No such saved file: ${localStorageKey}.`, "red")
    }
}

/**
 * Example uses:
saveBodyHTML("mosaic__data1")
loadBodyHTML("mosaic__data1")
* 
*/

/**
 * Command prompt method of syncing data across
 */

function exportBodyHTML() {
    let html = $(".grid").html();
    console.log(html);
}

function importBodyHTML(importedContents) {
    console.log(importedContents);
    $(".grid").html(importedContents);
    fixLayoutHandles();
}