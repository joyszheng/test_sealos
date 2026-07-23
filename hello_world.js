var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('Hello World1231233!');
}).listen(8080,()=>{
  console.log('Server running at http://0.0.0.0:8080/');
});
