let a = ['ABC', 'GHI', 'DEF', 'JKL']
let b = [1,2,3]
a.pop()
console.log(a)
a.push('PQR')
console.log(a)
a.shift()
console.log(a)
a.splice(1,2,"WER","ERT")
console.log(a)
a = a.concat(b)
console.log(a)
a.sort()
console.log(a)
a.reverse()
console.log(a)
let c = b.map((element)=> {
    return 2*element
})
console.log(c)