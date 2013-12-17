TrackingFilterList = function()
{
    this.TFRegexes = [];
    this.listData = null;
    this.loaded = false;
    this.name = null;
    this.filename = null;
    this.url = null;
    this.isDefaultList = false;
    
    this.initWithStringContents = function(contents)
    {
        listData = JSON.parse(contents);
        this.initWithJSONData(listData);
    };
    
    this.initWithJSONData = function(data)
    {
        this.listData = data;
        for(var i=0; i < data.length; i++)
        {
            var tf = new TrackingFilterRegex();
            tf.initWithData( data[i] )
            this.TFRegexes.push( tf );
            TrackingFilter.debug( tf.toString() );
        }
        this.loaded = true;
        this.finalizeLoading();
    };
    
    this.initFromServerListConfiguration = function( serverListConfiguration )
    {
        TrackingFilter.debug("Starting to fetch list configuration with name " + serverListConfiguration.name
                + " isDefaultList: " + serverListConfiguration.isDefaultList );
        
        if ( !this.loadListFromLocalCache( serverListConfiguration ) )
        {
        
            var that = this;

            var req = new XMLHttpRequest();

            req.open('GET', serverListConfiguration.url, true);
            req.onreadystatechange = function(e) {
                TrackingFilter.debug("Got response from server: " + req.status );
                if (req.readyState === 4 && (req.status === 200 || req.status === 0)) 
                {
                    TrackingFilter.debug("Processing response from server: " + req.responseText );
                    listData = JSON.parse(req.responseText);
                    if ( listData )
                    {
                        that.name = serverListConfiguration.name;
                        that.filename = serverListConfiguration.filename;
                        that.url = serverListConfiguration.url;
                        that.isDefaultList = serverListConfiguration.isDefaultList;

                        that.initWithJSONData( listData );
                        that.saveListToLocalCache();
                    }
                }
            };

            req.send(null);
        }
    };
    
    this.finalizeLoading = function()
    {
        if ( this.isDefaultList )
        {
            TrackingFilter.finishInit();
        }
    }
    
    this.saveListToLocalCache = function()
    {
        TrackingFilterCaches.saveListToLocalCache( this );
    },
            
    this.loadListFromLocalCache = function( serverListConfiguration )
    {
        data = TrackingFilterCaches.loadListFromLocalCache( serverListConfiguration );
        if ( data )
        {
            this.name = data.name;
            this.filename = data.filename;
            this.url = data.url;
            this.isDefaultList = data.isDefaultList;

            this.initWithJSONData( data.listData );
            return true;
        }
        
        return false;
    },
            
    this.match = function( location )
    {
        for (var i=0; i<this.TFRegexes.length; i++)
        {
            if ( this.TFRegexes[i].match( location ) )
            {
                TrackingFilter.debug("Match found in blacklist for: " + this.TFRegexes[i].toString() );
                return true;
            }
        }
        
        return false;
    },
            
    this.toJSON = function()
    {
        var data = {
            "name": this.name,
            "filename": this.filename,
            "url": this.url,
            "listData": this.tfRegexesToJSONList(),
            "isDefaultList": this.isDefaultList
        };
        return JSON.stringify(data);
    },
            
    this.toString = function()
    {
        return JSON.stringify( this.toJSON() );
    },
            
    this.tfRegexesToJSONList = function()
    {
        var tfData = [];
        for (var i=0; i < this.TFRegexes.length; i++)
        {
            d = this.TFRegexes[i].toDict();
//            TrackingFilterDebug.debug(d);
            tfData.push( d );
        }
        
        return tfData;
    }
};