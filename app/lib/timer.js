if(typeof performance !== 'undefined')
    define([], function() {
        return {
            now: function(){ return performance.now(); }
        };
    });
else if(typeof process !== 'undefined')
    define([], function() {
        return {
            now: function() {
                var time = process.hrtime();
                return (time[0] * 1e3 ) + (time[1] * 1e-6);
            }
        };
    });
else
    throw new Error('No timer implementation is available.');

