function inline(f) {
    return String(f).split('\n').slice(1, -1).join('\n') + '\n';
}

module.exports = {
    // 'Thursday'
    'A': inline(function (__R, __L, __D) {
        var __D_getDay = __D.getDay();
        __R += __L.days[__D_getDay];
    }),

    // 'Thu'
    'a': inline(function (__R, __L, __D) {
        var __D_getDay = __D.getDay();
        __R += __L.shortDays[__D_getDay];
    }),

    // 'January'
    'B': inline(function (__R, __L, __D) {
        var __D_getMonth = __D.getMonth();
        __R += __L.months[__D_getMonth];
    }),

    // 'Jan'
    'b': inline(function (__R, __L, __D) {
        var __D_getMonth = __D.getMonth();
        __R += __L.shortMonths[__D_getMonth];
    }),

    // '19'
    'C': inline(function (__R, __L, __D) {
        var __D_getFullYear = __D.getFullYear();
        __D_getFullYear = 0 | (__D_getFullYear / 100);
        if (__D_getFullYear < 10) {
            __R += ((('0')));
        }
        __R += __D_getFullYear;
    }),

    // '01/01/70'
    'D': inline(function (__R, __L, __D, __S) {
        __R += __S(__L.formats.D, __D, __L);
    }),

    // '01'
    'd': inline(function (__R, __L, __D) {
        var __D_getDate = __D.getDate();
        if (__D_getDate < 10) {
            __R += ((('0')));
        }
        __R += __D_getDate;
    }),

    // '01'
    'e': inline(function (__R, __L, __D) {
        var __D_getDate = __D.getDate();
        __R += __D_getDate;
    }),

    // '%Y-%m-%d'
    'F': inline(function (__R, __L, __D, __S) {
        __R += __S(__L.formats.F, __D, __L);
    }),

    // '19'
    'H': inline(function (__R, __L, __D) {
        var __D_getHours = __D.getHours();
        if (__D_getHours < 10) {
            __R += ((('0')));
        }
        __R += __D_getHours;
    }),

    // 'Jan'
    'h': inline(function (__R, __L, __D) {
        var __D_getMonth = __D.getMonth();
        __R += __L.shortMonths[__D_getMonth];
    }),

    // '12'
    'I': inline(function (__R, __L, __D) {
        var __D_getHours = __D.getHours();
        if (__D_getHours === 0) {
            __D_getHours = 12;
        } else if (__D_getHours > 12) {
            __D_getHours -= 12;
        }
        if (__D_getHours < 10) {
            __R += ((('0')));
        }
        __R += __D_getHours;
    }),

    'j': inline(function (__R, __L, __D) {
        var __D_getTime_getFullYear = Math.ceil((__D.getTime() - new Date(__D.getFullYear(), 0, 1).getTime()) / 86400000);
        if (__D_getTime_getFullYear < 100) {
            __R += ((('0')));
        }
        if (__D_getTime_getFullYear < 10) {
            __R += ((('0')));
        }
        __R += __D_getTime_getFullYear;
    }),

    'k': inline(function (__R, __L, __D) {
        var __D_getHour = __D.getHours();
        if (__D_getHour < 10) {
            __R += (((' ')));
        }
        __R += __D_getHour;
    }),

    'L': inline(function (__R, __L, __D) {
        var __D_getTime = __D.getTime() % 1000;
        if (__D_getTime < 100) {
            __R += ((('0')));
        }
        if (__D_getTime < 10) {
            __R += ((('0')));
        }
        __R += __D_getTime;
    }),

    // '12'
    'l': inline(function (__R, __L, __D) {
        var __D_getHours = __D.getHours();
        if (__D_getHours === 0) {
            __D_getHours = 12;
        } else if (__D_getHours > 12) {
            __D_getHours -= 12;
        }
        if (__D_getHours < 10) {
            __R += (((' ')));
        }
        __R += __D_getHours;
    }),

    // '12'
    'M': inline(function (__R, __L, __D) {
        var __D_getMinutes = __D.getMinutes();
        if (__D_getMinutes < 10) {
            __R += ((('0')));
        }
        __R += __D_getMinutes;
    }),

    // '12'
    'm': inline(function (__R, __L, __D) {
        var __D_getMonth = __D.getMonth() + 1;
        if (__D_getMonth < 10) {
            __R += ((('0')));
        }
        __R += __D_getMonth;
    }),

    // '\n'
    'n': inline(function (__R, __L, __D) {
        __R += '\n';
    }),

    // '1st'
    'o': inline(function (__R, __L, __D) {
        var __D_getDate = __D.getDate();
        __R += __D_getDate;

        var __D_getDate_i = __D_getDate % 10,
            __D_getDate_ii = __D_getDate % 100;

        if ((__D_getDate_ii >= 11 && __D_getDate_i <= 13) || __D_getDate_i === 0 || __D_getDate_ii >= 4) {
            __R += 'th';
        } else if (__D_getDate_i === 1) {
            __R += 'st';
        } else if (__D_getDate_i === 2) {
            __R += 'nd';
        } else if (__D_getDate_i === 3) {
            __R += 'rd';
        }
    }),

    // 'am'
    'P': inline(function (__R, __L, __D) {
        __R += __D.getHours() < 12 ? __L.am : __L.pm;
    }),

    // 'am'
    'p': inline(function (__R, __L, __D) {
        __R += __D.getHours() < 12 ? __L.AM : __L.PM;
    }),

    // '00:00'
    'R': inline(function (__R, __L, __D, __S) {
        __R += __S(__L.formats.R, __D, __L);
    }),

    // '12:00:00 AM'
    'r': inline(function (__R, __L, __D, __S) {
        __R += __S(__L.formats.r, __D, __L);
    }),

    // return pad(d.getSeconds(), padding)
    'S': inline(function (__R, __L, __D) {
        var __D_getSeconds = __D.getSeconds();
        if (__D_getSeconds < 10) {
            __R += ((('0')));
        }
        __R += __D_getSeconds;
    }),

    // '0'
    's': inline(function (__R, __L, __D) {
        __R += 0 | (__D.getTime() / 1000);
    }),

    // '0'
    'T': inline(function (__R, __L, __D, __S) {
        __R += __S(__L.formats.T, __D, __L);
    }),

    // '\t'
    't': inline(function (__R, __L, __D) {
        __R += '\t';
    }),

    // '00'
    'U': inline(function (__R, __L, __D) {
        var __D_getDay_wday = __D.getDay();
        var __D_getFullYear_firstDayOfYear = new Date(__D.getFullYear(), 0, 1);
        var __D_getFullYear_yday = (__D.getTime() - __D_getFullYear_firstDayOfYear) / 86400000;
        var __D_getFullYear_weekNum = 0 | ((__D_getFullYear_yday + 7 - __D_getDay_wday) / 7);

        if (__D_getFullYear_weekNum < 10) {
            __R += ((('0')));
        }

        __R += __D_getFullYear_weekNum;
    }),

    // '4'
    'u': inline(function (__R, __L, __D) {
        var __D_getDay = __D.getDay();
        __R += __D_getDay === 0 ? 7 : __D_getDay;
    }),

    // '1-Jan-1970'
    'v': inline(function (__R, __L, __D, __S) {
        __R += __S(__L.formats.v, __D, __L);
    }),

    // '00'
    'W': inline(function (__R, __L, __D) {
        var __D_getDay_wday = __D.getDay();
        if (__D_getDay_wday == 0) {
            __D_getDay_wday = 6;
        } else {
            __D_getDay_wday--;
        }
        var __D_getFullYear_firstDayOfYear = new Date(__D.getFullYear(), 0, 1);
        var __D_getFullYear_yday = (__D.getTime() - __D_getFullYear_firstDayOfYear) / 86400000;
        var __D_getFullYear_weekNum = 0 | ((__D_getFullYear_yday + 7 - __D_getDay_wday) / 7);

        if (__D_getFullYear_weekNum < 10) {
            __R += ((('0')));
        }

        __R += __D_getFullYear_weekNum;
    }),

    // '4'
    'w': inline(function (__R, __L, __D) {
        __R += __D.getDay();
    }),

    // '4'
    'Y': inline(function (__R, __L, __D) {
        __R += __D.getFullYear();
    }),

    // '1987'
    'y': inline(function (__R, __L, __D) {
        var __D_getFullYear = __D.getFullYear() % 100;
        if (__D_getFullYear < 10) {
            __R += ((('0')));
        }
        __R += __D_getFullYear;
    }),

    // 'YEKT'
    'Z': inline(function (__R, __L, __D, __S, __O) {
        if (__O.hasOwnProperty('utc')) {
            __R += 'GMT';
        } else {
            var __D_toString_match = __D.toString().match(/\((\w+)\)/);
            if (__D_toString_match !== null) {
                var __D_toString_match_1 = __D_toString_match[1];
                if (__D_toString_match_1) {
                    __R += __D_toString_match_1;
                }
            }
        }
    }),

    // '+06000'
    'z': inline(function (__R, __L, __D, __S, __O, __TZ) {
        if (__O.hasOwnProperty('utc')) {
            __R += '+0000';
        } else {
            var __D_getTimezoneOffset = __D.getTimezoneOffset();
            var __D_getTimezoneOffset_tz = __TZ;
            var __D_getTimezoneOffset_off = typeof __D_getTimezoneOffset_tz == 'number' ? __D_getTimezoneOffset_tz : -__D_getTimezoneOffset;

            __R += (__D_getTimezoneOffset_off < 0 ? '-' : '+');

            var __D_getTimezoneOffset_off_div_60 = Math.abs(__D_getTimezoneOffset_off / 60);
            if (__D_getTimezoneOffset_off_div_60 < 10) {
                __R += '0';
            }
            __R += __D_getTimezoneOffset_off_div_60;

            var __D_getTimezoneOffset_off_mod_60 = __D_getTimezoneOffset_off % 60;
            if (__D_getTimezoneOffset_off_mod_60 < 10) {
                __R += '0';
            }
            __R += __D_getTimezoneOffset_off_mod_60;
        }
    })
};
