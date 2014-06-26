with( this ){
;// ../../../../jin.jam.js
/**
 * @name $jin
 * @class $jin
 * @singleton
 */
this.$jin = {}

;// ../../../../value/jin-value.jam.js
this.$jin.value = function $jin_value( value ){
    
    var func = function $jin_value_instance( ){
        return func.$jin_value
    }
    
    func.$jin_value = value
    
    return func
}

;// ../../../../root/jin_root.jam.js
this.$jin.root = $jin.value( this )

;// ../../../../trait/jin_trait.jam.js
this.$jin.trait = function( name ){
    
    var trait = $jin.glob( name )
    if( trait ) return trait
    
    trait = $jin.trait.make( name )
    
    return $jin.glob( name, trait )
}

this.$jin.trait.make = function( name ){
    
    var trait = function jin_trait_instance( ){
		return trait.exec.apply( trait, arguments )
    }

    trait.displayName = name
    
    return trait
}

;// ../../../../glob/jin_glob.jam.js
$jin.glob = function $jin_glob( name, value ){
    var keyList = name.split( '.' )
    var current = $jin.root()
    var currentName = ''
    
    while( keyList.length > 1 ){
        var key = keyList.shift() || 'prototype'
        currentName += ( currentName ? '.' : '' ) + ( key === 'prototype' ? '' : key )
        
        if(!( key in current )){
            current[ key ] = $jin.trait.make( currentName )
        }
        
        current = current[ key ]
    }
    
    var key = keyList.shift() || 'prototype'
    
    if( arguments.length > 1 ){
        current[ key ] = value
    } else {
        value = current[ key ]
    }
    
    return value
}

;// ../../../../definer/jin-definer.jam.js
/**
 * Создаёт функцию, используемую для создания других сущностей.
 *
 * Все сущности создаются единообразно, через так называемые дефайнеры, которые реализуют две сигнатуры:
 *
 *     function( path : string, config : any ) - в случае статического path лучше использовать вторую форму
 *
 *     function({ path : any }) - этот варинт добавляет $jin.definer
 *
 * Преимущества такого способа объявления сущностей в сравнении с традиционным присвоением:
 *
 *  * Автоматически создаются промежуточные пространства имён.
 *  * Каждая определенная в config функция имееет отображаемое являющееся полным путём к ней (очень удобно при отладке).
 *  * Возможно отслеживание затирания одной сущности другой (избавляет от проблем со случайным затиранием).
 *  * Возможно создание не одной сущности, а целого семейства.
 *  * Возможна регистрация одной сущности в более чем одном месте.
 *  * Каждое определение сущности не зависит от окружения и содержит полную информацию о ней (что, например, используется для генерации jsdoc/jsduck коментариев).
 *  * Легко найти сущность, по имени простым поиском.
 *
 * Недостатки:
 *
 *  * Чтобы IDE и генераторы документации понимали такие определения необходимы развесистые jsdoc/jsduck коментарии.
 *  * В каждом определении указывается полный путь к сущности.
 *
 * @param {string} path
 * @param {function( path: string, config : object )} definer
 */
$jin.definer = function( path, definer ){
	
	var wrapper = function( defines, arg ){
		if( arguments.length > 1 ){
			if( defines == null ) return function( path ){
				return definer( path, arg )
			}
			return definer.apply( null, arguments )
		} else {
			if( typeof defines === 'function' ) defines = new defines
			for( var path in defines ){
				definer( path, defines[ path ] )
			}
		}
	}
	
	return $jin.glob( path, wrapper )
}

$jin.definer( '$jin.definer', $jin.definer )

;// ../../../../func/jin_func.jam.js
this.$jin.func = {}

this.$jin.func.make = function( name ){
    var func = function( ){
        return func.execute( this, arguments )
    }
    return func
}

this.$jin.func.name = function( func, name ){
    if( arguments.length > 1 ) return func.$jin_func_name = name
    return func.name
    || func.$jin_func_name
    || func.toString().match( /^\s*function\s*([$\w]*)\s*\(/ )[ 1 ]
}

this.$jin.func.usages = function( func ){
	if( func.jin_func_usages ) return func.jin_func_usages
	var found = {}
	Object.toString.call( func ).replace( /\$[a-z][a-z0-9]+(\.[a-z][a-z0-9]*)+/g, function( token ){
		found[ token ] = true
	})
	return func.jin_func_usages = Object.keys( found )
}

;// ../../../../method/jin_method.jam.js
/**
 * Создаёт произвольный метод по указанному пути.
 * В случае если по этому пути уже определен метод, то он будет замещен /конфликтным методом/, который бросает исключение привызове.
 * Чтобы перегрузить один метод другим, необходимо в теле второго упоменуть полное имя первого.
 *
 * Преимущества такого способа определения методов:
 *
 *  * Невозможно случайно затереть уже существующий метод - это возможно только явно.
 *  * Возможность определять методы в произвольном порядке, в том числе даже после примешивания штриха в другой класс.
 *  * Каждая реализация доступна по полному имени в том же объекте, что позволяет точно выбирать какую реализацию вызывать (например, когда надо вызвать реализацию деда в обход родителя), а также даёт минимальное пенельни по производительности (вызов напрямую, вместо apply).
 *
 * @name $jin.method
 * @method method
 * @param {{ path : function }} config
 * @static
 * @member $jin
 */
$jin.definer({ '$jin.method': function( ){ // arguments: resolveName*, path, func
    var resolveList = [].slice.call( arguments )
    var func = resolveList.pop()
    
	var name = resolveList.pop()
	if( !name ) throw new Error( 'Not defined method name' )
	
	if( !func.jin_method_resolves ){
		func.jin_method_resolves = resolveList
		Object.toString.call( func ).replace( /['"](\$[.\w]+)['"]/g, function( str, token ){
			if( resolveList.indexOf( token ) >= 0 ) return str
			resolveList.push( token )
		})
	}
	
    var funcName = func.displayName
    if( !funcName ) funcName = func.displayName = name
    //throw new Error( 'displayName is not defined in [' + func + ']' )
    
    var nameList = name.split( '.' )
    var methodName = nameList.pop()
    var ownerPath = nameList.join( '.' )
    var owner = $jin.trait( ownerPath )
    var slaveList = owner.jin_mixin_slaveList
    
    owner[ funcName ]= func
    
    if( slaveList ) slaveList.forEach( function( slavePath ){
        $jin.method( slavePath + '.' + methodName, func )
    })
    
    var existFunc = owner[ methodName ]
    checkConflict: {
        
        if( existFunc === void 0 ) break checkConflict
        
        if( typeof existFunc !== 'function' ){
            throw new Error( 'Can not redefine [' + existFunc + '] by [' + funcName + ']' )
        }
        
        if( func === existFunc ) return existFunc
        
        if( !existFunc.displayName ) break checkConflict
        
        func = $jin.method.merge( existFunc, func, name )
    }
    
    owner[ methodName ]= func
    
    if( slaveList ) slaveList.forEach( function( slavePath ){
        $jin.method( slavePath + '.' + methodName, func )
    })
    
    return func
}})

$jin.method.merge = function $jin_method_merge( left, right, name ){
    var leftConflicts = left.jin_method_conflicts || [ left ]
    var rightConflicts = right.jin_method_conflicts || [ right ]
    var conflictList = leftConflicts.concat( rightConflicts )

    var leftResolves = left.jin_method_resolves || []
    var rightResolves = right.jin_method_resolves || []
    var resolveList = leftResolves.concat( rightResolves )
    
    conflictList = conflictList.filter( function( conflict ){
        return !~resolveList.indexOf( conflict.displayName )
    })
    
    if( conflictList.length === 0 ){
        throw new Error( 'Can not resolve conflict ' + name + ' because cyrcullar resolving' )
    } else if( conflictList.length === 1 ){
        var func = conflictList[0]
    } else if( conflictList.length > 1 ){
        var func = $jin.func.make( name )
        func.execute = function( ){
            var conflictNames = conflictList.reduce( function( names, func ){
                var name = func.displayName
				if( names.indexOf( name ) >= 0 ) return names
				
				names.push( name )
				return names
            }, [] )
            throw new Error( "Conflict in [" + name + "] by [" + conflictNames + "]" )
        }
        func.displayName = name
        func.jin_method_conflicts = conflictList
    }
    
    func.jin_method_resolves = resolveList
    
    return func
}

;// ../../../../l10n/jin-l10n.jam.js
/**
 * @name $jin.l10n
 * @method l10n
 * @member $jin
 * @static
 */
$jin.method({ '$jin.l10n': function( scope, text ){
	return text
}})

;// ../../../../property/jin_property.jam.js
/**
 * @name $jin.property
 * @method property
 * @static
 * @member $jin
 */
$jin.definer({ '$jin.property': function( ){ // arguments: resolveName*, path, filter
    var resolveList = [].slice.call( arguments )
    var filter = resolveList.pop()
    var name = resolveList.pop()
    var fieldName = '_' + name
	
	if( filter ){
		var property = function( next ){
			var prev = this[ fieldName ]
			if( arguments.length ){
				if( next === prev ) return this
				if( next === void 0 ){
					this[ fieldName ] = next
				} else {
					this[ fieldName ] = filter.call( this, next )
				}
				return this
			} else {
				if( prev === void 0 ){
					return this[ fieldName ] = filter.call( this )
				} else {
					return prev
				}
			}
		}
	} else {
		var property = function( value ){
			if( arguments.length ){
				this[ fieldName ] = value
				return this
			} else {
				return this[ fieldName ]
			}
		}
	}
    
    property.jin_method_resolves = filter && filter.jin_method_resolves || resolveList
    
    return $jin.method( name, property )
}})

/**
 * @name $jin.property.hash
 * @method hash
 * @static
 * @member $jin.property
 */
$jin.definer({ '$jin.property.hash': function( path, config ){
	var fieldName = '_' + path
	var pull = config.pull || config.sync
	var put = config.put || config.sync
	var push = config.push
	
	var propHash = function( key, value ){
		var storage = this[ fieldName ]
		if( !storage ) storage = this[ fieldName ] = {}
		if( arguments.length > 1 ){
			var value2 = put ? put.call( this, key, value ) : value
			if( value2 === void 0 ) delete storage[ key ]
			else storage[ key ] = value2
			return this
		} else if( arguments.length ) {
			if( typeof key === 'object' ){
				for( var k in key ){
					propHash.call( this, k, key[ k ] )
				}
				return this
			}
			var value2 = storage[ key ]
			if( pull && value2 === void 0 ) value2 = storage[ key ] = pull.call( this, key )
			return value2
		} else {
			return storage
		}
	}
	
	return $jin.method( path, propHash )
}})

;// ../../../../concater/jin-concater.jam.js
/**
 * @name $jin.concater
 * @method concater
 * @member $jin
 * @static
 */
$jin.method({ '$jin.concater': function( funcs ){
	switch( funcs.length ){
		case 0: return String
		case 1: return funcs[0]
		default:
			var mid = Math.ceil( funcs.length / 2 )
			var first = $jin.concater( funcs.slice( 0, mid ) )
			var second = $jin.concater( funcs.slice( mid ) )
			var types = ( typeof first === 'function' ) + ':' + ( typeof second === 'function' )
			switch( types ){
				case 'true:true': return function( value ){
					return first( value ) + second( value )
				}
				case 'false:true': return function( value ){
					return first + second( value )
				}
				case 'true:false': return function( value ){
					return first( value ) + second
				}
				case 'false:false': return function( value ){
					return first + second
				}
			}
	}
}})

;// ../../../../pipe/jin-pipe.jam.js
/**
 * @name $jin.pipe
 * @method pipe
 * @member $jin
 * @static
 */
$jin.method({ '$jin.pipe': function( funcs ){
	switch( funcs.length ){
		case 0: return $jin.pipe.nop
		case 1: return funcs[0]
		default:
			var mid = Math.ceil( funcs.length / 2 )
			var inner = $jin.pipe( funcs.slice( 0, mid ) )
			var outer = $jin.pipe( funcs.slice( mid ) )
			return function( value ){
				return outer( inner( value ) )
			}
	}
}})

/**
 * @name $jin.pipe.nop
 * @method nop
 * @member $jin.pipe
 * @static
 */
$jin.method({ '$jin.pipe.nop': function( value ){
	return value
}})
;// ../../formatter.jam.js
/**
 * Generator of date-formatters.
 * Date-formatter is a function that returns string representation of a date.
 *
 * 0 params: hash-table of all patterns
 * 1 param: return date-formatter by pattern
 * 2 params: assign date-formatter for pattern
 *
 * Mnemonics:
 *
 *  * single letter for numbers: M - month number, D - day of month.
 *  * uppercase letters for dates, lowercase for times: M - month number , m - minutes number
 *  * repeated letters for define register count: YYYY - full year, YY - shot year, MM - padded month number
 *  * words, same letter case: Month - localized capitalized month name
 *  * shortcuts: WD - short day of week, Mon - short month name.
 *  * special identifiers: iso8601, stamp.
 *
 * Complex patterns splits by words and then substitute by date-formatters for short patterns
 * For localize output override $jin.l10n( scope, text )
 *
 * Typical usage:
 *     var formatTime = $jin.date.formatter( 'Weekday, YYYY-MM-DD hh:mm' )
 *     formatTime( new Date )
 *
 * @name $jin.date.formatter
 * @method formatter
 * @member $jin.date
 * @param {string} [pattern]
 * @param {function(Date)} [formatter]
 * @static
 */
$jin.property.hash({ '$jin.date.formatter': { pull: function( pattern ) {

	var lexems = $jin.date.formatter()

	var funcs = []

	pattern.replace( /([^%a-z0-9]*)([%a-z0-9]*)/gi, function( str, text, token ){
		if( text ) funcs.push( text )
		if( token ) funcs.push( lexems[ token ] || token )
	})

	return $jin.concater( funcs )
}}})

/**
 * Дополняет переданное число ведущим нулём, если оно меньше 10.
 *
 * @name $jin.date.formatter.pad2
 * @method pad2
 * @member $jin.date.formatter
 * @param {number} val
 * @returns {string|number}
 * @static
 */
$jin.method({ '$jin.date.formatter.pad2': function( val ){
	return ( val > 9 ) ? val : '0' + val
}})

/**
 * Переводит переданню строку в нижний регистр.
 *
 * @name $jin.date.formatter.lower
 * @method lower
 * @member $jin.date.formatter
 * @param {string} val
 * @returns {string}
 * @static
 */
$jin.method({ '$jin.date.formatter.lower': function( val ){
	return val.toLowerCase()
}})

;// ../../formatter_patterns.jam.js
$jin.date.formatter( 'Month', function( date ){
	var months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]
	return $jin.l10n( '$jin.date.formatter:Month', months[ date.getMonth() ] )
})
$jin.date.formatter( 'month', $jin.pipe([ $jin.date.formatter( 'Month' ), $jin.date.formatter.lower ]) )

$jin.date.formatter( 'Mon', function( date ){
	var months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]
	return $jin.l10n( '$jin.date.formatter:Mon', months[ date.getMonth() ] )
})
$jin.date.formatter( 'mon', $jin.pipe([ $jin.date.formatter( 'Mon' ), $jin.date.formatter.lower ]) )

$jin.date.formatter( 'Weekday', function( date ){
	var days = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ]
	return $jin.l10n( '$jin.date.formatter:Weekday', days[ date.getDay() ] )
})
$jin.date.formatter( 'weekday', $jin.pipe([ $jin.date.formatter( 'Weekday' ), $jin.date.formatter.lower ]) )

$jin.date.formatter( 'WD', function( date ){
	var days = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ]
	return $jin.l10n( '$jin.date.formatter:WD', days[ date.getDay() ] )
})
$jin.date.formatter( 'wd', $jin.pipe([ $jin.date.formatter( 'WD' ), $jin.date.formatter.lower ]) )

$jin.date.formatter( 'iso', function( date ){
	return date.toISOString()
})

$jin.date.formatter( 'stamp', function( date ){
	return date.getTime()
})

$jin.date.formatter( 'YYYY', function( date ){
	return date.getFullYear()
})
$jin.date.formatter( 'AD', function( date ){
	return Math.ceil( date.getFullYear() / 100 )
})
$jin.date.formatter( 'YY', function( date ){
	return date.getFullYear() % 100
})

$jin.date.formatter( 'M', function( date ){
	return date.getMonth() + 1
})
$jin.date.formatter( 'MM', $jin.pipe([ $jin.date.formatter( 'M' ), $jin.date.formatter.pad2 ]) )

$jin.date.formatter( 'D', function( date ){
	return date.getDate()
})
$jin.date.formatter( 'DD', $jin.pipe([ $jin.date.formatter( 'D' ), $jin.date.formatter.pad2 ]) )

$jin.date.formatter( 'h', function( date ){
	return date.getHours()
})
$jin.date.formatter( 'hh', $jin.pipe([ $jin.date.formatter( 'h' ), $jin.date.formatter.pad2 ]) )

$jin.date.formatter( 'm', function( date ){
	return date.getMinutes()
})
$jin.date.formatter( 'mm', $jin.pipe([ $jin.date.formatter( 'm' ), $jin.date.formatter.pad2 ]) )

$jin.date.formatter( 's', function( date ){
	return date.getSeconds()
})
$jin.date.formatter( 'ss', $jin.pipe([ $jin.date.formatter( 's' ), $jin.date.formatter.pad2 ]) )

$jin.date.formatter( 'zone', function( date ){
	var pad2 = $jin.date.formatter.pad2
	var offset = date.getTimezoneOffset()
	if( offset < 0 ){
		var sign = '+'
		offset = -offset
	} else {
		var sign = '-'
	}
	return sign + pad2( Math.floor( offset / 60 ) ) + ':' + pad2( offset % 60 )
})


;// ../strftime.jam.js
/**
 * strftime-like api
 *
 * @name $jin.date.formatter.strftime
 * @method strftime
 * @member $jin.date.formatter
 * @static
 */
$jin.method({ '$jin.date.formatter.strftime': function( pattern, time ){
	return this( pattern )( time || new Date )
}})

$jin.date.formatter( '%Y', $jin.date.formatter( 'YYYY' ) )
$jin.date.formatter( '%C', $jin.date.formatter( 'AD' ) )
$jin.date.formatter( '%y', $jin.date.formatter( 'YY' ) )

$jin.date.formatter( '%m', $jin.date.formatter( 'MM' ) )

$jin.date.formatter( '%B', $jin.date.formatter( 'Month' ) )
$jin.date.formatter( '%b', $jin.date.formatter( 'Mon' ) )
$jin.date.formatter( '%h', $jin.date.formatter( '%b' ) )

$jin.date.formatter( '%A', $jin.date.formatter( 'Weekday' ) )
$jin.date.formatter( '%a', $jin.date.formatter( 'WD' ) )

$jin.date.formatter( '%d', $jin.date.formatter( 'DD' ) )
$jin.date.formatter( '%e', $jin.date.formatter( 'D' ) )

$jin.date.formatter( '%H', $jin.date.formatter( 'hh' ) )
$jin.date.formatter( '%M', $jin.date.formatter( 'mm' ) )
$jin.date.formatter( '%S', $jin.date.formatter( 'ss' ) )

$jin.date.formatter( '%z', $jin.date.formatter( 'zone' ) )

// Added by Mark because missing.
$jin.date.formatter( '%F', $jin.date.formatter( '%Y-%m-%d' ) )
$jin.date.formatter( '%T', $jin.date.formatter( '%H:%M:%S' ) )
exports.strftime = $jin.date.formatter.strftime.bind($jin.date.formatter)
}
