var start = new Date();

var koa = require('koa');
var path = require('path');
var render = require('koa-swig');
var serve = require('koa-static');
var router = require('koa-router')();

var app = koa();

const PORT = 3001;

//serve static files in www dir
app.use(serve( path.join(__dirname, '/www') ) );

router.get('/', function *(){
	this.body = yield this.render('index');
});


app.use(router.routes());
app.use(router.allowedMethods());

app.context.render = render({
	root: path.join(__dirname, 'views'),
	autoescape: true,
	cache: 'memory', // disable, set to false
	ext: 'html'
});


app.listen(PORT);

console.log('initialization \u001b[35m' + (new Date() - start ) + 'ms\u001b[0m port: \u001b[34m' + PORT + '\u001b[0m ' );
