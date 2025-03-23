

async function handleForgotPassword(event) {
    try{
    event.preventDefault();
    
    const email = document.getElementById("email").value;
    const userDetails = {
      email: email,

  }
  
    
   
        const response = await axios.post("http://localhost:3000/password/forgot-password",userDetails);
        
        if(response.status === 202){
          document.body.innerHTML += '<div style="color:green;">Mail Successfuly sent <div>'
      } else {
          throw new Error('Something went wrong!!!')
      }
      } catch (err) {
        
        document.body.innerHTML += `<div style="color:red;">${err} <div>`;
        
      }
    }
    
   