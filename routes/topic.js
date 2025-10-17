const express=require('express');
const path=require('path');
const fs=require('fs');
const sanitizeHtml=require('sanitize-html');

const template=require('../lib/template.js');

const router=express.Router();

router.get('/create', (req,res) => {
	var list=template.list(req.list);
	var title='WEB - Create';
	var html=template.html(title, list, `
	<form action='/topic/create', method='POST'>
	<p><input type='text' name='title' placeholder='title'></p>
	<p><textarea name='description' placeholder='description'></textarea></p>
	<p><input type='submit'></p>
	</form>
	`,'');
	res.send(html);
});

router.post('/create', (req,res) => {
	var post=req.body;
	var title=post.title;
	var description=post.description;
	fs.writeFile(`data/${title}`, description, 'utf-8', (err) => {
		if (err) throw err;
		res.redirect(`/topic/${title}`);
	});
});

router.get('/update/:pageId', (req, res) => {
	var filteredId=path.parse(req.params.pageId).base;
	var list=template.list(req.list);
	fs.readFile(`data/${filteredId}`, 'utf-8', (err, description) => {
		if (err) throw err;
		var html=template.html(filteredId,list,`
		<form action='/topic/update/:${filteredId}' method='POST'>
		<input type="hidden" name="id" value="${filteredId}">
		<p><input type='text' name='title' placeholder='title' value=${filteredId}></p>
		<p><textarea name='description' placeholder='description'>${description}</textarea></p>
		<p><input type='submit'></p>
		</form>
		`,'');
		res.send(html);
	});
});

router.post('/update/:pageId', (req,res) => {
	var post=req.body;
	var id=post.id;
	var title=post.title;
	var description=post.description;
	fs.rename(`./data/${id}`, `./data/${title}`, (err) => {
		if (err) throw err;
		fs.writeFile(`data/${title}`, description, 'utf-8', (err) => {
			if (err) throw err;
			res.redirect(`/topic/${title}`);
		});
	});
});

router.post('/delete', (req,res) => {
	var post=req.body;
	var id=post.id;
	fs.unlink(`data/${id}`, (err) => {
		if (err) throw err;
		res.redirect('/');
	});
});


router.get('/:pageId', (req,res,next) => {
	var filteredId=path.parse(req.params.pageId).base;
	fs.readFile(`data/${filteredId}`, 'utf-8', (err, description) => {
		if (err) next(err); else {
			var sanitizedTitle=sanitizeHtml(req.params.pageId);
			var sanitizedDescription=sanitizeHtml(description);
			var list=template.list(req.list);
			var html=template.html(sanitizedTitle, list, 
				`<h2>${sanitizedTitle}</h2>
				<p>${sanitizedDescription}</p>`,
				`<a href="/topic/create">create</a>
				<a href="/topic/update/${sanitizedTitle}">update</a>
				<form action="/topic/delete" method="POST">
				<input type="hidden" name="id" value="${sanitizedTitle}">
				<input type="submit" value="delete">
				</form>`);
			res.send(html);
		}
	});
});	

module.exports=router;
