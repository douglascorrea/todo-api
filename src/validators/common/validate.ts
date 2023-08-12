import { ValidationChain } from 'express-validator'
import handleValidationErrors from './handleValidationErrors'

// This function is used to combine multiple validators into one
// and add the handleValidationErrors function to the end
// This function accepts one validator or multiple validators in an array
export const validate = (
  ...validators: Array<ValidationChain>
) => {
  // if it is an array of validators, we need to call each validator to get the array of validation chains
  return [...validators, handleValidationErrors]
}
