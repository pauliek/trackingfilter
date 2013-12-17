var TrackingFilter = {}

TrackingFilter.currentBlacklist = null;
TrackingFilter.prefs = null;
TrackingFilter.observerRegistered = false;

TrackingFilter.init = function()
{
    TrackingFilter.debug("TrackingFilter init");
    TrackingFilter.initPrefs();
    //TrackingFilter.loadDomains();
    TrackingFilter.loadListConfiguration();
};

TrackingFilter.finishInit = function()
{
    TrackingFilter.debug("Finish init");
    TrackingFilter.currentBlacklist = TrackingFilterListConfiguration.getActiveBlacklist();
    if ( !TrackingFilter.observerRegistered )
    {
        TrackingFilter.addHTTPObserver();
    }
    setTimeout( TFUpdateStatusBarMenu, 500); //in overlay.js
};

TrackingFilter.observeHTTP = function( aSubject, aTopic, aData )
{
    aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);
    if (TrackingFilter.isLocationInBlacklist( aSubject.URI.spec ) )
    {
        TrackingFilter.debug("Blocked " + aSubject.URI.spec);
        aSubject.loadFlags = Components.interfaces.nsICachingChannel.LOAD_ONLY_FROM_CACHE;
        aSubject.cancel(Components.results.NS_ERROR_FAILURE);
    }
}

TrackingFilter.observePrefs = function( aSubject, aTopic, aData )
{
    TrackingFilter.debug("Updated preference: " + aData);
    switch( aData )
    {
        case "confversion":
            TrackingFilter.reloadListConfiguration();
            break;
    }
}

TrackingFilter.observe = function( aSubject, aTopic, aData )
{
    if (aTopic == 'http-on-modify-request')
    {
        TrackingFilter.observeHTTP(aSubject, aTopic, aData);
    }else if ( aTopic == "nsPref:changed" )
    {
        TrackingFilter.observePrefs( aSubject, aTopic, aData );
    }
};

TrackingFilter.isLocationInBlacklist = function( location )
{
    if ( TrackingFilter.currentBlacklist )
    {
        return TrackingFilter.currentBlacklist.match(location);
    }
};

TrackingFilter.initPrefs = function()
{
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefService)
        .getBranch("extensions.trackingfilter.");
    this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch);
    this.prefs.addObserver("", this, false);
}

TrackingFilter.addHTTPObserver = function()
{
    // Add our observer
    var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
    observerService.addObserver(TrackingFilter, "http-on-modify-request", false);
    TrackingFilter.debug("TrackingFilter HTTP observer registered");
    TrackingFilter.observerRegistered = true;
}

TrackingFilter.loadListConfiguration = function()
{
    TrackingFilterListConfiguration.startLoadingLists();
}

TrackingFilter.reloadListConfiguration = function()
{
    TrackingFilter.debug("Reloading list configuration");
    TrackingFilterListConfiguration.reloadListsFromLocalCache();
}

//TrackingFilter.loadDomains = function()
//{
//    var req = new XMLHttpRequest();
//    req.open('GET', TrackingFilter.domainFile, false);
//    req.onreadystatechange = function(e) {
//        if (req.readyState == 4 && (req.status == 200 || req.status == 0)) {
//            TrackingFilter.domainList = JSON.parse( req.responseText );
//            TrackingFilter.finishInit();
//        }
//    };
//    req.send(null);
//};
//
//TrackingFilter.initializeRegexes = function()
//{
//    for(var i=0; i < this.domainList.length; i++)
//    {
//        var tf = new TrackingFilterRegex();
//        tf.initWithData( this.domainList[i] )
//        TrackingFilter.blacklistRegexes.push( tf );
//        TrackingFilter.debug( tf.toString() );
//    }
//}

TrackingFilter.getLocalDirectory = function() 
{
    var directoryService =
      Cc["@mozilla.org/file/directory_service;1"].
        getService(Ci.nsIProperties);
    // this is a reference to the profile dir (ProfD) now.
    var localDir = directoryService.get("ProfD", Ci.nsIFile);

    localDir.append("TrackingFilter");

    if (!localDir.exists() || !localDir.isDirectory()) {
      // read and write permissions to owner and group, read-only for others.
      localDir.create(Ci.nsIFile.DIRECTORY_TYPE, 0774);
    }

    return localDir;
};

TrackingFilter.getListsDirectory = function() 
{
    localDir = TrackingFilter.getLocalDirectory();

    localDir.append("lists");

    if (!localDir.exists() || !localDir.isDirectory()) {
      // read and write permissions to owner and group, read-only for others.
      localDir.create(Ci.nsIFile.DIRECTORY_TYPE, 0774);
    }

    return localDir;
};

TrackingFilter.createFileWithStringContents = function( localFile, stringContents )
{
    TrackingFilter.debug("Attempting to create file " + localFile.path);

    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
           createInstance(Components.interfaces.nsIFileOutputStream);

    // write, create, truncate
    foStream.init(localFile, 0x02 | 0x08 | 0x20, 0666, 0); 

    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
                    createInstance(Components.interfaces.nsIConverterOutputStream);
    converter.init(foStream, "UTF-8", 0, 0);
    converter.writeString( stringContents );
    converter.close(); // this closes foStream
};

TrackingFilter.getStringContentsFromFile = function( localFile )
{
    TrackingFilter.debug("Attempting to load string contents from file " + localFile.path);
    
    var data = "";
    
    try{
    
        var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].
                  createInstance(Components.interfaces.nsIFileInputStream);
        var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
                      createInstance(Components.interfaces.nsIConverterInputStream);
        fstream.init(localFile, -1, 0, 0);
        cstream.init(fstream, "UTF-8", 0, 0); // you can use another encoding here if you wish

        var str = {};
        var read = 0;
        do { 
            read = cstream.readString(0xffffffff, str); // read as much as we can and put it in str.value
            data += str.value;
        } while (read != 0);

        cstream.close(); // this closes fstream
    } catch(e)
    {
        TrackingFilter.debug("Exception occured reading file contents: " + e.message);
        return null;
    }
    
    return data;
};

TrackingFilter.debug = function( msg ) 
{
    TrackingFilterDebug.debug(msg);
};