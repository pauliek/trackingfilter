TrackingFilterCaches = {
    
    debugModeEnabled: true,
    
    loadListIndex: function()
    {
        this.debug("Loading list index from cache");
        
        filename = this.getLocalDirectory();
        filename.append( "lists.json" );
        
        contents = this.getStringContentsFromFile( filename );
        if ( contents )
        {
            lists = JSON.parse(contents);
            return lists;
        }
        
        return null;
    },
            
    saveListIndex: function( lists )
    {
        this.debug("Saving lists to cache");
        
        filename = this.getLocalDirectory();
        filename.append( "lists.json" );

        this.createFileWithStringContents( filename, JSON.stringify( lists ) );
    },
            
    saveListToLocalCache: function( tfList )
    {
        this.debug("Saving list to cache: " + tfList.name);
        
        filename = this.getListsDirectory();
        filename.append( tfList.filename );

        this.createFileWithStringContents( filename, tfList.toJSON() );
    },
            
    saveRawListToLocalCache: function( list )
    {
        this.debug("Saving raw list to cache: " + list.name);
        
        filename = this.getListsDirectory();
        filename.append( list.filename );
        
        this.createFileWithStringContents( filename, JSON.stringify(list) );
    },
            
    loadListFromLocalCache: function( serverListConfiguration )
    {
        this.debug("Loading list from local cache for list " + serverListConfiguration.name);
        
        filename = this.getListsDirectory();
        filename.append( serverListConfiguration.filename );
        
        contents = this.getStringContentsFromFile( filename );
        if ( contents )
        {
            data = JSON.parse(contents);
            if ( data )
            {
                return data;
            }
        } 
        
        return null;
    },
            
    
            
    // AUXILIARY
    
    getLocalDirectory: function() 
    {
        var directoryService =
          Components.classes["@mozilla.org/file/directory_service;1"].
            getService(Components.interfaces.nsIProperties);
        // this is a reference to the profile dir (ProfD) now.
        var localDir = directoryService.get("ProfD", Components.interfaces.nsIFile);

        localDir.append("TrackingFilter");

        if (!localDir.exists() || !localDir.isDirectory()) {
          // read and write permissions to owner and group, read-only for others.
          localDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0774);
        }

        return localDir;
    },

    getListsDirectory: function() 
    {
        localDir = this.getLocalDirectory();

        localDir.append("lists");

        if (!localDir.exists() || !localDir.isDirectory()) {
          // read and write permissions to owner and group, read-only for others.
          localDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0774);
        }

        return localDir;
    },

    createFileWithStringContents: function( localFile, stringContents )
    {
        this.debug("Attempting to create file " + localFile.path);

        var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
               createInstance(Components.interfaces.nsIFileOutputStream);

        // write, create, truncate
        foStream.init(localFile, 0x02 | 0x08 | 0x20, 0666, 0); 

        var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
                        createInstance(Components.interfaces.nsIConverterOutputStream);
        converter.init(foStream, "UTF-8", 0, 0);
        converter.writeString( stringContents );
        converter.close(); // this closes foStream
    },

    getStringContentsFromFile: function( localFile )
    {
        this.debug("Attempting to read content from file " + localFile.path);
        
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
            this.debug("Exception occured reading file contents: " + e.message);
            return null;
        }

        return data;
    },
    
    debug: function( msg ) 
    {
        TrackingFilterDebug.debug( msg );
    }
    
};