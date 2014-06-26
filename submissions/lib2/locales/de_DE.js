/**
 *  Locales - DE
 *  ============
 *
 *  TODO: time converstion needs to be handled seperately (see 'am', 'pm' -> 12:00+ ).
 */

module.exports = {

  days:       [ 'Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag' ],
  shortDays:  [ 'So',    'Mo',    'Di',     'Mi',       'Do',      'Fr',    'Sa'      ],
  months:     [ 'Januar', 'Februar', 'März', 'April',   'Mai',      'Juni',
                'Juli',    'August',   'September', 'Oktober', 'November', 'Dezember'        ],
  shortMonths:  [ 'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez' ],
  AM: 'AM',
  am: 'am',
  PM: 'PM',
  pm: 'pm',

  formats: {  // != provided, but used

    D: null,
    F: null,
    R: null,
    r: null,
    T: null,
    v: null
  }
};
