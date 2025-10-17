module.exports = {
	html:(_title, _list, _body, control) => {
		return `
                <!DOCTYPE html>
                <html>
                <head>
                        <title>WEB - ${_title}</title>
                        <meta charset="utf-8">
                </head>
                <body>
                        <h1><a href="/">WEB</a></h1>
                        ${_list}
                        ${control}
                        ${_body}
                </body>
                </html>
                `;
	}, list: (_list) => {
		var tmp=`<ul>`;
		_list.forEach(element => {
			tmp+=`<li><a href="/?id=${element}">${element}</a></li>\n`;
		});
		return tmp+`</ul>`;
	}
}
