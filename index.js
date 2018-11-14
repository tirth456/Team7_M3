var SERVER_NAME = 'patients-api'
var PORT = process.env.PORT;

var restify = require('restify')

  // getting a persistence engine for the stories
  , patientsSave = require('save')('patients')

  // creating the restify server
  , server = restify.createServer({ name: SERVER_NAME})

  server.listen(PORT, function () {
  console.log('Server %s listening at %s', server.name, server.url)
  console.log('Endpoints:')
  console.log(server.url+'/patients', 'To fetch all pateints(GET Method)')
  console.log(server.url+'/patients', 'To add patient(POST Method - with valid input)')
  console.log(server.url+'/patients/:id', 'To fetch single patient((GET Method)')  
  
})

server
  // allowing the use of POST
  .use(restify.fullResponse())

  // maping request.body to request.params so there is no switching between them
  .use(restify.bodyParser())

// method to get all patients
server.get('/patients', function (request, response, next) {

  // find every entity within the given collection
  patientsSave.find({}, function (error, patients) {
    // return all of the patients in the system
    response.send(patients)
  })
})

// Get a single patient by their user id
server.get('/patients/:id', function (req, res, next) {

  // Find a single patient  by their id within save
  patientsSave.findOne({ _id: req.params.id }, function (error, patient) {
    // If there are any errors, pass them to next in the correct format
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))

    if (patient) {
      // Send the patient if no issues
      res.send(patient)
    } else {
      // Send 404 header if the patient doesn't exist
      res.send(404)
    }
  })
})

// method to create a new patient
server.post('/patients', function (request, response, next) {
  
  // name is compulsory
  if (request.params.name === undefined ) {
    return next(new restify.InvalidArgumentError('Name must be supplied'))
  }
  // age is compulsory
  if (request.params.age === undefined ) {
    return next(new restify.InvalidArgumentError('Age must be supplied'))
  }
  // address is compulsory
  if (request.params.address === undefined ) {
    return next(new restify.InvalidArgumentError('Address must be supplied'))
  }

  var newPatient = {
    name: request.params.name, 
    age: request.params.age,
    address: request.params.address
  }

  // creating the patient using the persistence engine
  patientsSave.create( newPatient, function (error, patients) {
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
    // send patient if no issues
    response.send(201, patients)
  })
})
