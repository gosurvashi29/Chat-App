async function handleUpdatePassword(event) {
    try {
        event.preventDefault();
    
    
        const email = document.getElementById("email").value;
        const password = document.getElementById("newPassword").value;
  
        const passwordDetails={
           
            email:email,
            password:password
          }

  
    const response= await axios.post("http://localhost:3000/password/update-password", 
        passwordDetails
      );
      if (response.status===200){
        
        localStorage.setItem('token', response.data.token)
        document.body.innerHTML += '<div style="color:green;">Password reset Successfully<div>'


    }
    } catch (err) { document.body.innerHTML += '<div style="color:green;">Failed to reset password. Please try again later.<div>'
    
    }
}