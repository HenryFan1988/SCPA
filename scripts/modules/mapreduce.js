var temp = {};

var worker_dir = "/scripts/modules/workers/";

function distribute(data, worker,action)
{
    $.each(data, function(key, value){
	    
	    map(key, value, worker);
	    
    });
    
     $.each(temp, function(key, values){
	    
	    reduce(key, values,action);
	    
    });
    
    return temp;
}



function map(key, value, workerjs){
	
    if(typeof(Worker)!=="undefined")
    {
	     worker = new Worker(worker_dir + workerjs);
	           
	     worker.addEventListener('message', function(e) {
                   console.log('Worker said: ', e.data);
                   emit(key, e.data);
                   worker.terminate();
                }, false);
                
         worker.postMessage(value); 
 
     }
}

function emit(key, value)
{
   if(temp[key] == undefined)
   {
	   temp[key] = [];
   }
   
   temp[key].push(value);
}

function reduce(key, values, action){
	
	var result = null;
	
	jQuery.each(values, function(index, value){
	    
	    result = action(result, value);
	    
    });
    
    console.log('Reduce result: ', result);
    
    temp[key] = result;
	
}