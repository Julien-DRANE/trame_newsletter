const fs = require('fs');
const p = __dirname + '/index.html';
let s = fs.readFileSync(p, 'utf8');
s = s.slice(0, s.indexOf('    <script>')) + '<script src="app.js"></script></body></html>';
s = s.replace('</head>', '<link rel="stylesheet" href="layout.css"></head>');
fs.writeFileSync(p,s);
