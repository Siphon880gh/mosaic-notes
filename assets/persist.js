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
    if(html)
        $(".grid").html(html)
}

/**
 * Example uses:
saveBodyHTML("mosaic__data1")
loadBodyHTML("mosaic__data1")
 * 
 */