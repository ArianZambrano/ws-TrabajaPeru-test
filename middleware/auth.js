const services = require('../services/index');
const comun = require('../util/comun');
const constant = require('../util/constant');

function ensureAuthenticated(req, res, next) {
  let deflang = comun.getLanguage(req.lang);
  let lang = require(`../language/${deflang}`);
  let params = [];
  if(!req.headers.authorization) {
    params[0] = lang.mstrNotAuthorizationHeader.code
    params[1] = constant.ResponseCode.error
    params[2] = lang.mstrNotAuthorizationHeader.message
    return res
      .status(401) //Unauthorized
      .send(comun.ObjectResponse(params));
  }
  const token = req.headers.authorization.split(" ")[1];
  services.decodeToken(token)
    .then(response =>{
      req.user = response
      next()
    })
    .catch(response =>{
      var resp = new Object();
      if(response.code === "0002") resp = lang.mstrExpiredToken;
      if(response.code === "0003") resp = lang.mstrInvalidToken;
      params[0] = response.code
      params[1] = constant.ResponseCode.error
      params[2] = `${response.message}`
      return res
        .status(403)
        .send(comun.ObjectResponse(params));
    })
}

module.exports = ensureAuthenticated