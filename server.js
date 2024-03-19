// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
  getFirestore,
  addDoc,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "db-aci-request-forms.firebaseapp.com",
  projectId: "db-aci-request-forms",
  storageBucket: "db-aci-request-forms.appspot.com",
  messagingSenderId: "78560005691",
  appId: "1:78560005691:web:f2585b5914da48f1bcd61e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Disable the table and all its child elements
function disableTable() {
  var table = document.getElementById("documentRequestsTable");
  if (table) {
    // Disable all input elements within the table
    var inputs = table.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].disabled = true;
    }
    // Disable the table itself
    table.disabled = true;
  }
}

// Call the function to disable the table
disableTable();

// Login validation
document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from submitting normally

    // Get username and password
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Check if the credentials are correct
    if (username === "aciregistrar" && password === "admin") {
      // Show the document request form
      document.getElementById("documentRequestForm").style.display = "block";
      // Hide the login form
      document.getElementById("loginForm").style.display = "none";

      // Enable dateIssuedInput
      document.querySelectorAll(".dateIssuedInput").forEach(function (input) {
        input.disabled = false; // Enable date issued input
      });

      // Enable documentRequestsTable
      document.getElementById("documentRequestsTable").disabled = false;
    } else {
      alert("Invalid username or password. Please try again.");
    }
  });

document.getElementById("submit").addEventListener("click", (e) => {
  e.preventDefault(); // Prevent the form from submitting normally

  // Retrieve all form fields
  var idNumber = document.getElementById("idNumber").value;
  var surname = document.getElementById("surname").value;
  var firstName = document.getElementById("firstName").value;
  var middleName = document.getElementById("middleName").value;
  var documentRequest = document.getElementById("documentRequest").value;
  var purpose = document.getElementById("purpose").value;
  var controlNumber = document.getElementById("controlNumber").value;
  var orNumber = document.getElementById("orNumber").value;
  var dateRequested = document.getElementById("dateRequested").value;
  var status = "Pending"; // Default status is 'Pending' for new requests

  // Add a new document in collection "Request"
  addDoc(collection(db, "Request"), {
    idNumber: idNumber,
    surname: surname,
    firstName: firstName,
    middleName: middleName,
    documentRequest: documentRequest,
    purpose: purpose,
    controlNumber: controlNumber,
    orNumber: orNumber,
    dateRequested: dateRequested,
    dateIssued: "", // Set initial value to empty string
    status: status, // Save status value
  })
    .then(() => {
      alert("Request added");
      // Clear the form after successful submission
      document.getElementById("documentRequestForm").reset();
      // Reload the page to display the new data
      location.reload();
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
});

// Event listener for status change
document.addEventListener("change", function (event) {
  if (event.target.classList.contains("statusSelect")) {
    const docId = event.target.getAttribute("data-doc-id");
    const newStatus = event.target.value;

    // Update status in Firestore
    updateDoc(doc(db, "Request", docId), {
      status: newStatus,
    })
      .then(() => {
        alert("Status updated");
        // Reload the page to display the updated data
        location.reload();
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });
  }
});

// Display data in table
getDocs(collection(db, "Request")).then((querySnapshot) => {
  querySnapshot.forEach((doc) => {
    var data = doc.data();
    var dateIssued = data.dateIssued ? data.dateIssued : ""; // Set initial value to empty string
    var dateIssuedInput = `
        <div class="input-group">
            <input type="date" class="form-control icon-input dateIssuedInput" ${
              data.dateIssued ? `value="${data.dateIssued}"` : ""
            } data-doc-id="${doc.id}" ${dateIssued ?? "disabled"}>
        </div>`;

    // Dropdown for status
    var statusDropdown = `
        <select class="form-select statusSelect" data-doc-id="${doc.id}">
            <option value="Pending" ${
              data.status === "Pending" ? "selected" : ""
            }>Pending</option>
            <option value="Processing" ${
              data.status === "Processing" ? "selected" : ""
            }>Processing</option>
            <option value="Signature" ${
              data.status === "Signature" ? "selected" : ""
            }>Signature</option>
            <option value="Release" ${
              data.status === "Release" ? "selected" : ""
            }>Release</option>
            <option value="Received" ${
              data.status === "Received" ? "selected" : ""
            }>Received</option>
        </select>`;

    var row = `
        <tr>
            <td>${data.idNumber}</td>
            <td>${data.surname}</td>
            <td>${data.firstName}</td>
            <td>${data.middleName}</td>
            <td>${data.documentRequest}</td>
            <td>${data.purpose}</td>
            <td>${data.controlNumber}</td>
            <td>${data.orNumber}</td>
            <td>${data.dateRequested}</td>
            <td>
                <div class="input-group">
                    ${dateIssuedInput}
                </div>
            </td>
            <td>
                <div class="input-group">
                    ${statusDropdown}
                </div>
            </td>
        </tr>
        `;
    document.querySelector("#documentRequestsTable tbody").innerHTML += row;
  });
});

// Update dateIssued field when date is selected
document.addEventListener("change", function (event) {
  if (event.target.classList.contains("dateIssuedInput")) {
    const docId = event.target.getAttribute("data-doc-id");
    const newDateIssued = event.target.value;

    updateDoc(doc(db, "Request", docId), {
      dateIssued: newDateIssued,
    })
      .then(() => {
        alert("Date Issued updated");
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });
  }
});

// Event listener for status change
document.addEventListener("change", function (event) {
  if (event.target.classList.contains("statusSelect")) {
    const docId = event.target.getAttribute("data-doc-id");
    const newStatus = event.target.value;

    // Update status in Firestore
    updateDoc(doc(db, "Request", docId), {
      status: newStatus,
    })
      .then(() => {
        alert("Status updated");
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });
  }
});
