Autocomplete('.location_name');

function Autocomplete (selector) {
    let inputs = document.querySelectorAll(selector);
    let placeIdField = document.querySelector(".location_id");
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
        input.setAttribute("value", listItems[index].innerText);
        placeIdField.setAttribute("value", listItems[index].getAttribute("data-place-id"));
        setActive(false);
      }
      
      let stringQuery;

      input.addEventListener('input', (e) => {

        if (inputs[0].value !== "") {
          stringQuery = inputs[0].value;
        } else {
          stringQuery += e.data;
        }
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
        let key = e.key;  
        if(key === 40) { // arrow down
          e.preventDefault();
          focusedItem++;
          focusItem(focusedItem);
        } else if(key === 38) { //arrow up
          e.preventDefault();
          if(focusedItem > 0) focusedItem--;
          focusItem(focusedItem);
        } else if(key === 27) { // escape
          setActive(false);
        } else if(key === 13) { // enter
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

formValidate(".section__editForm");
function formValidate(selector) {
  const form = document.querySelector(selector);
  const multiFields = form.querySelectorAll("[data-multifields]");

  form.addEventListener("submit", formSend);
  function formSend(e) {  
    let error = checkInputs(form);
    console.log(error)
    if (error !== 0) {
      e.preventDefault();    
    } else {
      return true;
    }
  }

  // Вешаем событие на инпуты мультиполей 
  for (let index = 0; index < multiFields.length; index++) {
    const element = multiFields[index];
    const typeElement = element.getAttribute("data-multifields");
    const inputs = element.querySelectorAll(`[type='${typeElement}']`);
    for (let inp = 0; inp < inputs.length; inp++) {
      const input = inputs[inp];
      setFieldClass(input);
      input.addEventListener("change", function(e){
        setFieldClass(input);
      });
    }
  }

  function checkInputs(form) {
    let errorInput = 0;
    let formReqFields = form.querySelectorAll("._req");
  
    for (let index = 0; index < formReqFields.length; index++) {
      const field = formReqFields[index];
      formRemoveError(field);
      if (!field.getAttribute("data-multifields")) {
        if (field.querySelector("input")) {
          let input = field.querySelector("input");
          if (input.getAttribute("type") === "email") {
            if (emailValidate(input)) {
              formAddError(field);
              errorInput++;
            } 
          } else if (input.getAttribute("type") === "checkbox" && input.checked === false) {
            formAddError(field);
            errorInput++;
          } else if (input.getAttribute("type") !== "hidden" && input.value === "") {
            formAddError(field);
            errorInput++;
          }
        }
        if (field.querySelector("textarea")) {
          let textarea = field.querySelector("textarea");
          if (textarea.value === "") {
            formAddError(field);
            errorInput++;
          }
        }
        if (field.querySelector("select")) {
          let select = field.querySelector("select");
          if (select.value === "") {
            formAddError(field);
            errorInput++; 
          }
        }
      } else {
        if (!multifieldsValidate(field)) {
          if (field.querySelectorAll("._select-input").length === 0) {            
            errorInput++;
            switch (field.getAttribute("data-multifields")) {
              case "number": formAddError(field, "Please enter 1 hour rates");
                break;
              case "checkbox": formAddError(field, "Select at least 1 service");
                break;
              default: formAddError(field);
                break;
            }
          }
        }
      }
  
    }
    return errorInput;
  }

  function formAddError(field, message = "This field is required") {
    field.classList.add("_input-error");
    const errorMessage = document.createElement("div");
      errorMessage.className  = "_input-error__message"
      errorMessage.innerHTML = message;
      if (!field.querySelector("._input-error__message")) {
        field.append(errorMessage);
      }
      field.querySelectorAll("._input-error__message")[0].scrollIntoView({block: "end", behavior: "smooth"});
  }
  function formRemoveError(field) {
    field.classList.remove("_input-error");
    const errorMessage = field.querySelector("._input-error__message");
    if (errorMessage) {
      errorMessage.remove();
    }
  }
  function emailValidate(input) {
    return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(input.value);
  }
  function multifieldsValidate(field) {
    if (field.querySelectorAll("._select-input").length === 0) {
      return false;
    }
  }
  // Меняем класс в зависимости от состояния инпута
  function setFieldClass(inp) {    
    if (inp.getAttribute("type") === "number") {      
      if (inp.value === "" || inp.value === "0" ) {
        inp.classList.remove("_select-input");
      } else {
        inp.classList.add("_select-input");        
      }
    }
    if (inp.getAttribute("type") === "checkbox") {
      if (!inp.checked) {
        inp.classList.remove("_select-input");
      } else {
        inp.classList.add("_select-input");
      }
    }
  }
}


// Ввод только цифр
const input = document.getElementById('id_phone');
input.addEventListener('keydown', function(event) {
	// Разрешаем: backspace, delete, tab и escape
	if ( event.key == "Delete" || event.key == "Backspace" || event.key == "Tab" || event.key == "Esc" ||
		// Разрешаем: Ctrl+A
		(event.key == "A" && event.ctrlKey === true) ||
		// Разрешаем: home, end, влево, вправо
		(event.key >= "End" && event.key <= "Arrow Right")) {
		
		// Ничего не делаем
		return;
	} else {
		// Запрещаем все, кроме цифр на основной клавиатуре, а так же Num-клавиатуре
		if ((event.key < "0" || event.key > "9") && (event.key < "Numpad 0" || event.key > "Numpad 9" )) {
			event.preventDefault();
		}
	}
});