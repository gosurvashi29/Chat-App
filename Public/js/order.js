let getOrderResponse = []; //Get Order API Response
let orderStatus;

if(getOrderResponse.filter(transaction => transaction.payment_status === "SUCCESS").length > 0){
    orderStatus = "Success"
}else if(getOrderResponse.filter(transaction => transaction.payment_status === "PENDING").length > 0){
    orderStatus = "Pending"
}else{
    orderStatus = "Failure"
}