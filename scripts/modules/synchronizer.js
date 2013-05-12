var Synchronizer = {
	
	updateProfile: function () {

        var profile = {
            id:  IndexedDB.user_id,
            language: navigator.language,
            agent: navigator.userAgent,
            timestamp: new Date().getTime()
        };
        
        DataContext.profile = profile;
        
        IndexedDB.updateDB("user_profiles",profile);

                 
          /*Communication.webSocket('http://localhost:3001',function(data){

	           $scope.text = data;
	           $scope.$apply();
	       
	           $("#inputText").change(function(){
	        
	           var value = $(this).val();
	        
	        Communication.socket.emit('request', 
	        {
	           action:"text changed", 
	           text: value
	        });
	       
          
       });
       
       Communication.serverSendEvent("/request",function(data){
	       
	       $scope.data = data;
	       
       });*/

    },
    
     addUsage: function () {
     
        GeoLocation.getPosition(function (position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
         
         
         var usage = {
            timestamp: new Date().getTime(),
            user_id: IndexedDB.user_id,
            windowwidth: $(window).width(),
            windowheight: $(window).height(),
            latitude: latitude,
            longitude: longitude,
            topic: DataContext.topics,
            data: DataContext.usage

        };
        
         IndexedDB.insertDB("user_usages",usage);
        
       
        
        });  
    },
    
    updatePreference: function() {

        var preference = {
            user_id: IndexedDB.user_id,
            topic: DataContext.topics,
            timestamp: new Date().getTime()
        };
        
         DataContext.preference = preference;
         
         IndexedDB.updateDB("user_preferences",preference);
        
    }

	
}