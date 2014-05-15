/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   popup.js                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mfassi-f <mfassi-f@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2014/05/15 14:03:41 by mfassi-f          #+#    #+#             */
/*   Updated: 2014/05/15 21:26:23 by mfassi-f         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

var storage = chrome.storage.sync;
var users;
if (window.File && window.FileReader && window.FileList && window.Blob)
{
	var file = chrome.extension.getURL('students.txt');
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", file, false);
	rawFile.onreadystatechange = function ()
	{
		if(rawFile.readyState === 4)
		{
			if(rawFile.status === 200 || rawFile.status == 0)
			{
				var allText = rawFile.responseText;
				users = allText.split("\n");
			}
		}
	}
	rawFile.send(null);
}
else
{
	setError('The File APIs are not fully supported by your browser.');
	return ;
}
setSucceed();

function reqStatus(obj, i, elem)
{
	$.ajax({
		url: 'https://dashboard.42.fr/crawler/pull/'+obj["friends"][i]+"/",
		dataType: 'json',
		success: function(data){
			elem.innerHTML = elem.innerHTML + "<div style='float:left; margin:5px;position:relative'><div style='position:relative'><div class='cross' style='font-size:42px; width:100%; height:100%;z-index:10; opacity:0; position:absolute' id='cross"+i+"'><p style='color:#E00404; width:100%; height:100%; margin:0; margin-top:15px;text-align:center'>&#10006;</p></div><div id='photo"+i+"'class='photos' style='border: 2px solid #49C960; border-radius: 50%; width:70px; height:70px;background:url("+'"https://cdn.42.fr/userprofil/'+ data.login+'.jpg"'+") no-repeat; background-size: 100%;'></div></div><div>"+data.last_host.replace('.42.fr', '')+"</div></div>";
		},
		error: function (data)
		{
			elem.innerHTML = elem.innerHTML + "<div style='float:left; margin:5px;position:relative'><div style='position:relative'><div class='cross' style='font-size:42px; width:100%; height:100%;z-index:10; opacity:0; position:absolute' id='cross"+i+"'><p style='color:#E00404;width:100%; height:100%; margin:0; margin-top:15px;text-align:center'>&#10006;</p></div><div id='photo"+i+"' class='photos' style='border: 2px solid #E00404; border-radius: 50%; width:70px;height:70px;background:url("+'"https://cdn.42.fr/userprofil/'+obj["friends"][i]+'.jpg"'+") no-repeat; background-size: 100%;'></div></div><div style='min-height:19px'></div></div>";
		}
	});
}

function display(obj)
{
	var elem = document.getElementById("users");
	if (!obj["friends"])
	{
		storage.set({"friends":[]}, function(){});
		return;
	}
	for(var i = 0; i < obj["friends"].length; i++)
	{
		reqStatus(obj, i, elem);
	}
}

function setSucceed()
{
	storage.get("friends",display);
	setError("");
}

function setError(err)
{
	var div = document.getElementById('errors');
	if (div)
		div.innerHTML = "<h4 style='color:red'>"+err+"</h4>";
}

function pushFriend(obj)
{
	var pseudo = document.getElementById('pseudo').value;
	document.getElementById('pseudo').value = "";
	if (!pseudo)
	{
		setError('Error: No value specified');
		return;
	}
	else if (!users || users.indexOf(pseudo) == -1)
	{
		setError("User doesn't exist.")
	}
	else if (obj["friends"].indexOf(pseudo) != -1)
	{
		setError("User already added.")
	}
	else
	{
		obj["friends"].push(pseudo);
		var elem = document.getElementById("users");
		elem.innerHTML = "";
		storage.set({"friends":obj["friends"]}, setSucceed);
	}
}

function removeElem(obj)
{
	var toRem = document.getElementsByClassName("remove");
	obj["friends"].splice(toRem[0].getAttribute("id").replace("cross", ""), 1);
	var elem = document.getElementById("users");
	elem.innerHTML = "";
	storage.set({"friends": obj["friends"]}, setSucceed);
}

function hoverdelete(i, cross)
{
	cross[i].addEventListener('mouseover', function(){
		photo = document.getElementById("photo"+ cross[i].getAttribute('id').replace("cross", ""));
		photo.style.webkitFilter = "blur(2px)";
		cross[i].style.opacity = "1";
	});
	cross[i].addEventListener('mouseout', function(){
		photo = document.getElementById("photo"+ cross[i].getAttribute('id').replace("cross", ""));
		photo.style.webkitFilter = "blur(0px)";
		cross[i].style.opacity = "0";
	});
	cross[i].addEventListener('click', function(){
		cross[i].setAttribute("class", "remove");
		storage.get("friends", removeElem);
	});
}

document.addEventListener('DOMContentLoaded', function() {
	var link = document.getElementById('submit');
	link.addEventListener('click', function(){
		storage.get("friends", pushFriend);
	});
	var link = document.getElementById('pseudo');
	link.addEventListener('keydown', function(event){
		if (event.keyCode == 13)
		{
			$("#submit").click();
		}
	});
	document.addEventListener("DOMSubtreeModified", function(event){
		var cross = document.getElementsByClassName("cross");
		for (var i = 0; i < cross.length; i++)
		{
			hoverdelete(i, cross);
		}
	});
	$(function() {
		$("#pseudo").autocomplete({
			source: function( request, response ) {
				var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), "i" );
				response( $.grep( users, function( item ){
					return matcher.test( item );
				}).slice(0,4) );
			},
		});
	});
})

/* GOOGLE ANALYTICS */

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-51044212-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
