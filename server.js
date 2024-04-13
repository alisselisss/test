const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
            let filePath = '.' + req.url;

            // res.setHeader('Content-Type', 'application/json');
            // res.setHeader('Access-Control-Allow-Origin', '*');
            // res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            if (req.url === '/main') {
                fs.readFile('./public/index.html', (err, data) => {
                    if (err) {
                        res.writeHead(404);
                        res.write('File not found!');
                    } else {
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.write(data);
                    }
                    res.end();
                });
            } else if (req.url === '/analytics') {
                fs.readFile('./public/analytics.html', (err, data) => {
                    if (err) {
                        res.writeHead(404);
                        res.write('File not found!');
                    } else {
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.write(data);
                    }
                    res.end();
                });
            } else if (req.url === '/updateItemNotifications' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    const item = JSON.parse(body);
                    updateNotificationItem(item)
                        .then(() => {
                            res.statusCode = 200;
                            res.end(JSON.stringify({message: 'Item updated successfully'}));
                        })
                        .catch(error => {
                            console.error('Error updating item:', error);
                            res.statusCode = 500;
                            res.end('Internal Server Error');
                        });
                });
            } else if (req.method === 'POST' && req.url === '/updateItemStatus') {
                let data = '';
                req.on('data', chunk => {
                    data += chunk;
                });
                req.on('end', () => {
                    const item = JSON.parse(data);
                    updateItem(item)
                        .then(() => {
                            res.statusCode = 200;
                            res.end(JSON.stringify({message: 'Item updated successfully'}));
                        })
                        .catch(error => {
                            console.error('Error updating item:', error);
                            res.statusCode = 500;
                            res.end('Internal Server Error');
                        });
                });
            } else if (filePath === './data/data.json') {
                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error(err);
                        res.statusCode = 500;
                        res.end('Internal Server Error');
                        return;
                    }
                    res.end(data);
                });
            } else {
                const contentType = getContentType(filePath);

                if (req.url.includes(".")) {
                    fs.readFile(filePath, (err, data) => {
                        if (err) {
                            if (err.code === 'ENOENT') {
                                res.writeHead(404, {'Content-Type': 'text/html'});
                                res.end('<h1>404 Not Found</h1>');
                            } else {
                                res.writeHead(500, {'Content-Type': 'text/html'});
                                res.end('<h1>500 Internal Server Error</h1>');
                            }
                        } else {
                            res.writeHead(200, {'Content-Type': contentType});
                            res.end(data);
                        }
                    });
                } else {
                    fs.readFile('./public/error.html', (err, data) => {
                        if (err) {
                            res.writeHead(404);
                            res.write('File not found!');
                        } else {
                            res.writeHead(200, {'Content-Type': 'text/html'});
                            res.write(data);
                        }
                        res.end();
                    });
                }
            }
        }
    )
;

function getContentType(filePath) {
    const extname = path.extname(filePath).toLowerCase();
    switch (extname) {
        case '.html':
            return 'text/html';
        case '.css':
            return 'text/css';
        case '.svg':
            return 'image/svg+xml';
        case '.js':
            return 'text/javascript';
        case '.json':
            return 'application/json';
        case '.png':
            return 'image/png';
        case '.jpg':
            return 'image/jpg';
        default:
            return 'application/octet-stream';
    }
}

function updateNotificationItem(item) {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/data.json', 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            const items = JSON.parse(data);
            const updatedItems = items.map(existingItem => {
                if (existingItem.id === Number(item.id)) {
                    existingItem.actionImage = item.actionImage;
                }
                return existingItem;
            });
            fs.writeFile('./data/data.json', JSON.stringify(updatedItems), err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    });
}

function updateItem(item) {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/data.json', 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            const items = JSON.parse(data);
            const updatedItems = items.map(existingItem => {
                if (existingItem.id === Number(item.id)) {
                    existingItem.status = item.status;
                }
                return existingItem;
            });
            fs.writeFile('./data/data.json', JSON.stringify(updatedItems), err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    });
}


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
