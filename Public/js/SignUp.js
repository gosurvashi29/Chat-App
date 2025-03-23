async function signUp(event) {
  try{
  event.preventDefault();
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;

  const signUpDetails={
    username:username,
    email:email,
    phone:phone,
    password:password
  }
   
  console.log(signUpDetails);

  const response= await axios.post("http://localhost:3000/user/signup",signUpDetails)

  if (response.status===201){
    window.location.href="../views/LogIn"
  }
  else{
     console.log("Failed to Login");
  }
}
catch(err){
  document.body.innerHTML +=`<div style="color:red">${err} </div>`; 
}
}