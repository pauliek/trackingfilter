function showTFPreferences() {
   prefWindow = window.open(
      'chrome://trackingfilter/content/preferences.xul','TrackingFilter-Preferences','chrome,resizable,width=600,height=480'
   );
}

function TFUpdateStatusBarMenu()
{
    currentBlacklist = TrackingFilter.currentBlacklist;
    var menupopup = window.document.getElementById("tf-status-menupopup");
    while( menupopup.firstChild )
    {
        menupopup.removeChild( menupopup.firstChild );
    }
    
    for (var i=0; i < currentBlacklist.listData.length; i++)
    {
        item = currentBlacklist.listData[i];
        menuitem = document.createElement("menuitem");
        menuitem.setAttribute("label", item.name );
        menuitem.setAttribute("type", "checkbox");
        menuitem.setAttribute("id", elementify( "menupopup_item_" + item.name) );
        if ( item.isActive )
        {
            menuitem.setAttribute("checked", true );
        }
        menuitem.setAttribute("oncommand", "TFItemChanged('" + item.name + "');");
        menupopup.appendChild(menuitem);
    }
    
    // add separator
    separator = document.createElement("menuseparator");
    menupopup.appendChild(separator);
    
    menuitem = document.createElement("menuitem");
    menuitem.setAttribute("label", "Preferences" );
    menuitem.setAttribute("id", "tf-status-preferences" );
    menuitem.setAttribute("oncommand", "showTFPreferences();" );
    menupopup.appendChild(menuitem);
}

function TFItemChanged( itemName )
{
    TrackingFilterDebug.debug("Item changed: " + itemName);
    
    var currentList = TrackingFilterSettings.getCurrentBlacklist();
    for (var i=0; i<currentList.listData.length; i++)
    {
        item = currentList.listData[i];
        TrackingFilterDebug.debug(item);
        if (item.name == itemName)
        {
            el = document.getElementById( elementify( "menupopup_item_" + item.name) );
            TrackingFilterDebug.debug(el);
            TrackingFilterDebug.debug(el.hasAttribute("checked"));
            if (el)
            {
                currentList.listData[i].isActive = el.hasAttribute("checked");
                // update
                TrackingFilterSettings.saveList( currentList );
                TrackingFilter.reloadListConfiguration();
                return;
            }
        }
    }
}

function elementify( s )
{
    s = s.replace(" ", "_");
    return s;
}