const personsRouter = require('express').Router()

const loggerExports = require('../utils/logger')
const { info, errorLogger } = loggerExports

const modelPersonExports = require('../models/person')
const { Person, getPersonsCounts } = modelPersonExports

personsRouter.get('/', async (request, response) => {
    const persons = await Person.find({})
    response.json(persons)
})

personsRouter.get('/info', async (request, response) => {
    const now = new Date();
    info(now);
    const count = await getPersonsCounts()
    info(count);
    response.send(`<div>phonebook has info for ${count.total} people<br /> ${now}</div>`)

})

personsRouter.get('/:id', async (request, response, next) => {
    const id = request.params.id
        const person = await Person.findById(id)
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
})

personsRouter.post('/', async (request, response, next) => {
    const body = request.body

    const person = new Person({
        name: body.name,
        number: body.number,
    })

        const savedPerson = await person.save()
        response.status(201).json(savedPerson)
})

personsRouter.put('/:id', async (request, response, next) => {
    const { name, number } = request.body
    info(request.body);
    info(name, number);

    // Validate the update payload
    const validationError = Person.validateUpdate(request.body);
    if (validationError) {
        return response.status(400).json({ error: validationError.message });
    }
        const updatedPerson = await Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
        info(updatedPerson);
        response.json(updatedPerson)
})

personsRouter.delete('/:id', async (request, response, next) => {
        const result = await Person.findByIdAndDelete(request.params.id)
        info(result);
        response.status(204).end()
})

module.exports = personsRouter