import Axios from 'axios';
import Routing from '../../vendor/friendsofsymfony/jsrouting-bundle/Resources/public/js/router.min.js';
import {makeVisible, makeInvisible, handleModalClose, validateForm, form} from './helper'

Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
};

const routes = require('../../public/js/fos_js_routes_website');
Routing.setRoutingData(routes);

const openEventForm = document.querySelector('[data-open]');
const closeEventForm = document.querySelector('[data-close]');
const openPolicyModal = document.querySelector('[data-open-policy]');
const roomId = document.querySelector('.data-js');
const checkIn = document.querySelector('#reservation_checkInDate');
const checkOut = document.querySelector('#reservation_checkOutDate');
const guestsAmount = document.querySelector('#reservation_guests');
const closeAvailabilityModal = document.querySelector('[data-close-availability]');
const closeRoomNotAvailableModal = document.querySelector('[data-close-not-available]');
const alert = document.querySelector('div.alert-success');
const alertText = alert.textContent;
let responseData = {
    basePrice: null,
    checkIn: null,
    checkOut: null,
    discount: null,
    discountName: null,
    maxGuests: null,
    status: null,
    stepsAmount: null,
    stepsContent: null,
    stepsDiscount: null,
    summerStart: null,
    summerEnd: null,
    priceModifier: null,
    finalStepsDiscount: null,
    tempPriceField: null,
    finalPrice: null
};
let discount = 0;
let stepsContent = null;
let tempPriceField = null;
let finalPrice = null;

const updatePrice = () => {
    document.querySelector('#event_checkIn').value = new Date(document.querySelector('#reservation_checkInDate').value).addHours(14).toISOString().slice(0, 16);
    document.querySelector('#event_checkOut').value = new Date(document.querySelector('#reservation_checkOutDate').value).addHours(12).toISOString().slice(0, 16);

    if (stepsContent) {
        showPromo(stepsContent);
    }

    document.querySelector('#event_tempPrice').value = tempPriceField;
    document.querySelector('#event_price').value = finalPrice;
};

const loadData = async () => {
    const response = await Axios.get(Routing.generate('xhr_room_availability',
        {
            id:       roomId.dataset.roomId,
            checkIn:  checkIn.value,
            checkOut: checkOut.value,
            guests:   guestsAmount.value
        }, true));
    return response.data;
};

const showPromo = (content) => {
    const oldUl = document.querySelector('div.alert-success ul');

    alert.classList.remove('invisible');
    alert.classList.add('alert');

    if (oldUl) {
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(content));
        oldUl.appendChild(li);
    } else {
        const ul = document.createElement('ul');
        const li = document.createElement('li');

        li.appendChild(document.createTextNode(content));
        ul.style.paddingLeft = '20px';
        ul.appendChild(li);
        alert.appendChild(ul);
    }
};

const updateForm = () => {
    const guests = document.querySelector('#reservation_guests').value;
    const alert = document.querySelector('div.alert-success.alert');
    document.querySelector('#event_guests').value = guests;
    discount = 100 - responseData.discount;
    stepsContent = responseData.stepsContent;
    finalPrice = responseData.finalPrice;
    tempPriceField = responseData.tempPriceField;

    if (responseData.discountName) {
        showPromo(responseData.discountName);
    } else if (alert) {
        alert.classList.add('invisible');
        alert.classList.remove('alert');
    }
};

const removeRedundantSelectOptions = () => {
    const dataJs = document.querySelector('.data-js');
    const maxGuests = dataJs.dataset.maxGuests;
    const stepsAmount = dataJs.dataset.stepsAmount;
    const select = document.querySelector('#reservation_guests');
    const options = select.options;

    for (let i = options.length-1; i >= 0; i--) {
        if (options[i].value < (maxGuests - stepsAmount) || options[i].value > maxGuests) {
            select.remove(i);
        }
    }
};

removeRedundantSelectOptions();

handleModalClose();

// Modal after availability check - form modal
openEventForm.addEventListener('click', () => {
    if (document.querySelector('#availability-modal')) {
        makeInvisible(document.querySelector('#availability-modal'));
    }

    makeVisible(document.querySelector('#reservation-modal'));
    updatePrice();
});

// Close form modal
closeEventForm.addEventListener('click', () => {
    makeInvisible(document.querySelector('#reservation-modal'));
});

openPolicyModal.addEventListener('click', () => {
    makeVisible(document.querySelector('#policy-modal'));
    makeInvisible(document.querySelector('#reservation-modal'));

    document.querySelector('[data-close-policy]').addEventListener('click', () => {
        makeInvisible(document.querySelector('#policy-modal'));
        makeVisible(document.querySelector('#reservation-modal'));
    });
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (validateForm()) {
        alert.innerHTML = alertText;
        await loadData().then((data) => {
            responseData = data;
            if (responseData.status === true) {
                updateForm();
                // Homepage path - open filled reservation form modal on simulated submit event
                if (document.querySelector('[data-checked]')) {
                    const homepagePathAttrs = document.querySelector('#homepage-path-js');
                    delete homepagePathAttrs.dataset.checked;

                    makeVisible(document.querySelector('#reservation-modal'));
                    updatePrice();
                } else {
                    makeVisible(document.querySelector('#availability-modal'));
                }
            } else {
                makeVisible(document.querySelector('#room-not-available-modal'));
            }
        });
    }
});

closeAvailabilityModal.addEventListener('click', () => {
    makeInvisible(document.querySelector('#availability-modal'));
});

closeRoomNotAvailableModal.addEventListener('click', () => {
    makeInvisible(document.querySelector('#room-not-available-modal'));
});

// Homepage path - redirect from reservation cards
document.addEventListener('DOMContentLoaded',  () => {
    if (document.querySelector('#homepage-path-js')) {
        // Simulate button click to prevent code duplication
        document.querySelector('#reservation_submit').click();
    }
});
