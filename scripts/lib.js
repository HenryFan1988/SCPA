$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

var GeoLocation = {

    getPosition: function (callback) {

        navigator.geolocation.getCurrentPosition(callback, GeoLocation.error);

    },

    error: function (msg) {

        console.log(msg);

    }

}


var IndexedDB = {

    dbFactory:null,

    db:null,
    
    user_id: "user1",

    dbName: "user-model",

    init: function (callback) {

       $.indexedDB(IndexedDB.dbName, {
                "version" : 1, 
            	"schema": {
            		"1": function(versionTransaction){
            			var profile = versionTransaction.createObjectStore("user_profiles", {
            				"keyPath": "id"
            			});
            			
            			profile.createIndex("id");
            			
            			var preference = versionTransaction.createObjectStore("user_preferences", {
            				"keyPath": "user_id"
            			});
            			preference.createIndex("user_id");
            			
            			var usage = versionTransaction.createObjectStore("user_usages", {
            				"autoIncrement": true,
            				"keyPath": "timestamp"
            			});
            			usage.createIndex("timestamp");
            		},
            		// This was added in the next version of the site
            		"2": function(versionTransaction){
            			
            			
            			
            		}
            	}
            }).done(function(){
            	// Once the DB is opened with the object stores set up, show data from all tables
                 DataContext.loadTopics(callback);
            });

    },
    
       
    deleteDB: function(){
            	// Delete the database 
         $.indexedDB(IndexedDB.dbName).deleteDatabase();
    },
    
    updateDB: function(tableName,data){
    
	    var key = IndexedDB.user_id;
	    var store = $.indexedDB(IndexedDB.dbName).objectStore(tableName);
	    
	    store.delete(key).then(function(item){
	    
	        store.add(data);
	        console.log("Loading time end: " + new Date().getTime());

	       
	    });
    },
    
    insertDB: function(tableName,data)
    {
	      $.indexedDB(IndexedDB.dbName).objectStore(tableName).add(data);  
    }

   
}

var Communication = {

    socket: null,
	
	serverSendEvent: function(url,fun)
	{
		if(typeof(EventSource)!=="undefined")
        {
           var source=new EventSource(url);           
           source.onmessage=function(event)
           {
              console.log(event);
	          fun(event.data); 
           }
           
        }

	},
	
	
	webSocket: function(url,fun)
	{
		 Communication.socket = io.connect(url);
         Communication.socket.on('response', function (data) {
            fun(data);
            
            //socket.emit('my other event', { my: 'data' });
         });
	}
}
