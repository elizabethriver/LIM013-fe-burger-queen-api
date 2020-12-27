const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};
// console.log(validateEmail('emailefre@gewfr.com'));
const checkPassword = (str) => {
  // acepta letras mayusculas y minusculas, minimo 6 caracteres maximo 30
  const re = /[A-Za-z0-9]{6,100}$/;
  return re.test((str));
};

const dataError = (headers, resp) => {
  if (headers) {
    return resp.status(401).send('401');
  }
};
// console.log(checkPassword('121frer..8989.egre232'));
module.exports = {
  validateEmail,
  checkPassword,
  dataError,
};
