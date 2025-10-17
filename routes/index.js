const express=require('express');
const router=express.Router();

const template=require('../lib/template.js');

router.get('/', (req,res) => {
	var title='Welcome';
	var description='Hello, Express!';
	var list=template.list(req.list);
	var html=template.html(title, list,
		`<h2>${title}</h2>${description}
		<img src="/images/ruri.webp" style="width:300px; display:block">`,
		`<a href="/topic/create">create</a>`
	);
	res.send(html);
});

module.exports=router;

