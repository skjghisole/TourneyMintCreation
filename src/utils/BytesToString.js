function BytesToString(bytes) {
    return new Buffer.from(bytes.slice(2), 'hex').toString('utf8').split('\u0000')[0]
  }
  
  export default BytesToString;
  