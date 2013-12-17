TrackingFilterDebug = {
    
    debugModeEnabled: true,
    
    debug: function( msg ) 
    {
        if ( this.debugModeEnabled ) 
        {
            console.log(msg);
            dump(msg + "\n");
        }
    }
}