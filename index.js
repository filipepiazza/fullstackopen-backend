const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
require('dotenv').config(); 

const { Person, getPersonsCounts } = require('./models/person'); 

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

morgan.token('bodytype', function (req, res, next) { return req.bodyType })

app.use((req, res, next) => {
  if (req.method === 'POST') {
    req.bodyType = JSON.stringify(req.body)
  }
  next();
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :bodytype'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => {
    console.log('phonebook:');
    response.json(result)
  })
    
  })

  app.get('/info', (request, response) => {
    const now = new Date();
    console.log(now);
    getPersonsCounts().then(count => {
      console.log(count);
      
      response.send(`<div>phonebook has info for ${count.total} people<br /> ${now}</div>`)
    });
  })

  app.get('/api/persons/:id', (request, response,next) => {
    const id = request.params.id
    
    Person.findById(id).then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      next(error)
    })
  })

    app.delete('/api/persons/:id', (request, response, next) => {
   
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
      console.log(result);
      
      response.status(204).end()
    })
    .catch(error => next(error))
  })

  app.post('/api/persons', (request, response, next) => {
    const body = request.body
  
    const person = new Person({
      name: body.name,
      number: body.number,
    })
  
    person.save().then(savedPerson => {
      response.json(savedPerson)
    }).catch(error => next(error))
   
  })

  app.put('/api/persons/:id', (request, response, next) => {
    const {name , number} = request.body
    console.log(request.body);
    console.log(name,number);

    // Validate the update payload
    const validationError = Person.validateUpdate(request.body);
    if (validationError) {
      return response.status(400).json({ error: validationError.message });
    }

    Person.findByIdAndUpdate(request.params.id, {name , number}, { new: true, runValidators: true, context: 'query' })
      .then(updatedPerson => {
        console.log(updatedPerson);
        response.json(updatedPerson)
      })
      .catch(error => next(error))
  })

  const unknownEndpoint = (request, response, next) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  // handler of requests with unknown endpoint
  app.use(unknownEndpoint)  

  const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError' || error.message.includes('Missing required fields')) {
      return response.status(400).json({ error: error.message })
    } 
  
    next(error)
  }
  
  // this has to be the last loaded middleware, also all the routes should be registered before this!
  app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})