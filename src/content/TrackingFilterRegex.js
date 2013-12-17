
TrackingFilterRegex = function()
{
    this.name = null;
    this.regexString = null;
    this.regex = null;
    this.isActive = true;
    this.domain = null;
    
    this.initWithData = function( data )
    {
        this.name = data.name;
        this.domain = data.domain;
        this.regexString = "^http(s?):\/\/(?:[a-zA-Z-_]*\\.)?" + data.domain + '(.*?)$';
        TrackingFilterDebug.debug(this.regexString);
        this.isActive = (data.isActive !== false);
        this.regex = new RegExp(this.regexString, "i");
    };
            
    this.match = function( location )
    {
        return (this.isActive && this.regex && this.regex.test(location));
    };
            
    this.toString = function()
    {
        return "[" + this.name + " (" + this.regexString + ")]";
    };
    
    this.toDict = function()
    {
        return {
            "name": this.name,
            "regexString": this.regexString,
            "regex": this.regex,
            "domain": this.domain,
            "isActive": this.isActive
        };
    }
}
