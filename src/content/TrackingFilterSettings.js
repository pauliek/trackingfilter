TrackingFilterSettings = {
    
    getActiveBlacklistMetadata: function()
    {
        // load lists index
        listIndex = TrackingFilterCaches.loadListIndex();
        if ( listIndex != null && listIndex.length > 0 )
        {
            // get active blacklist
            for( var i=0; i < listIndex.length; i++ )
            {
                if ( listIndex[i].isDefaultList )
                {
                    return listIndex[i];
                }
            }
        }
        
        return null;
    },
            
    getBlacklistMetadataByName: function( listName )
    {
        listIndex = TrackingFilterCaches.loadListIndex();
        if ( listIndex != null && listIndex.length > 0 )
        {
            for( var i=0; i < listIndex.length; i++ )
            {
                if ( listIndex[i].name == listName )
                {
                    return listIndex[i];
                }
            }
        }
        
        return null;
    },  
            
    setActiveBlacklist: function(listName)
    {
        listIndex = TrackingFilterCaches.loadListIndex();
        if ( listIndex != null && listIndex.length > 0 )
        {
            // get active blacklist
            for( var i=0; i < listIndex.length; i++ )
            {
                listIndex[i].isDefaultList == ( listIndex[i].name == listName );
                TrackingFilterDebug.debug(listIndex[i].isDefaultList);
            }
        }
        
        this.saveListsMetadata( listIndex );
    },
    
    getCurrentBlacklist: function()
    {
        listMetadata = this.getActiveBlacklistMetadata();
        return this.getListDataByMetadata( listMetadata );
    },
            
    getListByName: function( listName )
    {
        listMetadata = this.getBlacklistMetadataByName( listName );
        return this.getListDataByMetadata( listMetadata );
    },
            
    getListDataByMetadata: function( listMetadata )
    {
        if ( listMetadata )
        {
            // am aflat, acum citesc lista efectiva
            listData = TrackingFilterCaches.loadListFromLocalCache( listMetadata );
            if ( listData )
            {
                return listData;
            }
        }
    },
    
    getLists: function()
    {
        listIndex = TrackingFilterCaches.loadListIndex();
        return listIndex;
    },
            
    saveList: function(list)
    {
        return TrackingFilterCaches.saveRawListToLocalCache(list);
    },
            
    saveListsMetadata: function( listsMetadata )
    {
        return TrackingFilterCaches.saveListIndex( listsMetadata );
    },
            
    updateConfVersion: function()
    {
        var prefService = Components.classes["@mozilla.org/preferences-service;1"]
            .getService(Components.interfaces.nsIPrefService);
        var prefs = prefService.getBranch("extensions.trackingfilter.");
    
//        if ( prefService.getPrefType('extensions.trackingfilter.confversion')){
//            val = prefs.getIntPref("confversion");
//        }else{
//            val = 0;
//        }
    
        val = Math.floor( Math.random() * 1000000 );
        prefs.setIntPref("confversion", val);
        TrackingFilterDebug.debug("Conf version updated: " + val);
    }
    
}