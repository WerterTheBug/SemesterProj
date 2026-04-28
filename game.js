let scoreLeft = 0;
let scoreRight = 0;
let charge = 0.0;
let ballVelocity = 0;
AFRAME.registerComponent('ballslow', {
  init: function () {
    
  },
  tick: function () {
    if (!this.el.body.velocity) return;
    ballVelocity = Math.sqrt(this.el.body.velocity.x ** 2 + this.el.body.velocity.y ** 2 + this.el.body.velocity.z ** 2);
    charge += ballVelocity/10000;
    this.el.body.angularVelocity.x *= 0.99;
    this.el.body.angularVelocity.y *= 0.99;
    this.el.body.angularVelocity.z *= 0.99;
  }
});



AFRAME.registerComponent('goal', {
   
  init: function () {
    this.time = 360;
  this.lastTick = Date.now();

    this.el.addEventListener('collide', (e) => {
      if (e.detail.body.el && e.detail.body.el.id === 'ball') {
        console.log('You hit the ball!');
         e.detail.body.velocity.set(0, 0, 0);
      e.detail.body.angularVelocity.set(0, 0, 0);
      e.detail.body.sleep();

    // small delay avoids collision explosion
    setTimeout(() => {
      e.detail.body.position.set(0, 50, 0);
      e.detail.body.wakeUp();
    }, 10);

        if (this.el.id === 'goal-left') {
          scoreRight++;
          charge += 10;
        } else if (this.el.id === 'goal-right') {
          scoreLeft++;
          charge += 10;
        }
        

        let display = `${scoreRight}           ${this.time}           ${scoreLeft}`;
        console.log(`Score: Left - ${scoreLeft}, Right - ${scoreRight}`);
          document.querySelector('#scoreboard').setAttribute(
        'text',
        'value',
        display
      );
      }
    });
  },
  tick: function () {
  const now = Date.now();
  const delta = (now - this.lastTick) / 1000;
  this.lastTick = now;
  

  this.time -= delta;

  if (this.time < 0) this.time = 0;
      const display = `${scoreRight}           ${Math.floor(this.time)}           ${scoreLeft}`;

    document.querySelector('#scoreboard').setAttribute('text', {
      value: display
    });
}
});



AFRAME.registerComponent('movement2', {
  schema: {
    canFly: { type: 'boolean', default: false },
  },
  init: function () {
    this.yvelocity = 0;
    this.xvelocity = 0;
    this.zvelocity = 0;
    this.jumpVelocity = 0;
    this.maxSpeed = 2;

    
    this.player = document.querySelector('#ball');
    this.goalLeft = document.querySelector('#goal-right');
  },

  tick: function () {
    let ballAttract = 0.00075;
    let goalRepel = 0.000005;
    let speedMult = 0.5;
    let retainMult = .995;
    let jumpStrength = .5;
    let gravity = 0.015;
    
    const obj = this.el.object3D.position;
    const obj2 = this.player.object3D.position;
    const obj3 = this.goalLeft.object3D.position;
    this.yvelocity *= retainMult;
    this.xvelocity *= retainMult;
    this.zvelocity *= retainMult;
    this.yvelocity += (obj2.y - obj.y) * ballAttract;
    this.xvelocity += (obj2.x - obj.x) * ballAttract;
    this.zvelocity += (obj2.z - obj.z) * ballAttract;
    this.yvelocity += (obj3.y - obj.y) * -goalRepel;
    this.xvelocity += (obj3.x - obj.x) * -goalRepel;
    this.zvelocity += (obj3.z - obj.z) * -goalRepel;
    if (obj2.y > 15 && obj.y<=1) this.jumpVelocity = jumpStrength;
    if (this.yvelocity > 100) this.yvelocity = 0.1;
    if (this.yvelocity < -100) this.yvelocity = -0.1;
    if (this.xvelocity > 100) this.xvelocity = 0.1;
    if (this.xvelocity < -100) this.xvelocity = -0.1;
    if (this.zvelocity > 100) this.zvelocity = 0.1;
    if (this.zvelocity < -100) this.zvelocity = -0.1;
    if (this.xvelocity * speedMult > this.maxSpeed) this.xvelocity = this.maxSpeed / speedMult;
    if (this.xvelocity * speedMult < -this.maxSpeed) this.xvelocity = -this.maxSpeed / speedMult;
    if (this.zvelocity * speedMult > this.maxSpeed) this.zvelocity = this.maxSpeed / speedMult;
    if (this.zvelocity * speedMult < -this.maxSpeed) this.zvelocity = -this.maxSpeed / speedMult;




    obj.x += this.xvelocity * speedMult;
    obj.z += this.zvelocity * speedMult;
    if (this.jumpVelocity > 0 || obj.y > .5) {
      obj.y += this.jumpVelocity;
    }
    this.jumpVelocity -= gravity;
    if(this.data.canFly) obj.y += this.yvelocity * speedMult;

    if (obj.y < .5) {
      obj.y = .5;
    }
    const dx = obj2.x - obj.x;
    const dz = obj2.z - obj.z;

    const angle = Math.atan2(dx, dz);

    this.el.object3D.rotation.y = angle + Math.PI;
  }
});
AFRAME.registerComponent('headlight', {
  init: function () {
    this.light = document.querySelector('#headLight');
    document.addEventListener('keydown', (e) => {
      if (e.code === 'KeyL') {
        this.light.setAttribute('visible', !this.light.getAttribute('visible'));
      }
    });
  }

});
AFRAME.registerComponent('pause', {
  init: function () {

    let paused = false;
    document.addEventListener('keydown', (e) => {
      if (e.code === 'KeyP') {
        const scene = document.querySelector('a-scene');
        const pauseScreen = document.querySelector('#pauseScreen');
        pauseScreen.setAttribute('visible', !paused);
        if (paused) {
          scene.play();
        } else {
          scene.pause();
        }
        paused = !paused;
      }
    });
  }
});

AFRAME.registerComponent('ultimate', {
  init: function () {
    this.isFlashing = false;
    this.el.addEventListener('collide', (e) => {
      if (e.detail.body.el && e.detail.body.el.id === 'ball') {
        charge++;

      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.code === 'KeyQ') {
        if (charge < 10) return;   
        const ball = document.querySelector('#ball');
        const obj = this.el.object3D.position;
        const obj2 = ball.object3D.position;
        const dx = obj2.x - obj.x;
        const dz = obj2.z - obj.z;
        const dy = obj2.y - obj.y;
        const maxD=Math.abs(dx)+ Math.abs(dy)+ Math.abs(dz);
        const scaleDx = dx / maxD;
        const scaleDy = dy / maxD;
        const scaleDz = dz / maxD;
        ball.body.velocity.set(
          -scaleDx * 10 * charge,
          -scaleDy * 10 * charge,
          -scaleDz * 10 * charge
        );
        const displayLight = document.querySelector('#displayLight');
        displayLight.setAttribute('color', 'blue');
        displayLight.setAttribute('intensity', charge);
        this.isFlashing = true;
        setTimeout(() => {
          this.isFlashing = false;
        }, 300);
        charge = 0;
  }
  if (e.code === 'KeyE') {

      if (charge < 10) return;      
        const ball = document.querySelector('#ball');
        const obj = this.el.object3D.position;
        const obj2 = ball.object3D.position;
        const dx = obj2.x - obj.x;
        const dz = obj2.z - obj.z;
        const dy = obj2.y - obj.y;
        const maxD=Math.abs(dx)+ Math.abs(dy)+ Math.abs(dz);
        const scaleDx = dx / maxD;
        const scaleDy = dy / maxD;
        const scaleDz = dz / maxD;
        ball.body.velocity.set(
          scaleDx * 10 * charge,
          scaleDy * 10 * charge,
          scaleDz * 10 * charge
        );
        const displayLight = document.querySelector('#displayLight');
        displayLight.setAttribute('color', 'white');
        displayLight.setAttribute('intensity', -charge);
        this.isFlashing = true;
        setTimeout(() => {
        this.isFlashing = false;
        }, 300);
        charge = 0;
  }
});
  },
  tick: function () {
    if (!this.isFlashing) {
    const displayLight = document.querySelector('#displayLight');
    displayLight.setAttribute('color', 'blue');
    displayLight.setAttribute('intensity', charge / 10);
    document.querySelector('#chargeScreen').setAttribute('text', 'value', 'Charge: ' + Math.floor(charge) + "/10");
    }
  }
});
AFRAME.registerComponent('car-controls', {
  init: function () {
    this.camera = document.querySelector('#camera');
    this.turnVelocity = 0;
    this.trueSpeedx = 0;
    this.trueSpeedy = 0;
    this.trueSpeedz = 0;
    this.gravity = 0.015;
    this.dashGravity = 0;
    this.dashGravityChange= 0.025;
    this.turnLeft = false;
    this.turnRight = false;
    this.moveForward = false;
    this.moveBackward = false;
    this.jumping = false;
    this.canDash = false;
    this.canSlam2= false;
    this.isDashing = false;
    this.dashed = false;
    this.break = false;
    this.canSlam = false;
    this.dashDivide = 5;
    this.slamHeight = 0;
    this.retainMult = 0.95;
    this.jumpStrength = .5;
    this.jumpVelocity= 0;
    this.speedMult = 0;
    this.forward= false;
    this.backward = false;
    document.addEventListener('keydown', (e) => {
      if (e.code === 'KeyW') {
        this.moveForward = true;
      } if (e.code === 'KeyS') {
        this.moveBackward = true;
      } if (e.code === 'KeyA') {
        this.turnLeft = true;
      } if (e.code === 'KeyD') {
        this.turnRight = true;
      } if (e.code === 'Space') {
        this.jumping = true;
        if (this.canSlam) {
          this.slamHeight = this.el.object3D.position.y;
          this.canSlam2 = true;
        }
      } if (e.code === 'ShiftLeft') {
       this.break = true;
      }
    });
    document.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW') {
        this.moveForward = false;
      } if (e.code === 'KeyS') {
        this.moveBackward = false;
      } if (e.code === 'KeyA') {
        this.turnLeft = false;
      } if (e.code === 'KeyD') {
        this.turnRight = false;
      } if (e.code === 'Space') {
        this.jumping = false;
        this.canDash = true;
      } if (e.code === 'ShiftLeft') {
        this.break = false;
      }

    });
  },
  tick: function () {
    if (this.dashed && !this.jumping) {
      this.canSlam = true;
    }
    let obj = this.el.object3D.rotation;
    let obj2 = this.el.object3D.position;
    let amount = 0.005;

    let speed = 0.03;
    if (this.moveForward){
      this.forward = true;
    } 
    if (this.forward  && this.speedMult < 1){ 
    this.speedMult += 0.1;
    
    }
    if (this.forward && !this.moveForward) {
      this.forward = false;
      this.speedMult = 0;
    }
    if(this.moveForward && this.moveBackward) {
      this.forward = false;
      this.backward = false;
      this.speedMult = 0;
    }
    if (this.moveBackward ){
      this.backward = true;
    }
    if (this.backward && this.speedMult < 1) {
      this.speedMult += 0.02;
    }
    if (this.backward && !this.moveBackward) {
      this.backward = false;
      this.speedMult = 0;
    }
    if (this.canDash && this.jumping && !this.dashed) {
      this.isDashing = true;
      setTimeout(() => {
        this.isDashing = false;
        this.dashed = true;
      }, 150);
    }
   
    if (this.break) {
      this.retainMult = 0.9;
    } else {
      this.retainMult = 0.95;
    }
    if (this.jumping && obj2.y <= .5) {
      this.jumpVelocity = this.jumpStrength;
    }else if (this.isDashing) {
    this.trueSpeedx -= Math.sin(obj.y) * speed * 5;
    this.trueSpeedz -= Math.cos(obj.y) * speed * 5;
    }
    if (obj2.y <= .5 ) {
      this.canDash = false;
      this.isDashing = false;
      this.canSlam = false;
      this.dashDivide = 5;
      
      if (this.canSlam2) {
        this.canSlam2 = false;
        this.dashDivide = 2;
        this.jumpVelocity = this.jumpStrength*Math.sqrt(this.slamHeight)/3;
      }else {
        this.slamHeight = 0;
      }
      this.canSlam2 = false;
      if (this.dashed) {
        this.trueSpeedx /= this.dashDivide;
        this.trueSpeedz /= this.dashDivide;
      }
      this.dashed = false;
    }
    
    if (this.turnRight) {
      this.turnVelocity -= amount;
    } else if (this.turnLeft) {
      this.turnVelocity += amount;
    }
    if (this.moveForward) {
    this.trueSpeedx -= Math.sin(obj.y) * speed * this.speedMult;
    this.trueSpeedz -= Math.cos(obj.y) * speed * this.speedMult;
    } else if (this.moveBackward) {
    this.trueSpeedx += Math.sin(obj.y) * speed * this.speedMult;
    this.trueSpeedz += Math.cos(obj.y) * speed * this.speedMult;
    }
    if (Math.abs(this.trueSpeedx) > 0.005) this.trueSpeedx *= this.retainMult;
    else this.trueSpeedx = 0;
    if (Math.abs(this.trueSpeedz) > 0.005) this.trueSpeedz *= this.retainMult;
    else this.trueSpeedz = 0;
    if (Math.abs(this.turnVelocity) > 0.0005) this.turnVelocity *= .9;
    else this.turnVelocity = 0;
    
    obj2.x += this.trueSpeedx;
    obj2.z += this.trueSpeedz;
    if (this.jumpVelocity > 0 || obj2.y > .5){
    obj2.y += this.jumpVelocity;
    

    }
    obj.y += this.turnVelocity ;
    if (this.isDashing) {
      this.dashGravity = -this.dashGravityChange;
    } else if(this.canSlam2) {
      this.dashGravity = 1;
    }else {
      this.dashGravity = 0;
    }
    this.jumpVelocity -= this.gravity + this.dashGravity;
    if (obj2.y < .5) {
      obj2.y = .5;
    }


    this.camera.object3D.rotation.y -= this.turnVelocity * 4;
  }
});
