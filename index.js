;(function () {
	const buttonElement = document.querySelector("[data-form-submit]")
	const inputWeightElement = document.querySelector("[data-input-weight]")
	const operationsListElement = document.querySelector("[data-operations-list]")
	const menuButtonElement = document.querySelector("[data-menu-button]")
	const addUserButtonElement = document.querySelector("[data-button-add-user]")
	const inputNewUserElement = document.querySelector("[data-input-new-user]")
	const loggedUserNameElement = document.querySelector("[data-logged-user-name]")
	const menuElement = document.querySelector("[data-menu]")
	const footerElement = document.querySelector("[data-footer]")
	const footerInfoElement = document.querySelector("[data-footer-info]")
	const inputSymbolElement = document.querySelectorAll("[data-input-symbol]")
	const inputPercentElement = document.querySelectorAll("[data-input-percent]")
	const totalElement = document.querySelector("[data-total]")
	const weekTotalElement = document.querySelector("[data-week-total]")
	const commonProfitElement = document.querySelector("[data-common-profit]")
	const commonProfitResultElement = document.querySelector("[data-common-profit-result]")
	const total = {}
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
						window.scrollTo(0, 999999)

						const info = `Введено: ${inputValues.symbol}${inputValues.weight}`
						footerInfoElement.innerHTML = info
						footerInfoElement.classList.remove('hide')
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

	
	menuButtonElement.addEventListener('click', (event) => {
		event.preventDefault()
		event.stopPropagation()
		menuElement.classList.toggle('hide')
		showUserList()
		addUser()

		if(menuElement.classList.contains('hide')) {
			showLoggedUserName(loggedUser)
			operationsListElement.classList.remove('hide')
			footerElement.classList.remove('hide')
			commonProfitElement.classList.add('hide')
		} else {
			commonProfitElement.classList.remove('hide')
			countCommonProfit ()
		}
	})

	footerElement.addEventListener('click', () => {
		inputWeightElement.focus()
	})

	function countCommonProfit () {
		const data = JSON.parse(localStorage.getItem('bellaPlus'))
		let profitSumm = 0
		for ( elem of data ) {
			if ( elem.data ) {
				for ( operation of elem.data ) {
					if ( operation.symbol === '-' && operation.percent !== 0 ) {
						let obj = countTotalSumm(operation, false, profitSumm)
						profitSumm = obj.weekTotal
					}
				}
			}
			commonProfitResultElement.innerHTML = Math.round(profitSumm*10000)/10000
		}
	}

	function showUserList(){
		const userList = getUserList()
		menuElement.innerHTML = ''
		operationsListElement.classList.add('hide')
		footerElement.classList.add('hide')

		if (!menuElement.classList.contains('hide')) {
			for(let i=0; i<userList.length; i++) {
				const menuListElement = document.createElement('div')
				menuListElement.classList.add('menu__item')
				menuListElement.setAttribute('data-user', userList[i])
				menuElement.append(menuListElement)

				const menuListTextElement = document.createElement('div')
				menuListTextElement.classList.add('menu__item-text')
				menuListTextElement.innerHTML = userList[i]
				menuListElement.append(menuListTextElement)

				const menuListButtonWrapperElement = document.createElement('div')
				menuListButtonWrapperElement.classList.add('menu__item-button-wrapper')
				menuListElement.append(menuListButtonWrapperElement)

				const menuListButtonElement = document.createElement('button')
				menuListButtonElement.classList.add('menu__item-button')
				menuListButtonElement.innerHTML = 'править'
				menuListButtonWrapperElement.append(menuListButtonElement)

				inputNewUserElement.classList.remove('hide')
				addUserButtonElement.classList.remove('hide')
				loggedUserNameElement.classList.add('hide')

				menuListElement.addEventListener('click', showUserOperations)

				menuListButtonElement.addEventListener('click', function showInputEditUserName(event) {
					event.preventDefault()
					event.stopPropagation()
					menuListTextElement.innerHTML = ''
					const menuListInputElement = document.createElement('input')
					menuListInputElement.classList.add('menu__item-input')
					menuListInputElement.value = userList[i]
					menuListTextElement.append(menuListInputElement)

					menuListButtonElement.classList.add('hide')

					const menuListDeleteButtonElement = document.createElement('button')
					menuListDeleteButtonElement.classList.add('menu__item-delete-button')
					menuListDeleteButtonElement.innerHTML = 'удалить'
					menuListDeleteButtonElement.setAttribute('data-delete-button', userList[i])
					menuListButtonWrapperElement.append(menuListDeleteButtonElement)

					menuListDeleteButtonElement.addEventListener('click', function (event) {
						event.preventDefault()
						event.stopPropagation()
						const deleteUser = this.getAttribute('data-delete-button')
						console.log(deleteUser)
						deleteUserFunc(deleteUser)
					})

					const menuListSaveButtonElement = document.createElement('button')
					menuListSaveButtonElement.classList.add('menu__item-save-button')
					menuListSaveButtonElement.innerHTML = 'сохранить'
					menuListSaveButtonElement.setAttribute('data-save-button', userList[i])
					menuListButtonWrapperElement.append(menuListSaveButtonElement)

					menuListSaveButtonElement.addEventListener('click', function (event) {
						event.preventDefault()
						event.stopPropagation()
						const currentUser = this.getAttribute('data-save-button')
						// console.log(saveUser)
						const newUserName = menuListInputElement.value
						console.log(newUserName)
						saveUserFunc(currentUser, newUserName)
					})

					menuListElement.removeEventListener('click', showUserOperations)
				})
			}
		}
	}

	function saveUserFunc(currentUser, newUserName) {
		const loggedUser = localStorage.getItem('bellaPlusLoggedUser')
		if (loggedUser === currentUser) {
			localStorage.setItem('bellaPlusLoggedUser', newUserName )
		}
		const data = JSON.parse(localStorage.getItem('bellaPlus'))
		// console.log(data)
		for(let i=0; i<data.length; i++) {
			if (data[i].user === currentUser) {
				data[i].user = newUserName
				localStorage.setItem('bellaPlus', JSON.stringify(data));
			}
		}
		const userList = getUserList()
		showUserList()
	}

	function deleteUserFunc(deleteUser) {
		const loggedUser = localStorage.getItem('bellaPlusLoggedUser')
		if (loggedUser === deleteUser) {
			localStorage.removeItem('bellaPlusLoggedUser')
			operationsListElement.innerHTML = ''
		}
		const data = JSON.parse(localStorage.getItem('bellaPlus'))
		for(let i=0; i<data.length; i++) {
			if (data[i].user === deleteUser) {
				data.splice(i, 1)
				localStorage.setItem('bellaPlus', JSON.stringify(data));
			}
		}
		const userList = getUserList()
		showUserList()
	}

	function showUserOperations(event) {
		loggedUser = this.getAttribute('data-user')
		const currentLoggedUser = localStorage.getItem('bellaPlusLoggedUser')
		if (loggedUser !== currentLoggedUser) {
			footerInfoElement.innerHTML = ''
			footerInfoElement.classList.add('hide')
		}
		localStorage.setItem('bellaPlusLoggedUser', loggedUser);
		menuElement.classList.add('hide')
		operationsListElement.classList.remove('hide')
		footerElement.classList.remove('hide')
		commonProfitElement.classList.add('hide')
		operationsArray.length = 0
		showLoggedUserName(loggedUser)
		renderFromDB ()
	}

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
		total.total = 0
		total.weekTotal = 0
		const data = JSON.parse(localStorage.getItem('bellaPlus'))
		if (data && loggedUser) {
			for(let i=0; i<data.length; i++) {
				if(data[i].user === loggedUser) {
					const id = data[i].maxId
					const operationsArray = data[i].data
					if(operationsArray){
						for(let i=0; i<operationsArray.length; i++) {
							addOperation(operationsArray[i])
							const totalCommon = countTotalSumm(operationsArray[i], total.total, total.weekTotal)
							total.total = totalCommon.total
							if ( operationsArray[i].percent !== 0 ) {
								total.weekTotal = totalCommon.weekTotal
							}
							addToCache(operationsArray[i])
							totalElement.innerHTML = Math.round(total.total*10000)/10000
							weekTotalElement.innerHTML = Math.round(total.weekTotal*10000)/10000
						}
						if (operationsArray.length === 0) {
							totalElement.innerHTML = '0'
							weekTotalElement.innerHTML = '0'
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
		localStorage.setItem('bellaPlus', JSON.stringify(data))
		if(operationsArray){
			operationsArray.length = 0
		}
	}

	function countTotalSumm(operation, total, weekTotal) {
		const commonTotal = {total: total, weekTotal: weekTotal}
		if (operation.symbol === "+") {
			if(total !== false) {
				commonTotal.total += (Math.round(operation.weight * 10000)) / 10000
			}
		} else {
			let minus = (Math.round((operation.weight + operation.weight*operation.percent/100)*10000))/10000
			commonTotal.weekTotal -= minus
			if(total !== false) {
				commonTotal.total -= minus
			}
		}
		return commonTotal
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

		operationElement.addEventListener('click', function (event){
			const currentOperation = this
			const operationElement = currentOperation.querySelector('[data-change-operation]')
			const operationId = parseInt(operationElement.getAttribute('data-change-operation'))
			const data = JSON.parse(localStorage.getItem('bellaPlus'))
			for(let i=0; i<data.length; i++) {
				if(data[i].user === loggedUser) {
					const operationsArray = data[i].data
					let interimTotal = 0
					for(let i=0; i<operationsArray.length; i++){
						interimTotal = countTotalSumm(operationsArray[i], interimTotal).total
						if(operationsArray[i].id === operationId) {
							break
						}
					}
					interimTotal.total = Math.round(interimTotal.total*10000)/10000
					footerInfoElement.innerHTML = `Промежуточный баланс: ${interimTotal}`
					footerInfoElement.classList.remove('hide')
				}
			}

		})

		operationElement.addEventListener("touchmove", handleMove )
		
		const touchArray = []
		let firstTapPosition = null

		function handleMove (event) {
			let touchPoint = event.changedTouches[0].pageX
			if (!firstTapPosition) {
				firstTapPosition = touchPoint
			}
			touchArray.push(touchPoint)

			let difference = touchPoint - firstTapPosition
			const innerDiv = this.querySelector('[data-string]')
			const buttonEditElement = this.querySelector('[data-change-operation]')
			const operationId = parseInt(buttonEditElement.getAttribute('data-change-operation'))
			console.log(operationId)

			if ( difference > 20) {
				this.style.overflow = 'hidden'
				innerDiv.style.marginLeft = (String(difference) + 'px')
				innerDiv.style.marginRight = ('-' + String(difference) + 'px')
				let diff = String(difference)

				// Удаляем элемент операции
				if ( difference > 200 ) {
					innerDiv.style.opacity = '0'
					let elemHeight = parseFloat(getComputedStyle(this, null).height.replace("px", ""))
					this.style.height = `${elemHeight}px`

					const hideOperation = setInterval( () => {
						let height = parseInt(this.style.height.replace("px", ""))
						height -= 1
				        this.style.height = `${height}px`

				        if (height <=0) {
				        	clearInterval(hideOperation)
				        	for(let i=0; i <operationsArray.length; i++) {
								if (operationsArray[i].id === operationId) {
									operationsArray.splice(i, 1)

									addToDB(operationsArray, loggedUser)
									renderFromDB ()
								}
							}
				        }
					}, 10)
				}
			}

			operationElement.addEventListener("touchend", () => {
				touchArray.length = 0
				firstTapPosition = null
				innerDiv.style.marginLeft = ''
				innerDiv.style.marginRight = ''
			})
		}
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