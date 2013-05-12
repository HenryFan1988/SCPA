self.addEventListener('message', function(e) {
  var result = calculate(e.data, 1);
  self.postMessage(result);
}, false);


function calculate(input, weight){

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