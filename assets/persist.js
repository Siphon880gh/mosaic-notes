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
/* App settings share the "mosaic_notes__" prefix with files (e.g. "_color_sequences",
 * "_page_view"), so names starting with "_" are reserved and never treated as files. */
function isReservedFileName(name) {
    return String(name || "").charAt(0) === "_";
}

function saveBodyHTML(localStorageKey) {
    const prepend = "mosaic_notes__"
    if (isReservedFileName(localStorageKey)) {
        displayMessage("Name not allowed", "File names can't start with “_”. That's reserved for app settings.", "red", 4000);
        return false;
    }
    let html = $(".grid").html();
    
    console.log(html)
    localStorage.setItem(prepend+localStorageKey, html)
    window.PERSIST.pollFile = localStorageKey;
    window.history.pushState("","", "#"+localStorageKey);
    window.document.title = "MOS - "+localStorageKey
    return true;
}

function listSavedFiles() {
    const prepend = "mosaic_notes__";
    const names = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || key.indexOf(prepend) !== 0) continue;
        if (key === prepend + "tour_invited") continue;
        const name = key.substr(prepend.length);
        if (isReservedFileName(name)) continue;
        names.push(name);
    }
    names.sort(function (a, b) {
        return a.localeCompare(b);
    });
    return names;
}

function deleteSavedFile(localStorageKey) {
    const prepend = "mosaic_notes__"
    if (isReservedFileName(localStorageKey)) return;
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
    let html = isReservedFileName(localStorageKey) ? null : localStorage.getItem(prepend+localStorageKey)
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