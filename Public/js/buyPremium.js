
async function buyPremium(event) {
    try {
        event.preventDefault(); 
        
        
        const userPhone = '9999999999';  
        const orderId = 'order_' + Date.now();  
        const orderAmount = 100;  

        // Fetch the token from localStorage
        const token = localStorage.getItem('token');

        
        const response = await axios.post("http://localhost:3000/api/create-order", {
            orderId,
            orderAmount,
            
            customerPhone: userPhone
        }, { 
            headers: {
                "Authorization": token
            }
        });

        const data = response.data;

        if (data.paymentSessionId) {
            const cashfree = Cashfree({
                mode: 'sandbox'  
            });

            // Start the Cashfree checkout process
            const checkoutOptions = {
                paymentSessionId: data.paymentSessionId,
                redirectTarget: '_self',  // Change to '_blank' to open in a new tab
            };

            cashfree.checkout(checkoutOptions);

            
        } else {
            console.error('Failed to create the payment session');
        }
    } catch (error) {
        console.error('Error initiating Cashfree checkout:', error);
    }
}




