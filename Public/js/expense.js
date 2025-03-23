
let currentPage = 1;
let totalPages = 1; 

const limit = Number(localStorage.getItem("numberOfPages") || 5);

// Updating the number of items per page
function numberOfPages() {
  const selectElement = document.getElementById("number-of-page");
  const selectedValue = selectElement.value; 
  localStorage.setItem("numberOfPages", selectedValue); // Save the value in localStorage
  loadExpenses(1); // Reload expenses starting from page 1
}


document.addEventListener("DOMContentLoaded", () => {
  // to fetch the stored number of pages per request from localStorage
  const storedValue = localStorage.getItem("numberOfPages");
  if (storedValue) {
    document.getElementById("number-of-page").value = storedValue;
  }

  // Load the expenses for the first page (or current page if already set)
  loadExpenses(currentPage);
});


function handleFormSubmit(event) {
  event.preventDefault(); 
  const token = localStorage.getItem('token');
  const description = event.target['expense-name'].value;
  const amount = parseFloat(event.target['expense-amount'].value); // to make expense amount a number
  const category = event.target['category'].value;

  const expenseDetails = {
    description,
    amount,
    category,
  };


  axios
    .post("http://localhost:3000/api/add-expense", expenseDetails, { headers: { "Authorization": token } })
    .then((response) => {
      loadExpenses(); //To Reload expenses after adding
      
      resetForm(); // To Reset the form fields
    })
    .catch((error) => console.log(error));
}


async function loadExpenses(page = 1) {
  
  const token = localStorage.getItem('token');
  if (!token) {
    messenger("Token not found. Please log in again.", false);
    return;
  }


  if (page < 1 || page > totalPages) return;

  try {
    
    const response = await axios.get("http://localhost:3000/api/expenses", {  
      headers: { 'Authorization': token },
      params: {
        page,    // Passing the page number
        limit,   // Passing the limit (items per page)
      },
    });

  
    const { expenses, pagination, isPremium } = response.data;

    
    displayExpenses(expenses);

  
    leaderBoardButton(isPremium);
    downloadExpenseButton(isPremium);

    
    currentPage = pagination.currentPage; //updating current page according to pagination
    totalPages = pagination.totalPages;

  
    updatePaginationControls();

  } catch (error) {
    
    messenger(error.message, false);
  }
}

// to update pagination controls dynamically
function updatePaginationControls() {
  const pageNumbersContainer = document.getElementById("page-numbers");
  pageNumbersContainer.innerHTML = "";

  const range = 2; // Number of page links to show before and after the current page
  const startPage = Math.max(1, currentPage - range);
  const endPage = Math.min(totalPages, currentPage + range);

  if (currentPage > 1) {
    pageNumbersContainer.innerHTML += `<button onclick="loadExpenses(${currentPage - 1})">Previous</button>`;
  }

  if (startPage > 1) {
    pageNumbersContainer.innerHTML += `<button onclick="loadExpenses(1)">1</button>`;
    if (startPage > 2) {
      pageNumbersContainer.innerHTML += `<span>...</span>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbersContainer.innerHTML += `<button onclick="loadExpenses(${i})" ${i === currentPage ? 'class="active"' : ""}>${i}</button>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pageNumbersContainer.innerHTML += `<span>...</span>`;
    }
    pageNumbersContainer.innerHTML += `<button onclick="loadExpenses(${totalPages})">${totalPages}</button>`;
  }

  if (currentPage < totalPages) {
    pageNumbersContainer.innerHTML += `<button onclick="loadExpenses(${currentPage + 1})">Next</button>`;
  }
}


function displayExpenses(expenses) {
  const expenseTableBody = document.getElementById('expense-table').getElementsByTagName('tbody')[0];
  expenseTableBody.innerHTML = ''; // Clear the table before adding new rows 

  let totalAmount = 0;
  expenses.forEach((expense) => {
    totalAmount += expense.amount;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${expense.category}</td>
      <td>${expense.description}</td>
      <td>${expense.amount}</td>
      <td><button class="btn btn-danger" onclick="deleteExpense(${expense.id}, this)">Delete</button></td>
    `;
    expenseTableBody.appendChild(row);
  });

  
  document.getElementById('total-amount').textContent = totalAmount;
}


function deleteExpense(expenseId, buttonElement) {
    const token = localStorage.getItem('token')
    axios
        .delete(`http://localhost:3000/api/delete-expense/${expenseId}`,{headers : {'Authorization': token}})
        .then((response) => {
            buttonElement.closest('tr').remove(); // Remove the row from the table closest <tr> (the table row that contains the button).
            console.log("Expense deleted successfully");
            // Refresh the table after deleting the expense
            loadExpenses();
        })
        .catch((error) => console.log(error));
}

function ShowLeaderBoard(){
    const response=  axios.get("http://localhost:3000/premium/showLeaderBoard").then((response)=>{
        const allUsersList = document.getElementById('allUsersList'); 
        allUsersList.innerHTML = '';
        //console.log(response);
       
        response.data.forEach(record => {
         
         const div = document.createElement('div');
         
         
         const username = record.username;
         const totalAmount = record.totalAmount 
       
         
         div.textContent = `Name : ${username}   Total Expenses : ${totalAmount}`;
         
        
         allUsersList.appendChild(div);
        })
 })
}


function resetForm() {
    document.getElementById("expense-form").reset();
}

function download() {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:3000/user/download', { 
        headers: { "Authorization": token },
        responseType: 'blob' 
    })
    .then((response) => {
        console.log(response);

       
            const fileURL = URL.createObjectURL(response.data);
            
            // Create an invisible link element to start the download action
            const link = document.createElement('a');
            link.href = fileURL;
            link.download = 'myExpenses.csv';  
            document.body.appendChild(link);
            link.click();
            
            // removing the invisible  link element 
            document.body.removeChild(link);
        
    })
    .catch((err) => {
        console.log("Error during download:", err);
    });
}





function leaderBoardButton(isPremium){
    if(isPremium){
        document.getElementById('leaderboard').textContent = "You are a Premium User!";

        let leaderboardButton = document.getElementById("leaderboardButton");
        leaderboardButton.innerHTML = `<button class="btn btn-danger" onclick="ShowLeaderBoard()">Show LeaderBoard</button>`;
        
       
}
}

function downloadExpenseButton(isPremium){
    if(isPremium){
        

        let downloadexpenseButton = document.getElementById("downloadexpenseButton");
        downloadexpenseButton.innerHTML = `<button class="btn btn-danger" onclick="download()">Download File</button>`;
        
       
}
}
