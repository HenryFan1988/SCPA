//PersonalizationPredictor.training();
var Recommendation = {

    data: [],
    
    pattern: {
    
      name: [],
      url: [],
      description: []
	    
    },
    
    input: {
	    
	  name: [],
      url: [],
      description: [] 
	    
    }, 
    
    spminput: {
	   
	  name: [],
      url: [],
      description: [] 
 
	    
    },
    
	init: function(callback){
	
	   $.getJSON('../json-ld/rules.json', function(data) {
       
          DRT.rules = data.rules;
          
            Recommendation.spminput.description = [];
		     Recommendation.spminput.name = [];
		     Recommendation.spminput.url = [];
		     
		     Recommendation.input.description = [];
		     Recommendation.input.name = [];
		     Recommendation.input.url = [];
		     
       $.indexedDB(IndexedDB.dbName).objectStore("user_usages").each(function(item){
	       
	       if(item.value.user_id == IndexedDB.user_id)
	       {
	         var description = item.value.data.items[0].properties.description[0].split(" ");
		     var name = item.value.data.items[0].properties.name[0].split(" ");
		     var url = item.value.data.items[0].properties.url[0].split("/");

		     
		     Recommendation.input.description = Recommendation.input.description.concat(description);
		     Recommendation.input.name = Recommendation.input.name.concat(name);
		     Recommendation.input.url = Recommendation.input.url.concat(url);
		     
		     		     
		     Recommendation.spminput.description = Recommendation.input.description;
		     Recommendation.spminput.name = Recommendation.input.name;		    
		     Recommendation.spminput.url = Recommendation.input.url;
	       }
       }).then(function(){
	       
	       
	          
	         CBF.calculateCBF();
             ARD.calculateARD();
             SPM.calculateSPM();
             DRT.calculateDRT();
             
             Recommendation.pattern.name = Recommendation.unique(Recommendation.pattern.name);
             Recommendation.pattern.url = Recommendation.unique(Recommendation.pattern.url);
             Recommendation.pattern.description = Recommendation.unique(Recommendation.pattern.description);
             
	       callback();
	       
       });
       
       

	 
	 });
 
	},
	
	unique:function(input){
		
		var uniqueArray = [];
       $.each(input, function(i, el){
          if($.inArray(el, uniqueArray) === -1 && el.length > 0) uniqueArray.push(el);
       });
       
       return uniqueArray;
	}

	
}

var PatternGenerator = {

  
	generate: function(){
	  var pattern = {
    
         name: "![\s\S]",
         url: "![\s\S]",
        description: "![\s\S]"
	    
      };
	
	 if(Recommendation.pattern.name.length > 0)
     pattern.name = Recommendation.pattern.name.join('|');
     
     if(Recommendation.pattern.url.length > 0)
     pattern.url = Recommendation.pattern.url.join('|');
     
     if(Recommendation.pattern.description.length > 0)
     pattern.description = Recommendation.pattern.description.join('|');
	
	 return pattern;	
		
	}	
}



//Context-based Filter
var CBF = {
	
	calculateCBF: function(){
	   
	   var descriptionOutput = CBF.calculate(Recommendation.input.description,1);
	   var nameOutput = CBF.calculate(Recommendation.input.name,1);
	   var urlOutput = CBF.calculate(Recommendation.input.url,1);

	   	Recommendation.pattern.description = Recommendation.pattern.description.concat(descriptionOutput);
	   	Recommendation.pattern.name = Recommendation.pattern.name.concat(nameOutput);
	   	Recommendation.pattern.url = Recommendation.pattern.url.concat(urlOutput);
	},
	
	calculate:function(input, weight){

		var output = [];
		var total = 0;
		
		$.each(input, function(index, value) {
           var t = jQuery.grep(output, function(n, i){
             return (n.key == value);
            });
           var pos = output.indexOf(t[0]);
           
           if(pos!=-1)
           {
	           output[pos].count += weight;
           }
           else if(value.length>1)
           {
	           var o = {};
	           o.count = weight;
	           o.key = value;
	           output.push(o);
           }
           
           total += weight;
        });
        
        var avg = (total/output.length).toFixed(2);
        
        var filterOutput = jQuery.grep(output, function(n, i){
             return (n.count >= avg && n.count > 1);
         });
         
         var obj = [];
         
         $.each(filterOutput,function(key,value){
	         
	         obj.push(value.key.toLowerCase());
         });
         
         return obj;
	}
	
	
}

//Decision Rule Technique
var DRT = {

     rules: null,

     calculate: function(input){
	     
	     var output = [];
	     
	     $.each(DRT.rules, function(key,value){

		     if(jQuery.inArray(value.pattern.toLowerCase(), input)>-1)
		     {
		        $.each(value.rule, function(index,value){

                    if(value.length>1)
                    {
			            output.push(value.toLowerCase());
			         }

		        });
		       
		     }
	     });
	     
	     return output;
	     
	     	     
     },

     calculateDRT:function(callback){
        console.log("Reasoning time start: " + new Date().getTime());
       
        var descriptionOutput = DRT.calculate(Recommendation.pattern.description);
	    var nameOutput = DRT.calculate(Recommendation.pattern.name);
	    var urlOutput = DRT.calculate(Recommendation.pattern.url);

	   	Recommendation.pattern.description = Recommendation.pattern.description.concat(descriptionOutput);
	   	Recommendation.pattern.name = Recommendation.pattern.name.concat(nameOutput);
	   	Recommendation.pattern.url = Recommendation.pattern.url.concat(urlOutput);
	   	
	   	console.log("Reasoning time end: " + new Date().getTime());

    }
	
	
	
}


//Association Rule Discovery
var ARD = {

    calculateARD: function(){
	   
	   var threshold = Math.ceil(0.4 * Recommendation.data.length + 1);
	   
	    var descriptionOutput = ARD.calculate(Recommendation.input.description,Recommendation.pattern.description,threshold);
	    var nameOutput = ARD.calculate(Recommendation.input.name, Recommendation.pattern.name, threshold);
	    var urlOutput = ARD.calculate(Recommendation.input.url, Recommendation.pattern.url, threshold);
	    
	    Recommendation.pattern.description = Recommendation.pattern.description.concat(descriptionOutput);
	   	Recommendation.pattern.name = Recommendation.pattern.name.concat(nameOutput);
	   	Recommendation.pattern.url = Recommendation.pattern.url.concat(urlOutput);
	    
    },
    
    calculate: function(input, pattern, threshold)
    {
         var relation = [], output = [];
         
	     var size_one_array = ARD.calculateSizeOne(input, threshold);
	     var size_two_array = ARD.calculateSizeTwo(input, size_one_array, threshold);
	     var size_three_array = ARD.calculateSizeThree(input, size_two_array, threshold);
	     
	     $.each(size_one_array, function(index, value) {
		     
		     var t = value.key;
		     var c = value.count
		     
		     $.each(size_three_array, function(index, value) {
		         
		         if(value.key.indexOf(t)>-1 && (value.count/c).toFixed(2) >= 0.5 )
		         {
			         relation.push({
				         
				         key: t,
				         value: value.key
				         
			         });
		         }
		         
		     });
		     
		     
	     });
	     
	     
	      $.each(relation, function(index, value) {
	       
	         if(pattern.indexOf(value.key)&& value.value.length>1)
	         {
		         output.concat(value.value);
	         }
	       
	     });
	     
	     return output;
	     
    },
    
    calculateSizeOne:function(input, threshold)
    {
	    var output = [];
		
		$.each(input, function(index, value) {
           var t = jQuery.grep(output, function(n, i){
             return (n.key == value);
            });
           var pos = output.indexOf(t[0]);
           
           if(pos!=-1)
           {
	           output[pos].count ++;
           }
           else
           {
	           var o = {};
	           o.count = 1;
	           o.key = value;
	           output.push(o);
           }

        });
        

        return jQuery.grep(output, function(n, i){
             return (n.count >= threshold);
         });
         
    },
    
    calculateSizeTwo:function(input, size_one_array, threshold)
    {
       var output = [];
       
       for(var i = 0; i < size_one_array.length; i ++)
       {
	       for(var j = i + 1; j < size_one_array.length; j++)
           {
                var count = 0;
                
                var a = size_one_array[i], b = size_one_array[j];
                
	            $.each(input,function(key,value){
	                
	                if(value.indexOf(a)>-1&&value.indexOf(b)>-1)
	                {
		                count++;
	                }
	                
	            });
	            
	            if(count >= threshold)
	            {
	               var o = {};
	               o.count = count;
	               o.key = [a, b];
	               output.push(o);
	            }
           }
       }
       
       return output;
    },
    
    calculateSizeThree:function(input, size_two_array, threshold)
    {
       var items = [], output = [];
       
       $.each(size_two_array,function(index, value){
	       
	        $.each(value.key, function(index,value){
		        
		        if(items.indexOf(value)==-1)
		        {
			      items.push(value);  
		        }
		        
	        });
	       
       });
        
       for(var i = 0; i < items.length; i ++)
       {
	       for(var j = i + 1; j < items.length; j++)
           {
              for(var p = j + 1; p < items.length; p++)
              {
              
                var count = 0;
                
                var a = size_one_array[i], b = size_one_array[j], c = size_one_array[p];
                
	            $.each(input,function(key,value){
	                
	                if(value.indexOf(a)>-1&&value.indexOf(b)>-1&&value.indexOf(c)>-1)
	                {
		                count++;
	                }
	                
	            });
	            
	            if(count >= threshold)
	            {
	               var o = {};
	               o.count = count;
	               o.key = [a, b, c];
	               output.push(o);
	            }
	          }
           }
       }
       
       return output;
    }
	
		
}

//Sequence pattern mining
var SPM = {
	
	calculateSPM: function(){
	
	var threshold = Math.ceil(0.4 * Recommendation.data.length + 1);
		
		var descriptionOutput = SPM.calculate(Recommendation.spminput.description,Recommendation.pattern.description,threshold);
	    var nameOutput = SPM.calculate(Recommendation.spminput.name, Recommendation.pattern.name,threshold);
	    var urlOutput = SPM.calculate(Recommendation.spminput.url, Recommendation.pattern.url,threshold);
	    
	    Recommendation.pattern.description = Recommendation.pattern.description.concat(descriptionOutput);
	   	Recommendation.pattern.name = Recommendation.pattern.name.concat(nameOutput);
	   	Recommendation.pattern.url = Recommendation.pattern.url.concat(urlOutput);


	},
	
	calculate: function(input,pattern,threshold){
		
		var list = [], output = [];

	    $.each(input, function(index, value) {
            
            var t = jQuery.grep(list, function(n, i){
              return (n.key == value);
            });
            var pos = list.indexOf(t[0]);

            if(pos==-1)
            {
	           var o = {};
	           o.key = value;
	           o.items = [index];
	           list.push(o);
            }
            else
            {
	            list[pos].items.push(index);
            }
        });
        
		list = jQuery.grep(list, function(n,i){
		
              return (n.items.length >= threshold);
         });

        
         for(var i = 0; i < list.length; i++)
         {
	         for(var j = 0; j < list.length; j++)
             {
               
                 var index = list[j].items.length - threshold;
	             if(i!=j && 
	             list[i].items[0] < list[j].items[index] &&
	             pattern.indexOf(list[i].key)
	             )
	             {
	                output.push(list[j].key.toLowerCase());
	             }
             }
         }

		return output;
		
	}
	
}