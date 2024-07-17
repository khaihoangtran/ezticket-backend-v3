let a = 'anagram';
let b = 'nagaram';

function isAnagram(a, b){
    if(a.length !== b.length) {
        return false;
    }

    let counter = {};

    for(let i = 0; i < a.length; i++) {
        if(!counter[a[i]]) {
            counter[a[i]] = 0;
        }

        if(!counter[b[i]]) {
            counter[b[i]] = 0
        }

        counter[a[i]] += 1;
        counter[b[i]] -=1;
    }
    
    console.log(counter);

    for(const value of Object.values(counter)) {
        if(value !== 0) {
            return false;
        }
    }

    return true;
}

console.log(isAnagram(a, b));