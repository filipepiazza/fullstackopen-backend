
// const express = require('express')
// const app = express()

// app.use(express.json())


// let notes = [
//     {
//         id: "1",
//         content: "HTML is easy",
//         important: true
//       },
//       {
//         id: "2",
//         content: "Browser can execute only JavaScript",
//         important: false
//       },
//       {
//         id: "3",
//         content: "GET and POST are the most important methods of HTTP protocol",
//         important: true
//       }
// ]

// app.get('/', (request, response) => {
//   response.send('<h1>Hello World!</h1>')
// })

// app.get('/api/notes', (request, response) => {
//   response.json(notes)
// })

// app.get('/api/notes/:id', (request, response) => {
//     const id = request.params.id
//     const note = notes.find(note => note.id === id)
//     if (note) {
//         response.json(note)
//       } else {
//         response.status(404).end()
//       }
//   })

//   app.delete('/api/notes/:id', (request, response) => {
//     const id = request.params.id
//     notes = notes.filter(note => note.id !== id)
  
//     response.status(204).end()
//   })

//   const generateId = () => {
//     const maxId = notes.length > 0
//       ? Math.max(...notes.map(n => Number(n.id)))
//       : 0
//     return String(maxId + 1)
//   }
  
//   app.post('/api/notes', (request, response) => {
//     const body = request.body
  
//     if (!body.content) {
//       return response.status(400).json({ 
//         error: 'content missing' 
//       })
//     }
  
//     const note = {
//       content: body.content,
//       important: Boolean(body.important) || false,
//       id: generateId(),
//     }
  
//     notes = notes.concat(note)
  
//     response.json(note)
//   })

// const PORT = 3001
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`)
// })


const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')

app.use(cors())

app.use(express.json())

app.use(express.static('dist'))

morgan.token('bodytype', function (req, res) { return req.bodyType })

app.use((req, res, next) => {
  if (req.method === 'POST') {
    req.bodyType = JSON.stringify(req.body)
    //console.log('POST body:', JSON.stringify(req.body));
  }
  next();
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :bodytype'))

let phoneBook = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(phoneBook)
  })

  app.get('/info', (request, response) => {
    const amountPeople = phoneBook.length
    const now = new Date();
    console.log(now);
    // Output: e.g., Sun Oct 06 2024 15:30:45 GMT+0000 (Coordinated Universal Time)
    response.send(`<div>phonebook has info for ${amountPeople} people<br /> ${now}</div>`)
  })

  app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = phoneBook.find(person => person.id === id)
    if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
  })

    app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    phoneBook = phoneBook.filter(person => person.id !== id)
  
    response.status(204).end()
  })

    const generateId = (max) => {
    return Math.floor(Math.random() * max);
  }
  
  app.post('/api/persons', (request, response) => {
    const body = request.body
  
    if (!body.name) {
      return response.status(400).json({ 
        error: 'name missing' 
      })
    }

    if (!body.number) {
        return response.status(400).json({ 
          error: 'number missing' 
        })
    }

    const personExists = phoneBook.find(person => person.name === body.name)

    if(personExists){
        return response.status(400).json({ 
            error: 'name must be unique' 
          })
    }
  
    const person = {
      name: body.name,
      number: body.number,
      id: generateId(100),
    }
  
    phoneBook = phoneBook.concat(person)
  
    response.json(phoneBook)
  })

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})