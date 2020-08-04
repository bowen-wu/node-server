import * as http from "http";
import {IncomingMessage, ServerResponse} from "http";
import * as path from 'path';
import * as fs from "fs";
import * as url from "url";

const server = http.createServer();
const publicDir = path.resolve(__dirname, 'public');
const cacheAge = 3600 * 24 * 365;

server.on('request', (request: IncomingMessage, response: ServerResponse) => {
    console.log('请求了');
    const {url: urlPath, method, headers} = request;
    const {pathname} = url.parse(urlPath);

    if(method !== 'GET') {
        response.statusCode = 405;
        response.end();
        return;
    }

    // response.setHeader('Content-Type', 'text/html; charset=utf-8');
    const filePath = pathname.slice(1) || 'index.html';
    fs.readFile(path.resolve(publicDir, filePath), (error, data) => {
        console.log(error);
        if (error) {
            if (error.errno === -2) {
                response.statusCode = 404;
                fs.readFile(path.resolve(publicDir, '404.html'), (err, data) => {
                    if (err) throw err;
                    response.end(data);
                });
            } else if (error.errno === -21) {
                response.statusCode = 403;
                response.end('无权查看文件！');
            } else {
                response.statusCode = 500;
                response.end('服务器出错！');
            }

        } else {
            response.setHeader('Cache-Control', `public, max-age=${cacheAge}`)
            response.end(data);
        }
    });
});

server.listen(8888, () => {
    console.log(server.address());
});
