var req;
var previous="";
var word="";
var root="";
var search_is_found;


var spanID;
var refID;
var divID;
var previousID;

var stack = new Array();
var stack_words = new Array();
var stack_span = new Array();
var stack_previousSearches = new Array();

var paper;

var at = function(id){
	return document.getElementById(id);
};

var script = document.createElement('script');

/* ************************************************************
 * function: init()
 * return: nothing
 * description: initializes the raphael canvas
 * */

 /*function init(){
   document.getElementById("searchResults").innerHTML = "";
   var canvas = at("canvas");
   var paper = new Raphael(canvas, canvas.clientWidth, 1000); 
   var circle = paper.circle(500, 100, 80);
 } */
/* ************************************************************
 * function: start_search()
 * return: nothing
 * description: when the user first types in a word
 * - variables are initialized
 * - root variable is set
 * - first set of words are found and div is stored in the stack
 * */
function start_search(){
	// initialize all parameters
	word = "";
	previous = "";
	stack_words.length = 0;
	stack.length = 0;
	stack_span.length = 0;
	spanID = 0;
	refID = 0;
	divID = 0;
	previousID = 0;
	search_is_found = 0;
	
	root = at("word").value;
	word = root+word;
	
	if(word != previous)
	{
        document.getElementById("searchResults").innerHTML = "";
	    document.getElementById("imageResults").innerHTML = "";
	    spandID = 0;
	    refID = 0;
	    previous = word;
		getResults();
	}
};

/* ***************************************************************
 * function: next_search()
 * return: nothing
 * description: when the user clicks a word from the results
 * - new word is added to the root word
 * - checks to see if the word is not already searched
 * - adds new results to the stack
 */
function next_search(q){
	
	// temporary placeholder for the search query
	var temp = "";
	
	// get searchResults div node
	var strResults = document.getElementById("searchResults");

	// get parent div of span node
	var divID = q.parentNode.parentNode.id;
		
	var newWord = q.innerHTML;	
	
	// if the same word is clicked
	if(newWord == stack_words[stack_words.length-1]){	
		return;
	}
	
	// remove divs up until the selection
	while(stack.length != 1 && divID != stack[stack.length-1].id){
		var id = stack.pop();
		//alert("stack popped is: "+id.id);
		strResults.removeChild(id);
		var breaks = strResults.getElementsByTagName('BR');
		//alert("number of breaks: "+breaks.length);
		strResults.removeChild(breaks[breaks.length-1]);
		stack_words.pop();
		stack_span.pop().setAttribute("style","background-color: LightGray;");
	}
	if(search_is_found == 1){
		stack_words.pop();
		stack_span.pop().setAttribute("style","background-color: LightGray;");
		search_is_found = 0;
	}
	//alert("length of stack: "+stack.length)
	// concatenate new word with previous search
	var i;
	for(i=0; i<stack_words.length; i++){
		temp = temp+" "+stack_words[i];
		//alert("temp is now: "+temp+" with stackword: "+stack_words[i]);
		if(newWord == stack_words[i] || newWord == root){
			//alert("returning");
			return;
		}
	}
	stack_words.push(newWord);
	word = root+temp+" "+newWord;
	stack_span.push(q);
	q.setAttribute("style","background-color: #F87431;")
    
	//alert("new search query is: "+word);
	if(word != previous)
    {
		//alert(word);
	    document.getElementById("imageResults").innerHTML = "";      
        previous = word;
        getResults();
  
    }
};

/* **************************************************************
 * function: getResults
 * return: nothing
 * description: calls and retrieves results from the server
 */
function getResults(){
	if(window.XMLHttpRequest){
		req = new XMLHttpRequest();
	}
	else if(window.ActiveXObject){
		req = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	// send query to servlet to grab data and parse
	var url = "googlerec?word="+escape(word);
	
	//alert(url);
	req.open("Get",url,true);
	req.onreadystatechange = callback;
	req.send(null);
};


/* **************************************************************
 * function: callback
 * return: nothing
 * description: this is the function that the server calls after
 *      it completes its data analysis
 * */
function callback(){
	if( req.readyState==4 ){
		if( req.status==200 ) {		
			// get results from servlet
			var strResults = document.getElementById("searchResults");
			//strResults.innerHTML = req.responseText;
			var results = req.responseText.split("|");
			var results_array = results[0].split(",");
			var results_image = results[1];
			//alert(results_array[0]);
			if(results_array[0] != ""){
			    animate_results(results_array);
			    var imageResults = at("imageResults");
			    imageResults.innerHTML = "";
			}
			else
			{
				search_is_found = 1;
				stack_previousSearches.push(results[2]);
				//alert(results[2]);
				//animate_previous(results[2]);
				setTimeout( animate_image(results_image, results[2]), 1000);
			}
		}
	}
}

function animate_previous(query){
	//alert("in animate_previous");
	var q_arr = query.split("+");
	var q = "";
	
	for(var i =0; i<q_arr.length; i++){
		q = q+q_arr[i]+" ";
	}
	var previousResults = at("previousResults");
	var br = document.createElement("br");
	var p = document.createElement("p");
	p.innerHTML = q;
	
	previousResults.appendChild(p);
	//previousResults.appendChild(br);
	//alert(q);
}

function animate_image(imageLink, query){
	var imageResults = at("imageResults");
	var i = 0;
	var image_array = imageLink.split(",");
//	alert(imageLink);
//    var words = query.split("+");
//    
//	var q = "";
//    var br= document.createElement("br");
//	
//    for(var i=0; i<words.length-1; i++){
//        q = q+words[i]+" ";
//    }
//    
//    q = q+words[words.length-1];
//    
//    var newP = document.createElement("p");
	
//    var newImg = document.createElement("img");
//	newImg.setAttribute("src", imageLink);
    for(i=0; i<image_array.length; i++ ){    
    	var newImg = new Image();
    	newImg.src = image_array[i];
    	
    	newImg.onload = function(){
	    	//alert("image is loaded with width: "+newImg.width+" and height: "+newImg.height);
	        newImg.setAttribute("style", "float: left");
	
	        if(newImg.width > 400){
	            newImg.setAttribute("width", ""+(newImg.width*.75));
	        }
	        if(newImg.height > 400)
	            newImg.setAttribute("height", ""+(newImg.height*.75));
    	};

    	imageResults.appendChild(newImg);
    }

//    imageResults.appendChild(newP);
	
//	var prevP = document.createElement("p");
//	prevP.innerHTML = q;
//	prevP.setAttribute("style", "font-size: 40px;");
//	
//	var prevImg = document.createElement("img");
//	prevImg.setAttribute("src", imageLink);
	
	/*var previous = at("previousResults");
	previous.appendChild(prevImg);
	previous.appendChild(prevP);
	previous.appendChild(br);
	previous.appendChild(br); */
}

function animate_results(arr){
    //alert("number of words in search result: "+arr.length);
    // grab searchResults div
    var divResults = at("searchResults");
    var time = 0;
    
    var iddiv = "DIV"+divID++;
    var newdiv = document.createElement("div");
    newdiv.setAttribute("id", iddiv+"");
    var br = document.createElement("br");
    
    divResults.appendChild(newdiv);
    for(var i=0; i<arr.length; i++){
        // create a new a href link
        var newref = document.createElement("a");
        
        // create a new span and then animate each of them
        var newspan = document.createElement("span");
        
        spanID++;
        refID++;
        

        var idspan = "span"+spanID;
        var idref  = "a"+refID;
        
        newref.setAttribute("href", "#"+idspan);
        newref.setAttribute("id", idref);
        
        newspan.setAttribute("id", idspan);
        newspan.innerHTML = arr[i];
        
        newref.appendChild(newspan);
        newdiv.appendChild(newref);
        
        time = time+250;
        //alert(time);
        $("#"+idspan).hide();
        $("#"+idspan).fadeIn(time);
    }
    stack.push(newdiv);
    divResults.appendChild(br);
    
    //alert(divResults.innerHTML);
}

function pause(m){

}

/* ---------- IT BEGINS HERE ---------- */
$(document).ready(function(){
    // fade in the title and instructions
    $("#title").hide();
    $("#title").fadeIn(1250);
//    $("#pressEnter").hide();
//    $("#pressEnter").delay(1250).fadeIn(1500);
    // wait for ENTER KEY
    $("#word").keyup(function(e) {
    	if(e.keyCode == 13) {
    		start_search();
    	}
    });
    
    $("span").live("click", function(){
        next_search(this);
    });
    
    $('.input_border').corners("5px");

});