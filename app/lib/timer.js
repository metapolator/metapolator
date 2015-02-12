define([], (function(){
    var module;

    if(typeof performance !== 'undefined')
        module = function() {
            return {
                now: function(){ return performance.now(); }
            };
        };
    else if(typeof process !== 'undefined')
        module = function() {
            return {
                now: function() {
                    var time = process.hrtime();
                    return (time[0] * 1e3 ) + (time[1] * 1e-6);
                }
            };
        };
    else
        throw new Error('No timer implementation is available.');

    return module;
})());
