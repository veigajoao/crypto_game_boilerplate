import fs from 'fs';

let array = fs.readFileSync('whitelist.txt').toString().split("\n");
let i;
for(i in array) {
    console.log(array[i]);
}