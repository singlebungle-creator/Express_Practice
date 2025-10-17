const express=require('express');
const fs=require('fs');
const sanitizeHtml=require('sanitize-html');
const url=require('url');
const path=require('path');
const qs=require('querystring');

const bodyParser=require('body-parser');
const compression=require('compression');

const template=require('./lib/template.js');

const app=express();
const port=1236;

app.use(bodyParser.urlencoded({extended: false}));
app.use(compression());
app.get('*splat', (req,res,next) => {
	fs.readdir('./data', (err, filelist) => {
		req.list=filelist;
		next();
	});
});

app.get('/', (req,res) => {
	var title='Welcome';
	var description='Hello, Express!';
	var list=template.list(req.list);
	var html=template.html(title, list,
		`<h2>${title}</h2>${description}`,
		`<a href="/create">create</a>`
	);
	res.send(html);
});
app.get('/page/:pageId', (req,res) => {
	var filteredId=path.parse(req.params.pageId).base;
	fs.readFile(`data/${filteredId}`, 'utf-8', (err, description) => {
		var sanitizedTitle=sanitizeHtml(req.params.pageId);
		var sanitizedDescription=sanitizeHtml(description);
		var list=template.list(req.list);
		var html=template.html(sanitizedTitle, list, 
			`<h2>${sanitizedTitle}</h2>
			<p>${sanitizedDescription}</p>`,
			`<a href="/create">create</a>
			<a href="/update/${sanitizedTitle}">update</a>
			<form action="/delete" method="POST">
			<input type="hidden" name="id" value="${sanitizedTitle}">
			<input type="submit" value="delete">
			</form>`);
		res.send(html);
	});
});	

app.get('/create', (req,res) => {
	var list=template.list(req.list);
	var title='WEB - Create';
	var html=template.html(title, list, `
	<form action='/create', method='POST'>
	<p><input type='text' name='title' placeholder='title'></p>
	<p><textarea name='description' placeholder='description'></textarea></p>
	<p><input type='submit'></p>
	</form>
	`,'');
	res.send(html);
});

app.post('/create', (req,res) => {
	var post=req.body;
	var title=post.title;
	var description=post.description;
	fs.writeFile(`data/${title}`, description, 'utf-8', (err) => {
		if (err) throw err;
		res.redirect(`/page/${title}`);
	});
});

app.get('/update/:pageId', (req, res) => {
	var filteredId=path.parse(req.params.pageId).base;
	var list=template.list(req.list);
	fs.readFile(`data/${filteredId}`, 'utf-8', (err, description) => {
		if (err) throw err;
		var html=template.html(filteredId,list,`
		<form action='/update/:${filteredId}' method='POST'>
		<input type="hidden" name="id" value="${filteredId}">
		<p><input type='text' name='title' placeholder='title' value=${filteredId}></p>
		<p><textarea name='description' placeholder='description'>${description}</textarea></p>
		<p><input type='submit'></p>
		</form>
		`,'');
		res.send(html);
	});
});

app.post('/update/:pageId', (req,res) => {
	var post=req.body;
	var id=post.id;
	var title=post.title;
	var description=post.description;
	fs.rename(`./data/${id}`, `./data/${title}`, (err) => {
		if (err) throw err;
		fs.writeFile(`data/${title}`, description, 'utf-8', (err) => {
			if (err) throw err;
			res.redirect(`/page/${title}`);
		});
	});
});

app.post('/delete', (req,res) => {
	var post=req.body;
	var id=post.id;
	fs.unlink(`data/${id}`, (err) => {
		if (err) throw err;
		res.redirect('/');
	});
});

app.listen(port, () => {
	console.log(`Exaple app listening on port ${port}`);
});
