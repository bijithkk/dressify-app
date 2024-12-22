import React from 'react'

const Input = ({type,placeholder,className,onChange,value}) => {
  return (
    <input
            type={type}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-800"
            required
            onChange={onChange}
            value={value}
          />
  )
}

export default Input
