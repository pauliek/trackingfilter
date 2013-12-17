TFPreferencesEditor = {
    
    XUL_NS: "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
    currentList: null,
    
    populateAvailableLists: function()
    {
        listIndex = TrackingFilterSettings.getLists();
        if ( listIndex )
        {
            menupopup = document.getElementById("tf-preferences-lists-menupopup");
            for( var i=0; i < listIndex.length; i++ )
            {
                menuitem = document.createElementNS(this.XUL_NS, "menuitem");
                menuitem.setAttribute("label", listIndex[i].name);
                menuitem.setAttribute("value", listIndex[i].name);
                menuitem.setAttribute( "id", this.elementify( "menuitem_" + listIndex[i].name ) );
                if ( listIndex[i].isDefaultList )
                {
                    menuitem.setAttribute("selected", true);
                    document.getElementById("tf-preferences-lists").setAttribute("label", listIndex[i].name);
                }
                menupopup.appendChild(menuitem);
            }
        }
    },
    
    populateActiveFilters: function()
    {
        this.currentList = TrackingFilterSettings.getCurrentBlacklist();
        this.populateFilters( this.currentList );
    },
            
    clearFilters: function()
    {
        var groupbox = document.getElementById("tf-preferences-filters");
//        elements = menupopup.getElementsByTagName("menuitem");
        while( groupbox.firstChild )
        {
            groupbox.removeChild( groupbox.firstChild );
        }
    },
            
    populateFilters: function( list )
    {
        var groupBox = document.getElementById("tf-preferences-filters");
        
        if ( list )
        {
            for (var i=0; i < list.listData.length; i++)
            {
                tf = list.listData[i];
                checkbox = document.createElementNS( this.XUL_NS, "checkbox" );
                checkbox.setAttribute( "label", tf.name );
                checkbox.setAttribute( "id", this.elementify( "filteritem_" + tf.name ) );
                if ( tf.isActive )
                {
                    checkbox.setAttribute("checked", true);
                }
                groupBox.appendChild(checkbox);
            }
        }
    },
            
    onChangeMenuList: function()
    {
        this.clearFilters();
        
        menuList = document.getElementById("tf-preferences-lists");
        if ( menuList && menuList.selectedItem != null )
        {
            listName = menuList.selectedItem.value;
            var currentList = TrackingFilterSettings.getListByName( listName );
            this.populateFilters( currentList );
        }
    },
            
            

    onDisplay: function()
    {
        this.populateAvailableLists();
        this.populateActiveFilters();
    },
            
    save: function()
    {
        // save active list
        // save options for active list
        var menuList = document.getElementById("tf-preferences-lists");
        var groupbox = document.getElementById("tf-preferences-filters");
        
        if ( menuList )
        {
            if ( menuList.selectedItem )
            {
                listName = menuList.selectedItem.value;
                TrackingFilterSettings.setActiveBlacklist( listName );
            }else{
                listName = this.currentList.name;
            }
            
            var currentList = TrackingFilterSettings.getListByName( listName );
            if ( currentList )
            {
                // update list data (status for items)
                for (var i=0; i<currentList.listData.length; i++)
                {
                    filterName = currentList.listData[i].name;
                    
                    elem = document.getElementById( this.elementify( "filteritem_" + filterName ) );
                    
                    var isActive = false;
                    if ( elem && elem.getAttribute("checked") )
                    {
                        isActive = true;
                    }
                    
                    currentList.listData[i].isActive = isActive;
                }
                
                // resalvat lista
                TrackingFilterSettings.saveList( currentList );
                TrackingFilterSettings.updateConfVersion();
            }
        }
        
//
        //        if ( this.currentList )
//        {
//            for (var i=0; i < this.currentList.listData.length; i++)
//            {
//                this.currentList.listData[i];
//                checkbox = document.getElementById( tf.name );
//                if ( checkbox.getAttribute("checked") )
//                {
//                    this.currentList.listData[i].isActive = true;
//                }else{
//                    this.currentList.listData[i].isActive = false;
//                }
//            }
//        }
//        
        
    },
            
    elementify: function( s )
    {
        s = s.replace(" ", "_");
        return s;
    }
    
}