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
    let html = $(".grid").html();
    
    console.log(html)
    localStorage.setItem(localStorageKey, html)
    window.PERSIST.pollFile = "mosaic_notes__" + localStorageKey;
}

function loadBodyHTML(localStorageKey) {
    let html = localStorage.getItem(localStorageKey)
    if(html) {
        $(".grid").html(html);
        fixLayoutHandles();
        window.PERSIST.pollFile = "mosaic_notes__" + localStorageKey;
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