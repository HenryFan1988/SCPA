var DataContext = {

   topics: [],     
   news: [],  
   
   profile: null,   
   usage: null,
   preference: null,
   recommendation_pattern: null, 
   
   loadTopics: function(callback){
	    
	   $.indexedDB(IndexedDB.dbName).objectStore("user_preferences").get(IndexedDB.user_id)
	   .then(function(item){

           if(item === undefined)
           {
	            $.getJSON('../json-ld/topics.json', function(data) {
                     DataContext.topics = data.topics;
                     callback();
                   }); 
           }
           else
           {
	          DataContext.topics = item.topic; 
	          callback();
           }
       });
    },

   
    loadNews: function(callback){
	   
       $.getJSON('../json-ld/news.json', function(data) {
          DataContext.news = data.news;
          callback();
       });
   }
}

var Crew = {
	
	getData: function(){
		
		return [
         {name: "Henry", description: "web developer"},
	     {name: "Danny", description: "design developer"}
      ];
	}
	
	
	//$.microdata.json
}


var UserModel = {
	
	//predict profile
	predictProdile: function(){
		
	},
	
	//capture profile
	captureProfile: function(){
		
		
		
	}
	
	
}

