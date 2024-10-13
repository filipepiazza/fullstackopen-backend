const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

let op = 'add'

if(process.argv.length<4){
op = 'get'
}

const password = process.argv[2]

const dbName = 'PhonebookApp'

const url = process.env.MONGODB_URI
 // `mongodb+srv://filipepiazza:${password}@cluster0.atypk.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=${dbName}`

//console.log(url);


mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if(op === 'get'){
Person.find({}).then(result => {
  console.log('phonebook:');
  
  result.forEach(note => {

    console.log(note.name, note.number)
  })
  mongoose.connection.close()
})
}
else{
  const person = new Person({
  name: process.argv[3],
  number: process.argv[4],
})

person.save().then(result => {
  console.log('person saved!')
  mongoose.connection.close()
})
}
// Note.find({ important: true }).then(result => {
//   // ...
// })

