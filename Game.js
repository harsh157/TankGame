var clamp = function (x, min, max) {
    return x < min ? min : (x > max ? max : x);
};
var Q = Quintus().include("Sprites,Anim,Input,Scenes,UI,Touch").setup({ maximize: true }).controls().touch();

Q.input.keyboardControls({
  87: 'player2up',
  65: 'player2left',
  83: 'player2down',
  68: 'player2right',
  81: 'player2fire'
});

Q.Sprite.extend("PlayerOne", {
    init: function (p) {
        this._super(p, {
            sprite: "blast",
            sheet: "tankblue",
            x: 60,
            y: Q.el.height / 2,
            angle: 90,
            type: Q.SPRITE_FRIENDLY,
            speed: 10
        });
        this.p.toBeDestroyed = false;
        this.add("GunOne");
        this.add("animation");
        this.on("hit", function (col) {
            if (col.obj.isA('Shot')) {
                col.obj.destroy();
                this.p.toBeDestroyed = true;
                this.del("GunOne");
                this.play("explode");
                Q.stageScene("endGame", 1, { label: "Green Won" });
            }
        });
        this.on("kill", function () {
            this.destroy();
        });
    },
    step: function (dt) {
        if (!this.p.toBeDestroyed) {
            this.stage.collide(this);
            if (Q.inputs['up']) {
                this.p.y -= this.p.speed * Math.cos(this.p.angle * (Math.PI / 180));
                this.p.x += this.p.speed * Math.sin(this.p.angle * (Math.PI / 180));
                this.p.frame = (this.p.frame + 1) % 8;
            }
            if (Q.inputs['left']) {
                this.p.angle -= this.p.speed;
            }
            if (Q.inputs['right']) {
                this.p.angle += this.p.speed;
            }
            if (Q.inputs['down']) {
                this.p.y += this.p.speed * Math.cos(this.p.angle * (Math.PI / 180));
                this.p.x -= this.p.speed * Math.sin(this.p.angle * (Math.PI / 180));
                if (this.p.frame != 0) {
                    this.p.frame = (this.p.frame - 1) % 8;
                }
                else {
                    this.p.frame = 7;
                }
            }
            this.p.x = clamp(this.p.x, 0 + (this.p.w / 2), Q.el.width - (this.p.w / 2));
            this.p.y = clamp(this.p.y, 0 + (this.p.h / 2), Q.el.height - (this.p.h / 2));

            //console.log(this.p.x + " " + this.p.y + " " + this.p.angle);
        }
    }

});

Q.Sprite.extend("PlayerTwo", {
    init: function (p) {
        this._super(p, {
            sprite: "blast",
            sheet: "tankgreen",
            x: Q.el.width - 60,
            y: Q.el.height / 2,
            angle: -90,
            type: Q.SPRITE_FRIENDLY,
            speed: 10
        });
        this.p.toBeDestroyed = false;
        this.add("GunTwo");
        this.add("animation");
        this.on('hit', function (col) {
            if (col.obj.isA('Shot')) {
                col.obj.destroy();
                this.p.toBeDestroyed = true;
                this.del("GunTwo");
                this.play("explode");
                Q.stageScene("endGame", 1, { label: "Blue Won" });
            }
        });
        this.on("kill", function () {
            this.destroy();
        });
    },
    step: function (dt) {
        if (!this.p.toBeDestroyed) {
            this.stage.collide(this);
            if (Q.inputs['player2up']) {
                this.p.y -= this.p.speed * Math.cos(this.p.angle * (Math.PI / 180));
                this.p.x += this.p.speed * Math.sin(this.p.angle * (Math.PI / 180));
                this.p.frame = (this.p.frame + 1) % 8;
            }
            if (Q.inputs['player2left']) {
                this.p.angle -= this.p.speed;
            }
            if (Q.inputs['player2right']) {
                this.p.angle += this.p.speed;
            }
            if (Q.inputs['player2down']) {
                this.p.y += this.p.speed * Math.cos(this.p.angle * (Math.PI / 180));
                this.p.x -= this.p.speed * Math.sin(this.p.angle * (Math.PI / 180));
                if (this.p.frame != 0) {
                    this.p.frame = (this.p.frame - 1) % 8;
                }
                else {
                    this.p.frame = 7;
                }
            }
            this.p.x = clamp(this.p.x, 0 + (this.p.w / 2), Q.el.width - (this.p.w / 2));
            this.p.y = clamp(this.p.y, 0 + (this.p.h / 2), Q.el.height - (this.p.h / 2));

            //console.log(this.p.x + " " + this.p.y + " " + this.p.angle);
        }
    }
});

Q.Sprite.extend("Shot", {
    init: function(p){
        this._super(p, {
            sprite: "shot",
            sheet: "shot",
            speed: 500
        });
    },
    step: function(dt) {
        this.p.y -= this.p.speed * dt * Math.cos(this.p.angle* (Math.PI / 180));
        this.p.x += this.p.speed * dt * Math.sin(this.p.angle* (Math.PI / 180));

        if(this.p.x < 0 || this.p.y < 0 || this.p.x > Q.el.width || this.p.y > Q.el.height){
            this.destroy();
        }
    }
});
Q.component("GunOne", {
    added: function(){
        this.entity.p.shots = [];
        this.entity.p.canFire = true;
        this.entity.on("step", "handleFiring");
    },
    extend: {
        handleFiring: function(){
            var entity = this;
            for (var i = entity.p.shots.length - 1; i >= 0; i--) {
                if(entity.p.shots[i].isDestroyed){
                    entity.p.shots.splice(i, 1);
                } 
            };
            if(Q.inputs['fire']){
                this.fire();
            }
        },
        fire: function(){
            var entity = this;
            if(!entity.p.canFire){
                return;
            }
            var shot = Q.stage().insert(new Q.Shot({
                angle: entity.p.angle, 
                x : entity.p.x + (entity.p.h/2 +31)*Math.sin(this.p.angle * (Math.PI / 180)), 
                y : entity.p.y - (entity.p.h/2 +31)*Math.cos(this.p.angle * (Math.PI / 180)), 
                speed:200, 
                type:Q.SPRITE_DEFAULT | Q.SPRITE_FRIENDLY
            }));
            entity.p.shots.push(shot);
            entity.p.canFire = false;
            setTimeout(function(){
                entity.p.canFire = true;
            }, 100);
        }
    }
});

Q.component("GunTwo", {
    /* when added to object */
    added: function(){
        this.entity.p.shots = [];
        this.entity.p.canFire = true;
        this.entity.on("step", "handleFiring");
    },
    
    extend: {
        handleFiring: function(){
            var entity = this;
            for (var i = entity.p.shots.length - 1; i >= 0; i--) {
                if(entity.p.shots[i].isDestroyed){
                    entity.p.shots.splice(i, 1);
                } 
            };
            if(Q.inputs['player2fire']){
                this.fire();
            }
        },
        fire: function(){
            var entity = this;
            if(!entity.p.canFire){
                return;
            }
            var shot = Q.stage().insert(new Q.Shot({
                angle: entity.p.angle, 
                x : entity.p.x + (entity.p.h/2 +31)*Math.sin(this.p.angle * (Math.PI / 180)), 
                y : entity.p.y - (entity.p.h/2 +31)*Math.cos(this.p.angle * (Math.PI / 180)), 
                speed:200, 
                type:Q.SPRITE_DEFAULT | Q.SPRITE_FRIENDLY
            }));
            entity.p.shots.push(shot);
            entity.p.canFire = false;
            setTimeout(function(){
                entity.p.canFire = true;
            }, 100);
        }
    }
});

Q.animations('blast', {
    explode: {frames: [9,10,11,12], rate:1/2, loop: false, trigger: 'kill'}
});
Q.scene("mainLevel", function(stage){
    Q.gravity = 0;
    stage.insert(new Q.Sprite({ asset: "yellowbackground.jpg", x: Q.el.width / 2, y: Q.el.height / 2, type: Q.SPRITE_NONE }));
    stage.insert(new Q.PlayerOne());
    stage.insert(new Q.PlayerTwo());
});

Q.scene('endGame',function(stage) {
  var box = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));
  
  var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                           label: "Play Again" }))         
  var label = box.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
                                        label: stage.options.label }));
  button.on("click",function() {
    Q.clearStages();
    Q.stageScene('mainLevel');
  });
  
});

Q.load(["yellowbackground.jpg", "tankblue.png", "tankblue.json", "shot.png", "shot.json", "tankgreen.png", "tankgreen.json"], function () {
    Q.compileSheets("tankblue.png", "tankblue.json");
    Q.compileSheets("tankgreen.png", "tankgreen.json");
    Q.compileSheets("shot.png", "shot.json");
    Q.stageScene("mainLevel");
});