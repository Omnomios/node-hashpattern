"use strict";
const child = require('child_process');

module.exports = function(hashtype, prefix, needle, maxWorkers, workerWidth) {

    this.needle = needle;
    this.seedprefix = prefix;
    this.hashtype = hashtype;
    this.maxWorkers = maxWorkers;
    this.workerWidth = workerWidth;

    return this;
};

module.exports.prototype = {
    needle: "",
    seedprefix: "",
    hashrate: [],
    workerOffset: 0,
    workerWidth: 0,
    maxWorkers: 0,
    workerCount: 0,
    worker: [],

    begin: function() {
        const hashrateInterval = 5000;

        setInterval(()=>{ this.calcHashes(hashrateInterval); }, hashrateInterval);
        for(var i=0; i < this.maxWorkers; i++) {
            this.startWorker(i);
        }
    },

    calcHashes: function(duration) {
        let totalhash = 0;

        for (var i = 0, len = this.hashrate.length; i < len; i++) {
          totalhash += this.hashrate[i];
		  this.hashrate[i] = 0;
        }

        let delta = 1000 / duration;
        totalhash *= delta;

        if(!isNaN(totalhash)) {
            console.error(`Rate: ${this.humanHashes(totalhash)}/s [thread ${this.humanHashes(totalhash/this.hashrate.length)}/s]`);
        }
    },

    startWorker: function(index) {
        var parentThis = this;

        var childArgs = [];

        childArgs.push("-t "+this.hashtype);
        if(this.seedprefix !== "") {
            childArgs.push("-p "+this.seedprefix);
        }
        childArgs.push("worker");
        childArgs.push(this.needle);

        var worker = child.fork(process.argv[1], childArgs);

        worker.index = index;
    	worker.on('close', function (code) {
            parentThis.hashrate[this.index] = 0;
    		if(code > 0) {
				console.error(`Worker ${this.index} exited with code ${code}`);
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
    			break;

                case "hashrate":
                    parentThis.hashrate[this.index] += data.rate;
    			break;

                case "getwork":
                    console.error(`Worker ${this.index} gets ${parentThis.workerOffset}`);
                    this.send(JSON.stringify({action:"work", offset:parentThis.workerOffset, range:parentThis.workerWidth}));
                    parentThis.workerOffset += parentThis.workerWidth;
    			break;
    		}
    	});
        this.worker[index] = worker;
    },

    humanHashes: function(hashes) {
    	var sizes = ['h', 'Kh', 'Mh', 'Gh', 'Th'];
    	if (hashes === 0){ return '0 H/s'; }
    	var i = parseInt(Math.floor(Math.log(hashes) / Math.log(1000)));
    	return Math.round(hashes / Math.pow(1000, i), 2) + ' ' + sizes[i];
    }

};
