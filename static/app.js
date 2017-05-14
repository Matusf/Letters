'use strict'

class Letter {
	constructor(canvas, char, x, y, colour) {
		this.canvas = canvas
		this.char = char
		this.x = x
		this.y = y
		this.colour = colour
	}

	moveAndCheck() {
		this.y += 3
		if( this.y >= this.canvas.height ) return false
		return true
	}

	drawLetter(context) {
		context.font = "30px Arial"
		context.fillStyle = this.colour
		context.fillText(this.char, this.x, this.y)
	}
}

class LettersApp {
	constructor(canvas, leaderboard) {
		this.canvas = canvas
		this.leaderboard = leaderboard
		this.getScore()
	}

	animateStart() {
		if( this.onGoing ) return
		this.onGoing = true
		let obj = this
		let context = this.canvas.getContext("2d")

		let loop = (i) => {
			context.font = "100px Arial"
			context.fillStyle = '#FF5722'
			context.clearRect(0, 0, obj.canvas.width, obj.canvas.height)
			context.fillText(i, obj.canvas.width / 2 - 15, obj.canvas.height / 2 )
			if( i > 0 ) setTimeout( () => { loop(i-1) }, 1000)
			else obj.startGame()
		}
		loop(3)
	}

	startGame() {

		this.letters = []
		this.score = 0
		this.gameOver = false
		this.generateSpeed = 1200
		this.scoreTable = {}
		this.letterColours = ['#ff0000', '#ff0040', '#ff8800', '#ff0000', '#ff4000', '#4d0000',
							  '#3B5323', '#2F4F2F', '#008B00', '#2E8B57', '#5588dd', '#457371']
		this.getScore()
		this.generateLetter()
		this.moveLetters()
	}

	generateLetter() {
		if( this.gameOver ) return

		let alphabet = 'QWERTYUIOPASDFGHJKLZXCVBNM'
		let char = alphabet[ Math.floor( Math.random() * alphabet.length ) ]
		let colour = Math.floor( Math.random() * this.letterColours.length )
		this.letters.push( new Letter( this.canvas, char, Math.random() * this.canvas.width, -30, this.letterColours[colour] ) )

		let obj = this
		this.generateSpeed -= 10
		setTimeout( () => { obj.generateLetter() }, obj.generateSpeed)
	}

	moveLetters() {
		if( this.gameOver ) return

		let obj = this
		let context = this.canvas.getContext("2d")

		context.clearRect(0, 0, this.canvas.width, this.canvas.height)

		this.letters.forEach( (letter, index) => {
			if( !letter.moveAndCheck() ) obj.endGame()
			letter.drawLetter(context)
		})

		setTimeout( () => { obj.moveLetters() }, 70 )
	}

	getPressedKey(event) {
		if( this.gameOver ) return
		let charCode = event.keyCode || event.which
		let strCode = String.fromCharCode(charCode).toUpperCase()
		this.removeLetter(strCode)
	}

	removeLetter(strCode) {
		let obj = this
		let playerScored = false

		this.letters.forEach( (letter, index) => {
			if( letter.char == strCode ) {
				obj.letters.splice(index, 1)
				obj.score += 1
				playerScored = true
			}
		})
		if ( !playerScored ) this.endGame()
	}

	endGame() {
		this.gameOver = true
		this.onGoing = false
		$('.display-score').text( this.score )
		$('#write-score').fadeIn( 400 )
	}

	displayLeaderboard() {
		let obj = this

		this.scoreTable.sort( (a, b) => { return b.score-a.score })
		$('table tbody').children().remove()

		for(let i = 0; i < obj.scoreTable.length; i++){
			let tr = $('<tr>').appendTo(obj.leaderboard)
			tr.append( $('<td>').text(obj.scoreTable[i].name) )
			tr.append( $('<td>').text(obj.scoreTable[i].score) )
		}
	}

	getScore() {
		let obj = this

		$.getJSON('db.json', (json, textStatus) => {
			obj.scoreTable = json
			obj.displayLeaderboard()
		})
	}

	sendScore() {
		let newScore = {
			'name': $('#write-score input').val(),
			'score': this.score
		}

		this.scoreTable.push(newScore)
		let obj = this
		$('#write-score').fadeOut(400)

		$.post('/', newScore, (data, textStatus, xhr) => {
			obj.displayLeaderboard()
		});
	}

	resizeCanvas() {
		this.canvas.width  = Math.min( window.innerWidth, window.innerHeight ) - 30
		this.canvas.height = Math.min( window.innerWidth, window.innerHeight ) - 30
		this.canvas.style.width  = Math.min( window.innerWidth, window.innerHeight ) - 30 + 'px'
		this.canvas.style.height = Math.min( window.innerWidth, window.innerHeight ) - 30 + 'px'
	}
}

$(document).ready( () => {
	let canvas         = document.getElementById('canvas')
	let exitWriteScore = document.querySelector('.exit-write-score')
	let submitName     = document.querySelector('.submit')
	let startButton    = $('#start-button')
	let leaderboard    = $('table tbody')

	let app = new LettersApp(canvas, leaderboard)

	$(document).keypress( (event) => { app.getPressedKey(event) } )

	startButton.on('click',   () => { app.animateStart()	})
	exitWriteScore.onclick 	= () => { $('#write-score').fadeOut(400) }
	submitName.onclick 		= () => { app.sendScore() }
})

