const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
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
    response.json(phonebook)
})

app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${phonebook.length} people</p> 
                   <p>${date.toISOString()}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const phoneNumber = phonebook.find(number => number.id === id)
    if(phoneNumber) {
        response.json(phoneNumber)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    phonebook = phonebook.filter(phone => phone.id !== id)

    response.status(204).end()
})

const generateId = () => {
    const maxId = phonebook.length > 0 
    ? Math.max(...phonebook.map(number => number.id)) 
    : 0
    return maxId + 1
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    console.log(body)
    
    const samePerson = phonebook.find(person => person.name === body.name)

    if(samePerson) {
        response.status(400).json({
            error: "this person is already in the list"
        })
    } else if(!body.name) {
        response.status(400).json({
            error: "the name is missing!"
        })
    } else if(!body.number) {
        response.status(400).json({
            error: "the number is missing"
        })
    }

    const newPerson = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    phonebook.concat(newPerson)
    response.json(newPerson)
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`servers runs on port ${PORT}`)
})  