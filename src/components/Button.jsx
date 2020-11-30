import React from 'react'

const color = '#484848'

const styleBlock = {
    fontSize: 20,
    margin: 10,
    padding: '14px 28px',
    '&:hover': {
        backgroundColor: `${color}`
    }
}

export const Button = (props) => {
    return <button style={styleBlock} {...props} />
}
