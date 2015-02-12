var crypto = require('crypto');
var child = require('child_process');
var os = require('os');
var argv = require('minimist')(process.argv.slice(2),{string:['m','_']});

var MAX_WORKERS = os.cpus().length;
var HASHTYPE = "sha256";

if(typeof argv.t != "undefined")
{
	var validHashes = crypto.getHashes();
	HASHTYPE = argv.t.trim();
	if(validHashes.indexOf(HASHTYPE) == -1)
	{
		console.error("Unsupported hash type:", HASHTYPE);
		process.exit();
	}
}

args = argv._;
if(args[0]) var MODE = args[0];

switch(MODE)
{
    case "worker":
        process.title = "HashWorker";

        if(args[1] != "")
        	var OFFSET = parseInt(args[1]);
        if(args[2] != "")
        	var RANGE = parseInt(args[2]);
        if(args[3] != "")
        	var NEEDLE = args[3];

        var PREFIX = "";
        if(typeof args[4] != "undefined")
        	PREFIX = args[4];

        var i = 0;
        var hashcount = 0;

        setInterval(function(){
            process.send(JSON.stringify({action:"hashrate", rate:hashcount}));
            hashcount = 0;
        }, 1000);

        process.send(JSON.stringify({action:"hello", offset:OFFSET, range:RANGE}));

    	process.on('message', function(response) {
    		var data = JSON.parse(response);
    		switch(data.action)
    		{
                case "work":
                    i = 0;
                    OFFSET = data.offset;
                    RANGE = data.range;
                    compute();
    			break;
    		}
    	});

        function compute()
        {
            var NONCE = OFFSET+i;
            var inputValue = PREFIX+NONCE.toString(16);

            var hash = crypto.createHash(HASHTYPE).update(inputValue.toString()).digest("hex");
            if(hash.lastIndexOf(NEEDLE, 0) === 0)
                process.send(JSON.stringify({action:"found", input:inputValue, result:hash}));

            i++;
            hashcount++;
            if(i < RANGE)
                setImmediate(compute);
            else
                process.send(JSON.stringify({action:"getwork"}));
        }
        compute();

    break;

    default:
        console.error("Pattern hasher v0.1");

        if(args[0] != "")
        	var NEEDLE = args[0];

        var PREFIX = "";
        if(typeof args[1] != "undefined")
        	PREFIX = args[1];

        var WORKER_WIDTH = 100000000;
        var hashrate = Array();

        setInterval(function(){
            var totalhash = 0;
            for (var i = 0, len = hashrate.length; i < len; i++) {
              totalhash += hashrate[i];
            }
            console.error("Rate:",Math.round((totalhash)/1000)+"Kh/s");
        }, 5000);


        var WORKER_OFFSET = 0;

        for(var i=0; i < MAX_WORKERS; i++)
        {
        	var worker = child.fork(process.argv[1], ["-t "+HASHTYPE,"worker",WORKER_OFFSET, WORKER_WIDTH, NEEDLE, PREFIX]);
            hashrate.push(0);

            worker.index = i;
        	worker.on('close', function (code) {
                hashrate[this.index] = 0;
        		if(code > 0)
                    console.error('Worker '+this.index+' process exited with code ' + code);

                if(code == 0)
                {

                }
        	});

        	worker.on('message', function(response) {
        		var data = JSON.parse(response);
        		switch(data.action)
        		{
        			case "found":
        				console.log(data.input, data.result);
        			break;

                    case "hello":
                        //console.error("Worker "+this.index+" running.");
        			break;

                    case "hashrate":
                        hashrate[this.index] = data.rate;
        			break;

                    case "getwork":
                        console.error("Worker "+this.index+" resumed at", WORKER_OFFSET );
                        this.send(JSON.stringify({action:"work", offset:WORKER_OFFSET, range:WORKER_WIDTH}));
                        WORKER_OFFSET += WORKER_WIDTH;
        			break;
        		}
        	});

            WORKER_OFFSET += WORKER_WIDTH;
        }

    break;
}
