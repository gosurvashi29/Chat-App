require('dotenv').config();
//const Order = require('../models/orderModel');  
//const Expense = require('../models/expense'); 
const User =require('../models/userModel');
const { Cashfree } = require('cashfree-pg');
const { Sequelize } = require('sequelize');
const paymentRoutes = require('../routes/paymentRoutes');
const TemplateGenerator=require('../Template/htmltemp')




Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

exports.createOrder = async (req, res) => {
  const { orderId, orderAmount,  customerPhone } = req.body;
  const customerId =req.user.id

  try {
    
    const order = await Order.create({
      orderId,
      orderAmount,
      customerId : String(customerId),
      status: 'PENDING'
    });

    
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    const formattedExpiryDate = expiryDate.toISOString();

    
    const request = {
      order_amount: orderAmount,
      order_currency: 'INR',
      order_id: orderId,
      customer_details: {
        customer_id: String(customerId),
        customer_phone: customerPhone
      },
      order_meta: {
        return_url: `http://localhost:3000/api/payment-status/${orderId}`,  // will get triggered when payment get succesful or failed.
        payment_methods: 'cc,upi,nb'
      },
      order_expiry_time: formattedExpiryDate
    };

    
    const response = await Cashfree.PGCreateOrder('2023-08-01', request);

    
    order.paymentSessionId = response.data.payment_session_id;
    await order.save();

    // Return the payment session ID to the frontend for checkout initiation
    res.json({ paymentSessionId: response.data.payment_session_id });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};


exports.getPaymentStatus = async (req, res) => {
    const { orderId } = req.params;  
  
    try {

      
      const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId)
        
        

      let getOrderResponse = response.data; //Get Order API Response
      let orderStatus;

      if(getOrderResponse.filter(transaction => transaction.payment_status === "SUCCESS").length > 0){
          orderStatus = "SUCCESSFUL"
      }else if(getOrderResponse.filter(transaction => transaction.payment_status === "PENDING").length > 0){
          orderStatus = "PENDING"
      }else{
        orderStatus = "FAILURE"
      }
      const order = await Order.findOne({ where: { orderId } });  
      

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });  
      }
      
      order.status= orderStatus
      await order.save() 
      
     
      
      const user = await User.findByPk(order.customerId);
      
     

     
      if( order.status=="SUCCESSFUL"){
        user.isPremium= true
        await user.save() 
        }
    
        const template= TemplateGenerator(orderId,orderStatus,order.amount)
      

      
        //res.redirect('../views/LogIn.html'); 
       return res.status(200).send(template)

      
  
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ message: 'Error fetching payment status', error: error.message });
    }
  };

 

