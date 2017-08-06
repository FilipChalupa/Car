const five     = require('johnny-five')
const keypress = require('keypress')


const board = new five.Board()
board.on('ready', function() {
	const board = this
	const motors = {
		front: {
			left: {
				a: 7,
				b: 8,
				e: 10,
			},
			right: {
				a: 3,
				b: 2,
				e: 9,
			},
		},
		rear: {
			left: {
				a: 12,
				b: 13,
				e: 11,
			},
			right: {
				a: 4,
				b: 5,
				e: 6,
			},
		},
	}

	const initMotor = (motor) => {
		this.pinMode(motor.a, this.MODES.OUTPUT)
		this.pinMode(motor.b, this.MODES.OUTPUT)
		this.pinMode(motor.e, five.Pin.PWM)
	}
	const setMotorSpeed = (motor, speed) => {
		this.analogWrite(motor.e, speed * 255)
	}
	const setAllMotorsSpeed = (speed) => {
		setMotorSpeed(motors.front.left, speed)
		setMotorSpeed(motors.front.right, speed)
		setMotorSpeed(motors.rear.left, speed)
		setMotorSpeed(motors.rear.right, speed)
	}
	const setMotorVelocity = (motor, velocity) => {
		if (velocity !== 0) {
			this.digitalWrite(motor.a, velocity < 0 ? 0 : 1)
			this.digitalWrite(motor.b, velocity < 0 ? 1 : 0)
		}
		setMotorSpeed(motor, Math.abs(velocity))
	}
	const setFrontMotorsVelocity = (velocity) => {
		setMotorVelocity(motors.front.left, velocity)
		setMotorVelocity(motors.front.right, velocity)
	}
	const setRearMotorsVelocity = (velocity) => {
		setMotorVelocity(motors.rear.left, velocity)
		setMotorVelocity(motors.rear.right, velocity)
	}
	const setLeftMotorsVelocity = (velocity) => {
		setMotorVelocity(motors.front.left, velocity)
		setMotorVelocity(motors.rear.left, velocity)
	}
	const setRightMotorsVelocity = (velocity) => {
		setMotorVelocity(motors.front.right, velocity)
		setMotorVelocity(motors.rear.right, velocity)
	}
	const setAllMotorsVelocity = (velocity) => {
		setFrontMotorsVelocity(velocity)
		setRearMotorsVelocity(velocity)
	}

	console.log('board ready')
	initMotor(motors.front.left)
	initMotor(motors.front.right)
	initMotor(motors.rear.left)
	initMotor(motors.rear.right)


	let testMode = false
	const testMotor = {
		frontRear: 'front',
		leftRight: 'left',
		direction: 0,
	}

	let speed = 1
	const SPEED_STEP = 0.2

	keypress(process.stdin)
	process.stdin.on('keypress', (ch, key) => {
		if (key && key.name) {
			switch (key.name) {
				case 'up':
					testMotor.frontRear = 'front'
					if (!testMode) {
						setAllMotorsVelocity(speed)
					}
					break
				case 'down':
					testMotor.frontRear = 'rear'
					if (!testMode) {
						setAllMotorsVelocity(-speed)
					}
					break
				case 'left':
					testMotor.leftRight = 'left'
					if (!testMode) {
						setLeftMotorsVelocity(speed)
						setRightMotorsVelocity(-speed)
					}
					break
				case 'right':
					testMotor.leftRight = 'right'
					if (!testMode) {
						setLeftMotorsVelocity(-speed)
						setRightMotorsVelocity(speed)
					}
					break
				case 'space':
					if (testMotor.direction === 0) {
						testMotor.direction = 1
					} else if (testMotor.direction < 0) {
						testMotor.direction = 0
					} else {
						testMotor.direction = -1
					}
					if (!testMode) {
						setAllMotorsVelocity(0)
					}
					break
				case 't':
					testMode = !testMode
					console.log(`Test mode is ${testMode ? 'ON' : 'OFF'}`)
					break
				case 'm':
					speed += SPEED_STEP
					if (speed > 1) {
						speed = 1
					}
					if (!testMode) {
						setAllMotorsSpeed(speed)
					}
					break
				case 'n':
					speed -= SPEED_STEP
					if (speed < SPEED_STEP) {
						speed = SPEED_STEP
					}
					if (!testMode) {
						setAllMotorsSpeed(speed)
					}
					break
			}
			if (testMode) {
				console.log(`Testing ${testMotor.frontRear} ${testMotor.leftRight} motor at velocity ${testMotor.direction * speed}`)
				setMotorVelocity(motors[testMotor.frontRear][testMotor.leftRight], testMotor.direction * speed)
			}
		}
		if (key && key.ctrl && key.name == 'c') {
			process.stdin.pause()
			setAllMotorsVelocity(0)
			process.exit()
		}
	})
	process.stdin.setRawMode(true)
	process.stdin.resume()

})
