;(function () {
	const buttonElement = document.querySelector("[data-form-submit]")
	const inputWeightElement = document.querySelector("[data-input-weight]")
	const operationsListElement = document.querySelector("[data-operations-list]")
	const menuButtonElement = document.querySelector("[data-menu-button]")
	const addUserButtonElement = document.querySelector("[data-button-add-user]")
	const inputNewUserElement = document.querySelector("[data-input-new-user]")
	const loggedUserNameElement = document.querySelector("[data-logged-user-name]")
	const menuElement = document.querySelector("[data-menu]")
	const inputSymbolElement = document.querySelectorAll("[data-input-symbol]")
	const inputPercentElement = document.querySelectorAll("[data-input-percent]")
	const totalElement = document.querySelector("[data-total]")
	let total
	let loggedUser = localStorage.getItem('bellaPlusLoggedUser')
	const userList = getUserList()
	const cache = []
	const operationsArray = []
	let edit = {status:false, id: null}
	let id

	operationsListElement.innerHTML = ""

	if (loggedUser) {
		id = renderFromDB ()
		showLoggedUserName(loggedUser)
	} else {
		menuElement.classList.remove('hide')
		addUser()
		
	}

	buttonElement.addEventListener('click', function(event){
		event.preventDefault()
		event.stopPropagation()
		const inputValues = getInputValues()
		if (inputValues.weight || inputValues.weight === 0) {
			if (!edit.status) {
					if (inputValues.weight !== 0) {
						if (!id && id !== 0) {
							id = 0
						}else {
							id++
						}
						const operation = {
							id:id,
							symbol: inputValues.symbol,
							weight: inputValues.weight,
							percent: inputValues.percent
						}
						addToCache(operation)
						addToDB(operationsArray, loggedUser)
						renderFromDB ()
					}
			} else {
				buttonElement.innerHTML = '+'
				buttonElement.classList.remove('form__button_edit')
				for(let i=0; i <operationsArray.length; i++) {
					if (operationsArray[i].id === edit.id) {
						if (inputValues.weight === 0) {
							operationsArray.splice(i, 1)
						} else {
							operationsArray[i].symbol = inputValues.symbol
							operationsArray[i].weight = inputValues.weight
							operationsArray[i].percent = inputValues.percent
						}

						addToDB(operationsArray, loggedUser)
						renderFromDB ()
						edit.status = false
					}
				}
			}
		}
		inputWeightElement.value = ''
		inputWeightElement.focus()
	})

	function showUserList(){
		menuElement.innerHTML = ''
		if (!menuElement.classList.contains('hide')) {
			if(userList.length < 6) {
				menuElement.style.position = "fixed"
			} else {
				menuElement.style.position = "absolute"
			}
			for(let i=0; i<userList.length; i++) {
				// console.log('ok')
				const menuListElement = document.createElement('div')
				menuListElement.classList.add('menu__item')
				menuListElement.innerHTML = userList[i]
				menuListElement.setAttribute('data-user', userList[i])
				menuElement.append(menuListElement)
				inputNewUserElement.classList.remove('hide')
				addUserButtonElement.classList.remove('hide')
				// loggedUserNameElement.innerHTML = loggedUser
				loggedUserNameElement.classList.add('hide')

				menuListElement.addEventListener('click', function (event) {
					loggedUser = this.getAttribute('data-user')
					localStorage.setItem('bellaPlusLoggedUser', loggedUser);
					menuElement.classList.add('hide')
					operationsArray.length = 0
					showLoggedUserName(loggedUser)
					renderFromDB ()
				})
			}
		}
	}
	menuButtonElement.addEventListener('click', (event) => {
		event.preventDefault()
		event.stopPropagation()
		menuElement.classList.toggle('hide')
		showUserList()
		addUser()
		if(menuElement.classList.contains('hide')) {
			showLoggedUserName(loggedUser)
		}
	})

	function showLoggedUserName(loggedUser){
		if(loggedUser){
			inputNewUserElement.classList.add('hide')
			addUserButtonElement.classList.add('hide')
			loggedUserNameElement.innerHTML = loggedUser
			loggedUserNameElement.classList.remove('hide')
		}
	}

	function addUser() {
		addUserButtonElement.addEventListener('click', function (event){
			event.preventDefault()
			event.stopPropagation()
			const newUser = inputNewUserElement.value
			inputNewUserElement.value = ''
			if (newUser) {
				userList.push(newUser)
				addToDB(null,newUser)
				showUserList()
			}
		})
	}

	function getInputValues(){
		const weight = parseFloat(inputWeightElement.value)
		let symbol
		let percent
		for(let i=0; i<inputSymbolElement.length; i++) {
			if (inputSymbolElement[i].checked === true) {
				symbol = inputSymbolElement[i].value
			}
		}
		for(let i=0; i<inputPercentElement.length; i++) {
			if (inputPercentElement[i].checked === true) {
				percent = parseInt(inputPercentElement[i].value)
			}
		}
		return inputValues = {
			symbol: symbol,
			weight: weight,
			percent: percent
		}
	}

	function getUserList() {
		const data = JSON.parse(localStorage.getItem('bellaPlus'))
		const userList =[]
		if (data) {
			for(let i=0; i<data.length; i++) {
				userList.push(data[i].user)
			}

		}
		return userList
	}

	function renderFromDB () {
		operationsListElement.innerHTML = ''
		total = 0
		const data = JSON.parse(localStorage.getItem('bellaPlus'))
		if (data && loggedUser) {
			// for(let i=0; i<data.length; i++) {
			// 	userList.push(data[i].user)
			// }
			for(let i=0; i<data.length; i++) {
				if(data[i].user === loggedUser) {
					const id = data[i].maxId
					const operationsArray = data[i].data
					if(operationsArray){
						for(let i=0; i<operationsArray.length; i++) {
							addOperation(operationsArray[i])
							countTotalSumm(operationsArray[i])
							addToCache(operationsArray[i])

						}
						editHandler(operationsArray)
					}
					return id
				}
			}
		}
	}

	function addToCache(operation) {
		operationsArray.push(operation)
	}

	function addToDB(operationsArray,loggedUser) {
		// const data = []
		let data = JSON.parse(localStorage.getItem('bellaPlus'))
		const userData = {
			user: loggedUser,
			data: operationsArray,
			maxId: id
		}
		if(!data){
			data = []
		} else {
			for(let i=0; i<data.length; i++){
				if(data[i].user === userData.user) {
					data.splice(i, 1)
				}
			}
		}
		data.push(userData)
		localStorage.setItem('bellaPlus', JSON.stringify(data));
		if(operationsArray){
			operationsArray.length = 0
		}
	}

	function countTotalSumm(operation) {
		
		if (operation.symbol === "+") {
			total += (Math.round(operation.weight * 10000)) / 10000
		} else {
			total -= (Math.round((operation.weight + operation.weight*operation.percent/100)*10000))/10000
		}
		totalElement.innerHTML = Math.round(total*10000)/10000
	}

	function addOperation(operation){
		let operationClass
		let percentTemplate
		if (operation.symbol === "+") {
			operationClass = 'main__string_color_plus'
			percentTemplate = ''
		} else {
			operationClass = 'main__string_color_minus'
			percentTemplate =
			`<div class="main__string-item">
				<span data-percent>${operation.percent}</span>
				<span>%</span>
			</div>`
		}

		const operationTemplate = 
			`<div class="main__string ${operationClass}" data-string>
				<div class="main__string-wrapper">
					<div class="main__string-item" data-value>${operation.weight}</div>
					${percentTemplate}
				</div>
				<button type="submit" class="main__string-button" data-change-operation="${operation.id}">править</button>
			</div>`
			
		const operationElement = document.createElement('div')
		operationElement.innerHTML = operationTemplate
		operationsListElement.append(operationElement)
	}

	function editHandler(operationsArray) {

		const editButtonElement = document.querySelectorAll('[data-change-operation]')
		for(let i = 0; i < editButtonElement.length; i++) {
			editButtonElement[i].addEventListener('click', function (event) {
				const idEdited = editButtonElement[i].getAttribute('data-change-operation')
				for(let i=0; i <operationsArray.length; i++) {
					if (operationsArray[i].id === parseInt(idEdited)) {
						showOperationValues(operationsArray[i])
						edit.status = true
						edit.id = parseInt(idEdited)
					}
				}
			})
			
		}
	}

	function showOperationValues(operation) {
		for(let i=0; i<inputSymbolElement.length; i++) {

			inputSymbolElement[i].checked = false
			if (inputSymbolElement[i].value === operation.symbol) {
				inputSymbolElement[i].checked = true
			}
		}
		for(let i=0; i<inputPercentElement.length; i++) {
			inputPercentElement[i].checked = false
			if (parseInt(inputPercentElement[i].value) === operation.percent) {
				inputPercentElement[i].checked = true
			}
		}
		inputWeightElement.value = operation.weight
		buttonElement.innerHTML = 'OK'
		buttonElement.classList.add('form__button_edit')
	}
})()