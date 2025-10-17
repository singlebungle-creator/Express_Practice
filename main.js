//libraries
const express=require('express');
const fs=require('fs');
const sanitizeHtml=require('sanitize-html');
const url=require('url');
const path=require('path');
const qs=require('querystring');

//third-party middlewares
const bodyParser=require('body-parser');
const compression=require('compression');

//routes&module
const indexRouter=require('./routes/index');
const topicRouter=require('./routes/topic');
const template=require('./lib/template.js');

const app=express();
const port=1236;
	
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(compression());
app.get('*splat', (req,res,next) => {
	fs.readdir('./data', (err, filelist) => {
		req.list=filelist;
		next();
	});
});

app.use('/',indexRouter);
app.use('/topic',topicRouter);

app.use((req,res,next) => {
	res.status(404).send('Sorry cant find that!');
});

app.use((err, req, res, next) => {
	console.error(err.stack)
	res.status(500).send('Something broke!');
});

app.listen(port, () => {
	console.log(`Exaple app listening on port ${port}`);
});
