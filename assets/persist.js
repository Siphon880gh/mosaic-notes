/**
 * 
 * TODO: Implement saving a list of local storage keys you can access
 * So you can dropdrop select a storage key to load that HTML's boxes
 * Also implement user creating new keys
 * 
 */
function saveBodyHTML(localStorageKey) {
    let html = $(".grid").html();

    html = html.replaceAll("medium-editor-element", "")
    html = html.replaceAll(`<div class="ui-resizable-handle ui-resizable-e" style="z-index: 90; display: block;"></div>`, "")
    html = html.replaceAll(`<div class="ui-resizable-handle ui-resizable-s" style="z-index: 90; display: block;"></div>`, "")
    html = html.replaceAll(`<div class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se" style="z-index: 90; display: block;"></div>`, "")
    html = html.replaceAll("ui-resizable", "")
    
    console.log(html)
    localStorage.setItem(localStorageKey, html)
}

function loadBodyHTML(localStorageKey) {
    let html = localStorage.getItem(localStorageKey)
    if(html) {
        $(".grid").html(html);
        fixLayoutHandles();
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

    html = html.replaceAll("medium-editor-element", "")
    html = html.replaceAll(`<div class="ui-resizable-handle ui-resizable-e" style="z-index: 90; display: block;"></div>`, "")
    html = html.replaceAll(`<div class="ui-resizable-handle ui-resizable-s" style="z-index: 90; display: block;"></div>`, "")
    html = html.replaceAll(`<div class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se" style="z-index: 90; display: block;"></div>`, "")
    html = html.replaceAll("ui-resizable", "")
    
    displayMessage("Open console CTRL/CMD + J for exported contents");
    console.log(html);
}

function importBodyHTML(importedContents) {
    console.log(importedContents);
    $(".grid").html(importedContents);
    fixLayoutHandles();
}