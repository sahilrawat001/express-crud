const express = require("express");
const app = express();
const fs = require("fs");
require("dotenv").config();

const port = process.env.PORT|| 5000; 
const jwt = require("jsonwebtoken");
 const { signup, updateData, marksUpdateSchema } = require("./validator");

let secret = process.env.SECRET;
let data = require("./db.json");
app.use(express.json()); // for parsing application/json 


//function to get new index
function newIndex() {
  let nIndex = 0;
  data.forEach((i) => {
    if (nIndex < i.id) {
      nIndex = i.id;
    }
  });
  return nIndex + 1;
}

let userData = (tokenid) => data.find((i) => i.id == tokenid);
let userMail = (tokenid) => data.find((i) => i.mail == tokenid);
let userPass = (tokenid) => data.find((i) => i.password == tokenid);
let restData = (tokenid) => data.filter((i) => i.id != tokenid);

// push data in db.jsob
function fspush(data) {
  fs.writeFileSync("db.json", JSON.stringify(data), "utf-8");
}


app.post("/signup", (req, res) => {
  //gets object from id
  let checkMail = userMail(req.body.mail);

   if (checkMail) {
    res.status(400).send(" user already existed");
  } else {
 
    const result = signup.validate(req.body);


    if (result.error) {
      console.log(result.error);
      res.status(400).send(" Can't sign up due to validation ");
    }
    else {
      let nIndex = newIndex();
      // getting mail id in lowercase from validation result
      req.body.mail = result.value.mail;

      //assigning index to new user
      req.body.id = nIndex;
      data.push(req.body);
      let token = jwt.sign({ id: req.body.id }, secret, { expiresIn: "1h" });

      fspush(data);
      res.status(200).send(JSON.stringify({ token }));
    }
  }
});


 

app.put("/assign", (req, res) => {
  try {
    
    let tokenData = jwt.verify(req.headers.token, secret);
    let checkId = userData(req.body.id);
  
    // if given id exist
    if (checkId ) {
      let dataOfUser = userData(tokenData.id);
      let elseData = restData(tokenData.id);
  
      // check if student is already assigned or not
      if (dataOfUser.role == checkId.role || dataOfUser.asign.includes(req.body.id)) {
        res.status(400).json("can't assign");
      }
      else {
        dataOfUser.asign.push(req.body.id);
        elseData.push(dataOfUser);
        fspush(elseData);
        res.status(202).send(" assigned successfully");
      }
  
  
    }
    else {
      res.status(400).send(" user may not  exist  ");
    }
  }
  catch {
    res.status(400).send(" token error  ");

  }

});


app.put("/marks", (req, res) => {
  
  try {
    let tokenData = jwt.verify(req.headers.token, secret);
    
    let authUserData = userData(tokenData.id);
    let rData = restData(req.body.id);
    let student_data = userData(req.body.id);
    
    //schema validate
    const result = marksUpdateSchema.validate(req.body);
    // check if student is assigned to teacher and also validation
    if (authUserData.asign.includes(req.body.id) && (!result.error)) {
      
      student_data.marks = req.body.marks;
      rData.push(student_data);
      fspush(rData);
      
      res.status(202).send(" updated marks successfully");
    }
    else {
      res.status(400).send(" can't update");
      
    }
  }  
  catch {
      res.status(404).send(" token verification error");
    
  }


});


app.put("/update", (req, res) => {
  try  {
  let tokenData = jwt.verify(req.headers.token, secret);
  let authUserData = userData(tokenData.id);
  let elseData = restData(tokenData.id);
  let result = updateData.validate(req.body);
   
    // check validation 
    if (result.error) {
      res.status(400).send(" can't update due to validation");
    } else {
      let lowerMail = result.value.mail;


      // update the data that is given in body
      if (req.body.name) {
        authUserData.name = req.body.name;
      }
      if (req.body.mail) {
        authUserData.mail = lowerMail;
      }
      if (req.body.password) {
        authUserData.password = req.body.password;
      }
      elseData.push(authUserData);
      fspush(elseData);

      res.status(202).send(" updated successfully");
    }
  } 
    catch {
      res.status(400).send(" token error");
    }

});

app.get("/", (req, res) => {

  try{
    let tokenData = jwt.verify(req.headers.token, secret);
    let [skip, limit] = [Number(req.query.skip), Number(req.query.limit)]
    let sum = skip + limit;

    let ans = data.slice(skip, sum);
     res.send(JSON.stringify(ans)); 
  }
  catch {
    console.log("token eror");
    res.status(404).send("token is not verified");
    
  }
  
 
    
  
});


app.post("/signin", (req, res) => {
  let checkMail = userMail(req.body.mail);
  let checkPassword = userPass(req.body.password);

  // check if user exist in database or not 
  if (!checkMail) {
    res.status(404).send("user don't exist");
  }
  // checks email and password
  if (checkMail.id != checkPassword.id) {
    res.status(400).send(" invalid userrname password");
  } else {
    let token = jwt.sign({ id: checkMail.id }, secret, { expiresIn: "3h" });
    res.status(200).send(JSON.stringify({ token }));
  }

  res.send();
});

app.listen(port, () => {
  console.log(`running on ${port} `);
});
