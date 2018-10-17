function stringToByte(string) {
    return `0x${Buffer(string).toString('hex')}`
}

export default stringToByte;