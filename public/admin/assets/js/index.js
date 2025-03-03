let dateRange = {}
// Date validation configuration
const DATE_VALIDATION_CONFIG = {
    errorClasses: {
        invalid: 'is-invalid',
        hidden: 'd-none'
    },
    elements: {
        startDate: 'start-date',
        endDate: 'end-date',
        startError: 'start-date-error',
        endError: 'end-date-error'
    },
    messages: {
        endBeforeStart: 'End date cannot be earlier than the start date.',
        futureStartDate: 'Start date cannot be in the future.',
        futureEndDate: 'End date cannot be in the future.',
        // requiredStart: 'Start date is required.',
        // requiredEnd: 'End date is required.',
        invalidFormat: 'Invalid date format.'
    }
};

class DateValidator {
    constructor(config = DATE_VALIDATION_CONFIG) {
        this.config = config;
        this.elements = this.initializeElements();
    }

    initializeElements() {
        return {
            startDate: document.getElementById(this.config.elements.startDate),
            endDate: document.getElementById(this.config.elements.endDate),
            startError: document.getElementById(this.config.elements.startError),
            endError: document.getElementById(this.config.elements.endError)
        };
    }

    clearErrors() {
        const { invalid, hidden } = this.config.errorClasses;
        const { startDate, endDate, startError, endError } = this.elements;

        [startDate, endDate].forEach(element => {
            element.classList.remove(invalid);
        });

        [startError, endError].forEach(element => {
            element.classList.add(hidden);
            element.textContent = '';
        });
    }

    showError(element, errorElement, message) {
        const { invalid, hidden } = this.config.errorClasses;
        element.classList.add(invalid);
        errorElement.textContent = message;
        errorElement.classList.remove(hidden);
    }

    isValidDateFormat(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    validateDates() {
        const { startDate, endDate, startError, endError } = this.elements;
        const { messages } = this.config;

        this.clearErrors();

        // Get current date (midnight)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDateObj = new Date(startDate.value);
        const endDateObj = new Date(endDate.value);

        // Set time to midnight for proper date comparison
        startDateObj.setHours(0, 0, 0, 0);
        endDateObj.setHours(0, 0, 0, 0);

        // Logical validation
        if (endDateObj < startDateObj) {
            this.showError(endDate, endError, messages.endBeforeStart);
            return false;
        }

        if (startDateObj > today) {
            this.showError(startDate, startError, messages.futureStartDate);
            return false;
        }

        if (endDateObj > today) {
            this.showError(endDate, endError, messages.futureEndDate);
            return false;
        }

        return true;
    }

    getDateRange() {
        if (this.validateDates()) {
            return {
                startDate: this.elements.startDate.value,
                endDate: this.elements.endDate.value
            };
        }
        return null;
    }
}

// Usage example
async function applyFilter() {
    const dateValidator = new DateValidator();
    dateRange = dateValidator.getDateRange();

    if (dateRange) {
        const category = document.getElementById("sort-by").value;
        const order = document.getElementById("orders")
        dateRange.category = category;
        // console.log('Filter Applied:', { 
        //     // category, 
        //     startDate: dateRange.startDate, 
        //     endDate: dateRange.endDate 
        // });
        console.log(dateRange);

        let response = await fetch("/admin/filter", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dateRange)
        });

        let details = await response.json();

        console.log(details);

        if (details.success) {
            document.querySelector(".pagination-area").innerHTML = ""
            order.innerHTML = ""; // Clear existing content

            // Use map to generate the rows and join them as a single string
            order.innerHTML = details.orders.map(element => {
                return `
            <tr>
                <td><a href="#" class="fw-bold text-primary">${element._id}</a></td>
                <td>${element.addres.name}</td>
                <td>
                    ${new Date(element.createdOn).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' })}
                </td>
                <td>
                    ${Math.round(element.totalPrice)}
                </td>
                <td>
                    <i class="material-icons md-payment font-xxl text-muted"></i> ${element.paymentMethod}
                </td>
                <td>
                    <a href="/admin/orderManagement/details/${element._id}" class="btn btn-sm btn-outline-primary">View Details</a>
                </td>
            </tr>
        `;
            }).join(""); // Join the array into a single string

        }
    }
    // return false;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const dateValidator = new DateValidator();

    // Add input event listeners for real-time validation
    dateValidator.elements.startDate.addEventListener('change', () => {
        dateValidator.validateDates();
    });

    dateValidator.elements.endDate.addEventListener('change', () => {
        dateValidator.validateDates();
    });


});

//Genrate Pdf Reprst
async function generateReport() {
    try {
        // console.log("Date Details", dateRange); // Log the date range details



        // Fetch request to the backend
        const response = await fetch("/admin/sales-report", { // Fixed the URL to match the backend endpoint
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dateRange), // Send dateRange data to the backend
        });

        console.log(response);

        // Handle the response from the backend
        if (response.ok) {
            // Assuming the backend sends the PDF as a file in response
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            // Trigger download directly via URL
            // window.location.href = url;
        } else {
            // If the response is not OK, log the error
            const errorData = await response.json();
            console.error("Error generating the report:", errorData.message);
            Swal.fire({
                icon: 'error',  // Indicates an error
                title: 'Oops!',  // Title of the alert
                text: `Error: ${errorData.message}`,  // The error message
                confirmButtonText: 'OK'  // Button text
            });

        }
    } catch (error) {
        console.error("An error occurred while generating the report:", error);
        Swal.fire({
            icon: 'error',  // Indicates an error
            title: 'Oops!',  // Title of the alert
            text: `An error occurred while generating the report.`,  // The error message
            confirmButtonText: 'OK'  // Button text
        });
    }
}



function resetFilters() {
    const { startDate, endDate, startError, endError } = new DateValidator().elements;
    const { invalid, hidden } = DATE_VALIDATION_CONFIG.errorClasses;

    // Clear date inputs
    startDate.value = '';
    endDate.value = '';

    // Remove error messages and invalid classes
    startDate.classList.remove(invalid);
    endDate.classList.remove(invalid);
    startError.classList.add(hidden);
    endError.classList.add(hidden);
    startError.textContent = '';
    endError.textContent = '';

    // Reset category dropdown (if needed)
    const categoryDropdown = document.getElementById("sort-by");
    categoryDropdown.value = ''; // Or set a default value like categoryDropdown.value = 'all'

    // Reset the global date range object
    dateRange = {};

    // Optionally clear or reset the orders
    const order = document.getElementById("orders");
    order.innerHTML = ""; // Clear any displayed orders if applicable
}
document.getElementById("reset-filters-btn").addEventListener('click', resetFilters);

