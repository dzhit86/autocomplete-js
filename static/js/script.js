Autocomplete('#location_name');

function Autocomplete (selector) {
    let inputs = document.querySelectorAll(selector);
    let placeIdField = document.getElementById("location_id");
    function ciSearch(what = '', where = '') {
      return where.toUpperCase().search(what.toUpperCase());
    }
    
    inputs.forEach(input => {  
      input.classList.add('autocomplete-input');
      let wrap = document.createElement('div');
      wrap.className = 'autocomplete-wrap';
      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(input);
  
      let list = document.createElement('div');
      list.className = 'autocomplete-list';
      wrap.appendChild(list);
  
      let matches = [];
      let listItems = [];
      let focusedItem = -1;
  
      function setActive(active = true) {
        if(active)
          wrap.classList.add('active');
        else
          wrap.classList.remove('active');
      }
  
      function focusItem(index) {
        if(!listItems.length) return false;
        if(index > listItems.length - 1) return focusItem(0);
        if(index < 0) return focusItem(listItems.length - 1);
        focusedItem = index;
        unfocusAllItems();
        listItems[focusedItem].classList.add('focused');
      }
      function unfocusAllItems() {
        listItems.forEach(item => {
          item.classList.remove('focused');
        });
      }
      function selectItem(index) {
        if(!listItems[index]) return false;
        input.value = listItems[index].innerText;
        placeIdField.setAttribute("id", listItems[index].getAttribute("data-place-id"));
        setActive(false);
      }
      
      let stringQuery = "";
      input.addEventListener('input', (e) => {        
        stringQuery += e.data;
        let value = input.value;
        if(!value) return setActive(false);
  
        if (value.length >= 3) {            
            sendGetData(`${autocompleteHandler}?query=${stringQuery}`)
              .then((data) => {
                list.innerHTML = '';
                listItems = [];
          
                data.forEach((dataItem, index) => {
                    let placesItem = dataItem.name;
                    let placesId = dataItem.id;
                    let search = ciSearch(value, placesItem);
                    if(search === -1) return false;
                  matches.push(index);
          
                  let parts = [
                    placesItem.substr(0, search),
                    placesItem.substr(search, value.length),
                    placesItem.substr(search + value.length, placesItem.length - search - value.length)
                  ];
          
                  let item = document.createElement('div');
                  item.className = 'autocomplete-item';
                  item.setAttribute("data-place-id", placesId);
                  item.innerHTML = parts[0] + '<strong>' + parts[1] + '</strong>' + parts[2];
                  list.appendChild(item);
                  listItems.push(item);
          
                  item.addEventListener('click', function() {
                    selectItem(listItems.indexOf(item));
                  });          
                });
          
                if(listItems.length > 0) {
                  focusItem(0);
                  setActive(true);                  
                }
                else setActive(false);
              })

        }  
      });
  
      input.addEventListener('keydown', e => {  
        let keyCode = e.keyCode;  
        if(keyCode === 40) { // arrow down
          e.preventDefault();
          focusedItem++;
          focusItem(focusedItem);
        } else if(keyCode === 38) { //arrow up
          e.preventDefault();
          if(focusedItem > 0) focusedItem--;
          focusItem(focusedItem);
        } else if(keyCode === 27) { // escape
          setActive(false);
        } else if(keyCode === 13) { // enter
          selectItem(focusedItem);
        }        
      });
  
      document.body.addEventListener('click', function(e) {
        if(!wrap.contains(e.target)) setActive(false);
      });

      async function sendGetData(url = '') {
        const response = await fetch(url, {
            method: 'GET',
            cache: 'no-cache', 
            credentials: "same-origin",
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'X-CSRFToken': csrf
            },
            referrerPolicy: 'no-referrer',
        });
        return await response.json();
    }  
    });
  }

// Счётчик и высота textarea
const textareaField = document.querySelector("#id_about");
const textareaCounterField = document.querySelector(".master__blockFormBtnBlockSymbols_length");
textareaField.addEventListener('input', onInput);
function onInput(e) {
  const length = e.target.value.length;
  textareaCounterField.textContent = length;
  e.target.style.height = 'auto';
  e.target.style.height = e.target.scrollHeight + 2 + "px";
}
window.addEventListener("load", () => {
  const length = textareaField.textLength;
  textareaCounterField.innerText = length;
});
function fixTextareaSize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 2 + "px";
}
~function () {
  textareaField.addEventListener('input', function (e) { fixTextareaSize(e.target) });
  fixTextareaSize(textareaField);
}()


// Проверка на заполненность одного из полей
function checkFields(formSelector) {
  const form = document.querySelector(formSelector);
  const wrapInputs = form.querySelectorAll("[data-field-check]");

  for (let i = 0; i < wrapInputs.length; i++) {
    const item = wrapInputs[i];

    if (item.getAttribute("data-field-check") === "number") {
      const inputs = item.querySelectorAll("input[type='number']");
      for (let j = 0; j < inputs.length; j++) {
        const input = inputs[j];
        setFieldClass(input);        
        input.addEventListener("change", function(e){
          setFieldClass(input)
        });
      }
    }
    if (item.getAttribute("data-field-check") === "checkbox") {
      const inputs = item.querySelectorAll("input[type='checkbox']");
      for (let j = 0; j < inputs.length; j++) {
        const input = inputs[j];
        setFieldClass(input);
        input.addEventListener("change", function(e){
          setFieldClass(input)
        });
      }
    }
  }

  function setFieldClass(inp) {    
    if (inp.getAttribute("type") === "number") {      
      if (inp.value === "" || inp.value === "0" ) {
        inp.classList.remove("check_field");
      } else {
        inp.classList.add("check_field");        
      }
    }
    if (inp.getAttribute("type") === "checkbox") {
      if (!inp.checked) {
        inp.classList.remove("check_field");
      } else {
        inp.classList.add("check_field");
      }
    }
  }

  form.addEventListener("submit", e => {
    
    const numWrap = form.querySelectorAll("[data-field-check='number']");
    const checkWrap = form.querySelectorAll("[data-field-check='checkbox']");
    let numStat = false;
    let checkStat = false;
    for (let i = 0; i < numWrap.length; i++) {
      const wrap = numWrap[i];
      const elements = wrap.querySelectorAll(".check_field");
      if (elements.length === 0) {
        showError(wrap, "Please enter 1 hour rates");
      } else {
        numStat = true;
        hideError(wrap);
      }
    }
    for (let i = 0; i < checkWrap.length; i++) {
      const wrap = checkWrap[i];
      const elements = wrap.querySelectorAll(".check_field");
      if (elements.length === 0) {
        showError(wrap, "Select at least 1 service");
      } else {
       hideError(wrap);
       checkStat = true;
      }
    }
    if (numStat && checkStat) {
      return true;
    } else {
      e.preventDefault();
    }

  });

  function showError(field, text) {
    field.style.position = "relative";
    field.style.padding = "2px 2px 15px 2px";
    field.style.marginBottom = "10px";
    field.style.border = "1px solid #be4546";
    const errorMessage = document.createElement("div");
      errorMessage.className  = "error-form"
      errorMessage.innerHTML = text;
      if (!field.querySelector(".error-form")) {
        field.append(errorMessage);
      }
      field.querySelector(".error-form").scrollIntoView({block: "center", behavior: "smooth"});
  }
  function hideError(field) {
    field.style.padding = "0";
    field.style.border = "";
    field.style.marginBottom = "0";
    const errorMessage = field.querySelector(".error-form");
    if (errorMessage) {
      errorMessage.remove();
    }
  }
}
checkFields(".section__editForm");