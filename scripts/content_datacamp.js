console.log("Hi from DataCamp!");
var injected = false;
var protect_hidden = true;
var download_side = [];
var download_main = [];
var directoryName = "";

function download_all(){
	console.log("Going to download all!!!!");
	var msg = {};
	msg.sender = "content_ilykei";
	msg.receiver = "background";
	msg.destination = "background";
	msg.type = "download_main";
	msg.download = download_main;
	msg.folder = directoryName;
	chrome.runtime.sendMessage(msg, function(response) {
	  console.log(response.received_by.concat(" heard me."));
	});
}

function download_single(){
	console.log("Just download the side bar!!!!");
	var msg = {};
	msg.sender = "content_ilykei";
	msg.receiver = "background";
	msg.destination = "background";
	msg.type = "download_side";
	msg.download = download_side;
	msg.folder = directoryName;
	chrome.runtime.sendMessage(msg, function(response) {
	  console.log(response.received_by.concat(" heard me."));
	});
}

function scrapeThePage(){
	console.log("Scraping DataCamp!");
	download = {}
	if ($("ul.header-hero__stats").length){
		console.log("This is a single course page.")
		$("ol.chapters li").each(function(){
			chapter_number = $(this).find(".chapter-number").text().trim();
			chapter_name = $(this).find(".chapter__title").text().trim();
			if(chapter_number.length){
				console.log(chapter_number);
			}
			if(chapter_name.length){
				console.log(chapter_name);
			}
			$(this).find("ul.chapter__exercises").find("li a").each(function(){
				if($(this).find("img").attr("alt").trim().indexOf('video') != -1){
				link = $(this).attr("href");
				filename = $(this).find(".chapter__exercise-title").text().trim();
				console.log(filename);
				console.log(link);
				jQuery.ajaxSetup({async:false});
				console.log(link.replace(/^.*\/\/[^\/]+/, ''));
				//link="https://api.jquery.com/jquery.get/"
				$("#js-promo-coupon").append("<iframe id='insertHere' src='' style='width:0;height:0;border:0; border:none;'></iframe>");
				//$("#insertHere").attr("src", "medium.php?"+link);
				$("#insertHere").attr('src','about:blank');
				$("#insertHere").attr('src',link.replace(/^.*\/\/[^\/]+/, ''));
				setTimeout(function() {
				    //$("#insertHere").attr('src',link.replace(/^.*\/\/[^\/]+/, ''));
				    var myiFrame = document.getElementById('insertHere');
				    console.log($("#js-promo-coupon").text());
				    console.log($("#insertHere").parent().html());
					console.log($("#insertHere").text());
				}, 4000);
				//$("#insertHere").attr("src", link.replace(/^.*\/\/[^\/]+/, ''));
				
				//var myiFrame = document.getElementById('insertHere');
				//console.log($("#insertHere").html());

				//myiFrame.addEventListener("load", function() { 
				//	console.log("Yureka");
				//	setTimeout(function () {
				//		console.log($("#js-promo-coupon").contents());
				//		console.log($("#insertHere").contents());
				//        console.log($("#js-promo-coupon").html());
				//		console.log($(".video-wrapper").html());
				//    }, 5000);
				//});

				jQuery.ajaxSetup({async:true});
				}
				return false;
			});
			return false;
		});
		/*TODO: Figure out a way to get lecture content without having to go to the tab*/
	}
	else{
		console.log("This is explore courses' page.")
		if(injected == false){
			$("ol.breadcrumb").append('<li><a ui-sref="#" class="ng-binding" href="#" id="downloadAll">Download All Lecture Material</a></li>');
			$( "#downloadAll" ).unbind( "click" );
			document.getElementById("downloadAll").addEventListener("click", download_all, false);
			$("ul.list-group").prepend('<li ng-repeat="document in lecture.documents" ng-hide="document.hide" class="list-group-item ng-scope" style=""><a id="downloadSide" ng-href="#" href="#"><div class="filename ng-binding">Download All Sidebar Documents</div><span class="glyphicon glyphicon-download-alt pull-right"></span></a></li>');
			$( "#downloadSide" ).unbind( "click" );
			document.getElementById("downloadSide").addEventListener("click", download_single, false);
			injected = true;
		}
		
		$("ul.list-group a").each(function(){
			if(protect_hidden == true){
				// this is more of an ethical decision
				if($(this).parent().attr("class").search(/ng-hide/)==-1){
					download_side.push({link:$(this).attr("href"),name:$(this).find("div").text().replace(/[^a-z0-9.(),';{} +&^%\[\]$#@!~`-]/gi, '_')});
				}
			}
			else{
				download_side.push({link:$(this).attr("href"),name:$(this).find("div").text().replace(/[^a-z0-9.(),';{} +&^%\[\]$#@!~`-]/gi, '_')});
			}
		});
		$("div#lectureDoc").find("a").each(function(){
			link = $(this).attr("href");
			title = $(this).text().replace(/[^a-z0-9.(),';{} +&^%\[\]$#@!~`-]/gi, '_');
			if(link.search(/fileProxy/) != -1){
				download_main.push({link:link,name:title});
			}
		});
		//directoryName = $("h1.title p").text().replace(/(\r\n|\n|\r)/gm,"_");
		// Machine learning course on ilykei doesn't have p tag inside h1 for lecture title. Below check handles that case.
		//if (directoryName == ""){
		//	directoryName = $("h1.title").text().replace(/(\r\n|\n|\r)/gm,"_");
		//}
		
		// Now I use a different naming method for directories; using breadcrumb seems like a good idea as all the ilykei courses I know have same format for it.
		directoryName = $("ol.breadcrumb li:nth-child(2) a").text().trim()+"_"+$("ol.breadcrumb li:nth-child(3) a").text().trim();
		var msg = {};
		msg.sender = "content_ilykei";
		msg.receiver = "background"; // we don't want content to directly pick it up as events has to do certain adjustments to this data
		msg.destination = "popup";
		msg.type = "scraping_done";
		
		chrome.runtime.sendMessage(msg, function(response) {
		  console.log(response.received_by.concat(" heard me."));
		});
	}
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	if(request.data.destination=="content_datacamp"){
		console.log(request);
		if(request.action=="scrape"){
			sendResponse({received_by: "scraper"});
			scrapeThePage();
		}else if(request.action=="clean"){
			console.log("cleaning insert flags");
			sendResponse({received_by: "cleaner_ilykei"});
			injected = false;
			$( "#downloadAll" ).parent().remove();
			$( "#downloadSide" ).parent().remove();
			download_side = [];
			download_main = [];
			directoryName = "";
		}
	}
	return true;
  }
);