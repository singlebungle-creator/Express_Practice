var http=require('http');
var fs=require('fs');
var url=require('url');
var qs=require('querystring');
var path=require('path');
var sanitizeHtml=require('sanitize-html');

var template=require('./node_modules/template.js');
var app=http.createServer((req,res)=> {
	var _url=req.url;
	
	fs.readdir('./data', 'utf-8', (err, files) => {
		var list=template.list(files);
		var queryData=url.parse(_url,true).query;
		var title=sanitizeHtml(queryData.id);
		var pathname=sanitizeHtml(url.parse(_url, true).pathname);
// 메인 페이지	
		if (pathname==='/') {
			if (title===undefined) {
				var title='Welcome';
				var data='Hello, Node.js';
				res.writeHead(200);
				res.end(template.html(title,list,`<h2>${title}</h2>
				<p>${data}</p>`,
				`<a href="/create">create</a>`));
// 파일 페이지
			} else {
				var filteredId=path.parse(title).base;
				fs.readFile(`data/${filteredId}`, 'utf-8', (err, data) => {
					
					var sanitizedTitle=sanitizeHtml(title);
					var sanitizedData=sanitizeHtml(data);
					res.writeHead(200);
					res.end(template.html(title,list,`<h2>${sanitizedTitle}</h2>
					<p>${sanitizedData}</p>`,
					`<a href="/create">create</a>
					<a href="/update?id=${sanitizedTitle}">update</a>
					<form action="delete_process" method="POST">
					<input type="hidden" name="id" value="${sanitizedTitle}">
					<input type="submit" value="delete">
					</from>
					`
					));
				});
			}
// 생성 페이지
		} else if (pathname==='/create') {
			var title='WEB - create';
			var data='Hello, Node.js';
			res.writeHead(200);
			res.end(template.html(title,list,`
			<form action="http://222.116.8.235:7000/create_process" method="POST">
			<p><input type="text" name="title" placeholder="title"></p>
			<p>
			<textarea name="description" placeholder="description"></textarea>
			</p>
			<p>
			<input type="submit">
			</form>
			`,''));
// 생성 리디렉션
		} else if (pathname==='/create_process') {
			var body='';
			req.on('data', (data) => {
				body+=data;
			});
			req.on('end', () =>{
				var post=qs.parse(body);
				var title=post.title;
				var description=post.description;
				fs.writeFile(`data/${title}`, description, 'utf-8', (err) => {
					if (err) throw err;
					res.writeHead(302, {Location: `/?id=${title}`});
					res.end();
				});
			});
// 업데이트 페이지
		} else if (pathname==='/update') {
			var filteredId=path.parse(title).base;
			fs.readFile(`data/${filteredId}`, 'utf-8', (err, description) => {
				res.writeHead(200);
				res.end(template.html(title,list,`<form action="/update_process" method="POST">
				<input type="hidden" name="id" value="${title}">
				<p><input type="text" name="title"placeholder="title" value="${title}"></p>
				<p>
					<textarea name="description" placeholder="description">${description}</textarea>
				</p>
				<p>
					<input type="submit">
				</p>
				</form>
				`, ''));
			});
// 업데이트 리디렉션
		} else if (pathname==='/update_process') {
			var body='';
			req.on('data', (data) => {
				body+=data;
			});
			req.on('end', () => {
				var post=qs.parse(body);
				var id=post.id;
				var title=post.title;
				var description=post.description;
				fs.rename(`./data/${id}`, `./data/${title}`, (err) => {
					if (err) throw err;
					fs.writeFile(`data/${title}`, description, 'utf8', (err1) => {
						if (err1) throw err1;
						res.writeHead(302, {Location: `/?id=${title}`});
						res.end();
					});
				});
			});
		} else if (pathname==='/delete_process') {
			var body='';
			req.on('data', (data) => {	
				body+=data;
			});
			req.on('end', () => {
				var post=qs.parse(body);
				var id=post.id;
				fs.unlink(`data/${id}`, (err) => {
					if (err) throw err;
					res.writeHead(302, {Location: '/'});
					res.end();
				});
			});
		}else {
			res.writeHead(404);
			res.end('Not found');
		}
	});
});

app.listen(1236);

