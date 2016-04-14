"use strict";

const os = require('os');
const argv = require('minimist')(process.argv.slice(2),{string:['m','_']});
const crypto = require('crypto');
const Worker = require('./worker');
const Foreman = require('./foreman');

const MAX_WORKERS = os.cpus().length;
const WORKER_WIDTH = 10000000;

let HASHTYPE = "sha256";
let WORKERS = MAX_WORKERS;
let PREFIX = "";

//What what cypher to use
if(typeof argv.t !== "undefined") {
	var validHashes = crypto.getHashes();
	HASHTYPE = argv.t.trim();
	if(validHashes.indexOf(HASHTYPE) === -1) {
		console.error("Unsupported hash type:", HASHTYPE);
		process.exit();
	}
}

//Specify seed prefix
if(typeof argv.p !== "undefined") {
	PREFIX = argv.p.trim();
}

//Detune
if(typeof argv.d !== "undefined") {
	WORKERS -= parseInt(argv.d);
	if(WORKERS < 1) { WORKERS = 1; }
}

let args = argv._;
if(args[0]) { var MODE = args[0]; }

switch(MODE) {
    case "worker":
        process.title = "HashWorker";
        if(args[1] !== "") { var NEEDLE = args[1]; }
		var worker = new Worker(HASHTYPE, NEEDLE, PREFIX);

		worker.begin();
    break;

    default:
        console.error("Findhash v1.0");
		if(args[0] !== "") {
			var NEEDLE = args[0];
		}
		var foreman = new Foreman(HASHTYPE, PREFIX, NEEDLE, WORKERS, WORKER_WIDTH);

		foreman.begin();
    break;
}
