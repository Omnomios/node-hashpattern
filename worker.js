"use strict";

const crypto = require('crypto');

module.exports = function(hashtype, needle, prefix) {
    this.NEEDLE = needle;
    this.PREFIX = prefix;
    this.HASHTYPE = hashtype;
    return this;
}

module.exports.prototype = {

    OFFSET: 0,
    RANGE: 0,
    NEEDLE: 0,
    PREFIX: 0,
    HASHTYPE: "",


    frametime: 0,
    i: 0,
    hashcount: 0,

    begin: function() {
        process.send(JSON.stringify({action:"hello", offset: this.OFFSET, range: this.RANGE }));
        process.on('message', (data)=>{this.message(data);});
        //setInterval(()=>{this.sendRate();}, 1000);
        process.nextTick(()=>{this.compute();});
    },

    sendRate: function() {
        process.send(JSON.stringify({ action:"hashrate", rate:this.hashcount }));
        this.hashcount = 0;
    },

    message: function(response) {
        var data = JSON.parse(response);
		switch(data.action) {
            case "work":
                this.i = 0;
                this.OFFSET = data.offset;
                this.RANGE = data.range;
                process.nextTick(()=>{this.compute();});
			break;
		}
    },

    calcHash: function(inputValue) {
        return crypto.createHash(this.HASHTYPE).update(inputValue.toString()).digest("hex");
    },

    compute: function() {
        var nonce = this.OFFSET+this.i;
        const inputValue = this.PREFIX+nonce.toString(16);
        const hash = this.calcHash(inputValue);

        if(hash.indexOf(this.NEEDLE, 0) === 0) {
			process.send(JSON.stringify({action:"found", input:inputValue, result:hash}));
		}

        if(this.frametime < new Date().getTime()) {
            this.frametime = new Date().getTime()+100;
            this.sendRate();
        }

        this.i++;
        this.hashcount++;
        if(this.i < this.RANGE) {
			return process.nextTick(()=>{ this.compute(); });
		} else {
            this.sendRate();
			return process.send(JSON.stringify({ action: "getwork" }));
		}
    }
}
