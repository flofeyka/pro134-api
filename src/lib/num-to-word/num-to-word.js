const digits = {
    0: 'ноль',
    1: ['один', 'одна'],
    2: ['два', 'две'],
    3: 'три',
    4: 'четыре',
    5: 'пять',
    6: 'шесть',
    7: 'семь',
    8: 'восемь',
    9: 'девять',
    10: 'десять',
    11: 'одиннадцать',
    12: 'двенадцать',
    13: 'тринадцать',
    14: 'четырнадцать',
    15: 'пятьнадцать',
    16: 'шестьнадцать',
    17: 'семнадцать',
    18: 'восемнадцать',
    19: 'девятьнадцать',
    20: 'двадцать',
    30: 'тридцать',
    40: 'сорок',
    50: 'пятьдесят',
    60: 'шестьдесят',
    70: 'семьдесят',
    80: 'восемьдесят',
    90: 'девяносто',
    100: 'сто',
    200: 'двести',
    300: 'триста',
    400: 'четыреста',
    500: 'пятьсот',
    600: 'шестьсот',
    700: 'семьсот',
    800: 'восемсот',
    900: 'девятьсот',
}

/**
 *
 * @param {number} number
 * @return {string}
 */
export const numToWord = (number) => {
    const intl = new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 2,
    })

    let numberString = []
    const groups = intl.formatToParts(number).filter(i => i.type === 'integer').reverse()
        if (groups.length > 2) {
        numberString.push(parseHundred(groups[2].value, 0, {
            one: 'миллион',
            some: 'миллиона',
            more: 'миллионов'
        }))
    }

    if (groups.length > 1) {
        numberString.push(parseHundred(groups[1].value, 1, {
            one: 'тысяча',
            some: 'тысячи',
            more: 'тысяч'
        }))
    }

    if (groups.length > 0) {
        numberString.push(parseHundred(groups[0].value, 1, {
            one: 'рубль',
            some: 'рубля',
            more: 'рублей'
        }))
    }

    return numberString.join(' ')  + ' 00 копеек'
}

/**
 *
 * @param {string} numString
 * @param {number} variant
 * @param {{one: string, some: string, more: string}?} text
 * @return string
 */
const parseHundred = (numString, variant, text) => {
    let total = +numString

    if (total === 0) {
        return text.more
    }

    if (total > 999) {
        throw new Error('максимум 999')
    }

    let hundreds = []

    while (total > 0) {
        if (Object.keys(digits).includes(total.toString())) {
            if (Array.isArray(digits[total])) {
                hundreds.push(digits[total][variant])
            } else {
                hundreds.push(digits[total])
            }

            if (total === 1) {
                //one
                hundreds.push(text.one)
            } else if ([2,3,4].includes(total)) {
                //some
                hundreds.push(text.some)
            } else {
                //more
                hundreds.push(text.more)
            }

            break
        }

        const digitsCount = total.toString().length
        const reducer = 10 ** (digitsCount - 1)
        const tpmNum = numString.slice(-digitsCount)[0]
        const reducerNum = +tpmNum * reducer

        total -= reducerNum
        hundreds.push(digits[reducerNum])
    }

    return hundreds.join(' ')
}
