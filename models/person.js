require('dotenv').config(); 

const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery',false)

mongoose.connect(url)

// Custom validator function
const validateSpecialNumber = function(value) {
  // Regular expression to match the pattern
  const regex = /^(\d{2,3})-(.{8,})$/;
  
  if (!regex.test(value)) {
    return false;
  }
  
  // Extract the parts of the number
  const [, firstPart, secondPart] = value.match(regex);
  
  // Check if the total number of digits is 8
  return (firstPart.length + secondPart.length) >= 8;
};

const personSchema = new mongoose.Schema({
  name: {type: String, minLength: 5, required: true},
  number: {type: String, minLength: 8, 
    validate: {
      validator: validateSpecialNumber,
      message: props => `${props.value} is not a valid phone number!`
    },
    required: true},
})

// Custom validation function
personSchema.statics.validateUpdate = function(update) {
  const UpdateModel = this.model(this.modelName);
  const dummy = new UpdateModel(update);
  return dummy.validateSync();
};

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
module.exports = mongoose.model('Person', personSchema)

const Person = mongoose.model('Person', personSchema)

const getPersonsCounts = async () => {
  try {
    const totalCount = await Person.countDocuments();
    return {
      total: totalCount,
    };
  } catch (error) {
    console.error('Error counting documents:', error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

module.exports = {
  Person, getPersonsCounts, 
};