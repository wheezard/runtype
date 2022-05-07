function joinTheArray(array, indent = 0, join = ', ') {
  return array.map(a => {
    return String(a).replaceAll('\n', '\n' + (' '.repeat(indent)))
  }).join(join)
}

function uniq(value, index, self) {
  return self.indexOf(value) === index;
}

function betterTypeof(val) {
  if (typeof val == 'object') {
    return val == null ? 'null' : 'object'
  }
  return typeof val
}

function betterIsNaN(val) {
  return (typeof val == 'number' && isNaN(val));
}

function checkType(val, type) {
  if (!Array.isArray(type)) type = [ type ]

  /* if (type.filter(m => Array.isArray(m)).length > 1) {
    throw new SyntaxError(`Type array can only include one array element`) // Engrish
  } */

  let checked = type.map(miniType => {
    if (typeof miniType == 'function') {
      let res = miniType(val, { betterTypeof });
      if (res !== true) {
        res = typeof res == 'string' ?
          res :
          `Type assertion by function failed on value "${val}" (type ${betterTypeof(val)}): ${res}.`
      }
      return res;

    } else if (typeof miniType == 'string') {
      let isDefault = false;
      function assertStringTypes(type) {
        
      }
      let res = (function(){
        switch (miniType) {
          case 'any': return true
          case '*': return true

          case 'string': return typeof val == 'string'
          case 'boolean': return typeof val == 'boolean'
          case 'number': return typeof val == 'number'
          case 'object': return typeof val == 'object' && val !== null
          case 'function': return typeof val == 'function'
          case 'bigint': return typeof val == 'bigint'
          case 'symbol': return typeof val == 'symbol'
          case 'undefined': return typeof val == 'undefined'
          case 'nullish': return !val || betterIsNaN(val)

          case 'infinite': return val == Infinity || val == -Infinity
          case 'realnumber': return typeof val == 'number' && !betterIsNaN(val) && val != Infinity && val != -Infinity // type is number AND it is not NaN AND it is finite
          case 'integer': return typeof val == 'number' && !betterIsNaN(val) && Math.floor(val) == val && val != Infinity && val != -Infinity


          // The reason we dont just flip the condition around is because we don't want to match with any string that begins with a bang
          case '!string': return typeof val != 'string'
          case '!boolean': return typeof val != 'boolean'
          case '!number': return typeof val != 'number'
          case '!object': return typeof val != 'object' || val === null
          case '!function': return typeof val != 'function'
          case '!bigint': return typeof val != 'bigint'
          case '!symbol': return typeof val != 'symbol'
          case '!undefined': return typeof val != 'undefined'
          case '!nullish': return !!val && !betterIsNaN(val)
        
          case '!infinite': return val != Infinity && val != -Infinity
          case '!realnumber': return typeof val == 'number' && (betterIsNaN(val) || val == Infinity || val == -Infinity)
          case '!integer': return typeof val == 'number' && (Math.floor(val) != val || val == Infinity || val == -Infinity)

          default: {
            if (miniType.startsWith('"') && miniType.endsWith('"'))  miniType = miniType.slice(1, -1)
            isDefault = true;
    
            return val === miniType;
          }
        }
      })();

      if (!res) {
        res = `Value "${val}" (type ${betterTypeof(val)}) is not assignable to ${
          isDefault ? `value "${miniType}"` : `type ${miniType.replace('!', 'non-')}`
        }.`
      }
      return res;

    } else if (betterTypeof(miniType) == 'object') {
      if (Array.isArray(miniType)) {
        if (miniType.length == 0) {
          let res = Array.isArray(val)

          if (!res) {
            res = `Value "${val}" (type ${betterTypeof(val)}) is not an array.`
          }
          return res;

        } else if (Array.isArray(val)) {
          let mapped = val.map((item, index) => {
            let miniMapped = miniType.map(microType => {
              return checkType(item, microType)
            });

            let res = miniMapped.some(v => v === true);

            if (!res) {
              res = `Item "${item}" (index ${index}) does not match any of the valid types:\n   | ${joinTheArray(miniMapped, 2, '\n   | ')}`
            }
            return res;
          })

          let res = mapped.every(v => v === true);

          if (!res) {
            res = `The array [${joinTheArray(val, 0, ', ')}] has invalid items:\n  - ${joinTheArray(mapped.filter(v => v !== true), 1, '\n  - ')}`
          }
          return res;
          
        } else return `Value "${val}" (type ${betterTypeof(val)}) is not an array.`

      } else if (betterTypeof(val) == 'object') {
        let res = true;
        let usedKeys = [];

        function addToRes(str) {
          if (res === true) {
            res = str

          } else if (res.startsWith('There were')) {
            res += `\n   - ${str.replaceAll('\n', '\n    ')}`

          } else {
            res = `There were multiple problems with this object:\n   - ${res.replaceAll('\n', '\n    ')}\n   - ${str.replaceAll('\n', '\n    ')}`
          }
        }

        for (const key in val) {
          if (key in miniType || (key + '?') in miniType) {
            usedKeys.push(key)
            let typeRes = checkType(val[key], key in miniType ? miniType[key] : miniType[key + '?']);
            if (typeRes !== true) {
              addToRes(`Key "${key}" is not valid: \n   ${typeRes.replaceAll('\n', '\n  ')}`);
              continue;
            }

          } else if ('*' in miniType) {
            let typeRes = checkType(val[key], miniType['*']);
            if (typeRes !== true) {
              addToRes(res = `Key "${key}" is not assignable to the generic key type (*): \n  ${typeRes.replaceAll('\n', '\n ')}`);
              continue;
            }

          } else {
            addToRes(`Key "${key}" should not exist on this object.`);
            continue;
          }
        }
        Object.keys(miniType).forEach(key => {
          if (key != '*' && !key.endsWith('?') && !usedKeys.includes(key)) {
            addToRes(`The key "${key}" is required but missing from this object.`)
          }
        })
        return res;

      } else return `Value "${val}" (type ${betterTypeof(val)}) is not an array.`

    } else if (betterIsNaN(miniType)) {
      let res = betterIsNaN(val);
      if (!res) {
        res = `Value "${val}" (type ${betterTypeof(val)}) is not equal to "NaN" (type number).`
      }
      return res;
    
    } else {
      let res = val === miniType;
      if (!res) {
        res = `Value "${val}" (type ${betterTypeof(val)}) is not equal to "${miniType}" (type ${betterTypeof(miniType)}).`
      }
      return res;
    }

    // none of the checks have failed
    return true;
  });

  let res = checked.some(v => v === true);
  if (!res) {
    let f = checked.filter(v => v !== true).filter(uniq);
    res = joinTheArray(f, 1, '\n| ');
    if (f.length > 1) {
      res = `| ${res.replaceAll('\n', '\n ')}`
    }
  }
  return res;
}

checkType.default = checkType;
module.exports = checkType;