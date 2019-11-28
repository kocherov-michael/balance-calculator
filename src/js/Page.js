export default class Page {
	constructor (args = {}) {
		if (args.start) {
			this.renderPage(args.start)
		}
	}
	addEventListener () {}

	renderPage (x) {
		console.log(x)
	}

}