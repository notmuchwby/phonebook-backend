require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')
const date = new Date()

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan('combined'))

let phonebook = [
    { 
      "id": 1, 
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World<h1/>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(person => {
        response.json(person)
    })
})

app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${phonebook.length} people</p> 
                   <p>${date.toISOString()}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id)
        .then(person => {
            if(person) {
                response.json(person)
            } else {
                response.status(400).end()
            }   
        })
        .catch(error => {
            response.status(400).send({error: 'malformatted id'})
        })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            console.log(result, 'removed succesfully')
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    console.log(body)
    
    if(body.name === undefined) {
        return response.status(400).json({ error: 'name is missing'})
    }
    
    const newPerson = new Person({
        name: body.name,
        number: body.number
    })

    newPerson.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => {
            next(error)
            console.log(error)
        })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    newPerson = {
        name: body.name, 
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, newPerson, {new: true})
        .then(updatedPerson => 
            response.json(updatedPerson))
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: 'the name should have at least 3 characters'})
    }
  
    next(error)
  }

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`servers runs on port ${PORT}`)
})  