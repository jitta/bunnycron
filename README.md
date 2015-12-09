# Bunnycron
Bunnycron is a job scheduling module trigged by your node.js process. Bunnycron will schedule a job based on a cron syntax textfile in your project directory, so you can keep your job scheduling definition in your git repository. With a lock machanism provided by [Redis](http://redis.io), Bunnycron will prevent the same job running multiple times within a cluster. It provides a clean user interface to monitor your jobs and their statuses.

[![Build Status](https://travis-ci.org/jitta/bunnycron.svg)](https://travis-ci.org/jitta/bunnycron)




![rabbit-resize](https://cloud.githubusercontent.com/assets/837612/8177518/c49d1a5e-142f-11e5-9d30-f7da1ee9e4f8.png)

## Installation

Install via npm:

```sh
npm install bunnycron
```

## User Interface
### Schedule Overview
Bunnycron provides a clean user-interface for viewing your scheduled jobs.

![Homepage](https://cloud.githubusercontent.com/assets/837612/3614327/7ff3db9e-0dbf-11e4-8c7e-b045899b7c29.jpg)

### Schedule Log
The logging system allows you to see how your job processed

![Schedule log](https://cloud.githubusercontent.com/assets/837612/3609667/9ec2fe9c-0d7e-11e4-870c-69d45de7a8fd.png)



## Cronfile
First create a `Cronfile` file in your root directory of your project.

![cronfile](https://cloud.githubusercontent.com/assets/837612/3597594/48a60a5e-0cd4-11e4-9cef-e353240433ef.png)


An example of `Cronfile` with the same syntax of your familiar Crontab

    00 30 12 * * * node backup_databse.js

	*/10 * * * * * ./checkuptime.sh

	00 30 11 * * 1-5 curl -o aapl.html http://www.jitta.com/stock/aapl


## Available Cron Patterns

    Asterisk. E.g. *
    Ranges. E.g. 1-3,5
    Steps. E.g. */2

## Cronfile Examples
    */10 * * * * 1-2  echo "Run every 10 seconds on Monday and Tuesday"
    00 */2 * * * *  echo "Run every 2 minutes everyday"
    00 30 09-10 * * * echo "Run at 09:30 and 10:30 everyday"
    00 30 08 10 06 * echo "Run at 08:30 on 10th June"

    - 00 for Sunday or 24.00


[Read more cron patterns here](http://www.thegeekstuff.com/2009/06/15-practical-crontab-examples/).


## Running a Cronjob

```js
var bunny = require('bunnycron')();
bunny.startCron();
```

## Redis Connection Settings

```js
var options = {
  redis: {
    port: 1234,
    host: '10.12.33.44',
    auth: 'fj2ifjeo2j'
}
bunny = require('bunnycron')(options);
bunny.startCron()
```

when required bunnycron module you can pass `options` in an object with the following possible properties.

* `cronFile` : the directory path to `Cronfile` ex. `./path/to/dir`
* `redis` : by default, Bunnycron will connect to Redis using the client default settings (port defaults to `6379` and host defaults to `127.0.0.1`, prefix defaults to `bunny`)
* `prefix` : defaults to `bunny`. Custom redis predix
* `debug` : send log data to stdout.



## User-Interface
To view your scheduled jobs UI. You can use `bunny.app` within your existing express.js application.

```js
var express = require('express');
var app = express();
var bunny = require('bunnycron')()
bunny.startCron();
app.use(bunny.app);
// app.use('/bunny/', bunny.app) or custom base url
app.listen(3000);

```








## License

(The MIT License)

Copyright (c) 2014 Jitta &lt;dev@jitta.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
