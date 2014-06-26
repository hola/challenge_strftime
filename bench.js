#!/usr/bin/node --harmony-generators
var assert = require('assert');
var suite = new (require('benchmark').Suite);

var functions = [];
var variants = ['original', 'siranthony', 'ibnrubaxa', 'rzcoder',
    'newbiecraft', 'mapostol', 'smitterz', 'lordblackfox', 'an12345',
    'lexich121', 'sergii.shpak', 'kuchumovn', 'sairi.na.tenshi', 'juliasoft',
    'karol_wegrzycki', 'azazel', 'dm.ashurov', 'nikitin.alexandr',
    'trialforlife', 'autarc'];
variants.forEach(function(variant){
    functions.push(require('./submissions/'+variant+'_strftime').strftime); });

var test_cases = ['%A, %B %d, %Y', '%F %T', '%a, %d %b %Y %H:%M:%S'];
var dates = [];
var count = 1000;
var res, i;
for (i = 0; i < count; i++)
    dates.push(new Date((Math.random() + 0.5) * 1000000000000));

test_cases.forEach(function(test_case){
    console.log('--- sanity ('+test_case+') ---');
    res = functions[0](test_case, dates[0]);
    console.log('=== '+res);
    for (i = 1; i < functions.length; i++)
    {
        console.log('* '+variants[i]);
        assert.strictEqual(res, functions[i](test_case, dates[0]));
    }

    for (i = 0; i < functions.length; i++)
    {
        suite.add(variants[i]+' ('+test_case+')', function(fn){
            return function(){
                for (i = 0; i < count; i++)
                    res = fn(test_case, dates[i]);
            };
        }(functions[i]))
    }
});

suite.on('cycle', function(ev){ console.log(ev.target.toString()); })
.on('complete', function(){
    console.log('--- complete ---');
    process.exit();
});

if (require.main===module)
{
    console.log('--- starting ---');
    suite.run({async: false});
}
