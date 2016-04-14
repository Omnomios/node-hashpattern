var crypto = require('crypto');

module.exports = function(hashtype, offset, range, needle, prefix) {
    this.OFFSET = offset;
    this.RANGE = range;
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

    i: 0,
    hashcount: 0,

    begin: function() {
        process.send(JSON.stringify({action:"hello", offset: this.OFFSET, range: this.RANGE }));
        process.on('message', this.message);
        setImmediate(()=>{this.compute();});
        setInterval(()=>{this.sendRate();}, 1000);
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
                setImmediate(()=>{this.compute();});
			break;
		}
    },

    calcHash: function(inputValue) {
        return crypto.createHash(this.HASHTYPE).update(inputValue.toString()).digest("hex");
    },

    compute: function() {
        var nonce = this.OFFSET+this.i;
        var inputValue = this.PREFIX+nonce.toString(16);
        var hash = this.calcHash(inputValue);
        if(hash.lastIndexOf(this.NEEDLE, 0) === 0) {
			process.send(JSON.stringify({action:"found", input:inputValue, result:hash}));
		}
        this.i++;
        this.hashcount++;
        if(this.i < this.RANGE) {
			setImmediate(()=>{this.compute();});
		} else {
			process.send(JSON.stringify({ action:"getwork" }));
		}
    }
}
