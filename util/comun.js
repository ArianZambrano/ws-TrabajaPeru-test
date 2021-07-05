'use strict'
const fs = require('fs');
const config = require('../GlobalEnv');
const helper = require('sendgrid').mail;

function ObjectResponse(params) {
    var dataResponse = {
        "code": params[0],
        "status": params[1],
        "message": params[2],
        "Response": params[3]
    }
    return dataResponse;
}

function validateLanguage(lang) {
    if (!lang) return false;
    if (lang.trim() === "") return false;
    if (fs.existsSync(`./language/${lang}.json`)) {
        return true
    } else {
        return false
    };
}

function getLanguage(lang) {
    if (validateLanguage(lang)) return lang
    else return "en"
}

function sendMail(to_email, subject, type, content, attachments = []) {
    var from_email = new helper.Email(config.sendgrid_from);
    var to_email = new helper.Email(to_email);
    var subject = subject;
    var content = new helper.Content(type, content);
    var mail = new helper.Mail(from_email, subject, to_email, content);
    attachments.forEach(fileattach => {
        var attachment = new helper.Attachment();
        attachment.setContent(fileattach.file)
        attachment.setType(fileattach.mime)
        attachment.setFilename(fileattach.filename)
        attachment.setDisposition("attachment")

        mail.addAttachment(attachment);
    });

    var sg = require('sendgrid')(config.sendgrid_api_key);
    var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON(),
    });

    sg.API(request, function(error, response) {
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
    });
}

function evalObjectValue(object) {
    let keys = Object.keys(object);
    let aux = false
    keys.forEach(key => {
        if (object[key] !== '') {
            return aux = true
        }
    });

    return aux;
}

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer.from(bitmap).toString('base64');
}

// function to create file from base64 encoded string
function base64_decode(base64str, file) {
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    let mime = base64str.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    if (mime && mime.length) {
        // Delete base64 identificator from String
        base64str = base64str.replace(`data:${mime[1]};base64,`, '');
    }
    var bitmap = new Buffer.from(base64str, 'base64');
    // write buffer to file
    fs.writeFileSync(file, bitmap);
    console.log('******** File created from base64 encoded string ********');
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validateUrl(url) {
    var re = /^(http|https)\:\/\/[a-z0-9\.-]+\.[a-z]{2,4}/gi;
    return re.test(String(url));
}

module.exports = {
    ObjectResponse,
    validateLanguage,
    getLanguage,
    sendMail,
    base64_encode,
    base64_decode,
    evalObjectValue,
    validateEmail,
    validateUrl
}