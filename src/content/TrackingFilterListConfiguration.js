TrackingFilterListConfiguration = {
    
    listURL: "http://www.cocei.ro/files/lists.json",
    lists: null, // json
    tfLists: [],
    loaded: false,
    
    startLoadingLists: function()
    {
        if ( this.loadListsFromLocalCache() )
        {
            TrackingFilter.debug("Found lists configuration in local cache");
            this.finalizeListLoading();
        }else
        {
            this.startLoadingListsFromServer();
        }
    },

    startLoadingListsFromServer: function()
    {
        var that = this;
        
        var req = new XMLHttpRequest();

        req.open('GET', this.listURL, true);
        req.onreadystatechange = function(e) {
            TrackingFilter.debug("Got response from server: " + req.status );
            if (req.readyState === 4 && (req.status === 200 || req.status === 0)) 
            {
                TrackingFilter.debug("Processing response from server: " + req.responseText );
                that.lists = JSON.parse(req.responseText);
                if ( that.lists )
                {
                    that.loaded = true;
                    that.finalizeListLoading();
                }
                
                that.finishedLoadingListsFromServer();
            }
        };
        
        req.send(null);
    },
            
    finishedLoadingListsFromServer: function()
    {
        // save lists status to local cache
        this.saveListsToLocalCache();
        
    },
            
    finalizeListLoading: function()
    {
        this.fetchLists();
        TrackingFilter.debug("Finished processing list configuration");
    },
            
    loadListsFromLocalCache: function()
    {
        this.lists = TrackingFilterCaches.loadListIndex();
        if (this.lists)
        {
            this.loaded = true;
            return true;
        }
        
        return false;
    },
            
    reloadListsFromLocalCache: function()
    {
        this.loadListsFromLocalCache();
        // update list contents
        this.fetchLists();
    },
            
    saveListsToLocalCache: function()
    {
        TrackingFilterCaches.saveListIndex( this.lists );
    },
            
    fetchLists: function()
    {
        TrackingFilter.debug("Starting fetching lists: " + this.lists.length);
        for(var i=0; i<this.lists.length; i++)
        {
            var tfList = new TrackingFilterList();
            this.tfLists[i] = tfList;            
            this.tfLists[i].initFromServerListConfiguration( this.lists[i] );
        }
        
    },
            
    getActiveBlacklist: function()
    {
        for(var i=0; i<this.tfLists.length; i++)
        {
            if ( this.tfLists[i].isDefaultList )
            {
                return this.tfLists[i];
            }
        }
        
        return null;
    }
};