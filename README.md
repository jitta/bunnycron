# Bunnycron
Bunnycron is a module for running jobs on your node.js by cron patterns.

## Installation

You can also install via npm:

```sh
npm install bunnycron
```

## User Interface
### Schedule Overview
![summary](https://cloud.githubusercontent.com/assets/837612/3609563/cda4693c-0d7c-11e4-8b64-77ec7ab6c3d9.png)

### Schedule Log
![schedule log](https://cloud.githubusercontent.com/assets/837612/3609667/9ec2fe9c-0d7e-11e4-870c-69d45de7a8fd.png)




## Cronfile
You have to create `Cronfile` on your root directory of your app
![cronfile](https://cloud.githubusercontent.com/assets/837612/3597594/48a60a5e-0cd4-11e4-9cef-e353240433ef.png)




`
00 30 12 * * * node backup_databse.js

*/10 * * * * * ./checkuptime.sh

00 30 11 * * 1-5 curl -o nixcraft.html http://www.cyberciti.biz/low.html
`

## Available Cron patterns

    Asterisk. E.g. *
    Ranges. E.g. 1-3,5
    Steps. E.g. */2
    
## Cron example
    */10 * * * * 1-2  Run every 10 seconds on Monday and Tuesday
    00 */2 * * * *  Run every 2 minutes everyday
    00 30 09-10 * * * Run at 09:30 and 10:30 everyday
    00 30 08 10 06 * Run at 08:30 on 10th June

    - 00 for Sunday or 24.00


[Read more cron patterns here](http://www.thegeekstuff.com/2009/06/15-practical-crontab-examples/).

    



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
