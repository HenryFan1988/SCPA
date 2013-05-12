


function TopicController($scope,$location)
{     
    $scope.loader = {
	    text: "Loading Topics...",
	    hide: false
    };

    if($scope.topics == undefined)
    {
        IndexedDB.init(function(){
	        
	        $scope.loader.hide = true;	
	        $scope.topics = DataContext.topics; 
	        $scope.$apply(); 
	        
        });
        
         
    }
       
       
    $scope.delete = function(){

       IndexedDB.deleteDB();    

    };

    $scope.submit = function(){
    
        console.log("Loading time start: " + new Date().getTime());
    
        var t = $.microdata.json($("#topic_list li"), function (o)    
        { 
           return o; 
        });
        
        var p = jQuery.map(t.items, function(n, i){
         return {name: n.properties.name[0], range: n.properties.value[0]};
        });
        
        DataContext.topics = p;
        
         Synchronizer.updateProfile();
	         
	     Synchronizer.updatePreference();
	     
	     $location.path("/news");

    };
}

function NewsController($scope, $location,$routeParams)
{
    
     $scope.loader = {
	    text: "Loading News...",
	    hide: false
    };
    
    

    if($scope.feed == undefined)
    {
        
       Recommendation.init(function(){

            
            var pattern = PatternGenerator.generate();

            $.ajax({
            type: "POST",
            dataType: "json",
            url: "model/recommendation.php",
            data: {pattern: pattern, topics: DataContext.topics},
            success: function(data){
            console.log(data);
                data = data.sort(function(a,b){return b.score - a.score;});
            
                $scope.feed =  data; 
	            $scope.loader.hide = true;	 
	             $scope.$apply();      
            },
            error: function(e){
                console.log(e.message);
            }
   
   
      });
	            
	              
      }); 
    }
    
    $scope.click = function(target){

	  DataContext.usage = $.microdata.json($("ul#news_feed li:eq(" + target.$index + ")"), function (o)    
    { 
       return o; 
    });
	    Synchronizer.addUsage();   
    };
        
    $scope.back = function(){

	    $location.path("/");
    };
    
}
