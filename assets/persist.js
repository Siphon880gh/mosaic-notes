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
}

function loadBodyHTML(localStorageKey) {
    const prepend = "mosaic_notes__"
    let html = localStorage.getItem(prepend+localStorageKey)
    if(html) {
        $(".grid").html(html);
        fixLayoutHandles();
        window.PERSIST.pollFile = localStorageKey;
        window.history.pushState("","", "#"+localStorageKey);
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