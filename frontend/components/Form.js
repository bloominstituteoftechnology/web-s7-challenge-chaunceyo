import React, { useEffect, useState } from 'react'
import * as Yup from "yup";
import axios from 'axios';


// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.

const schema = Yup.object().shape({
  fullName : Yup.string().trim()
                .required()
                .min(3, `${validationErrors.fullNameTooShort}`)
                .max(20, validationErrors.fullNameTooLong),
  size : Yup.string()
            .required( validationErrors.sizeIncorrect),        
})

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]
const initialValues = () => ({ fullName : '', size : '', toppings : []})
const initialErrors = () => ({ fullName : '', size : ''})
export default function Form() {
  const [formValues, setFormValues] = useState(initialValues())
  const [errors, setErrors] = useState(initialErrors())
  const [enabled, setEnabled] = useState(false)
  const [success, setSuccess] = useState('')
  const [failure, setFailure] = useState('')

  useEffect(() => {
    schema.isValid(formValues).then(setEnabled)
  }, [formValues])

  const onChange = evt => {
    const {id, value, type} = evt.target
     if(type === 'checkbox'){
        const checkedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        const checkedCheckboxesArray = Array.from(checkedCheckboxes);
        const myArray = []
        checkedCheckboxesArray.forEach((checkbox) => {
          myArray.push(checkbox.value);
          });
    
        setFormValues({...formValues, toppings : myArray})
     }else{
       
        Yup
        .reach(schema, id)
        .validate(value)
        .then(() => {
          setErrors({ ...errors, [id] : "" });
        })
        .catch((err) => {
          setErrors({...errors, [id] : err.errors[0]})
        })

        setFormValues({...formValues, [id] : value})
      }
  }

  const onSubmit = evt => {
    evt.preventDefault()
    axios
        .post(`http://localhost:9009/api/order`, formValues)
        .then((res) => {
          setFormValues(initialValues())  
          const checkboxes = document.querySelectorAll('input[type="checkbox"]');
          checkboxes.forEach(function(checkbox) {
              checkbox.checked = false;
          });  
          setSuccess(res.data.message)
          setFailure('')
        })
        .catch((err) => {
          setFailure(err.response)
          setSuccess('')
        })
    
  }

  return (
    <form onSubmit={onSubmit}>
      <h2>Order Your Pizza</h2>
      {success && <div className='success'>{success}</div>}
      {failure && <div className='failure'>{failure}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input placeholder="Type full name" id="fullName" type="text" onChange={onChange} value={formValues.fullName}/>
        </div>
        {errors.fullName && <div className='error'>{errors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select id="size" onChange={onChange} value={formValues.size}>
            <option value="">----Choose Size----</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
          </select>
        </div>
        {errors.size && <div className='error'>{errors.size}</div>}
      </div>

      <div className="input-group">
        {toppings.map(topping => {
          return <label key={topping.topping_id}>
                   <input
                    name={topping.text}
                    type="checkbox"
                    onChange={onChange}
                    value={topping.topping_id}
                    id = 'toppings'
                  />
                  {topping.text}<br />
                </label>
        })}
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input type="submit" disabled={!enabled}/>
    </form>
  )
}
